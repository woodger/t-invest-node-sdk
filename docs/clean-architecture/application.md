# Application-слой

> Type: Design Note. Документ фиксирует роль `application`-слоя в текущем SDK.
> Canonical границы слоев описаны в [Архитектура SDK](../architecture.md).

## Главная Идея

`application` содержит код, который должен оставаться независимым от runtime
entrypoints и конкретных transport/infrastructure деталей.

В Inventory application уже содержит use-case-ы, ports, reports, services и
pipeline orchestration. В текущем SDK этот слой меньше: есть только contracts и
reusable правила, которые нужны SDK facade и CLI-командам.

## Что Сейчас Есть В `application`

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
    unary-throttle.service.ts
```

Текущие зоны:

- `application/dto` - входные SDK options и application-level contracts;
- `application/errors` - стабильные transport-neutral errors и runtime guards;
- `application/reports` - стабильные output/report contracts API-команд;
- `application/services` - reusable application rules, например unary
  scheduling по transport-neutral `ThrottleRule`.

## Что Допустимо В `application`

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

## Отчёты

`application/reports` описывает, что команда сообщает наружу, но не решает,
как это показать пользователю.

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

Report contract не должен импортировать `bootstrap` или concrete
infrastructure. Он может быть использован CLI, тестом, будущим HTTP transport
или file writer без изменения семантики.

## Ошибки

`application/errors/sdk-error.ts` задает публичные `SdkError`,
`SdkErrorCode`, `SdkErrorSource` и `isSdkError()`, не импортируя `nice-grpc`.
Infrastructure преобразует известные gRPC failures в этот contract, а
bootstrap facade создает lifecycle error после `close()`. Исходная ошибка
сохраняется как `cause`. Однозначные ошибки проверки TLS certificate chain и
hostname получают source `tls`, не меняя code `Unavailable`; обычные provider
и network failures сохраняют source `grpc`.

Error code предоставляет классификацию, но не объявляет операцию retryable:
решение о повторе дополнительно зависит от idempotency, provider metadata и
backoff policy Consumer-а.

## Сервисы

`application/services` подходит для небольших правил, которые:

- используются runtime-кодом;
- не являются transport/infrastructure detail;
- не требуют конкретного SDK adapter-а;
- имеют самостоятельное поведение и тесты.

`Throttle` получает только готовые `bucket` и `limitPerMinute`. Сопоставление
gRPC method path с service/method rule остается в transport adapter-е.
`AbortSignal` отменяет ожидающую reservation; scheduler удаляет ее из bucket
queue и не знает, какой transport должен был выполнить вызов.

Если helper используется один раз и не выражает отдельное правило, его лучше
оставить рядом с consumer-ом.

## Чего Сейчас Нет

В текущем SDK пока нет:

- `application/use-cases`;
- `application/ports`;
- `domain`.

Их не нужно создавать заранее. Добавление такой директории допустимо только
когда появляется реальная ответственность:

- use-case - если команда начинает координировать сценарий, а не просто
  вызывает один SDK method;
- port - если application должен описать внешнюю возможность без знания
  concrete adapter-а;
- domain - если появляются provider-neutral правила или модели.

## Короткие Правила

- `application` описывает внутренний контракт, а не формат пользовательского
  вывода.
- Provider/gRPC mapping не должен протекать в чистые application contracts.
- Bootstrap может вызывать application, но application не импортирует bootstrap.
- Если output formatting содержит бизнес-семантику, нужно решить, это report
  contract, application service или adapter logic.
