# Application-слой

> Type: Design Note. Здесь описаны роль `application`-слоя, DTO, отчёты и mapping между boundaries текущего SDK. Canonical-границы слоёв приведены в документе [«Архитектура SDK»](../architecture.md).

## Главная идея

`application` не должен зависеть от runtime entrypoints и конкретных деталей transport/infrastructure.

В Inventory application уже содержит use-case-ы, ports, reports, services и pipeline orchestration. В текущем SDK этот слой меньше: есть только contracts и reusable правила, которые нужны SDK facade и CLI-командам.

## Что сейчас есть в `application`

```text
src/application
  dto/
    t-invest-options.ts
    t-invest-services.ts
  errors/
    sdk-error.ts
  reports/
    *.report.ts
    index.ts
  services/
    unary-limiter.ts
```

Текущие зоны:

- `application/dto` - входные SDK options и application-level contracts;
- `application/errors` - стабильные transport-neutral errors и runtime guards;
- `application/reports` - стабильные output/report contracts API-команд;
- `application/services` - application ports и reusable правила, например `TInvestUnaryLimiter` и его необязательная process-local реализация.

## Что допустимо в `application`

`application` может содержать:

- request/result contracts, которые не завязаны на CLI parser;
- report contracts для output boundary;
- application services с переиспользуемыми правилами;
- будущие use-case-ы и ports, если команды перестанут быть тонкими SDK calls;
- application-level ошибки, если появятся сценарные решения.

`application` не должен знать про:

- `nice-grpc` channel/client creation;
- `process.env`;
- CLI parser details;
- stdout/stderr;
- filesystem paths;
- concrete infrastructure modules.

## Контракты и DTO

В текущем проекте есть несколько разных типов contracts, и их нельзя смешивать:

- proto-generated DTO из `src/generated/*.ts`;
- application DTO из `src/application/dto/**`;
- application report contracts из `src/application/reports/**`;
- CLI command option schemas из `src/bootstrap/commands/**` и общие SDK options из `src/bootstrap/args/**`.

## Сгенерированные DTO

Vendored T-Invest proto-файлы хранятся в плоской структуре `contracts/*.proto`. Генератор зеркально создаёт из этого layout файлы `src/generated/*.ts`. `contracts/upstream.json` указывает официальный upstream snapshot.

Это wire contracts внешнего API. Их нельзя редактировать вручную и нельзя использовать как место для project-specific правил.

Допустимо:

- импортировать generated types в infrastructure adapters;
- использовать generated service definitions при создании gRPC clients внутри bootstrap/infrastructure;
- использовать generated request/response DTO в package-owned public service interfaces SDK facade.

Нежелательно:

- делать generated DTO основой новых application reports;
- добавлять handwritten mapping или helpers в generated файлы;
- завязывать CLI output format на нестабильный generated JSON shape.
- экспортировать generated service clients как root public API.

Исключение — server-side generated `*ServiceDefinition` и `*ServiceImplementation`. Они входят в root public API, потому что пакет поддерживает nice-grpc server adapters у Consumers.

## DTO уровня application

`src/application/dto/t-invest-options.ts` описывает options SDK facade.

Это не CLI DTO и не gRPC DTO. Один и тот же contract может использоваться из bootstrap, tests и публичного SDK facade.

Правило:

```text
CLI/env parsing -> TInvestOptions -> SDK facade/infrastructure
```

`application/dto` не должен читать env и не должен знать про CLI flags.

`src/application/dto/t-invest-services.ts` описывает публичные service interfaces SDK facade: `UsersService`, `OrdersService`, `MarketDataStreamService` и другие. Эти interfaces сохраняют upstream method names и generated request/response DTO, но не раскрывают `nice-grpc` `*ServiceClient`, `*ServiceDefinition`, `CallOptions` или `CallContext`.

## Отчёты

`application/reports` описывает, что команда сообщает наружу, но не решает, как это показать пользователю.

Пример ответственности:

```text
application/reports
  shape stable output

CLI adapter/reporter
  report -> JSON/CSV/table/string

icore TerminalApp/Output
  normal string/stream -> TerminalApp -> Output.write -> stdout
  warnings/errors -> Output.error -> stderr
```

Report contract не должен импортировать `bootstrap` или concrete infrastructure. Его можно без изменения семантики использовать в CLI, тестах, будущем HTTP transport или file writer.

## Ошибки

`application/errors/sdk-error.ts` задаёт публичные `SdkError`, `SdkErrorCode`, `SdkErrorSource` и `isSdkError()` без импорта `nice-grpc`. Infrastructure преобразует известные gRPC failures в этот contract, а bootstrap facade создаёт lifecycle error после `close()`. Поле `cause` сохраняет исходную ошибку. Однозначные ошибки проверки TLS certificate chain и hostname получают source `tls` с прежним code `Unavailable`; обычные provider и network failures сохраняют source `grpc`.

Error code классифицирует ошибку, но не делает операцию retryable. Принимая решение о повторе, Consumer должен также учитывать idempotency, provider metadata и backoff policy.

