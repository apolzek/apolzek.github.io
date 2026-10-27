---
title: "Revisão: fundamentos de Kubernetes"
slug: "revisao-fundamentos-de-kubernetes"
date: '2026-10-26T16:00:00-03:00'
draft: false
description: "Uma revisão de Kubernetes por dentro: control plane, reconciliação, pods, workloads, probes, escalonamento, requests e limits, rede, Services, DNS, Ingress e Gateway API, storage, configuração, RBAC, autoscaling, deploy, operators e diagnóstico, em linguagem informal e com analogias."
tags:
- kubernetes
minute: 40
---

Esta revisão fecha a trilha que começou com [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/), [redes](/2026/10/26/revisao-redes-de-computadores/) e [sistemas operacionais](/2026/10/26/revisao-fundamentos-de-sistemas-operacionais/). Kubernetes é o lugar onde tudo aquilo se encontra: namespaces e cgroups viram pods, iptables e DNS viram Services, discos viram volumes persistentes, e sinais do Unix decidem se o seu deploy derruba requisições ou não. Quem leu os três anteriores vai reconhecer muita coisa. Quem não leu vai ver vários links para lá.

## O problema que Kubernetes resolve

Containers resolveram o "na minha máquina funciona": a aplicação vai empacotada com tudo de que precisa. Mas um container sozinho numa máquina não é um sistema. Quando você tem duzentos containers espalhados por trinta máquinas, as perguntas mudam: em qual máquina cada um roda? O que acontece quando uma máquina morre? Como um container encontra o outro se os IPs mudam toda hora? Como atualizar a versão sem derrubar o serviço? Quem reinicia o que travou?

Kubernetes é a resposta para essas perguntas. É o maestro de uma orquestra: não toca nenhum instrumento, mas sabe quem deve estar tocando, onde, e percebe na hora quando um músico some. Você não diz "rode este container naquela máquina"; você diz "quero três cópias deste serviço sempre rodando", e ele se vira para que isso seja verdade, agora e daqui a seis meses.

## A ideia central: estado desejado e reconciliação

Se você entender uma coisa só deste texto, que seja esta. Kubernetes é **declarativo**. Você não dá ordens ("inicie, pare, mova"); você descreve o estado que quer ("três réplicas desta imagem, com 512 MB de memória cada, atrás deste endereço"). Esse desejo é gravado num banco de dados. Depois, dezenas de **controllers** rodam um loop infinito, cada um cuidando de um tipo de coisa:

1. Olha o estado desejado.
2. Olha o estado real.
3. Se forem diferentes, age para aproximar os dois.
4. Volta para o passo 1.

É o termostato do ar condicionado. Você não liga e desliga o compressor; você diz "quero 22 graus", e o termostato fica medindo e corrigindo para sempre. Se alguém abrir a janela, ele trabalha mais. Se um pod morrer, o controller percebe que existem duas réplicas onde deveriam existir três e cria outra. Ninguém precisou "tratar o evento da morte do pod": a diferença entre desejo e realidade é o próprio gatilho.

Essa ideia explica muito comportamento que parece estranho no começo. Apagar um pod de um Deployment não adianta, porque outro aparece no lugar: o desejo continua sendo três. Editar algo na mão num recurso gerenciado por outra ferramenta é desfeito minutos depois, porque alguém reconcilia de volta para o que está declarado. Para mudar o resultado, é preciso mudar o desejo.

## Arquitetura: o control plane e os nós

Um cluster tem duas metades: o **control plane**, que decide, e os **nós** (nodes), que executam.

### Control plane

1. **API server:** a porta de entrada de tudo. Todo comando do kubectl, todo controller, todo kubelet conversa com o cluster por essa API REST. Ele autentica, autoriza, valida, passa pelos controles de admissão e grava no etcd. Nenhum outro componente fala com o etcd diretamente. É o único balcão do cartório.
2. **etcd:** o banco de dados chave e valor onde mora todo o estado do cluster: cada pod, cada Service, cada Secret. É distribuído e usa o algoritmo de consenso Raft, o que exige maioria (quórum) para gravar: com três membros, aguenta perder um; com cinco, aguenta perder dois. Perder o etcd sem backup é perder o cluster, no sentido mais literal possível.
3. **Scheduler:** olha os pods que ainda não têm nó definido e escolhe onde cada um vai rodar. Primeiro filtra os nós que servem (têm recurso livre, respeitam as restrições), depois pontua os que sobraram e escolhe o melhor. Ele só decide; quem executa é o nó.
4. **Controller manager:** um processo que roda dezenas de controllers embutidos: o de Deployments, o de ReplicaSets, o de nós (que percebe quando um nó para de responder), o de Jobs, o de endpoints, e assim por diante.
5. **Cloud controller manager:** a ponte com o provedor de nuvem. Cria balanceadores quando você pede um Service do tipo LoadBalancer, descobre quando uma máquina virtual foi apagada, configura rotas.

### Nós

1. **kubelet:** o agente em cada nó. Observa a API, vê quais pods foram atribuídos ao seu nó e garante que eles estejam rodando, conversando com o runtime de containers. Também executa as probes, monta volumes e reporta o estado do nó e dos pods.
2. **Container runtime:** quem de fato cria os containers, através da interface padrão **CRI**. Hoje é quase sempre o **containerd** ou o **CRI O**. O Docker como runtime direto saiu na versão 1.24 (a famosa remoção do dockershim), mas imagens construídas com Docker continuam funcionando normalmente, porque o formato de imagem é um padrão aberto.
3. **kube proxy:** implementa os Services em cada nó, programando regras de iptables, IPVS ou nftables para que o tráfego destinado ao IP virtual de um Service chegue a algum pod de verdade. Algumas soluções de rede, como o Cilium, substituem o kube proxy por programas eBPF.

