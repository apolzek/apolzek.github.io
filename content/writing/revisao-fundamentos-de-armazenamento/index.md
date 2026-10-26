---
title: "Revisão: fundamentos de armazenamento"
slug: "revisao-fundamentos-de-armazenamento"
date: '2026-10-26T12:00:00-03:00'
draft: true
description: "Uma revisão de armazenamento do disco ao filesystem: HDD, SSD, NVMe, IOPS, RAID, LVM, ZFS e os sistemas de arquivos de cada sistema operacional, tudo em linguagem informal e com analogias."
tags:
- linux
minute: 38
url: "/review/fundamentos-de-armazenamento/"
---

Este é o texto que eu gostaria de ter lido quando precisei revisar armazenamento de verdade, sem decorar sigla solta. A ideia é subir a pilha inteira: começa no hardware, passa por desempenho, RAID e LVM, e termina nos filesystems de cada sistema operacional. Pega um café, porque é uma caminhada longa, mas prometo que cada parada faz sentido.

## O problema que armazenamento resolve

Memória RAM é como a mesa do seu escritório: rápida de alcançar, mas pequena e, pior, tudo que está nela some quando você apaga a luz. Armazenamento persistente é o arquivo de aço do canto da sala: lento de abrir, mas guarda tudo mesmo com o prédio fechado. Toda a engenharia dessa área gira em torno de um único dilema: quanto mais rápido, mais caro e menor; quanto maior e mais barato, mais lento. Não existe almoço grátis, existe hierarquia. Registradores, cache, RAM, SSD, HDD, fita. Cada degrau troca velocidade por capacidade.

## HDD: o toca discos

O disco rígido é mecânica fina do século passado que insiste em funcionar. Imagina um toca discos de vinil: pratos girando (5400, 7200, às vezes 15000 rotações por minuto), um braço com uma cabeça de leitura que flutua a nanômetros da superfície, e a informação gravada em trilhas magnéticas concêntricas. Para ler um dado, o braço precisa se mover até a trilha certa (seek) e esperar o prato girar até o setor passar embaixo da cabeça (latência rotacional). Esses dois movimentos físicos custam alguns milissegundos cada.

Milissegundos parecem pouco, mas para um processador que vive em nanossegundos é uma eternidade. É como pedir um documento para um estagiário que precisa ir até o arquivo no porão: não importa o quão rápido ele leia, o trajeto domina o tempo total.

A consequência prática mais importante: HDD é razoável em leitura sequencial (a cabeça fica parada e o prato desfila os dados) e péssimo em leitura aleatória (a cabeça fica pulando de trilha em trilha). Um HDD bom entrega algo como 100 a 200 operações aleatórias por segundo. Guarda esse número.

## SSD: memória que finge ser disco

O SSD não tem partes móveis. É um conjunto de chips de memória flash NAND com um controlador na frente, tudo parado, tudo silencioso. Se o HDD é o estagiário indo ao porão, o SSD é uma estante inteira de gavetas que se abrem sozinhas ao mesmo tempo. Leitura aleatória deixa de ser um problema físico e vira um problema elétrico, e eletricidade é rápida.

Mas o SSD tem suas esquisitices, e vale conhecer três:

1. Flash não sobrescreve no lugar. Para regravar uma página, o SSD precisa apagar um bloco inteiro antes, e blocos são bem maiores que páginas. É como um caderno onde você só pode apagar a folha inteira, nunca uma linha. O controlador contorna isso gravando em outro lugar e marcando o antigo como lixo, num processo chamado garbage collection.
2. Flash se desgasta. Cada célula aguenta um número finito de ciclos de escrita. O controlador faz wear leveling, espalhando as escritas para que nenhuma célula morra antes das outras, como um gerente que reveza os funcionários para ninguém ter burnout.
3. O sistema operacional precisa avisar o que foi apagado. É o comando TRIM: sem ele, o SSD acha que tudo que já foi escrito ainda importa e a garbage collection vira um caos.

Existem variações de célula: SLC guarda 1 bit por célula (rápido, durável, caro), MLC guarda 2, TLC guarda 3, QLC guarda 4 (barato, mais lento, menos durável). É literalmente colocar mais gente no mesmo quarto: cabe mais, mas a convivência piora. A durabilidade resultante aparece na ficha técnica como endurance, medida em TBW (total de terabytes que dá pra escrever na vida útil) ou DWPD (quantas vezes por dia dá pra encher o disco dentro da garantia). Pra desktop é difícil esgotar; pra banco de dados escrevendo sem parar, é número que se lê antes de comprar.

## SSD x HDD: quando cada um ganha

A comparação honesta não é "SSD é melhor". É "SSD é melhor por unidade de velocidade, HDD é melhor por unidade de capacidade".

