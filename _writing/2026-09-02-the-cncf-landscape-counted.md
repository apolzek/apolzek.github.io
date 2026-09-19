---
layout: post
title: The CNCF Landscape, Counted
minute: 24
secret: true
---

The CNCF landscape has 2,417 entries. That number is the reason people call it
overwhelming, and it is also misleading: most of those entries are member
companies and products that merely run on Kubernetes. The part that is actually
governed by the foundation is smaller and countable, and it is what this post
maps.

Everything below comes from `landscape.yml` in the [cncf/landscape](https://github.com/cncf/landscape)
repository, read on 2 September 2026. Counts move, so treat them as a snapshot
rather than a constant.

## Index

- [How big it actually is](#how-big-it-actually-is)
  - [When they arrived](#when-they-arrived)
- [What the maturity levels mean](#what-the-maturity-levels-mean)
- [The projects, by category](#the-projects-by-category)
  - [App Definition and Development](#app-definition-and-development)
  - [Inference](#inference)
  - [Observability and Analysis](#observability-and-analysis)
  - [Orchestration & Management](#orchestration--management)
  - [Platform](#platform)
  - [Provisioning](#provisioning)
  - [Runtime](#runtime)
  - [Serverless](#serverless)
  - [Wasm](#wasm)
- [How the foundation actually works](#how-the-foundation-actually-works)
- [Getting in, if you are new here](#getting-in-if-you-are-new-here)
- [What I would actually pick](#what-i-would-actually-pick)

## How big it actually is

| What | Count |
|---|---:|
| Entries in the landscape | 2,417 |
| Of those, CNCF projects, active | 227 |
| Graduated | 38 |
| Incubating | 38 |
| Sandbox | 151 |
| Archived | 28 |

The gap between 2,417 and 227 is the first thing worth internalising. Being on
the landscape means someone filled in a YAML entry. Being a CNCF project means
the Technical Oversight Committee voted you in and you accepted the obligations
that come with it.

### When they arrived

Acceptance year of every project the foundation has ever taken in, archived ones included.

| Year | Accepted | Running total |
|---|---:|---:|
| 2016 | 4 | 4 |
| 2017 | 10 | 14 |
| 2018 | 18 | 32 |
| 2019 | 12 | 44 |
| 2020 | 34 | 78 |
| 2021 | 42 | 120 |
| 2022 | 35 | 155 |
| 2023 | 27 | 182 |
| 2024 | 28 | 210 |
| 2025 | 34 | 244 |
| 2026 | 11 | 255 |

2020 and 2021 are the spike, and they are the reason the landscape image
became a meme. The intake has since settled around thirty a year. The 2026 row
is partial, since the year is not over.

## What the maturity levels mean

There are three active levels and one terminal state. They are not a quality
ranking of the code. They describe how much external evidence a project has
accumulated, and how much the foundation is willing to stake on it.

| Level | What it says | What it demands |
|---|---|---|
| **Sandbox** | Early. Interesting enough to give a neutral home. | A TOC vote, a real open source licence, a code of conduct, and neutral ownership of the trademark and assets. |
| **Incubating** | Used in production by people who did not write it. | Named adopters, healthy and growing contribution from more than one employer, documented governance, a security disclosure process, and due diligence by the TOC. |
| **Graduated** | Safe to standardise on. | Committers from multiple organisations, an independent security audit, the OpenSSF best practices badge, defined governance and a supermajority TOC vote. |
| **Archived** | No longer maintained or no longer needed. | Nothing. The code stays readable, the project stops receiving foundation services. |

The levels are gates, not a schedule, and the data shows how slow the real
pace is. Median time from acceptance to incubating is **1.4 years** across
79 projects. From incubating to graduated, **2.2 years** across 38.
End to end, the median project takes **3.0 years** to graduate, and the
slowest took 7.8.

This is the practical reading for someone choosing a tool. Sandbox means the
foundation finds the idea worth hosting, not that anyone runs it at scale.
Incubating means other companies already depend on it. Graduated means the
project survived an audit and does not belong to a single vendor. The 28
archived projects are the honest part of the record: OpenTracing, Service Mesh
Interface, rkt and others were all once the obvious answer.

## The projects, by category

Every active CNCF project, grouped the way the landscape groups them. The
level column is the foundation's, the repository is the one the landscape
points at, and the last column is what the thing is for.

### App Definition and Development

**Application Definition & Image Build**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Artifact Hub | Incubating | [artifacthub/hub](https://github.com/artifacthub/hub) | Finds and publishes Helm charts, operators and other artifacts scattered across repos. |
| Backstage | Incubating | [backstage/backstage](https://github.com/backstage/backstage) | Developer portal that puts services, docs and ownership behind one catalogue. |
| Buildpacks | Graduated | [buildpacks/pack](https://github.com/buildpacks/pack) | Builds images from source, so nobody has to write a Dockerfile. |
| Carvel | Sandbox | [carvel-dev/ytt](https://github.com/carvel-dev/ytt) | Small composable tools for templating, packaging and deploying manifests. |
| Dalec | Sandbox | [project-dalec/dalec](https://github.com/project-dalec/dalec) | Declarative format for building system packages and containers from them. |
| Dapr | Graduated | [dapr/dapr](https://github.com/dapr/dapr) | Building blocks for state, pub/sub and service calls, so apps stop embedding them. |
| Devfile | Sandbox | [devfile/api](https://github.com/devfile/api) | Open standard for a containerised dev environment, so tools agree on it. |
| DevSpace | Sandbox | [devspace-sh/devspace](https://github.com/devspace-sh/devspace) | Inner development loop against a cluster, syncing code into running pods. |
| Helm | Graduated | [helm/helm](https://github.com/helm/helm) | Packages and versions manifests so a release can be installed, upgraded and rolled back. |
| ko | Sandbox | [ko-build/ko](https://github.com/ko-build/ko) | Builds and pushes Go container images without a Dockerfile. |
| Konveyor | Sandbox | [konveyor/operator](https://github.com/konveyor/operator) | Assists migrating and modernising legacy applications toward Kubernetes. |
| KubeVela | Incubating | [kubevela/kubevela](https://github.com/kubevela/kubevela) | Delivers applications from a declarative spec, hiding cluster detail from developers. |
| KubeVirt | Incubating | [kubevirt/kubevirt](https://github.com/kubevirt/kubevirt) | Runs virtual machines as Kubernetes workloads, next to containers. |
| KUDO | Sandbox | [kudobuilder/kudo](https://github.com/kudobuilder/kudo) | Declarative toolkit for writing operators without writing Go. |
| Microcks | Incubating | [microcks/microcks](https://github.com/microcks/microcks) | Mocks and tests APIs from their own contracts. |
| ModelPack | Sandbox | [modelpack/model-spec](https://github.com/modelpack/model-spec) | Standard for packaging and distributing AI model artifacts as OCI content. |
| Open Workflow Specification | Sandbox | [open-workflow-specification/specification](https://github.com/open-workflow-specification/specification) | Vendor-neutral DSL for describing workflows across runtimes. |
| Operator Framework | Incubating | [operator-framework/operator-sdk](https://github.com/operator-framework/operator-sdk) | SDK and lifecycle manager for building and shipping operators. |
| ORAS | Sandbox | [oras-project/oras](https://github.com/oras-project/oras) | Pushes and pulls arbitrary artifacts through an OCI registry. |
| Podman Desktop | Sandbox | [podman-desktop/podman-desktop](https://github.com/podman-desktop/podman-desktop) | Desktop interface for containers and clusters, with no daemon. |
| Porter | Sandbox | [getporter/porter](https://github.com/getporter/porter) | Bundles an application with its tooling and config so it installs anywhere. |
| Radius | Sandbox | [radius-project/radius](https://github.com/radius-project/radius) | Models an application and its dependencies across clouds, not just its containers. |
| Score | Sandbox | [score-spec/spec](https://github.com/score-spec/spec) | Workload spec that stays the same while the target platform changes. |
| Shipwright | Sandbox | [shipwright-io/build](https://github.com/shipwright-io/build) | Runs image builds inside the cluster, with pluggable build strategies. |
| Stacker | Sandbox | [project-stacker/stacker](https://github.com/project-stacker/stacker) | Builds OCI images and SBOMs from a declarative file, with no daemon. |
| Telepresence | Sandbox | [telepresenceio/telepresence](https://github.com/telepresenceio/telepresence) | Runs one service locally while it talks to the rest of a remote cluster. |
| Visual Studio Code Kubernetes Tools | Sandbox | [vscode-kubernetes-tools/vscode-kubernetes-tools](https://github.com/vscode-kubernetes-tools/vscode-kubernetes-tools) | Browses, edits and debugs cluster resources from the editor. |
| xRegistry | Sandbox | [xregistry/server](https://github.com/xregistry/server) | Common model and API for registries that hold metadata about resources. |

**Continuous Integration & Delivery**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Argo | Graduated | [argoproj/argo-cd](https://github.com/argoproj/argo-cd) | GitOps delivery, workflows, events and progressive rollouts, all as controllers. |
| Flux | Graduated | [fluxcd/flux2](https://github.com/fluxcd/flux2) | Keeps a cluster reconciled with what a Git repository declares. |
| Kube-burner | Sandbox | [kube-burner/kube-burner](https://github.com/kube-burner/kube-burner) | Drives load at a cluster to measure how it behaves at scale. |
| OpenChoreo | Sandbox | [openchoreo/openchoreo](https://github.com/openchoreo/openchoreo) | Internal developer platform with higher level abstractions over Kubernetes. |
| OpenGitOps | Sandbox | [open-gitops/project](https://github.com/open-gitops/project) | Defines what GitOps actually means, so tools can claim it honestly. |
| OpenKruise | Incubating | [openkruise/kruise](https://github.com/openkruise/kruise) | Advanced workload controllers for rollouts the built-in ones do not cover. |
| PipeCD | Sandbox | [pipe-cd/pipecd](https://github.com/pipe-cd/pipecd) | GitOps delivery across several kinds of target under one pipeline model. |
| Tekton | Incubating | [tektoncd/pipeline](https://github.com/tektoncd/pipeline) | Pipelines as Kubernetes resources, so CI runs where the workloads run. |
| werf | Sandbox | [werf/werf](https://github.com/werf/werf) | Ties Git history to build and deploy, so the cluster matches a commit. |

**Database**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| CloudNativePG | Sandbox | [cloudnative-pg/cloudnative-pg](https://github.com/cloudnative-pg/cloudnative-pg) | Runs, backs up and fails over PostgreSQL inside Kubernetes. |
| OpenEverest | Sandbox | [openeverest/openeverest](https://github.com/openeverest/openeverest) | Provisions and operates several database engines through one control plane. |
| openGemini | Sandbox | [openGemini/openGemini](https://github.com/openGemini/openGemini) | Distributed time series database for high-cardinality metrics. |
| SchemaHero | Sandbox | [schemahero/schemahero](https://github.com/schemahero/schemahero) | Applies database schema changes declaratively, the way manifests are applied. |
| TiKV | Graduated | [tikv/tikv](https://github.com/tikv/tikv) | Distributed transactional key-value store for data that outgrew one machine. |
| Vitess | Graduated | [vitessio/vitess](https://github.com/vitessio/vitess) | Shards MySQL so it grows past one server without rewriting the application. |

**Streaming & Messaging**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Apicurio Registry | Sandbox | [Apicurio/apicurio-registry](https://github.com/Apicurio/apicurio-registry) | Stores and versions schemas so producers and consumers keep agreeing. |
| CloudEvents | Graduated | [cloudevents/spec](https://github.com/cloudevents/spec) | Common envelope for events, so different systems can read each other's. |
| Drasi | Sandbox | [drasi-project/drasi-platform](https://github.com/drasi-project/drasi-platform) | Detects and reacts to changes in data without anyone polling for them. |
| NATS | Incubating | [nats-io/nats-server](https://github.com/nats-io/nats-server) | Light messaging and streaming for services, edge devices and IoT. |
| Strimzi | Incubating | [strimzi/strimzi-kafka-operator](https://github.com/strimzi/strimzi-kafka-operator) | Runs and operates Kafka clusters on Kubernetes. |
| Tremor | Sandbox | [tremor-rs/tremor-runtime](https://github.com/tremor-rs/tremor-runtime) | Event processing for high-volume unstructured data at the edge of a system. |

### Inference

**Framework**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| KAITO | Sandbox | [kaito-project/kaito](https://github.com/kaito-project/kaito) | Runs LLM inference, fine-tuning and RAG workloads on Kubernetes. |
| KServe | Incubating | [kserve/kserve](https://github.com/kserve/kserve) | Serves models behind one interface, with autoscaling and canaries. |
| llm-d | Sandbox | [llm-d/llm-d](https://github.com/llm-d/llm-d) | Distributed LLM serving on Kubernetes, built on vLLM. |

### Observability and Analysis

**Chaos Engineering**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Chaos Mesh | Incubating | [chaos-mesh/chaos-mesh](https://github.com/chaos-mesh/chaos-mesh) | Injects failures into a cluster to see whether it really recovers. |
| Chaosblade | Sandbox | [chaosblade-io/chaosblade](https://github.com/chaosblade-io/chaosblade) | Fault injection across hosts, containers and cloud services. |
| Krkn | Sandbox | [krkn-chaos/krkn](https://github.com/krkn-chaos/krkn) | Chaos scenarios aimed at finding the bottleneck before production does. |
| Litmus | Incubating | [litmuschaos/litmus](https://github.com/litmuschaos/litmus) | Chaos experiments as Kubernetes resources, with results you can review. |

**Continuous Optimization**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| OpenCost | Incubating | [opencost/opencost](https://github.com/opencost/opencost) | Attributes cluster spend to namespaces, workloads and teams. |

**Feature Flagging**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| OpenFeature | Incubating | [open-feature/spec](https://github.com/open-feature/spec) | Vendor-neutral API for feature flags, so the provider can change later. |

**Observability**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Cortex | Incubating | [cortexproject/cortex](https://github.com/cortexproject/cortex) | Horizontally scalable, multi-tenant long term storage for Prometheus. |
| Fluentd | Graduated | [fluent/fluentd](https://github.com/fluent/fluentd) | Collects, parses and routes logs from many sources to many destinations. |
| Headlamp | Sandbox | [kubernetes-sigs/headlamp](https://github.com/kubernetes-sigs/headlamp) | Web interface for browsing and operating clusters, extensible with plugins. |
| HolmesGPT | Sandbox | [HolmesGPT/holmesgpt](https://github.com/HolmesGPT/holmesgpt) | AI agent that investigates alerts and explains what broke. |
| Inspektor Gadget | Sandbox | [inspektor-gadget/inspektor-gadget](https://github.com/inspektor-gadget/inspektor-gadget) | eBPF tools for seeing what a pod is actually doing. |
| Jaeger | Graduated | [jaegertracing/jaeger](https://github.com/jaegertracing/jaeger) | Stores and queries distributed traces to find where the latency went. |
| K8sGPT | Sandbox | [k8sgpt-ai/k8sgpt](https://github.com/k8sgpt-ai/k8sgpt) | Scans a cluster and explains what is broken in plain language. |
| Kepler | Sandbox | [sustainable-computing-io/kepler](https://github.com/sustainable-computing-io/kepler) | Estimates energy use per pod from eBPF and hardware counters. |
| Kuberhealthy | Sandbox | [kuberhealthy/kuberhealthy](https://github.com/kuberhealthy/kuberhealthy) | Runs synthetic checks as pods and reports them as metrics. |
| Logging Operator (Kube Logging) | Sandbox | [kube-logging/logging-operator](https://github.com/kube-logging/logging-operator) | Configures log collection and routing declaratively. |
| OpenTelemetry | Graduated | [open-telemetry/community](https://github.com/open-telemetry/community) | One SDK and wire format for traces, metrics and logs. |
| Perses | Sandbox | [perses/perses](https://github.com/perses/perses) | Dashboards as versionable resources instead of clicked-together JSON. |
| Pixie | Sandbox | [pixie-io/pixie](https://github.com/pixie-io/pixie) | Instruments a cluster with eBPF, with no code changes. |
| Prometheus | Graduated | [prometheus/prometheus](https://github.com/prometheus/prometheus) | Scrapes and stores metrics, with a query language and alerting. |
| Thanos | Incubating | [thanos-io/thanos](https://github.com/thanos-io/thanos) | Gives Prometheus a global view, long retention and deduplication. |
| Trickster | Sandbox | [trickstercache/trickster](https://github.com/trickstercache/trickster) | Caches time series queries so dashboards stop hammering the database. |

### Orchestration & Management

**API Gateway**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Easegress | Sandbox | [easegress-io/easegress](https://github.com/easegress-io/easegress) | Traffic orchestration and gateway with a pipeline model. |
| Emissary-Ingress | Incubating | [emissary-ingress/emissary](https://github.com/emissary-ingress/emissary) | Kubernetes-native ingress and API gateway built on Envoy. |
| Higress | Sandbox | [higress-group/higress](https://github.com/higress-group/higress) | Gateway for ingress, microservice and LLM traffic in one place. |
| Kgateway | Sandbox | [kgateway-dev/kgateway](https://github.com/kgateway-dev/kgateway) | Envoy gateway that implements the Kubernetes Gateway API. |
| Kuadrant | Sandbox | [kuadrant/kuadrant-operator](https://github.com/kuadrant/kuadrant-operator) | Adds auth and rate limiting policy on top of Gateway API. |

**Coordination & Service Discovery**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| CoreDNS | Graduated | [coredns/coredns](https://github.com/coredns/coredns) | DNS server that resolves service names inside the cluster. |
| etcd | Graduated | [etcd-io/etcd](https://github.com/etcd-io/etcd) | Consistent key-value store that holds the cluster's state. |
| k8gb | Incubating | [k8gb-io/k8gb](https://github.com/k8gb-io/k8gb) | DNS-based global load balancing across clusters, with no central appliance. |
| Oxia | Sandbox | [oxia-db/oxia](https://github.com/oxia-db/oxia) | Scalable metadata store and coordination service. |

**Remote Procedure Call**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Connect RPC | Sandbox | [connectrpc/connect-go](https://github.com/connectrpc/connect-go) | gRPC-compatible APIs that also work straight from a browser. |
| gRPC | Incubating | [grpc/grpc](https://github.com/grpc/grpc) | Typed, generated RPC over HTTP/2 between services. |

**Scheduling & Orchestration**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Agones | Sandbox | [agones-dev/agones](https://github.com/agones-dev/agones) | Runs and scales dedicated game servers as Kubernetes workloads. |
| Armada | Sandbox | [armadaproject/armada](https://github.com/armadaproject/armada) | Queues and schedules batch jobs across many clusters. |
| Capsule | Sandbox | [projectcapsule/capsule](https://github.com/projectcapsule/capsule) | Multi-tenancy through policy, so teams can share one cluster safely. |
| Clusternet | Sandbox | [clusternet/clusternet](https://github.com/clusternet/clusternet) | Manages and delivers workloads to many clusters from one place. |
| Clusterpedia | Sandbox | [clusterpedia-io/clusterpedia](https://github.com/clusterpedia-io/clusterpedia) | Searches resources across many clusters at once. |
| CoHDI | Sandbox | [CoHDI](https://github.com/CoHDI) | Attaches disaggregated hardware devices to nodes on demand. |
| Cozystack | Sandbox | [cozystack/cozystack](https://github.com/cozystack/cozystack) | Framework for building a private cloud on your own hardware. |
| Crossplane | Graduated | [crossplane/crossplane](https://github.com/crossplane/crossplane) | Provisions cloud infrastructure through Kubernetes APIs. |
| Eraser | Sandbox | [eraser-dev/eraser](https://github.com/eraser-dev/eraser) | Removes unused and vulnerable images from cluster nodes. |
| Fluid | Incubating | [fluid-cloudnative/fluid](https://github.com/fluid-cloudnative/fluid) | Caches and abstracts remote data so compute reads it as if local. |
| HAMi | Incubating | [Project-HAMi/HAMi](https://github.com/Project-HAMi/HAMi) | Shares and virtualises GPUs and other accelerators between pods. |
| k0s | Sandbox | [k0sproject/k0s](https://github.com/k0sproject/k0s) | Kubernetes distribution that ships as a single binary. |
| KAI Scheduler | Sandbox | [kai-scheduler/KAI-Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) | Schedules GPU workloads with quota and fair sharing. |
| Karmada | Incubating | [karmada-io/karmada](https://github.com/karmada-io/karmada) | Propagates and schedules workloads across many clusters. |
| kcp | Sandbox | [kcp-dev/kcp](https://github.com/kcp-dev/kcp) | Kubernetes-style control plane serving many logical clusters. |
| KEDA | Graduated | [kedacore/keda](https://github.com/kedacore/keda) | Scales workloads from zero based on external event sources. |
| Knative | Graduated | [knative/serving](https://github.com/knative/serving) | Serverless layer with request-driven autoscaling and eventing. |
| Koordinator | Sandbox | [koordinator-sh/koordinator](https://github.com/koordinator-sh/koordinator) | Co-locates latency-sensitive and batch workloads on the same nodes. |
| kube-rs | Sandbox | [kube-rs/kube](https://github.com/kube-rs/kube) | Rust client and controller runtime for building against Kubernetes. |
| KubeFleet | Sandbox | [kubefleet-dev/kubefleet](https://github.com/kubefleet-dev/kubefleet) | Manages where applications land across a fleet of clusters. |
| Kubeflow | Graduated | [kubeflow/kubeflow](https://github.com/kubeflow/kubeflow) | Toolkit for training, tuning and serving models on Kubernetes. |
| Kubernetes | Graduated | [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes) | Schedules containers and reconciles declared state across a cluster. |
| KubeSlice | Sandbox | [kubeslice/kubeslice](https://github.com/kubeslice/kubeslice) | Connects namespaces across clusters into one network slice. |
| KubeStellar | Sandbox | [kubestellar/kubestellar](https://github.com/kubestellar/kubestellar) | Distributes configuration to many clusters from one control plane. |
| Kured | Sandbox | [kubereboot/kured](https://github.com/kubereboot/kured) | Reboots nodes safely when a package update asks for it. |
| Open Cluster Management | Sandbox | [open-cluster-management-io/ocm](https://github.com/open-cluster-management-io/ocm) | Hub-and-spoke standard for managing many clusters. |
| OpenFunction | Sandbox | [OpenFunction/OpenFunction](https://github.com/OpenFunction/OpenFunction) | Function-as-a-service built on Kubernetes. |
| Serverless Devs | Sandbox | [serverless-devs/serverless-devs](https://github.com/serverless-devs/serverless-devs) | Tooling to develop and deploy serverless apps across clouds. |
| Volcano | Incubating | [volcano-sh/volcano](https://github.com/volcano-sh/volcano) | Batch scheduler for AI and HPC jobs that need gang scheduling. |
| wasmCloud | Incubating | [wasmCloud/wasmCloud](https://github.com/wasmCloud/wasmCloud) | Runs WebAssembly components distributed across many hosts. |

**Service Mesh**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Aeraki Mesh | Sandbox | [aeraki-mesh/aeraki](https://github.com/aeraki-mesh/aeraki) | Manages layer 7 protocols a mesh does not understand natively. |
| Istio | Graduated | [istio/istio](https://github.com/istio/istio) | Mesh for traffic control, mTLS and telemetry between services. |
| Kmesh | Sandbox | [kmesh-net/kmesh](https://github.com/kmesh-net/kmesh) | Mesh data plane in eBPF, without a sidecar per pod. |
| Kuma | Sandbox | [kumahq/kuma](https://github.com/kumahq/kuma) | Envoy-based mesh that spans Kubernetes and plain VMs. |
| Linkerd | Graduated | [linkerd/linkerd2](https://github.com/linkerd/linkerd2) | Lightweight mesh focused on mTLS, retries and golden metrics. |
| Sermant | Sandbox | [sermant-io/Sermant](https://github.com/sermant-io/Sermant) | Proxyless mesh for Java services, through a Java agent. |

**Service Proxy**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| BFE | Sandbox | [bfenetworks/bfe](https://github.com/bfenetworks/bfe) | Layer 7 load balancer with its own routing language. |
| Contour | Incubating | [projectcontour/contour](https://github.com/projectcontour/contour) | Ingress controller built on Envoy. |
| Envoy | Graduated | [envoyproxy/envoy](https://github.com/envoyproxy/envoy) | Programmable L4/L7 proxy, the data plane most meshes are built on. |
| LoxiLB | Sandbox | [loxilb-io/loxilb](https://github.com/loxilb-io/loxilb) | eBPF load balancer for Kubernetes, edge and telco workloads. |
| MetalLB | Sandbox | [metallb/metallb](https://github.com/metallb/metallb) | Gives services real IPs on bare metal, where no cloud load balancer exists. |

### Platform

**Certified Kubernetes - Distribution**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Flatcar Container Linux | Incubating | [flatcar/Flatcar](https://github.com/flatcar/Flatcar) | Immutable Linux that runs containers and updates itself. |
| k3s | Sandbox | [k3s-io/k3s](https://github.com/k3s-io/k3s) | Small Kubernetes distribution for edge and constrained machines. |

**Certified Kubernetes - Installer**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| KubeClipper | Sandbox | [kubeclipper/kubeclipper](https://github.com/kubeclipper/kubeclipper) | Installs and manages cluster lifecycle with a light control plane. |

### Provisioning

**Automation & Configuration**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Akri | Sandbox | [project-akri/akri](https://github.com/project-akri/akri) | Exposes edge devices such as cameras and sensors as cluster resources. |
| Atlantis | Sandbox | [runatlantis/atlantis](https://github.com/runatlantis/atlantis) | Runs Terraform plan and apply from pull requests. |
| Cadence Workflow | Sandbox | [cadence-workflow/cadence](https://github.com/cadence-workflow/cadence) | Runs long-lived stateful workflows as code, surviving process failure. |
| CDK for Kubernetes (CDK8s) | Sandbox | [cdk8s-team/cdk8s](https://github.com/cdk8s-team/cdk8s) | Generates manifests from a real programming language. |
| Cloud Custodian | Incubating | [cloud-custodian/cloud-custodian](https://github.com/cloud-custodian/cloud-custodian) | Rules that find and fix non-compliant cloud resources. |
| kagent | Sandbox | [kagent-dev/kagent](https://github.com/kagent-dev/kagent) | Runs AI agents that operate Kubernetes for platform teams. |
| Kairos | Sandbox | [kairos-io/kairos](https://github.com/kairos-io/kairos) | Turns a Linux distribution into an immutable, edge-ready cluster node. |
| kbind | Sandbox | [kbind-dev/kbind](https://github.com/kbind-dev/kbind) | Binds services between provider and consumer clusters. |
| KCL | Sandbox | [kcl-lang/kcl](https://github.com/kcl-lang/kcl) | Constraint language for configuration, with validation built in. |
| KitOps | Sandbox | [kitops-ml/kitops](https://github.com/kitops-ml/kitops) | Packages models, datasets and code together as OCI artifacts. |
| kpt | Sandbox | [kptdev/kpt](https://github.com/kptdev/kpt) | Edits and updates Kubernetes configuration as data, not as templates. |
| Kubean | Sandbox | [kubean-io/kubean](https://github.com/kubean-io/kubean) | Cluster lifecycle management built on top of kubespray. |
| KubeEdge | Graduated | [kubeedge/kubeedge](https://github.com/kubeedge/kubeedge) | Extends Kubernetes to edge nodes that lose their link. |
| KusionStack | Sandbox | [KusionStack/kusion](https://github.com/KusionStack/kusion) | Platform orchestrator for building an internal developer platform. |
| Meshery | Sandbox | [meshery/meshery](https://github.com/meshery/meshery) | Manages, configures and benchmarks cloud-native infrastructure. |
| metal3-io | Incubating | [metal3-io/baremetal-operator](https://github.com/metal3-io/baremetal-operator) | Provisions bare metal hosts through Kubernetes APIs. |
| NMstate | Sandbox | [nmstate/nmstate](https://github.com/nmstate/nmstate) | Declarative host network configuration. |
| OpenTofu | Sandbox | [opentofu/opentofu](https://github.com/opentofu/opentofu) | Infrastructure as code, the community fork of Terraform. |
| OpenYurt | Incubating | [openyurtio/openyurt](https://github.com/openyurtio/openyurt) | Extends upstream Kubernetes to edge sites and keeps them autonomous. |
| Runme Notebooks | Sandbox | [runmedev/runme](https://github.com/runmedev/runme) | Makes runbooks written in Markdown actually runnable. |
| Tinkerbell | Sandbox | [tinkerbell/tinkerbell](https://github.com/tinkerbell/tinkerbell) | Bare metal provisioning with network and ISO boot. |

**Container Registry**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Distribution | Sandbox | [distribution/distribution](https://github.com/distribution/distribution) | Reference registry implementation for storing OCI content. |
| Dragonfly | Graduated | [dragonflyoss/dragonfly](https://github.com/dragonflyoss/dragonfly) | Distributes images peer to peer so pulls do not melt the registry. |
| Harbor | Graduated | [goharbor/harbor](https://github.com/goharbor/harbor) | Registry with policy, scanning, signing and replication. |
| zot | Sandbox | [project-zot/zot](https://github.com/project-zot/zot) | Small OCI-native registry for images and other artifacts. |

**Key Management**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Athenz | Sandbox | [AthenZ/athenz](https://github.com/AthenZ/athenz) | Service authentication and fine-grained authorisation with X.509. |
| SPIFFE | Graduated | [spiffe/spiffe](https://github.com/spiffe/spiffe) | Standard for giving a workload a verifiable identity. |
| SPIRE | Graduated | [spiffe/spire](https://github.com/spiffe/spire) | The implementation that issues and rotates those identities. |

**Security & Compliance**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Bank-Vaults | Sandbox | [bank-vaults/bank-vaults](https://github.com/bank-vaults/bank-vaults) | Operates HashiCorp Vault and gets secrets into pods. |
| bpfman | Sandbox | [bpfman/bpfman](https://github.com/bpfman/bpfman) | Manages the lifecycle of eBPF programs on a node. |
| Cartography | Sandbox | [cartography-cncf/cartography](https://github.com/cartography-cncf/cartography) | Maps infrastructure assets and their relationships into a graph. |
| Cedar | Sandbox | [cedar-policy/cedar](https://github.com/cedar-policy/cedar) | Policy language for fine-grained authorisation decisions. |
| cert-manager | Graduated | [cert-manager/cert-manager](https://github.com/cert-manager/cert-manager) | Issues and renews TLS certificates automatically. |
| Confidential Containers | Incubating | [confidential-containers/confidential-containers](https://github.com/confidential-containers/confidential-containers) | Runs pods inside hardware enclaves. |
| ContainerSSH | Sandbox | [containerssh/containerssh](https://github.com/containerssh/containerssh) | Gives each SSH session its own throwaway container. |
| Copa | Sandbox | [project-copacetic/copacetic](https://github.com/project-copacetic/copacetic) | Patches vulnerabilities directly in a container image. |
| Dex | Sandbox | [dexidp/dex](https://github.com/dexidp/dex) | OIDC provider that federates to identity sources you already have. |
| external-secrets | Sandbox | [external-secrets/external-secrets](https://github.com/external-secrets/external-secrets) | Syncs secrets from cloud secret managers into the cluster. |
| Falco | Graduated | [falcosecurity/falco](https://github.com/falcosecurity/falco) | Detects suspicious runtime behaviour from kernel events. |
| in-toto | Graduated | [in-toto/in-toto](https://github.com/in-toto/in-toto) | Proves each step of a supply chain happened as intended. |
| Keycloak | Incubating | [keycloak/keycloak](https://github.com/keycloak/keycloak) | Identity and access management, single sign-on for applications. |
| Keylime | Sandbox | [keylime/keylime](https://github.com/keylime/keylime) | Remote attestation that a node booted the software it should have. |
| KubeArmor | Sandbox | [kubearmor/kubearmor](https://github.com/kubearmor/kubearmor) | Restricts what a workload may do at runtime, enforced by the kernel. |
| Kubescape | Incubating | [kubescape/kubescape](https://github.com/kubescape/kubescape) | Scans clusters and manifests against security frameworks. |
| Kubewarden | Sandbox | [kubewarden/kubewarden-controller](https://github.com/kubewarden/kubewarden-controller) | Admission policies written and shipped as WebAssembly. |
| Kyverno | Graduated | [kyverno/kyverno](https://github.com/kyverno/kyverno) | Admission policies written as Kubernetes resources, with no new language. |
| Notary Project | Incubating | [notaryproject/notation](https://github.com/notaryproject/notation) | Signs and verifies container images and other artifacts. |
| OAuth2 Proxy | Sandbox | [oauth2-proxy/oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy) | Puts authentication in front of an application that has none. |
| Open Policy Agent (OPA) | Graduated | [open-policy-agent/opa](https://github.com/open-policy-agent/opa) | General policy engine that answers allow or deny. |
| Open Policy Containers | Sandbox | [opcr-io/policy](https://github.com/opcr-io/policy) | Ships OPA policies as versioned OCI images. |
| OpenFGA | Incubating | [openfga/openfga](https://github.com/openfga/openfga) | Relationship-based authorisation service, in the Zanzibar style. |
| OSCAL-COMPASS | Sandbox | [oscal-compass/compliance-trestle](https://github.com/oscal-compass/compliance-trestle) | Turns compliance controls into machine-readable artifacts. |
| Paralus | Sandbox | [paralus/paralus](https://github.com/paralus/paralus) | Controlled and audited user access to clusters. |
| Parsec | Sandbox | [parallaxsecond/parsec](https://github.com/parallaxsecond/parsec) | Common API for hardware-backed security operations. |
| Ratify | Sandbox | [ratify-project/ratify](https://github.com/ratify-project/ratify) | Verifies image signatures and metadata at admission time. |
| SlimToolkit | Sandbox | [slimtoolkit/slim](https://github.com/slimtoolkit/slim) | Shrinks an image down to what actually runs. |
| SOPS | Sandbox | [getsops/sops](https://github.com/getsops/sops) | Encrypts values inside config files so they can live in Git. |
| The Update Framework (TUF) | Graduated | [theupdateframework/python-tuf](https://github.com/theupdateframework/python-tuf) | Protects a software update system from compromise. |
| Tokenetes | Sandbox | [tokenetes/tokenetes](https://github.com/tokenetes/tokenetes) | Transaction tokens that carry context along a call chain. |

### Runtime

**Cloud Native Network**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Antrea | Sandbox | [antrea-io/antrea](https://github.com/antrea-io/antrea) | CNI built on Open vSwitch, with policy and traffic visibility. |
| Cilium | Graduated | [cilium/cilium](https://github.com/cilium/cilium) | eBPF networking, policy and observability for the cluster. |
| Container Network Interface (CNI) | Incubating | [containernetworking/cni](https://github.com/containernetworking/cni) | The plugin contract every cluster network implements. |
| Kube-OVN | Sandbox | [kubeovn/kube-ovn](https://github.com/kubeovn/kube-ovn) | Enterprise networking features on top of OVN. |
| kube-vip | Sandbox | [kube-vip/kube-vip](https://github.com/kube-vip/kube-vip) | Virtual IP and load balancing for the control plane and for services. |
| Network Service Mesh | Sandbox | [networkservicemesh/api](https://github.com/networkservicemesh/api) | Connects workloads to layer 3 services across clouds. |
| OVN-Kubernetes | Sandbox | [ovn-kubernetes/ovn-kubernetes](https://github.com/ovn-kubernetes/ovn-kubernetes) | OVN-based networking for large clusters. |
| Spiderpool | Sandbox | [spidernet-io/spiderpool](https://github.com/spidernet-io/spiderpool) | Underlay and RDMA networking for bare metal and VMs. |
| Submariner | Sandbox | [submariner-io/submariner](https://github.com/submariner-io/submariner) | Connects pods and services living in separate clusters. |

**Cloud Native Storage**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Carina | Sandbox | [carina-io/carina](https://github.com/carina-io/carina) | Local storage whose lifecycle the cluster handles for you. |
| CubeFS | Graduated | [cubeFS/cubefs](https://github.com/cubeFS/cubefs) | Distributed file and object store for containerised workloads. |
| Curvine | Sandbox | [CurvineIO/curvine](https://github.com/CurvineIO/curvine) | Multi-tier cache in front of slow storage for data-heavy jobs. |
| HwameiStor | Sandbox | [hwameistor/hwameistor](https://github.com/hwameistor/hwameistor) | High-availability local storage for stateful workloads. |
| K8up | Sandbox | [k8up-io/k8up](https://github.com/k8up-io/k8up) | Backs up volumes and databases on a schedule. |
| Kanister | Sandbox | [kanisterio/kanister](https://github.com/kanisterio/kanister) | Application-aware backup and restore workflows. |
| Longhorn | Incubating | [longhorn/longhorn](https://github.com/longhorn/longhorn) | Replicated block storage built out of the nodes you already have. |
| OpenEBS | Sandbox | [openebs/openebs](https://github.com/openebs/openebs) | Container-attached storage with a choice of engines. |
| Piraeus Datastore | Sandbox | [piraeusdatastore/piraeus-operator](https://github.com/piraeusdatastore/piraeus-operator) | Runs LINSTOR replicated block storage inside Kubernetes. |
| Rook | Graduated | [rook/rook](https://github.com/rook/rook) | Operator that runs Ceph as a Kubernetes-managed storage cluster. |
| Velero | Sandbox | [velero-io/velero](https://github.com/velero-io/velero) | Backs up and restores cluster resources and their volumes. |

**Container Runtime**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| bootc | Sandbox | [bootc-dev/bootc](https://github.com/bootc-dev/bootc) | Ships and updates an operating system as an OCI image. |
| composefs | Sandbox | [containers/composefs](https://github.com/containers/composefs) | Read-only, verifiable filesystem trees shared between images. |
| containerd | Graduated | [containerd/containerd](https://github.com/containerd/containerd) | Core runtime that pulls images and runs containers. |
| CRI-O | Graduated | [cri-o/cri-o](https://github.com/cri-o/cri-o) | Minimal runtime that implements only what Kubernetes asks for. |
| Hyperlight | Sandbox | [hyperlight-dev/hyperlight](https://github.com/hyperlight-dev/hyperlight) | Runs functions in micro VMs with very low startup cost. |
| Inclavare Containers | Sandbox | [inclavare-containers/inclavare-containers](https://github.com/inclavare-containers/inclavare-containers) | Confidential containers that run inside enclaves. |
| Interlink | Sandbox | [interlink-hq/interLink](https://github.com/interlink-hq/interLink) | Runs pods on remote resources such as HPC batch systems. |
| Kuasar | Sandbox | [kuasar-io/kuasar](https://github.com/kuasar-io/kuasar) | One interface over several kinds of sandbox runtime. |
| Lima | Incubating | [lima-vm/lima](https://github.com/lima-vm/lima) | Linux VMs on macOS for running containerd locally. |
| Podman Container Tools | Sandbox | [podman-container-tools/podman](https://github.com/podman-container-tools/podman) | Daemonless container lifecycle, rootless by default. |
| urunc | Sandbox | [urunc-dev/urunc](https://github.com/urunc-dev/urunc) | Runs unikernels as if they were containers. |
| Virtual Kubelet | Sandbox | [virtual-kubelet/virtual-kubelet](https://github.com/virtual-kubelet/virtual-kubelet) | Presents an external service as a node, so pods run somewhere else. |
| WasmEdge Runtime | Sandbox | [WasmEdge/WasmEdge](https://github.com/WasmEdge/WasmEdge) | WebAssembly runtime for cloud native and edge workloads. |
| youki | Sandbox | [youki-dev/youki](https://github.com/youki-dev/youki) | OCI container runtime written in Rust. |

### Serverless

**Installable Platform**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| KubeElasti | Sandbox | [KubeElasti/KubeElasti](https://github.com/KubeElasti/KubeElasti) | Scales workloads to zero and back without dropping requests. |
| SlimFaaS | Sandbox | [SlimPlanet/SlimFaas](https://github.com/SlimPlanet/SlimFaas) | Minimal function-as-a-service for Kubernetes. |

### Wasm

**Application Frameworks**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| Spin | Sandbox | [spinframework/spin](https://github.com/spinframework/spin) | Framework for serverless applications compiled to WebAssembly. |

**Orchestration & Management**

| Project | Level | Repository | What problem it solves |
|---|---|---|---|
| container2wasm | Sandbox | [container2wasm/container2wasm](https://github.com/container2wasm/container2wasm) | Runs existing containers in WebAssembly environments. |
| SpinKube | Sandbox | [spinframework/spin-operator](https://github.com/spinframework/spin-operator) | Runs Spin WebAssembly applications on Kubernetes, without containers. |

## How the foundation actually works

The CNCF sits under the Linux Foundation. It does not write the code and it
does not direct the projects. What it sells to a project is neutrality, and the
services that come attached to it.

Neutral ownership is the substance of the deal. When a project is donated, the
trademark, the domain and the repositories move to the foundation. The company
that started it keeps its engineers and loses its veto. That is the whole
reason a competitor is willing to send a maintainer.

Around that sit the services: cloud and CI credits, independent security
audits, design and documentation help, legal support, and the events.
KubeCon is the visible one, and it funds a good deal of the rest.

Three bodies matter, and they do different jobs:

- The **Technical Oversight Committee**, elected, votes projects in, moves them
  between levels, runs the due diligence and can archive a project. Its
  meetings and its votes happen in public, in the `cncf/toc` repository.
- The **Technical Advisory Groups** do the domain work. There is one for
  security, one for observability, one for network, one for storage, one for
  app delivery, one for contributor strategy, and so on. They review projects
  on the TOC's behalf, publish whitepapers, and are open to anyone who wants to
  sit in.
- The **Governing Board** handles budget and membership. It has no say over
  which project graduates.

What it does not do is run the projects. Maintainers are not appointed by the
foundation, roadmaps are not approved by it, and a company paying for a
platinum membership does not thereby get a commit bit. The obligations flow the
other way: a project has to document its governance, adopt a code of conduct,
publish a security disclosure process, take contributions under a DCO or CLA,
and sit an annual review.

## Getting in, if you are new here

The path that works is not the one that looks official. It is roughly this.

**Start from something you already run.** Contribution follows use. Reading the
landscape looking for a project to help is backwards, and it shows in the first
pull request.

**Do not start with Kubernetes core.** It has thousands of contributors, long
review queues, and enough process to need its own website. A sandbox or
incubating project with four maintainers will notice you within a week, and
you will learn the same skills with a shorter feedback loop.

**Go to the community meeting before you write anything.** Nearly every project
has a public weekly or fortnightly call on the CNCF calendar, with an agenda in
a document anyone can add to. Two meetings will teach you more about what the
project actually needs than a month of reading the roadmap.

**Then take the small, unglamorous work.** The `good first issue` and
`help wanted` labels exist, but the more reliable opening is the thing you
tripped over yourself: documentation that lied, an error message that explained
nothing, a missing example, a bug you can reproduce reliably. Maintainers
notice a clean reproduction faster than they notice a refactor.

**The ladder is written down.** Contributor, reviewer, approver, maintainer.
Every project keeps it in its governance file, with the criteria attached. It
is a matter of time and demonstrated judgement, not of asking.

There are also programs built for exactly this. LFX Mentorship runs in terms
and pays a stipend, with projects posting what they need help with. The CNCF
takes part in Google Summer of Code as an umbrella organisation. KubeCon has
scholarships, and the New Contributor Workshop is aimed at people who have
never opened a pull request against any of this. Attending a TAG meeting costs
nothing and is the fastest way to see the shape of a whole domain.

One distinction worth keeping straight: certifications (KCNA, CKA, CKAD, CKS)
prove that you can operate the ecosystem, and they are a decent on-ramp to
using it. They are not contribution, and no maintainer will read them.

If what you have is a project rather than time, the door is the `cncf/sandbox`
repository. Applications are public, reviewed in batches by the TOC, and the
rejected ones are as instructive to read as the accepted ones.

## What I would actually pick

This part is opinion, not data. It is what I would reach for today, based on
what I have run and on what the market has quietly converged on. The archived
list above is the reason I hedge: plenty of confident recommendations from 2019
are now tombstones.

| Need | What I would pick | Why |
|---|---|---|
| Cluster | A managed one, or k3s at the edge | Running the control plane yourself is a full-time job that buys almost nothing |
| Network | Cilium | It won. eBPF policy and visibility with no sidecar, and the ecosystem assumes it now |
| Certificates | cert-manager | There is no second option and no reason to look for one |
| Packaging | Helm, with kustomize for overlays | Everyone complains and everyone ships charts. Being the lingua franca is worth more than being elegant |
| Delivery | Argo CD or Flux | Argo CD if you want the UI and an app-of-apps model, Flux if you want fewer moving parts |
| Metrics | Prometheus and Grafana | Thanos or Cortex only once retention or a global view actually hurts |
| Instrumentation | OpenTelemetry | The one place to standardise early, because rewriting instrumentation later is miserable |
| Traces | Jaeger | Cheap to run, and it answers the only question you have at 3am |
| Policy | Kyverno | Policies in YAML, which your team already writes. OPA if you need Rego outside the cluster too |
| Secrets | external-secrets, plus a real manager | SOPS only if the secrets genuinely must live in Git |
| Autoscaling | KEDA | Scaling on queue depth beats scaling on CPU for almost every real workload |
| Postgres | CloudNativePG | The operator that changed my mind about running databases in a cluster |
| Backups | Velero | Boring, and the only one you will be glad you tested |
| Storage on-prem | Longhorn or Rook | And only after checking whether you can avoid owning storage at all |
| Registry | Harbor | If you self-host. Otherwise use whatever your cloud already gives you |
| Cost | OpenCost | Because the first cloud bill argument arrives before the second quarter does |

What I would not rush into: a service mesh, until mTLS or per-request routing
is a stated requirement rather than a diagram. Multi-cluster orchestration,
until one cluster has actually run out. Backstage, until someone is funded to
own the portal, because an abandoned catalogue is worse than none. And the
whole AI adjacent shelf, which is where most of the recent sandbox intake
landed and where I expect the next round of archives to come from.

The general rule I use: graduated projects for anything on the critical path,
incubating where the blast radius is contained, and sandbox only for things I
am willing to rip out. That maps almost exactly onto how much of my own time
each level has cost me.
