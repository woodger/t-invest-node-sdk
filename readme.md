# Node.js SDK for Tinkoff Invest API

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

Текущий публичный API модуля состоит из:
- класса `TinkoffInvestNodeSDK` для unary-запросов;
- выборочных реэкспортов сгенерированных типов, enum'ов и service definition из
  `contracts/**/*.proto`.

## Установка

```bash
yarn add tinkoff-invest-node-sdk
```

## Документация

Документация ведется как обычные Markdown-файлы в каталоге `docs`:

- [Обзор SDK](docs/index.md)
- [Архитектура SDK](docs/architecture.md)
- [Clean Architecture Notes](docs/clean-architecture/index.md)
- [Разделение форматирования и вывода в CLI](docs/clean-architecture/cli-output-boundaries.md)
- [Лимитная политика API](docs/limits-policy.md)
- [Политики проекта](docs/policy/index.md)
- [Политика тестирования](docs/policy/testing-policy.md)
- [Политика комментариев в тестах](docs/policy/test-comment-style.md)

Отдельного docs-сайта, dev-сервера и сборки статической документации в проекте нет.

## Генерация proto

Генерация TypeScript-кода из `contracts/**/*.proto` запускается через npm-скрипт:

```bash
npm run proto
```

Proto compiler берется из окружения. Для генерации нужен `protoc` в `PATH`.
TypeScript plugin берется из dev-зависимости `ts-proto`.

Скрипт использует собранный файл `dist/bootstrap/bin/compile-proto.js`, поэтому перед первым запуском после изменений в `src/bootstrap/bin/compile-proto.ts` нужно выполнить:

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

## CLI

В проекте есть bootstrap CLI layer с command registry. Локально после сборки
utility- и API-команды можно запускать через `yarn cli`:

```bash
yarn cli --help
yarn cli help
yarn cli version
yarn cli users get-accounts --help
yarn cli users get-info --help
yarn cli users get-margin-attributes --help
yarn cli users get-user-tariff --help
yarn cli marketdata get-candles --help
yarn cli marketdata get-close-prices --help
yarn cli instruments find-instrument --help
yarn cli instruments get-accrued-interests --help
yarn cli instruments get-asset-by --help
yarn cli instruments get-assets --help
yarn cli instruments get-bond-coupons --help
yarn cli instruments bond-by --help
yarn cli instruments bonds --help
yarn cli instruments get-brand-by --help
yarn cli instruments get-brands --help
yarn cli instruments get-countries --help
yarn cli instruments currencies --help
yarn cli instruments currency-by --help
yarn cli instruments etf-by --help
yarn cli instruments etfs --help
yarn cli instruments get-dividends --help
yarn cli instruments get-favorites --help
yarn cli instruments future-by --help
yarn cli instruments futures --help
yarn cli instruments get-futures-margin --help
yarn cli instruments get-instrument-by --help
yarn cli instruments option-by --help
yarn cli instruments options-by --help
yarn cli instruments share-by --help
yarn cli instruments shares --help
yarn cli instruments trading-schedules --help
yarn cli marketdata get-last-prices --help
yarn cli marketdata get-last-trades --help
yarn cli marketdata get-order-book --help
yarn cli marketdata get-trading-status --help
yarn cli marketdata get-trading-statuses --help
yarn cli orders get-orders --help
yarn cli orders get-order-state --help
yarn cli operations get-broker-report --help
yarn cli operations get-operations --help
yarn cli operations get-operations-by-cursor --help
yarn cli operations get-portfolio --help
yarn cli operations get-positions --help
yarn cli operations get-withdraw-limits --help
yarn cli stoporders get-stop-orders --help
```

API-команды используют `--token` / `TINKOFF_TOKEN` и
`--endpoint` / `TINKOFF_ENDPOINT`. Runtime SDK API остается основным публичным
интерфейсом пакета.

### Migration note: CLI JSON money values

CLI JSON reports возвращают денежные значения структурно, без склейки суммы и
валюты в одну строку.

Раньше:

```json
{
  "totalAmountPortfolio": "1000 rub"
}
```

Теперь:

```json
{
  "totalAmountPortfolio": {
    "amount": "1000",
    "currency": "rub"
  }
}
```

Если provider не вернул денежное значение, поле будет `null`. Table/text вывод
не изменился и по-прежнему показывает деньги в виде `amount currency`.

Отложенные группы CLI-команд (`To introduce`) описаны в
[docs/clean-architecture/api-commands.md](docs/clean-architecture/api-commands.md):
весь `sandbox` service и команды с side effects вводятся отдельно от read-only
CLI-команд.

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
