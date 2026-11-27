---
title: "Ferramentas do stack de dados e ML por categoria"
slug: "data-and-ml-stack-tools"
date: '2026-09-01T12:00:00-03:00'
draft: false
description: "Uma tabela por categoria das ferramentas do stack de dados e ML: para que serve cada tecnologia e onde ela se encaixa numa plataforma de dados moderna, as técnicas e ferramentas de observabilidade de dados e quatro arquiteturas de referência."
tags:
- data-engineering
- machine-learning
minute: 11
---

| Categoria | Ferramentas / Tecnologias | Uso principal |
|---|---|---|
| **Frameworks de ML** | TensorFlow, PyTorch, Scikit-learn, XGBoost, LightGBM, Ray | Treino de modelos, do clássico ao deep learning, e treino distribuído |
| **Data Science / Analytics** | Python, Jupyter, Pandas, Polars, NumPy, SciPy, R | Exploração de dados, análise estatística e preparação de dados |
| **BI / Analytics** | Apache Superset, Metabase, Grafana, Power BI, Tableau | Dashboards, exploração e visualização de dados |
| **Processamento batch** | Apache Spark, Apache Beam | Processamento distribuído de grandes volumes |
| **Ingestão / CDC** | Debezium, Kafka Connect, Apache NiFi, Airbyte, Fivetran | Ingestão de dados, CDC e integração de dados |
| **Streaming / Processamento de eventos** | Apache Kafka, Redpanda, Apache Pulsar (brokers); Apache Flink (processamento) | Transporte e processamento de dados em tempo real |
| **Orquestração de workflows** | Apache Airflow, Dagster, Prefect, Argo Workflows | Orquestração de pipelines e workflows |
| **Transformação de dados** | dbt, SQLMesh, Dataform | Transformação, modelagem e ELT dentro do warehouse ou lakehouse |
| **Qualidade de dados** | Great Expectations, Soda, dbt Tests, Deequ | Validação e checagens de qualidade |
| **Observabilidade de dados** | Elementary, Monte Carlo, OpenLineage, Marquez, Evidently | Frescor, volume, schema, anomalias, linhagem e drift (detalhes abaixo) |
| **Catálogo / Governança** | OpenMetadata, DataHub, Apache Atlas | Catálogo de dados, linhagem e governança |
| **Armazenamento do data lake** | Amazon S3, Google Cloud Storage, Azure Data Lake Storage, MinIO | Object storage e data lake |
| **Formatos de arquivo** | Apache Parquet, Apache ORC, Apache Avro, Apache Arrow | Formatos de armazenamento e intercâmbio de dados |
| **Formatos de tabela abertos** | Apache Iceberg, Apache Hudi, Delta Lake, Apache Paimon | Tabelas ACID, evolução de schema, snapshots e time travel |
| **Catálogo de lakehouse** | Apache Polaris, Project Nessie, AWS Glue Catalog, Hive Metastore | Catálogo de tabelas e gestão de metadados |
| **Engines de consulta / OLAP** | Trino, Presto, DuckDB, ClickHouse, Apache Doris, StarRocks | SQL distribuído, analytics embarcado e OLAP |
| **Data Warehouse (gerenciado)** | Snowflake, BigQuery, Redshift | Warehouse como serviço, com armazenamento e computação gerenciados |
| **Plataformas de lakehouse** | Databricks, Dremio, Starburst | Plataformas de data lakehouse e analytics |
| **Feature Store** | Feast, Hopsworks, Tecton | Gestão e serving de features de ML |
| **Pipelines de ML** | Kubeflow Pipelines, Metaflow, Flyte | Pipelines de machine learning |
| **Experiment Tracking** | MLflow, Weights & Biases, Comet | Acompanhamento de experimentos e métricas |
| **Model Registry** | MLflow, Kubeflow, Vertex AI, SageMaker, Azure ML | Versionamento e ciclo de vida de modelos |
| **Model Serving** | KServe, Seldon, NVIDIA Triton, Ray Serve, BentoML, vLLM | Inferência e serving de modelos |
| **Bancos vetoriais** | Qdrant, Milvus, Weaviate, pgvector, Pinecone | Embeddings, busca semântica e RAG |

Algumas ferramentas aparecem em mais de uma linha porque cumprem mais de um
papel: o MLflow faz tracking e registry, o Ray treina e serve modelos, e o
Grafana mostra tanto dashboards de negócio quanto a saúde dos pipelines.

