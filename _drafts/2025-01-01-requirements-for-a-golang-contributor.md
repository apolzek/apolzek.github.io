---
layout: post
title: Requirements for a Golang contributor
description:
summary:
tags: golang opensource
minute: 6
---

## Context

## Dependency Injection

Dependency Injection (DI) is a powerful design pattern that helps manage the dependencies between components in an application. By adopting this pattern, Go developers can create more modular, flexible, and maintainable systems. DI follows the Inversion of Control (IoC) principle, where the responsibility of managing dependencies is shifted from the component to an external source, such as a dependency injection container or the composition root of an application.

```go
package main

import "fmt"

type MessageSender interface {
 SendMessage(message string) error
}

type EmailSender struct{}

func (e *EmailSender) SendMessage(message string) error {
 fmt.Println("Enviando e-mail com a mensagem:", message)
 return nil
}

type SMSSender struct{}

func (s *SMSSender) SendMessage(message string) error {
 fmt.Println("Enviando SMS com a mensagem:", message)
 return nil
}

type MessageService struct {
 sender MessageSender
}

func NewMessageService(sender MessageSender) *MessageService {
 return &MessageService{sender: sender}
}

func (ms *MessageService) Send(message string) {
 ms.sender.SendMessage(message)
}

func main() {
 emailSender := &EmailSender{}
 emailService := NewMessageService(emailSender)
 emailService.Send("Olá, esse é um teste de envio por e-mail!")

 smsSender := &SMSSender{}
 smsService := NewMessageService(smsSender)
 smsService.Send("Olá, esse é um teste de envio por SMS!")
}

```

## Factory Design Pattern

```go
package main
import "fmt"

// Product interface
type Car interface {
  Drive() string
}

// Concrete Products
type Sedan struct{}
type SUV struct{}

func (s *Sedan) Drive() string {
  return "Driving a sedan car"
}

func (s *SUV) Drive() string {
  return "Driving an SUV car"
}

// Factory interface
type CarFactory interface {
  CreateCar() Car
}

// Concrete Factory
type SedanFactory struct{}
type SUVFactory struct{}

func (sf *SedanFactory) CreateCar() Car {
  return &Sedan{}
}

func (sf *SUVFactory) CreateCar() Car {
  return &SUV{}
}

func main() {
  // Create a sedan car using the sedan factory
  sedanFactory := &SedanFactory{}
  sedan := sedanFactory.CreateCar()
  fmt.Println(sedan.Drive())
  // Create an SUV car using the SUV factory
  suvFactory := &SUVFactory{}
  suv := suvFactory.CreateCar()
  fmt.Println(suv.Drive())
}
```

## Unit tests
<!-- <https://speakerdeck.com/jpkroehling>
<https://medium.com/hprog99/understanding-dependency-injection-in-go-a-comprehensive-guide-6edeea4be167> 
https://medium.com/@swabhavtechlabs/implementing-the-factory-design-pattern-in-golang-a-comprehensive-guide-36d351b53e3a
-->
