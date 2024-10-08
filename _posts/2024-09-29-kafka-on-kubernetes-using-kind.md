---
layout: post
title: Kafka on Kubernetes using Kind
description: 
summary: 
tags: kafka kind kubernetes
minute: 12
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
