---
title: "Apache Flink: Learning in Public, Part 1"
slug: "apache-flink-learning-in-public-part-1"
date: '2026-08-30T12:00:00-03:00'
draft: false
description: "First part of a learning-in-public study of Apache Flink: concepts, architecture and the first experiments, with an index to navigate the whole path."
tags:
- apache-flink
- data-engineering
- learning-in-public
minute: 41
---

## Index

- [Index](#index)
- [Introduction](#introduction)
- [My goal](#my-goal)
- [The problem Flink solves](#the-problem-flink-solves)
- [Real use cases](#real-use-cases)
- [The architecture, in a few pieces](#the-architecture-in-a-few-pieces)
- [Sources and sinks](#sources-and-sinks)
- [Parallelism](#parallelism)
- [Redistribution and data skew](#redistribution-and-data-skew)
- [Operator chaining](#operator-chaining)
- [Rich functions](#rich-functions)
- [Time: the part that breaks intuition](#time-the-part-that-breaks-intuition)
- [Watermarks](#watermarks)
- [Windows](#windows)
- [ProcessFunction](#processfunction)
- [State](#state)
- [Checkpoints and savepoints](#checkpoints-and-savepoints)
- [Flink SQL](#flink-sql)
- [In praxi ("in practice")](#in-praxi-in-practice)
- [Deployment](#deployment)
  - [Execution modes](#execution-modes)
  - [Kubernetes](#kubernetes)
  - [Memory](#memory)
  - [CPU and slots](#cpu-and-slots)
  - [Local disk](#local-disk)
  - [S3 and the remote file system](#s3-and-the-remote-file-system)
- [The ecosystem around it](#the-ecosystem-around-it)
- [Complexities](#complexities)
- [What stayed with me](#what-stayed-with-me)

## Introduction

This text is the result of what I studied and experimented with over this week. It is not a tutorial by someone who has mastered Apache Flink, nor does it intend to be a reference on the subject. It is more like the notebook of someone who is learning, testing a few things in practice and sharing what they managed to understand and discover so far.

I have always believed that explaining is the best way to find out what we really understood. When I write, the holes show up on their own..

Apache Flink is interesting mainly because it treated **streaming** as the general case, and not as a patch on top of batch processing. While its competitors at the time simulated continuous flow with micro-batches, Flink processes record by record, with low latency and high throughput, keeping distributed state consistent through asynchronous snapshots (a variation of the *Chandy-Lamport* algorithm) that guarantee exactly-once semantics even after failures. It also offers a notion of event time with *watermarks*, which allows it to correctly handle data that arrives out of order or late, something essential in the real world. Its origin is academic: it was born in 2010 as Stratosphere, a research project at TU Berlin in partnership with Humboldt University and the Hasso Plattner Institute, led by Volker Markl. In 2014 the code was donated to the Apache Software Foundation, renamed Flink ("nimble" in German, hence the squirrel in the logo) and promoted to a top-level project in December of that same year. The creators founded [data Artisans](https://github.com/dataArtisans) to commercialize it, a company bought by Alibaba in 2019 and renamed Ververica. Alibaba itself already maintained an internal fork (Blink) to handle the volume of Singles' Day, and a good part of those improvements went back into the main project, helping consolidate Flink as the de facto standard for stream processing at companies like Netflix, Uber and Stripe.

## My goal

My goal is to use Apache Flink connected to Kafka to process OpenTelemetry OTLP data (traces, metrics and logs) and extract more intelligence from that telemetry in real time, instead of just storing it and querying it later. The idea is to use this pipeline as a lab to test cases such as anomaly detection in time series of metrics and latencies, alert generation with context and noise suppression, root cause analysis (RCA) correlating spans, logs and metrics of affected services, prediction of degradation and resource saturation before the incident happens, and detection of sensitive data improperly flowing through span attributes and log messages. Beyond that, I want to explore other scenarios where Flink fits well: enrichment and smart sampling of traces, deciding with state which traces to keep based on what happened in the entire request (tail-based sampling) instead of discarding randomly at the edge; continuous calculation of SLIs and error budgets per service, with sliding windows and aggregations by endpoint, team and deploy version; and detection of behavior changes after releases, comparing the traffic, error and latency profile between versions to identify regressions introduced by a specific deploy. I intend to detail all of this soon (:

## The problem Flink solves

For a long time the data world was organized around the *batch*. You accumulate data during the day, run a job at midnight, and in the morning the report is ready. That works, and keeps working for a lot of things. The problem is when the answer needs to come earlier. Detecting a card fraud ten hours after the purchase is the same as not detecting it. An infrastructure alert that arrives the next day is a post-mortem, not an alert. In those cases, you do not want to ask the data from time to time, you want the data to answer continuously. That is the inversion that stream processing proposes:

- **Batch**: the query is permanent, the data is finite. You run the query against a set that is standing still.
- **Streaming**: the data is infinite, the query is what stands still. It is registered once and reacts to every event that passes.

Apache Flink is a distributed processing engine aimed at building that second kind of application. Its founding premise: everything is a stream. Yesterday's CSV file is a stream that has a beginning and an end (*bounded*). The Kafka topic with clicks from your site is a stream that never ends (*unbounded*). One of the points that caught my attention most during the study was the unified processing model: in Flink, batch can be understood as a particular case of streaming, in which the data flow has a defined beginning and end. This means the execution model does not depend on two completely distinct engines, but on a single architecture capable of processing both continuous flows and finite datasets.

## Real use cases

It is worth looking at where this shows up in practice, because the list helps understand what kind of problem Flink solves well:

- Fraud detection, in banks and fintechs. Every transaction is evaluated in milliseconds against the customer's history, kept as state per key (`keyBy` on the customer id). Rules like "3 purchases in different cities within 10 minutes" are expressed with windows, timers and the complex event pattern detection library (CEP).
- CDC pipelines to a data lake. Flink CDC follows the database transaction log (the binlog in MySQL, the WAL via logical replication in Postgres) and replicates every insert, update and delete in real time to table formats like Apache Iceberg, Paimon or Hudi. Stripe is one of the public cases of change capture at scale with Flink.
- Real-time analytics and dashboards. Windowed aggregations (orders per minute, revenue per region) feeding live dashboards. Uber, Netflix and Alibaba operate thousands of Flink jobs with this profile.
- Event-driven applications. Here the business logic lives inside the stream, and not in a service that queries a database: ride matching, dynamic pricing, alerting engines, feature store updates for machine learning models.
- AI over streams. Model inference applied to events as they pass, and Flink Agents, a new subproject aimed at AI agents that react to events in real time.

## The architecture, in a few pieces

| Piece | What it does |
|:--|:--|
| **JobManager** | The coordinator. Receives the job, turns the logical graph into an execution graph, distributes the tasks, triggers checkpoints and coordinates failure recovery. |
| **TaskManager** | The worker. It is a JVM process that actually executes the tasks and holds local state. |
| **Task Slot** | The unit of parallelism inside a TaskManager. A TaskManager with 4 slots can run 4 slices of work in parallel. |
| **Client** | Whoever packages the job and submits it to the JobManager. After that, it can go away. |

A job is represented as an **operator graph**, composed of sources (`source`), transformations (`map`, `filter`, `keyBy`, `window`) and sinks (`sink`). From that graph, Flink determines the parallelism of each operator and distributes its instances among the slots available in the cluster.

`keyBy` deserves special attention because it is responsible for partitioning the data. When you define `keyBy(event -> event.getUserId())`, you are determining that events with the same key are routed to the same parallel instance of the next operator. This partitioning is fundamental for keyed stateful processing, because it allows each instance to keep and manage the state associated with the keys under its responsibility, without the need for distributed coordination on every event.

## Sources and sinks

Source and sink are the two points where the job touches the world. In the 2.x line they go through a single API, `env.fromSource(...)` on one side and `stream.sinkTo(...)` on the other.

The three sources that appear in almost every project:

| Source | What it is for | What it keeps in state |
|:--|:--|:--|
| **KafkaSource** | The common case. Reads one or more topics, with a consumer group. | The offset of each partition |
| **Flink CDC** | Reads a database transaction log and turns every row change into an event. | The position in the binlog or in the WAL |
| **FileSource** | Reads files from a bucket or from HDFS, in batch or watching the directory. | Which files and which stretch of each one has already been read |

And the three sinks:

| Sink | What it is for | Guarantee it offers |
|:--|:--|:--|
| **KafkaSink** | Publishes the result to another topic, for the next job or for whoever consumes it. | Exactly-once, via Kafka transactions |
| **JdbcSink** | Writes to Postgres, MySQL and the like, typically the aggregated result. | Idempotence, when there is a primary key |
| **FileSink** | Writes partitioned Parquet or JSON to object storage. | Exactly-once, committing the files at the checkpoint |

The shape of the code is always the same, a builder on one side and another on the other:

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

Two things in this code are not syntax details. The first is that the source does not commit offsets on its own: the **offset is Flink state**, it goes into the checkpoint together with everything else and comes back with it on recovery. That is why you do not manage offsets by hand here, and it is also why Kafka's consumer lag dashboard may disagree with the job's reality, since the commit to Kafka is only informational.

The second is that exactly-once at the sink is a property of the sink, not of Flink. `KafkaSink` only achieves it because it writes inside a transaction that is committed when the checkpoint closes, and that is why it requires a `transactionalIdPrefix` that is stable across restarts. `FileSink` works by the same logic: the files keep an "in progress" suffix until the checkpoint commits, which tends to scare anyone looking at the bucket midway and thinking nothing is being written. `JdbcSink`, on the other hand, has no distributed transaction, so the guarantee it offers depends on you writing with a primary key and letting repetition be harmless.

It is worth insisting on the versioning part, because it bites. Except for the file system connectors and `datagen`, which ship inside the distribution, every connector is a separate project, with its own repository, its own release and numbering that has no relation whatsoever to Flink's. `flink-connector-kafka` is at 5.0.0 while Flink is at 2.3. The two numbers do not talk to each other, and there is no "the connector version that matches mine" by deduction.

What exists is a compatibility matrix, published on the downloads page, and checking that matrix is a mandatory step before choosing the Flink version for a new project. The reason is that the migration to the 2.x line was not simultaneous, and a good part of the ecosystem was left behind. A few examples of how this looked when I wrote this:

| Connector | Version | Compatible Flink |
|:--|:--|:--|
| Kafka | 5.0.0 | 2.1.x and 2.2.x |
| JDBC | 4.1.0 | 2.1.x and 2.2.x |
| Elasticsearch | 4.0.0 | 2.0.x |
| Prometheus | 1.0.0 | 1.19.x and 1.20.x |

The Prometheus connector is the most eloquent case, and one that interests me closely, because it is the natural output for metrics derived from telemetry. It exists, it is official, and it writes through Prometheus's remote write API. It is sink only, there is no corresponding source, which makes sense: Prometheus is where the time series ends, not where it comes from. Except that 1.0.0 is still from the Flink 1.x line and has not crossed over to 2.x. Anyone who wants that sink today chooses between staying on 1.20, which is LTS, or writing the integration by hand.

And notice that not even Kafka lists 2.3 in the table above. A one-release lag between the core and the connectors is the normal state of things, not an exception. If your pipeline depends on a specific connector, it is the connector that decides which Flink version you can run, and not the other way around.

## Parallelism

Parallelism is the number of instances of each operator running at the same time. A job with parallelism 8 has eight copies of the source, eight of the map and eight of the sink, each processing a slice of the data and occupying a slot. Each of those copies is a subtask, which is why the web interface shows repeated metrics with indices from 0 to 7.

It can be set at three levels, from the broadest to the most specific. For the whole job, with `env.setParallelism(8)` in the code or `parallelism.default` in `config.yaml`. At deploy time, through the `parallelism` field of the `FlinkDeployment`, which is what appears in the manifest further down. And operator by operator, chaining `.setParallelism(2)` onto the call, which overrides the previous ones. The typical case for the override is a sink that talks to a database that cannot handle eighty simultaneous connections: the rest of the job stays wide and only the write is throttled on purpose.

For the initial value, a reasonable starting point is matching the parallelism to the number of partitions of the input Kafka topic. The reason not to go above that is specific and worth understanding, because the symptom is confusing: the leftover source subtasks receive no partition, sit idle and never emit a watermark. Since an operator's watermark is the minimum across all its inputs, a stalled source holds back the clock of the whole job, and the result is a window that never closes and a job that looks stuck without a single error in the log. It can be worked around by declaring `withIdleness()` in the watermark strategy, which tells Flink to ignore the silent inputs, BUT IT IS SIMPLER NOT TO CREATE THE PROBLEM. Staying below the number of partitions also has a cost, a smaller one: you leave topic throughput on the table, because one subtask ends up reading more than one partition.

After that, tuning is by measurement, not by arithmetic. The two numbers that matter in the web interface are *backpressure*, which shows which operator is holding back the flow, and *busy time*, which shows the fraction of time each subtask was actually working instead of waiting. Raising the parallelism of an operator that spends the day idle improves nothing. I say more about this sizing in the CPU and slots section.

One piece is missing for rescaling to make sense, and it is internal: Flink does not distribute key by key. It runs each key through a hash and places it into a **key group**, and what gets distributed among the subtasks are the key groups, in contiguous ranges. The key group is the unit of state movement, that is, when you change the parallelism, what migrates from one machine to another are whole groups, never individual keys. You almost never touch this directly, but the term shows up in logs and in any conversation about rescaling.

The number of key groups that exist is exactly the `maxParallelism`. From there come the two properties that matter. It is the absolute ceiling of parallelism, because you cannot have more subtasks than groups to distribute among them. And it cannot change afterwards, because changing the number of groups changes which group each key belongs to, which invalidates all the state already saved.

The trap is in the default value. Without configuration, Flink computes that number from the initial parallelism: something around one and a half times it, rounded up, with a floor of 128 and a ceiling of 32768. A job that starts with parallelism 8 gets 128 and nobody notices, because nothing breaks. The problem arrives on the day that job needs parallelism 200, and the only way out is rebuilding the state from scratch.

Setting it by hand from the first run solves it, and `env.setMaxParallelism(1024)` is a comfortable value. What does not work is putting 32768 as a precaution: some state backends keep internal structures that grow with the number of key groups, so overdoing it costs performance. An extra care that comes for free is choosing a value divisible by the intended parallelism, because then the groups spread evenly. With 128 groups and parallelism 12, some subtasks get 11 and others 10, a small but avoidable asymmetry.

## Redistribution and data skew

Between two operators there is always a decision about which next subtask each event goes to. Most of the time it is made by Flink without you asking, but you can choose, and the options are few:

| Strategy | What it does | When it appears |
|:--|:--|:--|
| `forward` | The event stays in the same subtask. Nothing crosses the network | Between adjacent operators of the same parallelism. It is what allows chaining |
| `hash` | Routes by key, always the same key to the same subtask | Every `keyBy`, that is, whenever there is keyed state |
| `rebalance` | Round-robin across all following subtasks | To rebalance after a source that arrives unbalanced |
| `rescale` | Round-robin, but only among neighboring subtasks, preserving locality | Same goal as `rebalance`, avoiding traffic between machines |
| `broadcast` | Every event goes to all following subtasks | Distributing rules or configuration to all instances |

`broadcast` deserves a note because it is the basis of an entire pattern: a small stream of rules is broadcast to all subtasks, which keep it in state, while the big stream of events passes partitioned by key. That is how you change a job's logic without a redeploy.

It is also worth remembering that `rebalance` and `rescale` gained adaptive distribution in 2.3, looking at the real load of the destination instead of doing blind round-robin, and it is an option that needs to be switched on, as I describe in the post about Flink 2.3.

None of this solves the problem that hurts the most, which is **data skew**. Skew is when the distribution of keys is uneven: one customer who alone accounts for half the transactions, a product that went viral, a giant tenant in the middle of a thousand small ones. Since `keyBy` guarantees that the same key always goes to the same subtask, that subtask becomes the bottleneck, the others sit idle, and the whole job moves at the speed of the slowest one. Increasing parallelism does not help at all, because the heavy key keeps going to a single place.

The diagnosis is straightforward in the web interface, and that is why busy time matters so much: skew shows up as backpressure concentrated in one subtask and as one instance at 100% occupancy while its neighbors sit at 10%. If all of them were at 90%, the problem would be capacity, and the answer would be different.

There are three ways out, in order of effort. The first, and the most used, is aggregating in two phases: you append a random suffix to the key, something like `customer-42#0` through `customer-42#9`, aggregate partially over that inflated key, and only then aggregate again over the real key. The heavy work gets split across ten subtasks, and the second stage receives only ten partial results per key instead of millions of events. The second, when you are in SQL, is letting the engine do it: enabling mini-batch and the two-phase aggregation optimization solves the common case without rewriting a single query, and there is even a specific option to split `DISTINCT` aggregations, which is the automatic version of the same trick. The third is accepting that the whale key is a case apart and handling it outside the normal flow, with a dedicated pipeline (a classic).

## Operator chaining

The graph you write is not exactly the graph that runs. Before executing, Flink merges adjacent operators into a single task, and that is called *operator chaining*. A sequence like `map`, `filter` and `flatMap` becomes a single thing, executed in the same thread.

The merge only happens under three conditions: the link between the operators needs to be `forward`, they need to have the same parallelism and they need to be in the same slot sharing group. A `keyBy` or a `rebalance` breaks the chain, because in those cases the record really does need to leave one instance and go to another.

The gain is bigger than it looks at first glance. Inside a chain, passing a record from one operator to the next is a method call, and the object stays the same in memory. Between two tasks, the record is serialized, goes into a network buffer and is deserialized on the other side, and that happens even when both are inside the same TaskManager. Chaining eliminates that whole cost.

It is also the explanation for a common confusion in the web interface: the boxes in the graph do not correspond to your operators, they correspond to the chains. You write six operators and see two boxes, each listing inside it the names it absorbed.

The trap appears when investigating a problem. Metrics and backpressure are measured per task, not per operator, so an entire chain reports a single number, and you cannot tell which of the merged operators is holding back the flow. To find out, you can break the chain on purpose: `.disableChaining()` isolates an operator on both sides, and `.startNewChain()` starts a new chain from it. This is a diagnostic tool, not a setting to leave on. The serialization cost you reintroduced is real, so it is worth reverting after measuring.

## Rich functions

Every function interface has a "rich" version: `MapFunction` has `RichMapFunction`, `FilterFunction` has `RichFilterFunction`, and so on. The difference is that the rich version adds a lifecycle and context, and that is what separates a function that merely transforms a record from a function that needs external resources or memory.

`open()` is called once per parallel instance, before the first event arrives. It is the place to open a connection to a database, load an enrichment cache, compile a regular expression and, above all, register the state descriptors. Note the "per parallel instance": with parallelism 8 it runs eight times, once in each subtask, and what it creates is not shared among them. `close()` is its counterpart, called on shutdown, and serves to return what was opened.

`getRuntimeContext()` is the entry point to what the runtime knows. Through it you reach keyed state, the custom metrics you want to expose, the index of the current subtask and the operator's parallelism.

If this sounds familiar when you get to the state section, it is because the example there already uses both: `AnomalyDetector` overrides `open()` and calls `getRuntimeContext().getState(...)` to create the `ValueState`. It does not have "Rich" in its name, but `KeyedProcessFunction` extends `AbstractRichFunction` and inherits the same lifecycle. Process functions come rich out of the box.

A version note that saves time: up to 1.x the signature was `open(Configuration parameters)`. In 2.x it was removed, and the method now receives an `OpenContext`. An example copied from an old tutorial does not compile because of this.

## Time: the part that breaks intuition

This was the section that most made me stop and reread. In streaming there are, at a minimum, two different times:

- **Event time:** when the event actually happened. It is recorded inside the event itself.
- **Processing time:** when Flink saw the event. It is the machine's clock.

It seems like a detail, but it is not. Someone's phone lost signal in the subway and synced twenty minutes later. A broker had a latency spike. One Kafka partition fell behind the others. In all those cases, events arrive **out of order** and **late**.

If you group by processing time, the result depends on when the job ran. Reprocessing the same day tomorrow gives a different number. If you group by event time, the result is always the same, regardless of when the processing happened. That reproducibility is the reason event time is the default in almost every serious pipeline.

But that creates a new problem: if events arrive out of order, how do you know when a time window can be closed? No event ever arrives saying "that's all, you can count now".

## Watermarks

Flink's answer is **watermarks**. A watermark is a marker that travels along with the stream carrying a claim:

> "I believe I will no longer receive events with a timestamp earlier than T."

It is a bet, not a certainty. And it is precisely because it is a bet that it is useful: it turns an impossible question ("has everything arrived?") into a configurable decision ("how much delay do I tolerate?").

```java
WatermarkStrategy
    .<Event>forBoundedOutOfOrderness(Duration.ofSeconds(10))
    .withTimestampAssigner((event, ts) -> event.getTimestamp());
```

This code says: tolerate up to 10 seconds of disorder. If the largest timestamp seen so far is `12:00:30`, the watermark is `12:00:20`, and any window ending before that can be closed and emitted.

The trade-off shows up immediately:

- **Aggressive** watermark (little delay tolerated) → fast result, more events lost for arriving late.
- **Conservative** watermark (a lot of delay tolerated) → correct result, but you wait longer to see anything.

There is no right value. There is the value that matches your business, and that is a product decision disguised as a technical setting.

For events that arrive after the watermark has advanced, Flink offers specific mechanisms for handling late data. `allowedLateness` keeps the window open for an additional period, allowing late events to be processed and already-produced results to be updated. Another alternative is to use a **side output**, routing the events that exceeded the lateness limit to a separate stream. That mechanism can be useful for auditing, data quality metrics or for identifying problems in the watermark strategy configuration.

## Windows

Since the stream is infinite, aggregations only make sense within slices.

- **Tumbling:** fixed windows that do not overlap. "Every 5 minutes, how many orders?"
- **Sliding:** fixed windows that do overlap. "In the last 10 minutes, updating every 1 minute." The same event falls into several windows.
- **Session:** windows defined by inactivity. "Group a user's activity until they stay idle for 30 minutes." The window size is given by the data, not by you.

```java
stream
    .keyBy(Event::getUserId)
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(new EventCounter());
```

A detail I had not understood right away: prefer `reduce`/`aggregate` over `process` whenever you can. `process` receives all the events of the window at once, which means keeping all of them in state until it closes. `aggregate` keeps only the accumulator. In large windows, that difference is the difference between a stable job and a job that dies of OOM.

## ProcessFunction

The ready-made operators cover a lot, but they impose a shape. `map` turns one event into another, `window` groups by a time slice, `aggregate` accumulates. When the logic does not fit any of those molds, the path is to go down a level and write a `ProcessFunction`, which is the lowest-level and most powerful operator in the DataStream API. It is Flink's Swiss army knife, and it is no exaggeration to say that almost all truly complicated business logic ends up inside one.

What it gives you, on every event, are three things the ready-made operators do not give together: direct access to the key's state, the ability to register timers and the ability to emit to side outputs. All three arrive through the same place, that `ctx` parameter in the `processElement` signature.

The timer is the part that changes what can be built, because it is what allows reacting to the passage of time, and not only to the arrival of an event. You register a future instant and Flink calls your `onTimer` when it arrives:

```java
@Override
public void processElement(Event event, Context ctx, Collector<Alert> out) {
    ctx.timerService().registerEventTimeTimer(event.getTimestamp() + 600_000);
}

@Override
public void onTimer(long timestamp, OnTimerContext ctx, Collector<Alert> out) {
    // ten minutes of event time have passed since that event
}
```

Two properties of this mechanism matter. The first is that an event time timer does not fire when the machine's clock gets there, but when the watermark passes that instant, which ties timers to the same notion of time as windows: if the watermark does not advance, the timer does not fire, and we are back to the idle source problem I described earlier. The second is that timers are state, they belong to a key and go into the checkpoint. A job that restarts does not lose its pending timers, and that is what makes it viable to write "if nothing happens in the next thirty minutes, alert" and trust the sentence.

The side output is the second door. It already appeared here as the destination for late events, but it serves any fork: records that failed validation, events that triggered a rule, samples for auditing. You declare an `OutputTag`, call `ctx.output(tag, value)` and retrieve that flow later with `getSideOutput(tag)`. The advantage over a duplicated `filter` is that the event is examined only once, and the advantage over throwing an exception is that the job does not die because of a malformed record.

There are a few variants, and choosing the wrong one is a common mistake. `KeyedProcessFunction` is the one that comes after a `keyBy` and the only one with keyed state and timers. The plain `ProcessFunction` works over a non-partitioned stream and has neither. `CoProcessFunction` receives two streams and is the path to join a flow of events with a flow of rules or reference data. And `ProcessWindowFunction` is the one that runs when a window closes, with all of its events in hand.

The price of going down to that level is that Flink stops taking care of things for you. A window knows when to end and throws away what it accumulated; a state you created inside a `ProcessFunction` stays there forever, for every key that ever appeared, until you explicitly delete it or configure TTL. It is the same freedom and the same risk of any low-level abstraction, and it is the reason the recommendation remains to use the ready-made operator whenever it fits.

## State

I started studying Flink by writing, before it, my own Kafka consumer. The idea was to answer a single question: *what does a distributed processing framework solve beyond reading events from a topic?*

The answer came quickly, and it is a list. State management, parallelism, partitioning, fault tolerance, recovery after a crash, event time, watermarks, coordination between processing stages. In the manual consumer, every one of those items becomes your code. In Flink, almost all of them are part of the runtime, and what is left for the application is the processing logic.

Any more interesting stream processing needs to keep some kind of memory, whether to count events, deduplicate, detect patterns, correlate data or compare previous values. In a traditional consumer, that responsibility ends up much closer to the application. In Flink, **state is managed by the runtime and can be distributed, partitioned by key, stored persistently and recovered after a failure through the checkpoint and recovery mechanisms**. That changes quite a lot how you build a streaming application, especially when we start thinking about scale, failures and continuous processing.

Flink offers state as a first-class primitive, with types like `ValueState`, `ListState` and `MapState`, always associated with a key after the `keyBy`.

`What the hell is a first-class primitive??`

It comes from programming language theory. Something is first-class when the system treats it as a full citizen, with all rights, instead of an appendix you have to manage from the outside.. it means you do not need a database. Here is the part that really matters. The obvious alternative would be to keep that accumulation in an external Redis or Postgres. Flink does it differently: the state lives inside the operator itself, in the TaskManager process, managed by the framework. That brings three consequences.

First, it is local. Reading state is a memory access or an access to a RocksDB on the machine's local disk, not a network call. That is the difference between microseconds and milliseconds per event, and the reason Flink can process millions of events per second with logic that depends on history.

Second, it goes into checkpoints. Periodically Flink takes a consistent snapshot of all the state of all operators and writes it to durable storage (S3, HDFS). If a TaskManager dies, the job restarts from the last checkpoint with the state exactly as it was, and the Kafka offsets come back with it. That is what sustains the exactly-once semantics we mentioned earlier. With an external Redis, you would have to solve that consistency between "what I have already consumed from Kafka" and "what I have already written to Redis" by hand, and it is notoriously hard.

Third, it is resizable. When you increase the job's parallelism, Flink redistributes the state among the new instances automatically, from a savepoint.

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

That state is **partitioned by key**: each user has their own `lastValue`, and the operator only sees the key of the current event. You can also configure TTL, which avoids the classic problem of state that only grows until it blows up the disk.

Where that state is kept is a choice, and there are three options in the 2.x line:

| Backend | Where the state lives | For | Against |
|:--|:--|:--|:--|
| **HashMapStateBackend** | JVM heap, as Java objects | The fastest, because it serializes nothing on each access | Limited by memory and subject to GC pauses. No incremental checkpoints |
| **EmbeddedRocksDBStateBackend** | Local disk, in an embedded LSM tree | Scales up to the size of the disk and does incremental checkpoints | Serializes on every read and write, and wants a fast disk |
| **ForStStateBackend** | Remote storage, with a local cache | Near-immediate rescale and recovery, lightweight TaskManager | New and still experimental. Network latency is compensated by asynchronous access |

The default, if you configure nothing, is `HashMapStateBackend`. That tends to surprise people who read that "Flink uses RocksDB", and the switch is one line in `state.backend.type`, which accepts `hashmap`, `rocksdb` or `forst`.

The rule of thumb I took from this has three cases. State of a few gigabytes with critical latency calls for HashMap, because the absence of serialization is exactly what you are buying. Large state, from tens of gigabytes to terabytes, calls for RocksDB with incremental checkpoints, and it is worth noting that it is the only one of the two classics that offers this: with HashMap, every checkpoint copies the entire state. And huge state in the cloud, with aggressive autoscaling, is the case for evaluating ForSt, which is the bet of the 2.x series and which I write more about at the end.

## Checkpoints and savepoints

State is only reliable because there is a fault tolerance mechanism behind it.

Periodically, the JobManager injects **checkpoint barriers** into the sources. Those barriers flow through the graph together with the data; when an operator receives the barrier, it persists its state to durable storage (S3, HDFS, whatever) and passes the barrier along. When all operators finish, the checkpoint is complete.

The algorithm is a variation of **Chandy-Lamport** for distributed snapshots. I found it beautiful to discover that something so practical rests on a paper from 1985.

On failure, Flink restores the last complete checkpoint, repositions the source offsets and resumes. From that comes the famous **exactly-once**, which I misunderstood for quite a while. It does not mean every event is physically processed a single time. On recovery, events are indeed reprocessed. It means the **effect on the state** is as if each event had been processed only once. It is a guarantee about the result, not about the execution.

Extending that guarantee all the way to the sink is another matter, and depends on the destination supporting transactional or idempotent writes (Kafka with transactions, for example).

The difference between checkpoint and savepoint also took a while to settle:

| | Checkpoint | Savepoint |
|:--|:--|:--|
| Who triggers it | Flink, automatically | You, manually |
| Purpose | Failure recovery | Upgrade, migration, forking the job |
| Lifecycle | Managed by Flink | Yours forever |

A savepoint is what allows you to stop a job, bring up a new version of the code and continue exactly where it left off, with the state intact. In practice, that is what makes a streaming job something you can operate for years.

## Flink SQL

Not everything needs Java. Flink exposes a Table API and SQL over the same engine, and the same query runs both over finite data and over an infinite stream:

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

The concept underpinning this is the **stream/table duality**: a stream is the changelog of a table, and a table is the accumulated state of a stream. They are the same information seen from two angles.

This stops being abstract as soon as you run a `GROUP BY` in the SQL client and look at the `op` column:

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

`a` comes in with 1, is retracted (`-U`) and re-emitted with 2 (`+U`). It is not a table being filled in bit by bit, it is its changelog passing on the screen. The result of a streaming query is not a final value, it is a sequence of corrections over the previous value.

There are four row kinds in total: `+I` for insertion, `-U` and `+U` for the before and after of an update, and `-D` for deletion. And it is the combination of kinds a query produces that defines what type of stream you are dealing with, which in practice decides where it can be written:

| Mode | What comes out of the query | Example | Where it writes |
|:--|:--|:--|:--|
| **Append-only** | Only `+I`. Nothing already emitted changes. | A raw click stream, a `SELECT` with a filter. | Any sink. |
| **Retract** | `+I`, and each correction becomes the pair `-U` followed by `+U`. | A continuous `GROUP BY`, without a window, revising the total on every event. | A sink that understands retraction. |
| **Upsert** | One row per key, meaning "this is the current version". | The same `GROUP BY`, when the sink declares a primary key. | A sink with a primary key. |

The difference between retract and upsert is subtle and matters when choosing the destination. In retract mode, Flink emits two rows for each correction, and the receiver needs to know how to subtract the old one before adding the new one. In upsert mode, it emits only the new row, and the receiver overwrites what it had for that key. The second is cheaper and is what relational databases and search indexes expect, but it is only possible when there is a key that identifies the row.

That leads to the classic trap, which can be predicted before falling into it. You write a continuous `GROUP BY` and point the result at an ordinary Kafka topic. The standard Kafka connector is append-only, and the result of your query is a flow of corrections, not of insertions. The job does not even start: the planner rejects the query with a message like "table sink doesn't support consuming update changes which is produced by node GroupAggregate". Failing at planning time is good news, because the silent way of getting this wrong would be writing the retractions as if they were normal events and having a consumer downstream adding everything up twice.

There are three ways out, and the choice says more about the problem than about Flink. The first is using a sink that accepts updates, like `upsert-kafka` or JDBC with a declared primary key. The second is making the result stop changing, by grouping by window instead of grouping continuously: when the window closes, the value is final and becomes a single insertion. The third, available from 2.3 onwards, is explicitly converting between the forms with `FROM_CHANGELOG` and `TO_CHANGELOG`, which is what I describe in the post about Flink 2.3.

For people coming from data, this is the fastest entry point, you can get far without writing a line of Java.

## In praxi ("in practice")

Bringing up a local cluster is simpler than I imagined. I started with two loose `docker run` commands, but switched to a `docker-compose.yml` as soon as I wanted more than one TaskManager:

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

One `docker compose up -d` and the Web UI answers at `localhost:8081`.

Three choices there are not details. Two TaskManager replicas with two slots each give four slots, and that is what makes parallelism stop being always 1: without spare slots, every job graph shows up in the UI as a straight line. The `healthcheck` combined with `depends_on: service_healthy` exists because, without it, the TaskManager starts before the JobManager is up, fails to register and fills the log with errors before working on the second try. And the memory limits are explicit because Flink's default is generous: with these values the whole cluster stays around 4.5 GB and fits on any machine.

Before submitting anything, the REST API tells you whether the cluster is whole more directly than the UI:

```bash
curl -s localhost:8081/overview
```

```json
{"taskmanagers": 2, "slots-total": 4, "slots-available": 4, "flink-version": "2.3.0"}
```

The two registered TaskManagers and the four free slots are the confirmation that the cluster formed. The image still ships example jobs, so you can see a running graph without writing a line:

```bash
docker exec jobmanager ./bin/flink run -d \
  /opt/flink/examples/streaming/TopSpeedWindowing.jar
```

With it running, `slots-available` drops to 3 and the UI finally has something to show.

The Web UI was where I learned the most. It shows the job graph, the real parallelism of each operator, the checkpoint history (duration and size) and, above all, **backpressure**: when an operator cannot keep up with the pace of the previous one and the pressure propagates backwards all the way to the source. Watching that happen in real time teaches more than any diagram.

For SQL, the shortest path is the interactive client:

```bash
docker exec -it jobmanager ./bin/sql-client.sh
```

## Deployment

The `docker-compose.yml` above is a lab. It brings up a cluster, but hides almost all the decisions that appear when the job needs to run for months without anyone watching. This was the part that most forced me to read the manual, because here no intuition saves you: it is arithmetic, it is container limits and it is choosing where the state will end up.

### Execution modes

Before choosing where to run, you need to choose how. Flink has two living modes today, and the difference between them is the cluster's lifecycle.

In **session mode**, the cluster comes up first and stays up waiting. You submit several jobs to the same JobManager, and all of them compete for the same TaskManagers. It is what my compose does, and it is the right mode for exploration, for the SQL client and for short jobs that do not justify the cost of bringing up a new cluster. The price is the absence of isolation: a job that blows up memory takes down the TaskManager, and with it go the tasks of all the other jobs that had slots in that process.

In **application mode**, each application gets its own dedicated cluster, which is born with it and dies with it. The most important difference is subtle and lies in `main()`: instead of running on the machine of whoever submits, it runs inside the JobManager. That takes away from the client the responsibility of downloading dependencies and assembling the job graph, and it is what makes the mode suitable for automation, because there is no longer an external client process that needs to stay alive. For production, it is the default answer.

There was also a third mode, per-job, which also gave one cluster per job but kept `main()` on the client. It was discontinued and is no longer part of the 2.x line. If you find `-t yarn-per-job` in some tutorial, it is material from an earlier version.

Orthogonal to this is the resource manager: standalone (you bring up the processes yourself, which is the Docker Compose case), Kubernetes or YARN. The combination I see recommended most often today is application mode on Kubernetes.

### Kubernetes

On Kubernetes there are three paths, and it is worth understanding the difference because they solve distinct problems.

The first is **standalone on Kubernetes**: you write two `Deployment`s, one for the JobManager and another for the TaskManager, a `Service` and a `ConfigMap` with the `flink-conf.yaml`. Flink does not know it is on Kubernetes, it only sees processes that register. It works, and it is transparent, but scaling is on you: changing parallelism means changing replicas by hand, and upgrading with a savepoint is a sequence of commands someone needs to remember to run in the right order.

The second is **native Kubernetes**, in which the JobManager itself talks to the Kubernetes API and creates the TaskManager pods needed to satisfy the requested parallelism. You submit with `flink run-application -t kubernetes-application` and write no TaskManager manifest at all. The cluster sizes itself according to the job, and not the other way around.

The third, and the one I would use, is the **Flink Kubernetes Operator**. It installs CRDs and turns the job into a declarative cluster object:

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

What this manifest buys is operations. `upgradeMode: savepoint` means that, when I change the image tag and apply again, the operator triggers a savepoint, stops the job, brings up the new version and restores the state from it, without anyone needing to run `flink stop --savepointPath` by hand at three in the morning. It also takes care of rollback when the new job does not stabilize, and brings an autoscaler that watches the real backpressure of the operators and adjusts the parallelism, which is quite different from an HPA looking at the pod's CPU usage.

Two details that are not optional. The first is the `serviceAccount`: the JobManager needs RBAC permission to create pods and to read and write ConfigMaps, because it is in a ConfigMap that native high availability keeps who the leader is and what the last checkpoint is. The second is the `high-availability.storageDir`: the ConfigMap keeps only the pointer, the real metadata goes to durable storage. Without that directory configured, a JobManager that dies comes back not knowing where to resume from, and the entire state is lost despite the checkpoints existing.

### Memory

This is the arithmetic that takes the most work, because Flink does not have one memory number, it has a tree of them. The value you configure is `taskmanager.memory.process.size`, and it is the total the process can occupy in the operating system. Everything else is subdivision.

Inside it, Flink first separates what belongs to the JVM and not to Flink: the metaspace (`taskmanager.memory.jvm-metaspace.size`, 256m by default) and an overhead for thread stacks, internal buffers and native code (`taskmanager.memory.jvm-overhead.fraction`, 10% of the process size). What remains is Flink's memory proper, and it splits into four parts:

- The task heap, where your objects live, and the state when the backend is the heap one.
- Managed memory, which is off-heap and is where RocksDB allocates its block caches and write buffers. In a batch job, it is also where sort and hash join happen.
- Network memory, which is the buffers for exchanging data between tasks.
- A slice reserved for the framework, which you rarely touch.

The rule that matters above all others: **the `process.size` has to fit inside the container's memory limit**. If you give the pod an 8Gi limit and configure `process.size: 8192m`, the pod will be killed by OOMKill, because the cgroup also counts file pages, native RocksDB allocations outside what Flink accounts for and what the kernel itself uses. Leaving a 10 to 15% margin solves it. For an 8Gi limit, I would configure around 7000m and sleep better.

The second decision is how to split. If the state is large and the backend is RocksDB, managed memory is what makes the difference, because it determines the size of the cache before access turns into disk reads. A reasonable starting split is 40% managed memory and the rest between heap and network. If the state is small and fits in heap, the opposite path: `taskmanager.memory.managed.fraction: 0.1` and everything else to the heap.

Network memory is the most surprising one. It is 10% of Flink's memory by default, capped at 1 GB, and consumption grows with the number of connections between tasks, which in turn grows with the square of the parallelism in `keyBy`-style exchanges. A job with parallelism 4 that moves to 200 can start failing with an insufficient buffers error without a single line of code having changed. It is one of the few cases where increasing parallelism makes things worse before it makes them better.

### CPU and slots

A slot is not a CPU. A slot is a slice of memory and a place in the scheduling, but the threads of all the slots in a TaskManager compete for the same cores of the JVM. There is no CPU isolation between slots.

That is why the starting rule is simple: `taskmanager.numberOfTaskSlots` equal to the number of cores the container has as its limit. Four cores, four slots. Going much above that does not increase throughput, it only increases context switching and the pause time the garbage collector has to manage.

The total parallelism of the job is then the number of TaskManagers times the slots of each one, and that multiplication is the number that appears in the manifest. Three TaskManagers of four slots give twelve, which is the parallelism of the example above.

To get to the right number of TaskManagers, I would not try to calculate from first principles. The path that makes sense is measuring: bring up the job with low parallelism, inject a known load and look at `numRecordsInPerSecond` per subtask in the UI or in Prometheus. That gives a throughput per slot. Divide the expected peak by that number, add a margin of about 30% for spikes and for reprocessing (because after a crash the job needs to run faster than production to catch up to the present) and the result is how many slots are needed. A filter-and-projection job can do hundreds of thousands of events per second in one slot; a job with a large window, state in RocksDB and JSON deserialization can do a few thousand. The difference between those two cases is orders of magnitude, and that is exactly why you cannot guess.

It is worth remembering that changing the parallelism of a stateful job later is not free: the state is redistributed among the new subtasks on restore, and the ceiling remains the `maxParallelism` fixed on the first run, for the reason I described in the parallelism section.

### Local disk

With RocksDB, the working state is not in memory, it is in files on the TaskManager's local disk, pointed to by `io.tmp.dirs`. That is what allows having state larger than RAM, and it is also what makes the type of disk matter.

It needs to be local SSD, not a network volume. RocksDB is an LSM tree: it writes to sorted files and then compacts those files in the background, rewriting data that was already there. That write amplification, added to random reads on every state access, is exactly the I/O pattern a network disk serves badly. I have seen the same job go from stable to unusable just by switching the volume type.

For sizing, the arithmetic starts from the logical state: number of active keys times the state size per key, divided by the parallelism, gives the state per TaskManager. After that, multiply. Two to three times is a reasonable margin, because compaction needs space to write the new files before deleting the old ones, and because incremental checkpoints keep files referenced by earlier snapshots that have not yet been discarded. Ten million keys with 1 KB of state each give 10 GB of logical state; across three TaskManagers, that is something between 7 and 10 GB of disk on each.

On Kubernetes, that means choosing between `emptyDir` and a persistent volume. With `emptyDir`, the disk dies with the pod, and a restart forces the TaskManager to download the entire state from remote storage before it resumes processing, which for large states is the difference between seconds and many minutes of recovery. With a persistent volume and `state.backend.local-recovery: true`, the local copy survives the restart and recovery reads from disk instead of the network. It is more complexity in exchange for recovery time, and the choice depends on how much the delay costs.

### S3 and the remote file system

Here is the confusion I myself had before studying: **S3 is not where the state lives, it is where copies of it are kept**. The hot state is in the heap or on the TaskManager's local disk, and that is where it is read and written on every event. S3 enters at four moments, and all of them are periodic or exceptional.

The first is checkpoints. At every configured interval, each operator writes its state to `state.checkpoints.dir`. That is what survives the simultaneous loss of all pods.

The second is savepoints, in `state.savepoints.dir`, which is the same mechanism with a different lifecycle: they are yours, they are not deleted by Flink, and it is from them that the upgrade without losing state comes.

The third is the high availability metadata, in `high-availability.storageDir`. The Kubernetes ConfigMap is too small to hold the job graph and the full pointers, so it keeps only the reference and the content lives in remote storage.

The fourth, when it exists, is the data itself: a source that reads Parquet from a bucket, or a sink that writes results partitioned by hour.

The reason it is S3, and not a shared disk, is that durability needs to be independent of the cluster. A checkpoint that is on the same hardware as the job does not protect against the loss of that hardware. Object storage is cheap, replicated and keeps existing after the whole cluster stops existing, which is precisely the property that makes a streaming job recoverable. GCS, Azure Blob and HDFS occupy the same place in the architecture, with a different letter in the URI scheme.

The configuration has a gotcha that costs time. Flink ships two S3 implementations, and they are not interchangeable. `flink-s3-fs-presto` is the one indicated for checkpoints, because it is fast with small files and does not depend on renaming objects, an operation S3 does not have atomically and emulates with a copy followed by a delete. `flink-s3-fs-hadoop` is the one that supports recoverable writes, which is what the file sink needs to do multipart uploads and commit only at the checkpoint. Many people install both and use `s3p://` for state and `s3a://` for data. Both are plugins and need to go to `/opt/flink/plugins/`, each in its own directory, and not to `lib/`. In `lib/` they load in the main classloader and conflict with each other.

The last point is about the checkpoint interval, which looks like a latency setting and is also a cost calculation. Every checkpoint writes at least one file per stateful subtask. A job with parallelism 200 and a checkpoint every 10 seconds produces on the order of seventy thousand objects per hour, and S3 charges per request besides rate-limiting per prefix. That shows up as rising checkpoint latency and, at the limit, as checkpoints expiring by timeout. Two defenses help: raising `state.storage.fs.memory-threshold` so that small states travel inside the metadata file instead of becoming separate objects, and accepting a longer interval. One minute between checkpoints is a common value, and what it costs is only the amount of work that needs to be redone after a failure.

## The ecosystem around it

Flink rarely appears alone. It is a processing engine, and an engine needs something to feed it, somewhere to deposit and people who read what it produced. A good part of the work of assembling a pipeline is choosing those pieces, so it is worth mapping the ones that most often appear next to it and, above all, why they appear.

| Tool | Where it comes in | Why it shows up alongside |
|:--|:--|:--|
| **Apache Kafka** | Ingestion | Decouples whoever produces from whoever processes and keeps the history. It is what allows reprocessing a job from the beginning, and not just from now |
| **Debezium** | Ingestion | Reading binlog and WAL correctly, with an initial snapshot and without losing a transaction, is hard enough that nobody wants to rewrite it. Flink CDC uses it underneath |
| **Schema Registry, with Avro or Protobuf** | Contract | A job that deserializes JSON by hand breaks at the producer's first change. The registry makes the contract explicit and verifiable before deploy, not in production |
| **Apache Iceberg** | Storage | Gives transactions, schema evolution and time travel over files in object storage. Without it the job writes loose Parquet and readers see half-written data |
| **Apache Paimon** | Storage | Born inside the Flink community for the case Iceberg serves worst: high-rate primary key updates, with a changelog that can be read back |
| **Apache Hudi** | Storage | The third option in the same space, older, focused on upsert and incremental reads |
| **Hive Metastore, AWS Glue or Nessie** | Catalog | The table format knows which files make up a table. The catalog knows which tables exist. Without it, there is nothing to list in Flink SQL |
| **Trino** | Query | Flink is not an interactive query engine. Trino reads the same Iceberg tables to answer the question nobody had anticipated |
| **ClickHouse, Druid or Pinot** | Analytical serving | A dashboard wants millisecond answers over recent data. Flink pre-aggregates and pushes there, and the user's query never touches the stream |
| **PostgreSQL and MySQL** | Operational | Source via CDC on one side and destination of the aggregated result on the other, when the consumer is an application and not an analyst |
| **Redis** | Low-latency serving | Keeps what has already been computed for whoever needs to read outside the stream, in microseconds. It is also the typical online store of a feature store |
| **Feast** | Machine learning | Feature store. Guarantees that the feature used in training and the one used in inference are the same thing, computed the same way |
| **Prometheus and Grafana** | Operations | Metrics of the job itself (checkpoint duration, backpressure, lag per partition) and the natural destination for the derived metrics the job computes |
| **Airflow or Dagster** | Orchestration | A streaming job has no schedule, but everything around it does: backfill, table compaction, snapshot expiration, upgrade with savepoint |

Three of those choices have a detail that only appears later, and it is worth anticipating.

The first is the small files problem. The Iceberg sink commits what it wrote when the checkpoint closes, so the checkpoint interval stops being only a recovery decision and starts determining how many files and how many snapshots the table gains per hour. A checkpoint every ten seconds in a job with high parallelism produces a table with thousands of tiny files per day, which is the worst possible format for whoever reads it later. The solution is not avoiding Iceberg, it is accepting that compaction and snapshot expiration are recurring work, and it is precisely that work that usually justifies an Airflow next to a pipeline that, on paper, had nothing scheduled.

The second is the catalog, which is almost always remembered late. It is easy to think about the table format and forget that someone needs to know the table exists. Without a configured catalog, Flink SQL's `CREATE TABLE` lives only in the session and disappears when the client closes, and the Trino on the other side sees nothing of what was created. Choosing the catalog is what makes Flink and the other engines talk about the same table, instead of the same files by coincidence.

The third is the reason a feature store exists, which took me a while to understand. The problem it solves is not storage, it is consistency: if the feature "average purchases in the last 30 minutes" is computed by a Flink job at inference and by a SQL query at training, the two will disagree in some detail, and the model starts seeing in production data different from what it saw while learning. Keeping a single definition, fed by the same job, is the point. And it is worth noting that part of this is migrating into Flink itself with the model functions of 2.1 and 2.2, which I describe in the post about Flink 2.3.

## Complexities

- Fine-tuning RocksDB and the behavior of state when it grows far beyond memory.
- Join strategies between streams, mainly interval joins and temporal joins.
- The CEP library, mentioned up in the use cases and not yet tested by me.
- How all of this really behaves in production under irregular load, the part no documentation teaches.

## What stayed with me

I ended the week with an impression I did not expect to have: the hard part of streaming is not distributing the processing. Flink solves that. The hard part is **time**: accepting that data arrives out of order, that "complete" is a bet and not a fact, and that almost every technical decision here is, deep down, a choice between latency and correctness.

Writing this forced me to admit three or four things I thought I knew and did not. It was worth the effort.

It remains to say why I went after this, because it is not Flink for Flink's sake. What I want is to process OTLP, the format the OpenTelemetry Collector speaks, and in practice that means the four signals: logs, spans, metrics and profiles.

The Collector receives, transforms and forwards very well, but it is built for data to pass through. The moment the question needs memory between events, event-time windows or correlating signals that arrive separately and out of order, it falls exactly into what this text describes: `keyBy`, keyed state and watermarks. That fit is what I want to test in the next round.

Next week on the schedule: reviewing the Data Engineer roadmap. I keep writing while I learn.
