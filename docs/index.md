# Tinkoff Invest Node SDK

`tinkoff-invest-node-sdk` - минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

## Возможности

- `TinkoffInvestNodeSDK` лениво создает unary- и stream-клиенты с общим gRPC channel и metadata.
- Пакет выборочно реэкспортирует сгенерированные типы, enum'ы и service definition из vendored upstream proto contracts в `contracts/*.proto`.
- SDK поддерживает локальный throttling unary-запросов через `trackLimits` и отдельную таблицу лимитов по сервисам.
- Bootstrap CLI layer содержит command registry, `help` и `version` utility-команды.

## Установка

```bash
yarn add tinkoff-invest-node-sdk
```

## Быстрый старт

```ts
import { TinkoffInvestNodeSDK } from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
  useSsl: true,
});
```

## Опции `TinkoffInvestNodeSDK`

```ts
interface TinkoffInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  useSsl?: boolean;
  trackLimits?: boolean;
}
```

- `token` - OAuth токен.
- `endpoint` - gRPC endpoint в формате `host:port`.
- `appName` - необязательное значение для заголовка `x-app-name`.
- `useSsl` - использовать TLS, по умолчанию `true`.
- `trackLimits` - включить локальный throttling unary-запросов, по умолчанию `true`.

## Опции `defaultConfig`

```ts
interface TinkoffInvestNodeSDKConfig {
  requireSideEffectConfirmation: boolean;
}
```

- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд с
  side effects, по умолчанию `true`.

## Доступные сервисы

Экземпляр `TinkoffInvestNodeSDK` лениво создает unary-клиенты для сервисов:

- `sdk.instruments`
- `sdk.marketdata`
- `sdk.operations`
- `sdk.orders`
- `sdk.sandbox`
- `sdk.stoporders`
- `sdk.users`

Для streaming RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC channel. Закрыть channel можно через `sdk.close()`.

## Стримы

`TinkoffInvestNodeSDK` создает stream-клиенты с теми же metadata и channel, что и unary-клиенты. Локальный throttling через `trackLimits` применяется только к unary-вызовам.

## CLI

Локально после сборки CLI можно вызвать через `yarn cli`:

```bash
yarn cli --help
yarn cli version
yarn cli <domain> --help
yarn cli <domain> <command> --help
yarn cli <domain> <command> [options]

yarn cli account --help
yarn cli account list --format=json
yarn cli account info
yarn cli market candles --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T00:00:00Z --to=2026-06-19T01:00:00Z --interval=1min --format=csv
yarn cli market last-prices --instrument-id=BBG00QPYJ5H0
yarn cli order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000001 --confirm
yarn cli stop-order list --account-id=2000000000
yarn cli operation portfolio --account-id=2000000000 --format=json
yarn cli sandbox account list
yarn cli sandbox order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000002 --confirm
yarn cli instrument share list --help
yarn cli instrument bond show --id=BBG00QPYJ5H0 --id-type=figi
yarn cli dev compile-proto
```

Top-level help показывает публичные domains. Список команд внутри domain
можно посмотреть через `yarn cli <domain> --help`. Подробности отдельной
команды можно посмотреть через `yarn cli <domain> <command> --help`.

После установки пакета тот же CLI entrypoint доступен как package binary:

```bash
tinkoff-invest-node-sdk --help
tinkoff-invest-node-sdk account list --format=json
```

Boolean CLI options use flag syntax: `--confirm`, `--raw`. For supported
negative overrides use `--no-raw`; assigned values like `--raw=true` or
`--raw=false` are not part of the public CLI contract.

Сейчас CLI сгруппирован по публичным domains:

- `account` - счета, пользовательская информация, тарифы и лимиты;
- `instrument` - инструменты, справочники и избранное;
- `market` - исторические и текущие рыночные данные;
- `order` - поручения на реальном счете;
- `stop-order` - стоп-заявки на реальном счете;
- `operation` - операции, портфель, позиции и отчеты;
- `sandbox` - sandbox-счета, поручения, операции и портфель;
- `stream` - запуск stream по JSON config;
- `dev` - developer tools, включая `dev compile-proto`.

