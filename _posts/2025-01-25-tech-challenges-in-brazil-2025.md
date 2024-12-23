---
layout: post
title: Tech challenges in Brazil 2025
description:
summary:
tags: challenges tech
minute: 4
---

**saving your time**: *I need to provide some context so you can decide whether to keep reading or not. First, I work in the banking sector in Brazil as a reliability engineer. I have some experience in telecommunications and internal platforms. What follows is my personal opinion, and you're welcome to offer counterpoints.*

The year is coming to an end, and this article reflects a personal opinion on the challenges in the technology sector. I would greatly appreciate receiving counterpoints or comments from others on the subject.

## Managing software with more software

Using software to support and evolve software comes at a cost. If you work in DevOps or reliability engineering, you’re likely already familiar with tools like Containerd, Kubernetes, Helm, Terraform, Crossplane, Jenkins, ArgoCD, Ansible, KEDA, Jaeger, Istio, OpenTelemetry, and many others. Even with excellent organizations like CNCF providing structure, upgrading some of these tools in critical environments can become quite complex. This is especially true for those directly tied to workloads with a significant impact on products, such as Containerd, Kubernetes, and Istio. Other updates can also be risky, and their side effects may be even harder to identify. In short, I believe these solutions come with their own challenges. That doesn’t mean you shouldn’t use them, but it’s crucial to keep in mind that adopting any of these tools means you’ll have to deal with updates. And when those updates involve security, they often need to be done with urgency.

## Security vs. Productivity

The topic of security has significantly complicated my daily work routine, while also generating a growing backlog for reliability and software engineering teams. Everyone knows that security must be embedded in every level of an organization, as well as within individuals. It plays a vital role in the business and goes beyond the technological sphere. Having worked with banks and fintechs, I understand that security is even more critical in these environments, where organizations face numerous regulatory requirements and compliance obligations. I see this topic as a significant challenge because it directly affects employees' lives, who often feel unproductive or pressured by the bureaucracy applied to technology and processes. A simple analogy: imagine you're teaching your child to ride a bike but want to ensure they don’t get hurt if they fall. You equip them with every possible safety device so that even if they fall, they won’t be injured. However, the excess of equipment makes it impossible for them to ride the bike. This isn’t about debating whether we need security, that’s already clear. Instead, we should reflect on how we want to approach security and strike the right balance to ensure both safety and efficiency.

## Building economically

In the market where I operate, FinOps-related matters are often unclear, especially regarding how organizations are willing to spend heavily to ensure a good end-user experience. This frequently happens even in business areas that do not generate significant financial returns. The challenge here is that this mindset often leads to extremely expensive technical decisions. Companies consistently aim for extraordinarily high SLAs, relying on costly cloud provider components. Have you ever considered how much a large company spends just to achieve observability for its applications ? Observability rarely offers a direct financial return for most companies, yet the associated costs are typically very high. This happens because the same solution used to monitor core business components is also employed to observe non-critical internal systems. The key point is that the cost-saving perspective often comes only after implementation. It is rare for debates to focus on high costs upfront. Discussions usually center around whether a solution can handle the required load or if it is highly available, with little attention to how much it will cost over time. This approach comes at a high price—literally.

## Scaling with resilience

The use of complex architectures with microservices, non-relational databases, and messaging services is common in organizations that need to scale to serve a large number of users. While complexity is relative, dealing with systems composed of various subsystems and different levels of abstraction often makes decision-making challenging, especially during critical situations. I have witnessed scenarios where the feature toggle system of an application failed, directly impacting the application's functionality. I have also seen cases where a cache system failure brought an entire product down. These fragilities have cost me many sleepless nights. For 2025, the challenge I propose is to develop solutions that can scale without being overly sensitive to dependencies, operate with alternative paths, and recover from potential failures autonomously and efficiently.