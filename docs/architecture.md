# Архитектура SDK

> Type: Reference. Этот документ фиксирует текущую карту слоев SDK и служит
> practical companion к [архитектурной политике](./policy/architecture.md).
> Дополнительные design notes по развитию слоев находятся в
> [Clean Architecture Notes](./clean-architecture/index.md).

Проект использует Clean Architecture Lite. Слои выделяются только там, где у
кода есть самостоятельная ответственность.

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

`src/domain` сейчас не выделен: в SDK нет самостоятельной доменной модели,
отделенной от gRPC contract. Добавлять `domain` нужно только вместе с реальными
provider-neutral правилами или моделями.

## `application`

`application` содержит contracts и reusable правила, которые не должны знать о
`nice-grpc`.

Текущие зоны:

- `application/dto` - входные SDK options и другие application-level contracts;
- `application/dto/tinkoff-invest-services.ts` - публичные package-owned
  service interfaces SDK facade, отделенные от generated `*ServiceClient`;
- `application/errors` - transport-neutral `SdkError`, стабильные symbolic
  codes и runtime narrowing;
- `application/reports` - стабильные output/report contracts API-команд;
- `application/services` - reusable application services, например transport-neutral
  планирование unary calls по готовым throttle rules.

## `infrastructure`

`infrastructure` содержит внешние технологии и adapter-level wiring.

Текущие зоны:

- `infrastructure/transport/grpc` - создание `nice-grpc` channel, metadata,
  middleware и typed clients, а также построение и разрешение полных gRPC
  paths в transport-neutral throttle rules и mapping transport failures в
  публичный `SdkError`.
- `infrastructure/interceptor` - технические hooks для фильтрации process
  warnings и, в диагностических сценариях, `stdout`.
- `infrastructure/report-values.ts` - общие scalar adapters для преобразования
  provider DTO значений вроде `MoneyValue`, `Quotation` и `Date` в стабильные
  report values. `MoneyValue` становится структурным `ReportMoney`, а
  command-specific table/text представление строится отдельно. Здесь не
  выбираются поля команд и не формируются command-specific output contracts.

Здесь допустимы imports из `nice-grpc`, generated service definitions и
application services. Application не должен импортировать concrete
infrastructure modules.

## `bootstrap`

Runtime entrypoints разделены между публичными package entrypoints и
bootstrap-механикой.

Текущие зоны:

- `bootstrap/index.ts` - executable CLI entrypoint, который публикуется как
  package binary `dist/bootstrap/index.js`;
- `bootstrap/tinkoff-invest-node-sdk.ts` - публичный runtime facade SDK,
  владелец shared channel и lifecycle `close()`;
