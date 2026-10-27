---
title: "Revisão: fundamentos de containers e orquestração de containers"
slug: "revisao-fundamentos-de-containers-e-orquestracao"
date: '2026-10-26T16:00:00-03:00'
draft: false
aliases:
- /2026/10/26/revisao-fundamentos-de-kubernetes/
description: "Uma revisão de containers e orquestração do kernel ao cluster: namespaces, cgroups, imagens OCI, runtimes, Docker e Podman por dentro, rootless, rede e volumes, e depois Kubernetes com control plane, reconciliação, pods, workloads, probes, recursos, rede, storage, segurança, autoscaling, deploy, operators e diagnóstico, em linguagem informal e com analogias."
tags:
- kubernetes
- cloud-native
- linux
minute: 55
---

Esta revisão fecha a trilha que começou com [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/), [redes](/2026/10/26/revisao-redes-de-computadores/) e [sistemas operacionais](/2026/10/26/revisao-fundamentos-de-sistemas-operacionais/). Containers e orquestração são o lugar onde tudo aquilo se encontra: namespaces e cgroups viram containers, overlayfs vira imagem em camadas, bridges e iptables viram rede de container, e sinais do Unix decidem se o seu deploy derruba requisições ou não.

O texto tem duas metades. A primeira é sobre **containers**: o que são de verdade, o que é uma imagem, e como Docker e Podman resolvem o mesmo problema de jeitos diferentes. A segunda é sobre **orquestração**: o que muda quando você tem centenas de containers em dezenas de máquinas, e como o Kubernetes resolve isso. Os dados técnicos estão atualizados para outubro de 2026: Kubernetes 1.37, Docker Engine 29 e Podman 6.

## Parte 1: containers, o problema que eles resolvem

Antes dos containers, colocar uma aplicação em produção era instalar coisas numa máquina: a versão certa do Python, as bibliotecas do sistema, um arquivo de configuração aqui, uma variável de ambiente ali. Funcionava no notebook do desenvolvedor e quebrava no servidor porque lá a OpenSSL era outra. Duas aplicações na mesma máquina brigavam por versões diferentes da mesma biblioteca. A solução da época era uma máquina virtual por aplicação, o que funciona, mas custa caro: cada VM carrega um sistema operacional inteiro, com kernel próprio, gigabytes de disco e dezenas de segundos para iniciar.

Container é a resposta mais leve: empacotar a aplicação **com tudo de que ela precisa no espaço de usuário** (binário, bibliotecas, arquivos de configuração) e rodar isso isolado, mas **compartilhando o kernel** da máquina. É o contêiner de navio de verdade, que deu nome à coisa: antes dele, cada carga era embalada de um jeito, e cada porto precisava saber lidar com sacos, barris e caixotes. Depois dele, tudo vai numa caixa de tamanho padrão, e guindastes, navios e caminhões só precisam saber lidar com a caixa. O conteúdo não importa para quem transporta.

### Container não é uma VM pequena

Essa é a primeira coisa a desaprender. Uma VM emula hardware: um hypervisor apresenta CPU, memória e disco virtuais, e dentro roda um sistema operacional completo, com o próprio kernel. Um container **não tem kernel próprio**. É só um processo comum do Linux, que o kernel trata de um jeito especial: ele enxerga uma visão restrita do sistema e tem o consumo de recursos limitado.

As consequências práticas:

1. **Inicia em milissegundos**, porque não há boot: é só um fork e um exec com algumas configurações a mais.
2. **Pesa megabytes**, porque não carrega kernel nem drivers.
3. **Isola menos**. Todos os containers da máquina conversam com o mesmo kernel. Uma falha no kernel é uma falha em todos. Por isso, quando se precisa de isolamento forte entre clientes que não confiam uns nos outros, usam-se tecnologias que colocam cada container dentro de uma micro VM (Kata Containers, Firecracker) ou interceptam as chamadas de sistema num kernel em espaço de usuário (gVisor).
4. **Um container Linux precisa de kernel Linux.** No Mac e no Windows, Docker e Podman rodam os containers dentro de uma VM Linux escondida. Quando você roda um container no Mac, existe uma VM, sim; ela só está fora da sua vista.

Se a VM é uma casa separada, com fundação, encanamento e caixa d'água próprios, o container é um apartamento: paredes próprias, porta própria, mas o mesmo prédio, a mesma estrutura, a mesma caixa d'água.

## Do que um container é feito: as peças do kernel

Não existe um objeto "container" no kernel Linux. Existe uma combinação de recursos que, usados juntos, produzem a ilusão. Vimos todos no artigo de sistemas operacionais; aqui eles se juntam.

### Namespaces: o que o processo consegue ver

Um namespace dá a um grupo de processos a sua própria cópia de algum recurso global do sistema. O Linux tem oito:

1. **mount:** a sua própria árvore de pontos de montagem. É o que faz o container ver um sistema de arquivos raiz que é a imagem, e não o disco do host.
2. **PID:** a sua própria numeração de processos. O primeiro processo do container é o PID 1 lá dentro, mesmo sendo o PID 48213 do lado de fora.
3. **network:** as suas próprias interfaces, tabela de rotas, regras de firewall e portas. Dois containers podem escutar na porta 80 ao mesmo tempo, cada um no seu namespace.
4. **UTS:** o seu próprio hostname.
5. **IPC:** as suas próprias filas de mensagens e memória compartilhada do System V.
6. **user:** o seu próprio mapeamento de usuários. O processo pode ser root (UID 0) lá dentro e um usuário comum sem privilégio nenhum do lado de fora. É a base do modo rootless, que vamos ver com o Podman.
7. **cgroup:** a sua própria visão da hierarquia de cgroups.
8. **time:** os seus próprios relógios de tempo desde o boot. Pouco usado, existe para migração de containers entre máquinas.

Namespaces são as **paredes** do apartamento: decidem o que o morador enxerga.

### Cgroups: quanto o processo consegue usar

Os **control groups** limitam e contabilizam recursos de um grupo de processos: CPU, memória, I/O de disco, número de processos. Sem cgroup, um container com vazamento de memória derruba a máquina inteira. Com cgroup, ele bate no teto e quem morre é só ele.

Hoje o padrão é o **cgroup v2**, com uma hierarquia única e uma interface mais coerente. O v1 está saindo de cena de vez: o kubelet do Kubernetes se recusa a iniciar em nós com cgroup v1 desde a versão 1.35, e o Podman 6 removeu o suporte. Se você ainda tem servidor com cgroup v1, ele precisa de uma distribuição mais nova antes do próximo upgrade.

Cgroups são o **medidor de luz e o disjuntor** do apartamento: decidem quanto o morador consome e cortam quando passa do limite.

### Sistema de arquivos em camadas

Cada container precisa de um sistema de arquivos raiz. Copiar a imagem inteira para cada container seria lento e desperdiçaria disco. A solução é o **overlayfs**, um sistema de arquivos que empilha diretórios: as camadas da imagem ficam embaixo, somente leitura, compartilhadas por todos os containers que usam aquela imagem, e uma camada fina gravável fica em cima, uma por container.

Ler um arquivo procura de cima para baixo. Alterar um arquivo que veio da imagem faz o **copy up**: o arquivo é copiado inteiro para a camada de cima antes de ser modificado (o que torna caro alterar arquivos grandes da imagem). Apagar um arquivo da imagem cria um **whiteout**, uma marcação que esconde o arquivo de baixo. Quando o container é removido, a camada gravável vai junto. É por isso que **o que o container grava no próprio sistema de arquivos é descartável**: dados que precisam durar vão em volumes.

### Os cadeados: capabilities, seccomp e LSMs

Namespaces e cgroups isolam e limitam, mas um processo root dentro do container ainda é root para o kernel compartilhado. Três camadas reduzem o estrago possível:

1. **Capabilities:** o poder do root dividido em umas quarenta permissões separadas (mudar dono de arquivo, abrir porta abaixo de 1024, mexer na rede, carregar módulo do kernel). Runtimes de container dão ao processo só um subconjunto pequeno por padrão, e o ideal é tirar ainda mais.
2. **seccomp:** um filtro de chamadas de sistema. O perfil padrão de Docker, Podman e containerd bloqueia algumas dezenas de syscalls perigosas que aplicações comuns nunca usam.
3. **SELinux e AppArmor:** controle de acesso obrigatório, que limita quais arquivos e recursos o processo pode tocar mesmo que tudo mais falhe. O Podman em Fedora e RHEL vem com SELinux ativo por padrão, e é a origem dos famosos sufixos de rótulo nos volumes.

Juntando tudo: um container é **um processo com namespaces, cgroups, uma raiz em overlayfs e um conjunto reduzido de permissões**. Nada mais. Saber disso desmistifica muita coisa: um container "travado" é um processo travado, um container "lento" é um processo sofrendo throttling no cgroup, e o ps do host mostra todos eles.

## Imagens: o pacote

### O que é uma imagem

Uma imagem é o **molde** de onde containers nascem. Se o container é o bolo, a imagem é a forma, e da mesma forma saem quantos bolos você quiser. Tecnicamente, uma imagem é:

1. **Camadas:** arquivos tar compactados, cada um com as diferenças de sistema de arquivos em relação à camada anterior.
2. **Configuração:** um JSON com o comando padrão, as variáveis de ambiente, o diretório de trabalho, o usuário, as portas declaradas e a lista ordenada de camadas.
3. **Manifesto:** um JSON que aponta para a configuração e para as camadas, cada uma pelo seu hash.

Tudo é **endereçado por conteúdo**: cada peça é identificada pelo hash SHA 256 do seu conteúdo, o **digest**. Se um byte muda, o digest muda. Duas imagens que compartilham a mesma camada base guardam essa camada uma vez só, no disco e no registro.

Para imagens que existem em várias arquiteturas, existe o **índice** (ou manifest list): um manifesto de manifestos, com uma entrada para amd64, outra para arm64, e assim por diante. Quando você pede a imagem, o cliente escolhe sozinho a da arquitetura da máquina. É por isso que a mesma imagem funciona no servidor x86 e no Mac com chip Apple, desde que alguém tenha construído as duas versões.

### Tag não é versão, digest é

