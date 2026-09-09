# Архитектура SDK

> Type: Reference. Здесь показана текущая карта слоёв SDK. Правила задаёт [архитектурная политика](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/architecture.md), а варианты развития собраны в [заметках по Clean Architecture](./clean-architecture/index.md).

Проект использует Clean Architecture Lite. Слои выделяются только там, где у кода есть самостоятельная ответственность.

## Карта слоев

```text
src/bootstrap
  -> src/infrastructure
  -> src/application
  -> external icore CLI/presentation/output API

src/infrastructure
  -> src/application

src/application
  -> чистые DTO и application services

src/generated
  -> generated proto contracts in flat source layout
```

Отдельного `src/domain` сейчас нет: SDK не содержит самостоятельной доменной модели, отделённой от gRPC contract. Этот слой понадобится только вместе с реальными provider-neutral правилами или моделями.

## `application`

В `application` находятся contracts и reusable-правила, которые не зависят от `nice-grpc`.

Текущие зоны:

- `application/dto` - входные SDK options и другие application-level contracts;
- `application/dto/t-invest-services.ts` - публичные package-owned service interfaces SDK facade, отделенные от generated `*ServiceClient`;
- `application/errors` - transport-neutral `SdkError`, стабильные symbolic codes и runtime narrowing;
- `application/reports` - стабильные output/report contracts API-команд;
- `application/services` - transport-neutral unary limiter port и его необязательная process-local реализация.

## `infrastructure`

В `infrastructure` находятся внешние технологии и adapter-level wiring.

Текущие зоны:

- `infrastructure/transport/grpc` - создание `nice-grpc` channel, metadata, middleware и typed clients, а также построение и разрешение полных gRPC paths в transport-neutral quotas. Выполнение middleware отделено от классификации transport failures в `sdk-call-error.ts`.
- `infrastructure/interceptor` - технический hook для фильтрации известных process warnings.
- `infrastructure/report-values.ts` - общие scalar adapters, которые преобразуют `MoneyValue`, `Quotation`, `Date` и другие значения provider DTO в стабильные report values. Десятичная строка собирается из целых `units` и `nano` без преобразования во floating point и связанной с ним потери точности. `MoneyValue` преобразуется в структурный `ReportMoney`, а command-specific table/text представление строится отдельно. Этот модуль не выбирает поля команд и не формирует command-specific output contracts.

Здесь допустимы imports из `nice-grpc`, generated service definitions и application services. Application не должен импортировать concrete infrastructure modules.

## `bootstrap`

Runtime entrypoints разделены на публичные package entrypoints и внутреннюю bootstrap-механику.

Текущие зоны:

