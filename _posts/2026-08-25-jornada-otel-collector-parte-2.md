---
layout: post
title: "Jornada para contribuir com o OTel Collector, parte 2"
minute: 6
---

Na parte 1 eu listei o que precisava aprender. Antes de estudar qualquer coisa dessa lista, resolvi fazer um exercício mais básico: pegar um componente que já existe, mudar alguma coisa nele, gerar um binário com a mudança, rodar os testes e ver o efeito acontecendo de verdade.

A ideia não é contribuir com isso. É provar que consigo fechar o ciclo. Enquanto eu não conseguisse fazer uma alteração chegar até um Collector rodando, qualquer estudo seria teórico.

Escolhi o `filterprocessor` e inventei uma tarefa sem valor nenhum para o projeto, mas útil para mim: quando aparecer um trace com `service.name` igual a `trying`, o processor deve registrar uma marca minha no log junto com o dado inteiro em JSON.

#### Passo 1: baixar só o que interessa

O `contrib` é grande. Como cada componente é um módulo separado, dá para clonar só o pedaço necessário.

```sh
mkdir -p /tmp/otel-lab && cd /tmp/otel-lab
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/open-telemetry/opentelemetry-collector-contrib.git
cd opentelemetry-collector-contrib
git sparse-checkout set processor/filterprocessor internal pkg
```

Isso deixou 25 MB em disco em vez do repositório inteiro. Precisei incluir `internal` e `pkg` porque o `go.mod` do `filterprocessor` aponta para eles com caminhos relativos.

#### Passo 2: escrever a alteração

Criei um arquivo novo, `trying.go`, em vez de espalhar código no `traces.go`. A função varre os resources procurando o atributo, e serializa o lote inteiro usando o marshaler que o próprio pdata oferece.

```go
const tryingServiceName = "trying"

var tryingMarshaler = &ptrace.JSONMarshaler{}

func logTryingTraces(logger *zap.Logger, td ptrace.Traces) {
	if logger == nil || !hasTryingService(td) {
		return
	}
	raw, err := tryingMarshaler.MarshalTraces(td)
	if err != nil {
		logger.Error("apolzek was here: could not marshal traces", zap.Error(err))
		return
	}
	logger.Info("apolzek was here",
		zap.String("service.name", tryingServiceName),
		zap.Int("spans", td.SpanCount()),
		zap.String("payload", string(raw)),
	)
}
```

A chamada entrou no início de `processTraces`. Esse detalhe importa: a função tem um retorno antecipado logo abaixo, que sai na hora quando nenhuma condição de filtro está configurada. Se eu tivesse colocado a chamada depois dele, o teste manual não mostraria nada e eu passaria um tempo procurando erro no lugar errado.

```go
func (fsp *filterSpanProcessor) processTraces(ctx context.Context, td ptrace.Traces) (ptrace.Traces, error) {
	logTryingTraces(fsp.logger, td)

	if fsp.skipResourceExpr == nil && fsp.skipSpanExpr == nil && ...
```

#### Passo 3: testar

Escrevi um teste usando o observador de logs do zap, que captura o que foi registrado sem precisar ler saída de terminal. Cobri o caso que casa, um serviço diferente, um nome que só começa com `trying`, o nome vazio, o logger nulo e um `service.name` que não é string.

```
=== RUN   TestLogTryingTraces
=== RUN   TestLogTryingTraces/matches
=== RUN   TestLogTryingTraces/different_service
=== RUN   TestLogTryingTraces/prefix_only
=== RUN   TestLogTryingTraces/empty
--- PASS: TestLogTryingTraces (0.00s)
--- PASS: TestLogTryingTracesNilLogger (0.00s)
--- PASS: TestHasTryingServiceNonStringAttribute (0.00s)
```

Depois rodei a suíte inteira do componente, que é o que de fato responde se eu quebrei alguma coisa. Foram 82 testes, nenhuma falha.

