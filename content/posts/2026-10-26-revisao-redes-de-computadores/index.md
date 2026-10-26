---
title: "Revisão: redes de computadores"
slug: "revisao-redes-de-computadores"
date: '2026-10-26T13:00:00-03:00'
draft: false
description: "Uma revisão de redes do cabo ao Kubernetes: Ethernet, VLANs, IP, roteamento, NAT, TCP, DNS, TLS, firewalls, túneis, o caminho completo de um pacote e vinte perguntas pra se testar, tudo em linguagem informal e com analogias."
tags:
- redes
- linux
minute: 45
---

Este é o irmão do [Revisão: fundamentos de armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/), com a mesma proposta: o texto que eu gostaria de ter lido quando precisei revisar redes de verdade, subindo a pilha inteira. Começa no cabo, passa por switching, IP, roteamento e TCP, e termina no Kubernetes e no caminho completo de um pacote. É longo de propósito: a graça de redes é que tudo se conecta, literalmente.

## O problema que redes resolvem

Duas máquinas que não compartilham memória precisam conversar através de um meio que perde, atrasa, duplica e embaralha mensagens. É isso. Todo o resto, cada protocolo com sigla pomposa, é engenharia pra fingir que esse canal caótico é um fio confiável.

Pra organizar a conversa, o mundo usa modelos em camadas, e aqui vale um esclarecimento logo de cara: o modelo OSI, com suas sete camadas, é vocabulário, não realidade. Todo mundo fala "problema de camada 2" ou "balanceador L7", e você precisa entender a referência, mas a internet real roda o modelo TCP/IP, mais enxuto: enlace, rede, transporte e aplicação. Use o OSI como dicionário e o TCP/IP como mapa.

A ideia que amarra as camadas é o encapsulamento, e a melhor analogia é postal: sua mensagem é uma carta, que vai dentro de um envelope com endereço (o segmento TCP vira pacote IP), que vai dentro de um malote da transportadora (o frame Ethernet). Cada camada só lê o seu envelope e não abre o de dentro. O carteiro não lê sua carta; o switch não lê seu HTTP.

## Camada física: o cabo, a fibra e o ar

Tudo começa com um sinal num meio. No cobre, os pares trançados têm categorias que definem o teto: Cat5e aguenta 1 Gbps, Cat6 chega a 10 Gbps em distância curta, Cat6a sustenta 10 Gbps nos 100 metros. Na fibra, a divisão importante é multimodo (LED, barata, algumas centenas de metros, a fibra do datacenter) contra monomodo (laser, quilômetros ou dezenas deles, a fibra que atravessa a cidade). E quem conecta a fibra ao equipamento são os transceivers: SFP pra 1 Gbps, SFP+ pra 10, QSFP pra 40 e 100. A regra de bolso é que velocidade e alcance brigam entre si, e o preço arbitra a briga.

Dois detalhes dessa camada rendem chamados até hoje. O primeiro é o duplex: full duplex é conversa de telefone (os dois falam ao mesmo tempo), half duplex é walkie talkie. A autonegociação acerta isso sozinha quase sempre, mas quando um lado está travado em full e o outro cai pra half, nasce o clássico duplex mismatch: o link funciona, e funciona mal, com erros e colisões que só o `ethtool` revela.

O segundo é o WiFi, que merece humildade: é um meio compartilhado, half duplex por natureza (todo mundo no mesmo ar), cheio de interferência de vizinho, de parede e de forno microondas. O "300 Mbps" da caixa do roteador é a velocidade teórica da modulação em condições de laboratório; divida pelo número de vizinhos, obstáculos e pela própria física, e entenda por que nunca vira 300 de verdade. Rede séria é cabo; WiFi é conveniência.

## Ethernet e switching: a camada 2

Dentro de uma rede local, quem identifica as máquinas é o endereço MAC, aqueles 48 bits gravados na placa, e a unidade de conversa é o frame Ethernet: MAC de destino, MAC de origem, tipo, dados e uma soma de verificação.

O switch é um carteiro que aprende de tanto entregar. Ele mantém uma tabela (a tabela MAC, ou CAM) associando cada endereço à porta onde ele foi visto pela última vez. Quando chega um frame pra um MAC que ele conhece, entrega direto na porta certa. Quando não conhece, faz flooding: manda pra todas as portas e espera que o dono responda, o que de quebra ensina a tabela. É o porteiro novo gritando o nome no saguão até alguém levantar a mão.

Daqui saem dois conceitos de prova e de plantão: cada porta de switch é seu próprio domínio de colisão (por isso colisão virou assunto de museu junto com os hubs), mas o switch inteiro é um único domínio de broadcast: um frame de broadcast chega a todo mundo. E broadcast é o ingrediente do desastre mais famoso da camada 2: o loop. Frames Ethernet não têm TTL, não envelhecem, não morrem. Se existir um caminho em círculo entre switches, cada broadcast circula pra sempre e se multiplica a cada volta, a famosa broadcast storm, e é assim que um cabo a mais, espetado por boa intenção, derruba o prédio inteiro. O STP (Spanning Tree Protocol) existe pra isso: os switches conversam, elegem uma árvore sem ciclos e bloqueiam as portas redundantes, sacrificando caminhos em nome da sobrevivência.

E quando você quer de propósito dois cabos entre os mesmos equipamentos, por banda ou por redundância, o jeito certo é a agregação de links: LACP no switch, bonding no Linux. Os dois lados combinam que aquele par de cabos é um link lógico só, sem loop e sem storm.

## VLANs

VLAN é a resposta pra uma pergunta simples: por que comprar três switches se um dá conta? Uma VLAN é um switch lógico dentro do físico: a porta do financeiro na VLAN 10 e a do visitante na VLAN 20 estão no mesmo hardware e em redes completamente separadas, cada uma com seu próprio domínio de broadcast.