Uma **tag** (como 1.27, latest ou stable) é só um apelido que aponta para um digest, e o apelido pode ser movido a qualquer momento. A tag latest não significa "a mais nova"; significa "a que alguém marcou como latest por último", ou simplesmente a tag padrão quando nenhuma é informada. Duas máquinas puxando a mesma tag em dias diferentes podem receber imagens diferentes. Para reprodutibilidade de verdade, em produção, referencie a imagem pelo **digest**, que é imutável. É a diferença entre "o livro mais recente do autor" e o ISBN.

### OCI: o padrão que libertou o ecossistema

O formato nasceu no Docker, mas em 2015 virou padrão aberto sob a **Open Container Initiative** (OCI), com três especificações:

1. **Image spec:** o formato da imagem (camadas, configuração, manifesto, índice).
2. **Runtime spec:** como executar um container a partir de um diretório raiz e um arquivo de configuração.
3. **Distribution spec:** a API HTTP dos registros, para enviar e baixar imagens.

Graças a isso, uma imagem construída com Docker roda no Podman, no containerd, no CRI O e em qualquer cluster Kubernetes, e é armazenada em qualquer registro: Docker Hub, GitHub Container Registry, Quay, Harbor, os registros de cada nuvem. Os registros OCI também guardam outros artefatos além de imagens: charts do Helm, assinaturas, SBOMs, até modelos de IA.

### Construindo imagens

A receita de uma imagem é um **Dockerfile** (o Podman aceita o mesmo arquivo, também chamado de Containerfile). Cada instrução, como FROM, RUN, COPY, ENV, USER e CMD, descreve um passo, e as que mudam o sistema de arquivos geram uma camada. O construtor moderno do Docker é o **BuildKit**, padrão desde a versão 23; o do Podman é o **Buildah**, que ele usa por baixo. Os dois executam passos independentes em paralelo e guardam cache.

O que separa uma imagem boa de uma ruim:

1. **Ordem para aproveitar o cache.** O cache de cada passo vale enquanto nada antes dele mudou. Copie primeiro os arquivos de dependências (o go.mod, o package.json), instale as dependências, e só depois copie o código. Assim, mudar uma linha de código não reinstala tudo.
2. **Multi stage build.** Um estágio com compiladores e ferramentas constrói o binário; o estágio final copia só o resultado para uma base mínima. A imagem de produção não carrega o compilador.
3. **Base mínima.** Imagens **distroless** (só o runtime da linguagem, sem shell nem gerenciador de pacotes), bases como a Alpine, ou até a imagem vazia **scratch** para binários estáticos. Menos coisa na imagem significa download mais rápido e menos vulnerabilidade para corrigir.
4. **Arquivo de exclusões** (o .dockerignore), para não mandar a pasta .git, o node_modules local e arquivos de segredo para o contexto de build.
5. **Usuário não root**, declarado na própria imagem.
6. **Nada de segredo em camada.** Apagar um arquivo num passo posterior não o remove da camada onde ele foi criado; ele continua lá, legível por quem baixar a imagem. Segredos de build vão por montagens de segredo do BuildKit ou do Buildah, que não ficam na imagem.

### Cadeia de suprimentos

Uma imagem é código de terceiros rodando na sua infraestrutura. As práticas atuais: **escanear vulnerabilidades** (Trivy, Grype), gerar um **SBOM** (a lista de ingredientes: cada pacote e versão dentro da imagem), **assinar** as imagens (com o cosign, do projeto Sigstore) e exigir assinatura válida na hora de rodar, e registrar a **proveniência** (de qual commit e de qual pipeline a imagem saiu), no espírito do SLSA. Também vale lembrar que registros públicos têm limites de download para usuários anônimos, e que um cluster grande puxando imagens do Docker Hub sem autenticação esbarra nesses limites rapidinho. Um registro espelho ou cache interno resolve.

## Runtimes: quem de fato cria o container

"Rodar um container" passa por várias camadas, e os nomes confundem. Vale separar em dois níveis:

1. **Runtime de baixo nível (OCI):** pega um diretório raiz e uma configuração e cria o processo com namespaces, cgroups e tudo mais, seguindo a runtime spec. Faz isso e sai. O **runc** é o de referência, escrito em Go. O **crun**, escrito em C, é mais rápido e leve, e é o padrão do Podman. Existem outros, como o youki (em Rust), o runsc do gVisor e o runtime do Kata, que trocam o processo comum por uma sandbox ou micro VM.
2. **Runtime de alto nível:** cuida de tudo em volta: baixar e guardar imagens, montar as camadas, preparar a rede, gerenciar o ciclo de vida de vários containers e expor uma API. O **containerd** (versão 2 desde o fim de 2024) e o **CRI O** são os principais.

Entre os dois, existe um processo pequeno, o **shim** (no containerd) ou o **conmon** (no Podman e no CRI O). Ele fica como pai do container, guarda o código de saída, segura a entrada e a saída padrão e permite que o runtime de alto nível seja reiniciado sem matar os containers.

Uma analogia: o runc é o pedreiro que levanta as paredes do apartamento e vai embora. O containerd é a construtora, que compra o material, coordena os pedreiros e mantém o cadastro dos apartamentos. O Docker e o Podman são a imobiliária, com quem o cliente conversa.

## Docker por dentro

O Docker popularizou containers em 2013, não por ter inventado as peças (namespaces e cgroups já existiam, e o LXC também), mas por ter juntado tudo numa experiência simples: um formato de imagem, um registro público e uma linha de comando que qualquer pessoa entendia.

### A arquitetura

O Docker é **cliente e servidor**:

1. **docker** (a CLI): o comando que você digita. Ele não cria container nenhum; só manda requisições para a API.
2. **dockerd** (o daemon): um serviço que roda o tempo todo, normalmente como root, e expõe a API REST num socket Unix. Cuida de imagens, redes, volumes, builds e logs.
3. **containerd:** o runtime de alto nível, para quem o dockerd delega a execução.
4. **shim e runc:** criam cada container.

Quando você roda um container, o caminho é: CLI, API do dockerd, containerd, shim, runc, e o runc sai, deixando o shim como pai do processo.

Duas consequências desse desenho. Primeira: **acesso ao socket do Docker é acesso root à máquina**. Quem consegue falar com o daemon consegue iniciar um container privilegiado montando o disco do host. Colocar um usuário no grupo docker é dar root a ele, e montar o socket dentro de um container é dar root ao container. Segunda: o daemon é um ponto central; containers iniciados por ele são filhos dele (via containerd), e não da sua sessão.

### O que mudou recentemente

1. **O containerd image store é o padrão** para instalações novas desde o Docker Engine 29. Antes, o Docker guardava as imagens no seu próprio armazenamento (os graph drivers, como o overlay2); agora usa o do containerd, o que traz suporte nativo a imagens multiarquitetura e a artefatos OCI. Instalações atualizadas continuam no armazenamento antigo até alguém migrar, e o antigo vai ser removido numa versão futura.
2. **nftables** começou a chegar como alternativa ao iptables para as regras de rede, ainda experimental.
3. **Compose v2** é um plugin da CLI: o comando é docker compose, com espaço, e o antigo docker-compose em Python é passado.
4. **BuildKit** é o construtor padrão, com cache remoto e builds multiplataforma pelo buildx.

### Docker Engine, Docker Desktop e o modo rootless

**Docker Engine** é o software livre que roda no Linux. **Docker Desktop** é o produto para Mac e Windows (e Linux, opcionalmente), que traz uma VM Linux, interface gráfica, Kubernetes local e extras; ele tem licença comercial paga para empresas acima de um certo porte. Alternativas gratuitas para Mac são o Colima, o OrbStack (comercial, mas popular) e o próprio Podman Desktop.

O Docker também tem um **modo rootless**, em que o daemon roda como usuário comum dentro de um user namespace. Funciona, mas é opcional e menos usado; no Podman, rootless é o caminho natural.

## Podman por dentro

O **Podman** nasceu na Red Hat com uma proposta: a mesma experiência de linha de comando do Docker, mas **sem daemon** e **sem root** por padrão. A CLI é compatível o bastante para que muita gente simplesmente crie um alias de docker para podman e siga a vida.

### Sem daemon

Quando você roda um container com o Podman, o próprio comando podman faz o trabalho: prepara a imagem, monta as camadas, configura a rede, chama o **conmon** para ser o pai do container e o **crun** para criá-lo, e então sai. O container fica como filho do conmon, e não de um serviço central. Isso tem consequências boas:

1. **Não existe um ponto único de falha** nem um socket privilegiado esperando conexões.
2. **O container pertence ao usuário** que o iniciou, e aparece nos logs de auditoria como ação daquele usuário, não do daemon.
3. **Integra naturalmente com o systemd**, que é quem deveria gerenciar serviços de longa duração numa máquina Linux.

Para ferramentas que esperam a API do Docker (o docker compose, o Testcontainers, IDEs), o Podman oferece um **socket com API compatível**, ativado sob demanda pelo systemd. Ele existe para compatibilidade, e não é necessário para o uso normal.

### Rootless de verdade

No modo rootless, um usuário comum roda containers sem nenhum privilégio extra. O truque é o **user namespace**: o arquivo de subordinados (o /etc/subuid e o /etc/subgid) reserva para cada usuário uma faixa de IDs, como 65536 UIDs a partir de 100000. Dentro do container, o processo é root (UID 0), mas esse 0 é mapeado para o UID do próprio usuário do lado de fora, e os UIDs 1 em diante são mapeados para a faixa reservada. Se o processo escapar do container, ele é só o seu usuário comum, ou um UID que não pertence a ninguém.

Isso exige algumas peças:

1. **Rede sem root.** Um usuário comum não pode criar interfaces no host. O Podman usa o **pasta**, que cria uma interface dentro do namespace do container e traduz o tráfego para sockets comuns no host. Até o Podman 5, existia também o slirp4netns, mais lento; o Podman 6 o removeu.
2. **Sistema de arquivos sem root.** O overlayfs em user namespace é suportado pelo kernel há anos; em kernels antigos, o fuse overlayfs fazia esse papel.
3. **Portas baixas.** Por padrão, usuário comum não abre porta abaixo de 1024, nem dentro do container. Ou se publica numa porta alta, ou se ajusta o parâmetro do kernel que define a primeira porta não privilegiada.

O preço do rootless é pequeno, mas existe: algumas operações de rede e de armazenamento são um pouco mais lentas, e alguns cenários (montar certos sistemas de arquivos, mexer em dispositivos) simplesmente não funcionam sem privilégio. Para a imensa maioria das aplicações, não faz diferença.