## Observabilidade de dados

Observabilidade de infraestrutura responde se o job está de pé. Observabilidade
de dados responde se o que o job entregou está certo: um pipeline pode rodar
verde todos os dias e gravar uma tabela vazia, duplicada ou com uma coluna que
mudou de tipo. As técnicas que mais aparecem:

| Técnica | O que verifica | Como se faz |
|---|---|---|
| **Frescor (freshness)** | Se a tabela foi atualizada dentro do prazo esperado | Comparar o último timestamp ou a última partição com um SLA (dbt `source freshness`, Elementary, Soda) |
| **Volume** | Se a quantidade de linhas está dentro do normal | Contar linhas por carga ou partição e comparar com o histórico (detecção de anomalia) |
| **Schema** | Se colunas sumiram, apareceram ou mudaram de tipo | Testes de schema, data contracts e regras de compatibilidade no schema registry |
| **Qualidade e distribuição** | Nulos, unicidade, faixas de valor, valores aceitos | Testes declarativos (dbt tests, Great Expectations, Soda, Deequ) |
| **Linhagem** | De onde cada tabela vem e quem depende dela | Eventos OpenLineage emitidos por Airflow, Spark, dbt e Flink, guardados no Marquez ou no DataHub |
| **Reconciliação** | Se origem e destino batem | Comparar contagens e somas entre o banco de origem e o lake, essencial em CDC |
| **Write-Audit-Publish (WAP)** | Que dado ruim não chegue a quem consome | Escrever num branch (Iceberg ou Nessie), validar e só então publicar no branch principal |
| **Diff de dados** | O que uma mudança de código altera no resultado | Comparar a tabela antes e depois de mudar um modelo (o `table_diff` do SQLMesh, por exemplo) |
| **Atraso em streaming** | Se o pipeline está acompanhando o fluxo | Consumer lag no Kafka e atraso do watermark e duração de checkpoint no Flink |
| **Drift** | Se os dados de produção se afastaram dos de treino | Comparar distribuições de features e de predições (Evidently) |

Muita gente resume as cinco primeiras em "pilares" da observabilidade de dados:
frescor, volume, schema, distribuição e linhagem. Na prática, o que transforma
isso em operação é ter, para cada tabela importante, um dono, um SLA e um
alerta que chegue a quem pode agir.

## Arquiteturas de referência

Quatro jeitos de ligar as ferramentas acima. As três primeiras têm as mesmas
camadas, ingestão, processamento e armazenamento, mais o que consome o
resultado. A quarta mostra o que observa os dados enquanto eles passam.

### 1. Lakehouse em batch

ELT noturno e de hora em hora. O padrão quando a latência é medida em horas.

```mermaid
flowchart TB
  subgraph ing["Ingestão"]
    pg["PostgreSQL"]
    saas["APIs e SaaS"]
    debezium["Debezium + Kafka Connect"]
    airbyte["Airbyte"]
  end
  subgraph load["Carga"]
    spark["Apache Spark"]
  end
  subgraph sto["Armazenamento"]
    iceberg["Apache Iceberg"]
    s3["Object storage (S3)"]
    polaris["Apache Polaris"]
  end
  subgraph tr["Transformação"]
    dbt["dbt"]
    ge["Great Expectations"]
  end
  subgraph out["Consumo"]
    trino["Trino"]
    superset["Apache Superset"]
  end

  pg --> debezium --> spark
  saas --> airbyte --> spark
  spark -- "camada bruta (bronze)" --> iceberg
  iceberg <-- "silver e gold" --> dbt
  iceberg -. "validação" .-> ge
  s3 -.- iceberg
  polaris -.- iceberg
  iceberg --> trino --> superset
```

O dbt não fica no caminho entre a ingestão e a tabela: ele lê e escreve dentro
do próprio lakehouse, executando o SQL via Spark ou Trino. O Apache Airflow
fica fora do desenho, disparando cada etapa.

### 2. Streaming

Segundos em vez de horas. Dois ramos saindo de um único job: a tabela para o
histórico, o store OLAP para o dashboard.

```mermaid
flowchart TB
  subgraph ing["Ingestão"]
    pg["PostgreSQL"]
    debezium["Debezium"]
    kafka["Apache Kafka"]
  end
  subgraph proc["Processamento"]
    flink["Apache Flink"]
  end
  subgraph sto["Armazenamento"]
    paimon["Apache Paimon no S3"]
    clickhouse["ClickHouse"]
  end
  subgraph out["Consumo"]
    trino["Trino"]
    grafana["Grafana"]
  end

  pg --> debezium --> kafka --> flink
  flink --> paimon --> trino
  flink --> clickhouse --> grafana
```

