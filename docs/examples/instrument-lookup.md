# Найти инструмент и получить UID

Используйте этот пример, когда известны тикер и класс инструмента, а для следующего запроса нужен UID. Приложение получает описание инструмента, читает размер лота и запрашивает последнюю цену по найденному UID.

## Получить инструмент по тикеру и классу

Тикер используется вместе с `classCode`. Если известна только часть названия или тикера, сначала вызовите `sdk.instruments.findInstrument({ query })` и выберите подходящий результат. Параметры запросов описаны в [контрактах инструментов](../../contracts/instruments.proto).

В примере замените токен, тикер и класс своими значениями. Настройка SDK и его закрытие также разобраны в [первом вызове](./getting-started.md).

`instrument-lookup.ts`

```ts
import {
  InstrumentIdType,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});
const requestTimeoutMs = 5_000;

try {
  const { instrument } = await sdk.instruments.getInstrumentBy({
    idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
    id: 'SBER',
    classCode: 'TQBR'
  }, { signal: AbortSignal.timeout(requestTimeoutMs) });

  if (!instrument) {
    throw new Error('Instrument was not returned');
  }

  console.log({
    uid: instrument.uid,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    lot: instrument.lot,
    currency: instrument.currency,
    minPriceIncrement: instrument.minPriceIncrement,
    apiTradeAvailableFlag: instrument.apiTradeAvailableFlag
  });

  const { lastPrices } = await sdk.marketData.getLastPrices({
    instrumentId: [instrument.uid]
  }, { signal: AbortSignal.timeout(requestTimeoutMs) });

  console.log(lastPrices);
}
finally {
  sdk.close();
}
```

`instrument.uid` можно передавать в `instrumentId` запросов котировок и заявок. Для [цикла заявки в песочнице](./sandbox-orders.md) также понадобятся размер лота, валюта и шаг цены выбранной акции: количество заявки задаётся в лотах, а цена — за один инструмент.