### Pods no Podman

O nome não é à toa: o Podman tem **pods** nativamente, no mesmo sentido do Kubernetes, um grupo de containers que compartilham namespaces de rede e IPC, segurados por um container mínimo de infraestrutura. Isso permite testar localmente a mesma estrutura que vai rodar no cluster. O Podman consegue **gerar YAML do Kubernetes** a partir de containers e pods existentes (podman kube generate) e **rodar YAML do Kubernetes** localmente (podman kube play), sem cluster nenhum.

### Quadlet: containers como serviços do systemd

Para rodar containers como serviços numa máquina, sem orquestrador, o Podman usa o **Quadlet**: você escreve um arquivo declarativo curto descrevendo o container (imagem, portas, volumes, variáveis) numa pasta de configuração do systemd, e o Quadlet gera a unidade do systemd correspondente. A partir daí, o container é um serviço como qualquer outro: inicia no boot, reinicia quando cai, tem logs no journal, depende de outros serviços. Com a atualização automática, o systemd consegue até puxar a imagem nova e reiniciar o serviço sozinho. Para um servidor pequeno ou para dispositivos de borda, é orquestração suficiente.

### Podman 6

A versão 6, lançada em junho de 2026, foi principalmente uma faxina: saíram o slirp4netns, o CNI, o cgroup v1 e o banco de estado antigo (BoltDB). A rede passa a ser sempre **Netavark** (configuração de rede) com **Aardvark** (DNS entre containers) e pasta no modo rootless, e o estado fica em SQLite. No Mac, a VM padrão do podman machine passou a usar o libkrun, que permite acesso à GPU de dentro dos containers. Quem vem do 5.x precisa conferir rede e cgroups antes de atualizar.

### A família

O Podman faz parte de um conjunto de ferramentas que compartilham bibliotecas: **Buildah** constrói imagens (o podman build é o Buildah por baixo), **Skopeo** copia, inspeciona e assina imagens entre registros sem precisar baixá-las para o armazenamento local, e o **CRI O** é o runtime do Kubernetes que usa as mesmas bibliotecas. O **Podman Desktop** é a interface gráfica, gratuita, para Mac, Windows e Linux.

## Docker ou Podman?

Os dois rodam as mesmas imagens, aceitam os mesmos Dockerfiles e têm comandos quase idênticos. As diferenças estão na arquitetura e no ecossistema:

1. **Arquitetura:** Docker tem daemon central; Podman, não.
2. **Privilégio:** Docker roda o daemon como root por padrão, com rootless opcional; Podman é rootless por padrão.
3. **Pods:** só o Podman tem, e ele conversa com YAML do Kubernetes.
4. **Serviços na máquina:** Docker usa políticas de reinício do próprio daemon; Podman usa o systemd, via Quadlet.
5. **Ecossistema:** Docker tem o Compose como cidadão de primeira classe, o Docker Hub, o Docker Desktop e a maior base de tutoriais. Podman funciona com o docker compose pelo socket compatível e tem o podman compose, mas a experiência com Compose é menos polida.
6. **Onde aparecem por padrão:** Podman vem instalado no Fedora, RHEL e derivados; Docker é o mais comum no Ubuntu, nos ambientes de CI e nos notebooks de desenvolvedores.

A resposta honesta: para quem já usa Docker e está feliz, não há motivo urgente para trocar. Para servidores Linux, especialmente onde segurança e integração com systemd importam, o Podman é a escolha mais natural. E nenhum dos dois roda dentro do Kubernetes: lá, quem executa os containers é o containerd ou o CRI O.

## Rede de containers numa máquina

### A bridge padrão

Por padrão, cada container ganha o seu próprio namespace de rede. O runtime cria um **par veth**, um cabo virtual com duas pontas: uma fica dentro do container, com o nome eth0, e a outra fica no host, ligada a uma **bridge**, um switch virtual (a docker0 no Docker, a podman0 no Podman rootful). A bridge tem um IP numa rede privada, que é o gateway dos containers. O tráfego que sai para a internet passa por **NAT** (masquerade) no host, como numa rede doméstica atrás do roteador. Tudo o que vimos no artigo de redes sobre bridges, veth e NAT está aqui.

### Publicando portas

O container tem IP privado, inacessível de fora. Publicar uma porta (a opção p, como 8080 para 80) cria uma regra de **DNAT** no host: o que chega na porta 8080 do host é redirecionado para a porta 80 do container. Um detalhe que pega muita gente: no Docker, essas regras são inseridas antes das regras do firewall do sistema (como o ufw), então **publicar uma porta a expõe para fora mesmo que o firewall pareça bloqueá-la**. Para expor só localmente, publique no endereço de loopback.

### Redes definidas pelo usuário e DNS

Na bridge padrão do Docker, containers só se encontram por IP. Numa **rede criada pelo usuário**, existe um DNS embutido, e cada container é encontrado pelo seu nome. É assim que o Compose faz a API encontrar o banco pelo nome do serviço. No Podman, o Aardvark faz esse papel.

### Outros modos

1. **host:** o container usa o namespace de rede do próprio host. Sem isolamento de rede, sem NAT, desempenho máximo.
2. **none:** só a interface de loopback.
3. **container:** compartilha o namespace de rede de outro container. É exatamente o que um pod faz.
4. **macvlan e ipvlan:** o container aparece como uma máquina diretamente na rede física, com IP próprio.

## Dados: volumes e montagens

Como a camada gravável morre com o container, dados que precisam durar vão para fora dela:

1. **Volume nomeado:** um diretório gerenciado pelo runtime, criado e listado por nome, independente de qualquer container. É o jeito recomendado para dados de aplicação, como os arquivos de um banco.
2. **Bind mount:** um diretório do host montado dentro do container. Ótimo para desenvolvimento (editar o código no host e ver a mudança no container) e para configuração. O problema clássico é de permissão: o UID do processo no container precisa ter acesso aos arquivos do host, e no rootless o mapeamento de UIDs complica isso. Em hosts com SELinux, o volume precisa do sufixo de rótulo para o container conseguir ler.
3. **tmpfs:** um sistema de arquivos em memória, apagado quando o container para. Para arquivos temporários e dados sensíveis que não devem tocar o disco.

## PID 1, sinais e o ciclo de vida

O processo principal de um container é o PID 1 do seu namespace, e o PID 1 tem tratamento especial no kernel: ele **não recebe a ação padrão dos sinais**. Um processo comum que recebe SIGTERM sem tratar o sinal morre; o PID 1, nas mesmas condições, ignora. Ele também herda os processos órfãos e precisa recolhê-los, senão viram zumbis.

O que acontece na prática: o docker stop (ou podman stop) manda SIGTERM, espera dez segundos e manda SIGKILL. Uma aplicação que não trata SIGTERM e roda como PID 1 sempre demora os dez segundos inteiros para parar, e morre sem fechar conexões nem gravar o que estava em memória.

Duas armadilhas e duas soluções:

1. **Forma shell do CMD.** Escrever o comando como uma string simples faz o runtime executar um shell, que vira o PID 1, e o shell **não repassa sinais** para a aplicação. Use a forma exec, com a lista de argumentos, para que a aplicação seja o PID 1.
2. **Aplicação que não trata sinais.** Use um init mínimo como PID 1 (o tini, ativado pela opção init do Docker e do Podman), que repassa os sinais e recolhe os zumbis.

O código de saída conta a história: **137** é 128 mais 9, morte por SIGKILL (estouro do prazo de parada ou OOM); **143** é 128 mais 15, saída por SIGTERM.

## Limites de recursos

As opções de memória e CPU do docker run e do podman run escrevem diretamente nos arquivos do cgroup do container. Passar do limite de memória aciona o OOM killer dentro do cgroup, e o container morre com código 137. Passar da cota de CPU faz o processo sofrer throttling. Sem limite nenhum, um container pode consumir a máquina inteira. Tudo isso volta, com mais nuance, na parte de Kubernetes.

Um detalhe que pegou muita gente por anos: runtimes antigos de linguagens, como JVMs antigas, olhavam a memória total do host e não o limite do cgroup, e dimensionavam o heap como se tivessem a máquina inteira, morrendo por OOM logo depois. Versões modernas da JVM, do Go, do .NET e do Node detectam o limite do container, mas vale conferir.

## Compose: vários containers numa máquina

Uma aplicação real tem vários pedaços: a API, o banco, o cache, um worker. O **Compose** descreve tudo num arquivo YAML (serviços, imagens, portas, volumes, redes, variáveis, dependências) e sobe o conjunto com um comando. É a ferramenta perfeita para ambiente de desenvolvimento, testes de integração e servidores pequenos. A especificação do Compose é aberta, e o Podman também a entende.

Mas o Compose tem um limite claro: ele vive **numa máquina só**. Se a máquina morre, tudo morre. Ele não espalha containers entre servidores, não move nada quando um nó cai, não faz atualização gradual entre máquinas, não tem balanceamento entre hosts. É aí que começa a outra metade da história.

## Parte 2: orquestração, o problema que ela resolve

Um container sozinho numa máquina não é um sistema. Quando você tem duzentos containers espalhados por trinta máquinas, as perguntas mudam: em qual máquina cada um roda? O que acontece quando uma máquina morre? Como um container encontra o outro se os IPs mudam toda hora? Como atualizar a versão sem derrubar o serviço? Quem reinicia o que travou? Como escalar quando o tráfego dobra?

Um **orquestrador** responde a essas perguntas. É o maestro de uma orquestra: não toca nenhum instrumento, mas sabe quem deve estar tocando, onde, e percebe na hora quando um músico some. Você não diz "rode este container naquela máquina"; você diz "quero três cópias deste serviço sempre rodando", e ele se vira para que isso seja verdade, agora e daqui a seis meses.

Houve vários concorrentes. O **Docker Swarm** é simples e vem embutido no Docker, mas ficou num nicho. O **Nomad**, da HashiCorp, é enxuto e orquestra também coisas que não são containers. O Mesos foi aposentado. O **Kubernetes**, nascido no Google a partir da experiência com o sistema interno Borg e doado à CNCF em 2015, venceu com folga e virou o padrão da indústria. Hoje, todo provedor de nuvem tem um Kubernetes gerenciado (EKS, GKE, AKS e muitos outros), e o resto deste texto é sobre ele.

