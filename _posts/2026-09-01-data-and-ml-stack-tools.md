---
layout: post
title: "Data and ML Stack Tools by Category"
minute: 6
---

| Category | Tools / Technologies | Primary Use |
|---|---|---|
| **Machine Learning** | MLflow, Kubeflow, Feast, Ray, TensorFlow, PyTorch, Scikit-learn, XGBoost, LightGBM | Training, tracking, serving, feature store and MLOps |
| **Data Science / Analytics** | Python, Jupyter, Pandas, Polars, NumPy, SciPy, R, Apache Arrow | Data exploration, statistical analysis and data preparation |
| **BI / Analytics** | Apache Superset, Metabase, Grafana, Power BI, Tableau | Dashboards, data exploration and visualization |
| **Data Engineering** | Apache Spark, Apache Flink, Apache Beam, Apache Kafka, dbt | Data processing, pipelines and transformations |
| **Data Ingestion / CDC** | Apache Kafka, Debezium, Kafka Connect, Apache NiFi, Airbyte, Fivetran | Data ingestion, CDC and data integration |
| **Workflow Orchestration** | Apache Airflow, Dagster, Prefect, Argo Workflows | Pipeline and workflow orchestration |
| **Data Transformation** | dbt, Apache Spark, SQLMesh, Dataform | Data transformation, modeling and ELT |
| **Data Quality** | Great Expectations, Soda, dbt Tests, Deequ | Data validation and quality checks |
| **Data Catalog / Governance** | OpenMetadata, DataHub, Apache Atlas, Amundsen, OpenLineage | Data catalog, lineage and governance |
| **Data Lake Storage** | Amazon S3, MinIO, Google Cloud Storage, Azure Data Lake Storage | Object storage and data lake |
| **File Formats** | Apache Parquet, Apache ORC, Apache Avro, Apache Arrow | Data storage and interchange formats |
| **Open Table Formats** | Apache Iceberg, Apache Hudi, Delta Lake, Apache Paimon | ACID tables, schema evolution, snapshots and time travel |
| **Lakehouse Catalog** | Apache Polaris, Project Nessie, AWS Glue Catalog, Hive Metastore | Table catalog and metadata management |
| **Query Engines** | Trino, Presto, DuckDB, ClickHouse, Apache Doris, StarRocks | SQL analytics and OLAP |
| **Lakehouse Platforms** | Databricks, Dremio, Starburst, Snowflake | Data lakehouse and analytics platforms |
| **Feature Store** | Feast, Hopsworks, Tecton | ML feature management and serving |
| **ML Pipelines** | Kubeflow Pipelines, MLflow, Airflow, Metaflow, Flyte | Machine learning pipelines |
| **Model Serving** | KServe, Seldon, NVIDIA Triton, Ray Serve, BentoML, vLLM | Model inference and serving |
| **Experiment Tracking** | MLflow, Weights & Biases, Neptune, Comet | Experiment tracking and metrics |
| **Model Registry** | MLflow, Kubeflow, Vertex AI, SageMaker, Azure ML | Model versioning and lifecycle management |
| **Vector Databases** | Qdrant, Milvus, Weaviate, pgvector, Pinecone | Embeddings, semantic search and RAG |
| **Streaming / Event Processing** | Apache Kafka, Apache Flink, Redpanda, Apache Pulsar | Real-time data processing |
| **Data Warehouse** | Snowflake, BigQuery, Redshift, ClickHouse, DuckDB | Structured analytics and OLAP |
| **Data Observability** | OpenTelemetry, Grafana, Prometheus, OpenLineage, Marquez | Data and pipeline observability |

## Reference architectures

Three ways to wire the tools above into a working stack. All of them have the
same three layers, ingestion, processing and storage, plus whatever consumes
the result.

### 1. Batch lakehouse

Nightly and hourly ELT. The default when latency is measured in hours.

```mermaid
flowchart TB
  subgraph ing["Ingestion"]
    airbyte["Airbyte"]
    debezium["Debezium + Kafka Connect"]
  end
  subgraph proc["Processing"]
    spark["Apache Spark"]
    dbt["dbt"]
    ge["Great Expectations"]
  end
  subgraph sto["Storage"]
    iceberg["Apache Iceberg"]
    s3["MinIO / S3"]
    polaris["Apache Polaris"]
  end
  subgraph out["Consumption"]
    trino["Trino"]
    superset["Apache Superset"]
  end

  airbyte --> spark
  debezium --> spark
  spark --> dbt --> ge --> iceberg
  s3 -.- iceberg
  polaris -.- iceberg
  iceberg --> trino --> superset
```

Apache Airflow sits outside the picture, triggering every arrow above.

### 2. Streaming

Seconds instead of hours. Two branches out of one job: the table for history,
the OLAP store for the dashboard.

```mermaid
flowchart TB
  subgraph ing["Ingestion"]
    debezium["Debezium"]
    kafka["Apache Kafka"]
  end
  subgraph proc["Processing"]
    flink["Apache Flink"]
  end
  subgraph sto["Storage"]
    paimon["Apache Paimon on S3"]
    clickhouse["ClickHouse"]
  end
  subgraph out["Consumption"]
    trino["Trino"]
    grafana["Grafana"]
  end

  debezium --> kafka --> flink
  flink --> paimon --> trino
  flink --> clickhouse --> grafana
```

Airflow is still needed here, not to schedule the job but to run the compaction
and snapshot expiration the table needs because the job never stops writing.

### 3. ML and inference

Features written by the same pipeline that feeds training, and a model served
out of a registry.

```mermaid
flowchart TB
  subgraph ing["Ingestion"]
    kafka["Apache Kafka"]
  end
  subgraph proc["Processing"]
    flink["Apache Flink"]
    spark["Apache Spark"]
  end
  subgraph sto["Storage"]
    feast["Feast"]
    delta["Delta Lake on S3"]
    qdrant["Qdrant"]
  end
  subgraph train["Training"]
    ray["Ray"]
    mlflow["MLflow Registry"]
  end
  subgraph serve["Serving"]
    kserve["KServe"]
    vllm["vLLM"]
  end

  kafka --> flink
  kafka --> spark
  flink --> feast
  flink --> qdrant
  spark --> delta
  delta --> ray --> mlflow --> kserve
  feast --> kserve
  qdrant --> vllm
```
