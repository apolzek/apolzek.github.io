---
layout: post
title: Kafka on Kubernetes using Kind
description: 
summary: 
tags: kafka kind kubernetes
minute: 15
---

## Kafka on Kubernetes using Kind

Recently, I came across an article on Medium that explains how to set up a local environment with Kafka in a test folder, using the Kubernetes StatefulSet concept. I decided to bring it to my blog, adding some tips and additional information. Although my knowledge of Kafka is still basic, I already have a few applications in production using this tool — and it’s amazing how well they perform. I was also responsible for creating a solution using Kafka Connect, Kafka, and CDC for the Boleto product.

What follows is a simple and easy way to set up a local development environment with Kafka. I’ll also provide a brief introduction to Kafka and explain how you can use this solution in your projects. It’s important to note that this article is not a "How to run Kafka in production" guide, so keep that in mind. I may also add a Kafka command cheatsheet to make my life easier in the future.

If you're not familiar with Kind, it's an easy way to run Kubernetes locally. With Kind, you can use specific Kubernetes versions, configure the network to expose the API server or ports to the host, upload images, and do many other things. Simply install Docker or Podman first, and then install Kind. It’s a straightforward and easy process.

1) Create kind configuration

*kind-config.yaml*
```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30092
    hostPort: 30092
    listenAddress: "0.0.0.0" # Optional, defaults to "0.0.0.0"
    protocol: tcp # Optional, defaults to tcp
- role: worker
- role: worker
- role: worker
```

2) Create a kind cluster

```bash
kind create cluster --config kind-config.yaml --name my-cluster
```

3) Create kafka StatefulSet and Namespace

*kafka.yaml*
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kafka
  labels:
    name: kafka
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kafka
  namespace: kafka
  labels:
    app: kafka-app
spec:
  serviceName: kafka-svc
  replicas: 3
  selector:
    matchLabels:
      app: kafka-app
  template:
    metadata:
      labels:
        app: kafka-app
    spec:
      containers:
        - name: kafka-container
          image: doughgle/kafka-kraft
          ports:
            - containerPort: 9092
            - containerPort: 9093
          env:
            - name: REPLICAS
              value: '3'
            - name: SERVICE
              value: kafka-svc
            - name: NAMESPACE
              value: kafka
            - name: SHARE_DIR
              value: /mnt/kafka
            - name: CLUSTER_ID
              value: bXktY2x1c3Rlci0xMjM0NQ==
            - name: DEFAULT_REPLICATION_FACTOR
              value: '3'
            - name: DEFAULT_MIN_INSYNC_REPLICAS
              value: '2'
          volumeMounts:
            - name: data
              mountPath: /mnt/kafka
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - "ReadWriteOnce"
        resources:
          requests:
            storage: "1Gi"
---
apiVersion: v1
kind: Service
metadata:
  name: kafka-svc
  namespace: kafka
  labels:
    app: kafka-app
spec:
  type: NodePort
  ports:
    - name: '9092'
      port: 9092
      protocol: TCP
      targetPort: 9092
      nodePort: 30092
  selector:
    app: kafka-app
```

4) Create a topic

```sh
kubectl exec -it kafka-0 -n kafka -- bash
kafka-topics.sh --create --topic my-topic --bootstrap-server kafka-svc:9092
kafka-topics.sh --list --topic my-topic --bootstrap-server kafka-svc:9092
```

5) Produce and consume message

```sh
kubectl exec -it kafka-1 -n kafka -- bash
kafka-console-producer.sh  --bootstrap-server kafka-svc:9092 --topic my-topic
kafka-console-consumer.sh --bootstrap-server kafka-svc:9092 --topic my-topic
```

6) Delete topic
   
```sh
kafka-topics.sh --delete --topic my-topic --bootstrap-server kafka-svc:9092
```

## Kafka KRaft x Kafka with ZooKeeper

**Kafka KRaft Installation**: KRaft is Kafka's new built-in consensus mechanism that eliminates the need for ZooKeeper. In a KRaft-based installation, Kafka brokers manage metadata and leader election directly, which simplifies the architecture by reducing dependencies. KRaft is becoming the default option in newer Kafka versions because it provides better scalability, faster failover, and an overall more streamlined operation.

**Kafka with ZooKeeper**: In traditional Kafka deployments, ZooKeeper is used to manage the cluster’s metadata, such as broker details and topic configurations. ZooKeeper handles tasks like leader election and tracking which brokers are active. While this setup has been robust for years, it adds complexity by requiring an additional service (ZooKeeper) that must be installed, managed, and maintained alongside Kafka.

## Reviewing

| Term                          | Definition                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Topic**                     | A category or feed name to which records are published.                                                           |
| **Partition**                 | A topic is divided into multiple partitions, which are the fundamental unit of parallelism in Kafka.              |
| **Producer**                  | An application that publishes messages (records) to a Kafka topic.                                                |
| **Consumer**                  | An application that subscribes to topics and processes the published messages.                                    |
| **Broker**                    | A Kafka server that stores messages and serves client requests.                                                   |
| **Cluster**                   | A group of one or more brokers working together to handle data replication and load balancing.                    |
| **Offset**                    | A unique identifier for each record within a partition, used for tracking the position of messages.               |
| **Consumer Group**            | A group of consumers that work together to consume messages from a topic, ensuring load balancing.                |
| **Replication**               | The process of storing copies of partitions across multiple brokers for fault tolerance.                          |
| **Zookeeper**                 | A centralized service that manages and coordinates the Kafka brokers and maintains cluster metadata.              |
| **Log**                       | An ordered, append-only sequence of records for each partition that stores the actual messages.                   |
| **Retention Policy**          | A policy that determines how long Kafka retains messages in a topic before they are deleted.                      |
| **Throughput**                | A measure of how many messages can be processed per unit of time, often expressed in messages per second.         |
| **Latency**                   | The time it takes for a message to travel from a producer to a consumer.                                          |
| **Load Balancing**            | The distribution of partitions across multiple brokers to evenly distribute the workload.                         |
| **Partitioning Strategy**     | The method used to assign messages to partitions, based on keys or round-robin distribution.                      |
| **Replication Factor**        | The number of copies of a partition maintained across different brokers, enhancing fault tolerance.               |
| **Consumer Lag**              | The difference between the last produced message offset and the last consumed message offset in a consumer group. |
| **Auto-Scaling**              | The ability of a Kafka cluster to dynamically adjust its size based on workload and resource utilization.         |
| **Compact Topics**            | A feature that retains only the most recent value for each key in a topic, reducing storage requirements.         |
| **Kafka Streams**             | A client library for building real-time applications and microservices that process data in Kafka.                |
| **State Store**               | A key-value store used in Kafka Streams for maintaining local state during processing.                            |
| **Transaction Support**       | Kafka's ability to handle multi-producer and multi-consumer transactions, ensuring data integrity.                |
| **Cross-Cluster Replication** | The ability to replicate data across different Kafka clusters for disaster recovery and geo-replication.          |
| **Schema Registry**           | A centralized repository for managing data schemas, allowing producers and consumers to handle data evolution.    |
| **Backpressure Handling**     | Mechanisms for managing the flow of data between producers and consumers to prevent overwhelming consumers.       |
| **Topic Compaction**          | The process of removing older records with the same key, retaining only the latest record for each key.           |
