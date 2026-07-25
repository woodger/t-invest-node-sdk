# API Commands

> Type: Design Note. Документ фиксирует текущую структуру CLI API-команд и
> проблему роста `bootstrap`.

## Контекст

В SDK появились API-команды. Публичная форма CLI строится как preferred
friendly path: `<domain> <resource/action>`.

Публичные domains:

- `account`;
- `instrument`;
- `market`;
- `order`;
- `stop-order`;
- `operation`;
- `sandbox`;
- `stream`;
- `dev`.

Technical и legacy paths остаются совместимыми aliases, но help и документация
продвигают только preferred paths. Registry хранит один canonical definition на
команду и передает остальные пути через first-class `icore` aliases; resolved
`name`/`path` остаются preferred, а введенный путь сохраняется в `matchedPath`.
Список ниже фиксирует текущий CLI contract:

- `account list` -> `sdk.users.getAccounts`
  (`account get-accounts`, `users get-accounts`);
- `account info` -> `sdk.users.getInfo`
  (`account get-info`, `users get-info`);
- `account margin` -> `sdk.users.getMarginAttributes`
  (`account get-margin-attributes`, `users get-margin-attributes`);
- `account tariff` -> `sdk.users.getUserTariff`
  (`account get-user-tariff`, `users get-user-tariff`);
- `market candles` -> `sdk.marketdata.getCandles`
  (`market get-candles`, `marketdata get-candles`);
- `market close-prices` -> `sdk.marketdata.getClosePrices`
  (`market get-close-prices`, `marketdata get-close-prices`);
- `market last-prices` -> `sdk.marketdata.getLastPrices`
  (`market get-last-prices`, `marketdata get-last-prices`);
- `market trades` -> `sdk.marketdata.getLastTrades`
  (`market get-last-trades`, `marketdata get-last-trades`);
- `market order-book` -> `sdk.marketdata.getOrderBook`
  (`market get-order-book`, `marketdata get-order-book`);
- `market status` -> `sdk.marketdata.getTradingStatus`
  (`market get-trading-status`, `marketdata get-trading-status`);
- `market statuses` -> `sdk.marketdata.getTradingStatuses`
  (`market get-trading-statuses`, `marketdata get-trading-statuses`);
- `instrument search` -> `sdk.instruments.findInstrument`
  (`instrument find-instrument`, `instruments find-instrument`);
- `instrument show` -> `sdk.instruments.getInstrumentBy`
  (`instrument get-instrument-by`, `instruments get-instrument-by`);
- `instrument dividends` -> `sdk.instruments.getDividends`
  (`instrument get-dividends`, `instruments get-dividends`);
- `instrument schedules` -> `sdk.instruments.tradingSchedules`
  (`instrument trading-schedules`, `instruments trading-schedules`);
- `instrument favorite list` -> `sdk.instruments.getFavorites`
  (`instrument get-favorites`, `instruments get-favorites`);
- `instrument favorite edit` -> `sdk.instruments.editFavorites`
  (`instrument edit-favorites`, `instruments edit-favorites`);
- `instrument share list` -> `sdk.instruments.shares`
  (`instrument shares`, `instruments shares`);
- `instrument share show` -> `sdk.instruments.shareBy`
  (`instrument share-by`, `instruments share-by`);
- `instrument bond list` -> `sdk.instruments.bonds`
  (`instrument bonds`, `instruments bonds`);
- `instrument bond show` -> `sdk.instruments.bondBy`
  (`instrument bond-by`, `instruments bond-by`);
- `instrument bond coupons` -> `sdk.instruments.getBondCoupons`
  (`instrument get-bond-coupons`, `instruments get-bond-coupons`);
- `instrument bond accrued` -> `sdk.instruments.getAccruedInterests`
  (`instrument get-accrued-interests`, `instruments get-accrued-interests`);
- `instrument etf list` -> `sdk.instruments.etfs`
  (`instrument etfs`, `instruments etfs`);
- `instrument etf show` -> `sdk.instruments.etfBy`
  (`instrument etf-by`, `instruments etf-by`);