## A ideia central: estado desejado e reconciliação

Se você entender uma coisa só desta metade, que seja esta. O Kubernetes é **declarativo**. Você não dá ordens ("inicie, pare, mova"); você descreve o estado que quer ("três réplicas desta imagem, com 512 MB de memória cada, atrás deste endereço"). Esse desejo é gravado num banco de dados. Depois, dezenas de **controllers** rodam um loop infinito, cada um cuidando de um tipo de coisa:

1. Olha o estado desejado.
2. Olha o estado real.
3. Se forem diferentes, age para aproximar os dois.
4. Volta para o passo 1.

É o termostato do ar condicionado. Você não liga e desliga o compressor; você diz "quero 22 graus", e o termostato fica medindo e corrigindo para sempre. Se alguém abrir a janela, ele trabalha mais. Se um pod morrer, o controller percebe que existem duas réplicas onde deveriam existir três e cria outra. Ninguém precisou "tratar o evento da morte do pod": a diferença entre desejo e realidade é o próprio gatilho.

Essa ideia explica muito comportamento que parece estranho no começo. Apagar um pod de um Deployment não adianta, porque outro aparece no lugar: o desejo continua sendo três. Editar algo na mão num recurso gerenciado por outra ferramenta é desfeito minutos depois, porque alguém reconcilia de volta para o que está declarado. Para mudar o resultado, é preciso mudar o desejo.

## Arquitetura: o control plane e os nós

Um cluster tem duas metades: o **control plane**, que decide, e os **nós** (nodes), que executam.

### Control plane

1. **API server:** a porta de entrada de tudo. Todo comando do kubectl, todo controller, todo kubelet conversa com o cluster por essa API. Ele autentica, autoriza, passa pelos controles de admissão, valida e grava no etcd. Nenhum outro componente fala com o etcd diretamente. É o único balcão do cartório.
2. **etcd:** o banco de dados chave e valor onde mora todo o estado do cluster: cada pod, cada Service, cada Secret. É distribuído e usa o algoritmo de consenso Raft, o que exige maioria (quórum) para gravar: com três membros, aguenta perder um; com cinco, aguenta perder dois. Perder o etcd sem backup é perder o cluster, no sentido mais literal possível.
3. **Scheduler:** olha os pods que ainda não têm nó definido e escolhe onde cada um vai rodar. Primeiro filtra os nós que servem (têm recurso livre, respeitam as restrições), depois pontua os que sobraram e escolhe o melhor. Ele só decide; quem executa é o nó.
4. **Controller manager:** um processo que roda dezenas de controllers embutidos: o de Deployments, o de ReplicaSets, o de nós (que percebe quando um nó para de responder), o de Jobs, o de endpoints, e assim por diante.
5. **Cloud controller manager:** a ponte com o provedor de nuvem. Cria balanceadores quando você pede um Service do tipo LoadBalancer, descobre quando uma máquina virtual foi apagada, configura rotas.

### Nós

1. **kubelet:** o agente em cada nó. Observa a API, vê quais pods foram atribuídos ao seu nó e garante que eles estejam rodando, conversando com o runtime de containers. Também executa as probes, monta volumes e reporta o estado do nó e dos pods.
2. **Container runtime:** quem de fato cria os containers, através da interface padrão **CRI** (Container Runtime Interface). Hoje é o **containerd** ou o **CRI O**, que por sua vez chamam o runc ou o crun. O Docker deixou de ser usado como runtime direto na versão 1.24, com a famosa remoção do dockershim, mas isso não quebrou nada para quem constrói imagens com Docker: as imagens são OCI, e qualquer runtime CRI as executa. O Docker continua ótimo para construir; só não é mais ele que roda os containers no nó.
3. **kube proxy:** implementa os Services em cada nó, programando regras de iptables, IPVS ou nftables (o modo nftables é estável e o caminho para o futuro) para que o tráfego destinado ao IP virtual de um Service chegue a algum pod de verdade. Algumas soluções de rede, como o Cilium, substituem o kube proxy por programas eBPF.

### Seguindo um deploy de ponta a ponta

Quando você aplica um Deployment com três réplicas, a sequência é esta:

1. O kubectl envia o objeto ao API server, que autentica, autoriza, valida e grava no etcd.
2. O controller de Deployments percebe o Deployment novo e cria um ReplicaSet.
3. O controller de ReplicaSets percebe que o ReplicaSet quer três pods e existem zero, e cria três objetos Pod, ainda sem nó.
4. O scheduler percebe pods sem nó, escolhe um nó para cada e grava a decisão.
5. O kubelet de cada nó escolhido percebe que ganhou um pod e pede ao runtime, via CRI, para criar o sandbox do pod; o runtime chama o plugin de rede (CNI) para dar um IP, puxa a imagem, e o kubelet prepara os volumes e manda iniciar os containers.
6. As probes começam a rodar. Quando a readiness passa, o pod entra nos endpoints do Service e começa a receber tráfego.

Repare que ninguém chamou ninguém diretamente. Cada componente só observa a API e reage. Isso torna o sistema resistente: se o scheduler ficar fora por um minuto, os pods esperam em Pending e são agendados quando ele voltar. Nada se perde, porque o desejo está gravado.

## Pods: a menor unidade

O Kubernetes não agenda containers, agenda **pods**. Um pod é um grupo de um ou mais containers que sempre rodam juntos, no mesmo nó, compartilhando o mesmo namespace de rede (mesmo IP, mesmo localhost, mesmas portas) e podendo compartilhar volumes. Se containers são pessoas, o pod é o apartamento: quem mora junto divide o endereço e a cozinha.

No Linux, isso é exatamente a primeira metade deste texto. Cada pod tem um container mínimo, o **pause**, que só existe para segurar os namespaces de rede e IPC. Os containers da aplicação entram nesses namespaces, como no modo de rede container que vimos no Docker. Cada container tem o seu próprio cgroup, todos debaixo do cgroup do pod. É o mesmo conceito de pod do Podman.

A regra prática é **um processo principal por pod**. Coloque containers juntos no mesmo pod só quando eles precisam realmente compartilhar ciclo de vida, rede ou disco.

### Init containers e sidecars

1. **Init containers** rodam antes dos containers principais, um por vez, e cada um precisa terminar com sucesso antes do próximo. Servem para preparar o terreno: esperar uma dependência, baixar uma configuração, aplicar uma migração, ajustar permissões de um volume.
2. **Sidecars** são containers auxiliares que rodam ao lado do principal durante toda a vida do pod: um proxy de service mesh, um agente que envia logs, um processo que renova certificados. Por anos, eram só "mais um container", o que causava problemas de ordem (o sidecar terminando antes da aplicação, ou um Job que nunca acabava porque o sidecar continuava vivo). Desde a versão 1.33, o **sidecar nativo** é estável: um init container com política de reinício Always, que sobe antes da aplicação, continua rodando junto e só é encerrado depois dela.

### O ciclo de vida de um pod

Um pod passa pelas fases **Pending** (aceito, mas ainda sem rodar: esperando agendamento ou baixando imagem), **Running** (pelo menos um container rodando), **Succeeded** (todos terminaram com sucesso, típico de Jobs), **Failed** (algum terminou com erro e não vai ser reiniciado) e **Unknown** (o nó parou de reportar).

A **política de reinício** (restartPolicy) define o que fazer quando um container termina: Always (o padrão em Deployments), OnFailure ou Never (comuns em Jobs). Quando um container falha repetidamente, o kubelet espera cada vez mais entre as tentativas, dobrando o intervalo até um teto de cinco minutos. É o famoso **CrashLoopBackOff**: não é um erro em si, é o kubelet dizendo "já tentei várias vezes, vou esperar um pouco antes de tentar de novo". O erro de verdade está nos logs do container, geralmente na execução anterior.

### Pods são descartáveis

Pods não são consertados, são substituídos. Um pod não muda de nó, não "volta" depois que o nó morre e ganha IP novo a cada recriação. É por isso que quase ninguém cria pods diretamente: quem cria são os controllers de workload, que garantem a quantidade desejada. Tratar pods como gado, não como animais de estimação, é a mudança de mentalidade mais importante para quem vem de servidores tradicionais.

## Workloads: quem cria os pods

1. **Deployment:** para aplicações sem estado, como APIs e frontends. Gerencia ReplicaSets, que gerenciam pods. Faz atualizações graduais e rollback. É o recurso mais usado do Kubernetes.
2. **ReplicaSet:** garante que exista um número exato de pods idênticos. Quase nunca é usado diretamente; o Deployment cria um ReplicaSet novo a cada versão e vai trocando um pelo outro.
3. **StatefulSet:** para aplicações com estado, como bancos de dados, Kafka e ZooKeeper. Cada pod tem uma **identidade estável**: nome fixo com número (db 0, db 1, db 2), nome de DNS próprio e o seu próprio volume persistente, que acompanha o pod mesmo se ele for recriado em outro nó. Os pods sobem e são atualizados em ordem.
4. **DaemonSet:** um pod em cada nó (ou em cada nó que atenda a um critério). Para agentes de infraestrutura: coletores de logs e métricas, plugins de rede, drivers de storage.
5. **Job:** roda pods até que um número de execuções termine com sucesso, com retentativas. Para tarefas que têm fim: migração, processamento em lote, backup.
6. **CronJob:** cria Jobs num horário, com a sintaxe do cron. Cuidado com a política de concorrência: se um Job demora mais que o intervalo, você pode acabar com várias execuções sobrepostas.

## Probes: como o Kubernetes sabe que algo está bem

O kubelet pode verificar a saúde de cada container com uma requisição HTTP, uma conexão TCP, uma chamada gRPC ou um comando executado dentro do container. E existem três tipos de verificação, cada um com uma consequência diferente:

1. **Liveness:** "este container está vivo ou travado?". Se falhar, o kubelet **mata e reinicia** o container. Serve para destravar processos em deadlock.
2. **Readiness:** "este container pode receber tráfego agora?". Se falhar, o pod é **tirado dos endpoints** dos Services, mas não é reiniciado. Serve para aquecimento, para dependências temporariamente fora e para sobrecarga.
3. **Startup:** "o container já terminou de iniciar?". Enquanto ela não passar, as outras duas ficam desligadas. Serve para aplicações que demoram para subir, sem precisar afrouxar a liveness.

