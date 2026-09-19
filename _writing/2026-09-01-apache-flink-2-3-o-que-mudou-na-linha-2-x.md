---
layout: post
title: "Apache Flink 2.3: o que mudou na linha 2.x"
minute: 6
---

## Índice

- [Índice](#índice)
- [Onde a linha 2.x está hoje](#onde-a-linha-2x-está-hoje)
- [Estado desagregado](#estado-desagregado)
- [O que a 2.0 removeu](#o-que-a-20-removeu)
- [IA dentro do stream](#ia-dentro-do-stream)
- [Os destaques da 2.3](#os-destaques-da-23)

## Onde a linha 2.x está hoje

Na parte 1 de "Apache Flink: Aprendendo em Público" estudei o Flink sobre a linha 2.x sem parar para registrar onde essa linha está e o que cada salto trouxe. É o que faço aqui, como um anexo daquele texto. A versão estável no momento em que escrevo é a **2.3.0**, de 25 de junho de 2026. Em paralelo, a linha 1.x continua viva na **1.20**, que é a versão de suporte estendido (LTS) para quem ainda não migrou.

| Versão | Data | O que ela é |
|:--|:--|:--|
| 2.0.0 | mar/2025 | A quebra de compatibilidade. Estado desagregado e limpeza de APIs antigas. |
| 2.1.0 | jul/2025 | `ML_PREDICT` no SQL, primeiros passos de inferência dentro do stream. |
| 2.2.0 | dez/2025 | Modelos na Table API, busca vetorial, delta joins. |
| 2.3.0 | jun/2026 | SQL de changelog, S3 nativo, aplicação como conceito de primeira classe. |

## Estado desagregado

Esse é o item mais importante da linha 2.x, e vale entender o problema antes da solução. Nas versões anteriores, o estado quente vivia no disco local do TaskManager, normalmente sob o RocksDB. Isso é rápido, mas amarra o job ao hardware de três formas incômodas. O disco local é um recurso escasso e caro dentro de um contêiner, e um job com dezenas de terabytes de estado simplesmente não cabe. A compactação do RocksDB gera picos de CPU e de I/O que não têm relação nenhuma com o volume de eventos naquele instante, o que torna o dimensionamento um chute. E mudar o paralelismo obriga a redistribuir fisicamente todo esse estado entre as máquinas, o que faz um rescale de um job grande levar dezenas de minutos.

O estado desagregado inverte isso: o estado passa a viver no armazenamento remoto, e o disco local vira cache. O backend que implementa essa ideia se chama **ForSt**, de "For Streaming", e chegou com a 2.0. Ele não foi escrito do zero: é um fork do RocksDB mantido pela Ververica, modificado para ler e escrever direto no sistema de arquivos distribuído em vez de assumir disco local, com várias operações de I/O em paralelo. O código é aberto e vive fora do repositório do Flink, em [github.com/ververica/ForSt](https://github.com/ververica/ForSt), onde ele se descreve como "a persistent key-value store designed for streaming processing". Isso é o que torna o checkpoint barato: se o estado já está no armazenamento remoto, o checkpoint deixa de ser uma cópia e passa a ser quase só um ponteiro. Pelo mesmo motivo, o rescale deixa de precisar mover dados.

Herdar o RocksDB importa mais do que parece. Significa que a estrutura de armazenamento continua sendo a mesma LSM tree de sempre, com o mesmo comportamento de escrita, os mesmos níveis e a mesma compactação. O que mudou foi onde os arquivos ficam. Na prática, o conhecimento acumulado sobre ajustar RocksDB não foi jogado fora, ele só passou a conviver com uma camada de latência de rede no meio.

Existe um porém óbvio: ler estado pela rede a cada evento é ordens de magnitude mais lento que ler do disco local. A resposta para isso é a outra metade do trabalho, o **modelo de execução assíncrono**. O acesso ao estado é desacoplado do processamento, de modo que o operador não fica bloqueado esperando a resposta de uma leitura remota; ele dispara a requisição e segue processando outros registros, o que permite que muitas leituras estejam em voo ao mesmo tempo. Isso significa processar registros fora de ordem internamente, e a parte difícil da implementação foi justamente preservar as garantias que dependem de ordem: watermarks, timers e a ordenação por chave continuam se comportando como antes.

Sete operadores de SQL com estado (joins, agregações e janelas) foram reescritos sobre a API de estado assíncrona, e ficam atrás de uma configuração:

```yaml
table.exec.async-state.enabled: true
```

Os números que o projeto publicou, medidos com o Nexmark, ajudam a calibrar a expectativa. Em consultas pesadas de I/O, o estado desagregado entrega de 75% a 120% do throughput do estado local, ou seja, pode até ganhar. Em consultas com estado pequeno, de 10MB a 400MB, a diferença fica dentro de 10%. O ponto que eu tiro disso é que não se trata de um substituto universal: é a escolha certa quando o estado é grande demais para o disco local ou quando o rescale rápido importa mais que a latência mínima.

## O que a 2.0 removeu

A 2.0 foi a primeira quebra de compatibilidade em uma década, e a lista de remoções é grande o suficiente para atrapalhar quem tentar migrar sem ler. A API DataSet foi removida, e o caminho é DataStream ou Table API. As APIs em Scala saíram junto. `SourceFunction`, `SinkFunction` e o Sink V1 foram removidos em favor das interfaces novas de fonte e destino. O `flink-conf.yaml` deu lugar ao `config.yaml`, em YAML padrão de verdade, com mais de cem opções obsoletas eliminadas. O modo de execução per-job saiu, restando session e application. O Java 8 deixou de ser suportado, o 17 virou padrão e o 21 passou a ser oficial. E o detalhe que mais dói na prática: não há compatibilidade de estado entre 1.x e 2.x, então um savepoint antigo não é restaurável na 2.x.

## IA dentro do stream

Essa é a direção que o projeto vem seguindo desde a 2.1. A ideia é declarar um modelo como se declara uma tabela, com um provedor e credenciais, e então invocá-lo dentro da consulta. A 2.1 trouxe a função `ML_PREDICT` no SQL. A 2.2 levou isso para a Table API e adicionou `VECTOR_SEARCH`, que faz busca por similaridade contra um índice vetorial dentro do próprio fluxo, com modo assíncrono e timeout configuráveis. É o que torna viável enriquecer um evento com contexto recuperado no momento em que ele passa, sem sair para um serviço externo escrito à mão.

## Os destaques da 2.3

A 2.3 é uma versão de amadurecimento, com quinze FLIPs implementados. Os pontos que me pareceram mais relevantes:

A conversão de changelog ganhou sintaxe própria. `FROM_CHANGELOG` e `TO_CHANGELOG` fazem no SQL a travessia entre as formas que descrevi na seção de Flink SQL da parte 1, que antes ficava implícita na configuração da fonte. É o que resolve casos como arquivar um changelog em um tópico append-only e reinterpretá-lo como tabela dinâmica depois.

O filesystem S3 foi reescrito, e isso muda diretamente o que escrevi sobre deploy na parte 1. O plugin novo `flink-s3-fs-native` é uma implementação escrita do zero sobre o AWS SDK v2, com I/O não bloqueante e sem nenhuma dependência do Hadoop, e registra os esquemas `s3://` e `s3a://` com um espaço de configuração próprio (`s3.region`, `s3.endpoint`, `s3.upload.min.part.size`, `s3.async.enabled`, entre outros). Ele ainda é experimental, mas a intenção declarada é acabar com a escolha entre a implementação Presto e a Hadoop que descrevi lá.

A aplicação virou um conceito de primeira classe. Até aqui o modelo mental era cluster e job. A 2.3 introduz a aplicação acima disso, formando uma hierarquia de cluster, aplicação e job, com aba própria na interface web e o job linkando para a aplicação que o originou. É uma mudança de observabilidade, não de execução, e resolve o problema de olhar para um cluster com dezenas de jobs e não saber a qual entrega cada um pertence.

O checkpoint agora pode acontecer durante a recuperação. Antes, um job que estava se recuperando de um checkpoint unaligned não podia tirar um novo checkpoint até terminar, e uma segunda falha no meio desse processo jogava fora todo o trabalho de recuperação. A FLIP-547 permite disparar o checkpoint durante a recuperação, com duas chaves desligadas por padrão: `execution.checkpointing.unaligned.during-recovery.enabled` e `execution.checkpointing.unaligned.recover-output-on-downstream.enabled`. Vale para quem tem estado grande e rescale frequente.

O alinhamento de watermarks ganhou um buffer. O algoritmo de alinhamento foi redesenhado com um buffer, controlado por `pipeline.watermark-alignment.buffer-size` (padrão 3), que elimina atrasos de anúncio entre fontes. O efeito é sentido no processamento de backlog, quando o job precisa recuperar horas de atraso. Colocar o valor em zero restaura o comportamento da 2.2.

O particionamento ficou adaptativo. `RebalancePartitioner` e `RescalePartitioner` passam a distribuir dados olhando a carga real das tarefas de destino, em vez de fazer round-robin cego. Ativado com `taskmanager.network.adaptive-partitioner.enabled`, desligado por padrão. Ajuda quando o backpressure é desigual entre as instâncias.

A exportação de métricas OpenTelemetry ficou mais robusta, relevante para o que eu quero fazer: o exportador OTel ganhou compressão (`metrics.reporter.otel.exporter.compression: gzip`) e divisão em lotes (`metrics.reporter.otel.batch.size`), para dar conta de cargas de métricas grandes demais para o limite de mensagem do gRPC. Quem tem um job com paralelismo alto conhece esse erro.

Duas observações honestas para fechar. A primeira é que a maior parte desses destaques está desligada por padrão, o que é a postura correta para um projeto desse tamanho, mas significa que atualizar a versão não entrega nada disso sozinho. A segunda é que quase nada aqui eu testei: essa seção é leitura de release notes, não experiência. Fica anotado para as próximas partes.
