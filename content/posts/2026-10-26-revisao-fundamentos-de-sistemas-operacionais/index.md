---
title: "Revisão: fundamentos de sistemas operacionais"
slug: "revisao-fundamentos-de-sistemas-operacionais"
date: '2026-10-26T14:00:00-03:00'
draft: false
description: "Uma revisão de sistemas operacionais de verdade: kernel, syscalls, processos, threads, escalonador, memória virtual, page cache, swap, sinais e boot, com o Linux em profundidade e um passeio por Windows, macOS e BSDs, em linguagem informal e com analogias."
tags:
- linux
- windows
minute: 48
---

Depois de revisar [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/) e [redes](/2026/10/26/revisao-redes-de-computadores/), faltava a peça que fica no meio das duas: o sistema operacional. É ele que transforma um disco em arquivos, uma placa de rede em sockets e um punhado de núcleos de CPU em centenas de programas rodando "ao mesmo tempo". A maior parte deste texto mora no Linux, porque é onde passo o dia, mas no final tem uma visita guiada por Windows, macOS e pela família BSD, sempre comparando com o que já vimos. Pega o café de novo.

## O problema que sistemas operacionais resolvem

Imagina um prédio com um único elevador, uma única cozinha e uma única caixa d'água, e cem moradores que acham que o prédio é só deles. Sem síndico, vira guerra: um morador prende o elevador no andar dele, outro esvazia a caixa d'água, um terceiro mexe na fiação da cozinha e derruba a luz de todo mundo. O sistema operacional é o síndico desse prédio, e ele tem três trabalhos:

1. **Abstração.** Ninguém quer conversar com o controlador do disco, com os registradores da placa de rede ou com a MMU do processador. O sistema operacional oferece conceitos fáceis no lugar: arquivo, socket, processo, memória contínua. É a diferença entre pedir "um copo d'água" e ter que operar a bomba da caixa d'água.
2. **Multiplexação.** Um processador com oito núcleos precisa parecer com cem processadores. Dezesseis gigas de RAM precisam parecer suficientes para programas que juntos pedem quarenta. O síndico reveza o elevador tão rápido que cada morador acha que ele está sempre disponível.
3. **Proteção.** Um programa com bug não pode derrubar os outros, e um programa malicioso não pode ler a memória do vizinho. Cada morador tem a chave só do próprio apartamento.

Guarda esses três verbos: abstrair, multiplexar e proteger. Todo o resto do texto é detalhe de como cada sistema faz isso.

## Kernel: o síndico e o seu escritório

O kernel é a parte do sistema operacional que roda com poder total sobre o hardware. Tudo o mais, o terminal, o navegador, o servidor web, o próprio ambiente gráfico, é programa comum pedindo coisas ao kernel. A grande briga de projeto, que rendeu uma das discussões mais famosas da internet (Torvalds contra Tanenbaum, em 1992), é sobre quanta coisa deve morar dentro desse escritório.

**Kernel monolítico.** Tudo dentro: escalonador, memória, filesystems, pilha de rede, drivers. É rápido, porque as partes conversam com chamadas de função simples, mas um driver com bug pode derrubar a máquina inteira. O Linux é monolítico, mas modular: drivers podem ser carregados e descarregados em tempo de execução como módulos, sem recompilar nada. Os BSDs seguem a mesma linha.

**Microkernel.** Só o mínimo no escritório: escalonamento, memória e troca de mensagens. Drivers e filesystems viram processos comuns que conversam por mensagens. Se um driver cai, é só reiniciar o processo dele. A conta chega em desempenho, porque cada pedido vira várias mensagens indo e voltando. Exemplos: Minix, QNX (que roda em carro e equipamento médico), seL4 (que tem prova matemática de correção).

**Kernel híbrido.** O meio termo que o mundo real escolheu quando queria o melhor dos dois. O kernel do Windows (NT) nasceu com ideias de microkernel, mas por desempenho trouxe quase tudo para dentro do modo privilegiado. O XNU, kernel do macOS, cola um microkernel Mach com uma camada BSD inteira, tudo rodando no mesmo espaço privilegiado.

Na prática, a fronteira entre "híbrido" e "monolítico com organização" é mais marketing do que engenharia. O que importa entender é a fronteira entre modo kernel e modo usuário.

## Modo usuário e modo kernel

O processador tem níveis de privilégio gravados no silício. Na arquitetura x86 eles se chamam anéis (ring 0 a ring 3), e na ARM, níveis de exceção (EL0 a EL3). Os sistemas operacionais modernos usam basicamente dois: o modo kernel, onde tudo é permitido, e o modo usuário, onde instruções perigosas causam uma exceção na hora.

No modo usuário, um programa não consegue falar direto com o disco, não consegue desligar interrupções, não consegue mexer nas tabelas de página e não consegue enxergar a memória de outro processo. Se tentar, o processador para tudo e chama o kernel, que normalmente responde matando o curioso.

É como a cozinha de um restaurante: o cliente fica no salão, e quando quer comida faz o pedido pelo balcão. Ele não entra na cozinha, não liga o fogão, não abre a câmara fria. O balcão é a chamada de sistema.

Uma consequência que aparece em gráfico de monitoramento: o tempo de CPU é dividido entre user (rodando código do programa) e system (rodando código do kernel em nome do programa). Um processo com muito tempo de system está fazendo muita chamada de sistema, o que costuma indicar I/O picado, muita troca de contexto ou alocação de memória em excesso.

## Chamadas de sistema: o balcão do restaurante

Uma syscall é o único jeito legítimo de um programa pedir algo ao kernel: abrir um arquivo (open), ler (read), escrever (write), criar processo (fork, clone), mapear memória (mmap), abrir socket (socket, connect, accept). O Linux tem por volta de 450 delas na arquitetura amd64.

O mecanismo é sempre parecido: o programa coloca o número da syscall e os argumentos em registradores e executa uma instrução especial (syscall, no amd64; svc, no ARM). O processador troca para modo kernel e pula para um endereço que o kernel registrou no boot. O kernel confere os argumentos (nunca confia em ponteiro vindo do usuário), faz o trabalho e devolve o resultado, ou um código de erro negativo que a biblioteca transforma no famoso errno.

Quase ninguém chama syscall na mão. Quem faz isso é a biblioteca C: a glibc na maioria das distribuições, a musl no Alpine. Quando seu programa em Python abre um arquivo, a pilha é: Python, depois a glibc, depois a instrução syscall, depois o kernel.

Três detalhes que caem em entrevista e em incidente:

1. **Syscall custa caro.** Não é absurdo, são centenas de nanossegundos, mas a troca de modo esvazia pipelines e, desde as mitigações de Meltdown e Spectre, pode envolver troca de tabela de páginas. Ler um arquivo um byte por vez faz uma syscall por byte. Buffer existe para isso.
2. **vDSO.** Algumas chamadas são tão frequentes e tão inofensivas (pegar a hora atual, por exemplo) que o kernel mapeia um pedacinho de código dentro do próprio processo que responde a elas sem trocar de modo. É o kernel deixando um bebedouro no salão para ninguém precisar pedir água no balcão.
3. **ABI estável.** O Linux tem uma regra sagrada: não se quebra o espaço do usuário. Um binário compilado em 2005 continua chamando as mesmas syscalls com os mesmos números. Windows e macOS não prometem isso: lá, o contrato estável é a biblioteca do sistema (ntdll e Win32 no Windows, libSystem no macOS), e os números das syscalls mudam entre versões. É por isso que o Go, que no Linux chama syscall direto, passou a usar a libc do sistema no macOS.

Para ver o balcão funcionando, o strace mostra cada syscall que um processo faz, com argumentos e retorno. Rodar strace num programa que "trava sem motivo" e ver que ele está parado num connect para um IP que ninguém lembra é uma das sensações mais satisfatórias da profissão.

## Processos: o apartamento de cada morador

Um processo é um programa em execução, com tudo o que ele precisa para fingir que está sozinho no mundo: um espaço de endereçamento próprio (a memória virtual), uma tabela de descritores de arquivos abertos, um conjunto de credenciais (usuário, grupo, capabilities), um diretório atual, variáveis de ambiente, limites de recursos e pelo menos uma thread de execução. Programa é a receita guardada na gaveta; processo é o bolo sendo feito, com a cozinha suja e o forno ligado.

### fork e exec: a forma estranha (e genial) do Unix criar processos

No Unix, um processo novo não nasce do nada. Ele nasce como cópia de outro, em dois passos:

1. **fork** duplica o processo atual. O filho é um clone quase perfeito do pai: mesma memória, mesmos arquivos abertos, mesmo ponto do código. A única diferença é o valor de retorno: o pai recebe o PID do filho, o filho recebe zero.
2. **exec** troca o programa que o processo está rodando. A memória é jogada fora e substituída pelo novo binário, mas o PID, os arquivos abertos e o ambiente continuam.