Portas têm dois modos. A porta access pertence a uma VLAN só e o dispositivo pendurado nela nem sonha que VLANs existem. A porta trunk carrega várias VLANs ao mesmo tempo, marcando cada frame com uma etiqueta 802.1Q que diz "este frame é da VLAN 10": é o corredor entre switches, com cada malote etiquetado. E existe a VLAN nativa, a que viaja pelo trunk sem etiqueta, uma exceção histórica que é fonte clássica de confusão e de ataques de VLAN hopping quando mal configurada.

O lembrete que separa júnior de sênior: VLAN segmenta, mas não protege sozinha. Separar as redes é o primeiro passo; quem decide se a VLAN 20 pode falar com a 10 é o firewall ou a ACL no roteador entre elas.

## IP: endereço, máscara e CIDR

Esta seção é o LBA do texto de redes: a base sobre a qual tudo em cima é convenção. Um endereço IPv4 são 32 bits, e a máscara divide esses bits em duas partes: o prefixo diz qual é a rede, o resto diz qual é o host. A notação CIDR resume tudo: 10.0.0.0/24 significa "os primeiros 24 bits são a rede", sobrando 8 bits pra hosts.

O cálculo de subrede que todo mundo precisa fazer de cabeça pelo menos uma vez: num /24, são 256 endereços, dos quais o primeiro (10.0.0.0) é o endereço da rede e o último (10.0.0.255) é o broadcast, sobrando 254 pra hosts. Diminuiu o prefixo, dobrou a rede; aumentou, dividiu. Um /25 tem 126 hosts úteis, um /30 tem 2 (e por isso vive em links ponto a ponto), um /16 tem 65 mil e pouco.

Algumas faixas têm dono reservado e aparecem o tempo todo: as privadas da RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), que não existem na internet; o loopback 127.0.0.0/8, que é você falando com você mesmo; o link local 169.254.0.0/16, que é a máquina gritando "o DHCP não me respondeu"; e o 100.64.0.0/10 do CGNAT, que é o seu provedor economizando IPs (já chego lá).

E a regra de ouro que decide o destino de cada pacote que sai da sua máquina: se o destino está na minha subrede (comparando com a máscara), entrego direto; se não está, mando pro gateway padrão e o problema passa a ser dele. Metade dos "não pinga" da vida é essa regra sendo aplicada sobre uma máscara errada.

## ARP: o encontro entre L2 e L3

Há um abismo entre "quero falar com 10.0.0.5" e "mande este frame pro MAC tal": o IP é o nome da pessoa, o MAC é o apartamento onde ela mora. O ARP é o porteiro que atravessa esse abismo: a máquina grita em broadcast "quem tem o IP 10.0.0.5?" e o dono responde "eu, e meu MAC é este". A resposta vai pro cache ARP (visível com `ip neigh`), porque gritar no saguão a cada pacote seria constrangedor.

Duas notas que valem ouro. O ARP gratuito é a máquina anunciando o próprio endereço sem ninguém perguntar, e é assim que failover de VIP funciona: o servidor que assume o IP virtual grita "este IP agora mora aqui" e os switches atualizam as tabelas na hora. E o lado sombrio: como o ARP não tem autenticação nenhuma, qualquer um pode responder "o 10.0.0.1 sou eu" e virar o homem no meio. Chama ARP spoofing, e é o motivo de redes sérias usarem proteções como dynamic ARP inspection.

## IPv6

O IPv4 tem 4 bilhões de endereços, e o planeta tem mais gente que isso com três dispositivos cada. O IPv6 resolve com 128 bits, um número que dispensa comparações criativas: dá pra endereçar cada grão de areia e sobra. Por que demorou tanto? Porque o NAT deu sobrevida ao v4 e porque migração de infraestrutura só acontece quando dói.

A notação assusta menos do que parece: oito grupos hexadecimais, com duas abreviações (zeros à esquerda somem, e a maior sequência de grupos zerados vira `::` uma única vez). A subrede padrão de qualquer LAN é /64, gigante de propósito: a metade final do endereço identifica o host, e sobra espaço pra técnicas de privacidade.

O dia a dia muda em três pontos. A autoconfiguração: com SLAAC, o roteador anuncia o prefixo e cada host monta o próprio endereço sozinho, sem servidor DHCP (o DHCPv6 existe pra quem quer controle central, e na prática convivem). O vizinho: o ARP foi aposentado pelo NDP, que faz o mesmo papel sobre ICMPv6, com mensagens de descoberta de vizinho e de roteador. E o fim do NAT como regra: no IPv6 cada host tem endereço global e o modelo ponta a ponta volta a valer, com as redes rodando dual stack (v4 e v6 juntos) durante a transição, que já dura décadas.

E a pegadinha de segurança que merece destaque: como os hosts voltam a ser endereçáveis diretamente, o firewall precisa existir de verdade no v6. É assustadoramente comum a equipe caprichar nas regras do IPv4 e deixar o IPv6 escancarado na mesma interface, protegendo a porta da frente com a janela aberta.

## Roteamento

Um roteador vive de uma pergunta: pra onde mando este pacote? A resposta mora na tabela de rotas, e a regra de desempate é o longest prefix match: entre todas as rotas que cobrem o destino, vence a mais específica. Se existe uma rota pra 10.1.0.0/16 e outra pra 10.1.2.0/24, um pacote pra 10.1.2.7 segue a segunda. A rota default (0.0.0.0/0) é a menos específica de todas: o "qualquer outra coisa, manda pra lá".

Rotas estáticas são escritas à mão e funcionam até a topologia mudar. Em redes de verdade, protocolos dinâmicos fazem os roteadores conversarem: o OSPF dentro de casa (todos os roteadores da empresa aprendem os caminhos internos e recalculam sozinhos quando um link cai) e o BGP entre casas. E "entre casas" aqui é literal: a internet é uma federação de Sistemas Autônomos (AS), cada um com seu número, cada um dono da própria rede, anunciando aos vizinhos "estes prefixos moram aqui ou passam por aqui". Não existe autoridade central roteando a internet; existe um acordo de vizinhos, com contratos comerciais por baixo.