- `instrument currency list` -> `sdk.instruments.currencies`
  (`instrument currencies`, `instruments currencies`);
- `instrument currency show` -> `sdk.instruments.currencyBy`
  (`instrument currency-by`, `instruments currency-by`);
- `instrument future list` -> `sdk.instruments.futures`
  (`instrument futures`, `instruments futures`);
- `instrument future show` -> `sdk.instruments.futureBy`
  (`instrument future-by`, `instruments future-by`);
- `instrument future margin` -> `sdk.instruments.getFuturesMargin`
  (`instrument get-futures-margin`, `instruments get-futures-margin`);
- `instrument option list` -> `sdk.instruments.optionsBy`
  (`instrument options-by`, `instruments options-by`);
- `instrument option show` -> `sdk.instruments.optionBy`
  (`instrument option-by`, `instruments option-by`);
- `instrument asset list` -> `sdk.instruments.getAssets`
  (`instrument get-assets`, `instruments get-assets`);
- `instrument asset show` -> `sdk.instruments.getAssetBy`
  (`instrument get-asset-by`, `instruments get-asset-by`);
- `instrument brand list` -> `sdk.instruments.getBrands`
  (`instrument get-brands`, `instruments get-brands`);
- `instrument brand show` -> `sdk.instruments.getBrandBy`
  (`instrument get-brand-by`, `instruments get-brand-by`);
- `instrument country list` -> `sdk.instruments.getCountries`
  (`instrument get-countries`, `instruments get-countries`);
- `order list` -> `sdk.orders.getOrders`
  (`order get-orders`, `orders get-orders`);
- `order show` -> `sdk.orders.getOrderState`
  (`order get-order-state`, `orders get-order-state`);
- `order place` -> `sdk.orders.postOrder`
  (`order post-order`, `orders post-order`);
- `order cancel` -> `sdk.orders.cancelOrder`
  (`order cancel-order`, `orders cancel-order`);
- `order replace` -> `sdk.orders.replaceOrder`
  (`order replace-order`, `orders replace-order`);
- `operation list` -> `sdk.operations.getOperations`
  (`operation get-operations`, `operations get-operations`);
- `operation page` -> `sdk.operations.getOperationsByCursor`
  (`operation get-operations-by-cursor`, `operations get-operations-by-cursor`);
- `operation broker-report` -> `sdk.operations.getBrokerReport`
  (`operation get-broker-report`, `operations get-broker-report`);
- `operation foreign-dividends-report` -> `sdk.operations.getDividendsForeignIssuer`
  (`operation get-dividends-foreign-issuer`, `operations get-dividends-foreign-issuer`);
- `operation portfolio` -> `sdk.operations.getPortfolio`
  (`operation get-portfolio`, `operations get-portfolio`);
- `operation positions` -> `sdk.operations.getPositions`
  (`operation get-positions`, `operations get-positions`);
- `operation withdraw-limits` -> `sdk.operations.getWithdrawLimits`
  (`operation get-withdraw-limits`, `operations get-withdraw-limits`);
- `stop-order list` -> `sdk.stoporders.getStopOrders`
  (`stop-order get-stop-orders`, `stoporders get-stop-orders`);
- `stop-order place` -> `sdk.stoporders.postStopOrder`
  (`stop-order post-stop-order`, `stoporders post-stop-order`);
- `stop-order cancel` -> `sdk.stoporders.cancelStopOrder`
  (`stop-order cancel-stop-order`, `stoporders cancel-stop-order`);
- `sandbox account list` -> `sdk.sandbox.getSandboxAccounts`
  (`sandbox get-sandbox-accounts`);
- `sandbox account open` -> `sdk.sandbox.openSandboxAccount`
  (`sandbox open-sandbox-account`);
- `sandbox account close` -> `sdk.sandbox.closeSandboxAccount`
  (`sandbox close-sandbox-account`);
- `sandbox order list` -> `sdk.sandbox.getSandboxOrders`
  (`sandbox get-sandbox-orders`);