- `bootstrap/index.ts` - executable CLI entrypoint, который публикуется как package binary `dist/bootstrap/index.js`;
- `bootstrap/t-invest-node-sdk.ts` - публичный runtime facade SDK, владелец shared channel и lifecycle `close()`;
- `bootstrap/unary-limit-config.ts` и `bootstrap/sdk-config.ts` - compiler и runtime adapter с [разделенным ownership](#конфигурация-терминология-и-ownership);
- `bootstrap/proto/compile-proto.ts` - proto generation mechanics через закреплённые локальные `protoc` и `ts-proto`;
- `bootstrap/args` - reusable guards и normalizers для CLI options;
- `bootstrap/cli` - CLI contract, registry, rendering help, декларативный `help-catalog.ts`, version, terminal error policy и runner layer;
- `bootstrap/commands` - handlers CLI-команд и общий `sdk-command-lifecycle.ts` для коротких SDK-вызовов;
- `bootstrap/commands/*/request.mapper.ts` - request mapping, который разделяют production и Sandbox варианты одной операции;
- `bootstrap/commands/stream-run` - отдельно config parser, generated request mapper, stream session lifecycle и reporter;
- `bootstrap/commands/*/reporter.ts` - command-specific mapping и presentation formatting. Unary reporter-ы обычно строят `application/reports`, а специализированный stream reporter может владеть локальным event contract.

Внешняя зависимость `icore` предоставляет общую механику options и commands, примитивы JSON/CSV-row/table и default terminal output facade. Это не отдельный слой проекта: integration wiring остаётся в `bootstrap`, а project-specific adapters и policies — в своих файлах-владельцах.

CLI поддерживает utility-команды `help`, `version` и API-команды в preferred-форме `<domain> <resource/action>`. Публичные domains: `account`, `instrument`, `market`, `order`, `stop-order`, `operation`, `sandbox`, `stream`, `dev`. Для proto generation служит команда `dev compile-proto`.

Technical и legacy paths вида `account get-accounts`, `users get-accounts`, `market get-candles`, `marketdata get-candles`, `instrument shares`, `instruments shares`, `order post-order`, `orders post-order`, `stop-order get-stop-orders`, `stoporders get-stop-orders`, `operation get-portfolio`, `operations get-portfolio`, `sandbox get-sandbox-accounts` и `compile-proto` работают как compatibility aliases. В help указаны только preferred paths.

API-команды остаются тонкими bootstrap handlers. Runner объявляет короткие `-h`/`-v` через native option aliases `icore`. Project registry прикрепляет technical и legacy paths к одному canonical command definition через first-class command aliases `icore`: `name` и `path` хранят preferred identity, а `matchedPath` — фактически использованный путь. Затем terminal app из `icore` разрешает command path, проверяет declarative schema и передаёт handler-у typed command options. API-specific validation и mapping в generated request выполняют project-owned helpers.

Глобальные shortcuts help/version используют lightweight `TerminalApp` без command definitions. Полный registry загружается через dynamic import только перед `prepare`, поэтому быстрый путь не инициализирует API commands, SDK facade и generated contracts. Оба экземпляра `TerminalApp` разделяют один injected `Output` и одну project error policy.

`bootstrap/cli/contract.ts` один раз связывает общие application-level типы команд через `createCommand.withTypes()` и сохраняет конкретные schema, path, payload и result каждого definition. Registry добавляет вычисленные compatibility aliases capability-based декоратором. Его ограничение требует только `path`, который декоратор действительно читает; исходный definition не расширяется, а runtime aliases имеют честный тип `readonly CommandPath[]`.

Runner один раз вызывает `prepare`, пишет command warnings и передаёт prepared command в `runPrepared`. Общая error policy направляет ошибки фаз `prepare`, `execute`, `render`, `write` и внешних bootstrap-операций в единый stderr.

Тип ошибки, а не фаза, определяет exit code. Публичный `isUsageError()` из `icore` распознаёт framework errors категории `usage` и публичный `CliUsageError` от application validators; такие ошибки завершаются с кодом `2`. Runtime, provider, output и `icore` definition errors завершаются с кодом `1`. Validators используют `CliUsageError` для command-specific аргументов, обязательных CLI/ENV-значений и уже прочитанного JSON config; ошибки чтения файла остаются runtime. Command `cli.ts` получает generated request из command-owned mapper или создаёт его локально, а общий `runSdkCommand()` создаёт и гарантированно закрывает facade для короткого вызова. Stream session владеет отдельным lifecycle до завершения async iterator. Unary reporter-ы обычно преобразуют generated DTO в `application/reports` contracts; stream reporter может формировать command-local event contract. Reporter выбирает поля, порядок и command-specific представление, а общую механику формата при необходимости делегирует публичным `renderJson`, `renderCsv`, `renderCsvRow` и `renderTextTable` из `icore`. Terminal app направляет готовую строку или stream через `Output.write` в stdout. Help/version используют тот же канал, а warnings и errors проходят через `Output.error` в stderr. Runner принимает injected `Output` или создаёт default facade.

`bootstrap/args` не вызывает SDK и не создаёт gRPC-клиенты. Здесь находятся общие option schemas, проверки project-specific значений уже типизированных опций и нормализация `TInvestOptions` из CLI/ENV. Raw argv разбирает `icore`; ему же принадлежит schema-level validation.

## Публичные точки входа

`src/index.ts` собирает поддерживаемую public surface. Public service interfaces экспортируются из application DTO. Root API также включает generated server-side service definitions и implementation types для nice-grpc server adapters, но не generated service clients — они остаются внутри bootstrap/infrastructure:

- `src/index.ts` - основной package entrypoint;
- `src/bootstrap/sdk-config.ts` - владелец публичного flat `defaultConfig`;
- `src/bootstrap/generated-exports.ts` - aggregation layer для публичных generated exports.

Package policy хранится отдельно и не создаёт дополнительный public entrypoint:

- `src/config.ts` и `src/config.types.ts` - source declaration и её type contracts; точные границы описаны ниже.

Публичные runtime/provider errors задаёт `src/application/errors/sdk-error.ts`. gRPC mapping остаётся в `infrastructure/transport/grpc`, а lifecycle errors создаёт facade. Retry policy не входит в error contract: одного status code недостаточно, чтобы решить, безопасно ли повторять конкретную операцию.

Новый код должен импортировать реализацию из слоя-владельца. Не добавляйте root-level compatibility wrappers.

## Конфигурация: терминология и ownership

Для package defaults и runtime policies используются следующие термины:

- `source config` - единственная authoring-форма package policy;
- `authoring contract` - TypeScript-типы, которые проверяют source config при компиляции;
- `compiled package baseline` - нормализованные limits и quota buckets, один раз собранные из source config;
- `public runtime config` - совместимое публичное представление скомпилированных defaults;
- `per-instance overrides` - вход от consumer-а для одного SDK instance, а не второй source package policy;
- `resolved runtime snapshot` - изолированный итог для одного SDK instance, который не изменяет baseline или `defaultConfig`.

Декларативный package config содержит только неисполняемые данные (inert data): значения записаны прямо в object literal и проверяются через `as const satisfies`. Вызов builder-а или mapper-а над object literal, например `defineConfig({...})`, превращает его в executable DSL, а не package source config. Source config не допускает runtime imports, function calls, spreads, merge/resolver logic и параллельные декларации одной policy.

Unary quota config проходит следующий pipeline:

```text
packageConfig -- compileUnaryLimits --> internal package baseline
                                          |-- copy limits --> defaultConfig
                                          `-- limits + buckets ---------.
current defaultConfig.unaryLimits -------------------------------------+--> resolveUnaryLimitConfig
per-instance unaryLimits ----------------------------------------------'
                                                                          |
                                                                          `--> runtime snapshot

runtime snapshot -----.
                       +--> UnaryLimitResolver --> TInvestUnaryQuota --.
gRPC method path ------'                                        |
                                                                +--> unaryLimiter.acquire()
per-instance unaryLimiter --------------------------------------'
```

У package-owned gRPC transport policy нет public или per-instance override:

```text
packageConfig.grpc.maxReceiveMessageLength
  --> TInvestNodeSDK bootstrap
       |--> createSdkChannel --> grpc.max_receive_message_length
       '--> SdkCallRuntime --> error source classification
```

SDK явно задаёт максимальный размер входящего сообщения и не наследует неявный default transport dependency. Локальное превышение лимита сохраняет gRPC-код `RESOURCE_EXHAUSTED`, но получает публичный `source: 'sdk'`; квота провайдера с тем же кодом остаётся в `source: 'grpc'`. Адаптер распознаёт transport-specific диагностику внутри SDK и не раскрывает её как контракт Consumer-а.

Тот же transport adapter отделяет локальные ошибки сериализации request и разбора response от provider-side `INTERNAL`: code сохраняется, но локальные случаи получают `source: 'sdk'`. Там же защищены response metadata callbacks, которые `nice-grpc` вызывает из EventEmitter handlers: синхронное исключение возвращается владельцу RPC, а не превращается в process-level `uncaughtException`.

SDK выбирает TLS trust material отдельно для каждого channel:

```text
certificates/russian-trusted-root-ca.pem -- default --.
                                                   +--> createSsl(rootCertificates)
per-instance tls.rootCertificates ------- override-'
```

Infrastructure лениво читает bundled asset только для TLS channel. Explicit buffer полностью заменяет package root bundle; при `useSsl: false` выбираются insecure credentials без чтения сертификата. SDK не изменяет ни system trust store, ни process-wide environment.

Middleware получает resolved `useSsl` вместе с call runtime. Для известных ошибок проверки certificate chain и hostname он сохраняет gRPC code `UNAVAILABLE`, но меняет публичный source на `tls`. Provider и network `UNAVAILABLE` остаются `grpc`; transport adapter не принимает retry-решений.

SDK объединяет package defaults с публичными instance options при создании экземпляра:

```text
packageConfig.sdk -- defaults --.
                                +--> resolved TInvestOptions
per-instance options -----------'
```

Per-instance `useSsl` имеет приоритет над package default, а `undefined` не отключает package policy. Для `unaryLimiter` нет package default: без него SDK не задерживает вызовы для соблюдения квоты. Обязательные `token` и `endpoint` проверяются до создания transport channel. SDK также проверяет `token` и непустой `appName` как строковые gRPC metadata, а ошибки итоговых `unaryLimits` преобразует в публичный `InvalidArgument` с `source: 'sdk'`. Список допустимых service names и полных method paths строится из generated unary service definitions, поэтому опечатка не превращается в неиспользуемое правило. `packageConfig.sdk` остаётся внутренней authoring-формой и не расширяет публичный `defaultConfig`.

`defaultConfig.unaryLimits` остаётся изменяемым public facade. При создании SDK instance функция `resolveUnaryLimitConfig()` читает его текущие values, накладывает per-instance overrides и возвращает отдельный snapshot.

Ответственность разделена так:

- `src/config.ts` владеет values и связями package policy;
- `src/config.types.ts` владеет authoring и public runtime contracts, но не default values или runtime validation;
- `src/application/dto/t-invest-options.ts` владеет публичным per-instance input, но не package defaults или merge semantics;
- `src/bootstrap/unary-limit-config.ts` владеет compilation, package baseline validation, runtime snapshot invariants и их type contract; публичный `defineUnaryLimits()` остается только адаптером читаемой формы per-instance overrides и не владеет package defaults;
- `src/bootstrap/sdk-config.ts` владеет public `defaultConfig`, merge overrides, quota group reconciliation и вызовом проверки итогового runtime snapshot;
- `src/infrastructure/transport/grpc/sdk-channel.ts` владеет mapping готовой package transport policy в channel options, но не default value;
- `src/infrastructure/transport/grpc/tls-root-certificates.ts` владеет только разрешением package asset и ленивым чтением bundled trust material;
- `src/application/services/unary-limiter.ts` владеет публичным limiter port и необязательной process-local реализацией, не интерпретируя source config или gRPC paths;
- `src/infrastructure/transport/grpc/unary-method-path.ts` владеет только transport-specific построением gRPC method path;
- `src/infrastructure/transport/grpc/unary-limit-resolver.ts` владеет сопоставлением path с method/service rule и выбором runtime bucket, но не compilation package policy или состоянием limiter-а;
- `src/infrastructure/transport/grpc/sdk-call-error.ts` владеет классификацией gRPC, TLS, codec, receive-limit и cancellation errors, но не выполнением middleware или retry policy;
- Consumer владеет переданным `unaryLimiter`, его внешними ресурсами и scope; `TInvestNodeSDK.close()` этот lifecycle не завершает.

Новую структурную config semantics нужно добавлять в authoring contract и соответствующий compiler. Готовые scalar values bootstrap передаёт напрямую adapter-у, без compiler-а и второй декларации. Mapping/resolver logic не должна возвращаться в `src/config.ts`.

## Сгенерированный код

Официальный upstream T-Invest API находится в активном репозитории `https://opensource.tbank.ru/invest/invest-contracts`. [Manifest репозитория](https://github.com/woodger/t-invest-node-sdk/blob/main/contracts/upstream.json) хранит его tag, commit и исходный каталог.

Proto compiler читает `local.rawContractsPath` и `local.generatedPath` из manifest, поэтому bootstrap-код не дублирует пути к vendored и generated контрактам.

T-Invest proto-файлы копируются в `contracts/*.proto` с исходной плоской структурой и import-путями. Supporting Google contracts перечислены отдельно в `local.supportingContracts` и не входят в T-Invest upstream snapshot. `google/api/field_behavior.proto` поставляется вместе со snapshot T-Invest, а `supportingSources` указывает источником `google/protobuf/descriptor.proto` и `google/protobuf/timestamp.proto` официальный protobuf `v32.1`.

Генератор зеркально создаёт `src/generated/*.ts` из плоского layout контрактов; вручную эти файлы не редактируются. `src/generated/**` и `src/bootstrap/generated-exports.ts` выходят за обычную слоевую структуру, потому что package entrypoint реэкспортирует generated DTO/enums public API и server-side contracts `*ServiceDefinition` / `*ServiceImplementation`. Generated `*ServiceClient` остаются внутренними transport contracts и не входят в root public exports.

### Обновление proto snapshot

При обновлении контрактов нужно:

1. получить `*.proto` из `source.path` на точном `source.commit` или `source.release`;
2. заменить T-Invest файлы в `local.rawContractsPath`;
3. обновить source commit/release в `contracts/upstream.json`;
4. при изменении вспомогательных contracts получить их из точного выпуска и обновить соответствующую запись `supportingSources`;
5. выполнить `local.generationCommand`, затем `npm run build`, `npm run lint` и `npm test`.

Proto generation читает только vendored snapshot и не обращается к сети. Compiler `protoc` и plugin `ts-proto` закреплены в dev-зависимостях, а команда запускает их из локального `node_modules`; системный `protoc` не нужен. Текущий generated snapshot создан с `protoc 36.0`.