Quando você digita ls no terminal, o shell faz fork, o filho faz exec do ls, e o pai espera com wait. Parece desperdício copiar a memória inteira só para jogar tudo fora logo depois, e seria, se o fork copiasse de verdade. Ele não copia: usa **copy on write**. Pai e filho passam a compartilhar as mesmas páginas físicas, marcadas como somente leitura, e só quando um dos dois tenta escrever é que aquela página específica é duplicada. É como dois irmãos dividindo o mesmo livro e só tirando xerox da página que um deles quer rabiscar.

O separar em dois passos parece estranho, mas é o que deixa o shell fazer redirecionamento e pipe tão facilmente: entre o fork e o exec, o filho fecha e reabre descritores à vontade, e o programa novo herda tudo sem saber de nada.

### A árvore de processos e o PID 1

Todo processo tem um pai, o que forma uma árvore. Na raiz está o PID 1, o primeiro processo de espaço de usuário que o kernel inicia no boot. Na maioria das distribuições atuais, ele é o systemd. O pstree mostra essa árvore inteira, e vale rodar ao menos uma vez para perder o medo.

O PID 1 tem papéis especiais. Se ele morre, o kernel entra em pânico, porque o prédio ficou sem síndico. E ele adota todo processo que fica órfão.

### Zumbis e órfãos

Quando um processo termina, ele não some imediatamente. O kernel guarda uma entrada mínima com o código de saída, esperando que o pai venha buscar com wait. Nesse intervalo, o processo é um **zumbi**: morto, sem memória, sem CPU, mas ainda com uma linha na tabela de processos (estado Z no ps). Um zumbi não consome recurso real, mas milhares deles esgotam os PIDs disponíveis. Zumbi é sempre culpa do pai, que não está colhendo os filhos. Matar o zumbi não adianta, ele já está morto; o que resolve é consertar ou matar o pai.

Quando o pai morre antes do filho, o filho vira **órfão** e é adotado pelo PID 1 (ou por um processo marcado como subreaper, que o systemd usa para serviços). O adotante tem a obrigação de colher esses filhos quando eles terminarem. Guarde isso, porque vai voltar na parte de containers.

### Os estados de um processo

No ps e no top, a coluna de estado conta histórias:

1. **R (running ou runnable):** rodando ou na fila esperando CPU.
2. **S (sleeping interruptível):** esperando algo, como um pacote de rede, uma tecla ou um timer. É onde quase todo processo passa a vida.
3. **D (sleeping ininterruptível):** esperando algo que não pode ser abandonado no meio, quase sempre I/O de disco ou um NFS que sumiu. Nem SIGKILL tira um processo de D: o sinal fica pendente até a operação terminar. Muito processo em D é sintoma clássico de disco ou storage de rede agonizando.
4. **Z (zumbi):** já morreu, esperando o pai colher.
5. **T (parado):** congelado por SIGSTOP ou por um depurador.

### /proc: o prédio com as paredes de vidro

O Linux expõe cada processo como um diretório em /proc/PID, gerado na hora pelo kernel. Ali estão a linha de comando (cmdline), o ambiente (environ), os arquivos abertos (fd), o mapa de memória (maps e smaps), o status resumido, os limites (limits), os namespaces (ns) e muito mais. Ferramentas como ps, top e lsof não fazem mágica: elas leem /proc. Saber que ele existe transforma muito "não sei o que esse processo está fazendo" em "deixa eu olhar".

## Threads: várias mãos no mesmo apartamento

Uma thread é uma linha de execução dentro de um processo. Todas as threads de um processo compartilham a memória, os arquivos abertos e as credenciais; cada uma tem só a própria pilha, os próprios registradores e o próprio estado de escalonamento. Se o processo é o apartamento, as threads são os moradores dele: dividem a geladeira e o sofá, mas cada um tem o próprio corpo e pode estar num cômodo diferente.

A vantagem é óbvia: trocar dados entre threads é só ler a mesma variável, sem copiar nada. A desvantagem também: dois moradores mexendo na mesma panela ao mesmo tempo dá condição de corrida, e é para isso que existem mutex, semáforo e operações atômicas. Bug de concorrência é o tipo de bug que some quando você liga o log, porque o log muda o tempo das coisas.

### No Linux, thread e processo são a mesma coisa

Aqui o Linux tem uma elegância particular. Para o kernel, não existe uma estrutura "processo" e outra "thread": existe a **task**. Tanto fork quanto a criação de thread usam a mesma syscall por baixo, clone, que recebe uma lista de flags dizendo o que compartilhar com o pai: memória, arquivos, tratadores de sinal, e assim por diante. Compartilha quase tudo, você tem uma thread. Não compartilha nada, você tem um processo. O que chamamos de PID de um processo multithread é, na verdade, o ID da primeira thread dele (o TGID, thread group ID). Por isso o top com a visão de threads mostra "PIDs" que não aparecem no ps comum.

A biblioteca de threads padrão (NPTL, dentro da glibc) mapeia cada thread do programa para uma task do kernel, no modelo um para um. Linguagens como Go e Erlang preferem outro caminho: criam milhares ou milhões de "threads leves" (goroutines, processos do Erlang) e as distribuem por poucas threads reais. É o modelo M para N, que troca o custo da criação de thread no kernel por um escalonador dentro da própria linguagem.

## Escalonador: quem usa o elevador agora

O escalonador decide qual task roda em qual núcleo, e por quanto tempo. Num servidor com oito núcleos e trezentas tasks prontas, ele toma essa decisão milhares de vezes por segundo.

### Preempção e troca de contexto

Sistemas modernos são **preemptivos**: o kernel não espera a task devolver a CPU por educação. Um timer de hardware interrompe o processador periodicamente, o kernel olha a fila e decide se alguém mais merece rodar. Se sim, faz uma **troca de contexto**: salva os registradores da task atual, carrega os da próxima e, se for de outro processo, troca o espaço de endereçamento.

Troca de contexto não é de graça. O custo direto é de microssegundos, mas o indireto é maior: os caches da CPU e o TLB estavam cheios de dados da task anterior, e a próxima começa com o cache "frio". É como um chef que, a cada cinco minutos, precisa guardar todos os ingredientes do prato atual e tirar os de outro prato. Muita troca de contexto (que o vmstat mostra na coluna cs) é sinal de threads demais brigando por pouca CPU, ou de lock disputado.

### De CFS a EEVDF

Por quinze anos, o escalonador padrão do Linux foi o **CFS** (Completely Fair Scheduler). A ideia dele é linda: cada task acumula um "tempo virtual de execução", e quem rodou menos vai primeiro. As tasks ficam numa árvore ordenada por esse tempo, e o escalonador sempre pega a da ponta esquerda, que é a mais "injustiçada". Não existe fatia de tempo fixa; a CPU é dividida proporcionalmente.

No kernel 6.6, de 2023, o CFS foi substituído pelo **EEVDF** (Earliest Eligible Virtual Deadline First). Ele mantém a ideia de justiça, mas acrescenta o conceito de prazo: cada task tem um prazo virtual, e tasks que pedem fatias curtas (tipicamente as interativas e sensíveis à latência) ganham prazos mais próximos. A diferença prática é menos ajuste manual de heurísticas e latência melhor para quem acorda, faz pouco e dorme de novo. Desde o 6.12 existe ainda o **sched_ext**, que deixa escrever escalonadores inteiros em eBPF e trocar sem reiniciar.

### nice, prioridades e tempo real

O **nice** vai de menos 20 a mais 19 e diz o quanto uma task é "boazinha": quanto maior, mais ela cede CPU para os outros. Cada ponto de nice muda o peso em cerca de 10%. Rodar um backup pesado com nice 19 é a forma educada de não atrapalhar o resto. Para I/O, existe o equivalente ionice.

Além das tasks normais, o Linux tem classes de **tempo real**. SCHED_FIFO e SCHED_RR têm prioridade absoluta sobre qualquer task normal: uma task FIFO pronta roda até terminar ou dormir, sem ninguém tirar a vez dela. SCHED_DEADLINE vai além e recebe garantias explícitas, como "preciso de 2 ms a cada 10 ms". É poder de verdade, e uma task de tempo real em loop infinito consegue travar um núcleo inteiro. Por isso o kernel reserva por padrão 5% do tempo para as tasks normais, como freio de mão.

### Load average: o número mais mal interpretado do Linux

O uptime mostra três números: a média de carga em 1, 5 e 15 minutos. Esse número é a quantidade média de tasks querendo CPU, ou seja, rodando ou na fila. Num servidor com quatro núcleos, carga 4 significa "ocupado, mas sem fila"; carga 12 significa que, em média, oito tasks estão esperando a vez.

A pegadinha: no Linux, a carga **também conta tasks em estado D**, aquelas presas esperando disco. Então um servidor com carga 50 e CPU 95% ociosa não está com falta de processador. Está com um storage morrendo e um monte de processos presos esperando por ele. Carga alta sempre pede a pergunta seguinte: é CPU ou é I/O?

Para uma resposta melhor que o load average, o kernel oferece o **PSI** (pressure stall information) em /proc/pressure: para CPU, memória e I/O, ele diz qual porcentagem do tempo as tasks ficaram travadas esperando aquele recurso. É o load average que a gente queria ter tido desde sempre.

### Afinidade, NUMA e hyperthreading