### Seguindo um deploy de ponta a ponta

Quando você aplica um Deployment com três réplicas, a sequência é esta:

1. O kubectl envia o objeto ao API server, que autentica, autoriza, valida e grava no etcd.
2. O controller de Deployments percebe o Deployment novo e cria um ReplicaSet.
3. O controller de ReplicaSets percebe que o ReplicaSet quer três pods e existem zero, e cria três objetos Pod, ainda sem nó.
4. O scheduler percebe pods sem nó, escolhe um nó para cada e grava a decisão.
5. O kubelet de cada nó escolhido percebe que ganhou um pod, puxa a imagem, prepara a rede e os volumes e pede ao runtime para iniciar os containers.
6. As probes começam a rodar. Quando a readiness passa, o pod entra nos endpoints do Service e começa a receber tráfego.

Repare que ninguém chamou ninguém diretamente. Cada componente só observa a API e reage. Isso torna o sistema resistente: se o scheduler ficar fora por um minuto, os pods esperam em Pending e são agendados quando ele voltar. Nada se perde, porque o desejo está gravado.

## Pods: a menor unidade

O Kubernetes não agenda containers, agenda **pods**. Um pod é um grupo de um ou mais containers que sempre rodam juntos, no mesmo nó, compartilhando o mesmo namespace de rede (mesmo IP, mesmo localhost, mesmas portas) e podendo compartilhar volumes. Se containers são pessoas, o pod é o apartamento: quem mora junto divide o endereço e a cozinha.

No Linux, isso é exatamente o que vimos no artigo de sistemas operacionais. Cada pod tem um container mínimo, o **pause**, que só existe para segurar os namespaces de rede e IPC. Os containers da aplicação entram nesses namespaces. Cada container tem o seu próprio cgroup, todos debaixo do cgroup do pod.

A regra prática é **um processo principal por pod**. Coloque containers juntos no mesmo pod só quando eles precisam realmente compartilhar ciclo de vida, rede ou disco.

### Init containers e sidecars

1. **Init containers** rodam antes dos containers principais, um por vez, e cada um precisa terminar com sucesso antes do próximo. Servem para preparar o terreno: esperar uma dependência, baixar uma configuração, aplicar uma migração, ajustar permissões de um volume.
2. **Sidecars** são containers auxiliares que rodam ao lado do principal durante toda a vida do pod: um proxy de service mesh, um agente que envia logs, um processo que renova certificados. Por anos, eram só "mais um container", o que causava problemas de ordem (o sidecar terminando antes da aplicação, ou um Job que nunca acabava porque o sidecar continuava vivo). Desde as versões recentes, existe o **sidecar nativo**: um init container com política de reinício Always, que sobe antes da aplicação, continua rodando junto e só é encerrado depois dela.

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

O kubelet pode verificar a saúde de cada container de três formas, com uma requisição HTTP, uma conexão TCP ou um comando executado dentro do container. E existem três tipos de verificação, cada um com uma consequência diferente:

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

Dois problemas clássicos moram aqui. O primeiro é o que vimos no artigo de sistemas operacionais: se a aplicação roda como PID 1 e não trata SIGTERM, o sinal é ignorado, e ela só morre no SIGKILL, trinta segundos depois, sem limpar nada. O código de saída 137 nos eventos denuncia.

O segundo é uma condição de corrida: a retirada dos endpoints e o SIGTERM acontecem ao mesmo tempo, mas a retirada precisa se propagar até o kube proxy de cada nó, os balanceadores e os proxies de ingress, o que leva alguns segundos. Se a aplicação para de aceitar conexões imediatamente ao receber o SIGTERM, ainda chegam requisições por esses segundos, que encontram a porta fechada e viram erro 502. A solução padrão é um preStop que espera alguns segundos antes de deixar o SIGTERM chegar, e uma aplicação que, ao receber o sinal, termina as requisições em andamento antes de sair.

## Escalonamento: onde cada pod vai morar

### Requests e limits

Cada container pode declarar dois números para CPU e para memória:

1. **Request:** quanto o container precisa garantido. O scheduler usa só os requests para decidir onde o pod cabe: um nó com 4 CPUs aceita pods cujos requests somem até 4, independentemente do uso real. O request de CPU também vira o peso do cgroup (o cpu.weight), definindo a fatia de cada um quando há disputa.
2. **Limit:** o teto. Vira o cpu.max e o memory.max do cgroup.

E aqui a diferença entre CPU e memória é crucial, porque uma é comprimível e a outra não:

1. **Passar do limit de CPU** não mata ninguém: o container sofre **throttling**, ficando parado até o próximo período de 100 ms. O sintoma é latência alta e misteriosa com a máquina ociosa. Muita gente experiente recomenda definir request de CPU e não definir limit, deixando o container usar a sobra do nó.
2. **Passar do limit de memória** aciona o OOM killer dentro do cgroup, e o container morre com **OOMKilled** (código 137). Para memória, limit é altamente recomendado, e muita gente usa limit igual ao request.