O SSD vence em tudo que envolve latência e acesso aleatório: sistema operacional, bancos de dados, máquinas virtuais, compilação, qualquer coisa interativa. Um SSD NVMe entrega centenas de milhares de operações por segundo contra as centenas do HDD. É diferença de três ordens de grandeza, tipo comparar um email com uma carta registrada.

O HDD vence em custo por terabyte. Backup, arquivamento, mídia fria, aquele dataset que você lê uma vez por mês de forma sequencial. Datacenters guardam oceanos de dados mornos em HDD porque o preço por TB ainda compensa.

E sobre confiabilidade: SSD não tem mecânica para falhar, mas quando o controlador morre, costuma morrer de vez e sem aviso. HDD frequentemente avisa antes (setores ruins crescendo, barulho estranho, SMART reclamando). Nenhum dos dois dispensa backup. Nunca.

## Interfaces e barramentos: a largura da porta

Não adianta estante rápida com porta estreita. A interface define o teto:

SATA foi feita para HDD e limita tudo a uns 550 MB/s. Colocar um SSD moderno em SATA é contratar um atleta olímpico para trabalhar num corredor de 60 centímetros de largura.

NVMe é o protocolo desenhado para flash, conversando direto com o barramento PCIe. Além da banda bruta (vários GB/s), o ganho real está nas filas: SATA tem uma fila de 32 comandos; NVMe suporta até 65 mil filas com 65 mil comandos cada. É a diferença entre um caixa único de padaria e um supermercado com cem caixas abertos.

SAS (Serial Attached SCSI) é a prima corporativa da SATA: mais robusta, full duplex, usada em servidores e storages, e herdeira direta do venerável SCSI, o conjunto de comandos dos anos 80 que ecoa em tudo até hoje (o sd de /dev/sda vem literalmente de SCSI disk).

E aqui vale desfazer a confusão clássica, separando três coisas que viajam juntas mas são diferentes: o conector físico (o cabo SATA, o encaixe M.2, o U.2, o slot PCIe), o barramento que transporta (SATA, SAS, PCIe) e o protocolo que conversa (AHCI ou NVMe). AHCI é o protocolo da era SATA, desenhado pensando em disco giratório, com sua fila única de 32 comandos. NVMe é o protocolo da era flash. E a pegadinha mora no formato: existe SSD M.2 que por dentro é SATA com AHCI e existe SSD M.2 que é NVMe sobre PCIe. Mesmo encaixe, desempenho de mundos diferentes, então leia a letra miúda antes de comprar.

Pra fechar o mapa: blocos também viajam pela rede (Fibre Channel, iSCSI) e arquivos também (NFS, SMB), mas essa conversa de SAN, NAS e object storage ganha uma seção própria mais adiante.

## Blocos, setores e LBA

O disco não sabe o que é arquivo. Ele expõe uma fila gigante de setores numerados do 0 até o fim, e o endereçamento se chama LBA (Logical Block Addressing): pedir o setor 4800233 é como pedir uma caixa postal pelo número, sem saber nem se importar com o que tem dentro. Tudo que vem acima (partição, volume, filesystem) é convenção construída sobre essa numeração.

O tamanho histórico do setor é 512 bytes. Discos modernos usam setores físicos de 4K (o Advanced Format), mas muitos ainda fingem 512 pra fora por compatibilidade, o chamado 512e, de emulado. Essa dupla identidade cria a pegadinha do alinhamento: se uma partição começa no meio de um setor físico, cada escrita de 4K do filesystem cai montada em dois setores do disco, que precisa ler, modificar e gravar os dois. O desempenho despenca e nenhum erro aparece em lugar nenhum. Ferramentas modernas de particionamento alinham em 1 MiB por padrão justamente pra esse problema morrer, desde que ninguém crie partição na mão com offset criativo.

Os filesystems, por sua vez, trabalham com blocos (tipicamente 4K), que são grupos de setores. Quando algum benchmark falar de tamanho de bloco, é dessa unidade de leitura e escrita que ele está falando.

## IOPS, throughput e latência: as três medidas que importam

Todo mundo mede armazenamento com três réguas, e confundir as três é fonte infinita de diagnóstico errado:

Latência é quanto tempo demora UMA operação. É o tempo de atendimento de um caixa.

IOPS (operações de entrada e saída por segundo) é quantas operações cabem num segundo. É quantos clientes o banco atende por hora.

Throughput (ou banda) é quantos bytes passam por segundo. É quanto dinheiro circula no banco por hora.

E a pegadinha: elas se relacionam, mas não se substituem. Um caminhão de fitas atravessando o país tem throughput absurdo e latência de dois dias. Um SSD pode ter IOPS altíssimo com blocos de 4 KB e throughput modesto, ou o contrário com blocos de 1 MB. Por isso benchmark sem contexto é mentira com números: sempre pergunte o tamanho do bloco, a profundidade da fila e se o padrão é aleatório ou sequencial.