E como todo acordo de vizinhos, confia demais. Quando um AS anuncia por engano prefixos que não são dele, o tráfego do mundo inteiro pode desviar pra dentro de uma rede que não esperava por ele: são os vazamentos de BGP, e a história está cheia deles, de um provedor pequeno engolindo o YouTube mundial em 2008 a vazamentos que redirecionaram tráfego de nuvens inteiras. Meia internet caindo por causa de uma linha de configuração errada num lugar que você nunca ouviu falar: bem vindo ao BGP.

Fechando a camada: o TTL. Cada pacote IP nasce com um contador que cada roteador decrementa; chegou a zero, o pacote morre e o roteador avisa a origem via ICMP. É o que impede um pacote de rodar em círculo pra sempre quando alguém cria um loop de rota, e é o truque que o traceroute explora pra mapear o caminho, mandando pacotes com TTL 1, 2, 3 e colecionando os avisos de óbito.

## NAT

O NAT (Network Address Translation) é a gambiarra mais bem sucedida da história das redes. A ideia: o roteador reescreve endereços dos pacotes que passam por ele, mantendo uma tabela de tradução pra lembrar quem é quem. No SNAT (source NAT), ele troca o endereço de origem: é o masquerade do seu roteador de casa, onde dezenas de dispositivos com IP privado saem pro mundo vestindo o único IP público, diferenciados pela porta. No DNAT (destination NAT), troca o destino: é o port forwarding, "o que chegar na porta 8080 entrega pro servidor interno tal".

O NAT salvou o IPv4 da exaustão por décadas, e cobrou um preço filosófico: quebrou o modelo ponta a ponta. Atrás de NAT, sua máquina consegue iniciar conversas, mas não consegue receber nenhuma, porque ninguém de fora sabe te endereçar. Todo o sofrimento de VoIP, jogos e P2P com "abrir porta", STUN e TURN é consequência direta disso. E a tabela de tradução é estado vivo: cada conexão ocupa uma entrada com timeout, e conexões longas e silenciosas podem ser esquecidas pela tabela e morrer "presas", o motivo clássico de sessões SSH ociosas caírem e de keepalives existirem.

O capítulo final é o CGNAT: o provedor sem IPs suficientes coloca NAT em cima do seu NAT, usando a faixa 100.64.0.0/10 entre a sua casa e a rua. O IP "público" do seu roteador não é público coisa nenhuma, é compartilhado com o quarteirão. É por isso que abrir porta em casa não funciona no seu provedor, e é mais um empurrão na direção do IPv6.

## Transporte: TCP e UDP

Chegamos ao coração do texto. As camadas de baixo entregam pacotes de uma máquina a outra; a camada de transporte entrega dados de um processo a outro, e a diferença é tudo.

O endereço completo de uma conversa é a tupla de cinco elementos: protocolo, IP de origem, porta de origem, IP de destino, porta de destino. É ela que permite seu navegador manter dez abas pro mesmo site sem misturar os bytes: mesmo destino, portas de origem diferentes, conexões diferentes. O socket é a ponta dessa conversa dentro do sistema operacional.

### TCP: a transportadora com protocolo de entrega

O TCP pega o canal caótico lá do começo do texto (que perde, atrasa, duplica e embaralha) e entrega ao programa uma ilusão impecável: um fluxo de bytes confiável e ordenado. O preço é burocracia, e vale conhecer cada carimbo.

A conexão nasce com o handshake de três vias: SYN ("quero conversar, meus números começam aqui"), SYN+ACK ("aceito, os meus começam aqui"), ACK ("fechado"). Três viagens antes do primeiro byte útil, o que já explica por que latência importa tanto.

Cada byte enviado tem número de sequência, e o receptor confirma com ACKs o que chegou. O que não for confirmado em tempo hábil é retransmitido. Sobre isso roda a janela deslizante: o remetente pode ter um volume limitado de bytes "no ar" sem confirmação, e a janela desliza conforme os ACKs chegam.

Aqui mora uma distinção de entrevista: controle de fluxo não é controle de congestionamento. O controle de fluxo protege o receptor: ele anuncia na janela quanto buffer tem livre, "não me mande mais do que isso". O controle de congestionamento protege a rede: o remetente tateia quanto o caminho aguenta, começando devagar (slow start, dobrando a cada rodada) e ajustando com algoritmos que evoluíram décadas: o CUBIC, padrão no Linux, trata perda como sinal de congestionamento; o BBR, do Google, modela a banda e o RTT do caminho e se importa menos com perda. A janela efetiva é sempre o menor entre os dois limites.

E a morte da conexão tem ritos: o encerramento educado é a troca de FINs dos dois lados; o grosseiro é um RST ("esquece, acabou"). Quem fecha primeiro ainda carrega o estado TIME_WAIT por um tempo (duas vezes o tempo máximo de vida de um segmento), de plantão pra pacotes atrasados não contaminarem uma futura conexão que reutilize a mesma tupla. Milhares de TIME_WAIT num servidor não são vazamento: são o rastro normal de quem abre e fecha conexões demais, e o remédio costuma ser keep alive e pooling, não sysctl heroico.

### UDP: o cartão postal

O UDP é a ausência de tudo isso, e essa é a proposta: sem conexão, sem confirmação, sem ordem, sem retransmissão. Um cabeçalho mínimo e o pacote vai. Parece pior até você perceber que, pra certas cargas, a burocracia do TCP atrapalha: numa chamada de voz ou num jogo, um pacote atrasado é inútil (o momento passou), e retransmitir só aumenta o jitter. DNS usa UDP porque a pergunta cabe num pacote e repetir a pergunta é mais barato que manter conexão. Voz, vídeo ao vivo e jogos usam UDP porque preferem perder um quadro a congelar esperando.