Um processador moderno não é um bloco uniforme. Os núcleos compartilham cache em grupos, servidores com dois soquetes têm memória "perto" e "longe" de cada CPU (o tal **NUMA**), e cada núcleo físico pode aparecer como dois lógicos graças ao hyperthreading (o SMT), que dividem a mesma unidade de execução. O escalonador tenta manter cada task perto dos seus dados, e dá para forçar com afinidade de CPU (taskset) e de memória (numactl). Em banco de dados grande e em aplicação de baixa latência, uma task migrando de soquete pode custar uma fração boa de desempenho, porque toda a memória dela passa a ser acessada "de longe".

## Memória virtual: a grande mentira útil

Esta é a ideia mais importante de todo o texto. Cada processo enxerga um espaço de endereçamento enorme e só dele: no amd64, 128 terabytes só para o espaço do usuário. O endereço 0x400000 do processo A não tem nada a ver com o 0x400000 do processo B. Nenhum dos dois sabe onde os dados moram fisicamente, e nenhum consegue nem formular um endereço que aponte para a memória do outro.

É como um hotel em que cada hóspede recebe um mapa dizendo "seu quarto é o 101". Todos os hóspedes acham que estão no 101. Quem sabe qual é o quarto físico de cada um é a recepção, e ela pode inclusive mudar alguém de quarto no meio da noite sem que ele perceba.

### Páginas, tabelas de páginas e MMU

A memória é dividida em **páginas**, normalmente de 4 KB. O kernel mantém, para cada processo, uma **tabela de páginas** dizendo qual página virtual corresponde a qual página física (e com quais permissões: leitura, escrita, execução). Quem consulta essa tabela a cada acesso à memória não é o kernel, é o hardware: a **MMU**, dentro do processador. No amd64 a tabela tem quatro ou cinco níveis, como um endereço com país, estado, cidade, rua e número.

Percorrer quatro níveis de tabela a cada acesso seria lento demais, então a MMU tem um cache só para traduções: o **TLB**. Ele é pequeno (centenas a poucos milhares de entradas) e extremamente rápido. Quando a tradução está no TLB, o custo é quase zero; quando não está, a CPU precisa caminhar pela tabela. Trocar de processo invalida boa parte do TLB, um dos motivos de troca de contexto ser cara.

### Page fault: nem todo erro é erro

Quando um processo acessa uma página que não está mapeada, a MMU gera uma exceção chamada **page fault**, e o kernel decide o que fazer. Na imensa maioria das vezes, não é erro nenhum:

1. **Minor fault:** a página existe na RAM, só não estava ligada a esse processo ainda. Acontece com memória recém alocada (o kernel só entrega a página física no primeiro acesso), com bibliotecas compartilhadas já carregadas por outro processo e com o copy on write depois de um fork. Custa microssegundos.
2. **Major fault:** a página precisa ser lida do disco, seja de um arquivo mapeado, seja da swap. Custa o tempo de um I/O, ou seja, de microssegundos a milissegundos. Muito major fault é sintoma de memória apertada.
3. **Acesso inválido:** o endereço não pertence a nada, ou o processo tentou escrever onde só podia ler. Aí o kernel manda SIGSEGV e o programa morre com o famoso segmentation fault.

### Alocação preguiçosa e overcommit

Quando um programa pede 1 GB com malloc, o kernel não entrega 1 GB de RAM. Ele só anota "esse intervalo de endereços é seu" e vai entregando páginas físicas conforme o programa toca nelas. É como reservar uma mesa para vinte pessoas num restaurante que só põe pratos na mesa quando cada convidado senta.

Por isso, a soma da memória "pedida" por todos os processos pode passar muito da RAM existente, e o Linux deixa: isso é o **overcommit**. A política fica em vm.overcommit_memory: no modo 0 (padrão) o kernel usa uma heurística e recusa só pedidos absurdos; no modo 1 aceita tudo; no modo 2 faz conta rígida e recusa o que passar de um limite. Overcommit funciona porque a maioria dos programas pede mais do que usa. Quando todos resolvem usar ao mesmo tempo, entra em cena o OOM killer, que vamos ver logo adiante.

### VSZ, RSS e PSS: as três réguas da memória de um processo

1. **VSZ (tamanho virtual):** tudo o que o processo reservou de endereço. É inflado e quase inútil para saber consumo real: uma JVM pode ter VSZ de 20 GB usando 2.
2. **RSS (resident set size):** quanto do processo está de fato na RAM agora. Mais útil, mas conta duas vezes o que é compartilhado. Vinte processos usando a mesma biblioteca de 10 MB aparecem como 200 MB somados.
3. **PSS (proportional set size):** divide o compartilhado entre quem compartilha. Aquela biblioteca de 10 MB conta 0,5 MB para cada um dos vinte. Somar o PSS de todos os processos dá algo próximo da realidade. Ele aparece em /proc/PID/smaps_rollup.

### mmap e huge pages

O **mmap** mapeia um arquivo (ou memória anônima) diretamente no espaço de endereçamento. Ler o arquivo vira acessar memória, e o kernel cuida de trazer as páginas do disco conforme os page faults acontecem. É assim que o carregador de programas coloca binários e bibliotecas na memória, e é a técnica favorita de bancos como LMDB e o antigo motor do MongoDB.

As **huge pages** são páginas de 2 MB ou 1 GB em vez de 4 KB. Uma única entrada do TLB passa a cobrir 512 vezes mais memória, o que derruba os erros de TLB em programas que mexem em muita memória (bancos de dados, JVMs gigantes, máquinas virtuais). O Linux tem huge pages explícitas, reservadas de antemão, e as **THP** (transparent huge pages), que o kernel cria sozinho. As THP são polêmicas: o trabalho de compactar memória para montar páginas grandes pode causar picos de latência, e por isso Redis, MongoDB e vários bancos recomendam deixar as THP no modo madvise (só para quem pedir) em vez de always.

## Page cache: por que o Linux "come" toda a RAM

Aqui mora a pergunta que todo mundo já fez ao rodar free pela primeira vez: por que o servidor com quase nada rodando mostra a memória "toda usada"?

Porque memória livre é memória desperdiçada. O Linux usa toda a RAM sobrando como **page cache**: uma cópia em memória dos pedaços de arquivo que foram lidos ou escritos recentemente. Quando um programa lê um arquivo pela segunda vez, a leitura vem da RAM, centenas a milhares de vezes mais rápido que o disco. Quando alguém precisa de memória de verdade, o kernel simplesmente descarta páginas limpas do cache, sem custo algum, e as entrega.

É como uma geladeira de escritório: em vez de deixar a geladeira vazia "para caso alguém precise", você enche de coisa que o pessoal provavelmente vai querer. Se alguém chega com uma marmita, você tira um iogurte da prateleira e dá espaço. Ninguém precisa pedir licença.

Por isso, no free, a coluna que importa é **available**, não free. Ela estima quanto pode ser entregue a programas novos sem swap, contando o cache descartável. Um servidor com free baixíssimo e available alto está saudável e bem aproveitado.

### Escrita: dirty pages e writeback

Na escrita, o caminho é o mesmo que vimos no artigo de armazenamento: o write copia os dados para o page cache, marca a página como **suja** (dirty) e retorna. Quem leva para o disco depois são as threads de **writeback** do kernel. Dois controles governam isso: vm.dirty_background_ratio (a partir de quanto sujo o kernel começa a escrever em segundo plano) e vm.dirty_ratio (a partir de quanto ele começa a obrigar o próprio processo que escreve a esperar). Máquinas com muita RAM e disco lento podem acumular gigas de páginas sujas e depois engasgar tudo num flush gigante. Quem precisa de garantia chama fsync, e isso continua sendo a diferença entre promessa e contrato.

Uma ferramenta de laboratório: escrever 3 em /proc/sys/vm/drop_caches descarta o cache limpo. Serve para medir desempenho "a frio" em benchmark. Em produção não serve para nada além de deixar tudo mais lento por alguns minutos, e a vontade de colocar isso num cron "para liberar memória" deve ser combatida.

## Swap e o OOM killer: quando a mentira cobra a conta

### Swap

A **swap** é uma área no disco (partição ou arquivo) para onde o kernel pode mover páginas **anônimas** de memória, aquelas que não vieram de arquivo nenhum, como heap e pilha. Páginas de arquivo não precisam de swap: se estão limpas, o kernel descarta e lê de novo do arquivo original depois.

A swap tem uma má fama parcialmente injusta. Um pouco de swap é saudável: permite tirar da RAM aquelas páginas que um processo alocou na inicialização e nunca mais tocou, liberando espaço para o page cache. O que é ruim é **thrashing**: memória tão apertada que o sistema passa o tempo todo levando páginas para o disco e trazendo de volta. Aí tudo fica lento, os major faults explodem e a máquina parece travada sem estar.

O vm.swappiness (de 0 a 200, padrão 60) regula a preferência do kernel entre descartar page cache e mandar memória anônima para a swap. Valores baixos protegem a memória dos processos; valores altos protegem o cache. Uma alternativa moderna que muita distribuição desktop adotou é o **zram**: uma swap dentro da própria RAM, comprimida. Parece paradoxal, mas comprimir uma página custa muito menos que escrever no disco, e dados de memória costumam comprimir bem.

