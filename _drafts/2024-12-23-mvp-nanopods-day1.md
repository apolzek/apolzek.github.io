---
layout: post
title: 💡 MVP nanopods - day 1
description:
summary:
# tags: devops sre project startup
minute: 4
---

**saving your time**: *about a personal project similar to render.com to exercise the mind*

## About this initiative

I recently saw a project on YouTube where the YouTuber created a complete product and put it into production. I liked the idea and thought about creating a real project... starting from localhost to production. I don't consider myself a good programmer, but I'm looking for a well-made bean and rice. My main focus is to launch a stable product with acceptable security standards and that simply implements the idea as it is now in my mind. I present to you the **nanopods** project. You can follow the progress of this through a series of articles on this blog!

🗣️ *I intend to run this on-premises*

I know there are already similar projects on the internet, but most of them focus on *development* and not on *operations*. I have two main goals. The first is to test technologies, discuss decisions and show concerns that usually arise when our project goes into production. The second is to perhaps make some money with this. My initial focus is Brazilian software developers. In general, I get along well with developers.

Let's get started. What follows is information about the project. To be quite honest, what I intend to build already exists, something similar to *render.com*.. but with some differences.

### nanopods 🚀

**nanopods** is **not** introducing an innovative solution but rather offering **a new way of delivering container-based application hosting**, designed for developers of all levels, SREs, DevOps, and QAs. By abstracting infrastructure and networking, it enables fast, cost-effective container deployment. Users can make applications publicly accessible or control access as needed. Unlike traditional solutions focused on large enterprises with strict SLAs, **nanopods** prioritizes simplicity and accessibility, creating an agile environment for rapid testing and iteration, without the complexity of managing traditional servers.

I'm still thinking about the legal issues..

### About the idea

The idea is basically a *render.com* with some differences. I want to do something more "api first". I want to do it in a way that is similar to the way people work with containers locally and I also want to offer a way for them to have details about their applications by adding components to the infrastructure that abstract away the complexity of doing so.

### What do I need ?

Considering that I have no money, no computing resources, and no advanced programming skills (that makes it too hard 🤣🤣), I need to focus on something simple that works. I want to create a business abstraction on top of Kubernetes and put all the complexity into it using tools I have experience with. I need a cheap domain like **nanopods.io**. I need a payment method and reasonable bandwidth. I want to physically separate the servers where applications are from the servers where the end-user containers will be. I need to think about security and a business model that is viable for Brazilian developers.

For the first poc's, the simpler the better. I intend to use python or golang for this. I will use kind as the local kubernetes environment, the local registry of my machine for the images and also my local network. The networking part is very important in this project, but first I want a functional MVP.

### to be continued..

So, that’s it. I’ve reached the end of my first article. I hope I’ve been clear about my idea. In the end, even if everything goes wrong, I will have gained valuable knowledge. These notes may be useful to someone else, and even to my future self. What’s coming next? A series of reflections, articles about random tools, and some not-so-professional code **(**:

See you around !

![working](https://raw.githubusercontent.com/apolzek/apolzek.github.io/refs/heads/main/assets/gif/working.webp)
