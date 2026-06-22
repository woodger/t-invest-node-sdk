# Tinkoff Invest Node SDK

`tinkoff-invest-node-sdk` - минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

## Возможности

- `TinkoffInvestNodeSDK` лениво создает unary- и stream-клиенты с общим gRPC channel и metadata.
- Пакет реэкспортирует сгенерированные типы, enum'ы и service definition из `contracts/*.proto`.
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

После сборки CLI можно вызвать напрямую:

```bash
node dist/bootstrap/cli.js --help
node dist/bootstrap/cli.js help
node dist/bootstrap/cli.js version
node dist/bootstrap/cli.js accounts --help
node dist/bootstrap/cli.js candles --help
node dist/bootstrap/cli.js last-prices --help
node dist/bootstrap/cli.js portfolio --help
node dist/bootstrap/cli.js positions --help
```

Сейчас CLI содержит первые API-команды:

- `accounts` - список счетов пользователя;
- `candles` - исторические свечи;
- `last-prices` - последние рыночные цены инструментов;
- `portfolio` - текущий портфель по счету;
- `positions` - позиции по счету.

Новые команды должны:

- регистрироваться через `src/bootstrap/command-registry.ts`;
- размещать handler в `src/bootstrap/commands`;
- использовать `src/bootstrap/args` для primitive CLI validation и общих SDK options;
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
- Подробности по лимитам API: [Лимитная политика](./limits-policy.md)
- Правила тестирования и test pipeline: [Политики проекта](./policy/index.md)
- Правила запуска и написания тестов: [Политика тестирования](./policy/testing-policy.md)
- Правила комментариев в тестах: [Политика комментариев в тестах](./policy/test-comment-style.md)
- Исходное описание и дополнительные примеры: [README в репозитории](https://github.com/woodger/tinkoff-invest-node-sdk#readme)

## Генерация proto

TypeScript-код из `contracts/*.proto` генерируется через:

```bash
npm run proto
```

Скрипт использует `dist/bootstrap/compile-proto.js`, поэтому после изменений в `src/bootstrap/compile-proto.ts` сначала нужно пересобрать проект:

```bash
npm run build
```
