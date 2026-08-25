---
layout: post
title: "Apache Flink: Aprendendo em Público"
# tags: flink streaming data-engineering
minute: 12
---

A primeira semana do meu cronograma do segundo semestre dizia apenas: *"Deepen my knowledge of Apache Flink"*. Este texto é o resultado dessa semana. Não é um tutorial de alguém que domina o assunto, é o caderno de anotações de alguém que está aprendendo e resolveu escrever enquanto aprende.

Sempre achei que explicar é a melhor forma de descobrir o que a gente realmente entendeu. Quando escrevo, os buracos aparecem sozinhos: a frase trava, o exemplo não fecha, e fica claro que aquilo ali eu só tinha decorado. Então este artigo é meio egoísta — ele existe primeiro para me ensinar.

> Aviso honesto: onde eu não tenho certeza, eu digo que não tenho certeza.

#### O problema que o Flink resolve

Durante muito tempo o mundo de dados foi organizado em torno do lote. Você acumula dados durante o dia, roda um job à meia-noite, e de manhã o relatório está pronto. Isso funciona, e continua funcionando para muita coisa. O problema é quando a resposta precisa vir antes.

Detectar uma fraude de cartão dez horas depois da compra é o mesmo que não detectar. Um alerta de infraestrutura que chega no dia seguinte é um post-mortem, não um alerta. Nesses casos, você não quer perguntar aos dados de tempos em tempos, você quer que os dados respondam continuamente.

Essa é a inversão que o processamento de streams propõe:

- **Batch**: a consulta é permanente, os dados são finitos. Você roda a query contra um conjunto parado.
- **Streaming**: os dados são infinitos, a consulta é que fica parada. Ela é registrada uma vez e reage a cada evento que passa.

O Apache Flink é um motor distribuído para escrever esse segundo tipo de programa. E aqui vem a parte que mais me chamou atenção: no Flink, batch é tratado como um caso particular de streaming — um stream que, por acaso, tem fim. Não são dois motores diferentes colados no mesmo produto.

#### A arquitetura, em poucas peças

Levei um tempo para montar esse mapa mental, então vou deixá-lo explícito:

| Peça | O que faz |
|:--|:--|
| **JobManager** | O coordenador. Recebe o job, transforma o grafo lógico em grafo de execução, distribui as tarefas, dispara os checkpoints e coordena a recuperação de falhas. |
| **TaskManager** | O trabalhador. É um processo JVM que executa as tarefas de verdade e guarda o estado local. |
| **Task Slot** | A unidade de paralelismo dentro de um TaskManager. Um TaskManager com 4 slots consegue rodar 4 fatias de trabalho em paralelo. |
| **Client** | Quem empacota o job e submete ao JobManager. Depois disso, ele pode ir embora. |

Um job vira um **grafo de operadores**: fontes (`source`), transformações (`map`, `filter`, `keyBy`, `window`) e destinos (`sink`). O Flink pega esse grafo, decide quantas instâncias paralelas de cada operador criar e espalha tudo pelos slots disponíveis.

O `keyBy` merece atenção especial, porque é ele que faz o particionamento. Quando você diz `keyBy(evento -> evento.getUsuarioId())`, está garantindo que todos os eventos de um mesmo usuário vão sempre parar na mesma instância paralela do operador seguinte. É isso que torna possível manter estado por chave sem coordenação distribuída a cada evento — cada partição cuida do seu pedaço, sozinha.

#### Tempo: a parte que quebra a intuição

Essa foi a seção que mais me fez parar e reler. Em streaming existem, no mínimo, dois tempos diferentes:

- **Event time** — quando o evento aconteceu de verdade. Está gravado dentro do próprio evento.
- **Processing time** — quando o Flink viu o evento. É o relógio da máquina.

Parece detalhe, mas não é. O celular de alguém ficou sem sinal no metrô e sincronizou vinte minutos depois. Um broker teve um pico de latência. Uma partição do Kafka ficou atrasada em relação às outras. Em todos esses casos, os eventos chegam **fora de ordem** e **atrasados**.

Se você agrupar por processing time, o resultado depende de quando o job rodou. Reprocessar o mesmo dia amanhã dá um número diferente. Se você agrupar por event time, o resultado é o mesmo sempre, independente de quando o processamento aconteceu. Essa reprodutibilidade é o motivo de event time ser o padrão em quase todo pipeline sério.