### Quem devora IOPS

Algumas aplicações são famintas por operações pequenas e aleatórias, e são elas que sofrem primeiro quando o storage é fraco:

1. Bancos de dados OLTP (PostgreSQL, MySQL, Oracle): cada transação faz várias leituras e escritas pequenas espalhadas pelo disco, mais o commit do log de transações, que exige escrita síncrona. É o cliente que chega no caixa a cada dez segundos pedindo uma moeda.
2. Virtualização e containers: dezenas de sistemas operacionais dividindo o mesmo disco transformam qualquer padrão sequencial em aleatório puro. A indústria chama isso de IO blender: entra suco de laranja e maçã, sai vitamina indistinguível.
3. Servidores de email e filas de mensagens: milhares de arquivos pequenos criados, lidos e apagados o tempo todo.
4. Índices de busca (Elasticsearch, Solr) e metadados em geral.
5. VDI, aquele cenário de centenas de desktops virtuais ligando às 9h da manhã ao mesmo tempo, o famoso boot storm.

Já quem precisa de throughput e não de IOPS: streaming de vídeo, backup, data warehouse lendo tabelas inteiras, treinamento de modelo lendo datasets sequenciais. Para esses, HDD em RAID ainda se defende bem.

## RAID: redundância para disco que vai falhar

Primeiro o aviso de sempre: disco falha. Não é "se", é "quando". RAID (Redundant Array of Independent Disks) existe para que a falha de um disco não vire a falha do serviço. E o segundo aviso, igualmente clássico: RAID não é backup. RAID protege contra disco morto; não protege contra `rm` no diretório errado, ransomware ou aquele UPDATE sem WHERE, porque ele replica o estrago com a mesma eficiência com que replica o dado.

Os níveis que importam:

RAID 0 (striping): os dados são fatiados entre os discos, como dividir um livro entre dois digitadores. Dobra desempenho e capacidade, e zera a tolerância: qualquer disco que morrer leva o conjunto inteiro junto. A rigor nem deveria ter RAID no nome. Uso legítimo: dado descartável que precisa de velocidade, tipo cache ou scratch de renderização.

RAID 1 (mirror): cada escrita vai para dois discos iguais. É a fotocópia autenticada: perde um, o outro segue. Custa metade da capacidade, leitura melhora (dá para ler dos dois), escrita fica igual a um disco só. É o arroz com feijão de disco de sistema.

RAID 5 (paridade simples): com N discos, a capacidade de N menos 1 vira dado e o equivalente a um disco vira paridade distribuída, uma espécie de conta matemática que permite reconstruir qualquer disco perdido. Parece ótimo, mas tem duas pegadinhas. A primeira é a penalidade de escrita: cada escrita pequena exige ler o dado antigo, ler a paridade antiga, calcular e gravar os dois, ou seja, quatro operações por escrita. A segunda é mais cruel: com discos gigantes de hoje, a reconstrução depois de uma falha demora horas ou dias com o array inteiro trabalhando no limite, que é exatamente o momento mais provável de um segundo disco (comprado no mesmo lote, com a mesma idade) falhar. Se isso acontecer no RAID 5, acabou.

RAID 6 (paridade dupla): mesmo esquema com duas paridades, sobrevivendo a dois discos mortos simultâneos. Paga mais capacidade e mais penalidade de escrita (seis operações por escrita pequena) em troca de dormir tranquilo durante o rebuild.

RAID 10 (mirror + stripe): pares espelhados com striping por cima. Desempenho excelente, rebuild rápido (só copia o par, sem conta de paridade no array todo), custo de 50% da capacidade. É o padrão de fato para banco de dados que precisa de IOPS.

A escolha na prática: RAID 1 para boot, RAID 10 para banco e carga aleatória pesada, RAID 6 para volume grande de leitura sequencial, RAID 5 só com discos pequenos e backup em dia, RAID 0 para o que pode evaporar.

### RAID por software x por hardware

RAID de hardware é uma controladora dedicada com processador e cache próprios, muitas vezes com bateria protegendo o cache de escrita. O sistema operacional enxerga um disco só e vive feliz na ignorância. Vantagens: cache com bateria acelera escrita síncrona com segurança, e a CPU do servidor não gasta ciclo com paridade. Desvantagens: preço, e um aprisionamento sutil: se a controladora morrer, você frequentemente precisa de outra igual (mesmo modelo, às vezes mesmo firmware) para ler seus próprios discos. Sua redundância ganhou um ponto único de falha de estimação.

RAID de software (mdadm no Linux, por exemplo) roda no kernel usando a CPU do servidor. Vantagens: custo zero, transparência total, e os discos funcionam em qualquer máquina com o mesmo sistema. Desvantagens: consome CPU (hoje irrelevante, paridade é barata para processadores modernos) e não tem cache com bateria, então escrita síncrona dói mais.