CPU se mede em núcleos ou milicores: 500m é meio núcleo. Memória em bytes, com sufixos como Mi e Gi.

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

## Rede: o modelo do Kubernetes

O Kubernetes impõe um modelo de rede simples de enunciar:

1. Todo pod tem o seu próprio IP.
2. Todo pod consegue falar com qualquer outro pod pelo IP, sem NAT, em qualquer nó.
3. Os agentes de um nó (como o kubelet) conseguem falar com todos os pods daquele nó.

É uma rede plana, como se todos os pods estivessem no mesmo grande switch. Mas o Kubernetes não implementa isso sozinho: ele delega para um plugin de rede, através da interface **CNI**. Quando um pod é criado, o runtime chama o plugin, que cria o par de interfaces virtuais (um lado dentro do namespace de rede do pod, outro no nó), atribui um IP e programa as rotas. Plugins diferentes resolvem a comunicação entre nós de formas diferentes: com túneis de encapsulamento como VXLAN (Flannel, e o Calico em alguns modos), com roteamento puro via BGP (Calico), com eBPF (Cilium) ou usando a própria rede da nuvem, dando aos pods IPs da VPC (o plugin da AWS, por exemplo). Tudo o que vimos no artigo de redes sobre bridges, veth, rotas e encapsulamento aparece aqui.

### Services: um endereço estável para um alvo que se move

Pods morrem e renascem com IPs novos o tempo todo. Ninguém consegue configurar um cliente apontando para IP de pod. O **Service** resolve isso: é um nome e um IP virtual estáveis na frente de um conjunto de pods, escolhidos por um **seletor de rótulos**. Os pods que combinam com o seletor e estão prontos (passando a readiness) entram nos **EndpointSlices** do Service; o kube proxy de cada nó transforma isso em regras que distribuem o tráfego entre eles.

Os tipos:

1. **ClusterIP:** o padrão. Um IP virtual acessível só de dentro do cluster. Esse IP não pertence a nenhuma interface: ele só existe nas regras de iptables ou eBPF, que reescrevem o destino para o IP de um pod. Por isso dar ping num ClusterIP normalmente não funciona, mas conectar na porta funciona.
2. **NodePort:** além do ClusterIP, abre uma porta alta (de 30000 a 32767) em todos os nós. Tráfego que chega nessa porta em qualquer nó vai para o Service.
3. **LoadBalancer:** além do NodePort, pede ao provedor de nuvem um balanceador externo apontando para os nós. É o jeito mais direto de expor algo para a internet, e cada Service desses custa um balanceador.
4. **Headless** (ClusterIP None): sem IP virtual. O DNS devolve diretamente os IPs dos pods. Usado com StatefulSets, quando o cliente precisa falar com um pod específico (o primário do banco, um broker do Kafka).
5. **ExternalName:** só um apelido de DNS para um nome externo.

### DNS dentro do cluster

O cluster tem o seu próprio DNS, quase sempre o **CoreDNS**. Cada Service ganha um nome no formato servico.namespace.svc.cluster.local, e pods do mesmo namespace podem usar só o nome curto do Service. Pods de StatefulSet com Service headless ganham nomes individuais, como db 0 seguido do nome do Service.

Um detalhe que causa lentidão e custo escondido: por padrão, o arquivo de resolução dos pods vem com a opção **ndots 5** e uma lista de domínios de busca. Isso significa que um nome externo com menos de cinco pontos, como api.exemplo.com, é primeiro tentado com cada sufixo do cluster (api.exemplo.com.meu namespace.svc.cluster.local, e assim por diante) antes da consulta de verdade. Cada requisição a uma API externa pode virar quatro ou cinco consultas DNS falhadas antes da certa. Colocar o ponto final no nome (api.exemplo.com.), reduzir o ndots no pod ou usar um cache de DNS local no nó resolve.

### Ingress e Gateway API

Expor cada serviço com um balanceador próprio fica caro e desorganizado. O **Ingress** define regras HTTP de entrada (este domínio e este caminho vão para aquele Service), implementadas por um **ingress controller**, um proxy reverso rodando no cluster (nginx, Traefik, HAProxy, Envoy ou o balanceador da nuvem). Um único balanceador externo, muitas rotas internas, TLS terminado num lugar só.

O Ingress ficou limitado com o tempo: só HTTP, recursos importantes dependendo de anotações específicas de cada controller, e um único objeto misturando responsabilidades da equipe de plataforma e das equipes de aplicação. A **Gateway API** é a sucessora oficial: separa o **GatewayClass** (o tipo de implementação), o **Gateway** (o ponto de entrada, mantido pela plataforma) e as **rotas** (HTTPRoute, GRPCRoute e outras, mantidas por cada equipe), com divisão de tráfego por peso, roteamento por cabeçalho e suporte a outros protocolos sem anotações proprietárias. Projetos novos devem preferir a Gateway API; o próprio controller ingress nginx mantido pela comunidade do Kubernetes foi aposentado, o que empurrou muita gente nessa direção.

### NetworkPolicy

Por padrão, num cluster Kubernetes, **todo pod fala com todo pod**. Uma **NetworkPolicy** restringe isso por rótulos e namespaces: "só os pods do frontend podem falar com a API na porta 8080", "o banco só aceita conexões da API". A partir do momento em que uma política seleciona um pod, tudo o que não for explicitamente permitido para ele é bloqueado. Um detalhe que pega muita gente: a NetworkPolicy só funciona se o plugin de rede a implementar. Calico e Cilium implementam; o Flannel puro não, e as políticas são aceitas pela API e simplesmente ignoradas.