O Airflow continua necessário aqui, não para agendar o job, mas para rodar a
compactação e a expiração de snapshots que a tabela precisa, porque o job nunca
para de escrever.

### 3. ML e inferência

Features escritas pelo mesmo pipeline que alimenta o treino, um modelo servido
a partir de um registry e, ao lado, um fluxo de RAG.

```mermaid
flowchart TB
  subgraph ing["Ingestão"]
    kafka["Apache Kafka"]
  end
  subgraph proc["Processamento"]
    flink["Apache Flink"]
    spark["Apache Spark"]
  end
  subgraph sto["Armazenamento"]
    delta["Delta Lake no S3"]
    feast["Feast"]
    qdrant["Qdrant"]
  end
  subgraph train["Treino"]
    ray["Ray"]
    mlflow["MLflow Registry"]
  end
  subgraph serve["Serving"]
    kserve["KServe"]
    app["Aplicação (RAG)"]
    vllm["vLLM"]
  end

  kafka --> flink
  kafka --> spark --> delta
  flink -- "features online" --> feast
  delta -- "store offline" --> feast
  feast -- "dataset de treino" --> ray --> mlflow --> kserve
  feast -- "features na inferência" --> kserve
  flink -- "embeddings" --> qdrant
  app -- "busca" --> qdrant
  app -- "prompt com contexto" --> vllm
```

O Feast guarda as mesmas features em dois lugares: no store offline, de onde
sai o dataset de treino, e no online, consultado na inferência. No RAG, quem
consulta o banco vetorial é a aplicação, que depois monta o prompt e chama o
modelo; o vLLM só gera o texto.

### 4. Observabilidade de dados

O que observa os pipelines das arquiteturas acima: linhagem, testes e
publicação condicionada à validação.

```mermaid
flowchart TB
  subgraph pipe["Pipelines"]
    airflow["Apache Airflow"]
    spark["Apache Spark"]
    dbt["dbt"]
  end
  subgraph wap["Write-Audit-Publish"]
    branch["Branch de auditoria no Iceberg"]
    checks["Soda / Great Expectations"]
    main["Branch principal (publicado)"]
  end
  subgraph meta["Linhagem"]
    ol["Eventos OpenLineage"]
    marquez["Marquez / DataHub"]
  end
  subgraph mon["Monitoramento"]
    elementary["Elementary"]
    alert["Alertas e on-call"]
  end

  spark --> branch --> checks
  checks -- "passou" --> main
  checks -- "falhou" --> alert
  dbt -- "testes, frescor e volume" --> elementary --> alert
  airflow -.-> ol
  spark -.-> ol
  dbt -.-> ol
  ol --> marquez
```

A linhagem é o que transforma um alerta em diagnóstico: quando uma checagem
falha, o Marquez ou o DataHub mostram de qual tabela o problema veio e quais
dashboards e modelos dependem dela.

## Repositórios oficiais

