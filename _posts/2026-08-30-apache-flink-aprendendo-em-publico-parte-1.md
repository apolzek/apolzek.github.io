---
layout: post
title: "Apache Flink: Aprendendo em Público, parte 1"
minute: 47
---

#### Índice

- [Índice](#índice)
- [Introdução](#introdução)
- [Meu objetivo](#meu-objetivo)
- [O problema que o Flink resolve](#o-problema-que-o-flink-resolve)
- [Casos de uso reais](#casos-de-uso-reais)
- [A arquitetura, em poucas peças](#a-arquitetura-em-poucas-peças)
- [Fontes e destinos](#fontes-e-destinos)
- [Paralelismo](#paralelismo)
- [Redistribuição e data skew](#redistribuição-e-data-skew)
- [Operator chaining](#operator-chaining)
- [Rich functions](#rich-functions)
- [Tempo: a parte que quebra a intuição](#tempo-a-parte-que-quebra-a-intuição)
- [Watermarks](#watermarks)
- [Janelas](#janelas)
- [ProcessFunction](#processfunction)
- [Estado](#estado)
- [Checkpoints e savepoints](#checkpoints-e-savepoints)
- [Flink SQL](#flink-sql)
- [In praxi ("na prática")](#in-praxi-na-prática)
- [Deploy](#deploy)
  - [Modos de execução](#modos-de-execução)
  - [Kubernetes](#kubernetes)
  - [Memória](#memória)
  - [CPU e slots](#cpu-e-slots)
  - [Disco local](#disco-local)
  - [S3 e o sistema de arquivos remoto](#s3-e-o-sistema-de-arquivos-remoto)
- [O ecossistema em volta](#o-ecossistema-em-volta)
- [O que eu ainda não sei](#o-que-eu-ainda-não-sei)
- [O que ficou](#o-que-ficou)
- [A versão atual: destaques do Flink 2.3](#a-versão-atual-destaques-do-flink-23)
  - [Estado desagregado](#estado-desagregado)
  - [O que a 2.0 removeu](#o-que-a-20-removeu)
  - [IA dentro do stream](#ia-dentro-do-stream)
  - [Os destaques da 2.3](#os-destaques-da-23)

#### Introdução

Este texto é o resultado do que estudei e experimentei ao longo desta semana. Não é um tutorial de quem domina Apache Flink, nem pretende ser uma referência sobre o assunto. É mais como um caderno de anotações de alguém que está aprendendo, testando algumas coisas na prática e compartilhando o que conseguiu entender e descobrir até aqui.

Sempre achei que explicar é a melhor forma de descobrir o que a gente realmente entendeu. Quando escrevo, os buracos aparecem sozinhos.. 

O Apache Flink é interessante principalmente porque tratou **streaming** como o caso geral, e não como um remendo sobre processamento em lote. Enquanto concorrentes da época simulavam fluxo contínuo com micro-batches, o Flink processa registro a registro, com latência baixa e throughput alto, mantendo estado distribuído consistente através de snapshots assíncronos (uma variação do algoritmo de *Chandy-Lamport*) que garantem semântica exactly-once mesmo após falhas. Ele também oferece noção de tempo de evento com *watermarks*, o que permite lidar corretamente com dados que chegam fora de ordem ou atrasados, algo essencial no mundo real. Sua origem é acadêmica: nasceu em 2010 como Stratosphere, projeto de pesquisa da TU Berlin em parceria com a Universidade Humboldt e o Hasso Plattner Institute, sob liderança de Volker Markl. Em 2014 o código foi doado à Apache Software Foundation, rebatizado de Flink ("ágil", em alemão, daí o esquilo do logo) e promovido a projeto de topo ainda em dezembro daquele ano. Os criadores fundaram a [data Artisans](https://github.com/dataArtisans) para comercializá-lo, empresa comprada pelo Alibaba em 2019 e renomeada Ververica. O próprio Alibaba já mantinha um fork interno (Blink) para lidar com o volume do Singles' Day, e boa parte dessas melhorias voltou para o projeto principal, ajudando a consolidar o Flink como padrão de fato em processamento de streams em empresas como Netflix, Uber e Stripe.

#### Meu objetivo

Meu objetivo é usar o Apache Flink conectado ao Kafka para processar dados OTLP do OpenTelemetry (traces, métricas e logs) e extrair mais inteligência dessa telemetria em tempo real, em vez de apenas armazená-la e consultá-la depois. A ideia é usar esse pipeline como laboratório para testar casos como detecção de anomalias em séries temporais de métricas e latências, geração de alertas com contexto e supressão de ruído, análise de causa raiz (RCA) correlacionando spans, logs e métricas de serviços afetados, predição de degradação e saturação de recursos antes que o incidente aconteça, e detecção de dados sensíveis trafegando indevidamente em atributos de span e mensagens de log. Além disso, quero explorar outros cenários em que o Flink se encaixa bem: enriquecimento e sampling inteligente de traces, decidindo com estado quais traces reter com base no que aconteceu na requisição inteira (tail-based sampling) em vez de descartar aleatoriamente na borda; cálculo contínuo de SLIs e error budgets por serviço, com janelas deslizantes e agregações por endpoint, time e versão de deploy; e detecção de mudança de comportamento após releases, comparando o perfil de tráfego, erros e latência entre versões para identificar regressões introduzidas por um deploy específico. Pretendo detalhar tudo isso em breve (:

#### O problema que o Flink resolve

Durante muito tempo o mundo de dados foi organizado em torno do lote(*batch*). Você acumula dados durante o dia, roda um job à meia-noite, e de manhã o relatório está pronto. Isso funciona, e continua funcionando para muita coisa. O problema é quando a resposta precisa vir antes. Detectar uma fraude de cartão dez horas depois da compra é o mesmo que não detectar. Um alerta de infraestrutura que chega no dia seguinte é um post-mortem, não um alerta. Nesses casos, você não quer perguntar aos dados de tempos em tempos, você quer que os dados respondam continuamente. Essa é a inversão que o processamento de streams propõe:

- **Batch**: a consulta é permanente, os dados são finitos. Você roda a query contra um conjunto parado.
- **Streaming**: os dados são infinitos, a consulta é que fica parada. Ela é registrada uma vez e reage a cada evento que passa.

O Apache Flink é um motor de processamento distribuído voltado para a construção desse segundo tipo de aplicação. Sua premissa fundadora: tudo é um stream. Um arquivo CSV de ontem é um stream que tem começo e fim (*bounded*). O tópico Kafka com cliques do seu site é um stream que nunca acaba (*unbounded*). Um dos pontos que mais me chamou atenção durante o estudo foi o modelo unificado de processamento: no Flink, batch pode ser entendido como um caso particular de streaming, em que o fluxo de dados possui um início e um fim definidos. Isso significa que o modelo de execução não depende de dois motores completamente distintos, mas de uma mesma arquitetura capaz de processar tanto fluxos contínuos quanto conjuntos de dados finitos.

#### Casos de uso reais

Vale olhar onde isso aparece na prática, porque a lista ajuda a entender que tipo de problema o Flink resolve bem:

- Detecção de fraude, em bancos e fintechs. Cada transação é avaliada em milissegundos contra o histórico do cliente, mantido como estado por chave (`keyBy` no id do cliente). Regras como "3 compras em cidades diferentes em 10 minutos" são expressas com janelas, timers e a biblioteca de detecção de padrões complexos (CEP).
- Pipelines de CDC para data lake. O Flink CDC acompanha o log de transações do banco (o binlog no MySQL, o WAL via replicação lógica no Postgres) e replica cada insert, update e delete em tempo real para formatos de tabela como Apache Iceberg, Paimon ou Hudi. A Stripe é um dos casos públicos de captura de mudanças em escala com Flink.
- Analytics e dashboards em tempo real. Agregações por janela (pedidos por minuto, receita por região) alimentando painéis ao vivo. Uber, Netflix e Alibaba operam milhares de jobs Flink com esse perfil.
- Aplicações orientadas a eventos. Aqui a lógica de negócio vive dentro do stream, e não em um serviço que consulta um banco: matching de corridas, precificação dinâmica, motores de alerta, atualização de feature stores para modelos de machine learning.
- IA sobre streams. Inferência de modelos aplicada a eventos conforme eles passam, e o Flink Agents, subprojeto novo voltado a agentes de IA que reagem a eventos em tempo real.

#### A arquitetura, em poucas peças

| Peça | O que faz |
|:--|:--|
| **JobManager** | O coordenador. Recebe o job, transforma o grafo lógico em grafo de execução, distribui as tarefas, dispara os checkpoints e coordena a recuperação de falhas. |
| **TaskManager** | O trabalhador. É um processo JVM que executa as tarefas de verdade e guarda o estado local. |
| **Task Slot** | A unidade de paralelismo dentro de um TaskManager. Um TaskManager com 4 slots consegue rodar 4 fatias de trabalho em paralelo. |
| **Client** | Quem empacota o job e submete ao JobManager. Depois disso, ele pode ir embora. |

Um job é representado como um **grafo de operadores**, composto por fontes (`source`), transformações (`map`, `filter`, `keyBy`, `window`) e destinos (`sink`). A partir desse grafo, o Flink determina o paralelismo de cada operador e distribui suas instâncias entre os slots disponíveis no cluster.

O `keyBy` merece atenção especial porque é responsável pelo particionamento dos dados. Quando você define `keyBy(event -> event.getUserId())`, está determinando que eventos com a mesma chave sejam direcionados para a mesma instância paralela do operador seguinte. Esse particionamento é fundamental para o processamento com estado por chave, pois permite que cada instância mantenha e gerencie o estado associado às chaves sob sua responsabilidade, sem a necessidade de coordenação distribuída a cada evento.

#### Fontes e destinos

Fonte e destino são os dois pontos em que o job encosta no mundo. Na linha 2.x eles passam por uma API só, `env.fromSource(...)` de um lado e `stream.sinkTo(...)` do outro.

As três fontes que aparecem em quase todo projeto:

| Fonte | Para que serve | O que ela guarda em estado |
|:--|:--|:--|
| **KafkaSource** | O caso comum. Lê um ou mais tópicos, com um consumer group. | O offset de cada partição |
| **Flink CDC** | Lê o log de transações de um banco e transforma cada mudança de linha em evento. | A posição no binlog ou no WAL |
| **FileSource** | Lê arquivos de um bucket ou do HDFS, em lote ou monitorando o diretório. | Quais arquivos e que trecho de cada um já foi lido |

E os três destinos:

| Destino | Para que serve | Garantia que oferece |
|:--|:--|:--|
| **KafkaSink** | Publica o resultado em outro tópico, para o próximo job ou para quem consome. | Exactly-once, via transações do Kafka |
| **JdbcSink** | Grava em Postgres, MySQL e afins, tipicamente o resultado agregado. | Idempotência, quando existe chave primária |
| **FileSink** | Escreve Parquet ou JSON particionado em armazenamento de objetos. | Exactly-once, confirmando os arquivos no checkpoint |

O formato do código é sempre o mesmo, um builder de um lado e outro do outro:

```java
KafkaSource<String> source = KafkaSource.<String>builder()
    .setBootstrapServers("kafka:9092")
    .setTopics("otlp-spans")
    .setGroupId("flink-otlp")
    .setStartingOffsets(OffsetsInitializer.earliest())
    .setValueOnlyDeserializer(new SimpleStringSchema())
    .build();

KafkaSink<String> sink = KafkaSink.<String>builder()
    .setBootstrapServers("kafka:9092")
    .setRecordSerializer(KafkaRecordSerializationSchema.builder()
        .setTopic("otlp-alerts")
        .setValueSerializationSchema(new SimpleStringSchema())
        .build())
    .setDeliveryGuarantee(DeliveryGuarantee.EXACTLY_ONCE)
    .setTransactionalIdPrefix("otlp-")
    .build();

env.fromSource(source, watermarkStrategy, "otlp-spans")
   .process(new AnomalyDetector())
   .sinkTo(sink);
```

Duas coisas nesse código não são detalhe de sintaxe. A primeira é que a fonte não faz commit de offset por conta própria: o **offset é estado do Flink**, entra no checkpoint junto com o resto e volta com ele numa recuperação. É por isso que não se gerencia offset na mão aqui, e é por isso também que o painel de consumer lag do Kafka pode discordar da realidade do job, já que o commit para o Kafka é só informativo.

A segunda é que o exactly-once no destino é uma propriedade do destino, não do Flink. O `KafkaSink` só alcança isso porque escreve dentro de uma transação que é confirmada quando o checkpoint fecha, e por isso ele exige um `transactionalIdPrefix` estável entre reinícios. O `FileSink` funciona pela mesma lógica: os arquivos ficam com sufixo de "em progresso" até o checkpoint confirmar, o que costuma assustar quem olha o bucket no meio do caminho e acha que nada está sendo escrito. Já o `JdbcSink` não tem transação distribuída, então a garantia que ele oferece depende de você escrever com chave primária e deixar a repetição ser inofensiva.

Vale insistir na parte do versionamento, porque ela morde. Com exceção dos conectores de sistema de arquivos e do `datagen`, que vêm dentro da distribuição, cada conector é um projeto separado, com repositório próprio, release próprio e numeração que não tem relação nenhuma com a do Flink. O `flink-connector-kafka` está na 5.0.0 enquanto o Flink está na 2.3. Os dois números não conversam, e não existe "a versão do conector que combina com a minha" por dedução.

O que existe é uma matriz de compatibilidade, publicada na página de downloads, e conferir essa matriz é passo obrigatório antes de escolher a versão do Flink de um projeto novo. O motivo é que a migração para a linha 2.x não foi simultânea, e boa parte do ecossistema ficou para trás. Alguns exemplos de como isso estava quando escrevi:

| Conector | Versão | Flink compatível |
|:--|:--|:--|
| Kafka | 5.0.0 | 2.1.x e 2.2.x |
| JDBC | 4.1.0 | 2.1.x e 2.2.x |
| Elasticsearch | 4.0.0 | 2.0.x |
| Prometheus | 1.0.0 | 1.19.x e 1.20.x |

O conector do Prometheus é o caso mais eloquente, e é um que me interessa de perto, porque ele é a saída natural para métricas derivadas de telemetria. Ele existe, é oficial, e escreve via a API de remote write do Prometheus. É só sink, não há fonte correspondente, o que faz sentido: o Prometheus é onde a série temporal termina, não de onde ela vem. Só que a 1.0.0 ainda é da linha 1.x do Flink e não atravessou para a 2.x. Quem quiser esse destino hoje escolhe entre ficar na 1.20, que é LTS, ou escrever a integração na mão.

E repare que nem o Kafka lista a 2.3 na tabela acima. A defasagem de um release entre o núcleo e os conectores é o estado normal das coisas, não uma exceção. Se o seu pipeline depende de um conector específico, é ele que decide qual versão do Flink você pode rodar, e não o contrário.

#### Paralelismo

Paralelismo é o número de instâncias de cada operador rodando ao mesmo tempo. Um job com paralelismo 8 tem oito cópias do source, oito do map e oito do sink, cada uma processando uma fatia dos dados e ocupando um slot. Cada uma dessas cópias é uma subtask, e é por isso que a interface web mostra métricas repetidas com índices de 0 a 7.

Ele pode ser definido em três alturas, da mais ampla para a mais específica. No job inteiro, com `env.setParallelism(8)` no código ou `parallelism.default` no `config.yaml`. No deploy, pelo campo `parallelism` do `FlinkDeployment`, que é o que aparece no manifesto mais adiante. E operador a operador, encadeando `.setParallelism(2)` na chamada, o que sobrescreve os anteriores. O caso típico do override é um sink que conversa com um banco que não aguenta oitenta conexões simultâneas: o resto do job continua largo e só a escrita é estrangulada de propósito.

Para o valor inicial, um ponto de partida razoável é igualar o paralelismo ao número de partições do tópico Kafka de entrada. A razão de não passar disso é específica e vale entender, porque o sintoma é confuso: as subtasks de fonte que sobram não recebem partição nenhuma, ficam ociosas e nunca emitem watermark. Como o watermark de um operador é o menor entre todas as suas entradas, uma fonte parada segura o relógio do job inteiro, e o resultado é uma janela que nunca fecha e um job que parece travado sem nenhum erro no log. Dá para contornar declarando `withIdleness()` na estratégia de watermark, que manda o Flink ignorar as entradas silenciosas, MAS É MAIS SIMPLES NÃO CRIAR O PROBLEMA. Ficar abaixo do número de partições também tem custo, menor: você deixa vazão do tópico na mesa, porque uma subtask passa a ler mais de uma partição.

Depois disso, o ajuste é por medição, não por conta. Os dois números que interessam na interface web são o *backpressure*, que mostra qual operador está segurando o fluxo, e o *busy time*, que mostra a fração do tempo em que cada subtask esteve realmente trabalhando em vez de esperando. Aumentar o paralelismo de um operador que passa o dia ocioso não melhora nada. Falo mais sobre esse dimensionamento na seção de CPU e slots.

Falta uma peça para o rescale fazer sentido, e ela é interna: o Flink não distribui chave por chave. Ele passa cada chave por um hash e a coloca em um **key group**, e o que é distribuído entre as subtasks são os key groups, em faixas contíguas. O key group é a unidade de movimentação de estado, ou seja, quando você muda o paralelismo, o que migra de uma máquina para outra são grupos inteiros, nunca chaves avulsas. Não se mexe nisso diretamente quase nunca, mas o termo aparece em log e em qualquer conversa sobre rescaling.

O número de key groups que existem é exatamente o `maxParallelism`. Daí vêm as duas propriedades que importam. Ele é o teto absoluto do paralelismo, porque não dá para ter mais subtasks do que grupos para distribuir entre elas. E ele não pode mudar depois, porque alterar a quantidade de grupos muda a que grupo cada chave pertence, o que invalida todo o estado já salvo.

A armadilha está no valor padrão. Sem configuração, o Flink calcula esse número a partir do paralelismo inicial: algo em torno de uma vez e meia ele, arredondado para cima, com piso de 128 e teto de 32768. Um job que sobe com paralelismo 8 fica com 128 e ninguém repara, porque nada quebra. O problema chega no dia em que esse job precisa de paralelismo 200, e a única saída é reconstruir o estado do zero.

Definir na mão desde a primeira execução resolve, e `env.setMaxParallelism(1024)` é um valor confortável. O que não vale é colocar 32768 por precaução: alguns state backends mantêm estruturas internas que crescem com o número de key groups, então exagerar cobra em desempenho. Um cuidado extra que sai de graça é escolher um valor divisível pelo paralelismo pretendido, porque assim os grupos se distribuem por igual. Com 128 grupos e paralelismo 12, algumas subtasks ficam com 11 e outras com 10, uma assimetria pequena mas evitável.

#### Redistribuição e data skew

Entre dois operadores existe sempre uma decisão sobre para qual subtask seguinte cada evento vai. Na maior parte do tempo ela é tomada pelo Flink sem que você peça, mas dá para escolher, e as opções são poucas:

| Estratégia | O que faz | Quando aparece |
|:--|:--|:--|
| `forward` | O evento fica na mesma subtask. Nada atravessa a rede | Entre operadores adjacentes de mesmo paralelismo. É o que permite o chaining |
| `hash` | Roteia pela chave, sempre a mesma chave para a mesma subtask | Todo `keyBy`, ou seja, sempre que existe estado por chave |
| `rebalance` | Round-robin entre todas as subtasks seguintes | Para reequilibrar depois de uma fonte que chega desbalanceada |
| `rescale` | Round-robin, mas só entre as subtasks vizinhas, preservando localidade | O mesmo objetivo do `rebalance`, evitando tráfego entre máquinas |
| `broadcast` | Cada evento vai para todas as subtasks seguintes | Distribuir regras ou configuração para todas as instâncias |

O `broadcast` merece nota porque é a base de um padrão inteiro: um stream pequeno de regras é transmitido para todas as subtasks, que o guardam em estado, enquanto o stream grande de eventos passa particionado por chave. É assim que se troca a lógica de um job sem redeploy.

Vale lembrar também que `rebalance` e `rescale` ganharam distribuição adaptativa na 2.3, olhando a carga real do destino em vez de fazer round-robin cego, e é uma opção que precisa ser ligada, como descrevo nos destaques da versão.

Nada disso resolve o problema que mais dói, que é o **data skew**. Skew é quando a distribuição das chaves é desigual: um cliente que sozinho responde por metade das transações, um produto que viralizou, um tenant gigante no meio de mil pequenos. Como o `keyBy` garante que a mesma chave vai sempre para a mesma subtask, essa subtask vira o gargalo, as outras ficam ociosas, e o job inteiro anda na velocidade da mais lenta. Aumentar o paralelismo não ajuda em nada, porque a chave pesada continua indo para um lugar só.

O diagnóstico é direto na interface web, e é por isso que o busy time importa tanto: skew aparece como backpressure concentrado em uma subtask e como uma instância em 100% de ocupação enquanto as vizinhas estão em 10%. Se todas estivessem em 90%, o problema seria de capacidade, e a resposta seria outra.

As saídas são três, em ordem de esforço. A primeira, e a mais usada, é agregar em duas fases: você acrescenta um sufixo aleatório à chave, algo como `cliente-42#0` até `cliente-42#9`, agrega parcialmente sobre essa chave inflada, e só então agrega de novo sobre a chave real. O trabalho pesado passa a ser dividido por dez subtasks, e a segunda etapa recebe apenas dez resultados parciais por chave em vez de milhões de eventos. A segunda, quando se está no SQL, é deixar o motor fazer isso: ligar o mini-batch e a otimização de agregação em duas fases resolve o caso comum sem reescrever consulta nenhuma, e existe até uma opção específica para dividir agregações com `DISTINCT`, que é a versão automática do mesmo truque. A terceira é aceitar que a chave-baleia é um caso à parte e tratá-la fora do fluxo normal, com um pipeline dedicado(clássica).

#### Operator chaining

O grafo que você escreve não é exatamente o grafo que roda. Antes de executar, o Flink funde operadores adjacentes em uma única task, e isso se chama *operator chaining*. Uma sequência como `map`, `filter` e `flatMap` vira uma coisa só, executada na mesma thread.

A fusão só acontece sob três condições: a ligação entre os operadores precisa ser `forward`, eles precisam ter o mesmo paralelismo e precisam estar no mesmo grupo de compartilhamento de slot. Um `keyBy` ou um `rebalance` quebram a corrente, porque nesses casos o registro precisa mesmo sair de uma instância e ir para outra.

O ganho é maior do que parece à primeira vista. Dentro de uma corrente, passar um registro de um operador para o próximo é uma chamada de método, e o objeto continua sendo o mesmo na memória. Entre duas tasks, o registro é serializado, vai para um buffer de rede e é desserializado do outro lado, e isso acontece mesmo quando as duas estão dentro do mesmo TaskManager. O chaining elimina esse custo inteiro.

É também a explicação para uma confusão comum na interface web: as caixas do grafo não correspondem aos seus operadores, elas correspondem às correntes. Você escreve seis operadores e vê duas caixas, cada uma listando dentro de si os nomes que absorveu.

A armadilha aparece na hora de investigar um problema. Métricas e backpressure são medidos por task, não por operador, então uma corrente inteira reporta um número só, e não dá para saber qual dos operadores fundidos está segurando o fluxo. Para descobrir, dá para quebrar a corrente de propósito: `.disableChaining()` isola um operador dos dois lados, e `.startNewChain()` começa uma corrente nova a partir dele. Isso é ferramenta de diagnóstico, não configuração para deixar ligada. O custo de serialização que você reintroduziu é real, então vale reverter depois de medir.

#### Rich functions

Toda interface de função tem uma versão "rich": `MapFunction` tem `RichMapFunction`, `FilterFunction` tem `RichFilterFunction`, e assim por diante. A diferença é que a versão rich acrescenta ciclo de vida e contexto, e é isso que separa uma função que apenas transforma um registro de uma função que precisa de recursos externos ou de memória.

O `open()` é chamado uma vez por instância paralela, antes do primeiro evento chegar. É o lugar de abrir conexão com um banco, carregar um cache de enriquecimento, compilar uma expressão regular e, principalmente, registrar os descritores de estado. Vale reparar no "por instância paralela": com paralelismo 8 ele roda oito vezes, uma em cada subtask, e o que ele cria não é compartilhado entre elas. O `close()` é o par dele, chamado no encerramento, e serve para devolver o que foi aberto.

O `getRuntimeContext()` é a porta de entrada para o que o runtime sabe. É por ele que se chega ao estado por chave, às métricas customizadas que você queira expor, ao índice da subtask atual e ao paralelismo do operador.

Se isso soar familiar quando você chegar na seção de estado, é porque o exemplo de lá já usa os dois: o `AnomalyDetector` sobrescreve `open()` e chama `getRuntimeContext().getState(...)` para criar o `ValueState`. Ele não tem "Rich" no nome, mas `KeyedProcessFunction` estende `AbstractRichFunction` e herda o mesmo ciclo de vida. As process functions já vêm ricas de fábrica.

Uma nota de versão que economiza tempo: até a 1.x a assinatura era `open(Configuration parameters)`. Na 2.x ela foi removida, e o método passou a receber um `OpenContext`. Exemplo copiado de tutorial antigo não compila por causa disso.

#### Tempo: a parte que quebra a intuição

Essa foi a seção que mais me fez parar e reler. Em streaming existem, no mínimo, dois tempos diferentes:

- **Event time:** quando o evento aconteceu de verdade. Está gravado dentro do próprio evento.
- **Processing time:** quando o Flink viu o evento. É o relógio da máquina.

Parece detalhe, mas não é. O celular de alguém ficou sem sinal no metrô e sincronizou vinte minutos depois. Um broker teve um pico de latência. Uma partição do Kafka ficou atrasada em relação às outras. Em todos esses casos, os eventos chegam **fora de ordem** e **atrasados**.

Se você agrupar por processing time, o resultado depende de quando o job rodou. Reprocessar o mesmo dia amanhã dá um número diferente. Se você agrupar por event time, o resultado é o mesmo sempre, independente de quando o processamento aconteceu. Essa reprodutibilidade é o motivo de event time ser o padrão em quase todo pipeline sério.

Mas isso cria um problema novo: se os eventos chegam fora de ordem, como saber quando uma janela de tempo pode ser fechada? Nunca chega um evento dizendo "acabou, pode contar".

#### Watermarks

A resposta do Flink são as **watermarks**. Uma watermark é um marcador que viaja junto com o stream carregando uma afirmação:

> "Acredito que não vou mais receber eventos com timestamp anterior a T."

É uma aposta, não uma certeza. E é exatamente por ser uma aposta que ela é útil: ela transforma uma pergunta impossível ("já chegou tudo?") em uma decisão configurável ("quanto atraso eu tolero?").

```java
WatermarkStrategy
    .<Event>forBoundedOutOfOrderness(Duration.ofSeconds(10))
    .withTimestampAssigner((event, ts) -> event.getTimestamp());
```

Esse código diz: tolere até 10 segundos de desordem. Se o maior timestamp já visto é `12:00:30`, a watermark vale `12:00:20`, e qualquer janela que termine antes disso pode ser fechada e emitida.

O trade-off aparece na hora:

- Watermark **agressiva** (pouco atraso tolerado) → resultado rápido, mais eventos perdidos por chegarem tarde.
- Watermark **conservadora** (muito atraso tolerado) → resultado correto, mas você espera mais para ver qualquer coisa.

Não existe valor certo. Existe o valor que combina com o seu negócio, e essa é uma decisão de produto disfarçada de configuração técnica.

Para eventos que chegam após o avanço da watermark, o Flink oferece mecanismos específicos para tratar dados atrasados. O `allowedLateness` permite manter a janela aberta por um período adicional, possibilitando o processamento de eventos tardios e a atualização dos resultados já produzidos. Outra alternativa é utilizar **side output**, direcionando os eventos que ultrapassaram o limite de atraso para um stream separado. Esse mecanismo pode ser útil para auditoria, métricas de qualidade dos dados ou para identificar problemas na configuração da estratégia de watermark.

#### Janelas

Como o stream é infinito, agregações só fazem sentido dentro de recortes.

- **Tumbling:** janelas fixas que não se sobrepõem. "A cada 5 minutos, quantos pedidos?"
- **Sliding:** janelas fixas que se sobrepõem. "Nos últimos 10 minutos, atualizando a cada 1 minuto." Um mesmo evento cai em várias janelas.
- **Session:** janelas definidas por inatividade. "Agrupe a atividade de um usuário até ele ficar 30 minutos parado." O tamanho da janela é dado pelos dados, não por você.

```java
stream
    .keyBy(Event::getUserId)
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(new EventCounter());
```

Um detalhe que eu não tinha entendido de cara: prefira `reduce`/`aggregate` a `process` quando puder. O `process` recebe todos os eventos da janela de uma vez, o que significa guardar todos eles em estado até o fechamento. Já `aggregate` mantém apenas o acumulador. Em janelas grandes, essa diferença é a diferença entre um job estável e um job que morre de OOM.

#### ProcessFunction

Os operadores prontos cobrem muita coisa, mas eles impõem uma forma. `map` transforma um evento em outro, `window` agrupa por recorte de tempo, `aggregate` acumula. Quando a lógica não cabe em nenhum desses moldes, o caminho é descer um nível e escrever uma `ProcessFunction`, que é o operador de mais baixo nível e mais poderoso da DataStream API. É a faca suíça do Flink, e não é exagero dizer que quase toda lógica de negócio realmente complicada acaba dentro de uma.

O que ela dá, a cada evento, são três coisas que os operadores prontos não dão juntas: acesso direto ao estado da chave, a capacidade de registrar timers e a de emitir para side outputs. As três chegam pelo mesmo lugar, aquele parâmetro `ctx` que aparece na assinatura do `processElement`.

O timer é a parte que muda o que dá para construir, porque é ele que permite reagir à passagem do tempo, e não só à chegada de um evento. Você registra um instante futuro e o Flink chama o seu `onTimer` quando ele chega:

```java
@Override
public void processElement(Event event, Context ctx, Collector<Alert> out) {
    ctx.timerService().registerEventTimeTimer(event.getTimestamp() + 600_000);
}

@Override
public void onTimer(long timestamp, OnTimerContext ctx, Collector<Alert> out) {
    // dez minutos de event time se passaram desde aquele evento
}
```

Duas propriedades desse mecanismo importam. A primeira é que um timer de event time não dispara quando o relógio da máquina chega lá, e sim quando a watermark passa daquele instante, o que amarra os timers na mesma noção de tempo das janelas: se a watermark não avança, o timer não dispara, e voltamos ao problema da fonte ociosa que descrevi antes. A segunda é que timers são estado, pertencem a uma chave e entram no checkpoint. Um job que reinicia não perde os timers pendentes, e é isso que torna viável escrever "se não acontecer nada nos próximos trinta minutos, alerte" e confiar na frase.

O side output é a segunda porta. Já apareceu aqui como destino de eventos atrasados, mas serve para qualquer bifurcação: registros que não passaram na validação, eventos que dispararam uma regra, amostras para auditoria. Você declara um `OutputTag`, chama `ctx.output(tag, valor)` e recupera esse fluxo depois com `getSideOutput(tag)`. A vantagem sobre um `filter` duplicado é que o evento é examinado uma vez só, e a vantagem sobre lançar uma exceção é que o job não morre por causa de um registro malformado.

Existem algumas variantes, e escolher a errada é um erro comum. A `KeyedProcessFunction` é a que vem depois de um `keyBy` e a única com estado por chave e timers. A `ProcessFunction` pura funciona sobre um stream não particionado e não tem nem uma coisa nem outra. A `CoProcessFunction` recebe dois streams e é o caminho para juntar um fluxo de eventos com um fluxo de regras ou de dados de referência. E a `ProcessWindowFunction` é a que roda no fechamento de uma janela, com todos os eventos dela em mãos.

O preço de descer para esse nível é que o Flink para de cuidar das coisas por você. Uma janela sabe quando terminar e joga fora o que acumulou; um estado que você criou dentro de uma `ProcessFunction` fica lá para sempre, para cada chave que já apareceu, até você apagá-lo explicitamente ou configurar TTL. É a mesma liberdade e o mesmo risco de qualquer abstração de baixo nível, e é o motivo de a recomendação continuar sendo usar o operador pronto sempre que ele couber.

#### Estado

Comecei a estudar o Flink escrevendo, antes dele, meu próprio consumer Kafka. A ideia era responder uma pergunta só: *o que um framework de processamento distribuído resolve além de ler eventos de um tópico ?*

A resposta apareceu rápido, e ela é uma lista. Gerenciamento de estado, paralelismo, particionamento, tolerância a falhas, recuperação depois de uma queda, event time, watermarks, coordenação entre as etapas do processamento. No consumer manual, cada item desses vira código seu. No Flink, quase todos fazem parte do runtime, e o que sobra para a aplicação é a lógica de processamento.

Qualquer processamento mais interessante em streaming precisa manter algum tipo de memória, seja para contar eventos, realizar deduplicação, detectar padrões, correlacionar dados ou comparar valores anteriores. Em um consumer tradicional, essa responsabilidade acaba ficando muito mais próxima da aplicação. No Flink, **o estado é gerenciado pelo runtime e pode ser distribuído, particionado por chave, armazenado de forma persistente e recuperado após uma falha por meio dos mecanismos de checkpoint e recuperação**. Isso muda bastante a forma de construir uma aplicação de streaming, principalmente quando começamos a pensar em escala, falhas e processamento contínuo.

O Flink oferece estado como uma primitiva de primeira classe, com tipos como `ValueState`, `ListState` e `MapState`, sempre associados a uma chave depois do `keyBy`.

`Que caralhos é uma Primitiva de primeira classe ??`

Vem da teoria de linguagens de programação. Algo é de primeira classe quando o sistema o trata como um cidadão pleno, com todos os direitos, em vez de um apêndice que você tem que gerenciar por fora.. significa que você não precisa de um banco. Aqui está a parte que realmente importa. A alternativa óbvia seria guardar esse acúmulo num Redis ou Postgres externo. O Flink faz diferente: o estado vive dentro do próprio operador, no processo do TaskManager, gerenciado pelo framework. Isso traz três consequências.

Primeira, é local. Ler estado é acesso a memória ou a um RocksDB no disco local da máquina, não uma chamada de rede. Isso é a diferença entre microssegundos e milissegundos por evento, e a razão pela qual o Flink consegue processar milhões de eventos por segundo com lógica que depende de histórico.

Segunda, entra nos checkpoints. Periodicamente o Flink tira um snapshot consistente de todo o estado de todos os operadores e grava num storage durável (S3, HDFS). Se um TaskManager morrer, o job reinicia do último checkpoint com o estado exatamente como estava, e os offsets do Kafka voltam junto. Isso é o que sustenta a semântica exactly-once que mencionamos antes. Com Redis externo, você teria que resolver essa consistência entre "o que já consumi do Kafka" e "o que já escrevi no Redis" na mão, e é notoriamente difícil.

Terceira, é redimensionável. Ao aumentar o paralelismo do job, o Flink redistribui o estado entre as novas instâncias automaticamente, a partir de um savepoint.

```java
public class AnomalyDetector extends KeyedProcessFunction<String, Event, Alert> {

    private transient ValueState<Double> lastValue;

    @Override
    public void open(OpenContext openContext) {
        lastValue = getRuntimeContext().getState(
            new ValueStateDescriptor<>("last-value", Double.class));
    }

    @Override
    public void processElement(Event event, Context ctx, Collector<Alert> out)
            throws Exception {
        Double previous = lastValue.value();
        if (previous != null && event.getValue() > previous * 3) {
            out.collect(new Alert(event, previous));
        }
        lastValue.update(event.getValue());
    }
}
```

Esse estado é **particionado por chave**: cada usuário tem o seu próprio `lastValue`, e o operador só enxerga a chave do evento atual. Também dá para configurar TTL, o que evita o problema clássico de estado que só cresce até estourar o disco.

Onde esse estado fica guardado é uma escolha, e são três opções na linha 2.x:

| Backend | Onde o estado vive | A favor | Contra |
|:--|:--|:--|:--|
| **HashMapStateBackend** | Heap da JVM, como objetos Java | O mais rápido, porque não serializa nada a cada acesso | Limitado pela memória e sujeito a pausas de GC. Não faz checkpoint incremental |
| **EmbeddedRocksDBStateBackend** | Disco local, em uma LSM tree embarcada | Escala até o tamanho do disco e faz checkpoint incremental | Serializa em toda leitura e escrita, e quer disco rápido |
| **ForStStateBackend** | Armazenamento remoto, com cache local | Rescale e recuperação quase imediatos, TaskManager leve | Novo e ainda experimental. A latência de rede é compensada por acesso assíncrono |

O padrão, se você não configurar nada, é o `HashMapStateBackend`. Isso costuma surpreender quem leu que "o Flink usa RocksDB", e a troca é uma linha em `state.backend.type`, que aceita `hashmap`, `rocksdb` ou `forst`.

A regra prática que eu tirei disso tem três casos. Estado de poucos gigabytes com latência crítica pede HashMap, porque a ausência de serialização é justamente o que você está comprando. Estado grande, de dezenas de gigabytes a terabytes, pede RocksDB com checkpoint incremental, e vale notar que ele é o único dos dois clássicos que oferece isso: com HashMap, todo checkpoint copia o estado inteiro. E estado enorme em nuvem, com autoscaling agressivo, é o caso para avaliar o ForSt, que é a aposta da série 2.x e sobre o qual escrevo mais no final.

#### Checkpoints e savepoints

O estado só é confiável porque existe um mecanismo de tolerância a falhas por trás dele.

Periodicamente, o JobManager injeta **barreiras de checkpoint** nas fontes. Essas barreiras fluem pelo grafo junto com os dados; quando um operador recebe a barreira, ele persiste seu estado em armazenamento durável (S3, HDFS, o que for) e repassa a barreira adiante. Quando todos os operadores terminam, o checkpoint está completo.

O algoritmo é uma variação do **Chandy-Lamport** para snapshots distribuídos. Achei bonito descobrir que uma coisa tão prática está apoiada num paper de 1985.

Na falha, o Flink restaura o último checkpoint completo, reposiciona os offsets das fontes e retoma. Daí vem o famoso **exactly-once**, que eu entendi errado durante bastante tempo. Não significa que cada evento é processado uma única vez fisicamente. Na recuperação, eventos são sim reprocessados. Significa que o **efeito sobre o estado** é como se cada evento tivesse sido processado uma vez só. É uma garantia sobre o resultado, não sobre a execução.

Estender essa garantia até o sink é outro assunto, e depende de o destino suportar escrita transacional ou idempotente (Kafka com transações, por exemplo).

A diferença entre checkpoint e savepoint também levou um tempo para assentar:

| | Checkpoint | Savepoint |
|:--|:--|:--|
| Quem dispara | O Flink, automaticamente | Você, manualmente |
| Propósito | Recuperação de falha | Upgrade, migração, fork do job |
| Ciclo de vida | Gerenciado pelo Flink | Seu para sempre |

Savepoint é o que permite parar um job, subir uma versão nova do código e continuar exatamente de onde parou, com o estado intacto. Na prática, é isso que torna um job de streaming algo que se pode operar por anos.

#### Flink SQL

Nem tudo precisa de Java. O Flink expõe uma Table API e SQL sobre o mesmo motor, e a mesma consulta roda tanto sobre dados finitos quanto sobre um stream infinito:

```sql
SELECT
    user_id,
    TUMBLE_START(event_time, INTERVAL '5' MINUTE) AS window_start,
    COUNT(*) AS total
FROM orders
GROUP BY
    user_id,
    TUMBLE(event_time, INTERVAL '5' MINUTE);
```

O conceito que sustenta isso é a **dualidade stream/tabela**: um stream é o log de mudanças de uma tabela, e uma tabela é o estado acumulado de um stream. São a mesma informação vista de dois ângulos.

Isso deixa de ser abstrato assim que você roda um `GROUP BY` no cliente SQL e olha a coluna `op`:

```
+----+------+-------+
| op | name | total |
+----+------+-------+
| +I |    a |     1 |
| +I |    b |     1 |
| -U |    a |     1 |
| +U |    a |     2 |
+----+------+-------+
```

O `a` entra com 1, é retratado (`-U`) e reemitido com 2 (`+U`). Não é uma tabela sendo preenchida aos poucos, é o log de mudanças dela passando na tela. O resultado de uma query em streaming não é um valor final, é uma sequência de correções sobre o valor anterior.

São quatro tipos de linha ao todo: `+I` para inserção, `-U` e `+U` para o antes e o depois de uma atualização, e `-D` para remoção. E é a combinação de tipos que uma consulta produz que define com que tipo de stream você está lidando, o que na prática decide onde ele pode ser gravado:

| Modo | O que sai da consulta | Exemplo | Onde grava |
|:--|:--|:--|:--|
| **Append-only** | Só `+I`. Nada do que já foi emitido muda. | Stream bruto de cliques, um `SELECT` com filtro. | Qualquer sink. |
| **Retract** | `+I`, e cada correção vira o par `-U` seguido de `+U`. | `GROUP BY` contínuo, sem janela, que revisa o total a cada evento. | Sink que entenda retração. |
| **Upsert** | Uma linha por chave, valendo como "esta é a versão atual". | O mesmo `GROUP BY`, quando o sink declara uma chave primária. | Sink com chave primária. |

A diferença entre retract e upsert é sutil e importa na hora de escolher o destino. No modo retract, o Flink emite duas linhas para cada correção, e quem recebe precisa saber subtrair a antiga antes de somar a nova. No modo upsert, ele emite só a linha nova, e quem recebe sobrescreve o que tinha naquela chave. O segundo é mais barato e é o que bancos relacionais e índices de busca esperam, mas só é possível quando existe uma chave que identifique a linha.

Isso leva à armadilha clássica, que dá para prever antes de cair nela. Você escreve um `GROUP BY` contínuo e aponta o resultado para um tópico Kafka comum. O conector Kafka padrão é append-only, e o resultado da sua consulta é um fluxo de correções, não de inserções. O job não chega nem a subir: o planejador rejeita a consulta com uma mensagem do tipo "table sink doesn't support consuming update changes which is produced by node GroupAggregate". A falha na hora do planejamento é uma boa notícia, porque o modo silencioso de errar isso seria gravar as retrações como se fossem eventos normais e ter um consumidor lá na frente somando tudo duas vezes.

Existem três saídas, e a escolha diz mais sobre o problema do que sobre o Flink. A primeira é usar um sink que aceite atualizações, como `upsert-kafka` ou JDBC com chave primária declarada. A segunda é fazer o resultado parar de mudar, agrupando por janela em vez de agrupar de forma contínua: quando a janela fecha, o valor é final e vira uma inserção só. A terceira, disponível a partir da 2.3, é converter explicitamente entre as formas com `FROM_CHANGELOG` e `TO_CHANGELOG`, que é o que descrevo mais adiante nos destaques da versão.

Para quem vem de dados, essa é a porta de entrada mais rápida, dá para chegar longe sem escrever uma linha de Java.

#### In praxi ("na prática")

Subir um cluster local é mais simples do que eu imaginava. Comecei com dois `docker run` soltos, mas troquei por um `docker-compose.yml` assim que quis mais de um TaskManager:

```yaml
name: flink-lab

services:
  jobmanager:
    image: flink:2.3.0-java21
    container_name: jobmanager
    command: jobmanager
    ports:
      - "8081:8081"
    environment:
      - |
        FLINK_PROPERTIES=
        jobmanager.rpc.address: jobmanager
        rest.address: 0.0.0.0
        rest.bind-address: 0.0.0.0
        jobmanager.memory.process.size: 1024m
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8081/overview || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 20
      start_period: 10s

  taskmanager:
    image: flink:2.3.0-java21
    command: taskmanager
    depends_on:
      jobmanager:
        condition: service_healthy
    deploy:
      replicas: 2
    environment:
      - |
        FLINK_PROPERTIES=
        jobmanager.rpc.address: jobmanager
        taskmanager.numberOfTaskSlots: 2
        taskmanager.memory.process.size: 1728m
```

Um `docker compose up -d` e a Web UI responde em `localhost:8081`.

Três escolhas aí não são detalhe. Duas réplicas de TaskManager com dois slots cada dão quatro slots, e é isso que faz o paralelismo deixar de ser sempre 1: sem folga de slots, todo grafo de job aparece na UI como uma fila reta. O `healthcheck` combinado com `depends_on: service_healthy` existe porque, sem ele, o TaskManager sobe antes de o JobManager estar de pé, falha ao registrar e enche o log de erro antes de funcionar na segunda tentativa. E os limites de memória estão explícitos porque o padrão do Flink é generoso: com esses valores o cluster inteiro fica em torno de 4,5 GB e cabe em qualquer máquina.

Antes de submeter qualquer coisa, a API REST diz se o cluster está inteiro de forma mais direta que a UI:

```bash
curl -s localhost:8081/overview
```

```json
{"taskmanagers": 2, "slots-total": 4, "slots-available": 4, "flink-version": "2.3.0"}
```

Os dois TaskManagers registrados e os quatro slots livres são a confirmação de que o cluster formou. A imagem ainda traz jobs de exemplo, então dá para ver um grafo em execução sem escrever uma linha:

```bash
docker exec jobmanager ./bin/flink run -d \
  /opt/flink/examples/streaming/TopSpeedWindowing.jar
```

Com ele rodando, `slots-available` cai para 3 e a UI finalmente tem o que mostrar.

A Web UI foi onde eu mais aprendi. Ela mostra o grafo do job, o paralelismo real de cada operador, o histórico de checkpoints (duração e tamanho) e, principalmente, o **backpressure**: quando um operador não consegue acompanhar o ritmo do anterior e a pressão se propaga para trás até a fonte. Ver isso acontecendo em tempo real ensina mais do que qualquer diagrama.

Para SQL, o caminho mais curto é o cliente interativo:

```bash
docker exec -it jobmanager ./bin/sql-client.sh
```

#### Deploy

O `docker-compose.yml` acima é um laboratório. Ele sobe um cluster, mas esconde quase todas as decisões que aparecem quando o job precisa rodar por meses sem alguém olhando. Essa foi a parte que mais me obrigou a ler manual, porque aqui não tem intuição que salve: é conta, é limite de container e é escolha de onde o estado vai parar.

##### Modos de execução

Antes de escolher onde rodar, é preciso escolher como. O Flink tem dois modos vivos hoje, e a diferença entre eles é o ciclo de vida do cluster.

No **session mode**, o cluster sobe primeiro e fica de pé esperando. Você submete vários jobs para o mesmo JobManager, e todos disputam os mesmos TaskManagers. É o que o meu compose faz, e é o modo certo para exploração, para o cliente SQL e para jobs curtos que não compensam o custo de subir um cluster novo. O preço é a ausência de isolamento: um job que estoura a memória derruba o TaskManager, e junto com ele vão as tarefas de todos os outros jobs que tinham slots naquele processo.

No **application mode**, cada aplicação ganha o seu próprio cluster dedicado, que nasce com ela e morre com ela. A diferença mais importante é sutil e está no `main()`: em vez de rodar na máquina de quem submete, ele roda dentro do JobManager. Isso tira do cliente a responsabilidade de baixar dependências e montar o grafo do job, e é o que torna o modo adequado para automação, porque não existe mais um processo cliente de fora que precisa continuar vivo. Para produção, é a resposta padrão.

Existiu ainda um terceiro modo, o per-job, que também dava um cluster por job mas mantinha o `main()` no cliente. Ele foi descontinuado e não faz mais parte da linha 2.x. Se você encontrar `-t yarn-per-job` em algum tutorial, é material de uma versão anterior.

Ortogonal a isso está o gerenciador de recursos: standalone (você mesmo sobe os processos, que é o caso do Docker Compose), Kubernetes ou YARN. A combinação que vejo recomendada com mais frequência hoje é application mode sobre Kubernetes.

##### Kubernetes

No Kubernetes existem três caminhos, e vale entender a diferença porque eles resolvem problemas distintos.

O primeiro é **standalone no Kubernetes**: você escreve dois `Deployment`, um para o JobManager e outro para o TaskManager, um `Service` e um `ConfigMap` com o `flink-conf.yaml`. O Flink não sabe que está no Kubernetes, ele só vê processos que se registram. Funciona, e é transparente, mas a escala é sua: mudar paralelismo é mudar réplicas na mão, e fazer upgrade com savepoint é uma sequência de comandos que alguém precisa lembrar de executar na ordem certa.

O segundo é o **native Kubernetes**, em que o próprio JobManager fala com a API do Kubernetes e cria os pods de TaskManager que faltam para atender o paralelismo pedido. Você submete com `flink run-application -t kubernetes-application` e não escreve manifesto de TaskManager nenhum. O cluster passa a se dimensionar de acordo com o job, e não o contrário.

O terceiro, e o que eu usaria, é o **Flink Kubernetes Operator**. Ele instala CRDs e transforma o job em um objeto declarativo do cluster:

```yaml
apiVersion: flink.apache.org/v1beta1
kind: FlinkDeployment
metadata:
  name: otlp-processor
spec:
  image: registry.example.com/otlp-processor:1.4.0
  flinkVersion: v2_0
  serviceAccount: flink
  flinkConfiguration:
    taskmanager.numberOfTaskSlots: "4"
    state.backend.type: rocksdb
    state.checkpoints.dir: s3://flink-state/otlp-processor/checkpoints
    state.savepoints.dir: s3://flink-state/otlp-processor/savepoints
    execution.checkpointing.interval: "60s"
    high-availability.type: kubernetes
    high-availability.storageDir: s3://flink-state/otlp-processor/ha
  jobManager:
    resource:
      cpu: 1
      memory: 2048m
  taskManager:
    replicas: 3
    resource:
      cpu: 4
      memory: 8192m
  job:
    jarURI: local:///opt/flink/usrlib/otlp-processor.jar
    parallelism: 12
    upgradeMode: savepoint
```

O que esse manifesto compra é operação. O `upgradeMode: savepoint` significa que, quando eu trocar a tag da imagem e aplicar de novo, o operator dispara um savepoint, para o job, sobe a versão nova e restaura o estado a partir dele, sem que ninguém precise executar `flink stop --savepointPath` manualmente às três da manhã. Ele também cuida de rollback quando o job novo não estabiliza, e traz um autoscaler que observa o backpressure real dos operadores e ajusta o paralelismo, que é bem diferente de um HPA olhando uso de CPU do pod.

Dois detalhes que não são opcionais. O primeiro é a `serviceAccount`: o JobManager precisa de permissão de RBAC para criar pods e para ler e escrever ConfigMaps, porque é em ConfigMap que a alta disponibilidade nativa guarda quem é o líder e qual é o último checkpoint. O segundo é o `high-availability.storageDir`: o ConfigMap guarda só o ponteiro, os metadados de verdade vão para armazenamento durável. Sem esse diretório configurado, um JobManager que morre volta sem saber de onde retomar, e o estado inteiro se perde apesar dos checkpoints existirem.

##### Memória

Essa é a conta que mais dá trabalho, porque o Flink não tem um número de memória, tem uma árvore deles. O valor que você configura é o `taskmanager.memory.process.size`, e ele é o total que o processo pode ocupar no sistema operacional. Tudo o mais é subdivisão.

Dentro dele, o Flink separa primeiro o que pertence à JVM e não ao Flink: o metaspace (`taskmanager.memory.jvm-metaspace.size`, 256m por padrão) e um overhead para pilhas de thread, buffers internos e código nativo (`taskmanager.memory.jvm-overhead.fraction`, 10% do process size). O que sobra é a memória do Flink propriamente dita, e ela se divide em quatro partes:

- O heap de tarefa, onde vivem os seus objetos e o estado quando o backend é o de heap.
- A memória gerenciada, que é off-heap e é onde o RocksDB aloca seus block caches e write buffers. Em job batch, é também onde acontecem sort e hash join.
- A memória de rede, que são os buffers de troca de dados entre tarefas.
- Um pedaço reservado para o framework, que raramente se mexe.

A regra que importa acima de todas: **o `process.size` tem que caber no limite de memória do container**. Se você der 8Gi de limite no pod e configurar `process.size: 8192m`, o pod vai ser morto por OOMKill, porque o cgroup conta também páginas de arquivo, alocações nativas do RocksDB fora do que o Flink contabiliza e o que o próprio kernel usa. Deixar uma folga de 10 a 15% resolve. Para 8Gi de limite, eu configuraria em torno de 7000m e dormiria melhor.

A segunda decisão é como dividir. Se o estado é grande e o backend é RocksDB, a memória gerenciada é a que faz diferença, porque é ela que determina o tamanho do cache antes de o acesso virar leitura de disco. Uma divisão de partida razoável é 40% de memória gerenciada e o resto entre heap e rede. Se o estado é pequeno e cabe em heap, o caminho inverso: `taskmanager.memory.managed.fraction: 0.1` e todo o resto para o heap.

A memória de rede é a que mais surpreende. Ela é 10% da memória do Flink por padrão, limitada a 1 GB, e o consumo cresce com o número de conexões entre tarefas, que por sua vez cresce com o quadrado do paralelismo em trocas do tipo `keyBy`. Um job com paralelismo 4 que passa para 200 pode começar a falhar com erro de buffers insuficientes sem que uma linha do código tenha mudado. É um dos poucos casos em que aumentar o paralelismo piora as coisas antes de melhorar.

##### CPU e slots

Slot não é CPU. Um slot é uma fatia de memória e um lugar no escalonamento, mas as threads de todos os slots de um TaskManager competem pelos mesmos cores da JVM. Não há isolamento de CPU entre slots.

Por isso a regra de partida é simples: `taskmanager.numberOfTaskSlots` igual ao número de cores que o container tem de limite. Quatro cores, quatro slots. Ir muito acima disso não aumenta a vazão, só aumenta a troca de contexto e o tempo de pausa que o coletor de lixo tem que administrar.

O paralelismo total do job então é o número de TaskManagers vezes os slots de cada um, e essa multiplicação é o número que aparece no manifesto. Três TaskManagers de quatro slots dão doze, que é o paralelismo do exemplo acima.

Para chegar ao número certo de TaskManagers, eu não tentaria calcular por primeiros princípios. O caminho que faz sentido é medir: subir o job com paralelismo baixo, injetar carga conhecida e olhar `numRecordsInPerSecond` por subtarefa na UI ou no Prometheus. Isso dá uma vazão por slot. Divide o pico esperado por esse número, adiciona uma folga de uns 30% para picos e para reprocessamento (porque depois de uma queda o job precisa correr mais rápido do que a produção para alcançar o presente) e o resultado é quantos slots são necessários. Um job de filtro e projeção pode fazer centenas de milhares de eventos por segundo em um slot; um job com janela grande, estado em RocksDB e deserialização de JSON pode fazer alguns milhares. A diferença entre esses dois casos é de ordens de grandeza, e é exatamente por isso que não dá para adivinhar.

Vale lembrar que mudar o paralelismo de um job com estado depois não é livre: o estado é redistribuído entre as novas subtarefas na restauração, e o teto continua sendo o `maxParallelism` fixado na primeira execução, pelo motivo que descrevi na seção de paralelismo.

##### Disco local

Com o RocksDB, o estado de trabalho não fica em memória, fica em arquivos no disco local do TaskManager, apontado por `io.tmp.dirs`. Isso é o que permite ter estado maior que a RAM, e é também o que faz o tipo de disco importar.

Precisa ser SSD local, não volume de rede. O RocksDB é uma LSM tree: escreve em arquivos ordenados e depois compacta esses arquivos em segundo plano, reescrevendo dados que já estavam lá. Essa amplificação de escrita, somada a leituras aleatórias a cada acesso de estado, é exatamente o padrão de I/O que um disco de rede atende mal. Já vi o mesmo job ir de estável a inutilizável só pela troca do tipo de volume.

Para o tamanho, a conta parte do estado lógico: número de chaves ativas vezes o tamanho do estado por chave, dividido pelo paralelismo, dá o estado por TaskManager. Depois disso, multiplique. Duas a três vezes é uma margem razoável, porque a compactação precisa de espaço para escrever os arquivos novos antes de apagar os antigos, e porque os checkpoints incrementais mantêm arquivos referenciados por snapshots anteriores que ainda não foram descartados. Dez milhões de chaves com 1 KB de estado cada dão 10 GB de estado lógico; em três TaskManagers, isso é algo entre 7 e 10 GB de disco em cada um.

No Kubernetes, isso significa escolher entre `emptyDir` e volume persistente. Com `emptyDir`, o disco morre com o pod, e um restart obriga o TaskManager a baixar o estado inteiro do armazenamento remoto antes de voltar a processar, o que em estados grandes é a diferença entre segundos e muitos minutos de recuperação. Com um volume persistente e `state.backend.local-recovery: true`, a cópia local sobrevive ao restart e a recuperação lê do disco em vez da rede. É mais complexidade em troca de tempo de recuperação, e a escolha depende de quanto o atraso custa.

##### S3 e o sistema de arquivos remoto

Aqui está a confusão que eu mesmo tinha antes de estudar: **o S3 não é onde o estado vive, é onde as cópias dele são guardadas**. O estado quente está no heap ou no disco local do TaskManager, e é lá que ele é lido e escrito a cada evento. O S3 entra em quatro momentos, e todos eles são periódicos ou excepcionais.

O primeiro são os checkpoints. A cada intervalo configurado, cada operador escreve seu estado em `state.checkpoints.dir`. É isso que sobrevive à perda simultânea de todos os pods.

O segundo são os savepoints, em `state.savepoints.dir`, que é o mesmo mecanismo com outro ciclo de vida: eles são seus, não são apagados pelo Flink, e é deles que sai o upgrade sem perder estado.

O terceiro são os metadados de alta disponibilidade, em `high-availability.storageDir`. O ConfigMap do Kubernetes é pequeno demais para guardar o grafo do job e os ponteiros completos, então ele guarda apenas a referência e o conteúdo fica no armazenamento remoto.

O quarto, quando existe, são os próprios dados: uma fonte que lê Parquet de um bucket, ou um sink que escreve resultados particionados por hora.

A razão de ser S3, e não um disco compartilhado, é que a durabilidade precisa ser independente do cluster. Um checkpoint que está no mesmo hardware que o job não protege contra a perda desse hardware. O armazenamento de objetos é barato, replicado e continua existindo depois de o cluster inteiro deixar de existir, que é precisamente a propriedade que faz um job de streaming ser recuperável. GCS, Azure Blob e HDFS ocupam o mesmo lugar na arquitetura, com outra letra no esquema da URI.

A configuração tem uma pegadinha que custa tempo. O Flink traz duas implementações de S3, e elas não são intercambiáveis. A `flink-s3-fs-presto` é a indicada para checkpoints, porque é rápida com arquivos pequenos e não depende de renomear objetos, operação que o S3 não tem de forma atômica e que emula com uma cópia seguida de uma remoção. A `flink-s3-fs-hadoop` é a que suporta escrita recuperável, que é o que o sink de arquivos precisa para fazer upload multipart e confirmar só no checkpoint. Muita gente instala as duas e usa `s3p://` para o estado e `s3a://` para os dados. As duas são plugins e precisam ir para `/opt/flink/plugins/`, cada uma em seu próprio diretório, e não para `lib/`. No `lib/` elas carregam no classloader principal e conflitam entre si.

O último ponto é sobre o intervalo de checkpoint, que parece uma configuração de latência e é também uma conta de custo. Cada checkpoint escreve pelo menos um arquivo por subtarefa com estado. Um job com paralelismo 200 e checkpoint a cada 10 segundos produz na ordem de setenta mil objetos por hora, e o S3 cobra por requisição além de limitar a taxa por prefixo. Isso aparece como latência de checkpoint subindo e, no limite, como checkpoint expirando por timeout. Duas defesas ajudam: subir o `state.storage.fs.memory-threshold` para que estados pequenos viajem dentro do arquivo de metadados em vez de virarem objetos separados, e aceitar um intervalo maior. Um minuto entre checkpoints é um valor comum, e o que ele custa é apenas a quantidade de trabalho que precisa ser refeita depois de uma falha.

#### O ecossistema em volta

O Flink raramente aparece sozinho. Ele é um motor de processamento, e um motor precisa de algo que alimente, de algum lugar onde depositar e de gente que leia o que ele produziu. Boa parte do trabalho de montar um pipeline é escolher essas peças, então vale mapear as que mais aparecem ao lado dele e, principalmente, por que aparecem.

| Ferramenta | Onde entra | Por que ela aparece junto |
|:--|:--|:--|
| **Apache Kafka** | Ingestão | Desacopla quem produz de quem processa e guarda o histórico. É o que permite reprocessar um job desde o começo, e não apenas a partir de agora |
| **Debezium** | Ingestão | Ler binlog e WAL corretamente, com snapshot inicial e sem perder transação, é difícil o bastante para ninguém querer reescrever. O Flink CDC o usa por baixo |
| **Schema Registry, com Avro ou Protobuf** | Contrato | Um job que desserializa JSON na mão quebra na primeira mudança do produtor. O registro torna o contrato explícito e verificável antes do deploy, não em produção |
| **Apache Iceberg** | Armazenamento | Dá transação, evolução de schema e viagem no tempo sobre arquivos em object storage. Sem isso o job escreve Parquet solto e quem lê enxerga escrita pela metade |
| **Apache Paimon** | Armazenamento | Nasceu dentro da comunidade do Flink para o caso que o Iceberg atende pior: atualização por chave primária em alta taxa, com changelog que dá para ler de volta |
| **Apache Hudi** | Armazenamento | A terceira opção do mesmo espaço, mais antiga, com foco em upsert e leitura incremental |
| **Hive Metastore, AWS Glue ou Nessie** | Catálogo | O formato de tabela sabe quais arquivos formam uma tabela. O catálogo sabe quais tabelas existem. Sem ele, não há o que listar no Flink SQL |
| **Trino** | Consulta | O Flink não é motor de consulta interativa. O Trino lê as mesmas tabelas Iceberg para responder a pergunta que ninguém tinha previsto |
| **ClickHouse, Druid ou Pinot** | Serving analítico | Dashboard quer resposta em milissegundos sobre dados recentes. O Flink pré-agrega e empurra para lá, e a consulta do usuário nunca toca o stream |
| **PostgreSQL e MySQL** | Operacional | Fonte via CDC de um lado e destino do resultado agregado do outro, quando quem consome é uma aplicação e não um analista |
| **Redis** | Serving de baixa latência | Guarda o que já foi calculado para quem precisa ler fora do stream, em microssegundos. É também o online store típico de uma feature store |
| **Feast** | Machine learning | Feature store. Garante que a feature usada no treino e a usada na inferência sejam a mesma coisa, calculada do mesmo jeito |
| **Prometheus e Grafana** | Operação | Métricas do próprio job (duração de checkpoint, backpressure, lag por partição) e destino natural das métricas derivadas que o job calcula |
| **Airflow ou Dagster** | Orquestração | Um job de streaming não tem agenda, mas tudo em volta dele tem: backfill, compactação de tabela, expiração de snapshot, upgrade com savepoint |

Três dessas escolhas têm um detalhe que só aparece depois, e vale adiantar.

O primeiro é o problema dos arquivos pequenos. O sink do Iceberg confirma o que escreveu quando o checkpoint fecha, então o intervalo de checkpoint deixa de ser só uma decisão de recuperação e passa a determinar quantos arquivos e quantos snapshots a tabela ganha por hora. Checkpoint a cada dez segundos em um job com paralelismo alto produz uma tabela com milhares de arquivos minúsculos por dia, que é o pior formato possível para quem for lê-la depois. A solução não é evitar o Iceberg, é aceitar que compactação e expiração de snapshot são trabalho recorrente, e é justamente esse trabalho que costuma justificar um Airflow ao lado de um pipeline que, no papel, não tinha nada de agendado.

O segundo é o catálogo, que quase sempre é lembrado tarde. É fácil pensar no formato de tabela e esquecer que alguém precisa saber que a tabela existe. Sem catálogo configurado, o `CREATE TABLE` do Flink SQL vive só na sessão e some quando o cliente fecha, e o Trino do outro lado não enxerga nada do que foi criado. Escolher o catálogo é o que faz Flink e os outros motores estarem falando da mesma tabela, em vez de dos mesmos arquivos por coincidência.

O terceiro é a razão de existir uma feature store, que demorei a entender. O problema que ela resolve não é de armazenamento, é de consistência: se a feature "média de compras nos últimos 30 minutos" é calculada por um job Flink na inferência e por uma query SQL no treino, as duas vão discordar em algum detalhe, e o modelo passa a ver em produção dados diferentes dos que viu ao aprender. Manter uma definição só, alimentada pelo mesmo job, é o ponto. E vale notar que parte disso está migrando para dentro do próprio Flink com as funções de modelo da 2.1 e 2.2, que descrevo mais adiante.

#### O que eu ainda não sei

Lista honesta do que ficou em aberto:

- Ajuste fino de RocksDB e o comportamento do estado quando ele cresce muito além da memória.
- Estratégias de join entre streams, principalmente interval joins e temporal joins.
- A biblioteca de CEP, citada lá em cima nos casos de uso e ainda não testada por mim.
- Como isso tudo se comporta de verdade em produção sob carga irregular, a parte que nenhuma documentação ensina.

#### O que ficou

Terminei a semana com uma impressão que não esperava ter: a parte difícil de streaming não é distribuir o processamento. Isso o Flink resolve. A parte difícil é o **tempo**: aceitar que os dados chegam desordenados, que "completo" é uma aposta e não um fato, e que quase toda decisão técnica aqui é, no fundo, uma escolha entre latência e correção.

Escrever isto me forçou a admitir umas três ou quatro coisas que eu achava que sabia e não sabia. Valeu pelo esforço.

Falta dizer por que fui atrás disso, porque não é Flink pelo Flink. O que eu quero é processar OTLP, o formato que o OpenTelemetry Collector fala, e na prática isso significa os quatro sinais: logs, spans, métricas e profiles.

O Collector recebe, transforma e encaminha muito bem, mas ele é feito para o dado passar. No momento em que a pergunta precisa de memória entre eventos, de janela por event time ou de correlacionar sinais que chegam separados e fora de ordem, ela cai exatamente no que este texto descreve: `keyBy`, estado por chave e watermark. É esse encaixe que eu quero testar na próxima rodada.

Próxima semana no cronograma: revisar o roadmap de Data Engineer. Continuo escrevendo enquanto aprendo.

#### A versão atual: destaques do Flink 2.3

Tudo que está acima foi estudado sobre a linha 2.x, então vale registrar onde ela está hoje e o que cada salto trouxe. A versão estável no momento em que escrevo é a **2.3.0**, de 25 de junho de 2026. Em paralelo, a linha 1.x continua viva na **1.20**, que é a versão de suporte estendido (LTS) para quem ainda não migrou.

| Versão | Data | O que ela é |
|:--|:--|:--|
| 2.0.0 | mar/2025 | A quebra de compatibilidade. Estado desagregado e limpeza de APIs antigas. |
| 2.1.0 | jul/2025 | `ML_PREDICT` no SQL, primeiros passos de inferência dentro do stream. |
| 2.2.0 | dez/2025 | Modelos na Table API, busca vetorial, delta joins. |
| 2.3.0 | jun/2026 | SQL de changelog, S3 nativo, aplicação como conceito de primeira classe. |

##### Estado desagregado

Esse é o item mais importante da linha 2.x, e vale entender o problema antes da solução. Nas versões anteriores, o estado quente vivia no disco local do TaskManager, normalmente sob o RocksDB. Isso é rápido, mas amarra o job ao hardware de três formas incômodas. O disco local é um recurso escasso e caro dentro de um contêiner, e um job com dezenas de terabytes de estado simplesmente não cabe. A compactação do RocksDB gera picos de CPU e de I/O que não têm relação nenhuma com o volume de eventos naquele instante, o que torna o dimensionamento um chute. E mudar o paralelismo obriga a redistribuir fisicamente todo esse estado entre as máquinas, o que faz um rescale de um job grande levar dezenas de minutos.

O estado desagregado inverte isso: o estado passa a viver no armazenamento remoto, e o disco local vira cache. O backend que implementa essa ideia se chama **ForSt**, de "For Streaming", e chegou com a 2.0. Ele não foi escrito do zero: é um fork do RocksDB mantido pela Ververica, modificado para ler e escrever direto no sistema de arquivos distribuído em vez de assumir disco local, com várias operações de I/O em paralelo. O código é aberto e vive fora do repositório do Flink, em [github.com/ververica/ForSt](https://github.com/ververica/ForSt), onde ele se descreve como "a persistent key-value store designed for streaming processing". Isso é o que torna o checkpoint barato: se o estado já está no armazenamento remoto, o checkpoint deixa de ser uma cópia e passa a ser quase só um ponteiro. Pelo mesmo motivo, o rescale deixa de precisar mover dados.

Herdar o RocksDB importa mais do que parece. Significa que a estrutura de armazenamento continua sendo a mesma LSM tree de sempre, com o mesmo comportamento de escrita, os mesmos níveis e a mesma compactação. O que mudou foi onde os arquivos ficam. Na prática, o conhecimento acumulado sobre ajustar RocksDB não foi jogado fora, ele só passou a conviver com uma camada de latência de rede no meio.

Existe um porém óbvio: ler estado pela rede a cada evento é ordens de magnitude mais lento que ler do disco local. A resposta para isso é a outra metade do trabalho, o **modelo de execução assíncrono**. O acesso ao estado é desacoplado do processamento, de modo que o operador não fica bloqueado esperando a resposta de uma leitura remota; ele dispara a requisição e segue processando outros registros, o que permite que muitas leituras estejam em voo ao mesmo tempo. Isso significa processar registros fora de ordem internamente, e a parte difícil da implementação foi justamente preservar as garantias que dependem de ordem: watermarks, timers e a ordenação por chave continuam se comportando como antes.

Sete operadores de SQL com estado (joins, agregações e janelas) foram reescritos sobre a API de estado assíncrona, e ficam atrás de uma configuração:

```yaml
table.exec.async-state.enabled: true
```

Os números que o projeto publicou, medidos com o Nexmark, ajudam a calibrar a expectativa. Em consultas pesadas de I/O, o estado desagregado entrega de 75% a 120% do throughput do estado local, ou seja, pode até ganhar. Em consultas com estado pequeno, de 10MB a 400MB, a diferença fica dentro de 10%. O ponto que eu tiro disso é que não se trata de um substituto universal: é a escolha certa quando o estado é grande demais para o disco local ou quando o rescale rápido importa mais que a latência mínima.

##### O que a 2.0 removeu

A 2.0 foi a primeira quebra de compatibilidade em uma década, e a lista de remoções é grande o suficiente para atrapalhar quem tentar migrar sem ler. A API DataSet foi removida, e o caminho é DataStream ou Table API. As APIs em Scala saíram junto. `SourceFunction`, `SinkFunction` e o Sink V1 foram removidos em favor das interfaces novas de fonte e destino. O `flink-conf.yaml` deu lugar ao `config.yaml`, em YAML padrão de verdade, com mais de cem opções obsoletas eliminadas. O modo de execução per-job saiu, restando session e application. O Java 8 deixou de ser suportado, o 17 virou padrão e o 21 passou a ser oficial. E o detalhe que mais dói na prática: não há compatibilidade de estado entre 1.x e 2.x, então um savepoint antigo não é restaurável na 2.x.

##### IA dentro do stream

Essa é a direção que o projeto vem seguindo desde a 2.1. A ideia é declarar um modelo como se declara uma tabela, com um provedor e credenciais, e então invocá-lo dentro da consulta. A 2.1 trouxe a função `ML_PREDICT` no SQL. A 2.2 levou isso para a Table API e adicionou `VECTOR_SEARCH`, que faz busca por similaridade contra um índice vetorial dentro do próprio fluxo, com modo assíncrono e timeout configuráveis. É o que torna viável enriquecer um evento com contexto recuperado no momento em que ele passa, sem sair para um serviço externo escrito à mão.

##### Os destaques da 2.3

A 2.3 é uma versão de amadurecimento, com quinze FLIPs implementados. Os pontos que me pareceram mais relevantes:

A conversão de changelog ganhou sintaxe própria. `FROM_CHANGELOG` e `TO_CHANGELOG` fazem no SQL a travessia entre as formas que descrevi na seção de Flink SQL, que antes ficava implícita na configuração da fonte. É o que resolve casos como arquivar um changelog em um tópico append-only e reinterpretá-lo como tabela dinâmica depois.

O filesystem S3 foi reescrito, e isso muda diretamente o que escrevi na seção de deploy. O plugin novo `flink-s3-fs-native` é uma implementação escrita do zero sobre o AWS SDK v2, com I/O não bloqueante e sem nenhuma dependência do Hadoop, e registra os esquemas `s3://` e `s3a://` com um espaço de configuração próprio (`s3.region`, `s3.endpoint`, `s3.upload.min.part.size`, `s3.async.enabled`, entre outros). Ele ainda é experimental, mas a intenção declarada é acabar com a escolha entre a implementação Presto e a Hadoop que descrevi antes.

A aplicação virou um conceito de primeira classe. Até aqui o modelo mental era cluster e job. A 2.3 introduz a aplicação acima disso, formando uma hierarquia de cluster, aplicação e job, com aba própria na interface web e o job linkando para a aplicação que o originou. É uma mudança de observabilidade, não de execução, e resolve o problema de olhar para um cluster com dezenas de jobs e não saber a qual entrega cada um pertence.

O checkpoint agora pode acontecer durante a recuperação. Antes, um job que estava se recuperando de um checkpoint unaligned não podia tirar um novo checkpoint até terminar, e uma segunda falha no meio desse processo jogava fora todo o trabalho de recuperação. A FLIP-547 permite disparar o checkpoint durante a recuperação, com duas chaves desligadas por padrão: `execution.checkpointing.unaligned.during-recovery.enabled` e `execution.checkpointing.unaligned.recover-output-on-downstream.enabled`. Vale para quem tem estado grande e rescale frequente.

O alinhamento de watermarks ganhou um buffer. O algoritmo de alinhamento foi redesenhado com um buffer, controlado por `pipeline.watermark-alignment.buffer-size` (padrão 3), que elimina atrasos de anúncio entre fontes. O efeito é sentido no processamento de backlog, quando o job precisa recuperar horas de atraso. Colocar o valor em zero restaura o comportamento da 2.2.

O particionamento ficou adaptativo. `RebalancePartitioner` e `RescalePartitioner` passam a distribuir dados olhando a carga real das tarefas de destino, em vez de fazer round-robin cego. Ativado com `taskmanager.network.adaptive-partitioner.enabled`, desligado por padrão. Ajuda quando o backpressure é desigual entre as instâncias.

A exportação de métricas OpenTelemetry ficou mais robusta, relevante para o que eu quero fazer: o exportador OTel ganhou compressão (`metrics.reporter.otel.exporter.compression: gzip`) e divisão em lotes (`metrics.reporter.otel.batch.size`), para dar conta de cargas de métricas grandes demais para o limite de mensagem do gRPC. Quem tem um job com paralelismo alto conhece esse erro.

Duas observações honestas para fechar. A primeira é que a maior parte desses destaques está desligada por padrão, o que é a postura correta para um projeto desse tamanho, mas significa que atualizar a versão não entrega nada disso sozinho. A segunda é que quase nada aqui eu testei: essa seção é leitura de release notes, não experiência. Fica anotado para as próximas partes.