Mas isso cria um problema novo: se os eventos chegam fora de ordem, como saber quando uma janela de tempo pode ser fechada? Nunca chega um evento dizendo "acabou, pode contar".

#### Watermarks

A resposta do Flink são as **watermarks**. Uma watermark é um marcador que viaja junto com o stream carregando uma afirmação:

> "Acredito que não vou mais receber eventos com timestamp anterior a T."

É uma aposta, não uma certeza. E é exatamente por ser uma aposta que ela é útil: ela transforma uma pergunta impossível ("já chegou tudo?") em uma decisão configurável ("quanto atraso eu tolero?").

```java
WatermarkStrategy
    .<Evento>forBoundedOutOfOrderness(Duration.ofSeconds(10))
    .withTimestampAssigner((evento, ts) -> evento.getTimestamp());
```

Esse código diz: tolere até 10 segundos de desordem. Se o maior timestamp já visto é `12:00:30`, a watermark vale `12:00:20`, e qualquer janela que termine antes disso pode ser fechada e emitida.

O trade-off aparece na hora:

- Watermark **agressiva** (pouco atraso tolerado) → resultado rápido, mais eventos perdidos por chegarem tarde.
- Watermark **conservadora** (muito atraso tolerado) → resultado correto, mas você espera mais para ver qualquer coisa.

Não existe valor certo. Existe o valor que combina com o seu negócio, e essa é uma decisão de produto disfarçada de configuração técnica.

Para os eventos que chegam depois da watermark, o Flink dá duas saídas: `allowedLateness`, que mantém a janela viva por mais um tempo e reemite o resultado corrigido, e o **side output**, que desvia os retardatários para um stream separado — bom para auditoria, ou simplesmente para descobrir que você configurou a watermark errado.

#### Janelas

Como o stream é infinito, agregações só fazem sentido dentro de recortes. Os tipos que estudei:

- **Tumbling** — janelas fixas que não se sobrepõem. "A cada 5 minutos, quantos pedidos?"
- **Sliding** — janelas fixas que se sobrepõem. "Nos últimos 10 minutos, atualizando a cada 1 minuto." Um mesmo evento cai em várias janelas.
- **Session** — janelas definidas por inatividade. "Agrupe a atividade de um usuário até ele ficar 30 minutos parado." O tamanho da janela é dado pelos dados, não por você.

```java
stream
    .keyBy(Evento::getUsuarioId)
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(new ContadorDeEventos());
```

Um detalhe que eu não tinha entendido de cara: prefira `reduce`/`aggregate` a `process` quando puder. O `process` recebe todos os eventos da janela de uma vez, o que significa guardar todos eles em estado até o fechamento. Já `aggregate` mantém apenas o acumulador. Em janelas grandes, essa diferença é a diferença entre um job estável e um job que morre de OOM.

#### Estado

Se eu tivesse que escolher uma única coisa que separa o Flink de um consumidor Kafka escrito à mão, seria o **estado gerenciado**.

Qualquer coisa interessante em streaming precisa de memória: contar, deduplicar, detectar padrões, juntar dois streams, comparar com o valor anterior. Manter isso em uma variável local funciona até o processo cair — e aí você perde tudo.

O Flink oferece estado como uma primitiva de primeira classe, com tipos como `ValueState`, `ListState` e `MapState`, sempre associados a uma chave depois do `keyBy`:

```java
public class DetectorDeAnomalia extends KeyedProcessFunction<String, Evento, Alerta> {

    private transient ValueState<Double> ultimoValor;

    @Override
    public void open(Configuration config) {
        ultimoValor = getRuntimeContext().getState(
            new ValueStateDescriptor<>("ultimo-valor", Double.class));
    }

    @Override
    public void processElement(Evento evento, Context ctx, Collector<Alerta> out)
            throws Exception {
        Double anterior = ultimoValor.value();
        if (anterior != null && evento.getValor() > anterior * 3) {
            out.collect(new Alerta(evento, anterior));
        }
        ultimoValor.update(evento.getValor());
    }
}
```