## Сервисы

`application/services` подходит для небольших правил, которые:

- используются runtime-кодом;
- не являются transport/infrastructure detail;
- не требуют конкретного SDK adapter-а;
- имеют самостоятельное поведение и тесты.

`TInvestUnaryLimiter` получает готовые `path`, `bucket`, `maxRequests`, `windowMs` и `AbortSignal`. Сопоставление gRPC method path с service/method rule остаётся в transport adapter-е. Consumer может реализовать port без deep imports; SDK не владеет lifecycle переданного объекта.

`createInMemoryUnaryLimiter()` создаёт необязательную реализацию с отменяемой bucket queue. Её `quotaShare` задаёт статическую долю исходных квот, не меняя контекст публичного port-а. Реализация не знает, какой transport выполняет вызов, и не координирует другие процессы.

Если helper нужен один раз и не выражает отдельное правило, оставьте его рядом с consumer-ом.

## Чего сейчас нет

В текущем SDK пока нет:

- `application/use-cases`;
- `domain`.

Не создавайте эти директории заранее. Они нужны только вместе с реальной ответственностью:

- use-case - если команда начинает координировать сценарий, а не просто вызывает один SDK method;
- domain - если появляются provider-neutral правила или модели.

## Входные данные CLI

Raw `process.argv` остаётся на executable-границе `src/bootstrap/index.ts`. Затем `bootstrap/cli/runner.ts` передаёт argv в terminal app и command registry из `icore`:

```text
process.argv -> src/bootstrap/index.ts -> bootstrap/cli/runner.ts -> icore terminal app -> command registry -> typed command options -> command handler
```

Runner использует двухфазный flow `prepare -> runPrepared`, чтобы вывести warnings после command resolution без повторного разбора argv. Policy из `bootstrap/cli/error.ts` обрабатывает ошибки всех terminal-фаз. `isUsageError()` из `icore` распознаёт framework usage errors и публичный `CliUsageError` от project validators; для них exit code равен `2`. Runtime и command-definition errors получают exit code `1`.

Command-specific primitive options описываются декларативными `icore` schemas в `src/bootstrap/commands/**`. Общие SDK options нормализуются в `src/bootstrap/args/**`. Эти модули не должны создавать SDK clients, вызывать API или форматировать reports.

После `icore` validation command handler работает с typed command options. Raw CLI option maps не должны передаваться ни в command-local parser helpers, ни в request builders. Project-specific `parse*` helper может преобразовывать отдельное уже типизированное значение, например RFC 3339 date-time или comma-separated список. Mapping typed options в generated request DTO должен жить в `create*Request` helper-е.

## Mapping

Текущий flow API-команды:

```text
process.argv
  -> icore terminal app
  -> icore schema parser/validator
  -> typed command options
  -> project API-specific validation
  -> generated request DTO
  -> generated SDK call
  -> application report или command-local stream event contract
  -> CLI output
```

Где должен жить mapping:

| Mapping | Текущее место | Возможное целевое место |
| --- | --- | --- |
| typed command options -> `TInvestOptions` | `bootstrap/args` | без изменений |
| typed command options -> generated request DTO | command-local `cli.ts` или `request.mapper.ts`, `create*Request` | application use-case, если command перестает быть тонким adapter-ом |
| generated unary response -> application report | `bootstrap/commands/*/reporter.ts` | CLI adapter или application use-case, зависит от выбранной границы |
| stream event -> command-local event contract | `bootstrap/commands/stream-run/reporter.ts` | application report, если contract потребуется вне CLI |
| report/event contract -> command-specific output values | `bootstrap/commands/*/reporter.ts` | без изменений для компактного Inventory-style CLI |
| output values -> JSON/CSV/table | публичные `renderJson`, `renderCsv`, `renderCsvRow`, `renderTextTable` из `icore`, вызываемые reporter-ами | command-specific поля и структура остаются в reporter-е |
| string/stream -> stdout | `icore` `TerminalApp`/`Output.write`, собираемые в `bootstrap/cli/runner.ts` | штатный normal output wiring остается в runner-е |
| warning/error -> stderr | `icore` `Output.error`; project CLI/error policy владеет содержанием | без изменений |

## Типичные ошибки

- передавать raw CLI args глубже bootstrap boundary;
- смешивать raw CLI parsing и generated request DTO mapping в одной функции;
- форматировать пользовательский output внутри application report contract;
- класть JSON/CSV/table logic в stdout sink;
- считать generated DTO стабильным CLI output contract;
- создавать generic DTO только ради красивой структуры.

## Короткие правила

- DTO и reports - это boundary contracts, а не domain models.
- Application reports стабильны и transport-neutral.
- `application` описывает application-level контракт, а не формат пользовательского вывода.
- Provider/gRPC mapping не должен протекать в чистые application contracts.
- Bootstrap может вызывать application, но application не импортирует bootstrap.
- Если output formatting содержит бизнес-семантику, нужно решить, это report contract, application service или adapter logic.