### QUIC: o TCP reescrito por cima do UDP

O QUIC, base do HTTP/3, é o que acontece quando o Google decide que esperar o TCP evoluir custa caro demais: um transporte completo (confiável, com fluxos, com TLS embutido) implementado sobre UDP, no espaço de usuário. Dois ganhos grandes: o handshake de transporte e o de criptografia se fundem (menos viagens pra começar), e os fluxos são independentes, eliminando o head of line blocking do TCP, onde um único pacote perdido travava todos os streams que dividiam a conexão. De quebra, evoluir o protocolo virou atualizar o navegador, sem esperar dez anos de kernels e middleboxes.

## Latência, banda, throughput, jitter e perda: as réguas da rede

A seção gêmea das réguas de IOPS do texto de armazenamento. Cinco medidas, cinco significados, e confundir qualquer par é diagnóstico errado na certa:

Latência é o tempo de ida e volta de um pacote, o RTT. Banda é a capacidade nominal do link, o tamanho do cano. Throughput é o que de fato atravessa, que é sempre menor que o cano. Jitter é a variação da latência, o que mais incomoda em voz e vídeo. E perda é a fração de pacotes que simplesmente não chega.

O caminhão de fitas atravessando o país continua valendo aqui: throughput gigantesco, latência de dois dias. E a relação entre as réguas tem até fórmula: o BDP (bandwidth delay product), banda vezes RTT, diz quantos bytes precisam estar "no ar" pra encher o cano. Um link transatlântico de 1 Gbps com 100 ms de RTT precisa de 12,5 MB em trânsito o tempo todo; se a janela TCP não chega lá, uma conexão sozinha jamais enche o link, não importa a banda contratada. É por isso que ferramentas de transferência séria abrem conexões paralelas.

A perda merece respeito especial: 1% de perda parece inofensivo e destrói o throughput do TCP, porque cada perda é lida como congestionamento e corta a janela, que leva rodadas inteiras pra crescer de novo. E o vilão moderno é o bufferbloat: equipamentos com buffers gordos demais que, sob carga, trocam perda por fila, e a latência explode de 20 pra 2000 ms com a banda "sobrando". A rede não está lenta, está enfileirada, e quem denuncia é o ping durante um upload pesado.

## MTU, fragmentação e PMTUD

Todo link tem um tamanho máximo de pacote, o MTU, e o padrão do Ethernet é 1500 bytes. O TCP deriva daí o MSS, o máximo de dados úteis por segmento. Datacenters às vezes usam jumbo frames de 9000 pra reduzir overhead, e todo túnel (VPN, VXLAN, qualquer encapsulamento) rouba alguns bytes do MTU, porque envelope dentro de envelope ocupa espaço.

O problema clássico nasce assim: um pacote de 1500 precisa atravessar um trecho com MTU menor (por causa de um túnel no caminho, por exemplo). Como todo pacote moderno viaja com a flag de "não fragmente", o roteador do trecho estreito descarta e devolve um aviso ICMP: "não coube, o máximo aqui é tanto". A origem ajusta e segue. Esse mecanismo é o PMTUD, descoberta do MTU do caminho, e ele funciona lindamente até algum firewall no caminho bloquear ICMP achando que é segurança.

Aí nasce o blackhole de PMTUD, um dos bugs mais desorientadores da rede: ping funciona (pacotes pequenos), SSH conecta (handshake é pequeno), e a transferência trava na hora de passar dado de verdade (pacotes grandes somem sem aviso, porque o aviso era justamente o ICMP bloqueado). Guarde esse sintoma: "conecta mas trava ao transferir" é MTU até prova em contrário.

## DHCP

Ninguém configura IP à mão em escala, e o DHCP é o cartório que distribui os endereços. O fluxo tem até acrônimo: DORA. Discover (a máquina nova grita em broadcast "existe um servidor DHCP aí?"), Offer (o servidor oferece um endereço), Request (a máquina pede formalmente aquela oferta), Ack (o servidor lavra o contrato). O contrato é o lease, com prazo de validade e renovação automática na metade do prazo, e vem com as cláusulas que fazem a rede funcionar: gateway, servidores DNS, domínio.

Como o Discover é broadcast e broadcast não cruza roteador, redes com várias subredes usam o DHCP relay: o roteador local repassa o pedido ao servidor central, carimbando de qual subrede veio, pra oferta sair da faixa certa.

E o problema clássico: o servidor DHCP clandestino. Alguém pluga um roteadorzinho doméstico na rede da empresa, com o DHCP dele ligado, e ele passa a responder mais rápido que o servidor oficial, distribuindo gateway errado pra metade do escritório. O sintoma é surreal ("metade da sala perdeu a rede, a outra metade está normal") e a caça envolve descobrir o MAC do impostor. Switches decentes têm DHCP snooping exatamente pra isso.

## DNS

O DNS é o sistema distribuído mais bem sucedido do mundo: uma árvore de delegações onde ninguém sabe tudo e todo mundo sabe a quem perguntar. No topo, os servidores raiz sabem quem cuida de cada TLD (.com, .br). Cada TLD sabe quem é o autoritativo de cada domínio. E o autoritativo responde de verdade pelos nomes do domínio. Quem percorre essa árvore por você é o resolver recursivo (o do provedor, o 8.8.8.8, o da sua rede), que pergunta de cima pra baixo e guarda tudo em cache.

Os registros são o vocabulário: A aponta nome pra IPv4, AAAA pra IPv6, CNAME é apelido pra outro nome, MX diz quem recebe o email, TXT carrega texto livre (e meia infraestrutura de verificação do mundo, de SPF a provas de propriedade), NS delega a zona, SOA descreve a zona, PTR faz o caminho inverso (IP pra nome), SRV aponta serviço e porta.