### OOM killer

Quando a memória realmente acaba, sem cache para descartar e sem swap para usar, o kernel tem duas opções: travar ou matar alguém. Ele escolhe matar. O **OOM killer** (out of memory) calcula uma pontuação para cada processo, basicamente proporcional à memória que ele usa, e mata o mais "caro". O dmesg registra a execução com detalhes.

O comportamento pode ser ajustado por processo com /proc/PID/oom_score_adj, de menos 1000 (nunca me mate) a mais 1000 (me mate primeiro). O sshd costuma ter ajuste negativo, para você conseguir entrar na máquina depois do caos.

Dois detalhes do mundo real. Primeiro, o OOM killer do kernel age tarde, quando a máquina já está agonizando há minutos; por isso existem os matadores em espaço de usuário, como o oomd do systemd e o earlyoom, que olham o PSI de memória e agem antes. Segundo, em containers e Kubernetes, quem dispara o OOM normalmente não é a falta de RAM da máquina: é o limite do **cgroup**. O container passou do memory.max dele e o kernel mata algum processo lá dentro, mesmo com a máquina cheia de memória livre. É o famoso OOMKilled, que a gente vai entender melhor na parte de cgroups.

## Sinais: o interfone do prédio

Sinais são notificações assíncronas que o kernel entrega a um processo. É o interfone tocando: o morador pode atender e fazer algo, pode ignorar, ou, para alguns toques, não tem escolha nenhuma. Cada sinal tem uma ação padrão, e o processo pode instalar tratadores para a maioria deles.

Os que você precisa conhecer de cor:

1. **SIGTERM (15):** "por favor, encerre". É o pedido educado, o padrão do kill. Um bom programa trata esse sinal, termina o trabalho em andamento, fecha conexões e sai.
2. **SIGKILL (9):** morte imediata, executada pelo kernel. Não pode ser tratado, bloqueado nem ignorado. Nada de limpeza, nada de flush. É desligar o disjuntor do apartamento.
3. **SIGINT (2):** o Ctrl+C do terminal. Por padrão encerra, mas programas interativos costumam tratar.
4. **SIGHUP (1):** originalmente "o terminal desligou". Por convenção, muitos daemons o usam como "releia sua configuração", como o nginx.
5. **SIGSTOP e SIGCONT:** congela e descongela. O SIGSTOP, como o SIGKILL, não pode ser tratado. O Ctrl+Z do terminal manda o primo tratável, SIGTSTP.
6. **SIGCHLD:** avisa o pai que um filho mudou de estado. É a deixa para chamar wait e não criar zumbi.
7. **SIGSEGV e SIGBUS:** acesso inválido à memória. O programa normalmente morre, deixando um core dump se configurado.
8. **SIGPIPE:** escreveu num pipe ou socket cujo outro lado fechou. Servidores de rede quase sempre ignoram esse sinal e tratam o erro EPIPE no lugar, para não morrer porque um cliente fechou a conexão.

O código de saída de um processo morto por sinal é 128 mais o número do sinal. Por isso aparece 137 no Kubernetes (128 mais 9, morto por SIGKILL, quase sempre por OOM ou por estourar o tempo de encerramento) e 143 (128 mais 15, encerrado por SIGTERM).

### O problema do PID 1 em containers

Lembra que o PID 1 é especial? O kernel protege o PID 1 de sinais que ele não trata explicitamente: se o PID 1 não instalou tratador para SIGTERM, o sinal é simplesmente ignorado. Num servidor, o PID 1 é o systemd, que trata tudo. Num container, o PID 1 é... a sua aplicação, porque o container tem seu próprio namespace de PIDs.

Resultado clássico: sua aplicação não trata SIGTERM, você roda docker stop, nada acontece, e dez segundos depois o Docker manda SIGKILL. Sem encerramento gracioso, conexões cortadas, requisições perdidas. E, se sua aplicação cria subprocessos, ela também herda a obrigação de colher os órfãos, senão acumula zumbis. A solução é ou tratar os sinais direito, ou usar um init mínimo como PID 1 (tini, dumb init, ou a opção init do Docker), que repassa sinais e colhe zumbis. Outro erro comum é usar a forma "shell" no CMD do Dockerfile: aí o PID 1 é o sh, que não repassa SIGTERM para a aplicação.

## Arquivos e descritores: tudo é arquivo (quase)

A filosofia Unix diz que tudo é arquivo, e o Linux leva isso a sério. Arquivo comum, diretório, dispositivo (/dev/sda, /dev/null), pipe, socket, terminal, até um timer ou um evento: tudo se lê e escreve com as mesmas syscalls read e write.

Quando um processo abre algo, o kernel devolve um número inteiro pequeno, o **descritor de arquivo** (file descriptor). É o número da ficha no guarda volumes: você não carrega a bagagem, carrega o número, e o kernel sabe o que está do outro lado. Todo processo nasce com três descritores abertos: 0 (entrada padrão), 1 (saída padrão) e 2 (saída de erro). O redirecionamento do shell, aquele 2>&1, é literalmente "faça o descritor 2 apontar para onde aponta o 1".

Detalhes que dão incidente:

1. **Limite de descritores.** Cada processo tem um limite (o ulimit de nofile, que em muita distribuição ainda é 1024 por padrão para shells). Um servidor com milhares de conexões estoura isso e começa a dar "Too many open files". No systemd, o limite de um serviço é definido na unit com LimitNOFILE.
2. **Vazamento de descritor.** Programa que abre e esquece de fechar acaba batendo no limite depois de horas ou dias. Contar as entradas em /proc/PID/fd ao longo do tempo denuncia o vazamento.
3. **Arquivo deletado que não libera espaço.** Apagar um arquivo só remove o nome. Enquanto algum processo tiver um descritor aberto para ele, os blocos continuam ocupados. O lsof com a opção de mostrar arquivos com contagem de links zero (ou procurar "deleted" em /proc/PID/fd) encontra o culpado, que quase sempre é um log rotacionado errado.

### Esperando muitas coisas ao mesmo tempo

Um servidor com dez mil conexões não pode ter dez mil threads paradas em read. A solução é perguntar ao kernel "me avise quando qualquer um desses descritores tiver algo". Cada sistema tem seu mecanismo: **epoll** no Linux, **kqueue** nos BSDs e no macOS, **IOCP** no Windows. É isso que está debaixo do nginx, do Node.js, do runtime do Go e de praticamente todo servidor de alto desempenho.

O Linux tem ainda o **io_uring**, desde 2019: duas filas circulares compartilhadas entre o processo e o kernel, uma de pedidos e outra de respostas. O programa enfileira dezenas de operações de I/O de uma vez e colhe os resultados depois, quase sem syscall. É o modelo mais próximo do IOCP do Windows que o Linux já teve, e mudou o jogo para bancos de dados e storage de alto desempenho.

## Boot: do botão de ligar ao prompt de login

Ligar um computador é uma corrida de revezamento em que cada corredor só sabe o suficiente para entregar o bastão ao próximo.

1. **Firmware (UEFI).** Ao ligar, a CPU começa a executar o firmware gravado na placa mãe. Ele testa o hardware básico, inicializa a memória e procura algo para dar boot. No mundo UEFI, isso é um arquivo executável numa partição especial formatada em FAT, a **ESP** (EFI System Partition). No mundo antigo da BIOS, era o código nos primeiros 446 bytes do disco, no MBR. Aqui entra o **Secure Boot**: o firmware só executa o próximo estágio se ele estiver assinado por uma chave confiável.
2. **Bootloader.** O GRUB (ou o boot loader do systemd, mais simples) mostra o menu, lê a configuração e carrega na memória duas coisas: a imagem do kernel (o arquivo vmlinuz em /boot) e o **initramfs**. Passa também a linha de comando do kernel, com parâmetros como qual é o disco raiz (root), se é para ficar quieto (quiet) e outros ajustes.
3. **Kernel.** O kernel se descomprime, inicializa a memória virtual, o escalonador, detecta CPUs e dispositivos, e monta o initramfs como sistema de arquivos raiz provisório.
4. **initramfs.** É um mini sistema de arquivos em memória com o necessário para encontrar o disco raiz de verdade: módulos de driver do controlador de disco, ferramentas de LVM, de RAID, de criptografia (é aqui que ele pede a senha do LUKS), de rede se a raiz for remota. Ele existe porque o kernel genérico de uma distribuição não pode ter todos os drivers do mundo embutidos. Achado o disco, ele monta a raiz real e troca para ela (switch_root).
5. **PID 1.** O kernel executa /sbin/init, que hoje quase sempre é o systemd. A partir daqui, é espaço de usuário.
6. **systemd e os targets.** O systemd lê as units, monta o grafo de dependências e sobe em paralelo tudo o que é necessário para chegar ao target padrão: multi user (servidor, só texto) ou graphical (com ambiente gráfico). No fim aparece o login.

