---
layout: post
title: SRE interview questions
description: 
summary: 
tags: sre interview
minute: 10
---

Although I have a solid foundation in various technology topics and in-depth knowledge in many of them, I still lack the confidence to conduct interviews. You never know what you might encounter on the other side. Regardless, I would like to share my thought process for conducting a technical interview for the position of Site Reliability Engineer or DevOps Engineer.

## Networking

Suppose you have a proxy that operates at the TCP level and another that operates only at the HTTP level. What are the main implications of this configuration? How can these differences affect error handling, security, and network scalability ?

## Kubernetes

In the context of Kubernetes, you are designing an application that requires different pod management strategies to meet specific requirements. Explain how you would utilize ReplicaSets, Deployments, StatefulSets, and DaemonSets to address these needs. In particular, discuss the ideal use cases for each of these objects and how they behave in relation to scalability, data persistence, and version updates. Additionally, what considerations should you keep in mind when choosing between these types of pod controllers for different components of your application ?

## Prometheus

In the context of monitoring with Prometheus, you encounter a cardinality problem where the number of time series becomes excessive, resulting in performance degradation and excessive resource usage. What are the common causes of cardinality issues in Prometheus, and what strategies can you employ to mitigate these problems ?

## CI/CD

In a continuous integration and continuous delivery (CI/CD) environment, the execution time of pipelines can significantly impact the speed of development and software delivery. What techniques and practices would you implement to optimize the execution time of CI/CD pipelines?

You are managing a project that uses Jenkins for continuous integration and GitLab CI for continuous delivery. Discuss how you would integrate these two tools into a unified CI/CD workflow. What considerations would you have regarding pipeline configuration, credential management, and infrastructure versioning? Additionally, analyze the advantages and disadvantages of using Jenkins alongside GitLab CI, considering aspects such as flexibility, scalability, and maintenance complexity.