O erro mais comum e mais caro: colocar na **liveness** uma verificação que depende do banco de dados ou de outro serviço. Quando o banco engasga, todos os pods falham a liveness ao mesmo tempo, são reiniciados ao mesmo tempo, sobem ao mesmo tempo martelando o banco que já estava mal, e uma lentidão vira um apagão completo. A liveness deve responder só "meu processo está funcionando?". Dependências externas, quando muito, vão na readiness, e com cuidado.

## Encerramento gracioso: onde os sinais do Unix voltam

Quando um pod é removido (num deploy, numa redução de réplicas, num nó sendo esvaziado), acontece isto, em paralelo:

1. O pod é marcado como terminando e começa a ser retirado dos endpoints dos Services.
2. O kubelet executa o **preStop**, se houver.
3. O kubelet manda **SIGTERM** para o processo principal de cada container.
4. Se o processo não terminar dentro do **terminationGracePeriodSeconds** (30 segundos por padrão), o kubelet manda **SIGKILL**.

Dois problemas clássicos moram aqui. O primeiro é o do PID 1 que vimos na parte de containers: se a aplicação não trata SIGTERM, ou roda atrás de um shell que não repassa o sinal, ela só morre no SIGKILL, trinta segundos depois, sem limpar nada. O código de saída 137 nos eventos denuncia.

O segundo é uma condição de corrida: a retirada dos endpoints e o SIGTERM acontecem ao mesmo tempo, mas a retirada precisa se propagar até o kube proxy de cada nó, os balanceadores e os proxies de entrada, o que leva alguns segundos. Se a aplicação para de aceitar conexões imediatamente ao receber o SIGTERM, ainda chegam requisições por esses segundos, que encontram a porta fechada e viram erro 502. A solução padrão é um preStop que espera alguns segundos antes de deixar o SIGTERM chegar (existe uma ação de sleep nativa para isso, sem precisar de um binário de sleep na imagem), e uma aplicação que, ao receber o sinal, termina as requisições em andamento antes de sair.

## Recursos e escalonamento: onde cada pod vai morar

### Requests e limits

Cada container pode declarar dois números para CPU e para memória:

1. **Request:** quanto o container precisa garantido. O scheduler usa só os requests para decidir onde o pod cabe: um nó com 4 CPUs aceita pods cujos requests somem até 4, independentemente do uso real. O request de CPU também vira o peso do cgroup (o cpu.weight), definindo a fatia de cada um quando há disputa.
2. **Limit:** o teto. Vira o cpu.max e o memory.max do cgroup, exatamente como as opções de limite do Docker e do Podman.

E aqui a diferença entre CPU e memória é crucial, porque uma é comprimível e a outra não:

1. **Passar do limit de CPU** não mata ninguém: o container sofre **throttling**, ficando parado até o próximo período de 100 ms. O sintoma é latência alta e misteriosa com a máquina ociosa. Muita gente experiente recomenda definir request de CPU e não definir limit, deixando o container usar a sobra do nó.
2. **Passar do limit de memória** aciona o OOM killer dentro do cgroup, e o container morre com **OOMKilled** (código 137). Para memória, limit é altamente recomendado, e muita gente usa limit igual ao request.

CPU se mede em núcleos ou milicores: 500m é meio núcleo. Memória em bytes, com sufixos como Mi e Gi.

Uma novidade importante: desde a versão 1.35, o **redimensionamento no lugar** (in place resize) é estável. Dá para mudar requests e limits de um pod em execução sem recriá-lo; para CPU, normalmente sem nem reiniciar o container. Antes, qualquer ajuste de recurso exigia matar e recriar o pod. Também existem **recursos no nível do pod**, um orçamento compartilhado entre todos os containers do pod, em beta.

### Classes de QoS

A combinação de requests e limits define a **classe de qualidade de serviço** do pod, que decide quem sai primeiro quando o nó fica sem memória:

1. **Guaranteed:** todos os containers com request igual ao limit, para CPU e memória. São os últimos a serem despejados.
2. **Burstable:** tem algum request, mas não se encaixa no anterior. Ficam no meio.
3. **BestEffort:** nenhum request nem limit. São os primeiros a sair.

Quando o nó fica com pouca memória ou disco, o kubelet faz **eviction**: despeja pods, começando pelos que mais passaram dos seus requests e pelas classes mais baixas. O pod aparece como **Evicted**. Isso é diferente do OOMKilled: eviction é o kubelet se antecipando para proteger o nó; OOMKilled é o kernel matando um processo que estourou o limite do cgroup.

### Controlando onde os pods vão

1. **nodeSelector:** o jeito mais simples. "Só rode em nós com o rótulo disco igual a ssd."
2. **Node affinity:** a versão expressiva, com regras obrigatórias ("só em nós da zona A ou B") e preferenciais ("de preferência em máquinas com GPU").
3. **Pod affinity e anti affinity:** regras em relação a outros pods. Afinidade: "rode perto do cache". Anti afinidade: "não rode duas réplicas no mesmo nó", para que a queda de um nó não leve todas.
4. **Taints e tolerations:** o contrário da afinidade. Um **taint** num nó repele pods ("este nó é só para GPU", "este nó está com problema"). Só pods com a **toleration** correspondente podem rodar lá. É a placa de "acesso restrito" na porta, e a toleration é o crachá. O control plane costuma ter um taint para que aplicações comuns não rodem nele.
5. **Topology spread constraints:** espalhar réplicas de forma equilibrada entre zonas de disponibilidade ou nós, com uma diferença máxima entre eles. É o jeito moderno de garantir que a perda de uma zona inteira não derrube o serviço.
6. **Prioridade e preempção:** pods podem ter classes de prioridade. Se um pod importante não cabe em lugar nenhum, o scheduler pode despejar pods de menor prioridade para abrir espaço.

### GPUs e hardware especial

Com a explosão de cargas de IA, o Kubernetes ganhou o **Dynamic Resource Allocation** (DRA), estável desde a 1.34: em vez de pedir "uma GPU" como um número opaco, o pod descreve o dispositivo que precisa (modelo, memória, uma fatia de uma GPU compartilhada), e o driver do fabricante aloca. As versões recentes também avançam no **agendamento de grupos** (gang scheduling), que só inicia um conjunto de pods de treinamento distribuído quando todos cabem ao mesmo tempo, em vez de deixar metade deles esperando e segurando GPUs caras.

## Rede: o modelo do Kubernetes

O Kubernetes impõe um modelo de rede simples de enunciar:

1. Todo pod tem o seu próprio IP.
2. Todo pod consegue falar com qualquer outro pod pelo IP, sem NAT, em qualquer nó.
3. Os agentes de um nó (como o kubelet) conseguem falar com todos os pods daquele nó.

É uma rede plana, como se todos os pods estivessem no mesmo grande switch. Repare na diferença para a rede de um Docker numa máquina só: lá, cada container tem IP privado e precisa de NAT e porta publicada para ser alcançado de fora. No Kubernetes, o IP do pod é alcançável de qualquer lugar do cluster.

O Kubernetes não implementa isso sozinho: ele delega para um plugin de rede, através da interface **CNI**. Quando um pod é criado, o runtime chama o plugin, que cria o par veth (um lado dentro do namespace de rede do pod, outro no nó), atribui um IP e programa as rotas. Plugins diferentes resolvem a comunicação entre nós de formas diferentes: com túneis de encapsulamento como VXLAN (Flannel, e o Calico em alguns modos), com roteamento puro via BGP (Calico), com eBPF (Cilium) ou usando a própria rede da nuvem, dando aos pods IPs da VPC (o plugin da AWS, por exemplo).

### Services: um endereço estável para um alvo que se move

Pods morrem e renascem com IPs novos o tempo todo. Ninguém consegue configurar um cliente apontando para IP de pod. O **Service** resolve isso: é um nome e um IP virtual estáveis na frente de um conjunto de pods, escolhidos por um **seletor de rótulos**. Os pods que combinam com o seletor e estão prontos (passando a readiness) entram nos **EndpointSlices** do Service; o kube proxy de cada nó transforma isso em regras que distribuem o tráfego entre eles.

Os tipos:

1. **ClusterIP:** o padrão. Um IP virtual acessível só de dentro do cluster. Esse IP não pertence a nenhuma interface: ele só existe nas regras de iptables, nftables ou eBPF, que reescrevem o destino para o IP de um pod. Por isso dar ping num ClusterIP normalmente não funciona, mas conectar na porta funciona.
2. **NodePort:** além do ClusterIP, abre uma porta alta (de 30000 a 32767) em todos os nós. Tráfego que chega nessa porta em qualquer nó vai para o Service.
3. **LoadBalancer:** além do NodePort, pede ao provedor de nuvem um balanceador externo apontando para os nós. É o jeito mais direto de expor algo para a internet, e cada Service desses custa um balanceador.
4. **Headless** (ClusterIP None): sem IP virtual. O DNS devolve diretamente os IPs dos pods. Usado com StatefulSets, quando o cliente precisa falar com um pod específico (o primário do banco, um broker do Kafka).
5. **ExternalName:** só um apelido de DNS para um nome externo.

### DNS dentro do cluster

O cluster tem o seu próprio DNS, quase sempre o **CoreDNS**. Cada Service ganha um nome no formato servico.namespace.svc.cluster.local, e pods do mesmo namespace podem usar só o nome curto do Service. É a mesma ideia do DNS embutido nas redes do Docker e do Aardvark no Podman, em escala de cluster.

Um detalhe que causa lentidão e custo escondido: por padrão, o arquivo de resolução dos pods vem com a opção **ndots 5** e uma lista de domínios de busca. Isso significa que um nome externo com menos de cinco pontos, como api.exemplo.com, é primeiro tentado com cada sufixo do cluster antes da consulta de verdade. Cada requisição a uma API externa pode virar quatro ou cinco consultas DNS falhadas antes da certa. Colocar o ponto final no nome, reduzir o ndots no pod ou usar um cache de DNS local no nó resolve.

### Ingress e Gateway API

Expor cada serviço com um balanceador próprio fica caro e desorganizado. O **Ingress** define regras HTTP de entrada (este domínio e este caminho vão para aquele Service), implementadas por um **ingress controller**, um proxy reverso rodando no cluster. Um único balanceador externo, muitas rotas internas, TLS terminado num lugar só.

