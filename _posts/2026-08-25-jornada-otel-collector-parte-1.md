---
layout: post
title: "Jornada para contribuir com o OTel Collector, parte 1"
minute: 10
---

O plano era simples: escolher uma issue com a label `good first issue`, mandar um PR e ir dormir com a sensação boa de ter contribuído para o OpenTelemetry Collector. O que aconteceu foi que eu abri o repositório, li três arquivos e percebi que não tinha ideia do que estava acontecendo ali xD

Não é uma reclamação. É que a distância entre *usar* o Collector e *mexer* no Collector é maior do que eu imaginava. Então mudei o plano: em vez de forçar um PR, resolvi documentar a jornada inteira. 

Antes de seguir, é importante contextualizar meu nível de conhecimento. Não sou um desenvolvedor proficiente em Go. Atuo principalmente nas áreas de Engenharia de Confiabilidade e Engenharia de Plataforma. Tenho uma base sólida em programação, algoritmos, estruturas de dados e design patterns, mas, no dia a dia, meu trabalho atualmente está mais concentrado em configurações, infraestrutura e automação do que no desenvolvimento de código propriamente dito. 

#### O que eu achava que precisava saber

Golang =))

#### O que eu descobri que precisava saber

**Go, de verdade.** Não o Go de escrever um binário que chama uma API. O Go de interfaces, `context`, goroutines com ciclo de vida e generics espalhados pelo código. Dá pra ler sem isso; escrever, não.

**O modelo de componentes.** Receiver, processor, exporter, connector, extension. Todo o Collector é essa combinação, e antes de tocar em qualquer linha eu preciso saber em qual dessas caixas o meu problema mora.

**pdata.** As estruturas internas (`pcommon`, `plog`, `pmetric`, `ptrace`) não são structs comuns.. são wrappers sobre a representação interna, com regras próprias sobre cópia e mutação. É o tipo de coisa que o compilador deixa passar e o teste reprova.

**O repositório certo.** `collector` e `collector-contrib` são coisas diferentes, com critérios diferentes sobre o que entra. Descobrir isso *antes* de abrir o PR economiza uma conversa constrangedora.

**A burocracia boa.** CLA assinado, changelog gerado por ferramenta em vez de escrito na mão, `metadata.yaml` que gera código, testes de ciclo de vida que rodam sozinhos, e um CODEOWNERS que decide quem precisa aprovar. Nada disso é difícil. Tudo isso é invisível até você tropeçar.


#### Conceitos de Go e do Collector

Esta parte reúne os conceitos que eu precisei entender para conseguir ler o código. Usei o `receiver/nginxreceiver` do `opentelemetry-collector-contrib` como referência, porque ele é pequeno e tem quase tudo que existe nos outros componentes.

#### Organização do repositório

O `contrib` não é um projeto Go. São mais de quatrocentos. Cada componente tem seu próprio `go.mod`, ou seja, é um módulo independente, com dependências e versão próprias.

A razão é evitar peso desnecessário. O receiver do nginx depende de uma biblioteca de nginx, o exporter da AWS depende do SDK da AWS. Num módulo único, quem quisesse apenas ler métricas de nginx carregaria também o SDK da AWS.

Para quem contribui isso significa duas coisas. Não existe "rodar os testes do projeto": você roda os testes do componente em que está mexendo. E adicionar uma dependência altera o `go.mod` daquela pasta, não um arquivo central.

Dentro de cada componente existe uma pasta `internal/`. Isso é regra da linguagem, não convenção do projeto: o Go proíbe que código de fora importe qualquer coisa sob um `internal/`. É onde fica o que pode mudar sem aviso.

#### Interfaces

Uma interface em Go é uma lista de métodos. Qualquer tipo que tenha esses métodos satisfaz a interface automaticamente, sem declarar nada. Não existe `implements` como em Java ou C#.

Comparando: em outras linguagens você entra no clube preenchendo a ficha de inscrição. Em Go você entra por já estar com o uniforme certo. Ninguém registra a associação, o porteiro só confere a roupa.

O contrato mínimo do Collector se chama `component.Component` e pede dois métodos: um para iniciar e um para encerrar. Se o seu tipo tem os dois, ele é um componente.

Essa é a explicação para algo que me travou no início: eu procurava no código a linha que conecta o componente ao Collector e não encontrava. Ela não existe. A conexão é a assinatura dos métodos.

#### Componentes

São cinco tipos. Receiver recebe dados, processor transforma, exporter envia para fora, connector liga a saída de um pipeline à entrada de outro, extension oferece serviços de apoio como autenticação.

Antes de escrever qualquer linha é preciso saber em qual desses tipos o seu problema mora. Um comportamento errado na coleta é assunto de receiver, mesmo que apareça depois.

#### Factory

A factory é o objeto que sabe criar o componente. Ela não é o componente.

Essa separação existe porque o Collector precisa conhecer a configuração padrão antes de qualquer componente existir, para validar o YAML do usuário. Então a factory expõe duas coisas: uma função que devolve a configuração padrão e uma função que cria o componente quando solicitado.

A factory também declara com quais sinais o componente trabalha, métricas, traces ou logs, e o nível de estabilidade de cada um. Um mesmo componente pode estar estável para métricas e experimental para logs.

#### Configuração

A configuração trafega pelo sistema como um tipo genérico. A primeira coisa que a função de criação faz é convertê-la para o tipo concreto do componente. Essa conversão se chama type assertion.

