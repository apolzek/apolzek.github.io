---
layout: post
title: How I run technical interviews
description:
summary:
minute: 10
---


cloud, sre, platform.. especifc context ? 



grpc, http https

Aqui vai a resposta direta e estruturada para a pergunta que você pediu (como se fosse o candidato respondendo em uma entrevista técnica):a) Três diferenças fundamentais entre HTTP/1.1 e HTTP/2 que justificam a escolha obrigatória do HTTP/2 pelo gRPC:Multiplexing (fluxos múltiplos em uma única conexão TCP)
HTTP/1.1: Uma conexão TCP só permite uma requisição/resposta por vez (head-of-line blocking se houver atraso).
HTTP/2: Permite múltiplos streams independentes na mesma conexão TCP, sem bloqueio entre eles.
Binary framing + compactação de headers (HPACK)
HTTP/1.1: Protocolo textual (headers em texto plano, repetitivos).
HTTP/2: Usa frames binários + compressão de headers (HPACK), reduzindo overhead de banda e CPU.
Suporte nativo a streaming bidirecional e unidirecional
HTTP/1.1: Limitado a request-response; streaming é forçado via hacks (chunked encoding).
HTTP/2: Streams full-duplex, permitindo envio contínuo de dados em ambas as direções sem abrir novas conexões.

b) Impacto prático no gRPC em cenários reais de microsserviços:Multiplexing → Permite milhares de RPCs simultâneas (unary, client streaming, server streaming, bidirectional) em uma única conexão TCP → reduz latência de setup de conexões, evita explosão de sockets e melhora throughput em alta taxa de chamadas (ex.: 10k+ RPS entre serviços).
Binary framing + HPACK → Menor payload na rede (especialmente útil com Protobuf, que já é binário e compacto) → menor latência em redes com alta latência ou baixa largura de banda; menos CPU no parsing/serialização em comparação com JSON + texto.
Streaming bidirecional → Habilita casos reais como chat em tempo real, streaming de logs/telemetria, atualizações contínuas (ex.: bidirectional streaming para ML inference ou observability push) → sem polling ou WebSocket hacks, com baixa latência e alta eficiência.

c) Por que o gRPC não pode simplesmente cair para HTTP/1.1 sem perder funcionalidades críticas? Dois motivos específicos:Multiplexing e streaming bidirecional são impossíveis no HTTP/1.1 → Sem múltiplos streams na mesma conexão, bidirectional streaming (ex.: chat ou streaming de dados contínuos) quebra completamente; unary calls ficariam serializadas, causando alto tail latency e baixa throughput.
gRPC depende de trailers HTTP/2 para metadados de status e erro → O status final do RPC (OK, DEADLINE_EXCEEDED, etc.) é enviado via HTTP/2 trailers (após o body). HTTP/1.1 não tem trailers equivalentes de forma nativa e confiável → perda de informações críticas de erro/status, quebrando a semântica do RPC.