## Storage: dados que sobrevivem ao pod

O sistema de arquivos de um container é descartável: morreu o container, morreu o que ele gravou. Para dados que precisam durar, existem os volumes.

1. **emptyDir:** um diretório vazio criado junto com o pod e apagado junto com ele. Serve para compartilhar arquivos entre containers do mesmo pod ou como área temporária. Pode morar em memória.
2. **hostPath:** monta um diretório do próprio nó. Útil para agentes de infraestrutura, perigoso para aplicações (o pod fica preso àquele nó e ganha acesso ao sistema de arquivos dele).
3. **configMap, secret, projected:** expõem configuração como arquivos.
4. **Volumes persistentes:** o caso interessante, descrito a seguir.

### PV, PVC e StorageClass

O Kubernetes separa quem precisa de disco de quem fornece disco:

1. **PersistentVolume (PV):** um pedaço real de armazenamento no cluster: um disco EBS, um volume Ceph, um compartilhamento NFS. É o apartamento disponível no mercado.
2. **PersistentVolumeClaim (PVC):** o pedido de uma aplicação. "Preciso de 20 GB, com acesso de leitura e escrita por um nó, da classe rápida." É o contrato de aluguel.
3. **StorageClass:** o tipo de armazenamento e quem sabe criar esse armazenamento. Com ela, existe o **provisionamento dinâmico**: quando um PVC é criado, o provisionador cria o disco real e o PV correspondente sozinho, sem ninguém pré cadastrar nada.

Quem fala com o sistema de armazenamento de verdade é o driver **CSI**, a interface padrão que deixa qualquer fabricante ou nuvem plugar seu storage no Kubernetes.

### Modos de acesso e outros detalhes

1. **ReadWriteOnce (RWO):** montado para leitura e escrita por um único nó por vez. É o caso dos discos de bloco (EBS, discos persistentes do GCP), e o mais comum.
2. **ReadOnlyMany (ROX):** leitura por muitos nós.
3. **ReadWriteMany (RWX):** leitura e escrita por muitos nós ao mesmo tempo. Exige um sistema de arquivos em rede (NFS, EFS, CephFS). Disco de bloco não faz isso, pela mesma razão que vimos no artigo de armazenamento: dois filesystems montando o mesmo bloco ao mesmo tempo corrompem tudo.
4. **ReadWriteOncePod (RWOP):** um único pod no cluster inteiro.

Mais três detalhes: a **reclaim policy** decide se o disco é apagado (Delete) ou preservado (Retain) quando o PVC é removido, e confundir as duas já apagou muito banco de dados. O **volumeBindingMode WaitForFirstConsumer** faz o disco só ser criado depois que o pod é agendado, na mesma zona do nó; sem isso, o disco pode nascer numa zona e o pod ser agendado em outra, onde ele não consegue montar. E nos StatefulSets, os **volumeClaimTemplates** criam um PVC por réplica, que continua existindo mesmo se o StatefulSet for reduzido, para os dados não sumirem.

## Configuração: ConfigMaps e Secrets

1. **ConfigMap:** pares de chave e valor ou arquivos inteiros de configuração, injetados no pod como variáveis de ambiente ou montados como arquivos.
2. **Secret:** a mesma coisa, para dados sensíveis: senhas, tokens, certificados.

A pegadinha mais famosa: o conteúdo de um Secret é **codificado em base64, não criptografado**. Base64 é só uma forma de representar bytes em texto; qualquer um que consiga ler o objeto lê o segredo. A proteção real vem de três lugares: o **RBAC** (quem pode ler Secrets), a **criptografia em repouso** no etcd (configurada no API server, de preferência com chaves num serviço de gerenciamento de chaves) e o cuidado de não versionar Secrets em texto puro no Git. Para isso, existem ferramentas como o External Secrets Operator (que sincroniza segredos de um cofre externo como Vault ou o Secrets Manager da nuvem), o Sealed Secrets e o SOPS.

Uma diferença prática entre as duas formas de injeção: variáveis de ambiente são lidas uma vez, quando o container inicia, e mudar o ConfigMap não muda nada até o pod ser recriado. Arquivos montados são atualizados no pod depois de algum tempo (exceto quando montados com subPath), mas a aplicação precisa perceber e reler. Muitas equipes simplesmente colocam um hash da configuração numa anotação do Deployment, para que qualquer mudança provoque um rollout.

## Namespaces, rótulos e anotações

**Namespaces** dividem o cluster em espaços lógicos: um por equipe, por ambiente ou por aplicação. Nomes de recursos são únicos dentro de um namespace, e RBAC, cotas (ResourceQuota) e valores padrão de recursos (LimitRange) se aplicam por namespace. Importante: o namespace do Kubernetes **não é** isolamento de rede nem de segurança por si só. Sem NetworkPolicy, pods de namespaces diferentes conversam livremente; sem RBAC bem feito, quem tem acesso a um namespace pode ter acesso a outro.