Ela pode falhar. Se o tipo não for o esperado, o programa quebra, a menos que você use a forma de duas saídas, que devolve também um booleano informando se deu certo. É por isso que vários componentes escrevem essa conversão em duas linhas e retornam erro.

O YAML vira struct por meio de anotações nos campos, chamadas tags. A mais comum achata um struct dentro de outro. É esse achatamento que faz opções como timeout, TLS e retry aparecerem com a mesma grafia em dezenas de componentes sem ninguém redigitar a definição.

#### Pipeline e consumers

Não existe um orquestrador central. Cada componente recebe, no momento em que é criado, uma referência ao próximo da fila, e entrega o resultado a ele.

O pipeline que você escreve no YAML é essa corrente sendo montada na inicialização. Um processor não sabe quem veio antes nem qual é o destino final. Ele conhece apenas o próximo.

Cada componente declara também se altera os dados que recebe. Essa declaração não é informativa: quando um pipeline se ramifica para vários destinos, o Collector a consulta para decidir se precisa copiar os dados antes de entregar. Declarar errado produz corrupção difícil de rastrear.

#### pdata

São os tipos que carregam a telemetria: `pmetric`, `plog`, `ptrace` e `pcommon`. Eles parecem structs comuns e não são. São invólucros sobre uma estrutura compartilhada, então se comportam como referência. Copiar a variável não copia o dado.

Comparando: pdata é a chave de um armário, não o conteúdo do armário. Passar a chave adiante não duplica nada, e se duas pessoas têm a chave, o que uma alterar a outra enxerga.

Esse foi o conceito que mais me custou tempo, porque o compilador não acusa nada. O problema só aparece quando dois destinos do mesmo pipeline começam a interferir um no outro.

O acesso também é diferente do Go comum. Em vez de percorrer uma lista com `range`, você pergunta o tamanho e pede o item de cada posição. É mais verboso de propósito: o Collector move volumes altos e essa forma evita cópias.

#### Context

Quase toda função do projeto recebe um `context` como primeiro parâmetro. Ele carrega prazo e cancelamento e serve para propagar uma ordem de parada por toda a cadeia de chamadas.

Comparando: é um bilhete que acompanha o trabalho de mão em mão. Quando o Collector começa a desligar, ele invalida o bilhete original, e quem estiver segurando uma cópia percebe e desiste do que estava fazendo.

Duas regras práticas: não guarde o context dentro de um struct, passe adiante; e verifique se ele foi cancelado em qualquer espera longa.

#### Goroutines

Goroutine é a unidade de concorrência do Go, criada com `go func()`. São baratas o bastante para existirem aos milhares. Receivers que ficam ouvindo uma porta rodam dentro de uma.

O padrão do projeto é guardar a função de cancelamento no struct do componente durante a inicialização e chamá-la no encerramento. Sem isso a goroutine continua viva depois que o componente morreu, o que é um vazamento.

#### Helpers

São pacotes que já implementam o trabalho repetitivo: agendar coleta em intervalos regulares, transformar uma função de transformação num processor completo, cuidar de fila, retry e timeout no envio.

Reimplementar à mão o que um helper já resolve é o motivo mais comum de um pull request voltar da revisão. Se você está escrevendo um laço com timer para coletar de tempos em tempos, provavelmente existe um helper para isso.

#### Código gerado

Boa parte do código de um componente não é escrita à mão.

Existe um arquivo `metadata.yaml` que descreve o componente: o tipo, o nível de estabilidade, quem são os donos, e cada métrica com sua unidade e seus atributos. Uma ferramenta lê esse arquivo e gera o código Go que registra as métricas, a documentação em markdown e parte dos testes.

Na prática, para adicionar uma métrica você edita o YAML e roda a geração. Não escreve o Go.

Os arquivos gerados começam com um aviso de que não devem ser editados. O CI compara o conteúdo do repositório com o que a ferramenta produziria e reprova se alguém editou à mão.

#### Testes

Os testes usam dublês para o que está em volta: um consumidor que descarta o que recebe, configurações vazias. Isso mantém o teste focado no componente, sem precisar de um Collector completo em execução.

Dois testes vêm prontos, gerados a partir do `metadata.yaml`. O primeiro é de ciclo de vida: inicia o componente, encerra, inicia de novo, encerra sem nunca ter iniciado, e verifica que nada disso quebra. O segundo checa, ao fim do pacote, se sobrou alguma goroutine viva.

Esse par cobre recurso não liberado e vazamento de goroutine sem você escrever nada.

#### Changelog e revisão

O changelog não é escrito no arquivo de changelog. Cada pull request adiciona um YAML pequeno numa pasta própria, informando o tipo da mudança, o componente afetado, uma frase de descrição e a issue relacionada. A release junta tudo.

Mudanças que não afetam quem usa dispensam esse arquivo, mas precisam ser marcadas como tal no título do pull request. Esquecer isso é o motivo mais comum de CI vermelho num primeiro envio.

Cada componente tem donos declarados no próprio `metadata.yaml`, e são eles que aprovam.

Cada componente tem também um nível de estabilidade, de `development` até `stable`, além da lista de distribuições oficiais em que entra. Isso define o quanto se pode quebrar compatibilidade: renomear uma opção de configuração é aceitável em `alpha` e é um problema sério em `beta`.