Cada resposta viaja com um TTL, e há cache respeitando esse TTL em todas as camadas: no resolver, no sistema operacional, no navegador. Daí o segredo que desfaz um mito: "propagação de DNS" não existe. Ninguém empurra nada pra lugar nenhum; o que existe é o mundo esperando os caches expirarem. Migração decente baixa o TTL dias antes, troca o registro, e sobe o TTL depois.

No Linux, a resolução local tem suas próprias camadas: o `/etc/hosts` atropela tudo, o `resolv.conf` aponta o resolver, e o systemd-resolved coloca um cache local no meio (com o resolv.conf virando um stub apontando pra 127.0.0.53, detalhe que já confundiu muito diagnóstico).

Duas siglas de modernização em uma frase cada: DoT e DoH cifram a pergunta DNS (em TLS puro ou dentro de HTTPS), escondendo do caminho o que você resolve; DNSSEC assina as respostas, garantindo que ninguém as adulterou (autenticidade, não sigilo).

E sim, o meme "it's always DNS" tem base real, e a última das vinte perguntas explica o porquê.

## HTTP e TLS

Subindo à aplicação, o HTTP evoluiu guiado por um inimigo só: a viagem desperdiçada. O HTTP/1.1 trouxe o keep alive (reusar a conexão TCP em vez de abrir uma por requisição), mas dentro dela as requisições ainda andam em fila. O HTTP/2 multiplexou: várias requisições simultâneas na mesma conexão, cada uma num stream. Resolveu a fila do HTTP e esbarrou na fila do TCP (um pacote perdido trava todos os streams, o tal head of line blocking). O HTTP/3 resolve mudando o chão: roda sobre QUIC, onde cada stream sofre sozinho.

O TLS é a camada que transforma HTTP em HTTPS, e o essencial cabe em quatro ideias. O handshake: cliente e servidor negociam versões e cifras, o servidor se apresenta, e os dois derivam chaves de sessão (com troca de chaves efêmeras, de modo que nem gravar o tráfego hoje ajuda a decifrar a gravação amanhã). O certificado: o documento que liga um nome público a uma chave, assinado por uma autoridade. A cadeia de confiança: seu sistema confia em poucas autoridades raiz, que assinam intermediárias, que assinam o certificado do site; validar é subir a cadeia até um nome conhecido. E o SNI: logo no início do handshake, o cliente declara qual host quer, permitindo que um mesmo IP sirva dezenas de sites com certificados diferentes, e sendo, de quebra, o último pedaço em claro que um observador vê (o ECH está fechando essa fresta). Quando é o servidor que exige certificado do cliente também, o nome é mTLS, o crachá dos dois lados, padrão em comunicação entre serviços.

O que um proxy no caminho enxerga depende de onde ele corta: um proxy que só repassa bytes vê endereços, portas e o SNI, e nada do conteúdo; um proxy que termina TLS (o balanceador L7, o CDN) vê tudo, porque a conexão segura termina nele e outra começa dali pro backend. Inspeção corporativa de HTTPS é exatamente isso: a empresa instala a própria autoridade nas máquinas e o proxy vira um homem no meio consentido.

## Firewalls e filtragem

Firewall decide o que passa, e a primeira divisão é de memória: o stateless olha cada pacote isolado contra uma lista (barato, burro, precisa de regra pra ida e pra volta); o stateful lembra das conexões e libera sozinho as respostas do que foi iniciado de dentro ("deixa sair, e deixa voltar o que é resposta"). Quem guarda essa memória no Linux é o conntrack, a tabela de conexões rastreadas, a mesma que o NAT usa, e ela é finita: tabela cheia é conexão nova sendo descartada com sintomas misteriosos.

A política que separa firewall de enfeite é default deny: nega tudo, libera o necessário, de preferência com a última regra registrando o que foi negado. A lista de exceções documenta a rede melhor que a wiki.

No Linux, o motor é o netfilter, no kernel, com ganchos por onde todo pacote passa. O `iptables` foi a interface clássica por vinte anos; o `nftables` é o sucessor, com sintaxe unificada. As cadeias dizem o papel da máquina: INPUT filtra o que chega pra ela, OUTPUT o que sai dela, FORWARD o que a atravessa (a cadeia que importa quando o Linux é roteador, e a que o Docker enche de regras sem pedir licença).

Na nuvem, o conceito virou serviço: security groups são um firewall stateful distribuído, aplicado na interface de cada instância, seguindo a instância pra onde ela for. A mesma disciplina de default deny vale, com o pecado capital da nuvem sendo a regra "liberado de qualquer origem" esquecida num grupo.

## Balanceamento de carga e proxies

Balanceador existe pra uma caixa virar várias sem o cliente saber. A divisão fundamental é a altura do corte: o balanceador L4 trabalha com IP e porta, repassa bytes sem entender o conteúdo, é rápido e opaco; o L7 fala HTTP, lê path, host e headers, roteia "o /api pro serviço tal", termina TLS, faz retry e reescreve o que precisar. Pagando com mais processamento e mais conhecimento sobre o tráfego.

Na mesma família moram os proxies, e a direção define o nome: o proxy reverso fica na frente dos servidores representando eles (o cliente nem sabe quantos backends existem); o forward proxy fica na frente dos clientes representando eles (a saída controlada da rede corporativa).

O arroz com feijão da distribuição: algoritmos (round robin distribuindo na vez, least connections mandando pra quem está mais folgado, hash do cliente pra consistência), health checks tirando da roda quem não responde (e a sutileza de que um health check raso demais mantém na roda um backend que responde ping e erra tudo), e sticky sessions prendendo o cliente ao mesmo backend quando a aplicação guarda estado local, o que é sempre uma dívida sendo rolada.

E a alta disponibilidade do próprio balanceador: o VIP, um IP virtual que flutua entre duas máquinas via VRRP (o keepalived, na prática), com o backup assumindo o IP e anunciando via ARP gratuito quando o titular morre. Em escala de internet, o truque final é o anycast: o mesmo IP anunciado via BGP de vários lugares do mundo, com o roteamento levando cada cliente ao mais próximo. É balanceamento feito pela própria internet, e é assim que o 8.8.8.8 e os CDNs estão "perto" de todo mundo ao mesmo tempo.