**Rótulos** (labels) são pares de chave e valor que identificam recursos: app igual a pagamentos, ambiente igual a produção, versão igual a 2.3. Eles são a cola do Kubernetes: Services encontram pods por rótulos, Deployments controlam ReplicaSets por rótulos, NetworkPolicies selecionam pods por rótulos. Um erro de digitação num seletor é um Service sem nenhum endpoint, e um dos primeiros lugares para olhar quando "o Service não responde".

**Anotações** (annotations) também são chave e valor, mas para metadados que não servem para seleção: configuração de ferramentas (do ingress controller, do Prometheus, do service mesh), quem é o dono, link para o runbook.

## Controle de acesso e segurança do cluster

### Autenticação e RBAC

O Kubernetes não tem cadastro de usuários. Pessoas são autenticadas por algo externo (certificados, um provedor de identidade via OIDC, a integração com o IAM da nuvem). Processos dentro do cluster usam **ServiceAccounts**: cada pod roda com uma, e recebe automaticamente um token de curta duração, renovado sozinho, para falar com a API.

A autorização é feita pelo **RBAC**, com quatro objetos:

1. **Role:** um conjunto de permissões (quais verbos, como get, list, create e delete, em quais recursos) dentro de um namespace.
2. **ClusterRole:** a mesma coisa, para o cluster inteiro ou para recursos sem namespace (como nós).
3. **RoleBinding:** liga uma Role (ou ClusterRole) a usuários, grupos ou ServiceAccounts, dentro de um namespace.
4. **ClusterRoleBinding:** liga no cluster inteiro.

Permissões são só aditivas: não existe "negar". O princípio do menor privilégio vale com força aqui, porque algumas permissões são muito mais poderosas do que parecem: poder criar pods num namespace equivale, na prática, a poder ler todos os Secrets que aqueles pods conseguem montar e usar as ServiceAccounts de lá. O comando kubectl auth can i responde se uma identidade pode fazer algo, e é a primeira ferramenta para auditar.

### Endurecendo os pods

O **securityContext** de pods e containers define como eles rodam, e alguns ajustes deveriam ser padrão em quase toda aplicação: rodar como usuário não root (runAsNonRoot), sistema de arquivos raiz somente leitura (readOnlyRootFilesystem), sem possibilidade de ganhar privilégios (allowPrivilegeEscalation falso), descartar todas as capabilities do Linux e adicionar só as necessárias, e usar o perfil seccomp padrão do runtime. Pods privilegiados, com acesso ao namespace de rede ou de PIDs do nó, ou montando o sistema de arquivos do nó, quebram o isolamento que vimos no artigo de sistemas operacionais e devem ser exceção bem justificada, normalmente só para agentes de infraestrutura.

Para garantir isso em escala, o Kubernetes tem os **Pod Security Standards**, três níveis (privileged, baseline e restricted), aplicados por namespace por um controle de admissão embutido, o Pod Security Admission, configurado com rótulos no namespace.

### Controles de admissão

Entre a autorização e a gravação no etcd, toda requisição passa pelos **admission controllers**. Os **mutantes** podem alterar o objeto (injetar um sidecar, adicionar rótulos, definir valores padrão); os **validadores** podem recusar ("imagens só do registro da empresa", "todo Deployment precisa de requests", "nada de tag latest"). Além dos embutidos, dá para plugar webhooks próprios ou usar ferramentas de política como Kyverno e OPA Gatekeeper, e as versões recentes trazem o ValidatingAdmissionPolicy, que permite escrever regras de validação na linguagem CEL direto na API, sem webhook.

## Escalando automaticamente

Existem três dimensões de autoscaling, e elas se complementam:

1. **HPA (Horizontal Pod Autoscaler):** aumenta e diminui o número de réplicas de um Deployment ou StatefulSet com base em métricas: CPU e memória (relativas ao request, por isso request mal definido gera autoscaling maluco), ou métricas customizadas e externas, como requisições por segundo ou tamanho de uma fila. Depende do metrics server, ou de um adaptador do Prometheus para métricas customizadas.
2. **VPA (Vertical Pod Autoscaler):** observa o consumo real e recomenda ou ajusta os requests e limits de cada container. Ótimo para descobrir o tamanho certo. Combinar VPA e HPA na mesma métrica (CPU nos dois, por exemplo) faz os dois brigarem.
3. **Escalonamento de nós:** quando pods ficam em Pending por falta de espaço, algo precisa criar nós novos. O **Cluster Autoscaler** aumenta e diminui grupos de nós pré definidos. O **Karpenter** escolhe e cria diretamente o tipo de máquina mais adequado para os pods pendentes, geralmente mais rápido e mais barato.

O **KEDA** completa o quadro para cargas orientadas a eventos: escala com base em dezenas de fontes (tamanho de fila no RabbitMQ ou SQS, lag de consumidor no Kafka, consultas no Prometheus) e, diferentemente do HPA puro, consegue reduzir até zero réplicas quando não há trabalho.

Uma lembrança vinda dos artigos anteriores: autoscaling reage em segundos ou minutos. Puxar imagem, subir a aplicação, passar a readiness e, se precisar de nó novo, criar a máquina, tudo isso leva tempo. Picos instantâneos precisam de folga já provisionada.

## Deploy: atualizando sem derrubar

### Rolling update

