---
layout: post
title: "Jornada para contribuir com o OTel Collector — Parte 1"
minute: 14
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


#### Glossário: o Go que aparece quando você abre um componente

Esta parte é o que eu queria ter tido no primeiro dia. Peguei o `receiver/nginxreceiver` do `opentelemetry-collector-contrib` como fio condutor, porque ele é pequeno e tem quase tudo. Os arquivos dele são estes:

```
config.go   factory.go   scraper.go   metadata.yaml   go.mod
config_test.go   factory_test.go   scraper_test.go
generated_component_test.go   generated_package_test.go
documentation.md   internal/   testdata/
```

Quase todo componente do repositório tem essa mesma forma. Entender esses arquivos é entender o projeto.

**Módulo (`go.mod`)** — o repositório tem mais de 400 arquivos `go.mod`. Cada componente é um módulo Go independente, com suas próprias dependências e sua própria versão. Isso existe para que quem usa só o `nginxreceiver` não arraste as dependências dos outros 400. Na prática, para você: rodar `go test` na raiz não testa o repositório inteiro, e adicionar uma dependência mexe no `go.mod` daquele componente, não num arquivo central.

**Interface** — em Go, uma interface é um contrato de métodos, e um tipo a satisfaz sem declarar nada. O contrato base aqui é `component.Component`, que pede `Start(context.Context, component.Host) error` e `Shutdown(context.Context) error`. Você nunca escreve "implements": basta ter os métodos com a assinatura certa. É por isso que, lendo um componente, você não encontra a palavra que ligaria o seu código ao framework — a ligação é implícita, e essa foi a coisa que mais me confundiu no começo.

**Factory** — o ponto de entrada de todo componente. É uma função que devolve um objeto capaz de criar o componente sob demanda, com a configuração padrão junto:

```go
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		metadata.Type,
		createDefaultConfig,
		receiver.WithMetrics(createMetricsReceiver, metadata.MetricsStability),
	)
}
```

O `WithMetrics` diz que este receiver produz métricas. Existem `WithTraces` e `WithLogs` para os outros sinais. Um componente que trabalha com os três registra os três, e cada um vem com seu próprio nível de estabilidade.

**`component.Config` e type assertion** — a configuração trafega como uma interface vazia, e a primeira coisa que a função de criação faz é converter para o tipo concreto:

```go
cfg := rConf.(*Config)
```

Esse `.(*Config)` é uma type assertion. Se o tipo não bater, entra em pânico — por isso vários componentes usam a forma de duas saídas, `cfg, ok := rConf.(*Config)`, e devolvem erro quando `ok` é falso.

**`mapstructure` e `squash`** — as tags nos campos do struct dizem como o YAML do usuário vira Go:

```go
type Config struct {
	ControllerConfig scraperhelper.ControllerConfig `mapstructure:",squash"`
	ClientConfig     confighttp.ClientConfig        `mapstructure:",squash"`
}
```

`squash` achata o struct embutido: em vez de o usuário escrever `client_config: {endpoint: ...}`, ele escreve `endpoint:` direto. É assim que blocos comuns como timeout, TLS e retry aparecem em dezenas de componentes com a mesma grafia sem ninguém reescrever a definição.

**`_ struct{}`** — aquele campo anônimo no fim de alguns `Config`. É um truque para impedir que alguém construa o struct sem nomear os campos (`Config{a, b}`), o que quebraria silenciosamente na hora que um campo novo fosse adicionado no meio.

**`context.Context`** — o primeiro parâmetro de quase toda função do projeto. Carrega cancelamento e prazo: quando o Collector desliga, ele cancela o context, e todo mundo que estava esperando algo deve desistir. Você o recebe em `Start`, em `Shutdown`, no `scrape` e no consumo de dados. A regra prática é: nunca guarde um `Context` dentro de um struct, passe-o adiante; e sempre respeite `ctx.Done()` em qualquer espera longa.

**Goroutine e `CancelFunc`** — a goroutine é a unidade de concorrência do Go, criada com `go func() { ... }()`. Receivers que ficam ouvindo uma porta vivem dentro de uma. O padrão do projeto é guardar o cancelamento no struct e usá-lo no `Shutdown`:

```go
func (r *statsdReceiver) Start(ctx context.Context, host component.Host) error {
	ctx, r.cancel = context.WithCancel(ctx)
	...
	go func() {
		if err := r.server.ListenAndServe(...); err != nil { ... }
	}()
```

Uma goroutine que ninguém encerra é um vazamento, e os testes do repositório verificam exatamente isso (veja `goleak`, mais abaixo).

**`consumer.Metrics` e `nextConsumer`** — o encanamento. Cada componente recebe o próximo da fila e entrega os dados a ele. Um processor tem a assinatura `createMetricsProcessor(ctx, set, cfg, nextConsumer consumer.Metrics)`, e é esse `nextConsumer` que forma o pipeline do arquivo de configuração. Não existe um orquestrador central mandando nos componentes: cada um só conhece o próximo.

**`Capabilities` e `MutatesData`** — a declaração de que o componente altera os dados que recebe:

```go
var processorCapabilities = consumer.Capabilities{MutatesData: true}
```