A leitura moderna: a controladora de hardware fazia muito sentido quando CPU era escassa e cache era luxo. Hoje, com CPUs sobrando e SSDs NVMe conversando direto com o PCIe, colocar uma controladora no meio costuma mais atrapalhar que ajudar, e soluções como ZFS pedem explicitamente acesso cru aos discos. RAID de hardware sobrevive em nichos corporativos; o resto do mundo migrou para software.

## Partições: MBR e GPT

Antes de volume e filesystem vem a divisão mais antiga de todas: a tabela de partições, o mapa gravado no começo do disco dizendo onde cada fatia começa e termina.

MBR (Master Boot Record) é o formato de 1983: cabe em 512 bytes, suporta 4 partições primárias e endereça no máximo 2 TB. Um formato aposentável que ainda aparece em pendrive e máquina antiga.

GPT (GUID Partition Table) é o formato que veio junto com UEFI: suporta discos gigantes, 128 partições sem gambiarra de partição estendida, guarda uma cópia reserva da tabela no fim do disco e protege a si mesma com checksum. Disco maior que 2 TB ou boot por UEFI: GPT, sem discussão.

E aproveitando: partição não é sinônimo de volume. Partição é fatia fixa de UM disco, com começo e fim gravados no mapa. Volume é a abstração lógica onde um filesystem mora, e pode ser uma partição, um disco inteiro, vários discos juntos ou uma fatia flexível de um pool. Partição é cômodo com parede de alvenaria; volume é o conceito de "espaço habitável", venha ele de onde vier. O LVM logo abaixo existe exatamente pra fabricar volumes sem o engessamento das partições.

## LVM: o despachante entre o disco e o filesystem

Partição clássica é cerca de concreto: mudou de ideia, chama a britadeira. O LVM (Logical Volume Manager) derruba as cercas e coloca uma camada de abstração entre os discos e os filesystems, funcionando como um banco:

1. PV (Physical Volume): cada disco ou partição que você entrega ao LVM. São os depósitos feitos no banco.
2. VG (Volume Group): o cofre comum onde todos os depósitos se misturam num saldo único de espaço.
3. LV (Logical Volume): os saques: volumes do tamanho que você quiser, criados a partir do saldo, onde os filesystems de fato moram.

O dinheiro no cofre não lembra de qual depósito veio, e é essa a graça: um LV pode atravessar vários discos, crescer online (`lvextend` seguido do resize do filesystem, sem reboot), e você pode adicionar um disco novo ao VG na terça e aumentar o volume do banco de dados na quarta com o serviço no ar.

Dois recursos de LVM valem menção especial. Snapshots: uma foto instantânea do volume num momento, feita com copy on write (o snapshot só guarda os blocos que mudaram depois da foto). Perfeito para congelar um volume antes de um backup consistente ou antes daquele upgrade suspeito. E thin provisioning: prometer mais espaço do que existe, como companhia aérea vendendo mais assentos que o avião tem, apostando que ninguém usa tudo ao mesmo tempo. Útil e perigoso na exata mesma medida: monitore, porque quando o espaço real acaba, acaba para todo mundo junto.

A pilha clássica em Linux fica então: discos, em cima RAID (mdadm), em cima LVM, em cima o filesystem. Cada camada resolve um problema: o RAID resolve disco que morre, o LVM resolve tamanho que muda, o filesystem resolve organização.

## Filesystems: o bibliotecário

Um disco cru é um galpão com bilhões de caixinhas numeradas. O filesystem é o bibliotecário que transforma isso em algo usável: nomes, diretórios, permissões, datas, e a contabilidade de quais caixinhas estão livres. Em sistemas tipo Unix, a peça central é o inode: a ficha catalográfica de cada arquivo, guardando metadados e os ponteiros para os blocos de dados. O nome do arquivo, curiosamente, não mora no inode: mora no diretório, que é só uma tabela ligando nomes a números de inode. Por isso hard links existem: dois nomes apontando para a mesma ficha.

Dois conceitos separam filesystems antigos de modernos:

Journaling: antes de mexer nas estruturas, o filesystem anota a intenção num diário. Se faltar luz no meio da operação, na volta ele lê o diário e termina ou desfaz o serviço, em vez de passar horas num fsck vasculhando o disco inteiro. É o cirurgião que anota o plano antes de cortar.

Copy on write (COW): nunca sobrescrever dado no lugar; escrever a versão nova em blocos livres e só então virar o ponteiro. O estado em disco está sempre consistente, e snapshots viram quase de graça: basta não soltar os ponteiros antigos. É editar um contrato sempre em cópia nova, guardando as versões anteriores no arquivo.

### Linux