- `sandbox order show` -> `sdk.sandbox.getSandboxOrderState`
  (`sandbox get-sandbox-order-state`);
- `sandbox order place` -> `sdk.sandbox.postSandboxOrder`
  (`sandbox post-sandbox-order`);
- `sandbox order replace` -> `sdk.sandbox.replaceSandboxOrder`
  (`sandbox replace-sandbox-order`);
- `sandbox order cancel` -> `sdk.sandbox.cancelSandboxOrder`
  (`sandbox cancel-sandbox-order`);
- `sandbox position list` -> `sdk.sandbox.getSandboxPositions`
  (`sandbox get-sandbox-positions`);
- `sandbox operation list` -> `sdk.sandbox.getSandboxOperations`
  (`sandbox get-sandbox-operations`);
- `sandbox operation page` -> `sdk.sandbox.getSandboxOperationsByCursor`
  (`sandbox get-sandbox-operations-by-cursor`);
- `sandbox portfolio` -> `sdk.sandbox.getSandboxPortfolio`
  (`sandbox get-sandbox-portfolio`);
- `sandbox withdraw-limits` -> `sdk.sandbox.getSandboxWithdrawLimits`
  (`sandbox get-sandbox-withdraw-limits`);
- `sandbox pay-in` -> `sdk.sandbox.sandboxPayIn`
  (`sandbox sandbox-pay-in`);
- `stream run` -> stream selected by JSON config;
- `dev compile-proto` -> TypeScript contract generation (`compile-proto`).

Новые API-команды добавляются инкрементально, когда выбран конкретный SDK
method и понятен CLI-контракт команды. Preferred path должен быть добавлен в
command definition и help, а technical/legacy aliases - только через единый
alias layer, который передает их в native command definition `icore`.

## To Introduce

Команды ниже пока не являются текущим CLI-контрактом. Этот список фиксирует
отложенные группы API-команд, которые нужно вводить отдельно и осознанно.

Реализованные команды с side effects являются текущим CLI-контрактом и по
умолчанию требуют явный `--confirm` через
`defaultConfig.requireSideEffectConfirmation`. CLI не генерирует idempotency
keys автоматически:
`order place` принимает `--order-id`, а `order replace` принимает
`--idempotency-key`.

`sandbox pay-in` принимает `--currency=rub|usd`. Неизвестные currency
значения отклоняются CLI parser-ом, а `--currency=usd` завершается ошибкой как
явно неподдержанный provider-кейс.

Stream API вводится отдельно от unary CLI-команд через utility-команду
`stream run --config=PATH`. CLI-контракт для долгоживущих подписок, завершения
процесса и формата событий описан в
[Stream CLI Reference](../cli-stream-reference.md) и
[Stream CLI Configuration Reference](../cli-stream-configuration.md).

Текущая реализация поддерживает server-side streams и статический initial
request contract для bidirectional market data stream:

- `sdk.marketdataStream.marketDataStream`;
- `sdk.marketdataStream.marketDataServerSideStream`;
- `sdk.operationsStream.portfolioStream`;
- `sdk.operationsStream.positionsStream`;
- `sdk.ordersStream.tradesStream`.

Динамические bidirectional request sources остаются отложенным API-контрактом.

Deprecated generated methods не вводятся как публичные CLI-команды:

- `sdk.instruments.options` - deprecated в generated contract; вместо него
  используется `instrument option list` / `sdk.instruments.optionsBy`.

Перед расширением stream command нужно сверять поведение с этими
reference-документами и отдельно фиксировать любые изменения контракта.

Command flow объединяет несколько разных ответственностей:

1. runner и `icore` разбирают CLI args и валидируют primitive options по schema;
2. command handler выполняет API-specific validation и request mapping;
3. command handler создает `TinkoffInvestNodeSDK`;
4. command handler вызывает API method;
5. reporter преобразует unary response в stable report или stream event в
   command-local output contract;
6. reporter выбирает command-specific output и использует generic render
   primitives, когда они подходят;
7. terminal app получает готовую строку или stream для вывода.

Если свести эти обязанности обратно в один command handler, command layer быстро
станет местом для любой логики вокруг CLI.

