---
layout: post
title: "Jornada para contribuir com o OTel Collector, parte 1"
minute: 10
---

O plano era simples: escolher uma issue com a label `good first issue`, mandar um PR e ir dormir com a sensação boa de ter contribuído para o OpenTelemetry Collector. O que aconteceu foi que eu abri o repositório, li três arquivos e percebi que não tinha ideia do que estava acontecendo ali xD

Não é uma reclamação. É que a distância entre *usar* o Collector e *mexer* no Collector é maior do que eu imaginava. Então mudei o plano: em vez de forçar um PR, resolvi documentar a jornada inteira. 

Antes de seguir, é importante contextualizar meu nível de conhecimento. Não sou um desenvolvedor proficiente em Go. Atuo principalmente nas áreas de Engenharia de Confiabilidade e Engenharia de Plataforma. Tenho uma base sólida em programação, algoritmos, estruturas de dados e design patterns, mas, no dia a dia, meu trabalho atualmente está mais concentrado em configurações, infraestrutura e automação do que no desenvolvimento de código propriamente dito. 

#### O que eu achava que precisava saber

Golang =))

#### O que eu descobri que precisava saber

**Go, de verdade.** Não o Go de escrever um binário que chama uma API. O Go de interfaces, `context`, goroutines com ciclo de vida e generics espalhados pelo código. Dá pra ler sem isso; escrever, não.

**O modelo de componentes.** Receiver, processor, exporter, connector, extension. Todo o Collector é essa combinação, e antes de tocar em qualquer linha eu preciso saber em qual dessas caixas o meu problema mora.

**pdata.** As estruturas internas (`pcommon`, `plog`, `pmetric`, `ptrace`) não são structs comuns.. são wrappers sobre a representação interna, com regras próprias sobre cópia e mutação. É o tipo de coisa que o compilador deixa passar e o teste reprova.

**O repositório certo.** `collector` e `collector-contrib` são coisas diferentes, com critérios diferentes sobre o que entra. Descobrir isso *antes* de abrir o PR economiza uma conversa constrangedora.

**A burocracia boa.** CLA assinado, changelog gerado por ferramenta em vez de escrito na mão, `metadata.yaml` que gera código, testes de ciclo de vida que rodam sozinhos, e um CODEOWNERS que decide quem precisa aprovar. Nada disso é difícil. Tudo isso é invisível até você tropeçar.


#### O Go que aparece quando você abre um componente

Escrevi esta parte pensando em mim uma semana atrás. Usei o `receiver/nginxreceiver` do `opentelemetry-collector-contrib` como referência, porque ele é pequeno e tem quase tudo que existe nos outros. A ideia aqui não é ensinar a sintaxe do Go, é explicar por que o código está organizado desse jeito.

#### Como o repositório é organizado

A primeira coisa que quebra a intuição é que o `contrib` não é um projeto Go, são mais de quatrocentos. Cada componente tem seu próprio `go.mod`, ou seja, é um módulo independente, com dependências e versão próprias.

A razão é prática. O receiver do nginx precisa de uma biblioteca de nginx, o exporter da AWS precisa do SDK da AWS. Se tudo morasse num módulo só, quem quisesse apenas ler métricas de nginx carregaria junto o SDK da AWS inteiro. Separar é o que permite montar um binário enxuto.

O efeito colateral para quem contribui é que não existe "rodar os testes do projeto". Você roda os testes do componente em que está mexendo, e adicionar uma dependência mexe no `go.mod` daquela pasta, não num arquivo central.

Dentro de cada componente você encontra uma pasta `internal/`. Isso não é convenção do OpenTelemetry, é regra da linguagem: o Go proíbe que código de fora importe qualquer coisa que esteja sob um `internal/`. É a maneira do Go de dizer "isto aqui é assunto interno, pode mudar sem aviso".

#### As peças e como elas se encaixam

O Collector é feito de cinco tipos de peça: receiver recebe, processor transforma, exporter envia, connector liga um pipeline a outro, extension oferece serviços de apoio como autenticação. Antes de escrever qualquer linha, você precisa saber em qual dessas caixas o seu problema mora.

A parte que mais me confundiu foi descobrir como essas peças se conectam ao Collector, porque não existe nenhuma linha de código dizendo isso. Em Go, uma interface é uma lista de métodos, e qualquer tipo que tenha esses métodos a satisfaz automaticamente. Não se declara "esta classe implementa aquela interface", como em Java ou C#. Simplesmente funciona quando as assinaturas batem.

Uma analogia que me ajudou: em outras linguagens, entrar num clube exige preencher a ficha de inscrição. Em Go, você entra por já vestir o uniforme certo. Ninguém registra nada, o porteiro só confere a roupa.

O contrato mínimo do Collector chama `component.Component` e pede dois métodos: um para ligar e um para desligar. É isso. Se o seu tipo tem os dois, ele é um componente, e essa é a razão de você procurar a "ligação" no código e nunca encontrar.

O que existe de explícito é a factory. Ela não é o componente, é a fábrica dele: um objeto que sabe produzir a configuração padrão e criar o componente quando o Collector pedir. A diferença importa porque o Collector precisa conhecer a configuração padrão antes de existir qualquer componente, para validar o YAML do usuário. A factory declara também com quais sinais ela trabalha, métricas, traces ou logs, e cada um pode estar num nível de maturidade diferente.

A configuração viaja pelo sistema como um tipo genérico, e a primeira coisa que a fábrica faz é convertê-la para o tipo concreto do seu componente. Isso se chama type assertion e é o equivalente Go de abrir uma encomenda conferindo se veio o que estava na etiqueta. Se não veio, ou você trata o erro ou o programa quebra ali.