A estratégia padrão do Deployment é a **atualização gradual**: cria pods da versão nova e remove os da antiga aos poucos. Dois parâmetros controlam o ritmo: **maxSurge** (quantos pods a mais que o desejado podem existir durante a troca) e **maxUnavailable** (quantos podem estar indisponíveis). Com maxUnavailable zero e maxSurge um, o Kubernetes sobe um pod novo, espera ele passar a readiness, remove um antigo, e repete. Isso só é seguro se a readiness for honesta: uma readiness que passa antes da aplicação estar pronta faz o rollout trocar pods bons por pods quebrados com toda a calma do mundo.

O Deployment guarda o histórico de ReplicaSets, e o **rollback** é só voltar para o anterior. A outra estratégia embutida, **Recreate**, mata todos os pods antigos antes de subir os novos, com indisponibilidade, útil quando duas versões não podem coexistir.

Estratégias mais sofisticadas, como **canary** (uma pequena porcentagem do tráfego para a versão nova, observando métricas antes de avançar) e **blue green** (duas versões completas, trocando o tráfego de uma vez), não vêm prontas no Deployment. São feitas com ferramentas como Argo Rollouts e Flagger, com a divisão de tráfego da Gateway API ou com um service mesh.

### PodDisruptionBudget

Nem toda interrupção vem de deploy. Atualizar nós, esvaziar um nó para manutenção (o kubectl drain) e o autoscaler removendo nós ociosos são **interrupções voluntárias**. O **PodDisruptionBudget** diz quantas réplicas de uma aplicação podem estar fora ao mesmo tempo por causa delas ("mínimo de duas disponíveis", ou "no máximo uma indisponível"). Sem PDB, um upgrade de cluster pode esvaziar ao mesmo tempo os nós de todas as réplicas de um serviço. Com um PDB rígido demais (mínimo disponível igual ao total de réplicas), o drain trava para sempre. O PDB não protege contra interrupções involuntárias, como a queda de um nó; para isso, servem as réplicas espalhadas por nós e zonas.

### Empacotando e entregando

Escrever YAML na mão para cada ambiente não escala. As ferramentas mais usadas:

1. **Helm:** pacotes (charts) com templates e valores. Bom para distribuir software de terceiros e para parametrizar muito. O preço é YAML gerado por templates, que fica difícil de ler.
2. **Kustomize:** sem templates. Uma base de YAML puro e camadas de ajustes por ambiente. Já vem embutido no kubectl.
3. **GitOps (Argo CD, Flux):** o estado desejado do cluster mora num repositório Git, e um agente dentro do cluster reconcilia continuamente o cluster com o repositório. É a ideia de reconciliação do próprio Kubernetes, aplicada um nível acima: o Git vira a fonte da verdade, todo deploy é um commit, todo rollback é um revert, e qualquer mudança feita na mão é detectada e desfeita.

## Extensibilidade: CRDs e operators

A API do Kubernetes pode ser estendida com tipos novos, os **CustomResourceDefinitions** (CRDs). Depois de criar um CRD chamado, digamos, PostgresCluster, você pode aplicar objetos desse tipo como aplica um Deployment, com kubectl, RBAC e tudo mais.

Sozinho, um CRD é só um formulário guardado no etcd. Quem dá vida a ele é um **controller** próprio, que observa esses objetos e reconcilia o mundo real com eles. O par CRD mais controller com conhecimento operacional embutido é o que se chama de **operator**. Um operator de banco de dados sabe criar o primário e as réplicas, configurar a replicação, fazer backup, promover uma réplica quando o primário cai e atualizar a versão na ordem certa: o conhecimento de um administrador experiente transformado em código, rodando o tempo todo. Cert manager (certificados), Prometheus Operator, Strimzi (Kafka) e CloudNativePG (PostgreSQL) são exemplos conhecidos. Construir operators com ferramentas como Kubebuilder e o Operator SDK é um caminho natural para quem já entendeu reconciliação.

Essa extensibilidade é o motivo de o Kubernetes ter virado mais que um orquestrador de containers: é uma plataforma para construir plataformas, com uma API comum para gerenciar quase qualquer coisa, inclusive recursos fora do cluster, como bancos gerenciados e buckets na nuvem.

## Operando o cluster

### etcd e o control plane

O etcd é a peça mais sensível. Ele gosta de disco com baixa latência de fsync (ele chama fsync em cada gravação, lembra do artigo de armazenamento?), de rede estável entre os membros e de número ímpar de membros. Backup do etcd (um snapshot periódico) é o seguro de vida do cluster. Em clusters gerenciados (EKS, GKE, AKS), o provedor cuida do control plane e do etcd, e é um dos melhores motivos para usar um gerenciado.

### Versões e upgrades

O Kubernetes lança três versões por ano, e cada uma tem suporte da comunidade por cerca de um ano. Ficar parado não é opção. Existem regras de compatibilidade de versões entre componentes: o kubelet pode estar algumas versões atrás do API server, nunca à frente. O upgrade segue a ordem control plane primeiro, depois nós. E a cada versão, APIs antigas podem ser removidas: manifestos usando versões de API depreciadas param de ser aceitos, o que já quebrou muito pipeline. Ferramentas que procuram APIs depreciadas nos manifestos antes do upgrade economizam sustos.

## Diagnóstico: o kit de bancada

O roteiro básico, do geral ao específico:

