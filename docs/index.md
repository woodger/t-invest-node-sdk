---
layout: home

hero:
  name: Tinkoff Invest Node SDK
  text: Минималистичный TypeScript/Node.js SDK для T-Invest API
  tagline: Unary gRPC-клиенты, сгенерированные типы и service definition в одном пакете.
  actions:
    - theme: brand
      text: Быстрый старт
      link: /#быстрый-старт
    - theme: alt
      text: Лимитная политика
      link: /limits-policy

features:
  - title: Готовый SDK-клиент
    details: "`TinkoffInvestNodeSDK` лениво создает unary- и stream-клиенты с общим gRPC channel и metadata."
  - title: Сгенерированные типы и enum'ы
    details: "Пакет реэкспортирует типы, enum'ы и service definition из `contracts/*.proto`, чтобы можно было использовать их напрямую."
  - title: Контроль лимитов
    details: "SDK поддерживает локальный throttling unary-запросов через `trackLimits` и отдельную таблицу лимитов по сервисам."
---

# Обзор

`tinkoff-invest-node-sdk` - минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

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

## Документация

- Подробности по лимитам API: [Лимитная политика](./limits-policy.md)
- Исходное описание и дополнительные примеры: [README в репозитории](https://github.com/woodger/tinkoff-invest-node-sdk#readme)

## Локальный запуск docs

```bash
npm run docs:dev
```

Dev-сервер запускается на `http://localhost:4173`.
Порт задается в конфиге VitePress.

Сборка статической документации:

```bash
npm run docs:build
```

Для VitePress нужен современный Node.js runtime. Это требование относится только к документации и не меняет runtime-требования самой библиотеки.

## Генерация proto

TypeScript-код из `contracts/*.proto` генерируется через:

```bash
npm run proto
```

Скрипт использует `dist/compile-proto.js`, поэтому после изменений в `src/compile-proto.ts` сначала нужно пересобрать проект:

```bash
npm run build
```
