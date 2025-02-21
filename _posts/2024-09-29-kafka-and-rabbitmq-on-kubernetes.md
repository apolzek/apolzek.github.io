---
layout: post
title: Kafka and RabbitMQ on Kubernetes using Kind
description:
summary:
tags: kafka kind kubernetes rabbitmq
minute: 10
---

**saving your time**: *manifests to deploy kafka and rabbitmq as stateful set in kind (k8s local)*

## Index

- [Index](#index)
- [prerequisites](#prerequisites)
- [Create kubernetes cluster with kind](#create-kubernetes-cluster-with-kind)
- [Install Kafka](#install-kafka)
  - [Kafka KRaft x Kafka with ZooKeeper](#kafka-kraft-x-kafka-with-zookeeper)
- [Install RabbitMQ](#install-rabbitmq)

## prerequisites

| Item     | Version                                      |
| -------- | -------------------------------------------- |
| kind     | kind version 0.26.0                          |
| kubectl  | Client Version: v1.32.1                      |
| kafka    | docker.io/doughgle/kafka-kraft:latest        |
| rabbitmq | docker.io/library/rabbitmq:3.13.7-management |

## Create kubernetes cluster with kind

1 Create kind configuration(*kind-config.yaml*)

```yaml
cat <<EOF > /tmp/kind-config.yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30092
    hostPort: 30092
    listenAddress: "0.0.0.0"
    protocol: tcp
- role: worker
- role: worker
- role: worker
EOF
```

2 Create a kind cluster

```bash
kind create cluster --config /tmp/kind-config.yaml --name my-cluster
```

## Install Kafka

1 Apply yaml

```yaml
cat <<EOF | kubectl apply -f -
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
EOF
```

> 🕗 Wait until all 3 Kafka pods are in the "Running" state.

2 Create a topic

```sh
kubectl exec -it kafka-0 -n kafka -- bash
kafka-topics.sh --create --topic my-topic --bootstrap-server kafka-svc:9092
kafka-topics.sh --list --topic my-topic --bootstrap-server kafka-svc:9092
# Produce message
kafka-console-producer.sh --bootstrap-server kafka-svc:9092 --topic my-topic
```

3 Consume message

```sh
# consumer
kubectl exec -it kafka-1 -n kafka -- bash
kafka-console-consumer.sh --bootstrap-server kafka-svc:9092 --topic my-topic
```

> Run the producer and consumer in different Linux terminals

4 Delete topic

```sh
kafka-topics.sh --delete --topic my-topic --bootstrap-server kafka-svc:9092
```

### Kafka KRaft x Kafka with ZooKeeper

**Kafka KRaft Installation**: KRaft is Kafka's new built-in consensus mechanism that eliminates the need for ZooKeeper. In a KRaft-based installation, Kafka brokers manage metadata and leader election directly, which simplifies the architecture by reducing dependencies. KRaft is becoming the default option in newer Kafka versions because it provides better scalability, faster failover, and an overall more streamlined operation.

**Kafka with ZooKeeper**: In traditional Kafka deployments, ZooKeeper is used to manage the cluster’s metadata, such as broker details and topic configurations. ZooKeeper handles tasks like leader election and tracking which brokers are active. While this setup has been robust for years, it adds complexity by requiring an additional service (ZooKeeper) that must be installed, managed, and maintained alongside Kafka.

## Install RabbitMQ

1 Create a YAML file */tmp/rabbitmq.yml* with the content below

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: rabbitmq
spec: {}
status: {}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rabbitmq
  namespace: rabbitmq
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: rabbitmq
  namespace: rabbitmq
rules:
- apiGroups:
    - ""
  resources:
    - endpoints
  verbs:
    - get
    - list
    - watch
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: rabbitmq
  namespace: rabbitmq
subjects:
- kind: ServiceAccount
  name: rabbitmq
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role 
  name: rabbitmq
---
apiVersion: v1
kind: Secret
metadata:
  name: rabbit-secret
  namespace: rabbitmq
type: Opaque
data:
  RABBITMQ_ERLANG_COOKIE: V0lXVkhDRFRDSVVBV0FOTE1RQVc=
  RABBITMQ_DEFAULT_USER: Y29lbGhv
  RABBITMQ_DEFAULT_PASS: Y29lbGhvQFBhc3M=
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: rabbitmq-config
  namespace: rabbitmq
data:
  enabled_plugins: |
    [rabbitmq_management,rabbitmq_peer_discovery_k8s].

  rabbitmq.conf: |
    ## Cluster formation. See http://www.rabbitmq.com/cluster-formation.html to learn more.
    cluster_formation.peer_discovery_backend  = rabbit_peer_discovery_k8s
    cluster_formation.k8s.host = kubernetes.default.svc.cluster.local
    ## Should RabbitMQ node name be computed from the pod's hostname or IP address?
    ## IP addresses are not stable, so using [stable] hostnames is recommended when possible.
    ## Set to "hostname" to use pod hostnames.
    ## When this value is changed, so should the variable used to set the RABBITMQ_NODENAME
    ## environment variable.
    cluster_formation.k8s.address_type = hostname   
    ## Important - this is the suffix of the hostname, as each node gets "rabbitmq-#", we need to tell what's the suffix
    ## it will give each new node that enters the way to contact the other peer node and join the cluster (if using hostname)
    cluster_formation.k8s.hostname_suffix = .rabbitmq.test-rabbitmq.svc.cluster.local
    ## How often should node cleanup checks run?
    cluster_formation.node_cleanup.interval = 30
    ## Set to false if automatic removal of unknown/absent nodes
    ## is desired. This can be dangerous, see
    ##  * http://www.rabbitmq.com/cluster-formation.html#node-health-checks-and-cleanup
    ##  * https://groups.google.com/forum/#!msg/rabbitmq-users/wuOfzEywHXo/k8z_HWIkBgAJ
    cluster_formation.node_cleanup.only_log_warning = true
    cluster_partition_handling = autoheal
    ## See http://www.rabbitmq.com/ha.html#master-migration-data-locality
    queue_master_locator=min-masters
    ## See http://www.rabbitmq.com/access-control.html#loopback-users
    loopback_users.guest = false
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: rabbitmq
  namespace: rabbitmq
spec:
  serviceName: rabbitmq
  replicas: 3
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      serviceAccountName: rabbitmq
      initContainers:
      - name: config
        image: busybox
        command: ['/bin/sh', '-c', 'cp /tmp/config/rabbitmq.conf /config/rabbitmq.conf && ls -l /config/ && cp /tmp/config/enabled_plugins /etc/rabbitmq/enabled_plugins']
        volumeMounts: 
        - name: config
          mountPath: /tmp/config/
          readOnly: false
        - name: config-file
          mountPath: /config/
        - name: plugins-file
          mountPath: /etc/rabbitmq/
        resources: # QoS Guaranteed limit e request iguais
          limits:
            cpu: 1
            memory: 2Gi
          requests:
            cpu: 1
            memory: 2Gi
      containers:
      - name: rabbitmq
        image: rabbitmq:3.13.7-management
        ports:
        - containerPort: 15672
          name: discovery
        - containerPort: 5672
          name: amqp
        env:
        - name: RABBIT_POD_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.name
        - name: RABBIT_POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: RABBITMQ_NODENAME
          value: rabbit@$(RABBIT_POD_NAME).rabbitmq.$(RABBIT_POD_NAMESPACE).svc.cluster.local
        - name: RABBITMQ_USE_LONGNAME
          value: "true"
        - name: RABBITMQ_CONFIG_FILE
          value: "/config/rabbitmq"
        - name: RABBITMQ_DEFAULT_USER
          # value: "user"
          valueFrom:
            secretKeyRef:
              name: rabbit-secret
              key: RABBITMQ_DEFAULT_USER
        - name: RABBITMQ_DEFAULT_PASS
          # value: "password"
          valueFrom:
            secretKeyRef:
              name: rabbit-secret
              key: RABBITMQ_DEFAULT_PASS
        - name: K8S_HOSTNAME_SUFFIX
          value: .rabbitmq.$(RABBIT_POD_NAMESPACE).svc.cluster.local

        volumeMounts:
        - name: rabbitmq-pvc-data
          mountPath: /var/lib/rabbitmq
          readOnly: false
        - name: config-file
          mountPath: /config/
        - name: plugins-file
          mountPath: /etc/rabbitmq/
        resources: # QoS Guaranteed limit e request iguais
          limits:
            cpu: 1
            memory: 2Gi
          # requests:
          #   cpu: 0.2m
          #   memory: 128Mi

      volumes:
      - name: config-file
        emptyDir: {}
      - name: plugins-file
        emptyDir: {}
      - name: config
        configMap:
          name: rabbitmq-config
          defaultMode: 0755
  volumeClaimTemplates:
  - metadata:
      name: rabbitmq-pvc-data
    spec:
      accessModes: ["ReadWriteOnce"]
      # storageClassName: huawei-csi
      storageClassName: "standard"
      resources:
        requests:
          storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
  namespace: rabbitmq
spec:
  type: ClusterIP
  ports:
  - port: 15672
    targetPort: 15672
    name: discovery
  - port: 5672
    targetPort: 5672
    name: amqp
  selector:
    app: rabbitmq
```

2 Apply file */tmp/rabbitmq.yml*

```sh
kubectl apply -f /tmp/rabbitmq.yml
```

3 Port-forward

```sh
kubectl port-forward svc/rabbitmq 15672:15672 -n rabbitmq
```

> Access <http://localhost:15672/> User: coelho Password: coelho@Pass

![lab-kafka-and-rabbitmq](/assets/img/lab-kafka-and-rabbitmq.png)