Esse estado é **particionado por chave** — cada usuário tem o seu próprio `ultimoValor`, e o operador só enxerga a chave do evento atual. Também dá para configurar TTL, o que evita o problema clássico de estado que só cresce até estourar o disco.

O backend padrão hoje é o RocksDB, que guarda o estado em disco local em vez de manter tudo em heap. Isso permite estado maior que a memória disponível, ao custo de serialização em cada acesso.

#### Checkpoints e savepoints

O estado só é confiável porque existe um mecanismo de tolerância a falhas por trás dele.

Periodicamente, o JobManager injeta **barreiras de checkpoint** nas fontes. Essas barreiras fluem pelo grafo junto com os dados; quando um operador recebe a barreira, ele persiste seu estado em armazenamento durável (S3, HDFS, o que for) e repassa a barreira adiante. Quando todos os operadores terminam, o checkpoint está completo.

O algoritmo é uma variação do **Chandy-Lamport** para snapshots distribuídos. Achei bonito descobrir que uma coisa tão prática está apoiada num paper de 1985.

Na falha, o Flink restaura o último checkpoint completo, reposiciona os offsets das fontes e retoma. Daí vem o famoso **exactly-once**, que eu entendi errado durante bastante tempo. Não significa que cada evento é processado uma única vez fisicamente — na recuperação, eventos são sim reprocessados. Significa que o **efeito sobre o estado** é como se cada evento tivesse sido processado uma vez só. É uma garantia sobre o resultado, não sobre a execução.

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
    usuario_id,
    TUMBLE_START(evento_time, INTERVAL '5' MINUTE) AS inicio,
    COUNT(*) AS total
FROM pedidos
GROUP BY
    usuario_id,
    TUMBLE(evento_time, INTERVAL '5' MINUTE);
```

O conceito que sustenta isso é a **dualidade stream/tabela**: um stream é o log de mudanças de uma tabela, e uma tabela é o estado acumulado de um stream. São a mesma informação vista de dois ângulos.

Para quem vem de dados, essa é a porta de entrada mais rápida — dá para chegar longe sem escrever uma linha de Java.

#### In praxi — "na prática"

Subir um cluster local é mais simples do que eu imaginava:

```bash
# um cluster mínimo com JobManager e TaskManager
docker run -d --name jobmanager -p 8081:8081 \
  flink:latest jobmanager

docker run -d --name taskmanager \
  --link jobmanager:jobmanager \
  -e JOB_MANAGER_RPC_ADDRESS=jobmanager \
  flink:latest taskmanager
```

A Web UI em `localhost:8081` foi onde eu mais aprendi. Ela mostra o grafo do job, o paralelismo real de cada operador, o histórico de checkpoints (duração e tamanho) e, principalmente, o **backpressure** — quando um operador não consegue acompanhar o ritmo do anterior e a pressão se propaga para trás até a fonte. Ver isso acontecendo em tempo real ensina mais do que qualquer diagrama.

Para SQL, o caminho mais curto é o cliente interativo:

```bash
docker exec -it jobmanager ./bin/sql-client.sh
```

E o Flink 2.x trouxe uma reorganização grande — remoção de APIs antigas já depreciadas e evolução do modelo de estado desagregado. Ainda não explorei isso a fundo o suficiente para escrever com segurança; fica anotado para uma próxima rodada.

#### O que eu ainda não sei

Lista honesta do que ficou em aberto:

- Ajuste fino de RocksDB e o comportamento do estado quando ele cresce muito além da memória.
- Estratégias de join entre streams, principalmente interval joins e temporal joins.
- CEP, a biblioteca de detecção de padrões complexos.
- Como isso tudo se comporta de verdade em produção sob carga irregular — a parte que nenhuma documentação ensina.

#### O que ficou

Terminei a semana com uma impressão que não esperava ter: a parte difícil de streaming não é distribuir o processamento. Isso o Flink resolve. A parte difícil é o **tempo** — aceitar que os dados chegam desordenados, que "completo" é uma aposta e não um fato, e que quase toda decisão técnica aqui é, no fundo, uma escolha entre latência e correção.

Escrever isto me forçou a admitir umas três ou quatro coisas que eu achava que sabia e não sabia. Valeu pelo esforço.

Próxima semana no cronograma: revisar o roadmap de Data Engineer. Continuo escrevendo enquanto aprendo.