1. **kubectl get pods** com a opção de mostrar mais colunas: estado, reinícios, nó, IP.
2. **kubectl describe** no pod: a seção de eventos no final conta quase toda história (falha de agendamento, falha ao puxar imagem, probe falhando, OOMKilled).
3. **kubectl logs**, e com a opção previous para ver os logs da execução que morreu, essencial no CrashLoopBackOff.
4. **kubectl get events** no namespace, ordenado por tempo.
5. **kubectl exec** para entrar no container, ou **kubectl debug** para anexar um container efêmero com ferramentas de diagnóstico a um pod cuja imagem não tem nem shell.
6. **kubectl top** para consumo de CPU e memória por pod e por nó (depende do metrics server).
7. **kubectl get endpointslices** de um Service, para saber se ele tem algum pod por trás.

E o dicionário dos estados mais comuns:

1. **Pending:** o pod não foi agendado. O describe mostra o porquê: falta de CPU ou memória considerando os requests, nenhum nó tolerando os taints, afinidade impossível, PVC esperando volume em outra zona.
2. **ImagePullBackOff ou ErrImagePull:** não conseguiu baixar a imagem. Nome ou tag errados, registro privado sem credencial (imagePullSecrets), limite de downloads do registro, ou arquitetura errada (a imagem só existe para amd64 e o nó é arm64).
3. **CrashLoopBackOff:** o container sobe e morre repetidamente. Veja os logs da execução anterior e o código de saída: 1 costuma ser erro da aplicação, 137 é SIGKILL (OOM ou estouro do prazo de encerramento), 139 é segmentation fault.
4. **OOMKilled:** passou do limit de memória. Aumentar o limit, investigar vazamento, ou ajustar a aplicação ao limite do container (JVMs e runtimes antigos que não percebem o limite do cgroup são clássicos).
5. **CreateContainerConfigError:** referência a um ConfigMap ou Secret que não existe, ou a uma chave que não existe nele.
6. **Running, mas sem receber tráfego:** readiness falhando, seletor do Service que não combina com os rótulos do pod, porta do Service apontando para a porta errada do container, ou NetworkPolicy bloqueando.
7. **Evicted:** o nó ficou sem memória ou disco e o kubelet despejou o pod. Olhe os requests e o consumo real; frequentemente é log ou arquivo temporário enchendo o disco do nó.
8. **Terminating para sempre:** um finalizer pendurado (algum controller precisava fazer limpeza e não fez) ou um nó que sumiu sem avisar.

Para problemas de rede, um pod de diagnóstico com ferramentas como dig, curl e tcpdump, rodando no mesmo namespace, testa DNS, Services e políticas do ponto de vista de quem está dentro do cluster. Grande parte dos mistérios de "não conecta" se resolve com três perguntas: o nome resolve? O Service tem endpoints? Alguma política bloqueia?

## Amarrando tudo: um mapa mental

1. **Modelo:** você declara o estado desejado, controllers reconciliam o real com o desejado para sempre. Tudo passa pelo API server, e tudo é guardado no etcd.
2. **Execução:** o scheduler escolhe o nó pelos requests e restrições; o kubelet executa os pods pelo runtime CRI; pods são namespaces e cgroups do Linux com um container pause segurando a rede.
3. **Workloads:** Deployment para sem estado, StatefulSet para identidade e disco estáveis, DaemonSet para um por nó, Job e CronJob para tarefas com fim.
4. **Saúde e ciclo de vida:** startup, readiness e liveness com consequências diferentes; SIGTERM, preStop e prazo de encerramento para sair sem derrubar requisições.
5. **Recursos:** request decide agendamento e fatia de CPU; limit de CPU causa throttling, limit de memória causa OOMKilled; QoS decide quem é despejado primeiro.
6. **Rede:** todo pod com IP próprio via CNI; Services como IPs virtuais estáveis implementados pelo kube proxy ou eBPF; CoreDNS dando nomes; Ingress ou Gateway API para entrada HTTP; NetworkPolicy para fechar o padrão "todo mundo fala com todo mundo".
7. **Dados:** PVC pede, StorageClass e CSI provisionam, PV entrega; modos de acesso, zona e reclaim policy decidem se dá certo e se os dados sobrevivem.
8. **Segurança:** RBAC com menor privilégio, Secrets que não são criptografados por padrão, securityContext restritivo, Pod Security Standards e controles de admissão.
9. **Elasticidade e entrega:** HPA, VPA, Cluster Autoscaler ou Karpenter, KEDA; rolling update com readiness honesta, PDB para manutenção, GitOps para fazer do Git a fonte da verdade.
10. **Extensão:** CRDs e operators levando a mesma ideia de reconciliação para qualquer coisa.

## Vinte perguntas pra se testar

1. **Apaguei um pod e ele voltou. Por quê?** Porque ele pertence a um ReplicaSet de um Deployment, que quer um número fixo de réplicas. O controller viu uma a menos e criou outra. Para reduzir, mude o número de réplicas; para remover, apague o Deployment.

2. **Qual a diferença entre liveness e readiness?** Liveness falhando faz o kubelet reiniciar o container. Readiness falhando tira o pod dos endpoints dos Services, sem reiniciar. A liveness não deve depender de serviços externos, senão uma lentidão no banco reinicia todos os pods ao mesmo tempo.

3. **O que significa CrashLoopBackOff?** Que o container está morrendo repetidamente e o kubelet está esperando cada vez mais entre as tentativas, até cinco minutos. A causa está nos logs da execução anterior e no código de saída.