Quando o boot falha, saber em qual corredor o bastão caiu já é metade do diagnóstico. Tela do firmware e nada mais: problema na ESP ou no Secure Boot. Prompt do GRUB: configuração ou /boot corrompidos. Kernel panic dizendo que não consegue montar a raiz: initramfs sem o driver ou parâmetro root errado. Cai num shell de emergência: alguma unit essencial falhou, frequentemente uma linha errada no fstab. O systemd analyze mostra quanto tempo cada etapa levou, e o journalctl com a opção de boot mostra os logs só do boot atual.

## systemd: o síndico moderno

Nenhum assunto do Linux gera tanta briga quanto o systemd, mas ele venceu: está em praticamente toda distribuição grande. Vale entender o que ele faz além de ser PID 1.

Tudo no systemd é uma **unit**, descrita num arquivo de texto declarativo. As principais:

1. **service:** um daemon ou tarefa. Define o comando, o usuário, a política de reinício (Restart), limites de recursos e dependências.
2. **socket:** o systemd abre a porta e só inicia o serviço quando chega a primeira conexão. É a ativação por socket, herdada do inetd e do launchd do macOS.
3. **timer:** o substituto moderno do cron, com logs integrados e a capacidade de rodar tarefas perdidas enquanto a máquina estava desligada.
4. **mount, target, path, slice:** pontos de montagem, grupos de units, gatilhos por mudança em arquivo e hierarquias de recursos.

Três coisas que o systemd trouxe e que mudaram a operação:

1. **Cada serviço num cgroup.** Quando um serviço é parado, o systemd mata todos os processos dele, inclusive os netos que fugiram da árvore. Acabou o daemon que deixava processo órfão para trás.
2. **journald.** Logs estruturados, indexados por unit, por boot e por prioridade, consultados com journalctl. O texto pesquisável continua existindo, mas agora com metadados confiáveis.
3. **Isolamento de graça.** Opções como PrivateTmp, ProtectSystem, NoNewPrivileges e DynamicUser aplicam namespaces e restrições em qualquer serviço com uma linha cada. É sandboxing de container sem container.

## Usuários, permissões e o resto da segurança

### O modelo clássico

Todo processo roda com um **UID** (usuário) e um ou mais **GIDs** (grupos). Todo arquivo tem um dono, um grupo e nove bits de permissão: leitura, escrita e execução para dono, grupo e outros. Em diretório, "execução" significa poder entrar e atravessar. O UID 0, o root, ignora quase todas as verificações.

Alguns bits especiais completam o quadro. O **setuid** num executável faz o processo rodar com o UID do dono do arquivo, não de quem executou: é assim que o passwd, rodado por um usuário comum, consegue alterar um arquivo que só o root edita. Poderoso e perigoso, porque um bug num programa setuid root é uma escalada de privilégio pronta. O **sticky bit** no /tmp impede que um usuário apague arquivos de outro num diretório compartilhado.

### Capabilities: picotando o root

Ser root é tudo ou nada, e isso é perigoso. O Linux divide o poder do root em cerca de quarenta **capabilities** independentes: CAP_NET_BIND_SERVICE (abrir porta abaixo de 1024), CAP_NET_ADMIN (mexer em rede), CAP_SYS_ADMIN (um saco de gatos que é quase root inteiro), CAP_SYS_PTRACE (depurar outros processos) e assim por diante. Um servidor web pode receber só a capability de abrir a porta 443 e mais nada. Containers rodam por padrão com um subconjunto reduzido, e o modo privileged devolve todas, o que é basicamente desistir do isolamento.

### Controle de acesso obrigatório e seccomp

As permissões clássicas são **discricionárias**: o dono do arquivo decide. O **MAC** (controle de acesso obrigatório) acrescenta regras que nem o dono, nem o root, conseguem contornar. O **SELinux** (padrão em Red Hat, Fedora e Android) rotula cada processo e arquivo e define quem pode tocar em quê. O **AppArmor** (padrão em Ubuntu e SUSE) faz algo parecido com perfis baseados em caminho, mais fácil de entender e menos granular. A primeira reação de todo mundo diante de um "Permission denied" misterioso é desligar o SELinux; a segunda, mais sábia, é olhar o log de auditoria e ajustar a política.

O **seccomp** restringe quais syscalls um processo pode fazer. Docker e Kubernetes aplicam um perfil padrão que bloqueia dezenas de chamadas perigosas e raramente usadas. Se a aplicação não precisa montar filesystems nem carregar módulos de kernel, ela não deve conseguir pedir isso.

## Namespaces e cgroups: os tijolos dos containers

Um container não é uma máquina virtual pequena. É um processo comum, rodando no mesmo kernel do host, com duas coisas aplicadas: namespaces, que controlam **o que ele vê**, e cgroups, que controlam **quanto ele pode usar**. Entendeu isso, entendeu containers.

### Namespaces: o que o processo enxerga

Cada namespace isola uma visão do sistema. É como colocar antolhos no cavalo: o mundo continua inteiro lá, mas ele só enxerga a faixa dele.

1. **mnt:** a árvore de pontos de montagem. O container vê seu próprio sistema de arquivos raiz.
2. **pid:** a numeração de processos. Dentro, a aplicação é PID 1; fora, é um PID qualquer.
3. **net:** interfaces, rotas, regras de firewall e portas. Cada container tem seu próprio localhost.
4. **uts:** o hostname.
5. **ipc:** filas de mensagem e memória compartilhada do System V.
6. **user:** a numeração de usuários. O processo pode ser root dentro do namespace sem ser root fora. É a base dos containers rootless.
7. **cgroup e time:** a visão da hierarquia de cgroups e, nos kernels recentes, os relógios.

Dá para ver os namespaces de qualquer processo em /proc/PID/ns, e para entrar neles com nsenter. É a forma mais crua de "entrar num container" sem precisar do runtime.

### cgroups: quanto o processo pode usar

Os **control groups** organizam processos numa hierarquia e aplicam limites e contabilidade a cada grupo. Na versão 2 (o padrão atual, unificada), cada grupo é um diretório em /sys/fs/cgroup com arquivos de controle:

1. **memory.max:** o teto de memória. Passou, entra o reclaim e, se não adiantar, o OOM killer dentro do grupo. É exatamente o limit de memória de um pod no Kubernetes.
2. **cpu.max:** uma cota de CPU por período, como "50 ms a cada 100 ms" para meio núcleo. É o limit de CPU do Kubernetes, e é aqui que mora o **throttling**: o container gastou sua cota no começo do período e fica parado esperando o próximo, mesmo com a máquina ociosa. Latência estranha em aplicação com limit de CPU baixo quase sempre é isso, e o arquivo cpu.stat do grupo mostra quantas vezes aconteceu.
3. **cpu.weight:** a divisão proporcional quando há disputa. É o que o request de CPU do Kubernetes vira.
4. **io.max e pids.max:** limites de I/O por dispositivo e de quantidade de processos, a vacina contra fork bomb.

Para onde quer que você olhe no Linux moderno, tem cgroup: o systemd organiza cada serviço e cada sessão de usuário num grupo, o Kubernetes organiza cada pod e cada container, e o OOM killer, o PSI e a contabilidade de recursos respeitam essa hierarquia.

Somando tudo: um container é um processo com namespaces próprios, preso num cgroup, com algumas capabilities removidas, um perfil de seccomp, talvez um perfil de AppArmor ou SELinux, e um sistema de arquivos raiz montado em camadas pelo overlayfs. Nada de mágica, só várias peças do kernel juntas.

## Drivers, módulos, /sys e udev

O kernel conversa com o hardware através de **drivers**, e no Linux a maioria deles é compilada como **módulo**: um arquivo .ko carregado sob demanda. O lsmod lista os módulos carregados, o modprobe carrega um módulo com as dependências dele, e o modinfo mostra parâmetros e versão. Módulo fora da árvore oficial do kernel (o driver da NVIDIA é o exemplo eterno) "contamina" o kernel, que passa a marcar os logs como tainted, e precisa ser recompilado a cada atualização, geralmente via DKMS.

O **/sys** (sysfs) é o irmão organizado do /proc: expõe a árvore de dispositivos, barramentos, drivers e seus atributos como arquivos. É ali que se lê a velocidade de um link de rede, o agendador de I/O de um disco ou a temperatura de um sensor.

O **udev** é o serviço que reage quando um dispositivo aparece: o kernel anuncia "chegou um disco USB", e o udev cria o arquivo em /dev, dá nome estável (como os de /dev/disk/by-uuid, que sobrevivem à troca de ordem dos discos), ajusta permissões e dispara regras. Os nomes de interface de rede como enp3s0, que substituíram o eth0, também saem daqui.

E o **dmesg** é o diário do kernel: detecção de hardware, erros de disco, execuções do OOM killer, segfaults, quedas de link. É o primeiro lugar para olhar quando algo de baixo nível dá errado, e o journalctl com a opção de kernel mostra o mesmo com mais conforto.

## Distribuições: o mesmo motor, carros diferentes

Linux, estritamente, é só o kernel. O que você instala é uma **distribuição**: o kernel mais a biblioteca C, o init, as ferramentas básicas, o gerenciador de pacotes e milhares de programas, empacotados e testados juntos. As diferenças que importam no dia a dia:

