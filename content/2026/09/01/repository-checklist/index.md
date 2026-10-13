---
title: "Checklist de repositório"
slug: "repository-checklist"
date: '2026-09-01T12:00:00-03:00'
draft: false
description: "Um checklist do que um repositório bem mantido deveria entregar: os arquivos, a automação e as convenções que tornam um repo fácil de confiar e de contribuir."
tags:
- engenharia-de-software
- git
- open-source
minute: 7
---

Um checklist do que um repositório bem mantido deveria entregar, na sua
documentação, no seu código e na sua automação.

**Como usar:** nem todo repo precisa de todos os itens. Os itens marcados com
`(A)` são *avançados*, valem para projetos OSS, monorepos ou qualquer coisa
com contribuidores externos. Tudo que não está marcado é o mínimo.

As seções marcadas como *condicionais* só se aplicam quando o repo é aquele tipo
de projeto (um serviço HTTP, um app em contêiner, um workload Kubernetes).

## Índice

- [1. Documentação](#1-documentação)
  - [1.1 README.md](#11-readmemd)
  - [1.2 Arquivos de governança e política](#12-arquivos-de-governança-e-política)
  - [1.3 Docs mais profundas (`docs/`)](#13-docs-mais-profundas-docs)
  - [1.4 Changelog e releases](#14-changelog-e-releases)
- [2. Código](#2-código)
  - [2.1 Layout e convenções](#21-layout-e-convenções)
  - [2.2 Configuração](#22-configuração)
  - [2.3 Fonte única de verdade / código gerado (A)](#23-fonte-única-de-verdade--código-gerado-a)
- [3. Testes](#3-testes)
  - [3.1 Testes unitários](#31-testes-unitários)
  - [3.2 Integração e end-to-end](#32-integração-e-end-to-end)
  - [3.3 Performance e robustez (A)](#33-performance-e-robustez-a)
  - [3.4 Cobertura](#34-cobertura)
- [4. Artefatos de API (condicional: serviços HTTP/gRPC)](#4-artefatos-de-api-condicional-serviços-httpgrpc)
- [5. Build e runtime (condicional: apps em contêiner)](#5-build-e-runtime-condicional-apps-em-contêiner)
  - [5.1 Docker](#51-docker)
  - [5.2 Docker Compose](#52-docker-compose)
  - [5.3 Kubernetes (condicional)](#53-kubernetes-condicional)
- [6. CI/CD](#6-cicd)
  - [6.1 Checagens básicas](#61-checagens-básicas)
  - [6.2 Segurança](#62-segurança)
  - [6.3 Dependências](#63-dependências)
  - [6.4 Automação do repositório (A)](#64-automação-do-repositório-a)
- [7. Metadados do repositório](#7-metadados-do-repositório)
- [Conjunto mínimo viável](#conjunto-mínimo-viável)

## 1. Documentação

### 1.1 README.md

- [ ] Visão geral do projeto: o que ele faz e, mais importante, *por que* existe
- [ ] Badges de status: build do CI, cobertura de testes, última release, nível de estabilidade
- [ ] Nível de estabilidade / maturidade (`development` → `alpha` → `beta` → `stable` → `deprecated`)
- [ ] Política de suporte: quem mantém, onde perguntar, tempo de resposta esperado
- [ ] Instruções de instalação
- [ ] Como rodar o app localmente
- [ ] Como configurar o ambiente (`.env.example` commitado, `.env` no git-ignore)
- [ ] Exemplos de uso (copiáveis e realmente testados)
- [ ] Diagrama de arquitetura ou uma seção curta de "como as peças se encaixam"
- [ ] Link para o guia de contribuição
- [ ] Informação de licença
- [ ] Um README por módulo/subpacote, não só na raiz (A)
- [ ] Seções de status geradas automaticamente, delimitadas por marcadores, para nunca ficarem defasadas (A)

### 1.2 Arquivos de governança e política

- [ ] `LICENSE` (+ `NOTICE` se você redistribui código de terceiros)
- [ ] `CONTRIBUTING.md`: setup local, como rodar os testes, regras de título e
      descrição de PR, expectativas de review
- [ ] `CODEOWNERS`: ownership por diretório, dispara pedidos de review automáticos
- [ ] `SECURITY.md`: como reportar uma vulnerabilidade, em privado
- [ ] `CODE_OF_CONDUCT.md`
- [ ] `AGENTS.md` / `CLAUDE.md`: política de contribuição assistida por IA (trailer
      de divulgação, o que agentes podem e não podem fazer)
- [ ] `.github/pull_request_template.md`
- [ ] `.github/ISSUE_TEMPLATE/`: bug report, feature request, mais um `config.yml`
      apontando para os canais de suporte
- [ ] Política de triagem de issues: labels, prioridades, política de stale (A)
- [ ] Papéis de mantenedor/aprovador e como chegar lá (A)

### 1.3 Docs mais profundas (`docs/`)

- [ ] Processo de release, escrito e repetível
- [ ] Guia de testes: como rodar cada camada de teste localmente
- [ ] Guia de onboarding para novos módulos/componentes (A)
- [ ] ADRs (Architecture Decision Records): o *porquê* por trás do design
- [ ] Runbook / docs operacionais: alertas, dashboards, falhas comuns
- [ ] Docs de referência geradas: cada opção de config, default e métrica emitida,
      produzidas a partir da fonte de verdade em vez de escritas à mão (A)

### 1.4 Changelog e releases

- [ ] `CHANGELOG.md` seguindo SemVer / Keep a Changelog
- [ ] Fragmentos de changelog: um arquivo pequeno por PR, montados na hora da release.
      Mata conflitos de merge e obriga o autor a declarar o impacto para o usuário (A)
- [ ] Changelog separado para mudanças de API/breaking vs. mudanças visíveis ao usuário (A)
- [ ] Releases com tag e release notes geradas a partir do changelog
- [ ] Política de versionamento e de deprecação documentada

## 2. Código

### 2.1 Layout e convenções

- [ ] Layout de projeto consistente e documentado
- [ ] Cabeçalho de licença/SPDX em todo arquivo-fonte, cobrado pelo linter
- [ ] Comentário de documentação por pacote (`doc.go` ou equivalente)
- [ ] Config do linter commitada, com conjunto explícito de linters e exceções
      justificadas por caminho, não os defaults da ferramenta
- [ ] Formatador cobrado no CI, não deixado para o revisor
- [ ] Restrições de import cobradas (nenhum import proibido/interno vazando) (A)
- [ ] Um task runner (Makefile / justfile / npm scripts) com alvos padrão:
      `test`, `lint`, `fmt`, `build`, `run`, `integration-test`, `tidy`
- [ ] Os mesmos comandos funcionam na raiz e dentro de cada módulo (A)

### 2.2 Configuração

- [ ] Struct de config tipada com `Validate()` explícito e mensagens de erro claras
- [ ] Falhar rápido com config inválida na inicialização, nunca no meio de um request
- [ ] Config de exemplo commitada, carregada por um teste de verdade
- [ ] Schema de config publicado (JSON Schema / equivalente) para autocomplete no
      editor e validação no CI (A)
- [ ] `examples/` com configurações completas baseadas em cenário: não trechos
- [ ] Segredos nunca em arquivos de config nem no repo; injetados em runtime
- [ ] Logging estruturado, métricas e tracing plugados e documentados

### 2.3 Fonte única de verdade / código gerado (A)

- [ ] Arquivo de metadados declarativo por componente (owners, estabilidade, config,
      telemetria emitida)
- [ ] Código, docs e seções do README gerados a partir dele
- [ ] O CI verifica que a saída gerada está atualizada: defasagem vira build
      quebrado em vez de documentação velha

## 3. Testes

### 3.1 Testes unitários

- [ ] Testes unitários que realmente afirmam comportamento, não só executam linhas
- [ ] Testes table-driven para lógica cheia de ramificações
- [ ] Determinísticos: sem sleeps, sem relógio real, sem rede
- [ ] Fixtures de teste (`testdata/`) versionadas, com um comando para regenerá-las

### 3.2 Integração e end-to-end

- [ ] Testes de integração isolados atrás de uma build tag / comando separado para
      não atrasarem a execução unitária
- [ ] Dependências reais via contêineres efêmeros (Testcontainers ou equivalente)
- [ ] Testes end-to-end contra um deploy realista (A)
- [ ] Testes de contrato para APIs consumidas e fornecidas (A)

### 3.3 Performance e robustez (A)

- [ ] Benchmarks para os caminhos quentes, com um jeito documentado de comparar execuções
- [ ] Testes de carga com uma baseline de performance declarada
- [ ] Testes de fuzz para tudo que faz parse de entrada externa
- [ ] Detecção de vazamento: goroutines, conexões, file descriptors
- [ ] Race detector habilitado no CI

### 3.4 Cobertura

- [ ] Relatório de cobertura gerado no CI e publicado
- [ ] Limite de cobertura commitado no repo, dividido em alvos de *projeto* e de
      *patch* (ex.: 85% no total, 95% no diff)
- [ ] Cobertura por módulo/componente, para um repo grande não esconder um canto
      ruim atrás de uma média boa (A)

## 4. Artefatos de API *(condicional: serviços HTTP/gRPC)*

- [ ] Spec OpenAPI / Swagger, versionada no repo
- [ ] Spec gerada a partir do código ou validada contra ele, para não ficar defasada
- [ ] Coleção do Postman / Insomnia / Bruno
- [ ] Arquivos de request `.http` (executáveis a partir do editor)
- [ ] `curl.txt` com exemplos copiáveis
- [ ] Fluxo de autenticação documentado
- [ ] Catálogo de erros: códigos, significados e como se recuperar
- [ ] Versionamento e caminho de deprecação documentados para os endpoints

## 5. Build e runtime *(condicional: apps em contêiner)*

### 5.1 Docker

- [ ] `Dockerfile` com build multi-stage
- [ ] Imagem base mínima e pinada (distroless/slim), usuário non-root
- [ ] `.dockerignore`
- [ ] Healthcheck definido
- [ ] Builds reproduzíveis: dependências pinadas, nada de `latest`
- [ ] Scan de vulnerabilidade da imagem no CI (A)
- [ ] SBOM gerado e publicado junto com a imagem (A)

### 5.2 Docker Compose

- [ ] `docker-compose.yml` que sobe o stack inteiro com um comando
- [ ] Overrides por ambiente (`docker-compose.dev.yml`, `.prod.yml`)
- [ ] Dependências (banco, broker, cache) incluídas, para um dev novo não precisar de mais nada

### 5.3 Kubernetes *(condicional)*

- [ ] Manifests, ou um Helm chart com `values.yaml` documentado
- [ ] Requests e limits de recursos definidos
- [ ] Probes de liveness / readiness / startup
- [ ] Gestão de segredos (External Secrets, SOPS, sealed-secrets, nunca em texto puro)
- [ ] Configuração de Ingress
- [ ] Overlays por ambiente (Kustomize) ou arquivos de values
- [ ] `NetworkPolicy`, `PodDisruptionBudget`, security context (A)
- [ ] Manifests lintados e validados no CI (`kubeconform`, `helm lint`) (A)

## 6. CI/CD

### 6.1 Checagens básicas

- [ ] Lint
- [ ] Checagem de formatação
- [ ] Testes unitários
- [ ] Relatório de cobertura + cobrança do limite
- [ ] Build do artefato (binário e/ou imagem)
- [ ] Testes de integração, num job separado
- [ ] Status checks obrigatórios configurados na branch protegida
- [ ] Matriz de build entre os SOs/versões suportados (A)
- [ ] Detecção de escopo: rodar só o que o diff realmente afeta (A)
- [ ] Sharding de jobs para manter o tempo de parede são em repos grandes (A)

### 6.2 Segurança

- [ ] Scan de vulnerabilidades em dependências
- [ ] SAST (CodeQL ou equivalente)
- [ ] Secret scanning habilitado
- [ ] Checagem de conformidade de licença nas dependências
- [ ] Os próprios arquivos de workflow lintados (`actionlint`, `zizmor`) (A)
- [ ] Scripts shell lintados (`shellcheck`) (A)
- [ ] `permissions:` mínimas por workflow; actions de terceiros pinadas por SHA
- [ ] OpenSSF Scorecard (A)

### 6.3 Dependências

- [ ] Atualizações automáticas (Renovate / Dependabot) com estratégia de agrupamento
- [ ] Lockfile commitado
- [ ] Checagem automática de tidy/prune para o manifesto não ficar defasado
- [ ] Checagem de compatibilidade da API pública entre versões (A)

### 6.4 Automação do repositório (A)

- [ ] Atribuição automática de revisores a partir do `CODEOWNERS`
- [ ] Labels automáticas em PRs e issues por área afetada
- [ ] Avisar os owners em issues novas que tocam a área deles
- [ ] Tratamento de issues/PRs stale
- [ ] Boas-vindas a contribuidores de primeira viagem
- [ ] Congelamento de merge durante a janela de release
- [ ] Relatório periódico de saúde do repo (issues abertas, áreas sem dono)
- [ ] Preparação de release automatizada (bump de versão, montagem do changelog, tag)

## 7. Metadados do repositório

- [ ] Topics/tags com as tecnologias usadas, para ser encontrável
- [ ] Descrição do repositório clara, de uma linha
- [ ] Regras de proteção na branch padrão
- [ ] Commits assinados ou tags assinadas (A)
- [ ] Aviso de arquivamento/deprecação quando um repo deixa de ser mantido

## Conjunto mínimo viável

Se você só fizer dez coisas, faça estas:

1. README que coloca alguém rodando localmente em menos de cinco minutos
2. `LICENSE`
3. `CONTRIBUTING.md`
4. `.env.example` commitado, segredos fora do repo
5. Testes unitários com limite de cobertura cobrado no CI
6. Lint + formatação cobrados no CI
7. `Dockerfile` multi-stage e um `docker-compose up` de um comando só
8. `CHANGELOG.md` e releases com tag
9. Scan de dependências e vulnerabilidades
10. Proteção de branch com checks obrigatórios