O Ingress ficou limitado com o tempo: só HTTP, recursos importantes dependendo de anotações específicas de cada controller, e um único objeto misturando responsabilidades da equipe de plataforma e das equipes de aplicação. A **Gateway API** é a sucessora oficial: separa o **GatewayClass** (o tipo de implementação), o **Gateway** (o ponto de entrada, mantido pela plataforma) e as **rotas** (HTTPRoute, GRPCRoute e outras, mantidas por cada equipe), com divisão de tráfego por peso, roteamento por cabeçalho e suporte a outros protocolos sem anotações proprietárias.

O empurrão definitivo veio em março de 2026, quando o **ingress nginx** mantido pela comunidade do Kubernetes, o controller mais usado do mundo, foi aposentado: sem novas versões e sem correções de segurança. A API Ingress continua existindo, e outros controllers continuam suportando, mas projetos novos devem usar a Gateway API, e a ferramenta ingress2gateway ajuda a converter o que já existe.

### NetworkPolicy

Por padrão, num cluster Kubernetes, **todo pod fala com todo pod**. Uma **NetworkPolicy** restringe isso por rótulos e namespaces: "só os pods do frontend podem falar com a API na porta 8080", "o banco só aceita conexões da API". A partir do momento em que uma política seleciona um pod, tudo o que não for explicitamente permitido para ele é bloqueado. Um detalhe que pega muita gente: a NetworkPolicy só funciona se o plugin de rede a implementar. Calico e Cilium implementam; o Flannel puro não, e as políticas são aceitas pela API e simplesmente ignoradas.

## Storage: dados que sobrevivem ao pod

Como no container avulso, o sistema de arquivos de um container no pod é descartável. Para dados que precisam durar, existem os volumes.

1. **emptyDir:** um diretório vazio criado junto com o pod e apagado junto com ele. Serve para compartilhar arquivos entre containers do mesmo pod ou como área temporária. Pode morar em memória.
2. **hostPath:** monta um diretório do próprio nó, como um bind mount. Útil para agentes de infraestrutura, perigoso para aplicações (o pod fica preso àquele nó e ganha acesso ao sistema de arquivos dele).
3. **configMap, secret, projected:** expõem configuração como arquivos.
4. **Volumes persistentes:** o caso interessante, descrito a seguir.

### PV, PVC e StorageClass

O Kubernetes separa quem precisa de disco de quem fornece disco:

1. **PersistentVolume (PV):** um pedaço real de armazenamento no cluster: um disco EBS, um volume Ceph, um compartilhamento NFS. É o apartamento disponível no mercado.
2. **PersistentVolumeClaim (PVC):** o pedido de uma aplicação. "Preciso de 20 GB, com acesso de leitura e escrita por um nó, da classe rápida." É o contrato de aluguel.
3. **StorageClass:** o tipo de armazenamento e quem sabe criar esse armazenamento. Com ela, existe o **provisionamento dinâmico**: quando um PVC é criado, o provisionador cria o disco real e o PV correspondente sozinho.

Quem fala com o sistema de armazenamento de verdade é o driver **CSI**, a interface padrão que deixa qualquer fabricante ou nuvem plugar seu storage no Kubernetes. Repare no padrão que se repete: **CRI** para runtime, **CNI** para rede, **CSI** para storage. O Kubernetes define a interface e deixa o resto do ecossistema implementar.

### Modos de acesso e outros detalhes

1. **ReadWriteOnce (RWO):** montado para leitura e escrita por um único nó por vez. É o caso dos discos de bloco, e o mais comum.
2. **ReadOnlyMany (ROX):** leitura por muitos nós.
3. **ReadWriteMany (RWX):** leitura e escrita por muitos nós ao mesmo tempo. Exige um sistema de arquivos em rede (NFS, EFS, CephFS). Disco de bloco não faz isso, pela mesma razão que vimos no artigo de armazenamento: dois filesystems montando o mesmo bloco ao mesmo tempo corrompem tudo.
4. **ReadWriteOncePod (RWOP):** um único pod no cluster inteiro.

Mais três detalhes: a **reclaim policy** decide se o disco é apagado (Delete) ou preservado (Retain) quando o PVC é removido, e confundir as duas já apagou muito banco de dados. O **volumeBindingMode WaitForFirstConsumer** faz o disco só ser criado depois que o pod é agendado, na mesma zona do nó; sem isso, o disco pode nascer numa zona e o pod ser agendado em outra, onde ele não consegue montar. E nos StatefulSets, os **volumeClaimTemplates** criam um PVC por réplica, que continua existindo mesmo se o StatefulSet for reduzido, para os dados não sumirem.

## Configuração: ConfigMaps e Secrets

1. **ConfigMap:** pares de chave e valor ou arquivos inteiros de configuração, injetados no pod como variáveis de ambiente ou montados como arquivos.
2. **Secret:** a mesma coisa, para dados sensíveis: senhas, tokens, certificados.

A pegadinha mais famosa: o conteúdo de um Secret é **codificado em base64, não criptografado**. Base64 é só uma forma de representar bytes em texto; qualquer um que consiga ler o objeto lê o segredo. A proteção real vem de três lugares: o **RBAC** (quem pode ler Secrets), a **criptografia em repouso** no etcd (configurada no API server, de preferência com chaves num serviço de gerenciamento de chaves) e o cuidado de não versionar Secrets em texto puro no Git. Para isso, existem ferramentas como o External Secrets Operator (que sincroniza segredos de um cofre externo como Vault ou o gerenciador de segredos da nuvem), o Sealed Secrets e o SOPS.

Uma diferença prática entre as duas formas de injeção: variáveis de ambiente são lidas uma vez, quando o container inicia, e mudar o ConfigMap não muda nada até o pod ser recriado. Arquivos montados são atualizados no pod depois de algum tempo (exceto quando montados com subPath), mas a aplicação precisa perceber e reler. Muitas equipes simplesmente colocam um hash da configuração numa anotação do Deployment, para que qualquer mudança provoque um rollout.

## Namespaces, rótulos e anotações

**Namespaces** do Kubernetes dividem o cluster em espaços lógicos: um por equipe, por ambiente ou por aplicação. Cuidado com o nome repetido: eles **não têm nada a ver com os namespaces do kernel** da primeira parte. São só pastas na API. Nomes de recursos são únicos dentro de um namespace, e RBAC, cotas (ResourceQuota) e valores padrão de recursos (LimitRange) se aplicam por namespace. Sem NetworkPolicy, pods de namespaces diferentes conversam livremente; sem RBAC bem feito, quem tem acesso a um namespace pode ter acesso a outro.

**Rótulos** (labels) são pares de chave e valor que identificam recursos: app igual a pagamentos, ambiente igual a produção, versão igual a 2.3. Eles são a cola do Kubernetes: Services encontram pods por rótulos, Deployments controlam ReplicaSets por rótulos, NetworkPolicies selecionam pods por rótulos. Um erro de digitação num seletor é um Service sem nenhum endpoint, e um dos primeiros lugares para olhar quando "o Service não responde".

**Anotações** (annotations) também são chave e valor, mas para metadados que não servem para seleção: configuração de ferramentas, quem é o dono, link para o runbook.

## Controle de acesso e segurança do cluster

### Autenticação e RBAC

O Kubernetes não tem cadastro de usuários. Pessoas são autenticadas por algo externo (certificados, um provedor de identidade via OIDC, a integração com o IAM da nuvem). Processos dentro do cluster usam **ServiceAccounts**: cada pod roda com uma, e recebe automaticamente um token de curta duração, renovado sozinho, para falar com a API.

A autorização é feita pelo **RBAC**, com quatro objetos:

1. **Role:** um conjunto de permissões (quais verbos, como get, list, create e delete, em quais recursos) dentro de um namespace.
2. **ClusterRole:** a mesma coisa, para o cluster inteiro ou para recursos sem namespace (como nós).
3. **RoleBinding:** liga uma Role (ou ClusterRole) a usuários, grupos ou ServiceAccounts, dentro de um namespace.
4. **ClusterRoleBinding:** liga no cluster inteiro.

Permissões são só aditivas: não existe "negar". O princípio do menor privilégio vale com força aqui, porque algumas permissões são muito mais poderosas do que parecem: poder criar pods num namespace equivale, na prática, a poder ler todos os Secrets que aqueles pods conseguem montar e usar as ServiceAccounts de lá. É o mesmo raciocínio do socket do Docker: quem pode criar containers com as opções erradas pode virar root no nó. O comando kubectl auth can i responde se uma identidade pode fazer algo, e é a primeira ferramenta para auditar.

### Endurecendo os pods

O **securityContext** de pods e containers define como eles rodam, e alguns ajustes deveriam ser padrão em quase toda aplicação: rodar como usuário não root (runAsNonRoot), sistema de arquivos raiz somente leitura (readOnlyRootFilesystem), sem possibilidade de ganhar privilégios (allowPrivilegeEscalation falso), descartar todas as capabilities do Linux e adicionar só as necessárias, e usar o perfil seccomp padrão do runtime. São exatamente os cadeados da primeira parte, configurados pela API. Pods privilegiados, com acesso ao namespace de rede ou de PIDs do nó, ou montando o sistema de arquivos do nó, quebram o isolamento e devem ser exceção bem justificada, normalmente só para agentes de infraestrutura.

Os pods também podem rodar com **user namespaces** (a opção hostUsers falso), a mesma ideia do rootless do Podman trazida para o cluster: o root de dentro do container vira um UID sem privilégio no nó. Isso reduz muito o impacto de uma fuga de container.

Para garantir tudo isso em escala, o Kubernetes tem os **Pod Security Standards**, três níveis (privileged, baseline e restricted), aplicados por namespace por um controle de admissão embutido, o Pod Security Admission, configurado com rótulos no namespace.

### Controles de admissão

Entre a autenticação e a gravação no etcd, toda requisição passa pelos **admission controllers**. Os **mutantes** podem alterar o objeto (injetar um sidecar, adicionar rótulos, definir valores padrão); os **validadores** podem recusar ("imagens só do registro da empresa", "todo Deployment precisa de requests", "nada de tag latest", "só imagens assinadas"). Além dos embutidos, dá para plugar webhooks próprios ou usar ferramentas de política como Kyverno e OPA Gatekeeper, e o **ValidatingAdmissionPolicy**, estável, permite escrever regras de validação na linguagem CEL direto na API, sem webhook. A versão mutante, o MutatingAdmissionPolicy, segue o mesmo caminho.

