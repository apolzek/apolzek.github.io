---
layout: post
title: blackbox_exporter or network_exporter ?
description: Outside in with blackbox_exporter, Inside out with network_exporter
summary:
tags: prometheus exporters network
minute: 6
---

**saving your time**: *Prometheus exporters are applications that extract data from services or processes and expose it in Prometheus format. This article provides a brief analysis of blackbox_exporter and network_exporter, highlighting their use cases and the key differences between them*

![image.png](/assets/img/prometheus-multi-service-exporter.svg)

## Introduction

This type of article can be somewhat controversial because there are multiple approaches to working with these exporters. My goal is to share my perspective on where each should be used and the results you can expect.

First, it's important to clarify that we're dealing with **network exporters**. While they greatly enhance observability, I believe there are more professional ways to analyze a network. That said, the insights provided by both can help reliability engineers and software engineers quickly and easily understand their environments.

So, which one should you use? My answer is simple and direct: **both** !!

![image.png](/assets/img/bobsponja-patrick.webp)

## blackbox_exporter

As the name suggests, **blackbox_exporter** is designed to simulate an external user calling an endpoint within your environment. It mimics a simple user request, monitoring the availability and performance of external endpoints such as websites, APIs, or network services. Two key pieces of information it provides are SSL certificate verification and latency measurement. In short, I consider it an **external probe** that makes requests to something inside your environment.

## network_exporter

**network_exporter**, on the other hand, can be used in a more general way, but I primarily use it for the opposite approach—monitoring from the **inside out**. In other words, I use it to track all the external dependencies of my application or any workload I’m running, whether it's an external API, a database, an endpoint accessed via VPN or proxy, and so on. It’s particularly useful when an external dependency goes down or when there’s a network issue along the way, such as an ACL loss or hardware failure. Since it performs both HTTP and ICMP checks, you can use it as a replacement for blackbox_exporter, though it does not support SSL checks 😊

## PoC

This PoC showcases monitoring in a Kubernetes environment using network_exporter to analyze connectivity from inside out and blackbox_exporter to simulate external access and assess service availability from outside in.

The dependencies of my application, which is behind a service, are a database and an external API. I want information about both
```
network_exporter  --> Database
                  --> external_api
```

To check if my API is working as expected, I will make a request using blackbox_exporter, simulating an HTTP call
```
blackbox_exporter  --> Ingress
```

![image.png](/assets/img/blackbox-x-network.png)

https://github.com/syepes/network_exporter
https://github.com/prometheus/blackbox_exporter
https://grafana.com/grafana/dashboards/15297-prometheus-network-exporter/