ext4: o padrão de fato há mais de uma década. Journaling, maduro, estável, desempenho sólido no caso geral. É o Corolla dos filesystems: ninguém posta foto, todo mundo confia.

XFS: nascido na Silicon Graphics nos anos 90 para trabalhar com vídeo pesado, hoje é o padrão do Red Hat Enterprise Linux. Brilha com arquivos grandes, paralelismo alto e filesystems gigantes. Detalhe histórico: cresce online, mas não encolhe.

Btrfs: a tentativa do Linux de ter um filesystem moderno nativo com COW, snapshots, checksums de dados, compressão e RAID embutido. Usado por padrão no openSUSE e no Fedora (e no fundo do Synology da sua casa). Os modos RAID 5 e 6 dele carregam avisos de instabilidade até hoje, então a prática comum é usar Btrfs em espelho ou disco único.

E uma menção honrosa fora da caixa: tmpfs (filesystem em RAM, morre no reboot) e os filesystems de rede como NFS.

### Unix e BSDs

UFS (Unix File System), descendente direto do Fast File System de Berkeley dos anos 80, é o avô da família: praticamente todo filesystem tipo Unix herda algo dele. Ainda é opção no FreeBSD, com soft updates no lugar de journaling clássico.

No Solaris nasceu o ZFS (já falo dele com calma), e o FreeBSD o adotou como filesystem de primeira classe: hoje é a escolha natural para servidor FreeBSD e a alma de appliances de storage como TrueNAS.

AIX tem o JFS (que a IBM depois portou para o Linux como JFS2), e HP UX tinha o VxFS da Veritas, pioneiro comercial do journaling. Aparecem pouco fora de ambientes legados, mas explicam de onde vieram várias ideias.

### macOS

Por décadas o Mac usou HFS e depois HFS+ (1998), um filesystem que envelheceu mal: sem checksums, com estruturas frágeis e um caso complicado com maiúsculas e minúsculas (por padrão ele preserva o caso do nome mas trata "Arquivo" e "arquivo" como o mesmo arquivo, comportamento que confunde dev até hoje).

Em 2017 a Apple virou a chave para o APFS, moderno de verdade: copy on write, snapshots (é o que o Time Machine moderno usa), clones instantâneos de arquivos, criptografia nativa e espaço compartilhado entre volumes do mesmo container, cada volume pegando o que precisa do saldo comum, bem no espírito do LVM. A troca aconteceu num update de iPhone, convertendo bilhões de dispositivos em marcha, possivelmente a maior migração de filesystem da história, e quase ninguém percebeu. APFS foi desenhado para SSD; em HDD ele fragmenta metadados e sofre, mais um motivo para o divórcio entre Apple e discos giratórios.

Curiosidade de fronteira: Mac lê NTFS mas não escreve por padrão, e o terreno neutro entre Windows e Mac num pendrive segue sendo exFAT.

### E o Windows, rapidinho

Só para completar o mapa: NTFS desde 1993, com journaling e ACLs, e o ReFS tentando ser o filesystem moderno de servidor. FAT32 e exFAT sobrevivem como língua franca de pendrive e cartão SD.

## O caminho de uma escrita, ou: quando um dado está salvo de verdade?

Pergunta aparentemente boba que derruba gente experiente: quando o seu programa escreve num arquivo, em que momento o dado está realmente seguro? A resposta é um corredor cheio de portas, e vale conhecer cada uma:

1. Cache da aplicação: o write da sua linguagem muitas vezes nem chega ao kernel na hora; bibliotecas mantêm buffer próprio (o printf é bufferizado, por exemplo).
2. Page cache do kernel: quando a escrita chega ao sistema operacional, o dado vai pra RAM e a chamada retorna sucesso imediatamente. Sucesso aqui significa "o kernel anotou", não "está no disco". O kernel descarrega essas páginas sujas depois, quando achar conveniente.
3. Filesystem: na hora de descarregar, o filesystem decide ordem, aloca blocos, atualiza journal e metadados.
4. Cache do dispositivo: o disco também tem RAM própria e também responde "ok" antes de gravar na mídia, a menos que receba uma ordem explícita de flush.
5. A mídia de verdade: só aqui o dado sobrevive a uma queda de energia.

A ordem explícita de atravessar o corredor inteiro se chama fsync (e parentes, como fdatasync, e o O_DIRECT pra quem quer pular o page cache). É por isso que banco de dados chama fsync a cada commit, e é por isso que commit custa caro: ele espera o percurso completo, incluindo o flush do cache do disco. E é por isso também que controladora RAID com bateria acelera tanto escrita síncrona: ela pode responder "ok" com o dado ainda no cache dela, porque a bateria garante a chegada ao disco mesmo sem luz.