## Escalando automaticamente

Existem três dimensões de autoscaling, e elas se complementam:

1. **HPA (Horizontal Pod Autoscaler):** aumenta e diminui o número de réplicas de um Deployment ou StatefulSet com base em métricas: CPU e memória (relativas ao request, por isso request mal definido gera autoscaling maluco), ou métricas customizadas e externas, como requisições por segundo ou tamanho de uma fila. Depende do metrics server, ou de um adaptador para métricas customizadas. Na 1.37, a API de métricas finalmente virou estável e a redução do HPA até zero réplicas chegou a beta.
2. **VPA (Vertical Pod Autoscaler):** observa o consumo real e recomenda ou ajusta os requests e limits de cada container. Com o redimensionamento no lugar estável, ele pode ajustar pods sem recriá-los. Combinar VPA e HPA na mesma métrica (CPU nos dois, por exemplo) faz os dois brigarem.
3. **Escalonamento de nós:** quando pods ficam em Pending por falta de espaço, algo precisa criar nós novos. O **Cluster Autoscaler** aumenta e diminui grupos de nós pré definidos. O **Karpenter** escolhe e cria diretamente o tipo de máquina mais adequado para os pods pendentes, geralmente mais rápido e mais barato.

O **KEDA** completa o quadro para cargas orientadas a eventos: escala com base em dezenas de fontes (tamanho de fila no RabbitMQ ou SQS, lag de consumidor no Kafka, consultas no Prometheus) e consegue reduzir até zero réplicas quando não há trabalho.

Uma lembrança vinda dos artigos anteriores: autoscaling reage em segundos ou minutos. Puxar imagem, subir a aplicação, passar a readiness e, se precisar de nó novo, criar a máquina, tudo isso leva tempo. É aqui que uma imagem pequena da primeira parte paga dividendos. Picos instantâneos precisam de folga já provisionada.

## Deploy: atualizando sem derrubar

### Rolling update

A estratégia padrão do Deployment é a **atualização gradual**: cria pods da versão nova e remove os da antiga aos poucos. Dois parâmetros controlam o ritmo: **maxSurge** (quantos pods a mais que o desejado podem existir durante a troca) e **maxUnavailable** (quantos podem estar indisponíveis). Com maxUnavailable zero e maxSurge um, o Kubernetes sobe um pod novo, espera ele passar a readiness, remove um antigo, e repete. Isso só é seguro se a readiness for honesta: uma readiness que passa antes da aplicação estar pronta faz o rollout trocar pods bons por pods quebrados com toda a calma do mundo.

O Deployment guarda o histórico de ReplicaSets, e o **rollback** é só voltar para o anterior. A outra estratégia embutida, **Recreate**, mata todos os pods antigos antes de subir os novos, com indisponibilidade, útil quando duas versões não podem coexistir.

Estratégias mais sofisticadas, como **canary** (uma pequena porcentagem do tráfego para a versão nova, observando métricas antes de avançar) e **blue green** (duas versões completas, trocando o tráfego de uma vez), não vêm prontas no Deployment. São feitas com ferramentas como Argo Rollouts e Flagger, com a divisão de tráfego da Gateway API ou com um service mesh.

### PodDisruptionBudget

Nem toda interrupção vem de deploy. Atualizar nós, esvaziar um nó para manutenção (o kubectl drain) e o autoscaler removendo nós ociosos são **interrupções voluntárias**. O **PodDisruptionBudget** diz quantas réplicas de uma aplicação podem estar fora ao mesmo tempo por causa delas ("mínimo de duas disponíveis", ou "no máximo uma indisponível"). Sem PDB, um upgrade de cluster pode esvaziar ao mesmo tempo os nós de todas as réplicas de um serviço. Com um PDB rígido demais (mínimo disponível igual ao total de réplicas), o drain trava para sempre. O PDB não protege contra interrupções involuntárias, como a queda de um nó; para isso, servem as réplicas espalhadas por nós e zonas.

### Empacotando e entregando

Escrever YAML na mão para cada ambiente não escala. As ferramentas mais usadas:

1. **Helm:** pacotes (charts) com templates e valores, distribuídos inclusive como artefatos OCI nos mesmos registros das imagens. Bom para distribuir software de terceiros e para parametrizar muito. O preço é YAML gerado por templates, que fica difícil de ler.
2. **Kustomize:** sem templates. Uma base de YAML puro e camadas de ajustes por ambiente. Já vem embutido no kubectl.
3. **GitOps (Argo CD, Flux):** o estado desejado do cluster mora num repositório Git, e um agente dentro do cluster reconcilia continuamente o cluster com o repositório. É a ideia de reconciliação do próprio Kubernetes, aplicada um nível acima: o Git vira a fonte da verdade, todo deploy é um commit, todo rollback é um revert, e qualquer mudança feita na mão é detectada e desfeita.

## Extensibilidade: CRDs e operators

A API do Kubernetes pode ser estendida com tipos novos, os **CustomResourceDefinitions** (CRDs). Depois de criar um CRD chamado, digamos, PostgresCluster, você pode aplicar objetos desse tipo como aplica um Deployment, com kubectl, RBAC e tudo mais.

Sozinho, um CRD é só um formulário guardado no etcd. Quem dá vida a ele é um **controller** próprio, que observa esses objetos e reconcilia o mundo real com eles. O par CRD mais controller com conhecimento operacional embutido é o que se chama de **operator**. Um operator de banco de dados sabe criar o primário e as réplicas, configurar a replicação, fazer backup, promover uma réplica quando o primário cai e atualizar a versão na ordem certa: o conhecimento de um administrador experiente transformado em código, rodando o tempo todo. Cert manager, Prometheus Operator, Strimzi (Kafka) e CloudNativePG (PostgreSQL) são exemplos conhecidos. Construir operators com ferramentas como Kubebuilder e o Operator SDK é um caminho natural para quem já entendeu reconciliação.

Essa extensibilidade é o motivo de o Kubernetes ter virado mais que um orquestrador de containers: é uma plataforma para construir plataformas, com uma API comum para gerenciar quase qualquer coisa, inclusive recursos fora do cluster, como bancos gerenciados e buckets na nuvem.

## Operando o cluster

### Para onde rodar Kubernetes

1. **Gerenciado na nuvem** (EKS, GKE, AKS e similares): o provedor cuida do control plane e do etcd. É o padrão para produção, e um dos melhores motivos para usar nuvem.
2. **Instalado por conta própria** com kubeadm, ou com distribuições como RKE2, Talos e OpenShift (a distribuição da Red Hat, que usa CRI O e tem a mesma família de ferramentas do Podman).
3. **Leve, para borda e laboratório:** k3s e k0s, binários únicos que rodam até num Raspberry Pi.
4. **Local, para desenvolvimento:** kind (Kubernetes rodando dentro de containers Docker ou Podman), minikube, ou o Kubernetes embutido do Docker Desktop e do Podman Desktop.

### etcd e o control plane

O etcd é a peça mais sensível. Ele gosta de disco com baixa latência de fsync (ele chama fsync em cada gravação, lembra do artigo de armazenamento?), de rede estável entre os membros e de número ímpar de membros. Backup do etcd (um snapshot periódico) é o seguro de vida do cluster.

### Versões e upgrades

O Kubernetes lança três versões por ano, e cada uma tem suporte da comunidade por cerca de catorze meses. A atual é a **1.37**, lançada em agosto de 2026, com a 1.38 prevista para dezembro. Ficar parado não é opção. Existem regras de compatibilidade de versões entre componentes: o kubelet pode estar algumas versões atrás do API server, nunca à frente. O upgrade segue a ordem control plane primeiro, depois nós. E a cada versão, APIs antigas podem ser removidas: manifestos usando versões de API depreciadas param de ser aceitos, o que já quebrou muito pipeline. Ferramentas que procuram APIs depreciadas nos manifestos antes do upgrade economizam sustos. Nos últimos ciclos, a remoção do suporte a cgroup v1 foi a mudança que mais pegou gente desprevenida: nó com sistema operacional antigo simplesmente deixa de subir o kubelet.

## Diagnóstico: o kit de bancada

### Na máquina, com Docker ou Podman

1. **ps** com a opção a: todos os containers, inclusive os parados, com o status e o código de saída.
2. **logs**: a saída padrão do container, também dos que já morreram.
3. **inspect**: tudo sobre um container ou imagem, incluindo IP, montagens, variáveis, o comando real e o motivo da última saída (OOMKilled aparece aqui).
4. **exec**: entrar num container em execução.
5. **stats**: consumo de CPU, memória e rede ao vivo.
6. **events**: o histórico do que o runtime fez.
7. Do lado do host, o container é um processo: **ps**, **top**, **nsenter** (entrar nos namespaces de um processo com as ferramentas do host) e os arquivos do cgroup contam o resto.

### No cluster, com kubectl

1. **kubectl get pods** com a opção de mostrar mais colunas: estado, reinícios, nó, IP.
2. **kubectl describe** no pod: a seção de eventos no final conta quase toda história (falha de agendamento, falha ao puxar imagem, probe falhando, OOMKilled).
3. **kubectl logs**, e com a opção previous para ver os logs da execução que morreu, essencial no CrashLoopBackOff.
4. **kubectl get events** no namespace, ordenado por tempo.
5. **kubectl exec** para entrar no container, ou **kubectl debug** para anexar um container efêmero com ferramentas de diagnóstico a um pod cuja imagem distroless não tem nem shell.
6. **kubectl top** para consumo de CPU e memória por pod e por nó.
7. **kubectl get endpointslices** de um Service, para saber se ele tem algum pod por trás.
8. **crictl** no próprio nó, para conversar direto com o containerd ou o CRI O quando o problema está abaixo do Kubernetes.

E o dicionário dos estados mais comuns:

