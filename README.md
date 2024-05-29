# tinkoff-invest-api
Node.js SDK для работы с [Tinkoff Invest API](https://tinkoff.github.io/investAPI/).

<!-- toc -->

- [Установка](#%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0)
- [Использование](#%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5)
  * [Подключение](#%D0%BF%D0%BE%D0%B4%D0%BA%D0%BB%D1%8E%D1%87%D0%B5%D0%BD%D0%B8%D0%B5)
  * [Unary-запросы](#unary-%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D1%8B)
  * [Стримы](#%D1%81%D1%82%D1%80%D0%B8%D0%BC%D1%8B)

<!-- tocstop -->

## Установка
```
npm i tinkoff-invest-node-sdk
```

## Использование
### Подключение
```ts
import { TinkoffInvestApi } from 'tinkoff-invest-api';

// создать клиента с заданным токеном доступа
const api = new TinkoffInvestApi({ token: '<your-token>' });
```
Как получить токен доступа описано [тут](https://tinkoff.github.io/investAPI/token/).

### Unary-запросы
```ts
import { PortfolioRequest_CurrencyRequest } from 'tinkoff-invest-api/dist/generated/operations.js';
import { CandleInterval } from 'tinkoff-invest-api/dist/generated/marketdata.js';

// получить список счетов
const { accounts } = await api.users.getAccounts({});

// получить портфель по id счета
const portfolio = await api.operations.getPortfolio({
  accountId: accounts[0].id,
  currency: PortfolioRequest_CurrencyRequest.RUB
});

// получить 1-минутные свечи за последние 5 мин для акций Тинкофф Групп
const { candles } = await api.marketdata.getCandles({
  figi: 'BBG00QPYJ5H0',
  instrumentId: 'BBG00QPYJ5H0',
  interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
  ...api.helpers.fromTo('-5m'), // <- удобный хелпер для получения { from, to }
});
```

### Стримы
Для работы со стримом сделана обертка `api.stream`:
```ts
import { SubscriptionInterval } from 'tinkoff-invest-api/dist/generated/marketdata.js';

// подписка на свечи
const unsubscribe = await api.stream.market.candles({
  instruments: [
    {
      figi: 'BBG00QPYJ5H0',
      instrumentId: 'BBG00QPYJ5H0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
    }
  ],
  waitingClose: false,
}, candle => console.log(candle));

// отписаться
await unsubscribe();

// обработка дополнительных событий
api.stream.market.on('error', error => console.log('stream error', error));
api.stream.market.on('close', error => console.log('stream closed, reason:', error));

// получить список текущих подписок
const data = await api.stream.market.getMySubscriptions();

// закрыть соединение
await api.stream.market.cancel();
```
> Примечание: со стримом можно работать и напрямую через `api.marketdataStream`. Но там `AsyncIterable`, которые менее удобны (имхо)

По умолчанию стрим автоматически переподключается при потере соединения ([#4](https://github.com/vitalets/tinkoff-invest-api/issues/4)). Чтобы это отключить, установите `api.stream.market.options.autoReconnect = false`.

Стримы доступны по следующим сущностям:
* `.candles(request, handler)`
* `.trades(request, handler)`
* `.orderBook(request, handler)`
* `.lastPrice(request, handler)`
* `.info(request, handler)`