```sh
go test ./...
ok  github.com/open-telemetry/opentelemetry-collector-contrib/processor/filterprocessor  1.319s
```

#### Passo 4: gerar um Collector com a alteração

O binário oficial não serve, porque ele traz o `filterprocessor` publicado, não o meu. Para isso existe o OCB, o OpenTelemetry Collector Builder, que monta um Collector sob medida a partir de uma lista de componentes.

```sh
go install go.opentelemetry.io/collector/cmd/builder@v0.144.0
```

A parte central da configuração é o `replaces`, que manda o Go usar minha cópia local no lugar do módulo publicado.

```yaml
dist:
  name: otelcol-lab
  output_path: /tmp/otel-lab/build/otelcol-lab
  otelcol_version: 0.144.0

receivers:
  - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.144.0
processors:
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/filterprocessor v0.144.0
exporters:
  - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.144.0

replaces:
  - github.com/open-telemetry/opentelemetry-collector-contrib/processor/filterprocessor => /tmp/otel-lab/opentelemetry-collector-contrib/processor/filterprocessor
```

Antes de rodar, conferi se o binário realmente tinha meu código dentro, o que é mais rápido do que descobrir isso depois pelo silêncio no log:

```sh
strings otelcol-lab | grep -c "apolzek was here"
2
```

Saíram 35 MB de binário com um receiver, um processor e um exporter.

#### Passo 5: rodar e enviar dados

Subi o Collector com um pipeline de traces mínimo, recebendo OTLP por HTTP e escrevendo no exportador de debug. Enviei dois traces por `curl`, iguais em tudo menos no `service.name`.

O primeiro, com `service.name` igual a `checkout`, para confirmar que a alteração não dispara em qualquer coisa:

```
HTTP 200
ocorrencias de 'apolzek was here' no log: 0
```

O segundo, com `service.name` igual a `trying`:

```
HTTP 200
ocorrencias de 'apolzek was here' no log: 1
```

#### A prova

A linha que apareceu no log do Collector:

```
2026-08-25T14:32:47.120-0300  info  filterprocessor@v0.144.0/trying.go:47
apolzek was here
{"otelcol.component.id": "filter", "otelcol.component.kind": "processor",
 "otelcol.pipeline.id": "traces", "otelcol.signal": "traces",
 "service.name": "trying", "spans": 1,
 "payload": "{\"resourceSpans\":[{\"resource\":{\"attributes\":[{\"key\":\"service.name\",
 \"value\":{\"stringValue\":\"trying\"}},{\"key\":\"deployment.environment\",
 \"value\":{\"stringValue\":\"lab\"}}]},\"scopeSpans\":[{\"scope\":{\"name\":\"manual-curl\"},
 \"spans\":[{\"traceId\":\"5b8efff798038103d269b633813fc60c\",
 \"spanId\":\"eee19b7ec3c1b174\",\"name\":\"GET /checkout\",\"kind\":2,
 \"startTimeUnixNano\":\"1544712660000000000\",\"endTimeUnixNano\":\"1544712661000000000\",
 \"attributes\":[{\"key\":\"http.method\",\"value\":{\"stringValue\":\"GET\"}}],
 \"status\":{}}]}]}]}"}
```

Repare no caminho do arquivo no início da linha: `filterprocessor@v0.144.0/trying.go:47`. O componente se apresenta com a versão publicada, mas está executando o arquivo que eu criei. É o `replaces` funcionando.

#### O que ficou

O ciclo fecha: editar, testar, gerar binário, rodar, ver acontecer. Isso é o que eu não sabia fazer na semana passada, e é pré-requisito para qualquer coisa útil depois.

Duas coisas me pegaram. A primeira foi o retorno antecipado no `processTraces`, que me faria depurar no lugar errado. A segunda foi perceber que testar exige montar um Collector próprio, porque o binário oficial nunca vai conter a minha alteração.

Nada disso vira pull request. É andaime, e andaime se descarta. Mas agora, quando eu pegar uma issue de verdade, a parte mecânica já está resolvida.