1. **Pending:** o pod não foi agendado. O describe mostra o porquê: falta de CPU ou memória considerando os requests, nenhum nó tolerando os taints, afinidade impossível, PVC esperando volume em outra zona.
2. **ImagePullBackOff ou ErrImagePull:** não conseguiu baixar a imagem. Nome ou tag errados, registro privado sem credencial (imagePullSecrets), limite de downloads do registro, ou arquitetura errada (a imagem só existe para amd64 e o nó é arm64: falta o índice multiarquitetura).
3. **CrashLoopBackOff:** o container sobe e morre repetidamente. Veja os logs da execução anterior e o código de saída: 1 costuma ser erro da aplicação, 137 é SIGKILL (OOM ou estouro do prazo de encerramento), 139 é segmentation fault.
4. **OOMKilled:** passou do limit de memória. Aumentar o limit, investigar vazamento, ou ajustar a aplicação ao limite do container.
5. **CreateContainerConfigError:** referência a um ConfigMap ou Secret que não existe, ou a uma chave que não existe nele.
6. **Running, mas sem receber tráfego:** readiness falhando, seletor do Service que não combina com os rótulos do pod, porta do Service apontando para a porta errada do container, ou NetworkPolicy bloqueando.
7. **Evicted:** o nó ficou sem memória ou disco e o kubelet despejou o pod. Frequentemente é log ou camada gravável enchendo o disco do nó.
8. **Terminating para sempre:** um finalizer pendurado (algum controller precisava fazer limpeza e não fez) ou um nó que sumiu sem avisar.

Para problemas de rede, um pod de diagnóstico com ferramentas como dig, curl e tcpdump, rodando no mesmo namespace, testa DNS, Services e políticas do ponto de vista de quem está dentro do cluster. Grande parte dos mistérios de "não conecta" se resolve com três perguntas: o nome resolve? O Service tem endpoints? Alguma política bloqueia?

## Amarrando tudo: um mapa mental

1. **Container:** um processo com namespaces (o que vê), cgroups (quanto usa), raiz em overlayfs (o que encontra no disco) e permissões reduzidas por capabilities, seccomp e LSMs. Compartilha o kernel; não é VM.
2. **Imagem:** camadas, configuração e manifesto endereçados por digest, no padrão OCI. Tag é apelido móvel; digest é identidade. Multi stage, base mínima, usuário não root e nada de segredo em camada.
3. **Runtimes:** runc ou crun criam o processo; containerd ou CRI O gerenciam imagens e ciclo de vida; shim ou conmon ficam de pai.
4. **Docker:** CLI conversando com um daemon root, que delega ao containerd. Socket do Docker é root. Compose para várias peças numa máquina.
5. **Podman:** sem daemon, rootless por padrão via user namespaces e pasta, pods nativos, YAML do Kubernetes e Quadlet com systemd.
6. **Orquestração:** você declara o estado desejado, controllers reconciliam para sempre. Tudo passa pelo API server, tudo é guardado no etcd. O scheduler escolhe o nó pelos requests; o kubelet executa via CRI.
7. **Workloads e saúde:** Deployment, StatefulSet, DaemonSet, Job e CronJob; startup, readiness e liveness com consequências diferentes; SIGTERM, preStop e prazo de encerramento.
8. **Recursos:** request decide agendamento e fatia de CPU; limit de CPU causa throttling, limit de memória causa OOMKilled; QoS decide quem é despejado; redimensionamento no lugar evita recriar pods.
9. **Rede e dados:** IP por pod via CNI; Services estáveis; CoreDNS; Gateway API para entrada; NetworkPolicy para fechar o padrão aberto. PVC pede, StorageClass e CSI provisionam.
10. **Segurança, elasticidade e extensão:** RBAC com menor privilégio, Secrets que não são criptografados por padrão, securityContext e Pod Security Standards; HPA, VPA, Karpenter e KEDA; rolling update, PDB e GitOps; CRDs e operators levando a reconciliação para qualquer coisa.

## Vinte e cinco perguntas pra se testar

1. **Qual a diferença entre um container e uma máquina virtual?** A VM emula hardware e roda um kernel próprio; o container é um processo do host isolado por namespaces e limitado por cgroups, compartilhando o kernel. Container é mais leve e rápido, VM isola mais.

2. **Quais recursos do kernel formam um container?** Namespaces para o isolamento da visão, cgroups para os limites de recursos, um sistema de arquivos em camadas (overlayfs) para a raiz, e capabilities, seccomp e SELinux ou AppArmor para reduzir permissões.

3. **Por que o que o container grava some quando ele é removido?** Porque fica na camada gravável do overlayfs, que pertence ao container. Dados persistentes vão em volumes ou bind mounts.

4. **Qual a diferença entre tag e digest?** A tag é um apelido que pode ser movido para outra imagem a qualquer momento; o digest é o hash do conteúdo e identifica uma imagem de forma imutável.

5. **Apaguei um segredo num passo posterior do Dockerfile. Ele saiu da imagem?** Não. Ele continua na camada onde foi criado, e qualquer um que baixar a imagem consegue extraí-lo. Segredos de build usam montagens de segredo, que não ficam em camada.

6. **O que é a OCI e por que ela importa?** É o conjunto de padrões abertos de imagem, runtime e distribuição. Por causa dela, uma imagem construída com Docker roda no Podman, no containerd, no CRI O e em qualquer Kubernetes.

7. **Qual a diferença entre runc e containerd?** O runc é o runtime de baixo nível: cria o processo com namespaces e cgroups e sai. O containerd é o de alto nível: baixa e guarda imagens, gerencia o ciclo de vida e expõe uma API.

8. **Por que colocar alguém no grupo docker é dar root a essa pessoa?** Porque o grupo dá acesso ao socket do daemon, que roda como root, e qualquer um que fale com ele pode iniciar um container privilegiado montando o disco do host.

9. **Qual a principal diferença arquitetural entre Docker e Podman?** O Docker tem um daemon central, normalmente root, que cria os containers; o Podman não tem daemon, o próprio comando cria o container e sai, e o padrão é rootless.

10. **Como o Podman consegue ser root dentro do container sem ser root fora?** Com user namespaces: o UID 0 do container é mapeado para o UID do usuário no host, e os demais UIDs para uma faixa subordinada reservada em subuid e subgid.

11. **Publiquei uma porta e meu firewall não a bloqueou. Por quê?** Porque o Docker insere regras de NAT e de encaminhamento antes das regras do firewall do sistema. Para expor só localmente, publique no endereço de loopback.

12. **Por que meu container leva dez segundos (ou trinta, no Kubernetes) para parar?** Porque o processo principal é o PID 1 e não trata SIGTERM, ou roda atrás de um shell que não repassa sinais. O runtime espera o prazo e manda SIGKILL. Use a forma exec do comando, trate o sinal ou use um init mínimo.

13. **O Kubernetes deixou de suportar imagens Docker?** Não. Ele removeu o dockershim, ou seja, deixou de usar o Docker como runtime nos nós. As imagens são OCI e continuam rodando no containerd ou no CRI O.

14. **Apaguei um pod e ele voltou. Por quê?** Porque ele pertence a um ReplicaSet de um Deployment, que quer um número fixo de réplicas. O controller viu uma a menos e criou outra. Para reduzir, mude o número de réplicas.

15. **Qual a diferença entre liveness e readiness?** Liveness falhando faz o kubelet reiniciar o container. Readiness falhando tira o pod dos endpoints dos Services, sem reiniciar. A liveness não deve depender de serviços externos.

16. **O que significa CrashLoopBackOff?** Que o container está morrendo repetidamente e o kubelet está esperando cada vez mais entre as tentativas, até cinco minutos. A causa está nos logs da execução anterior e no código de saída.

17. **Qual a diferença entre request e limit?** Request é o mínimo garantido, usado pelo scheduler para encaixar o pod e pelo cgroup para dividir CPU sob disputa. Limit é o teto: em CPU causa throttling, em memória causa OOMKilled.

18. **Qual a diferença entre OOMKilled e Evicted?** OOMKilled é o kernel matando um processo que passou do limit de memória do cgroup. Evicted é o kubelet despejando pods porque o nó inteiro ficou com pouca memória ou disco.

19. **Por que o deploy gera erros 502 por alguns segundos?** Porque a retirada do pod dos endpoints e o SIGTERM acontecem ao mesmo tempo, e a retirada leva segundos para chegar a todos os proxies. Um preStop que espera alguns segundos e uma aplicação que termina as requisições em andamento resolvem.

20. **O que é um ClusterIP e por que o ping nele não funciona?** É um IP virtual que não existe em nenhuma interface, só em regras que reescrevem o destino para um pod nas portas do Service. Não há nada para responder ao ping, mas a conexão TCP na porta funciona.

21. **O Service existe, mas não responde. O que verificar?** Se ele tem endpoints. Sem endpoints, o seletor não combina com os rótulos dos pods ou os pods não passam a readiness. Com endpoints, confira a porta de destino e as NetworkPolicies.

22. **Secrets do Kubernetes são seguros?** Por padrão, só codificados em base64, que não é criptografia. A segurança vem de RBAC restritivo, criptografia em repouso no etcd e de não guardar Secrets em texto puro no Git.

23. **Por que migrar do Ingress para a Gateway API?** Porque a Gateway API é a sucessora oficial, separa responsabilidades entre plataforma e aplicação e tem recursos sem anotações proprietárias, e porque o ingress nginx da comunidade foi aposentado em março de 2026, sem mais correções de segurança.

24. **O que é um operator?** Um CRD mais um controller que reconcilia esse tipo novo de recurso com o mundo real, embutindo conhecimento operacional: criar, replicar, fazer backup, recuperar de falhas e atualizar um sistema complexo como um banco de dados.

25. **O que acontece com os pods se o control plane cair?** Os pods que já estão rodando continuam rodando, e o tráfego continua fluindo pelas regras que já estão nos nós. O que para é tudo que depende de decisão: agendamentos novos, recriação de pods que morrerem, autoscaling, deploys e mudanças de endpoints. O control plane decide; os nós executam.

## Nota

Esta é a quarta revisão da trilha, depois de [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/), [redes](/2026/10/26/revisao-redes-de-computadores/) e [sistemas operacionais](/2026/10/26/revisao-fundamentos-de-sistemas-operacionais/), e é a que mais depende das outras três: um container é uma combinação de peças do Linux, e o Kubernetes é essa combinação multiplicada por centenas de máquinas, com uma API declarativa por cima. Esse ecossistema muda rápido no detalhe (o Kubernetes lança três versões por ano, e Docker e Podman mudaram peças importantes só no último ano), então, se algo aqui envelhecer, aceito correções de bom grado.