Moral da história: escrita que não passou por fsync é promessa, não contrato. Queda de energia entre o write e o flush leva embora o que estava pendurado no caminho, e é o journaling ou o copy on write do filesystem que limitam o estrago a "perdi os últimos segundos" em vez de "corrompi a estrutura inteira".

## ZFS: o canivete suíço que engoliu a pilha inteira

O ZFS merece seção própria porque ele não é só um filesystem: é filesystem, RAID e LVM num pacote único. Nasceu na Sun Microsystems em 2005 com uma proposta radical: o fim da partição e a guerra total contra corrupção silenciosa de dados.

A estrutura: discos são agrupados em vdevs (disco único, espelho, ou RAIDZ), e vdevs formam um pool. Datasets (filesystems) e zvols (volumes de bloco) nascem do pool e compartilham o espaço livre, sem tamanho fixo, como os volumes do APFS ou os LVs de um VG. Criar um filesystem novo no ZFS é um comando e meio segundo.

O que faz o ZFS ser ZFS:

Checksum de tudo: cada bloco, de dado ou metadado, tem um checksum guardado no bloco pai, formando uma árvore de Merkle até a raiz. Toda leitura é conferida. Se o disco devolver lixo com cara de dado (bit flip, cabo ruim, firmware mentiroso), o ZFS percebe, e se houver redundância, corrige sozinho na hora (self healing). HDD e RAID tradicionais confiam cegamente no que o disco devolve; o ZFS confere o troco de cada compra.

Copy on write de ponta a ponta: o estado em disco está sempre consistente, não existe fsck no ZFS. Snapshots são instantâneos, baratos, e enviáveis pela rede com `zfs send` e `zfs receive`, o que transforma replicação de backup em uma linha de shell.

RAIDZ: a resposta do ZFS ao RAID 5 e 6 (RAIDZ1, Z2 e até Z3, com três paridades). Por ser integrado ao filesystem, com stripes de largura variável, ele fecha o famoso write hole do RAID 5 (aquela janela entre gravar o dado e gravar a paridade em que uma queda de energia deixa o array mentindo para você). E no rebuild (resilver), ele só reconstrói os blocos realmente usados, não o disco inteiro.

ARC e caches: o ZFS mantém um cache adaptativo agressivo em RAM (ARC), aceita um SSD como cache de leitura de segundo nível (L2ARC) e um dispositivo rápido para acelerar escritas síncronas (SLOG). Daí a fama de comilão de memória: ele usa a RAM que existe, como todo cache decente, mas libera quando o sistema precisa.

Compressão nativa (LZ4 e Zstd) que quase sempre vale a pena ligar, deduplicação (que quase nunca vale a pena ligar, pela fome de RAM), quotas, criptografia nativa por dataset.

O preço de tudo isso: ZFS quer ver os discos crus (nada de controladora RAID no meio), pede RAM com generosidade, e expandir um RAIDZ era historicamente inflexível (adicionar um disco a um vdev RAIDZ só chegou de verdade em versões recentes do OpenZFS). No Linux ele vive fora da árvore do kernel por incompatibilidade de licenças (CDDL x GPL), então chega via módulo (OpenZFS), com o Ubuntu oferecendo suporte direto e o Proxmox e o TrueNAS construídos em cima dele.

Se a sua pergunta é "quero um servidor de arquivos ou de backup confiável em casa ou na empresa, o que uso?", a resposta da década é: ZFS com espelhos ou RAIDZ2, snapshots automáticos e `zfs send` para outra máquina. Difícil errar.

## Bloco, arquivo e objeto: as três línguas do armazenamento

Toda oferta de storage do mundo, do disco na sua máquina à nuvem, fala uma de três línguas:

Bloco: o fornecedor entrega setores crus e você faz o resto (particiona, formata, monta). É o disco local, o LUN de uma SAN via Fibre Channel ou iSCSI, o EBS da AWS. Latência mínima, flexibilidade total, e toda a responsabilidade do seu lado. Terreno vazio: construa o que quiser.

Arquivo: o fornecedor entrega um filesystem pronto pela rede, com diretórios, nomes, permissões e travas. É o NAS da firma via NFS ou SMB, o EFS da nuvem. Vários clientes enxergam os mesmos arquivos ao mesmo tempo. Apartamento mobiliado: é chegar e usar.

Objeto: o fornecedor entrega um balde de objetos acessados por chave via HTTP: PUT, GET, DELETE e acabou. Sem hierarquia de verdade (os "diretórios" são prefixos no nome), sem editar um pedaço do meio (mudou algo, regrava o objeto inteiro), metadados ricos, escala praticamente infinita e durabilidade altíssima por replicação. É o S3 e todos os seus imitadores (MinIO, GCS, Azure Blob). Guarda volumes de shopping: você entrega a caixa, recebe um ticket, e devolve o ticket pra ter a caixa de volta.