Technical и legacy paths вида `account get-accounts`, `users get-accounts`,
`market get-candles`, `marketdata get-candles`, `instrument shares`,
`instruments shares`, `order post-order`, `orders post-order`,
`stop-order get-stop-orders`, `stoporders get-stop-orders`,
`operation get-portfolio`, `operations get-portfolio` и `compile-proto`
остаются совместимыми aliases. Help при этом показывает preferred path.

Основные compatibility aliases:

- `users get-accounts` -> `account list`;
- `marketdata get-candles` -> `market candles`;
- `orders post-order` -> `order place`;
- `stoporders get-stop-orders` -> `stop-order list`;
- `operations get-portfolio` -> `operation portfolio`;
- `instruments shares` -> `instrument share list`;
- `compile-proto` -> `dev compile-proto`.

Отложенные группы команд (`To introduce`) описаны в
[API Commands](./clean-architecture/api-commands.md). Команды с side effects
по умолчанию требуют явный флаг `--confirm` через
`defaultConfig.requireSideEffectConfirmation`; динамические bidirectional
stream request sources остаются отложенным контрактом.

Контракт для stream CLI зафиксирован отдельно:
[Stream CLI Reference](./cli-stream-reference.md) и
[Stream CLI Configuration Reference](./cli-stream-configuration.md).

Deprecated `sdk.instruments.options` не вводится как публичная CLI-команда;
для опционов используется `instrument option list`.

Новые команды должны:

- регистрироваться через `src/bootstrap/cli/registry.ts`;
- размещать handler в `src/bootstrap/commands`;
- использовать `src/bootstrap/args` для primitive CLI validation и общих SDK options;
- разделять raw CLI parsing и typed request mapping: `parse*` helper-ы
  работают с raw CLI options, а `create*Request` принимает typed options и
  строит generated request DTO;
- описывать стабильный output contract в `src/application/reports`;
- держать command-specific formatting в `src/bootstrap/commands/*/reporter.ts`;
- использовать `src/infrastructure/renderers` только для механического
  JSON/CSV/table rendering;
- использовать `src/infrastructure/output` только для записи готового текста;
- сверять новые JSON/CSV/table решения с
  [Разделением форматирования и вывода в CLI](./clean-architecture/cli-output-boundaries.md);
- не переносить gRPC или business-логику в CLI parser.

## Документация

- Карта слоев SDK: [Архитектура SDK](./architecture.md)
- Clean Architecture design notes: [Clean Architecture Notes](./clean-architecture/index.md)
- Границы CLI formatting и stdout: [Разделение форматирования и вывода в CLI](./clean-architecture/cli-output-boundaries.md)
- Stream CLI контракт: [Stream CLI Reference](./cli-stream-reference.md)
- Stream config контракт: [Stream CLI Configuration Reference](./cli-stream-configuration.md)
- Подробности по лимитам API: [Лимитная политика](./limits-policy.md)
- Правила тестирования и test pipeline: [Политики проекта](./policy/index.md)
- Правила запуска и написания тестов: [Политика тестирования](./policy/testing-policy.md)
- Правила комментариев в тестах: [Политика комментариев в тестах](./policy/test-comment-style.md)
- Исходное описание и дополнительные примеры: [README в репозитории](https://github.com/woodger/tinkoff-invest-node-sdk#readme)

## Генерация proto

TypeScript-код из vendored proto snapshot генерируется через:

```bash
yarn cli dev compile-proto
```

Proto compiler берется из окружения. Для генерации нужен `protoc` в `PATH`.
TypeScript plugin берется из dev-зависимости `ts-proto`.
Официальный upstream и его tag/commit зафиксированы в
`../contracts/upstream.json`. T-Invest proto-файлы хранятся в плоской структуре
`contracts/*.proto`; generated TypeScript пишется в `src/generated/*.ts`.
Команда генерации использует локальный snapshot и не скачивает upstream.

CLI использует собранные файлы из `dist`, поэтому после изменений в bootstrap
TypeScript-коде сначала нужно пересобрать проект:

```bash
yarn build
```

`yarn build` является compile gate проекта и выполняет `tsc` с настройками из `tsconfig.json`. Текущая конфигурация рассчитана на Node.js 20, ES2023 и строгие TypeScript-проверки.