## Текущая Структура

```text
src/bootstrap
  index.ts
  args/
    command-options.ts
    instrument-id-options.ts
    instruments-args.ts
    side-effect-args.ts
  cli/
    contract.ts
    error.ts
    help.ts
    registry.ts
    runner.ts
  commands/
    <command-adapter>/
      cli.ts
      reporter.ts

src/infrastructure
  interceptor/
  report-values.ts
  transport/grpc/

external dependency
  icore
    option/command mechanics
    renderJson/renderCsv/renderCsvRow/renderTextTable
    TerminalApp/Output
```

`cli.ts` сейчас отвечает за:

- объявление command path, declarative option schema и handler-а через локальный
  command facade над `icore`;
- mapping typed command options в generated request DTO;
- API-specific validation, которая не выражается primitive schema;
- создание SDK facade;
- вызов API;
- закрытие SDK.

Boolean CLI options follow `icore` flag syntax: `--flag` and, when the
command supports a negative override, `--no-flag`. Assigned boolean values
like `--flag=true` or `--flag=false` are not part of the public CLI contract.

Внутри command module нужно различать два вида helper-ов:

```text
parse*          -> raw CLI option parsing / focused parser checks
create*Request -> typed command options -> generated request DTO
```

`parse*` helper может принимать raw option map, если тестируется именно CLI
parser behavior: format, enum, comma-separated list или normalization error.
`create*Request` не должен принимать raw CLI args. Он получает typed options,
которые уже прошли `icore`, и отвечает за generated request DTO shape и
request-level validation вроде date range или mutually exclusive modes.

`reporter.ts` сейчас отвечает за:

- mapping unary response в application report или stream event в command-local
  output contract;
- выбор command-specific output contract;
- выбор полей, headers, порядка и подготовку значений для JSON/CSV/table output;
- вызов generic render primitives `icore`, когда они подходят формату.

`icore` сейчас предоставляет:

- primitive option parsing, typed schema validation и command mechanics;
- технические детали JSON, plain-text table и CSV rendering;
- `TerminalApp`/`Output.write` для штатной записи готовой строки или stream в
  stdout;
- `Output.error` для warnings/errors в stderr.

Project CLI layer собирает terminal app, объявляет native short aliases,
передает compatible command paths как first-class aliases canonical definitions,
обслуживает help/version shortcuts и warnings, а project error policy определяет
текст ошибки и exit code.

Директории внутри `bootstrap/commands/*` сейчас остаются компактными именами
adapter-модулей. Они не задают публичный CLI path: публичный контракт команды
фиксируется в `bootstrap/cli/registry.ts` и `bootstrap/cli/help.ts`.

## Что Уже Хорошо

- primitive option validation выражена `icore` schemas, а reusable
  project-specific normalizers отделены в `bootstrap/args`;
- raw CLI parsing отделен от typed generated request mapping;
- stable unary output shape вынесен в `application/reports`, а stream contract
  зафиксирован отдельно;
- команды закрывают SDK в `finally`;
- formatting logic вынесена из `cli.ts`;
- JSON pretty-print, table alignment и CSV escaping не дублируются в command
  reporter-ах;
- `stdout`/`stderr` delivery отделен от построения JSON/CSV/table.

## Текущая Проблема

`bootstrap` по смыслу должен быть composition/entrypoint layer:

```text
parse entrypoint -> assemble dependencies -> call command -> return status/output
```

В `bootstrap` остается command-specific presentation/adaptation logic:

```text
unary response -> stable report
stream event -> command-local output contract
report/event contract -> command-specific output values
```

Это осознанный компактный вариант, близкий к Inventory. Риск появляется, если
generic primitives начнут использоваться как место выбора полей, redaction,
normalization или версионирования output конкретной команды. Обратный риск -
дублировать JSON/CSV/table механику в reporter-ах или создавать локальные
forwarding wrappers над `icore` без собственного контракта.

Подробные правила разделения command-specific formatting, generic render
primitives и stdout delivery описаны в
[Разделение форматирования и вывода в CLI](./cli-output-boundaries.md).