- `bootstrap/unary-limit-config.ts` и `bootstrap/sdk-config.ts` - compiler и
  runtime adapter с [разделенным ownership](#конфигурация-терминология-и-ownership);
- `bootstrap/proto/compile-proto.ts` - proto generation mechanics через системный
  `protoc` и локальный `ts-proto` plugin;
- `bootstrap/args` - reusable guards и normalizers для CLI options;
- `bootstrap/cli` - CLI contract, registry, help, version, terminal error
  policy и runner layer;
- `bootstrap/commands` - handlers CLI-команд;
- `bootstrap/commands/*/reporter.ts` - command-specific mapping и presentation
  formatting. Unary reporter-ы обычно строят `application/reports`, а
  специализированный stream reporter может владеть локальным event contract.

Generic option/command mechanics, JSON/CSV-row/table primitives и default
terminal output facade предоставляет внешняя зависимость `icore`. Она не
является отдельным слоем проекта: integration wiring остается в `bootstrap`,
а project-specific adapters и policies остаются в файлах-владельцах.

CLI слой сейчас поддерживает utility-команды `help`, `version` и API-команды
в preferred friendly форме `<domain> <resource/action>`. Публичные domains:
`account`, `instrument`, `market`, `order`, `stop-order`, `operation`,
`sandbox`, `stream`, `dev`. Proto generation доступен как
`dev compile-proto`.

Technical и legacy paths вида `account get-accounts`, `users get-accounts`,
`market get-candles`, `marketdata get-candles`, `instrument shares`,
`instruments shares`, `order post-order`, `orders post-order`,
`stop-order get-stop-orders`, `stoporders get-stop-orders`,
`operation get-portfolio`, `operations get-portfolio`,
`sandbox get-sandbox-accounts` и `compile-proto` остаются совместимыми aliases,
но help продвигает только preferred paths.

API-команды остаются тонкими bootstrap handlers. Runner объявляет короткие
`-h`/`-v` через native option aliases `icore`. Project registry прикрепляет
technical и legacy paths к единственному canonical command definition через
first-class command aliases `icore`: `name`/`path` остаются preferred, а
фактически использованный путь доступен как `matchedPath`. Затем `icore`
terminal app разрешает command path, валидирует declarative schema и передает
handler-у typed command options. API-specific validation и mapping в generated
request остаются в project-owned helpers.

`bootstrap/cli/contract.ts` один раз закрепляет общие application-level типы
команд через `createCommand.withTypes()`, сохраняя конкретные schema, path,
payload и result каждого definition. Registry добавляет вычисленные
compatibility aliases capability-based декоратором: ограничение требует только
читаемый декоратором `path`, исходный definition проходит без расширения, а
runtime aliases честно представлены как `readonly CommandPath[]`.

Runner один раз выполняет `prepare`, пишет command warnings и передает prepared
command в `runPrepared`. В штатном terminal flow общая error policy сохраняет
единый stderr для фаз `prepare`, `execute`, `render`, `write` и внешних
bootstrap-операций.

Exit code определяется типом ошибки, а не фазой. Публичный `isUsageError()` из
`icore` распознаёт framework errors категории `usage` и application validators,
которые выбрасывают публичный `CliUsageError`; они завершаются с кодом `2`.
Runtime, provider, output и `icore` definition errors завершаются с кодом `1`.
`CliUsageError` используется для command-specific аргументов, обязательных
CLI/ENV-значений и уже прочитанной JSON command config; ошибки чтения файла
остаются runtime.
Command `cli.ts` создает generated request DTO из typed options, создает SDK
facade и передает provider response в reporter-модуль. Unary reporter-ы обычно
преобразуют generated DTO в `application/reports` contracts; stream reporter
может формировать command-local event contract. Reporter выбирает поля, порядок
и command-specific представление, а для общей механики формата при необходимости
вызывает публичные `renderJson`, `renderCsv`, `renderCsvRow` и `renderTextTable`
из `icore`.
Готовую строку или stream terminal app штатно направляет через `Output.write` в
stdout; help/version используют тот же канал, а warnings и errors проходят
через `Output.error` в stderr. Runner принимает injected `Output` или создает
default facade.

`bootstrap/args` не вызывает SDK и не создает gRPC-клиенты. Он только проверяет
project-specific CLI-контракты поверх typed/raw option values и нормализует
общие `TinkoffInvestOptions` из CLI/ENV.

## Public Entrypoints

Поддерживаемая public surface собирается `src/index.ts`. Public service
interfaces экспортируются из application DTO. Generated server-side service
definitions/implementation types входят в root public surface для nice-grpc
server adapters; generated service clients остаются внутри
bootstrap/infrastructure:

- `src/index.ts` - основной package entrypoint;
- `src/bootstrap/sdk-config.ts` - владелец публичного flat `defaultConfig`;
- `src/bootstrap/generated-exports.ts` - aggregation layer для публичных generated exports.

Package policy хранится отдельно и не образует дополнительный public
entrypoint:

- `src/config.ts` и `src/config.types.ts` - source declaration и ее type
  contracts; точные границы зафиксированы ниже.

Публичные runtime/provider errors задаются
`src/application/errors/sdk-error.ts`. gRPC mapping остается в
`infrastructure/transport/grpc`, а lifecycle errors создает facade. Retry
policy не входит в error contract: один status code не определяет безопасность
повторения конкретной операции.

Новый код должен импортировать реализацию из слоя-владельца. Root-level
compatibility wrappers не создаются.

## Конфигурация: терминология и ownership

Для package defaults и runtime policies используются следующие термины:

- `source config` - единственная authoring-форма package policy;
- `authoring contract` - TypeScript-типы, которые проверяют source config при
  компиляции;
- `compiled package baseline` - нормализованные limits и quota buckets,
  один раз собранные из source config;
- `public runtime config` - совместимое публичное представление
  скомпилированных defaults;
- `per-instance overrides` - вход от consumer-а для одного SDK instance,
  а не второй source package policy;
- `resolved runtime snapshot` - изолированный итог для одного SDK
  instance, который не изменяет baseline или `defaultConfig`.

Декларативный package config — это неисполняемые данные (inert data):
значения записаны непосредственно в object literal и проверяются через
`as const satisfies`. Вызов builder-а или mapper-а над object literal,
например `defineConfig({...})`, является executable DSL, а не package
source config. В source config не допускаются runtime imports, function
calls, spreads, merge/resolver logic и параллельные декларации одной
policy.

Unary throttling config проходит следующий pipeline:

```text
packageConfig -- compileUnaryLimits --> internal package baseline
                                          |-- copy limits --> defaultConfig
                                          `-- limits + buckets ---------.
current defaultConfig.unaryLimits -------------------------------------+--> resolveUnaryThrottleConfig
per-instance unaryLimits ----------------------------------------------'
                                                                          |
                                                                          `--> runtime snapshot

runtime snapshot --.
                   +--> UnaryLimitResolver --> ThrottleRule --> Throttle
gRPC method path --'
```

Package-owned gRPC transport policy проходит без public или per-instance
override:

```text
packageConfig.grpc.maxReceiveMessageLength
  --> TinkoffInvestNodeSDK bootstrap
  --> createSdkChannel
  --> grpc.max_receive_message_length
```

Так SDK явно фиксирует максимальный размер входящего сообщения и не наследует
неявный default transport dependency.

Package defaults для публичных instance options разрешаются при создании SDK:

```text
packageConfig.sdk -- defaults --.
                                +--> resolved TinkoffInvestOptions
per-instance options -----------'
```

Per-instance boolean values `useSsl` и `trackLimits` имеют приоритет над package
defaults, а `undefined` не отключает package policy. Обязательные `token` и
`endpoint` проверяются до создания transport channel. `packageConfig.sdk`
остается внутренней authoring-формой и не расширяет публичный `defaultConfig`.

`defaultConfig.unaryLimits` остается изменяемым public compatibility
facade. `resolveUnaryThrottleConfig()` читает его текущие values при создании
SDK instance, накладывает per-instance overrides и возвращает отдельный snapshot.

Ownership разделен так:

- `src/config.ts` владеет values и связями package policy;
- `src/config.types.ts` владеет authoring и public runtime contracts, но не
  default values или runtime validation;
- `src/application/dto/tinkoff-invest-options.ts` владеет публичным
  per-instance input, но не package defaults или merge semantics;
- `src/bootstrap/unary-limit-config.ts` владеет compilation, package baseline
  validation, runtime snapshot invariants и их type contract;
  публичный `defineUnaryLimits()` остается только адаптером читаемой
  формы per-instance overrides и не владеет package defaults;
- `src/bootstrap/sdk-config.ts` владеет public `defaultConfig`, merge overrides,
  quota group reconciliation и вызовом проверки итогового runtime snapshot;
- `src/infrastructure/transport/grpc/sdk-channel.ts` владеет mapping готовой
  package transport policy в channel options, но не default value;
- `src/application/services/unary-throttle.service.ts` владеет планированием
  и отменяемой bucket queue по готовому `ThrottleRule`, не интерпретируя source
  config или gRPC paths;
- `src/infrastructure/transport/grpc/unary-limits.ts` владеет только
  transport-specific построением gRPC method path;
- `src/infrastructure/transport/grpc/unary-limit-resolver.ts` владеет
  сопоставлением path с method/service rule и выбором runtime bucket, но не
  compilation package policy или throttling state.

Новая структурная config semantics добавляется в authoring contract и
соответствующий compiler. Готовые scalar values bootstrap передает напрямую
adapter-у — без compiler-а и второй декларации. Mapping/resolver logic не
должна возвращаться в `src/config.ts`.

## Generated Code

Официальный upstream T-Invest API — активный репозиторий
`https://opensource.tbank.ru/invest/invest-contracts`. Его tag, commit и
исходный каталог фиксируются в `contracts/upstream.json`.

Proto compiler читает `local.rawContractsPath` и `local.generatedPath` из этого
manifest. Пути до vendored и generated контрактов не дублируются в bootstrap
коде.

T-Invest proto-файлы копируются без изменения плоской структуры и import-путей
в `contracts/*.proto`. Supporting Google contracts перечислены отдельно в
`local.supportingContracts` и не считаются частью T-Invest upstream snapshot.

`src/generated/*.ts` зеркально воспроизводится из плоского layout контрактов и
не редактируется вручную.
`src/generated/**` и `src/bootstrap/generated-exports.ts` являются исключениями
из обычной слоевой структуры, потому что package entrypoint реэкспортирует
generated DTO/enums public API и server-side
`*ServiceDefinition` / `*ServiceImplementation` contracts. Generated
`*ServiceClient` contracts остаются внутренними transport contracts и не
являются root public exports.

### Обновление proto snapshot

При обновлении контрактов нужно:

1. получить `*.proto` из `source.path` на точном `source.commit` или
   `source.release`;
2. заменить T-Invest файлы в `local.rawContractsPath`;
3. обновить source commit/release в `contracts/upstream.json`;
4. выполнить `local.generationCommand`, затем `yarn build`, `yarn lint` и
   `yarn test`.

Proto generation использует только vendored snapshot и не выполняет network IO.