1. **Pacotes:** deb com apt (Debian, Ubuntu), rpm com dnf (Fedora, RHEL e derivados), pacman (Arch), apk (Alpine).
2. **Ciclo de vida:** distribuições estáveis com suporte longo (Debian, RHEL, Ubuntu LTS) trocam novidade por previsibilidade; as de lançamento contínuo (Arch, Fedora em ritmo rápido, openSUSE Tumbleweed) trazem kernel e programas novos a toda hora.
3. **Biblioteca C:** quase todas usam glibc, mas o Alpine usa musl, que é menor e mais simples. Binário compilado contra glibc frequentemente não roda no Alpine, e algumas diferenças de comportamento (resolução de DNS, desempenho do alocador de memória) já causaram muito incidente em imagem de container "otimizada".
4. **Init:** systemd quase em toda parte; OpenRC no Alpine e no Gentoo; runit no Void.

## Observando o Linux: o kit de bancada

Um roteiro honesto para "o servidor está lento", do mais geral ao mais específico, na linha do método USE (utilização, saturação e erros de cada recurso):

1. **uptime:** a carga. Alta? É CPU ou é I/O?
2. **dmesg:** o kernel reclamou de algo? OOM killer, erro de disco, segfault?
3. **vmstat a cada segundo:** fila de execução (r), processos bloqueados (b), swap entrando e saindo (si e so), troca de contexto (cs), e a divisão da CPU em user, system, idle e wait. Uma linha de vmstat diz mais do que uma tela de dashboard.
4. **top ou htop:** quem está comendo CPU e memória. Atenção à coluna de estado e ao tempo em wait.
5. **free:** olhe o available, não o free.
6. **iostat e pidstat:** quem está fazendo I/O, quanto e com que latência.
7. **ss:** sockets abertos, filas de conexão, quem escuta em qual porta.
8. **/proc/pressure:** o PSI, dizendo quanto tempo as tasks ficaram travadas esperando CPU, memória ou I/O.
9. **strace:** o que um processo específico está pedindo ao kernel.
10. **perf:** onde o tempo de CPU está sendo gasto, função por função, inclusive dentro do kernel. Com ele dá para gerar os flame graphs.
11. **eBPF (bcc, bpftrace):** programas minúsculos e verificados rodando dentro do kernel para observar quase qualquer evento sem reiniciar nada e com custo baixo. Ferramentas como execsnoop (todo processo que nasce), opensnoop (todo arquivo aberto), biolatency (histograma de latência de disco) e tcpretrans (retransmissões TCP) transformam dúvida em evidência.

## Windows: a família NT por dentro

O Windows que todo mundo usa hoje descende do **Windows NT**, projetado no começo dos anos 90 por uma equipe liderada por Dave Cutler, que antes tinha feito o VMS. Ele não tem nada a ver com o antigo Windows 95 por baixo, e a arquitetura é muito mais elegante do que a fama sugere.

### Arquitetura

No modo kernel ficam várias camadas:

1. **HAL** (Hardware Abstraction Layer): isola as diferenças de placa e chipset.
2. **Kernel** propriamente dito: escalonamento de threads, interrupções e sincronização de baixo nível.
3. **Executive**: os grandes subsistemas, como o gerenciador de objetos, de memória, de processos, de I/O, de segurança e de configuração (que é o registro).
4. **Drivers** e o **win32k**, a parte gráfica e de janelas, que foi trazida para o modo kernel por desempenho.

O ntoskrnl.exe contém o kernel e o executive. No modo usuário, a ntdll.dll é a última camada antes da syscall, e por cima dela fica a API **Win32** (kernel32, user32, advapi32), que é o contrato estável que os programas realmente usam. Originalmente, o NT tinha a ideia de "subsistemas" capazes de rodar APIs diferentes por cima do mesmo kernel: Win32, OS/2 e POSIX. Essa ideia renasceu de forma curiosa no WSL.

### Tudo é objeto

Onde o Unix diz "tudo é arquivo", o NT diz **"tudo é objeto"**. Processos, threads, arquivos, chaves de registro, eventos, mutexes, seções de memória: tudo é um objeto do kernel, com nome num espaço de nomes próprio, uma lista de controle de acesso e um contador de referências. Os programas recebem **handles**, que são o equivalente aos descritores de arquivo, mas para qualquer tipo de objeto. O Process Explorer mostra todos os handles abertos por um processo, e procurar ali qual programa está segurando um arquivo que "não pode ser apagado porque está em uso" é o lsof do Windows.

### Processos e threads

No Windows, processo e thread são coisas diferentes de verdade. O processo é um contêiner de recursos (espaço de endereçamento, handles, token de segurança) e **não roda**; quem roda são as threads. Não existe fork: um processo novo nasce com CreateProcess, que já recebe o executável a carregar, numa operação só. Isso é mais simples e mais rápido do que fork mais exec quando o objetivo é rodar outro programa, mas torna difícil portar programas Unix que dependem de fork, e é um dos motivos de o Cygwin ter sido sempre um pouco lento.

O equivalente aos cgroups são os **job objects**: grupos de processos com limites de CPU, memória e quantidade de processos. Os containers do Windows usam job objects mais "silos", que fazem o papel dos namespaces.

### Escalonador

O escalonador do NT trabalha com **32 níveis de prioridade** por thread: de 1 a 15 para threads normais (o 0 é reservado para a thread que zera páginas livres) e de 16 a 31 para a faixa de tempo real. Ele é preemptivo, escolhe sempre a thread pronta de maior prioridade e reveza dentro do mesmo nível com um quantum de tempo. A grande diferença em relação ao Linux é o uso agressivo de **ajustes dinâmicos**: a thread da janela em primeiro plano ganha um empurrão, threads que acabaram de receber I/O ganham prioridade temporária, e threads famintas há muito tempo também. É um escalonador pensado desde o início para a sensação de resposta no desktop.

### Memória

A memória virtual do Windows segue os mesmos princípios: páginas de 4 KB, tabelas de páginas, page faults, alocação sob demanda. Algumas diferenças de vocabulário e de política:

1. O arquivo de swap é o **pagefile.sys**, e o Windows é muito mais conservador que o Linux: ele faz **commit accounting**, ou seja, cada alocação precisa caber na soma de RAM mais pagefile. Por isso o Gerenciador de Tarefas mostra "confirmada" (committed) e o limite dela. Não existe overcommit à moda Linux, e quando o limite estoura a alocação simplesmente falha, em vez de chamar um OOM killer.
2. O **working set** é o equivalente ao RSS: as páginas de um processo que estão na RAM agora. O Windows ajusta o working set de cada processo ativamente, tirando páginas de quem não está usando.
3. Páginas tiradas dos working sets vão para listas: a **standby list** é o cache de páginas limpas que podem voltar sem ler do disco (o equivalente ao page cache), e a **modified list** guarda as sujas esperando escrita.
4. O **SuperFetch**, hoje chamado SysMain, pré carrega na standby list o que você costuma abrir.
5. Desde o Windows 10, existe **compressão de memória**: em vez de mandar páginas para o pagefile, o sistema as comprime e guarda na própria RAM, como o zram do Linux. O processo "Memory Compression" no Gerenciador de Tarefas é exatamente isso.

### Registro e serviços

O **registro** é um banco de dados hierárquico de configuração, dividido em "colmeias" (hives) guardadas em arquivos. HKEY_LOCAL_MACHINE guarda configuração do sistema, HKEY_CURRENT_USER a do usuário. É o equivalente a juntar o /etc inteiro e as configurações pessoais de todo mundo num só lugar binário, com prós (acesso rápido, permissões por chave) e contras (um registro corrompido pode impedir o boot, e ninguém faz diff de registro com prazer).

Os **serviços** são o equivalente aos daemons e são gerenciados pelo **SCM** (Service Control Manager, o processo services.exe). Muitos serviços pequenos rodam agrupados dentro de processos svchost.exe, o que explica aquela coleção de svchost no Gerenciador de Tarefas.

### Boot

O revezamento do Windows:

1. O firmware UEFI carrega o **Windows Boot Manager** (bootmgfw.efi) da ESP.
2. Ele lê a configuração de boot (o BCD) e carrega o **winload.efi**.
3. O winload carrega na memória o ntoskrnl.exe, o HAL, a colmeia SYSTEM do registro e os drivers marcados como de boot.
4. O kernel inicializa e cria o primeiro processo de usuário, o **smss.exe** (Session Manager).
5. O smss inicia o **csrss.exe** (o processo do subsistema Win32) e o **wininit.exe**, que sobe o services.exe (o SCM) e o **lsass.exe** (autenticação e política de segurança).
6. O **winlogon.exe** cuida da tela de login e, depois da autenticação, inicia o explorer.exe, o seu shell.

O Secure Boot, o Measured Boot com TPM e o BitLocker se encaixam nesse revezamento para garantir que ninguém trocou um corredor no meio do caminho.

### Filesystem, WSL e ferramentas

O filesystem nativo é o **NTFS**, com journaling, ACLs, compressão, criptografia por arquivo e fluxos alternativos de dados; o ReFS aparece em servidores. Já cobrimos os detalhes no artigo de armazenamento.