A escolha é menos sobre tecnologia e mais sobre padrão de acesso: banco de dados quer bloco, home de usuários e compartilhamento querem arquivo, e backup, mídia, data lake e tudo que cresce sem parar querem objeto.

## Backup: a única camada que perdoa erro humano

RAID protege contra disco morto, checksum protege contra disco mentiroso, journaling protege contra queda de luz. Nenhum deles protege contra o rm errado, o ransomware ou o bug que escreve lixo com sucesso em todas as réplicas ao mesmo tempo. Quem protege disso é backup, e backup tem uma regra de ouro com três números: pelo menos 3 cópias do dado, em 2 mídias ou sistemas diferentes, com 1 fora do prédio. Em 2026, leia "fora do prédio" também como "fora da conta e fora do alcance das mesmas credenciais", porque ransomware moderno procura e cifra o backup acessível antes de se anunciar.

Snapshots ajudam demais no "apaguei sem querer há dez minutos", mas snapshot no mesmo pool morre junto com o pool: ele vira backup de verdade quando é copiado pra outra máquina (o zfs send da vida, ou qualquer replicação). E a parte que todo mundo pula: backup que nunca foi restaurado em teste é uma esperança, não um backup. Agende restaurações de teste com a mesma seriedade com que agenda o backup.

## Operação e diagnóstico no dia a dia

Um kit de sobrevivência pra quando o armazenamento resolve ficar interessante:

lsblk mostra a árvore de dispositivos, partições e pontos de montagem: o raio X da pilha inteira. findmnt mostra o que está montado onde e com quais opções. df mostra o espaço por filesystem, e o detalhe que salva plantões: df com a opção i mostra inodes. Sim, um filesystem pode ter espaço livre de sobra e mesmo assim recusar arquivos novos porque os inodes acabaram, coisa que acontece de verdade em diretórios com milhões de arquivos minúsculos (fila de email, cache mal cuidado, sessões de PHP esquecidas desde 2019).

iostat com a opção x é o eletrocardiograma: IOPS, MB/s, latência média (await) e utilização por dispositivo. É aqui que você descobre que o disco "lento" entregando 20 MB/s está 100% ocupado, porque a carga é aleatória de blocos pequenos e o limite dele é IOPS, não banda.

smartctl conversa com o SMART do disco: setores realocados, erros de leitura, horas de uso, temperatura. SMART reclamando não diz quando o disco morre, mas disco com contador de setores realocados crescendo é disco com passagem comprada.

E o TRIM na prática: fstrim (ou a opção discard na montagem) avisa ao SSD quais blocos o filesystem liberou. Distribuições modernas agendam um fstrim semanal via systemd; se um SSD antigo anda degradando com o tempo, essa é a primeira coisa a conferir.

## Amarrando tudo: um mapa mental

Vale fechar com a visão de cima, porque armazenamento é uma pilha e cada camada responde uma pergunta diferente:

1. Mídia (HDD, SSD, NVMe): onde o bit mora e quão rápido ele acorda. SSD para latência e IOPS, HDD para capacidade barata.
2. Interface (SATA, SAS, NVMe, rede): a largura da porta entre a mídia e o resto.
3. Redundância (RAID por software ou hardware, RAIDZ): o que acontece quando (não se) um disco morre.
4. Gerência de volume (LVM, pools do ZFS, containers do APFS): espaço como saldo flexível em vez de cerca de concreto.
5. Filesystem (ext4, XFS, Btrfs, ZFS, APFS, UFS, NTFS): o bibliotecário que transforma blocos em arquivos, com journaling ou COW garantindo que uma queda de luz não vire tragédia.
6. E transversal a tudo: backup, porque nenhuma das camadas acima protege contra você mesmo.

Na hora de dimensionar, a pergunta nunca é "qual o melhor disco", e sim "qual o padrão de acesso": aleatório pequeno e síncrono (banco OLTP, virtualização) pede SSD NVMe e RAID 10 ou espelhos ZFS; sequencial grande (backup, mídia, warehouse) aceita HDD em RAID 6 ou RAIDZ2 com sorriso no rosto. Medir latência, IOPS e throughput separadamente, sempre perguntando o tamanho do bloco, evita 90% das discussões erradas sobre desempenho.

## Vinte perguntas pra se testar

Fundamentos só viram conhecimento quando respondem problema real. Então fecha o texto se testando nestas vinte, que são o tipo de coisa que aparece em plantão, migração e entrevista:

1. **Por que um disco entregando poucos MB/s pode estar saturado?** Porque o gargalo pode ser IOPS, não banda. 20 MB/s em blocos de 4K aleatórios são mais de 5 mil operações por segundo, muito além do que um HDD entrega. Olhe utilização e await no iostat, não só os MB/s.