- [Airbyte](https://github.com/airbytehq/airbyte): ELT baseado em conectores para carregar dados num warehouse ou lake.
- [Apache Airflow](https://github.com/apache/airflow): Agenda e monitora pipelines escritos como DAGs em Python.
- [Apache Arrow](https://github.com/apache/arrow): Formato colunar em memória compartilhado entre engines e linguagens.
- [Apache Atlas](https://github.com/apache/atlas): Governança de metadados e linhagem para o ecossistema Hadoop.
- [Apache Avro](https://github.com/apache/avro): Formato de serialização orientado a linhas que carrega o próprio schema.
- [Apache Beam](https://github.com/apache/beam): Um único modelo de pipeline que roda em várias engines de batch e streaming.
- [Apache Doris](https://github.com/apache/doris): Banco analítico MPP voltado a relatórios em tempo real.
- [Apache Flink](https://github.com/apache/flink): Processamento de streams com estado, event time e exactly-once.
- [Apache Hudi](https://github.com/apache/hudi): Formato de tabela de lake com upserts e leituras incrementais.
- [Apache Iceberg](https://github.com/apache/iceberg): Formato de tabela aberto com commits ACID, evolução de schema e time travel.
- [Apache Kafka](https://github.com/apache/kafka): Log distribuído para publicar e consumir streams de eventos.
- [Apache NiFi](https://github.com/apache/nifi): Roteamento e transformação baseados em fluxo, com editor visual.
- [Apache ORC](https://github.com/apache/orc): Formato de arquivo colunar feito para leituras grandes no estilo Hive.
- [Apache Paimon](https://github.com/apache/paimon): Formato de tabela de lake projetado para ser escrito continuamente pelo Flink.
- [Apache Parquet](https://github.com/apache/parquet-format): O formato de arquivo colunar em que a maior parte do lake é armazenada.
- [Apache Polaris](https://github.com/apache/polaris): Catálogo aberto para que várias engines vejam as mesmas tabelas Iceberg.
- [Apache Pulsar](https://github.com/apache/pulsar): Mensageria e streaming com armazenamento separado do serving.
- [Apache Spark](https://github.com/apache/spark): Engine geral para batch, SQL e ML sobre grandes volumes de dados.
- [Apache Superset](https://github.com/apache/superset): BI web com dashboards e exploração em SQL.
- [Argo Workflows](https://github.com/argoproj/argo-workflows): Roda workflows nativos de contêiner como objetos do Kubernetes.
- [BentoML](https://github.com/bentoml/BentoML): Empacota um modelo e suas dependências num serviço.
- [ClickHouse](https://github.com/ClickHouse/ClickHouse): Column store para consultas analíticas rápidas em escala.
- [Dagster](https://github.com/dagster-io/dagster): Orquestrador construído em torno de data assets em vez de tarefas.
- [Dataform](https://github.com/dataform-co/dataform): Workflows de transformação em SQL com gestão de dependências.
- [DataHub](https://github.com/datahub-project/datahub): Plataforma de metadados para catálogo, linhagem e ownership.
- [dbt](https://github.com/dbt-labs/dbt): Transforma selects em SQL em modelos testados, documentados e versionados.
- [Debezium](https://github.com/debezium/debezium): Lê os logs de mudança do banco e os publica como eventos.
- [Deequ](https://github.com/awslabs/deequ): Checagens de qualidade de dados expressas como jobs Spark.
- [Delta Lake](https://github.com/delta-io/delta): Camada de armazenamento transacional sobre arquivos Parquet.
- [Dremio](https://github.com/dremio/dremio-oss): Engine de consulta e camada semântica sobre o armazenamento do lake.
- [DuckDB](https://github.com/duckdb/duckdb): Banco analítico que roda dentro do seu processo, sem servidor.
- [Elementary](https://github.com/elementary-data/elementary): Observabilidade de dados nativa do dbt: testes de anomalia, frescor, volume e alertas.
- [Evidently](https://github.com/evidentlyai/evidently): Métricas e relatórios de drift e qualidade para dados, modelos de ML e LLMs.
- [Feast](https://github.com/feast-dev/feast): Feature store que serve as mesmas features para treino e inferência.
- [Flyte](https://github.com/flyteorg/flyte): Workflows tipados e versionados para dados e ML no Kubernetes.
- [Grafana](https://github.com/grafana/grafana): Dashboards sobre métricas, logs e traces.
- [Great Expectations](https://github.com/fivetran/great_expectations): Declara expectativas sobre os dados e as valida.
- [Hive Metastore](https://github.com/apache/hive): O catálogo de tabelas e partições que muitas engines ainda leem.
- [Hopsworks](https://github.com/logicalclocks/hopsworks): Feature store e plataforma de ML.
- [Jupyter](https://github.com/jupyter/notebook): Notebooks para análise interativa.
- [KServe](https://github.com/kserve/kserve): Serve modelos no Kubernetes com autoscaling e canaries.
- [Kubeflow](https://github.com/kubeflow/kubeflow): Plataforma de ML montada a partir de componentes do Kubernetes.
- [Kubeflow Pipelines](https://github.com/kubeflow/pipelines): Compõe e executa pipelines de ML como contêineres.
- [LightGBM](https://github.com/lightgbm-org/LightGBM): Gradient boosting otimizado para velocidade em dados tabulares grandes.
- [Marquez](https://github.com/MarquezProject/marquez): Servidor de referência que coleta e armazena eventos OpenLineage.
- [Metabase](https://github.com/metabase/metabase): BI que deixa quem não é engenheiro fazer perguntas ao banco.
- [Metaflow](https://github.com/Netflix/metaflow): Workflows em Python para data science, da Netflix.
- [Milvus](https://github.com/milvus-io/milvus): Banco vetorial para busca por similaridade em escala.
- [MinIO](https://github.com/minio/minio): Object storage compatível com S3 que você mesmo roda. O repositório open source foi arquivado em 2026; a empresa passou a oferecer só a edição AIStor.
- [MLflow](https://github.com/mlflow/mlflow): Acompanha experimentos, empacota modelos e mantém o registry.
- [NumPy](https://github.com/numpy/numpy): Arrays e computação numérica, a base do stack Python.
- [NVIDIA Triton](https://github.com/triton-inference-server/server): Servidor de inferência para modelos em GPU e CPU.
- [OpenLineage](https://github.com/OpenLineage/OpenLineage): Padrão aberto para pipelines reportarem o que leram e escreveram.
- [OpenMetadata](https://github.com/open-metadata/OpenMetadata): Catálogo, linhagem, qualidade e governança num lugar só.
- [Pandas](https://github.com/pandas-dev/pandas): DataFrames para manipulação de dados em Python.
- [pgvector](https://github.com/pgvector/pgvector): Tipos e índices vetoriais dentro do PostgreSQL.
- [Polars](https://github.com/pola-rs/polars): DataFrames rápidos escritos em Rust, com engine de consulta lazy.
- [Prefect](https://github.com/PrefectHQ/prefect): Orquestração para workflows em Python, feita para execuções dinâmicas.
- [Presto](https://github.com/prestodb/presto): Engine SQL distribuída que consulta os dados onde eles estão.
- [Project Nessie](https://github.com/projectnessie/nessie): Branches e commits no estilo Git para tabelas do lake.
- [Python](https://github.com/python/cpython): A linguagem em que a maior parte deste stack é escrita e operada.
- [PyTorch](https://github.com/pytorch/pytorch): Framework de deep learning com grafos dinâmicos.
- [Qdrant](https://github.com/qdrant/qdrant): Engine de busca vetorial com filtros, escrita em Rust.
- [R](https://github.com/r-devel/r-svn): Linguagem e ambiente para estatística.
- [Ray](https://github.com/ray-project/ray): Runtime distribuído em Python para treino, tuning e serving.
- [Redpanda](https://github.com/redpanda-data/redpanda): Broker compatível com Kafka sem JVM e sem ZooKeeper. O repositório foi arquivado, e a Community Edition segue sob licença própria da Redpanda.
- [Scikit-learn](https://github.com/scikit-learn/scikit-learn): Algoritmos clássicos de machine learning em Python.
- [SciPy](https://github.com/scipy/scipy): Computação científica construída sobre o NumPy.
- [Seldon](https://github.com/SeldonIO/seldon-core): Faz deploy e monitora modelos no Kubernetes.
- [Soda](https://github.com/sodadata/soda-core): Checagens de qualidade de dados escritas como regras legíveis.
- [SQLMesh](https://github.com/SQLMesh/sqlmesh): Transformações com linhagem por coluna e ambientes virtuais.
- [StarRocks](https://github.com/StarRocks/starrocks): Banco OLAP MPP para consultas abaixo de um segundo sobre o lake.
- [TensorFlow](https://github.com/tensorflow/tensorflow): Framework de deep learning com toolchain de produção.
- [Trino](https://github.com/trinodb/trino): SQL distribuído que federa consultas entre muitas fontes.
- [vLLM](https://github.com/vllm-project/vllm): Serving de alto throughput para grandes modelos de linguagem.
- [Weaviate](https://github.com/weaviate/weaviate): Banco vetorial com módulos de embedding embutidos.
- [XGBoost](https://github.com/dmlc/xgboost): Biblioteca de gradient boosting, o cavalo de batalha dos dados tabulares.

O Kafka Connect vem dentro de apache/kafka, o dbt Tests dentro de dbt-labs/dbt e o Ray Serve dentro de ray-project/ray, então compartilham os repositórios acima.

O Amundsen, que aparecia na versão anterior desta lista, foi arquivado em setembro de 2026 por inatividade.

Sem repositório público, por serem proprietários ou serviços gerenciados: Power BI, Tableau, Fivetran, Amazon S3, Google Cloud Storage, Azure Data Lake Storage, AWS Glue Catalog, Databricks, Starburst, Snowflake, BigQuery, Redshift, Tecton, Pinecone, Weights & Biases, Comet, Monte Carlo, Vertex AI, SageMaker e Azure ML.
