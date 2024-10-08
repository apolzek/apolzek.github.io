---
layout: post
title: 💡 l0calh0t Startup - day 1
description: Building the l0calh0t Startup
summary: Building the l0calh0t Startup
tags: devops sre project startup
minute: 5
---

## About the project

I recently saw a project on YouTube where the YouTuber created a complete technology environment to support a fake product. I liked the idea and thought about creating a real project... starting from localhost to production. I don't consider myself a good programmer, but I'm looking for a well-made bean and rice. My main focus is to launch a stable product with acceptable security standards and that simply implements the idea as it is now in my mind. I present to you the **l0calh0t** startup. You can follow the progress of this through a series of articles on this blog!

**note**: *don't take me too seriously*

I know there are already similar projects on the internet, but most of them focus on *development* and not on *operations*. I have two main goals. The first is to test technologies, discuss decisions and show concerns that usually arise when our project goes into production. The second is to perhaps make some money with this. My initial focus is Brazilian software developers. In general, I get along well with developers. I believe it is because every day I help them solve problems. Developers change, but the problems are usually the same.

Let's get started. What follows is information about the startup. To be quite honest, what I intend to build already exists, something similar to *render.com*.. but my ideas go a little further(if I can implement it, of course xD).

## l0calh0t 🚀🚀🚀

### About the startup

**l0calh0t** is not introducing an innovative solution but rather offering **a new way of delivering container-based application hosting**, designed for developers of all levels, SREs, DevOps, and QAs. By abstracting infrastructure and networking, it enables fast, cost-effective container deployment. Users can make applications publicly accessible or control access as needed. Unlike traditional solutions focused on large enterprises with strict SLAs, **l0calh0t** prioritizes simplicity and accessibility, creating an agile environment for rapid testing and iteration, without the complexity of managing traditional servers.

I'm still thinking about the legal issues..

### About the idea

The idea is basically a *render.com* with some differences. I want to do something more "api first". I want to do it in a way that is similar to the way people work with containers locally and I also want to offer a way for them to have details about their applications by adding components to the infrastructure that abstract away the complexity of doing so.

### What do I need?

Considering that I have no money, no computing resources, and no advanced programming skills (that makes it hard 🤣🤣), I need to focus on something simple that works. I want to create a business abstraction on top of Kubernetes and put all the complexity into it using tools I have experience with. I need a cheap domain like **localhot.io**. I need a payment method and reasonable bandwidth. I want to physically separate the servers where the startup's applications are from the servers where the end-user containers will be. I need to think about security and a business model that is viable for Brazilian developers.

For the first poc's, the simpler the better. I intend to use python or golang for this. I will use kind as the local kubernetes environment, the local registry of my machine for the images and also my local network (I run a certain risk).The networking part is very important in this project, but first I want a functional MVP.

### About my localhost (workstation)

My computer settings are

- Intel(R) Core(TM) i5-9400 CPU @ 2.90GHz; 
- 16 RAM; 
- 440G SSD; 
- EndeavourOS

**[2024-10-02 15:27:45]** UPDATE - *I’ve decided that a hardware upgrade is unfeasible... It’s time to build a new PC. !!!*

### End(?)

So, that’s it. I’ve reached the end of my first article. I hope I’ve been clear about my idea. In the end, even if everything goes wrong, I will have gained valuable knowledge. These notes may be useful to someone else, and even to my future self. What’s coming next? A series of reflections, articles about random tools, and some not-so-professional code **(**:

See you around, fellas!!