O YAML vira struct por meio de anotações nos campos. A que mais aparece é a que achata um struct dentro do outro, e é ela que faz opções comuns como timeout, TLS e retry terem exatamente a mesma grafia em dezenas de componentes sem ninguém redigitar nada.

#### Como o dado atravessa o pipeline

Não existe um maestro. Cada componente recebe, na hora em que é criado, uma referência ao próximo da fila, e entrega o resultado a ele. O pipeline que você desenha no YAML é apenas essa corrente sendo montada na inicialização. Um processor não sabe quem veio antes nem para onde vai no fim, conhece só o vizinho seguinte.

O que trafega por essa corrente é o que o projeto chama de pdata, os tipos `pmetric`, `plog`, `ptrace` e `pcommon`. Eles parecem structs normais e não são. São invólucros finos sobre uma estrutura compartilhada, então se comportam como referência: copiar a variável não copia o dado.

A analogia que me fez entender: pdata é a chave de um armário, não o conteúdo do armário. Passar a chave adiante não duplica nada. Se duas pessoas têm a chave e uma mexe lá dentro, a outra vê a mudança. Foi o conceito que mais me custou tempo, porque o compilador não reclama e o erro só aparece quando dois destinos do mesmo pipeline começam a interferir um no outro.

É por isso que existe uma declaração de que o componente altera os dados que recebe. Ela não é decorativa. Quando um pipeline se ramifica para vários destinos, o Collector consulta essa declaração para decidir se precisa fazer uma cópia antes de entregar. Declarar errado é a receita para corrupção difícil de rastrear.

O acesso a esses dados também não é o Go idiomático que você aprendeu. Em vez de percorrer uma lista com `range`, você navega perguntando o tamanho e pedindo o item de cada posição. É mais verboso de propósito: o Collector move volumes altos, e essa forma evita cópias que o `range` faria.

#### Tempo, concorrência e desligamento

Quase toda função do projeto recebe um `context` como primeiro parâmetro. Ele carrega prazo e cancelamento, e serve para propagar uma ordem de "pode parar" por toda a cadeia de chamadas.

Pense num bilhete que passa de mão em mão junto com o trabalho. Quando o Collector começa a desligar, ele risca o bilhete original, e todo mundo que estiver segurando uma cópia percebe e desiste do que estava fazendo. A regra prática é nunca guardar o context dentro de um struct, sempre passá-lo adiante, e verificá-lo em qualquer espera longa.

Receivers que ficam ouvindo uma porta rodam dentro de goroutines, que são a unidade de concorrência do Go: baratas o suficiente para você criar milhares. O padrão do projeto é guardar a função de cancelamento no struct do componente na hora de ligar, e chamá-la na hora de desligar. Sem isso a goroutine continua viva depois que o componente morreu, o que é um vazamento, e o projeto tem testes que reprovam exatamente esse caso.

#### O que a máquina escreve por você

Boa parte do código de um componente não é escrita à mão, e tentar escrevê-la é o erro que faz um PR voltar da revisão.

Existem pacotes de apoio, os helpers, que já implementam o trabalho repetitivo. Um cuida de agendar a coleta em intervalos regulares, outro transforma uma função simples de transformação num processor completo, outro cuida de fila, retry e timeout no envio. São andaimes prontos. Se você está escrevendo um laço com timer para coletar de tempos em tempos, provavelmente está reimplementando um deles.

Existe também um gerador de código. Você descreve o componente num arquivo `metadata.yaml`: o tipo, o nível de estabilidade, quem são os donos, e cada métrica com sua unidade e seus atributos. Uma ferramenta lê esse arquivo e gera o código Go que registra as métricas, a documentação em markdown e boa parte dos testes.

É a planta baixa gerando a casa. Para adicionar uma métrica você edita o YAML e roda a geração, não escreve o Go. Os arquivos gerados começam com um aviso de que não devem ser editados, e o CI compara o que está no repositório com o que a ferramenta produziria, reprovando se alguém mexeu na mão.

#### Como se prova que funciona

Os testes usam dublês para tudo que está em volta: um consumidor que descarta o que recebe, uma configuração vazia de mentira. Isso deixa o teste focado no seu componente, sem precisar de um Collector inteiro de pé.

Os mais interessantes são os que você ganha de graça. O gerador cria um teste de ciclo de vida que liga o componente, desliga, liga de novo, desliga sem nunca ter ligado, e verifica que nada disso quebra. E há uma verificação, no fim de cada pacote de testes, de que não sobrou nenhuma goroutine viva. É esse par que pega recurso não liberado e vazamento, sem que você escreva uma linha.

#### O que o projeto pede de você

O changelog não é escrito no arquivo de changelog. Cada PR adiciona um YAML pequeno numa pasta própria, dizendo o tipo da mudança, o componente afetado, uma frase de descrição e a issue relacionada. A release junta tudo. Mudanças que não afetam quem usa dispensam o arquivo, mas precisam ser marcadas como tal no título do PR. Esquecer isso é o motivo mais comum de CI vermelho num primeiro PR.

Cada componente tem donos declarados no próprio `metadata.yaml`, e são eles que aprovam. Marcar as pessoas certas é o que faz a revisão andar.

E cada componente tem um nível de estabilidade, de `development` até `stable`, além da lista de distribuições oficiais em que ele entra. Isso define o quanto você pode quebrar compatibilidade: mudar o nome de uma opção de configuração é aceitável em `alpha` e é um problema sério em `beta`.
