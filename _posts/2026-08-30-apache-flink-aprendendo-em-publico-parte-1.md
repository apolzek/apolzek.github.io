---
layout: post
title: "Apache Flink: Aprendendo em Público, parte 1"
minute: 18
---

#### Índice

- [O problema que o Flink resolve](#o-problema-que-o-flink-resolve)
- [A arquitetura, em poucas peças](#a-arquitetura-em-poucas-peças)
- [Tempo: a parte que quebra a intuição](#tempo-a-parte-que-quebra-a-intuição)
- [Watermarks](#watermarks)
- [Janelas](#janelas)
- [Estado](#estado)
- [Checkpoints e savepoints](#checkpoints-e-savepoints)
- [Flink SQL](#flink-sql)
- [In praxi](#in-praxi-na-prática)
- [Deploy](#deploy)
  - [Modos de execução](#modos-de-execução)
  - [Kubernetes](#kubernetes)
  - [Memória](#memória)
  - [CPU e slots](#cpu-e-slots)
  - [Disco local](#disco-local)
  - [S3 e o sistema de arquivos remoto](#s3-e-o-sistema-de-arquivos-remoto)
- [O que eu ainda não sei](#o-que-eu-ainda-não-sei)
- [O que ficou](#o-que-ficou)

Este texto é o resultado do que estudei e experimentei ao longo desta semana. Não é um tutorial de quem domina Apache Flink, nem pretende ser uma referência definitiva sobre o assunto. É mais como um caderno de anotações de alguém que está aprendendo, testando algumas coisas na prática e compartilhando o que conseguiu entender e descobrir até aqui.

Sempre achei que explicar é a melhor forma de descobrir o que a gente realmente entendeu. Quando escrevo, os buracos aparecem sozinhos.. ao longo do texto, misturo conceitual e técnico: tem uma parte mais conceitual, para entender como o Apache Flink funciona e quais são os principais conceitos por trás dele, e uma parte mais técnica, com exemplos, testes e experimentos que fui fazendo durante o estudo. A ideia é conectar o que a documentação diz com o que consegui colocar em prática e observar nos meus próprios testes.

#### O problema que o Flink resolve

Durante muito tempo o mundo de dados foi organizado em torno do lote. Você acumula dados durante o dia, roda um job à meia-noite, e de manhã o relatório está pronto. Isso funciona, e continua funcionando para muita coisa. O problema é quando a resposta precisa vir antes. Detectar uma fraude de cartão dez horas depois da compra é o mesmo que não detectar. Um alerta de infraestrutura que chega no dia seguinte é um post-mortem, não um alerta. Nesses casos, você não quer perguntar aos dados de tempos em tempos, você quer que os dados respondam continuamente. Essa é a inversão que o processamento de streams propõe:

- **Batch**: a consulta é permanente, os dados são finitos. Você roda a query contra um conjunto parado.
- **Streaming**: os dados são infinitos, a consulta é que fica parada. Ela é registrada uma vez e reage a cada evento que passa.

O Apache Flink é um motor de processamento distribuído voltado para a construção desse segundo tipo de aplicação. Um dos pontos que mais me chamou atenção durante o estudo foi o modelo unificado de processamento: no Flink, batch pode ser entendido como um caso particular de streaming, em que o fluxo de dados possui um início e um fim definidos. Isso significa que o modelo de execução não depende de dois motores completamente distintos, mas de uma mesma arquitetura capaz de processar tanto fluxos contínuos quanto conjuntos de dados finitos.

#### A arquitetura, em poucas peças

| Peça | O que faz |
|:--|:--|
| **JobManager** | O coordenador. Recebe o job, transforma o grafo lógico em grafo de execução, distribui as tarefas, dispara os checkpoints e coordena a recuperação de falhas. |
| **TaskManager** | O trabalhador. É um processo JVM que executa as tarefas de verdade e guarda o estado local. |
| **Task Slot** | A unidade de paralelismo dentro de um TaskManager. Um TaskManager com 4 slots consegue rodar 4 fatias de trabalho em paralelo. |
| **Client** | Quem empacota o job e submete ao JobManager. Depois disso, ele pode ir embora. |

Um job é representado como um **grafo de operadores**, composto por fontes (`source`), transformações (`map`, `filter`, `keyBy`, `window`) e destinos (`sink`). A partir desse grafo, o Flink determina o paralelismo de cada operador e distribui suas instâncias entre os slots disponíveis no cluster.

O `keyBy` merece atenção especial porque é responsável pelo particionamento dos dados. Quando você define `keyBy(event -> event.getUserId())`, está determinando que eventos com a mesma chave sejam direcionados para a mesma instância paralela do operador seguinte. Esse particionamento é fundamental para o processamento com estado por chave, pois permite que cada instância mantenha e gerencie o estado associado às chaves sob sua responsabilidade, sem a necessidade de coordenação distribuída a cada evento.

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

#### Estado

Comecei a estudar o Flink escrevendo, antes dele, meu próprio consumer Kafka. A ideia era responder uma pergunta só: o que um framework de processamento distribuído resolve além de ler eventos de um tópico?

A resposta apareceu rápido, e ela é uma lista. Gerenciamento de estado, paralelismo, particionamento, tolerância a falhas, recuperação depois de uma queda, event time, watermarks, coordenação entre as etapas do processamento. No consumer manual, cada item desses vira código seu. No Flink, quase todos fazem parte do runtime, e o que sobra para a aplicação é a lógica de processamento.

Qualquer processamento mais interessante em streaming precisa manter algum tipo de memória, seja para contar eventos, realizar deduplicação, detectar padrões, correlacionar dados ou comparar valores anteriores. Em um consumer tradicional, essa responsabilidade acaba ficando muito mais próxima da aplicação. No Flink, **o estado é gerenciado pelo runtime e pode ser distribuído, particionado por chave, armazenado de forma persistente e recuperado após uma falha por meio dos mecanismos de checkpoint e recuperação**. Isso muda bastante a forma de construir uma aplicação de streaming, principalmente quando começamos a pensar em escala, falhas e processamento contínuo.

O Flink oferece estado como uma primitiva de primeira classe, com tipos como `ValueState`, `ListState` e `MapState`, sempre associados a uma chave depois do `keyBy`:

```java
public class AnomalyDetector extends KeyedProcessFunction<String, Event, Alert> {

    private transient ValueState<Double> lastValue;

    @Override
    public void open(Configuration config) {
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

O backend padrão hoje é o RocksDB, que guarda o estado em disco local em vez de manter tudo em heap. Isso permite estado maior que a memória disponível, ao custo de serialização em cada acesso.

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

Vale lembrar que mudar o paralelismo de um job com estado depois não é livre: o estado é redistribuído entre as novas subtarefas na restauração, e isso é limitado pelo `maxParallelism`, que é fixado na primeira execução e não pode ser alterado sem reescrever o savepoint. Definir esse valor com folga desde o começo é uma daquelas decisões baratas de tomar hoje e caras de corrigir depois.

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

#### O que eu ainda não sei

Lista honesta do que ficou em aberto:

- Ajuste fino de RocksDB e o comportamento do estado quando ele cresce muito além da memória.
- Estratégias de join entre streams, principalmente interval joins e temporal joins.
- CEP, a biblioteca de detecção de padrões complexos.
- Como isso tudo se comporta de verdade em produção sob carga irregular, a parte que nenhuma documentação ensina.

#### O que ficou

Terminei a semana com uma impressão que não esperava ter: a parte difícil de streaming não é distribuir o processamento. Isso o Flink resolve. A parte difícil é o **tempo**: aceitar que os dados chegam desordenados, que "completo" é uma aposta e não um fato, e que quase toda decisão técnica aqui é, no fundo, uma escolha entre latência e correção.

Escrever isto me forçou a admitir umas três ou quatro coisas que eu achava que sabia e não sabia. Valeu pelo esforço.

Falta dizer por que fui atrás disso, porque não é Flink pelo Flink. O que eu quero é processar OTLP, o formato que o OpenTelemetry Collector fala, e na prática isso significa os quatro sinais: logs, spans, métricas e profiles.

O Collector recebe, transforma e encaminha muito bem, mas ele é feito para o dado passar. No momento em que a pergunta precisa de memória entre eventos, de janela por event time ou de correlacionar sinais que chegam separados e fora de ordem, ela cai exatamente no que este texto descreve: `keyBy`, estado por chave e watermark. É esse encaixe que eu quero testar na próxima rodada.

Próxima semana no cronograma: revisar o roadmap de Data Engineer. Continuo escrevendo enquanto aprendo.