## VPNs e túneis

Túnel é a ideia mais reciclada das redes: pacote dentro de pacote, o malote lacrado viajando pela transportadora pública. Uma VPN é um túnel com criptografia: o pacote inteiro vira carga cifrada de outro pacote, e as duas pontas fingem estar na mesma rede.

O IPsec é o padrão histórico, poderoso e burocrático, vivendo nos túneis entre empresas e equipamentos de borda. O OpenVPN dominou uma era rodando TLS em espaço de usuário, flexível e verboso. E o WireGuard é o ZFS das VPNs: repensado do zero, pouquíssimo código, criptografia moderna sem menu de opções (menos escolha, menos erro), configuração que cabe numa tela, e desempenho que envergonha os anteriores. Virou módulo do kernel Linux e padrão de fato pra coisa nova.

Os formatos de uso são dois: site a site (duas redes inteiras costuradas por um túnel entre os roteadores, transparente pros usuários) e acesso remoto (a máquina do funcionário entra na rede da empresa de onde estiver). E nem todo túnel cifra: o GRE encapsula sem segredo nenhum (útil pra levar tráfego por caminhos que não o entenderiam), e o VXLAN encapsula frames L2 inteiros dentro de UDP, criando redes de camada 2 por cima de redes de camada 3, o tecido das nuvens e dos datacenters modernos. Toda essa seção, lembre, paga o imposto do MTU.

## Rede no Linux por dentro

No Linux, a rede é visível e manipulável peça por peça, e a família `ip` substituiu o folclore do ifconfig: `ip addr` mostra interfaces e endereços, `ip route` mostra a tabela de rotas (e `ip route get` responde "por onde sairia um pacote pra este destino?", pergunta de ouro). O policy routing vai além da tabela única: regras (`ip rule`) escolhem entre várias tabelas de rota conforme a origem ou a marca do pacote, o mecanismo por trás de "tráfego do cliente A sai pelo link A".

As peças de montar são o que faz containers existirem: a bridge é um switch virtual dentro do kernel; o par veth é um cabo virtual com duas pontas; e o network namespace é uma pilha de rede inteira e isolada (interfaces, rotas, firewall próprios). A receita de container: cria um namespace, espeta uma ponta do veth dentro e a outra na bridge do host, e pronto, o processo isolado tem rede. Não é metáfora, é literalmente o que o Docker faz.

O bonding agrega interfaces físicas (o lado Linux do LACP da camada 2), e alguns sysctls aparecem em todo servidor de verdade: `ip_forward` liga o encaminhamento entre interfaces (sem ele, o Linux se recusa a ser roteador), `somaxconn` dimensiona a fila de conexões aceitáveis de um socket que escuta, e a faixa de portas efêmeras define quantas conexões de saída simultâneas existem pra um mesmo destino, limite que máquinas fazendo NAT ou proxy pesado conhecem bem.

## Containers, Kubernetes e nuvem

A rede do Docker é a receita do namespace com três temperos: no modo bridge (padrão), cada container vive atrás da bridge com IP privado, saindo pro mundo via NAT e publicando portas via DNAT (o `-p 8080:80` é uma regra de iptables); no modo host, o container usa a pilha do host diretamente, sem isolamento de rede; e redes nomeadas do Docker dão DNS interno entre containers.

O Kubernetes impõe um contrato mais ambicioso: todo pod tem seu IP e todo pod fala com todo pod, sem NAT no meio, em qualquer nó. Quem cumpre o contrato é o plugin CNI escolhido, e as duas estratégias clássicas são o overlay (VXLAN costurando os nós, simples e universal) e o roteamento nativo (cada nó anuncia os IPs dos seus pods na rede real, inclusive via BGP, como o Calico faz). Em cima dos pods, que nascem e morrem, os Services dão endereço estável: ClusterIP (um VIP interno), NodePort (uma porta alta em cada nó), LoadBalancer (um balanceador de verdade provisionado na nuvem). Quem traduz o VIP do Service nos IPs dos pods vivos é o kube-proxy, reescrevendo pacotes via iptables ou IPVS, com as stacks modernas fazendo isso em eBPF (Cilium) e dispensando o kube-proxy. O Ingress (e sua sucessão, a Gateway API) é o L7 da história: um proxy reverso dentro do cluster roteando por host e path pros Services.

Na nuvem, o vocabulário muda e os conceitos não: a VPC é a sua rede privada virtual; subnets públicas têm rota pro internet gateway, privadas não; route tables são as tabelas de rotas de sempre; o NAT gateway é o masquerade como serviço (a subnet privada sai pra internet, mas não recebe); e peering costura VPCs, com a regra de sempre de que faixas de IP sobrepostas não se costuram. Debugar rede na nuvem é descobrir em qual dessas camadas (security group, ACL de subnet, route table) a intenção morreu.

## O caminho de um pacote, ou: o que acontece quando você digita uma URL

O par do "caminho de uma escrita" do texto de armazenamento. Você digita a URL e aperta Enter; eis a jornada, com o que pode quebrar em cada porta e qual ferramenta enxerga cada uma:

