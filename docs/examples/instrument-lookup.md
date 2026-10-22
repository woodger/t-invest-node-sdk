# Найти инструмент и получить UID

Чтобы получить UID по тикеру, укажите также класс инструмента — `classCode`. Пример находит акцию `SBER` в классе `TQBR` и выводит её UID. Замените токен, тикер и класс своими значениями.

`instrument-lookup.ts`

```ts
import { InstrumentIdType, TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});

try {
  const { instrument } = await sdk.instruments.getInstrumentBy({
    idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
    id: 'SBER',
    classCode: 'TQBR'
  });

  if (!instrument) {
    throw new Error('Instrument was not returned');
  }

  console.log(instrument.uid);
}
finally {
  sdk.close();
}
```

Передавайте `instrument.uid` в `instrumentId` запросов котировок и заявок. В `instrument` также доступны размер лота (`lot`), валюта (`currency`) и шаг цены (`minPriceIncrement`) — они пригодятся для [заявки в песочнице](./sandbox-orders.md).

Если известна только часть названия или тикера, начните с `sdk.instruments.findInstrument({ query })`. Параметры запросов описаны в [контрактах инструментов](../../contracts/instruments.proto), а ограничение времени вызова — в [руководстве по unary-запросам](./unary-calls.md).
