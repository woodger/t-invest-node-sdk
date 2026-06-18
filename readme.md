# Node.js SDK for Tinkoff Invest API

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

Текущий публичный API модуля состоит из:
- класса `TinkoffInvestNodeSDK` для unary-запросов;
- экспортов сгенерированных типов, enum'ов и service definition из `contracts/*.proto`.

## Установка

```bash
yarn add tinkoff-invest-node-sdk
```

## Документация

Документация ведется как обычные Markdown-файлы в каталоге `docs`:

- [Обзор SDK](docs/index.md)
- [Лимитная политика API](docs/limits-policy.md)
- [Политики проекта](docs/policy/index.md)
- [Политика тестирования](docs/policy/testing-policy.md)
- [Политика комментариев в тестах](docs/policy/test-comment-style.md)

Отдельного docs-сайта, dev-сервера и сборки статической документации в проекте нет.

## Генерация proto

Генерация TypeScript-кода из `contracts/*.proto` запускается через npm-скрипт:

```bash
npm run proto
```

Скрипт использует собранный файл `dist/compile-proto.js`, поэтому перед первым запуском после изменений в `src/compile-proto.ts` нужно выполнить:

```bash
npm run build
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

Подробности по официальной лимитной политике API и её связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

## Доступные сервисы

Экземпляр `TinkoffInvestNodeSDK` лениво создает unary-клиенты для сервисов:

- `sdk.instruments`
- `sdk.marketdata`
- `sdk.operations`
- `sdk.orders`
- `sdk.sandbox`
- `sdk.stoporders`
- `sdk.users`

Все методы этих клиентов соответствуют сгенерированным gRPC-описаниям.

Для streaming RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC channel и metadata. Закрыть channel можно через `sdk.close()`.

## Примеры unary-запросов

### Получить счета

```ts
import { TinkoffInvestNodeSDK } from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

const { accounts } = await sdk.users.getAccounts({});

console.log(accounts);
```

### Получить портфель

```ts
import {
  PortfolioRequest_CurrencyRequest,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

const { accounts } = await sdk.users.getAccounts({});

const portfolio = await sdk.operations.getPortfolio({
  accountId: accounts[0]?.id ?? '',
  currency: PortfolioRequest_CurrencyRequest.PORTFOLIO_REQUEST_CURRENCY_REQUEST_RUB,
});

console.log(portfolio);
```

### Получить свечи

```ts
import {
  CandleInterval,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

const now = new Date();
const from = new Date(now.getTime() - 5 * 60 * 1000);

const response = await sdk.marketdata.getCandles({
  instrumentId: 'BBG00QPYJ5H0',
  interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
  from,
  to: now,
});

console.log(response.candles);
```

## Стримы

`TinkoffInvestNodeSDK` создает stream-клиенты с теми же metadata и channel, что и unary-клиенты. Локальный throttling через `trackLimits` применяется только к unary-вызовам.

### Server-side stream

```ts
import {
  SubscriptionAction,
  SubscriptionInterval,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

try {
  for await (const event of sdk.marketdataStream.marketDataServerSideStream({
    subscribeCandlesRequest: {
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
      instruments: [
        {
          instrumentId: 'BBG00QPYJ5H0',
          interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
        },
      ],
      waitingClose: false,
    },
  })) {
    console.log(event);
  }
}
finally {
  sdk.close();
}
```

### Bidirectional stream

```ts
import {
  MarketDataRequest,
  SubscriptionAction,
  SubscriptionInterval,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

async function* requestStream(): AsyncIterable<MarketDataRequest> {
  yield {
    subscribeCandlesRequest: {
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
      instruments: [
        {
          instrumentId: 'BBG00QPYJ5H0',
          interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
        },
      ],
      waitingClose: false,
    },
  };
}

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

try {
  for await (const event of sdk.marketdataStream.marketDataStream(requestStream())) {
    console.log(event);
  }
}
finally {
  sdk.close();
}
```

## Экспорты

Пакет реэкспортирует:
- `Timestamp`;
- типы и enum'ы из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `stoporders`, `users`;
- service definition и client/implementation types для этих сервисов.

Основная точка входа:

```ts
import {
  TinkoffInvestNodeSDK,
  CandleInterval,
  InstrumentsServiceDefinition,
  MarketDataStreamServiceDefinition,
} from 'tinkoff-invest-node-sdk';
```