1. Resolução de nome: o navegador consulta seus caches, o sistema consulta o hosts e o resolver (stub local, depois recursivo), e a árvore do DNS responde. Quebra aqui: registro errado, TTL antigo em cache, resolver fora. Enxerga: `dig`, `dig +trace`.
2. Decisão de rota: destino na minha subrede ou não? Consulta a tabela, elege gateway ou entrega direta. Quebra: máscara errada, rota ausente, gateway errado via DHCP. Enxerga: `ip route get`.
3. ARP: preciso do MAC do próximo salto (o gateway, provavelmente). Cache ou broadcast. Quebra: ARP spoofing, vizinho sumido. Enxerga: `ip neigh`.
4. O frame sai: a placa monta o frame, o switch consulta a tabela MAC e encaminha, o STP garante que há caminho sem loop, a VLAN certa importa. Quebra: duplex mismatch, porta errada, VLAN errada. Enxerga: `ethtool`, contadores de erro.
5. NAT na borda: o roteador de casa (e talvez o CGNAT do provedor) reescreve origem e anota na tabela de tradução. Quebra: tabela cheia, timeout de conexão ociosa. Enxerga: `conntrack -L`.
6. A travessia: o pacote salta de AS em AS pela internet, cada roteador fazendo longest prefix match, o TTL descontando a cada salto, o BGP tendo decidido o caminho. Quebra: vazamento de rota, link congestionado, perda. Enxerga: `mtr`, que mostra perda e latência por salto.
7. Handshake TCP (ou QUIC): SYN, SYN+ACK, ACK com o servidor (ou o balanceador na frente dele). Quebra: porta fechada (RST na cara, connection refused), firewall descartando em silêncio (timeout). Enxerga: `nc`, `curl -v`, `ss`.
8. Handshake TLS: negociação, SNI anunciando o host, certificado validado na cadeia. Quebra: certificado expirado, cadeia incompleta, relógio da máquina errado, SNI errado. Enxerga: `curl -v`, `openssl s_client`.
9. A requisição chega: o balanceador L7 termina TLS, escolhe um backend saudável pelo health check, repassa; o backend processa (e provavelmente dispara as próprias chamadas de rede pra bancos e serviços, repetindo esta lista inteira em miniatura). Quebra: backend doente na roda, sticky session pro backend errado, timeout interno. Enxerga: logs do balanceador, métricas.
10. A resposta volta: refazendo o caminho, com o NAT desfazendo a tradução pela tabela, o TCP confirmando bytes, o navegador renderizando. Quebra: MTU no caminho de volta (o blackhole clássico), rota assimétrica confundindo firewall stateful. Enxerga: `tcpdump` nas duas pontas, comparando o que saiu com o que chegou.

Dez etapas, dez lugares pra morrer, e o diagnóstico profissional é descobrir o velório certo em vez de reiniciar o roteador com fé.

## Kit de diagnóstico do dia a dia

As ferramentas que resolvem 95% dos mistérios, na ordem em que costumam entrar em cena:

`ip a`, `ip r` e `ip neigh` respondem o básico existencial: tenho endereço? tenho rota? enxergo meu gateway? `ss -tulpn` mostra quem escuta em qual porta (o sucessor do netstat), e `ss -ti` vai além: estatísticas por socket, incluindo RTT medido e retransmissões, uma mina de ouro esquecida.

`ping` prova alcance e mede RTT; `mtr` é o traceroute adulto, mostrando perda e latência por salto continuamente (com a ressalva de que roteador despriorizando ICMP gera "perda" no meio do caminho que não afeta o destino; perda real aparece do salto em diante até o fim).

`dig` interroga o DNS (e `dig +trace` percorre a árvore desde a raiz, denunciando em qual delegação a resposta diverge). `curl -v` mostra a conversa inteira (resolução, conexão, TLS, headers), e `curl -w` com formato de tempos separa quanto custou o DNS, o connect, o TLS e o primeiro byte, transformando "o site está lento" em um culpado específico.

`nc` testa se uma porta abre, sem aplicação envolvida. `iperf3` mede o throughput real entre duas máquinas, separando "a rede entrega" de "a aplicação consome". `ethtool` revela velocidade, duplex e erros físicos da placa. `nft list ruleset` mostra o firewall de fato carregado (não o que a wiki diz), e `conntrack -L` abre a tabela de conexões rastreadas.

E quando a dúvida sobrevive a tudo isso, `tcpdump` captura a verdade nua (com o Wireshark pra dissecar com calma): o pacote saiu? chegou? voltou? Capturar nas duas pontas e comparar encerra discussões que dashboards alimentam por dias.

Junto com as ferramentas, o método, que vale mais que elas: diagnostique de baixo pra cima. Link está up? Tenho IP? Tenho rota? O nome resolve? A porta abre? O TLS fecha? A aplicação responde? Cada degrau descarta metade do universo, e é o contrário de chutar "deve ser o DNS" (mesmo que, admito, às vezes seja).

## Amarrando tudo: um mapa mental

A visão de cima, porque redes também são uma pilha e cada camada responde uma pergunta diferente:

1. Meio físico (cobre, fibra, rádio): o sinal existe e com que qualidade.
2. Enlace (Ethernet, switch, VLAN, WiFi): entrega local por MAC, domínios de broadcast sob controle, sem loops.
3. Rede (IP, roteamento, NAT, ICMP): entrega global por endereço, salto a salto, cada roteador decidindo o próximo.
4. Transporte (TCP, UDP, QUIC): entrega de processo a processo, com a confiabilidade que a aplicação pedir.
5. Serviços de infraestrutura (DHCP, DNS): quem me dá endereço e quem traduz nomes, os dois alicerces invisíveis.
6. Aplicação (HTTP, TLS e tudo acima): a conversa que interessa, cifrada e multiplexada.
7. E transversais a tudo: segurança (firewall, segmentação, criptografia) e observabilidade (as ferramentas do kit), que atravessam todas as camadas.

No armazenamento, a pergunta que organiza tudo era "qual o padrão de acesso". Em redes, a pergunta é: **onde o pacote morreu?** Toda investigação é descer essa pilha com método até encontrar o velório, e todo design decente é construir a pilha de modo que, quando o pacote morrer, ele morra avisando.

## Vinte perguntas pra se testar

1. **Ping funciona, mas o site não abre. O que pode ser?** Ping só prova camada 3 e ICMP. Dali pra cima tudo ainda pode falhar: teste o DNS (`dig`), a porta (`nc` ou `curl`), o firewall de aplicação e o TLS. Alcançar a máquina e conversar com o serviço são coisas diferentes.

