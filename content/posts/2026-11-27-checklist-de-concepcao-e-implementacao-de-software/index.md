---
title: "Checklist de concepção e implementação de software"
slug: "checklist-de-concepcao-e-implementacao-de-software"
date: '2026-11-27T12:00:00-03:00'
draft: false
description: "Perguntas para fazer antes e durante a construção de um software: propósito e valor, escopo, ambiente e modelo de execução, usuários, interface, arquitetura, dependências, dados, integrações, segurança, confiabilidade, performance, observabilidade, configuração, testes, deploy, operação, custos, documentação, evolução e a validação final."
tags:
- engenharia-de-software
- arquitetura
minute: 8
---

## 1. Propósito e valor

- Qual problema estou tentando resolver ?
- Por que esse problema precisa ser resolvido ?
- Alguém já fez algo que resolve esse problema ?
- Existem soluções open-source ou comerciais ?
- Vale a pena construir ou reutilizar algo existente ?
- Como isso me gera valor (tempo ou dinheiro) ?
- Quanto tempo essa solução pode economizar ?
- Quanto custa desenvolver e manter essa solução ?
- Quem será beneficiado ?
- Como vou medir o sucesso da solução ?

## 2. Escopo

- O que o software precisa fazer ?
- O que o software não deve fazer ?
- Quais são os requisitos obrigatórios ?
- Quais são os requisitos opcionais ?
- Qual é a menor versão funcional possível (MVP) ?
- Quais são as limitações conhecidas ?
- Quais são os principais casos de uso ?

## 3. Ambiente de execução

- Onde vai executar ?
- Quem vai executar ?
- Quando vai executar ?
- Em qual sistema operacional ?
- Será executado localmente ou remotamente ?
- Será executado em servidor, container, Kubernetes ou serverless ?
- Precisa funcionar em diferentes arquiteturas (ARM/x86) ?
- Precisa de acesso à internet ?
- Precisa funcionar offline ?
- Quais recursos computacionais serão necessários ?
- Precisa de privilégios especiais ?

## 4. Modelo de execução

- Será executado manualmente ou automaticamente ?
- Será um processo contínuo ou sob demanda ?
- Será orientado a eventos ou agendamentos ?
- Será síncrono ou assíncrono ?
- Precisa de concorrência ou paralelismo ?
- Precisa de filas de processamento ?
- Pode executar múltiplas instâncias simultaneamente ?
- Precisa garantir idempotência ?
- Como será interrompido ou reiniciado ?

## 5. Usuários e acessos

- Será single-user ou multi-user ?
- Será single-tenant ou multi-tenant ?
- Quem poderá utilizar ?
- Quem poderá administrar ?
- Precisa de autenticação ?
- Precisa de autorização ?
- Precisa de diferentes níveis de acesso ?
- Precisa de RBAC ?
- Precisa de isolamento entre usuários ?
- Precisa de gerenciamento de sessões ?
- Precisa de SSO ?

## 6. Interface

- Como o usuário vai interagir com o software ?
- Precisa de CLI ?
- Precisa de interface web ?
- Precisa de interface desktop ?
- Precisa de aplicativo mobile ?
- Precisa de API ?
- Precisa de SDK ?
- Precisa de interface administrativa ?
- Precisa de notificações ?

## 7. Arquitetura

- Será monolítico ou distribuído ?
- Quais componentes serão necessários ?
- Como os componentes vão se comunicar ?
- Será stateless ou stateful ?
- Como será organizado o código ?
- Precisa de uma arquitetura modular ?
- Precisa suportar plugins ou extensões ?
- Quais padrões de projeto serão utilizados ?
- Onde estarão os potenciais gargalos ?
- Quais serão os pontos únicos de falha (SPOF) ?
- Qual é a arquitetura mais simples que atende aos requisitos ?

## 8. Tecnologias e dependências

- Qual linguagem de programação será utilizada ?
- Quais frameworks serão utilizados ?
- Quais bibliotecas serão utilizadas ?
- Por que utilizar cada biblioteca ?
- Existem alternativas nativas na linguagem ?
- As dependências possuem manutenção ativa ?
- Quais são as licenças das dependências ?
- Existem riscos de segurança nas dependências ?
- Existe risco de vendor lock-in ?
- Como as dependências serão atualizadas ?
- Quais protocolos serão utilizados ?

## 9. Dados e armazenamento

- Quais dados serão recebidos ?
- Quais dados serão produzidos ?
- Precisa armazenar informações ?
- Precisa de banco de dados ?
- Qual modelo de banco de dados será utilizado ?
- Precisa de cache ?
- Precisa de armazenamento de arquivos ?
- Qual será o formato dos dados ?
- Qual será o volume de dados ?
- Qual será a política de retenção ?
- Precisa de backup e restore ?
- Precisa de migração de dados ?
- Precisa de consistência transacional ?
- Como os dados serão excluídos ?

## 10. Integrações

- Precisa integrar com outros sistemas ?
- Quais integrações serão necessárias ?
- Existem APIs disponíveis ?
- Precisa consumir ou disponibilizar webhooks ?
- Como será feita a autenticação das integrações ?
- Existem limites de requisições (rate limits) ?
- Existem custos associados às integrações ?
- O que acontece quando uma integração falha ?
- Precisa de timeout, retry ou circuit breaker ?
- Como será tratada a compatibilidade entre versões ?

## 11. Segurança e auditoria