O **WSL2** é um caso fascinante: ele roda um **kernel Linux de verdade** numa máquina virtual leve, gerenciada pelo Hyper V, com integração de arquivos e rede com o Windows. O WSL1 era outra coisa, uma camada que traduzia syscalls do Linux para chamadas do NT, herdeira direta da antiga ideia de subsistemas. Traduzir mostrou ser difícil demais para os detalhes (desempenho de filesystem, por exemplo), e a Microsoft acabou preferindo o kernel inteiro.

Para observar, o Gerenciador de Tarefas e o Monitor de Recursos resolvem o básico; o **Process Explorer** e o **Process Monitor** do Sysinternals são o htop e o strace do Windows; o Performance Monitor coleta contadores; e o **ETW** (Event Tracing for Windows) é o sistema de rastreamento do kernel, que ferramentas como o Windows Performance Analyzer transformam em linhas do tempo detalhadas. O ETW está para o Windows como perf e eBPF estão para o Linux.

## macOS: um Unix com casaca

O macOS é, certificadamente, um Unix: passou na certificação do Open Group, coisa que o Linux nunca fez (não por incapacidade, mas porque ninguém pagou). Por baixo do visual, mora o **Darwin**, o núcleo aberto do sistema, e dentro dele o kernel **XNU** ("X is Not Unix").

### XNU: três peças coladas

O XNU junta três coisas no mesmo espaço privilegiado:

1. **Mach**, um microkernel vindo da universidade Carnegie Mellon, que cuida de tasks, threads, memória virtual, escalonamento e da comunicação por mensagens através de **Mach ports**.
2. **Uma camada BSD**, derivada do FreeBSD, que oferece o que um programa Unix espera: processos com PID, permissões, sinais, sockets, VFS e as syscalls POSIX.
3. **IOKit**, o framework orientado a objetos para drivers.

O resultado é peculiar: um processo do macOS é, ao mesmo tempo, uma task do Mach e um processo BSD. Um fork funciona como no Unix, mas por baixo o sistema inteiro conversa por Mach ports. Quase toda comunicação entre processos no macOS, como o XPC usado pelos aplicativos e serviços do sistema, viaja por portas do Mach. É como um prédio com fachada clássica de Unix e encanamento todo de Mach por trás das paredes.

### launchd

O PID 1 do macOS é o **launchd**, que existe desde 2005 e foi uma das grandes inspirações do systemd. Ele inicia daemons (do sistema) e agents (por usuário) a partir de arquivos plist, e foi pioneiro em ativar serviços sob demanda, abrindo a porta ou o Mach port antes e só iniciando o serviço quando alguém aparece. O launchctl é o equivalente ao systemctl.

### Memória e desempenho

O macOS foi o primeiro sistema popular a ligar **compressão de memória** por padrão, em 2013: antes de mandar páginas para a swap, ele as comprime na RAM. O Monitor de Atividade mostra a "pressão de memória" em cores, uma métrica mais honesta que "memória livre", na mesma linha do PSI do Linux. A swap mora em arquivos dentro do volume do sistema e cresce sob demanda.

Nos Macs com **Apple Silicon**, a memória é **unificada**: CPU, GPU e motor neural dividem a mesma RAM, sem cópias entre memória de vídeo e memória principal. Os chips têm também núcleos de dois tipos, de desempenho e de eficiência, e o escalonador usa a **classe de qualidade de serviço** que cada thread declara (interativa, de usuário, utilitária, de fundo) para decidir onde ela roda. Uma indexação do Spotlight vai para os núcleos econômicos, a rolagem da janela vai para os rápidos. O **Grand Central Dispatch** (libdispatch) é a forma idiomática de concorrência por lá: em vez de criar threads, você entrega blocos de trabalho a filas, e o sistema decide quantas threads usar.

### Segurança

O macOS empilha várias camadas: **SIP** (System Integrity Protection) impede que até o root altere arquivos do sistema; desde o Big Sur, o volume do sistema é selado e somente leitura, verificado criptograficamente a cada boot; o **Gatekeeper** e a **notarização** checam se um aplicativo baixado foi assinado e analisado pela Apple; o **sandbox** limita o que cada aplicativo da loja pode acessar; e o **TCC** é aquele sistema de permissões que pergunta se o aplicativo pode usar a câmera, o microfone ou a pasta Documentos. As antigas extensões de kernel (kexts) foram depreciadas em favor de **System Extensions** e **DriverKit**, que rodam em espaço de usuário. É a Apple, aos poucos, tirando os drivers de dentro do escritório do síndico.

### Boot e ferramentas

Nos Macs Intel, o firmware EFI carregava o boot.efi, que carregava o kernel. Nos Apple Silicon, a cadeia começa num Boot ROM gravado no chip, que verifica e carrega o **iBoot**, que verifica e carrega o kernel, cada etapa conferindo a assinatura da seguinte. Daí o kernel sobe o launchd, e o launchd sobe o resto.

Para observar: o Monitor de Atividade é o básico; vm_stat mostra estatísticas de memória; fs_usage mostra a atividade de filesystem em tempo real; sample e spindump capturam o que um processo travado está fazendo; e o **DTrace**, herdado do Solaris, existe no macOS (embora o SIP limite bastante o uso), tendo sido um dos grandes inspiradores do eBPF.

## BSDs: os primos que ficaram fiéis ao Unix

Os BSDs descendem diretamente do Unix da Universidade de Berkeley, dos anos 70 e 80. Depois de uma briga judicial com a AT&T no começo dos anos 90 (que, aliás, ajudou o Linux a decolar enquanto o BSD estava enroscado no tribunal), surgiram as linhagens livres que existem até hoje.

### O que diferencia um BSD de uma distribuição Linux

A diferença filosófica principal: um BSD é um **sistema operacional completo**, não um kernel com programas em volta. Kernel, biblioteca C, comandos básicos, compilador, documentação e scripts de inicialização são desenvolvidos juntos, no mesmo repositório, pela mesma equipe, e lançados juntos. Isso é o **sistema base**. Programas de terceiros vêm à parte, pelos ports ou pacotes, e moram separados (normalmente em /usr/local). Se uma distribuição Linux é um carro montado com peças de vários fornecedores, um BSD é um carro em que o motor, o câmbio e o chassi saíram da mesma fábrica.

Consequências práticas: documentação excelente e coerente (as man pages dos BSDs são famosas, e o FreeBSD Handbook é referência), comportamento previsível, e a **licença BSD**, permissiva, que deixa qualquer um usar o código num produto fechado sem devolver nada. É por isso que tem BSD dentro do PlayStation, do Nintendo Switch, de roteadores e firewalls comerciais e do próprio macOS.

O init dos BSDs é o tradicional rc, com scripts simples e configuração centralizada em /etc/rc.conf; nada de systemd. Os mecanismos de evento são o **kqueue**, que muita gente considera mais bem desenhado que o epoll, e o filesystem padrão é o UFS ou o ZFS.

### FreeBSD

O mais usado, focado em servidores e desempenho. Destaques:

1. **Jails**, desde o ano 2000: isolamento de processos, filesystem, rede e usuários, quase uma década e meia antes do Docker popularizar a ideia no Linux.
2. **ZFS** de primeira classe, integrado ao sistema e ao instalador, sem a questão de licença que mantém o ZFS fora do kernel oficial do Linux.
3. **Capsicum**, um modelo de capabilities por descritor: um processo pode entrar num modo em que só consegue usar os descritores que já tinha abertos, sem acessar nada novo pelo nome.
4. **bhyve**, o hipervisor nativo, e uma pilha de rede respeitadíssima. A Netflix usa FreeBSD nos servidores que entregam a maior parte do tráfego de vídeo dela, empurrando centenas de gigabits por segundo por máquina.
5. **DTrace** integrado e o **pf** (importado do OpenBSD) ou o ipfw como firewall.

### OpenBSD

Obsessivamente focado em segurança e em código correto. Revisa o código inteiro continuamente, prefere desligar funcionalidades por padrão e criou coisas que o mundo inteiro usa: o **OpenSSH**, o firewall **pf**, o LibreSSL. Duas invenções dele merecem destaque:

1. **pledge:** o programa declara de antemão quais categorias de syscall vai usar ("só leio arquivos e uso a rede"). Se tentar algo fora da promessa, é morto na hora.
2. **unveil:** o programa declara quais caminhos do filesystem vai enxergar. O resto deixa de existir para ele.

São versões muito mais simples de usar do que seccomp e AppArmor, porque o próprio programa declara suas necessidades em duas linhas, em vez de alguém escrever uma política externa enorme.

### NetBSD e DragonFly BSD

O **NetBSD** tem o lema "of course it runs NetBSD": roda em dezenas de arquiteturas, de torradeira a supercomputador, graças a um código extremamente portável. É muito usado em sistemas embarcados e como referência de código limpo. O **DragonFly BSD** nasceu de uma divisão do FreeBSD em 2003 com ideias próprias sobre multiprocessamento e o filesystem **HAMMER2**, com snapshots e deduplicação.

## Lado a lado

