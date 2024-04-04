---
layout: post
title: tools/docker/docker-api
description: docker-api
summary: docker-api
tags: tools docker
---

## docker-api

go get github.com/docker/docker/client

```
package main

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

func main() {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		panic(err)
	}

	fmt.Println("Lista de containers:")
	for _, container := range containers {
		fmt.Printf("ID: %s Image: %s Command: %s Created: %s Status: %s Names: %v\n",
			container.ID[:10], container.Image, container.Command, container.Created, container.Status, container.Names)
	}
}
```