- Quais são os possíveis riscos de segurança ?
- Precisa de auditoria ?
- Quais ações precisam ser auditadas ?
- Preciso saber quem fez, o que fez e quando fez ?
- Os registros de auditoria precisam ser imutáveis ?
- Precisa de criptografia em trânsito ?
- Precisa de criptografia em repouso ?
- Como serão armazenados os secrets ?
- O software manipula dados sensíveis ?
- Precisa atender à LGPD ou outras regulamentações ?
- Como serão validadas as entradas ?
- Como será aplicado o princípio do menor privilégio ?
- Qual seria o impacto de um comprometimento do software ?

## 12. Confiabilidade e disponibilidade

- Qual nível de disponibilidade será necessário ?
- O que acontece quando o software falha ?
- O que acontece quando uma dependência falha ?
- Precisa de alta disponibilidade ?
- Precisa de redundância ?
- Precisa de recuperação automática ?
- Precisa de graceful shutdown ?
- Pode operar de maneira degradada ?
- Existe risco de perda ou duplicação de dados ?
- Quais serão os objetivos de recuperação (RPO/RTO) ?
- Precisa de disaster recovery ?

## 13. Performance e escalabilidade

- Quantos usuários serão suportados ?
- Quantas operações por segundo serão necessárias ?
- Qual latência será aceitável ?
- Qual throughput será necessário ?
- Qual consumo de CPU será aceitável ?
- Qual consumo de memória será aceitável ?
- Qual consumo de armazenamento será aceitável ?
- Precisa de escalabilidade horizontal ?
- Precisa de escalabilidade vertical ?
- Precisa de rate limiting ?
- Precisa de backpressure ?
- Quais serão os limites operacionais ?
- Precisa de benchmarks ?

## 14. Observabilidade

- Precisa produzir logs ?
- Precisa produzir métricas ?
- Precisa produzir traces ?
- Precisa de logs estruturados ?
- Precisa de health checks ?
- Precisa de profiling ?
- Quais indicadores representam a saúde do software ?
- Quais indicadores representam o sucesso das operações ?
- Precisa de dashboards ?
- Precisa de alertas ?
- Precisa definir SLIs, SLOs ou SLAs ?
- Como serão investigados os problemas ?

## 15. Configuração

- Como o software será configurado ?
- Utilizará arquivos de configuração ?
- Utilizará variáveis de ambiente ?
- Utilizará argumentos de linha de comando ?
- Precisa de configurações dinâmicas ?
- Precisa de hot reload ?
- Precisa de feature flags ?
- Quais serão os valores padrão ?
- Como configurações inválidas serão tratadas ?

## 16. Testes e qualidade

- Precisa de testes unitários ?
- Precisa de testes de integração ?
- Precisa de testes end-to-end ?
- Precisa de testes de carga ?
- Precisa de testes de segurança ?
- Precisa de testes de resiliência ?
- Como serão simuladas as falhas ?
- Como será validada a qualidade do código ?
- Quais serão os critérios de aceite ?
- Como serão evitadas regressões ?

## 17. Distribuição e deployment

- Como o software será distribuído ?
- Será um binário, pacote, container ou serviço ?
- Como será instalado ?
- Como será desinstalado ?
- Precisa de pipeline CI/CD ?
- Como será versionado ?
- Como serão realizadas as atualizações ?
- Precisa de rollback ?
- Precisa de compatibilidade retroativa ?
- Quais ambientes serão necessários ?
- Como serão gerenciadas as releases ?

## 18. Operação e manutenção

- Quem será responsável pela operação ?
- Quem será responsável pela manutenção ?
- Quanto esforço operacional será necessário ?
- Quais atividades podem ser automatizadas ?
- Como serão corrigidos os bugs ?
- Como serão tratadas as vulnerabilidades ?
- Qual será a frequência de atualização ?
- Precisa de documentação operacional ?
- Precisa de runbooks ?
- Como será realizado o troubleshooting ?
- Como será realizada a descontinuação do software ?

## 19. Custos e sustentabilidade

- Qual será o custo inicial de desenvolvimento ?
- Qual será o custo recorrente de infraestrutura ?
- Existem custos de licenciamento ?
- Existem custos com serviços externos ?
- Qual será o custo de manutenção ?
- Qual será o custo por usuário ou operação ?
- O custo cresce proporcionalmente ao uso ?
- Qual será o retorno sobre o investimento (ROI) ?
- A solução é sustentável no longo prazo ?
- Existe uma maneira mais barata de resolver o problema ?

## 20. Documentação

- Precisa de README ?
- Precisa de documentação de instalação ?
- Precisa de documentação de utilização ?
- Precisa de documentação de API ?
- Precisa de diagramas de arquitetura ?
- Precisa de High-Level Design (HLD) ?
- Precisa de Low-Level Design (LLD) ?
- Precisa de Architecture Decision Records (ADR) ?
- Precisa de Request for Comments (RFC) ?
- Precisa de changelog ?
- Precisa de documentação de troubleshooting ?

## 21. Evolução e complexidade

- O software precisará evoluir ?
- Quais funcionalidades poderão ser adicionadas ?
- Quais decisões serão difíceis de reverter ?
- Quais débitos técnicos estou disposto a assumir ?
- Estou criando complexidade desnecessária ?
- Estou resolvendo problemas que ainda não existem ?
- Existe overengineering ?
- O que posso remover sem comprometer o propósito ?
- Outra pessoa conseguiria compreender e manter esse software ?
- Se eu começasse novamente, faria da mesma maneira ?

## 22. Validação final

- O problema realmente existe ?
- A solução realmente resolve o problema ?
- Existe uma alternativa mais simples ?
- Existe uma alternativa mais barata ?
- Existe uma alternativa já consolidada ?
- O valor gerado justifica o esforço ?
- Consigo validar a ideia antes de implementá-la completamente ?
- Quais hipóteses ainda não foram comprovadas ?
- O que pode fazer esse projeto fracassar ?
- Vale a pena construir esse software ?