| | Linux | Windows | macOS | FreeBSD |
|---|---|---|---|---|
| Kernel | monolítico modular | híbrido (NT) | híbrido (XNU: Mach + BSD) | monolítico modular |
| Criação de processo | fork, exec, clone | CreateProcess | fork, exec, posix_spawn | fork, exec |
| Unidade de escalonamento | task (processo ou thread) | thread | thread do Mach | thread |
| PID 1 / primeiro processo | systemd | smss.exe | launchd | init (rc) |
| Eventos de I/O | epoll, io_uring | IOCP | kqueue | kqueue |
| Isolamento | namespaces e cgroups | silos e job objects | sandbox | jails, Capsicum |
| Swap | partição ou arquivo, zram | pagefile.sys e compressão | arquivos de swap e compressão | partição ou arquivo |
| Configuração | arquivos de texto em /etc | registro | plists | /etc/rc.conf |
| Rastreamento | perf, eBPF | ETW | DTrace (restrito) | DTrace |
| Filesystem padrão | ext4, XFS, Btrfs | NTFS | APFS | UFS, ZFS |

## Amarrando tudo: um mapa mental

Visto de cima, todo sistema operacional resolve as mesmas perguntas, só com sotaques diferentes:

1. **Quem manda no hardware?** O kernel, em modo privilegiado. Monolítico, micro ou híbrido muda a organização interna, não a fronteira.
2. **Como um programa pede algo?** Por syscalls, quase sempre através de uma biblioteca (glibc, ntdll e Win32, libSystem).
3. **Como vários programas convivem?** Processos com espaços de endereçamento separados, threads dentro deles, um escalonador preemptivo revezando a CPU com algum critério de justiça e prioridade.
4. **Como a memória parece infinita?** Memória virtual: páginas, tabelas, MMU e TLB, alocação preguiçosa, page cache usando a sobra, swap ou compressão quando aperta, e um plano para quando acaba de vez (OOM killer no Linux, falha de alocação no Windows).
5. **Como os processos se comunicam e são avisados?** Descritores ou handles, pipes, sockets, sinais no Unix, objetos e mensagens no Windows, Mach ports no macOS.
6. **Como tudo começa?** Firmware, bootloader, kernel, um primeiro processo que sobe o resto (systemd, smss e wininit, launchd, init).
7. **Como se isola e se limita?** Usuários e permissões, capabilities, controle de acesso obrigatório, filtros de syscall, e os tijolos de container: namespaces e cgroups no Linux, jails no FreeBSD, silos e job objects no Windows.

Na hora de diagnosticar, a pergunta nunca é "o servidor está lento", e sim "qual recurso está saturado": CPU (fila de execução, throttling), memória (major faults, swap, PSI de memória, OOM), I/O (estado D, latência de disco) ou rede. O sistema operacional está o tempo todo te contando isso pelo /proc, pelo dmesg e pelas ferramentas certas. Só precisa perguntar.

## Vinte perguntas pra se testar

1. **Qual a diferença entre processo e thread?** Processo é o contêiner de recursos: espaço de endereçamento, descritores, credenciais. Threads são linhas de execução dentro dele, compartilhando tudo isso e tendo só pilha e registradores próprios. No Linux, os dois são tasks criadas por clone com flags diferentes.

2. **Por que o fork não é lento, mesmo copiando o processo inteiro?** Porque não copia: usa copy on write. Pai e filho compartilham as páginas físicas como somente leitura, e só a página que alguém tentar escrever é duplicada.

3. **O que é um processo zumbi e como se livrar dele?** Um processo que já terminou, mas cujo pai ainda não leu o código de saída com wait. Ele não consome CPU nem memória, só uma entrada na tabela. Matar o zumbi não adianta; é preciso corrigir ou matar o pai, para que o PID 1 adote e colha.

4. **Por que um processo em estado D não morre nem com kill 9?** Porque está numa espera ininterruptível dentro do kernel, normalmente I/O de disco ou NFS. O sinal fica pendente até a operação terminar. A solução está no storage, não no processo.

5. **Load average 30 numa máquina de 8 núcleos com CPU ociosa. O que está acontecendo?** No Linux, a carga conta também as tasks em estado D. CPU ociosa com carga alta aponta para I/O travado: disco saturado, storage de rede lento ou NFS fora do ar. Confira o vmstat (coluna b), o iostat e o PSI de I/O.

6. **O free mostra quase nada livre. O servidor está sem memória?** Provavelmente não. O Linux usa a sobra como page cache, que é descartável. Olhe a coluna available. Só se preocupe se ela estiver baixa ou se houver swap entrando e saindo e major faults altos.

7. **Qual a diferença entre minor e major page fault?** No minor, a página já está na RAM e só precisa ser mapeada (memória recém alocada, biblioteca compartilhada, copy on write). No major, ela precisa ser lida do disco ou da swap. Major fault em excesso indica memória apertada.

8. **O que é overcommit e por que o Linux permite?** É deixar a soma da memória prometida passar da RAM disponível, já que a alocação é preguiçosa e programas costumam pedir mais do que usam. A política fica em vm.overcommit_memory. O preço é precisar do OOM killer quando todos resolvem usar ao mesmo tempo.

9. **Qual a diferença entre VSZ, RSS e PSS?** VSZ é todo o endereço reservado (inflado). RSS é o que está na RAM, contando o compartilhado em cada processo. PSS divide o compartilhado proporcionalmente, e somado dá a visão mais próxima do consumo real.

10. **Container morreu com código 137. O que significa?** 128 mais 9: morto por SIGKILL. No Kubernetes, quase sempre é OOMKilled por estourar o memory.max do cgroup, ou SIGKILL depois de não encerrar dentro do prazo após o SIGTERM.

11. **Por que docker stop demora dez segundos para parar minha aplicação?** Porque a aplicação é PID 1 dentro do container e não trata SIGTERM, e o kernel ignora sinais sem tratador para o PID 1. O Docker espera e manda SIGKILL. Trate o sinal, use a forma exec no CMD ou coloque um init como o tini.

12. **Qual a diferença entre SIGTERM e SIGKILL?** SIGTERM é um pedido que o programa pode tratar para encerrar com calma. SIGKILL é executado pelo kernel, não pode ser tratado nem ignorado e não permite limpeza nenhuma.

13. **Apaguei um log enorme e o df não mudou. Por quê?** Algum processo ainda tem o arquivo aberto, e o espaço só é liberado quando o último descritor fechar. Procure os arquivos marcados como deleted no lsof ou em /proc/PID/fd, e reinicie ou sinalize o processo para reabrir o log.

14. **Container com limit de 1 CPU está lento, mas a máquina está ociosa. O que pode ser?** Throttling do cgroup: o container gasta a cota do período no começo e fica parado até o próximo. Confira o cpu.stat do cgroup. Aumentar o limit, ou remover o limit e confiar no request, costuma resolver.

15. **Para que serve o initramfs?** Para carregar o necessário para encontrar e montar o disco raiz verdadeiro: drivers do controlador, LVM, RAID, descriptografia do LUKS. Depois disso ele troca para a raiz real e executa o init.

16. **O que são namespaces e cgroups, e qual a relação com containers?** Namespaces controlam o que um processo enxerga (PIDs, rede, montagens, hostname, usuários). Cgroups controlam quanto ele pode usar (CPU, memória, I/O, quantidade de processos). Um container é um processo comum com os dois aplicados, mais capabilities reduzidas e seccomp.

17. **Por que syscall é cara e o que é o vDSO?** Porque troca de modo de privilégio, atrapalha pipelines e caches e, com as mitigações de Spectre e Meltdown, pode trocar tabelas de página. O vDSO é código do kernel mapeado no processo para responder chamadas simples, como pegar a hora, sem trocar de modo.

18. **Como o Windows cria processos sem fork?** Com CreateProcess, que cria o processo já carregando o executável indicado, numa operação só. No Windows, o processo é só um contêiner de recursos; quem é escalonado são as threads.

19. **O que o XNU, o kernel do macOS, tem de especial?** Junta um microkernel Mach (tasks, memória, mensagens por Mach ports), uma camada BSD (processos, sinais, sockets, POSIX) e o IOKit para drivers, tudo no mesmo espaço privilegiado. O PID 1 é o launchd.

20. **O que diferencia um BSD de uma distribuição Linux?** Um BSD é um sistema completo: kernel, biblioteca C, comandos e documentação desenvolvidos e lançados juntos como sistema base, sob licença permissiva. Uma distribuição Linux junta um kernel com componentes de vários projetos independentes.

## Nota

Esta é a terceira revisão da série, depois de [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/) e [redes](/2026/10/26/revisao-redes-de-computadores/), e talvez a que mais conecta as outras duas: o page cache é a ponte com o armazenamento, os sockets e o epoll são a ponte com as redes, e namespaces e cgroups são a ponte com tudo que vem depois, de containers a Kubernetes. Sistemas operacionais mudam devagar no conceito e rápido no detalhe (o escalonador do Linux mudou de nome em 2023, e o sched_ext ainda é novidade), então, se algo aqui envelhecer, aceito correções de bom grado.
