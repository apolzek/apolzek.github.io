---
layout: post
title: "Jornada para contribuir com o OTel Collector — Parte 1: o inventário do que eu não sei"
minute: 3
---

O plano era simples: escolher uma issue com a label `good first issue`, mandar um PR e ir dormir com a sensação boa de ter contribuído para o OpenTelemetry. O que aconteceu foi que eu abri o repositório, li três arquivos e percebi que não tinha ideia do que estava acontecendo ali.

Não é uma reclamação. É que a distância entre *usar* o Collector e *mexer* no Collector é maior do que eu imaginava. Então mudei o plano: em vez de forçar um PR, resolvi documentar a jornada inteira. Esta é a parte 1, e ela não tem uma linha de código — é só o mapa do território que eu ainda não conheço.

#### O que eu achava que precisava saber

Go. Só isso. Achei que era Go.

#### O que eu descobri que precisava saber

**Go, de verdade.** Não o Go de escrever um binário que chama uma API. O Go de interfaces, `context`, goroutines com ciclo de vida e generics espalhados pelo código. Dá pra ler sem isso; escrever, não.

**O modelo de componentes.** Receiver, processor, exporter, connector, extension. Todo o Collector é essa combinação, e antes de tocar em qualquer linha eu preciso saber em qual dessas caixas o meu problema mora. Passei um tempo achando que o que eu queria mexer era um processor quando era um receiver.

**pdata.** As estruturas internas (`pcommon`, `plog`, `pmetric`, `ptrace`) não são structs comuns — são wrappers sobre a representação interna, com regras próprias sobre cópia e mutação. É o tipo de coisa que o compilador deixa passar e o teste reprova.

**O repositório certo.** `collector` e `collector-contrib` são coisas diferentes, com critérios diferentes sobre o que entra. Descobrir isso *antes* de abrir o PR economiza uma conversa constrangedora.

**A burocracia boa.** CLA assinado, changelog gerado por ferramenta em vez de escrito na mão, `metadata.yaml` que gera código, testes de ciclo de vida que rodam sozinhos, e um CODEOWNERS que decide quem precisa aprovar. Nada disso é difícil. Tudo isso é invisível até você tropeçar.

#### O que fica desta parte

A primeira contribuição não começa no código, começa no inventário honesto do que você ainda não sabe. Escrever essa lista foi desconfortável e, justamente por isso, útil: agora eu tenho itens pra riscar em vez de uma sensação vaga de estar perdido.

Na **parte 2**, eu paro de fazer lista e começo a subir o ambiente: compilar o Collector do zero, rodar os testes e ver o que quebra. Aposto que quebra bastante.