## Важное Разделение

Нужно различать три ответственности:

```text
application report/command-local event -> command-specific output values
```

Это CLI adapter/presentation policy в command reporter-е.

```text
output values -> JSON/CSV/table string
```

Это generic format mechanics `icore`.

```text
string/AsyncIterable -> TerminalApp -> Output.write -> stdout
```

Это normal output через `icore` facade, собранный project runner-ом.

```text
warnings/errors -> Output.error -> stderr
```

Output boundary не должен знать, как строить JSON, CSV или table.

## Принятое Разделение

```text
src/bootstrap
  index.ts
  args/
    command-options.ts
    instrument-id-options.ts
    instruments-args.ts
    side-effect-args.ts
  cli/
    contract.ts
    error.ts
    registry.ts
    runner.ts
  commands/
    <command-adapter>/
      cli.ts
      reporter.ts

src/infrastructure
  report-values.ts

external dependency
  icore
    renderJson/renderCsv/renderCsvRow/renderTextTable
    TerminalApp/Output
```

Граница:

- `bootstrap/commands/*/cli.ts` - command definition, API-specific mapping и SDK
  lifecycle;
- `bootstrap/commands/*/reporter.ts` - provider result -> stable report или
  command-local event contract -> command-specific CLI output;
- public render primitives `icore` - механика JSON/CSV-row/table rendering;
- `icore` `TerminalApp`/`Output.write`, собранные в
  `bootstrap/cli/runner.ts`, - штатная запись готовой строки или stream в
  stdout;
- `icore` `Output.error` - warnings/errors в stderr;
- `application/reports/**` - stable unary output contracts.

## Когда Нужен Use-Case

Текущие API-команды тонкие: они вызывают один SDK method и форматируют результат.
Для таких команд отдельный use-case не обязателен.

Use-case стоит выделять, если появляется хотя бы одно:

- несколько API calls в одном сценарии;
- retry/fallback/cache decision;
- сценарные ошибки и partial success;
- provider-neutral contract;
- reuse того же сценария вне CLI;
- тесты начинают мокать слишком много деталей SDK.

## Правило Для Новых Команд

- не добавлять новую formatting logic в `cli.ts`;
- держать command handler тонким;
- описывать stable unary output в `application/reports`, а специализированный
  stream contract фиксировать отдельно;
- держать command-specific output policy в `bootstrap/commands/*/reporter.ts`;
- использовать public render primitives `icore` только для общей механики
  формата;
- возвращать normal result terminal app и не переносить JSON/CSV/table policy в
  output facade;
- регистрировать команду в `bootstrap/cli/registry.ts` в canonical форме
  `<domain> <command>`;
- добавлять technical/legacy paths только через project alias inventory; registry
  передаст их в `aliases` canonical definition;
- не добавлять short option aliases для API-команд;
- добавлять help metadata в `bootstrap/cli/help.ts`;
- добавлять тесты рядом с конкретными файлами команды;
- не вводить общий command framework до появления реального повторения в
  нескольких командах;
- сверять новые output-решения с
  [Разделением форматирования и вывода в CLI](./cli-output-boundaries.md).

## Когда Обобщать Commands

Обобщение command lifecycle допустимо только после появления повторения с
одинаковой ответственностью.

До этого каждая команда остается явной:

```text
bootstrap/commands/<command-adapter>/cli.ts
bootstrap/commands/<command-adapter>/reporter.ts
application/reports/<command-adapter>.report.ts
```

Допустимые причины для extract-а:

- один и тот же SDK lifecycle повторяется в 3+ API-командах;
- одинаковый parsing/validation pattern больше не выражается существующими
  `icore` option schemas;
- tests начинают дублировать setup без изменения сценария;
- общий код получает понятную ответственность и не скрывает command-specific
  различия.

Недопустимые причины:

- будущий список команд неизвестен, поэтому хочется подготовить framework;
- две команды выглядят похожими внешне, но имеют разные request/report/output
  правила;
- хочется сократить количество строк в `commands/*/cli.ts`.