Isso não é decorativo. Quando um pipeline se ramifica para vários destinos, o Collector usa essa flag para decidir se precisa copiar os dados antes de entregar. Declarar errado gera corrupção difícil de rastrear.

**pdata (`pmetric`, `plog`, `ptrace`, `pcommon`)** — as estruturas que carregam telemetria. Não são structs comuns: são wrappers finos sobre a representação interna, e por isso se comportam como referências. Copiar a variável não copia o dado. O acesso também é diferente do Go idiomático — em vez de `range`, você navega com `Len()` e `At(i)`:

```go
for i := 0; i < resourceMetricsSlice.Len(); i++ {
	rm := resourceMetricsSlice.At(i)
	...
}
```

Esse formato existe por desempenho, já que o Collector move volumes altos. É o assunto que mais me custou tempo.

**Helpers** — pacotes que implementam o trabalho repetitivo para você não reescrever ciclo de vida, agendamento e observabilidade em cada componente. Os que você mais encontra: `scraperhelper` (agenda a coleta em intervalos e cuida do controller), `processorhelper` (transforma uma função `processMetrics` num processor completo), `exporterhelper` (fila, retry, timeout) e `receiverhelper` (o `ObsReport`, que emite as métricas internas do próprio componente). Reescrever à mão o que um helper já faz é o motivo mais comum de um PR voltar para revisão.

**`internal/`** — não é convenção do projeto, é regra da linguagem: pacotes dentro de um diretório `internal/` só podem ser importados de dentro daquela subárvore. É onde mora o código gerado e o que não é API pública do componente.

**mdatagen e `metadata.yaml`** — o gerador de código do projeto. Você descreve o componente em YAML — tipo, estabilidade, donos, e cada métrica com unidade e atributos — e o `mdatagen` gera o `internal/metadata`, a `documentation.md` e parte dos testes:

```yaml
status:
  class: receiver
  stability:
    beta: [metrics]
  distributions: [contrib]
  codeowners:
    active: [colelaven, ishleenk17]
```

Consequência prática: para adicionar ou mudar uma métrica você edita o YAML e roda `make generate`, não escreve o Go na mão.

**Código gerado** — arquivos que começam com `// Code generated by mdatagen. DO NOT EDIT.` Editar um deles significa perder a mudança na próxima geração, e o CI acusa a divergência.

**`MetricsBuilder`** — o objeto gerado a partir do `metadata.yaml` que você usa para registrar valores. Em vez de montar a estrutura pdata na mão, você chama métodos com nome tipado:

```go
now := pcommon.NewTimestampFromTime(time.Now())
r.mb.RecordNginxRequestsDataPoint(now, stats.Requests)
```

**`Settings` e `TelemetrySettings`** — o que o Collector entrega ao componente: logger, tracer, meter e informações de build. É de onde sai o `zap.Logger`, a biblioteca de log estruturado usada em todo o projeto:

```go
r.settings.Logger.Error("Failed to fetch nginx stats", zap.Error(err))
```

**`component.Host`** — a visão que o componente tem do processo em volta. Serve principalmente para alcançar extensions, por exemplo para obter um cliente HTTP já configurado com autenticação: `r.cfg.ClientConfig.ToClient(ctx, host.GetExtensions(), r.settings)`.

**Testes** — o repositório usa `testify` (`require` e `assert`) e um conjunto de pacotes de apoio terminados em `test`: `componenttest`, `receivertest`, `consumertest`. O padrão que aparece em todo componente é o dublê que não faz nada, `consumertest.NewNop()`, e as configurações vazias, `receivertest.NewNopSettings(typ)`.

**Testes de ciclo de vida** — gerados pelo `mdatagen` no `generated_component_test.go`. Eles criam o componente, sobem, derrubam, e repetem — checando que `Shutdown` funciona mesmo sem `Start`, e que subir duas vezes não quebra. É o teste que pega goroutine vazada e recurso não liberado, e ele existe sem você escrever nada.

**`goleak`** — a biblioteca que faz o teste falhar se sobrar goroutine viva no fim. É o `generated_package_test.go`. Se o seu componente esquecer de encerrar algo, é aqui que você descobre.

**`testdata/`** — os YAML de configuração usados nos testes, carregados com `confmaptest.LoadConf`. É o jeito do projeto de testar que a configuração do usuário é interpretada como se espera.

**chloggen** — o changelog não é escrito no `CHANGELOG.md`. Cada PR adiciona um arquivo YAML em `.chloggen/`, e a release junta tudo:

```yaml
change_type: bug_fix        # ou breaking, deprecation, new_component, enhancement
component: receiver/nginx
note: "Uma frase sobre a mudança"
issues: [12345]
```

Mudanças que não afetam quem usa entram como `[chore]` no título do PR e dispensam o arquivo. Esquecer o chloggen é o motivo mais comum de CI vermelho num primeiro PR.

**CODEOWNERS** — cada componente tem donos declarados no próprio `metadata.yaml`, e são eles que precisam aprovar. Marcar a pessoa certa no PR é o que faz a revisão andar.

**Estabilidade e distribuições** — `development`, `alpha`, `beta`, `stable`, e o campo `distributions` dizendo em quais binários oficiais o componente entra. Isso define o quanto você pode quebrar compatibilidade: em `alpha` mudar uma opção de configuração é aceitável, em `beta` já não é.