2. **SSH conecta, mas trava ao listar um diretório grande. Por quê?** Cheiro forte de MTU e PMTUD quebrado por ICMP bloqueado: os pacotes pequenos do handshake e do prompt passam, e os grandes da listagem somem sem aviso. Reveja a seção de MTU.

3. **Por que uma única conexão TCP não usa todo o link de longa distância?** Por causa do BDP e da janela: com RTT alto, a janela limita quantos bytes ficam no ar, e o throughput tem teto matemático. Perda de pacotes e o algoritmo de congestionamento pesam junto. Daí as transferências paralelas.

4. **Qual a diferença entre switch e roteador?** O switch encaminha frames por MAC dentro de um domínio de camada 2. O roteador encaminha pacotes por IP entre redes diferentes. Um olha o malote, o outro olha o envelope.

5. **Por que um loop de cabo derruba a rede inteira?** Frames de camada 2 não têm TTL: broadcasts circulam pra sempre e se multiplicam a cada volta até saturar tudo. É a broadcast storm, e é exatamente o que o STP existe pra prevenir.

6. **Mudei o registro DNS e metade dos usuários ainda vê o IP antigo. Por quê?** Caches pelo mundo respeitando o TTL que valia quando consultaram. Não é propagação, é expiração. Baixe o TTL antes da migração, não depois.

7. **O que é TIME_WAIT e por que tenho milhares?** É o estado de quem fechou a conexão primeiro, mantido por duas vezes o tempo máximo de vida de um segmento, de guarda contra pacotes atrasados contaminarem conexões novas na mesma tupla. Milhares deles costumam denunciar falta de keep alive ou de pooling, não um vazamento.

8. **Connection refused x connection timed out: o que cada um diz?** Refused: o host está lá e respondeu com RST, não há nada escutando naquela porta. Timeout: ninguém respondeu nada, o que cheira a firewall descartando em silêncio, rota errada ou host fora do ar. O refused é um não educado; o timeout é o silêncio no telefone.

9. **Como um pacote decide entre o gateway e a entrega direta?** Comparando o destino com as subredes das interfaces (via máscara) e consultando a tabela de rotas pela rota mais específica, o longest prefix match. `ip route get` mostra a decisão pronta.

10. **Por que não consigo abrir porta no roteador de casa?** CGNAT: o IP "público" do seu roteador é um 100.64.x.x compartilhado, e o IP público de verdade mora no provedor. Port forwarding na sua caixa não adianta, porque a porta precisaria abrir na caixa do provedor.

11. **TCP ou UDP pra voz e jogos? Por quê?** UDP. Um pacote atrasado é inútil (o momento da fala ou do quadro já passou) e retransmitir só aumenta o jitter. Melhor perder um pacote e seguir do que congelar tudo esperando.

12. **O que muda no IPv6 em relação a NAT e firewall?** Sem NAT como regra, os hosts voltam a ser endereçáveis diretamente, então o firewall precisa existir de fato e estar certo. Esquecer as regras do v6 enquanto se capricha no v4 é das falhas mais comuns da transição.

13. **Pra que serve o SNI?** Pro cliente declarar, já no início do handshake TLS, qual host ele quer. É o que permite um mesmo IP servir dezenas de sites com certificados diferentes, e é também um dos últimos pedaços em claro que um observador do tráfego enxerga.

14. **Balanceador L4 x L7: quando usar cada um?** L4 é rápido e opaco: enxerga IP e porta, repassa bytes, serve pra qualquer protocolo. L7 entende HTTP: roteia por path e header, termina TLS, faz retry e métrica rica. Use L4 pra desempenho bruto e protocolos arbitrários; L7 quando precisa de inteligência de aplicação.

15. **VLAN é segurança?** É segmentação. A segurança vem do firewall ou das ACLs entre as VLANs, e do cuidado com a VLAN nativa e com VLAN hopping. Separar os cômodos não adianta se as portas entre eles não têm fechadura.

16. **Como um container ganha rede?** Com um network namespace próprio (pilha de rede isolada), um par veth fazendo de cabo virtual entre o namespace e uma bridge no host, e NAT com DNAT pra sair pro mundo e publicar portas. É a seção de Linux por dentro, montada em três comandos.

17. **Por que 1% de perda de pacotes é tão grave?** Porque o TCP lê cada perda como congestionamento e corta a janela, que demora rodadas inteiras pra crescer de novo. O throughput não cai 1%, despenca de forma desproporcional. Perda pequena e constante é veneno de conexão longa.

18. **O que é bufferbloat?** Buffers grandes demais nos equipamentos do caminho, que sob carga trocam perda por fila: a latência explode enquanto a banda "sobra". A rede parece lenta com o link folgado, e o teste é simples: pingue algo durante um upload pesado e veja o RTT multiplicar.

19. **Quando usar anycast?** Pra serviços sem estado ou quase, como DNS e CDN: o mesmo IP anunciado via BGP de vários pontos do mundo, com o roteamento levando cada cliente ao ponto mais próximo. Balanceamento e proximidade feitos pela própria internet, sem balanceador no meio.

20. **Por que "it's always DNS"?** Porque quase tudo começa com uma resolução de nome, porque o cache esconde o problema por um tempo (tudo funciona até o TTL expirar, aí quebra "do nada") e porque o erro raramente se apresenta como erro de DNS: vira timeout, vira serviço fora, vira lentidão. A culpa chega disfarçada, e o `dig` desmascara.

## Nota

Assim como a revisão de armazenamento, escrevi esta como exercício de consolidação: os fundamentos de redes que uso no dia a dia, na ordem em que eu gostaria de ter aprendido, com as analogias que me fizeram as coisas clicarem. Redes têm a fama injusta de ser decoreba de sigla; espero que o texto mostre o contrário, que é uma pilha de ideias simples empilhadas com cuidado. Correções e discordâncias são bem vindas.