4. **Pod em Pending há minutos. Onde olhar?** Nos eventos do describe. As causas comuns são falta de recurso considerando os requests (não o uso real), taints sem toleration, regras de afinidade impossíveis e volume preso em outra zona.

5. **Qual a diferença entre request e limit?** Request é o mínimo garantido, usado pelo scheduler para encaixar o pod e pelo cgroup para dividir CPU sob disputa. Limit é o teto: em CPU causa throttling, em memória causa OOMKilled.

6. **Aplicação lenta com limit de CPU e o nó quase ocioso. O que pode ser?** Throttling do cgroup: o container gasta a cota de cada período de 100 ms e fica parado até o próximo. Confira as métricas de throttling e considere aumentar ou remover o limit de CPU, mantendo o request.

7. **Qual a diferença entre OOMKilled e Evicted?** OOMKilled é o kernel matando um processo que passou do limit de memória do cgroup do container. Evicted é o kubelet despejando pods porque o nó inteiro ficou com pouca memória ou disco, começando pelos BestEffort e pelos que mais passaram dos requests.

8. **Por que o deploy gera erros 502 por alguns segundos?** Porque a retirada do pod dos endpoints e o SIGTERM acontecem ao mesmo tempo, e a retirada leva segundos para chegar a todos os proxies. Um preStop que espera alguns segundos e uma aplicação que termina as requisições em andamento resolvem.

9. **Por que meu container leva 30 segundos para parar?** Provavelmente ele não trata SIGTERM, muitas vezes por rodar como PID 1 ou atrás de um shell que não repassa o sinal. O kubelet espera o prazo de encerramento e manda SIGKILL. Trate o sinal ou use um init mínimo.

10. **O que é um ClusterIP e por que o ping nele não funciona?** É um IP virtual que não existe em nenhuma interface, só em regras de iptables, IPVS, nftables ou eBPF que reescrevem o destino para um pod nas portas do Service. Não há nada para responder ao ping, mas a conexão TCP na porta funciona.

11. **O Service existe, mas não responde. O que verificar?** Se ele tem endpoints. Sem endpoints, o seletor não combina com os rótulos dos pods ou os pods não estão passando a readiness. Com endpoints, confira a porta de destino e as NetworkPolicies.

12. **Para que serve um Service headless?** Para o DNS devolver os IPs dos pods diretamente, sem IP virtual. É usado com StatefulSets, quando o cliente precisa falar com um pod específico, como o primário de um banco ou um broker do Kafka.

13. **Por que chamadas a APIs externas geram tantas consultas DNS?** Por causa do ndots 5 e dos domínios de busca padrão: nomes com menos de cinco pontos são tentados primeiro com cada sufixo do cluster. Ponto final no nome, ndots menor ou cache de DNS local no nó resolvem.

14. **Secrets do Kubernetes são seguros?** Por padrão, só codificados em base64, que não é criptografia. A segurança vem de RBAC restritivo, criptografia em repouso no etcd e de não guardar Secrets em texto puro no Git, usando ferramentas como External Secrets, Sealed Secrets ou SOPS.

15. **Quando usar StatefulSet em vez de Deployment?** Quando cada réplica precisa de identidade estável (nome e DNS fixos), do seu próprio volume persistente que a acompanha, e de ordem na criação e na atualização. Bancos de dados, filas e sistemas com consenso são os casos típicos.

16. **Por que um PVC ReadWriteOnce impede escalar para várias réplicas em nós diferentes?** Porque um volume de bloco só pode ser montado em leitura e escrita por um nó de cada vez. Para muitos nós ao mesmo tempo, é preciso um sistema de arquivos em rede com ReadWriteMany, ou um volume por réplica, como nos StatefulSets.

17. **NetworkPolicy criada e nada mudou. Por quê?** Provavelmente o plugin de rede não implementa NetworkPolicy, como o Flannel puro. A API aceita o objeto, mas ninguém aplica as regras. Calico e Cilium implementam.

18. **Para que serve um PodDisruptionBudget?** Para limitar quantas réplicas podem ficar fora ao mesmo tempo em interrupções voluntárias, como drain de nós em upgrades e remoção de nós pelo autoscaler. Não protege contra quedas de nós; para isso, servem réplicas espalhadas por nós e zonas.

19. **O que é um operator?** Um CRD mais um controller que reconcilia esse tipo novo de recurso com o mundo real, embutindo conhecimento operacional: criar, replicar, fazer backup, recuperar de falhas e atualizar um sistema complexo como um banco de dados.

20. **O que acontece com os pods se o control plane cair?** Os pods que já estão rodando continuam rodando, e o tráfego continua fluindo pelas regras que já estão nos nós. O que para é tudo que depende de decisão: agendamentos novos, recriação de pods que morrerem, escalonamento automático, deploys e mudanças de endpoints. Por isso se diz que o control plane decide e os nós executam.

## Nota

Esta é a quarta revisão da trilha, depois de [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/), [redes](/2026/10/26/revisao-redes-de-computadores/) e [sistemas operacionais](/2026/10/26/revisao-fundamentos-de-sistemas-operacionais/), e é a que mais depende das outras três: cada conceito do Kubernetes é uma peça do Linux, da rede ou do armazenamento com uma API declarativa por cima. Kubernetes muda rápido no detalhe (três versões por ano, recursos nascendo como alfa e virando estáveis o tempo todo), então, se algo aqui envelhecer, aceito correções de bom grado.
