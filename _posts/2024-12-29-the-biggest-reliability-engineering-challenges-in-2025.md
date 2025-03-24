---
layout: post
title: The biggest reliability engineering challenges in 2025(From my perspective)
description:
summary:
# tags: challenges tech banking security
minute: 3
---

**saving your time**: *This is just my opinion on challenges in tech field, based on my work in the banking sector in Brazil as a reliability engineer(100% biased)*

## Managing software with more software

Using software to support and evolve software comes at a cost. If you work in DevOps or reliability engineering, you’re likely already familiar with tools like Containerd, Kubernetes, Helm, Terraform, Crossplane, Jenkins, ArgoCD, Ansible, KEDA, Jaeger, Istio, OpenTelemetry, and many others. Even with excellent organizations like CNCF providing structure, upgrading some of these tools in critical environments can become quite complex. This is especially true for those directly tied to workloads with a significant impact on products, such as Containerd, Kubernetes, and Istio. Other updates can also be risky, and their side effects may be even harder to identify. In short, I believe these solutions come with their own challenges. That doesn’t mean you shouldn’t use them, but it’s crucial to keep in mind that adopting any of these tools means you’ll have to deal with updates. And when those updates involve security, they often need to be done with urgency.

## Security vs. Productivity

The topic of security has significantly complicated my daily work routine, while also generating a growing backlog for reliability and software engineering teams. Everyone knows that security must be embedded in every level of an organization, as well as within individuals. It plays a vital role in the business and goes beyond the technological sphere. Having worked with banks and fintechs, I understand that security is even more critical in these environments, where organizations face numerous regulatory requirements and compliance obligations. I see this topic as a significant challenge because it directly affects employees' lives, who often feel unproductive or pressured by the bureaucracy applied to technology and processes. A simple analogy: imagine you're teaching your child to ride a bike but want to ensure they don’t get hurt if they fall. You equip them with every possible safety device so that even if they fall, they won’t be injured. However, the excess of equipment makes it impossible for them to ride the bike. This isn’t about debating whether we need security, that’s already clear. Instead, we should reflect on how we want to approach security and strike the right balance to ensure both safety and efficiency.

💬 *I believe this topic may have some relation to employee burnouts*

## Building economically

It is very common to see companies being overwhelmed by costs in cloud providers like AWS, Azure, and GCP, as well as by extremely expensive bills from observability vendors like Dynatrace, New Relic, and Datadog. The key point here is that we usually build first and only think about cost optimization later, instead of bringing this discussion to the beginning of projects. Once everything is built and running well, with the SLO achieved, reducing costs becomes much more complex. I see it as a major challenge to shift our mindset toward understanding and calculating costs based on technical decisions from the start of any project. I notice that few people truly appreciate efficiency those who deliver faster usually get more recognition. We should aim for sustainable solutions, considering cost progression over time and avoiding vendor lock-in.

## Fragile points in complex systems/architectures

The use of complex architectures with microservices, non-relational databases, and messaging services is common in organizations that need to scale to serve a large number of users. While complexity is relative, dealing with systems composed of various subsystems and different levels of abstraction often makes decision-making challenging, especially during critical situations. I have witnessed scenarios where the feature toggle system of an application failed, directly impacting the application's functionality. I have also seen cases where a cache system failure brought an entire product down. These fragilities have cost me many sleepless nights. For 2025, the challenge I propose is to develop solutions that can scale without being overly sensitive to dependencies, operate with alternative paths, and recover from potential failures autonomously and efficiently.

![working](https://raw.githubusercontent.com/apolzek/apolzek.github.io/refs/heads/main/assets/gif/done.webp)
**Solution** = Shift left **Costs** + **Security** + **Observability**

Honestly, I think these are the main challenges for 2025 in my line of work. So, what’s the plan ?? We tackle them head-on. The idea is to deliver value, get stuff done, and have some fun along the way, working with Delphi or whipping up a new CI/CD pipeline. The best way to not let these challenges get to you ? Just do a solid job and keep it chill.

**Happy New Year** 🎉🎉🎉🎉