2. **Por que apagar um arquivo nem sempre libera espaço?** Porque o espaço só volta quando a última referência morre: um processo com o arquivo aberto segura os blocos (o clássico "deletei o log gigante e o df não mudou", visível com lsof), hard links extras mantêm o inode vivo, e snapshots seguram os blocos antigos por definição.

3. **Quando uma escrita está realmente salva?** Quando o fsync retornou com sucesso e cada camada do caminho respeitou o flush. Um write que retornou é promessa; fsync é contrato. Reveja a seção do caminho da escrita.

4. **RAID substitui backup?** Não. RAID replica tudo com a mesma eficiência, inclusive o seu erro e o ransomware.

5. **Por que RAID 5 com discos grandes assusta?** Porque o rebuild demora horas ou dias com o array no talo, que é o momento mais provável de uma segunda falha, e a segunda falha no RAID 5 é fatal. Daí RAID 6 e RAIDZ2.

6. **IOPS alto garante throughput alto?** Não: são réguas diferentes ligadas pelo tamanho do bloco. Muitas operações minúsculas dão IOPS alto com banda baixa; poucas operações gigantes dão o contrário.

7. **Por que SSD muito cheio fica lento?** A garbage collection perde espaço de manobra, o wear leveling tem menos células livres pra revezar e o cache SLC encolhe. Deixar folga (overprovisioning) e manter o TRIM em dia resolve a maior parte.

8. **O que é o write hole do RAID 5?** A janela entre gravar o dado e gravar a paridade: uma queda de energia nesse meio tempo deixa paridade e dado inconsistentes sem ninguém avisar. O RAIDZ fecha essa janela porque a transação copy on write só vale quando está completa.

9. **O df mostra espaço livre, mas criar arquivo dá "No space left on device". Como?** Inodes esgotados. Confira com df no modo de inodes e procure o diretório com milhões de arquivos pequenos.

10. **Por que du e df discordam?** Arquivos deletados que seguem abertos por algum processo, os blocos reservados pro root (uns 5% no ext4) e arquivos esparsos fazem os dois medirem coisas diferentes.

11. **O que acontece se faltar luz no meio de uma escrita?** O que estava só em cache se perde (daí o fsync), mas journaling ou copy on write garantem que a estrutura do filesystem volte consistente: o diário termina ou desfaz a operação, o COW simplesmente nunca invalidou o estado antigo.

12. **Partição e volume são a mesma coisa?** Não. Partição é fatia fixa de um disco, gravada na tabela. Volume é a abstração onde o filesystem mora, e pode ser uma partição, vários discos ou uma fatia flexível de um pool.

13. **MBR ou GPT?** GPT, salvo arqueologia: MBR para em 2 TB e 4 partições primárias; GPT tem cópia reserva, checksum e é o esperado pelo boot UEFI.

14. **Por que alinhamento de partição importa?** Partição desalinhada faz cada escrita de 4K cair montada em dois setores físicos, transformando uma escrita em leitura mais duas escritas. Tudo fica lento e nenhum erro aparece.

15. **Vale pagar NVMe em vez de SSD SATA?** Pra latência, IOPS e cargas paralelas, sim: protocolo enxuto e dezenas de milhares de filas contra uma fila de 32. Pra guardar filme e backup, tanto faz.

16. **Por que o ZFS quer os discos crus, sem controladora RAID no meio?** Porque os checksums e o self healing precisam enxergar e controlar os discos de verdade. Controladora no meio esconde erros, mente sobre flush e atrapalha a reconstrução.

17. **Deduplicação do ZFS vale a pena?** Quase nunca: a tabela de dedup devora RAM e o ganho real costuma ser pequeno. Compressão LZ4, por outro lado, quase sempre vale ligar.

18. **O que é profundidade de fila e por que benchmark sempre cita?** É quantas operações estão em voo ao mesmo tempo. SSDs só mostram o IOPS de catálogo com fila funda; medir com fila 1 revela a latência pura de cada operação. Os dois números contam histórias diferentes.

19. **Disco quase ocioso, IOPS baixo, aplicação lenta. O que olhar?** Provável escrita síncrona serializada: uma thread chamando fsync e esperando cada confirmação. O que manda aí é a latência de cada operação, não a capacidade do disco. Olhe o await, procure fsync no rastro da aplicação e considere um SLOG ou cache com bateria.

20. **Snapshot é backup?** Só depois que vira cópia em outro sistema. No mesmo pool, snapshot morre junto com o pool, com o disco e com o ransomware que cifrar tudo.

## Nota

Escrevi esta revisão como exercício de consolidação: são os fundamentos que uso no dia a dia de infraestrutura, organizados na ordem em que eu gostaria de ter aprendido. Se algo aqui envelhecer (e em armazenamento as coisas envelhecem rápido, vide QLC, ZNS e os filesystems que o tempo levou), aceito correções de bom grado.
