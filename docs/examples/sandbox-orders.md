# Выполнить цикл заявки в песочнице

Пример создаёт и пополняет тестовый счёт, выставляет лимитную заявку, проверяет её состояние и отменяет активный остаток. В `finally` закрывается только созданный им счёт.

Замените `YOUR_TOKEN` токеном для [песочницы](https://developer.tbank.ru/invest/intro/developer/sandbox), а `YOUR_INSTRUMENT_UID` — UID рублёвой акции из [примера поиска инструмента](./instrument-lookup.md).

В коде цена `100.25` рубля записана как `{ units: 100, nano: 250_000_000 }`. Укажите цену, кратную шагу цены инструмента. Поле `quantity` содержит количество лотов; один лот включает `instrument.lot` бумаг. Пополнение счёта в примере задано в рублях.

`sandbox-orders.ts`

```ts
import { randomUUID } from 'node:crypto';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderIdType,
  OrderType,
  PriceType,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'sandbox-invest-public-api.tbank.ru:443'
});
const instrumentUid = 'YOUR_INSTRUMENT_UID';
const quantity = 1;
const price = { units: 100, nano: 250_000_000 };
const initialBalance = { currency: 'rub', units: 100_000, nano: 0 };
const orderRequestId = randomUUID();

try {
  const { accountId } = await sdk.sandbox.openSandboxAccount({
    name: 'SDK example'
  });

  try {
    await sdk.sandbox.sandboxPayIn({ accountId, amount: initialBalance });

    console.log({ accountId, orderRequestId });

    const placed = await sdk.sandbox.postSandboxOrder({
      accountId,
      instrumentId: instrumentUid,
      quantity,
      price,
      direction: OrderDirection.ORDER_DIRECTION_BUY,
      orderType: OrderType.ORDER_TYPE_LIMIT,
      priceType: PriceType.PRICE_TYPE_CURRENCY,
      orderId: orderRequestId
    });
    const order = {
      accountId,
      orderId: placed.orderId,
      orderIdType: OrderIdType.ORDER_ID_TYPE_EXCHANGE,
      priceType: PriceType.PRICE_TYPE_CURRENCY
    };
    let state = await sdk.sandbox.getSandboxOrderState(order);

    if (state.executionReportStatus === OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW
      || state.executionReportStatus === OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_PARTIALLYFILL) {
      await sdk.sandbox.cancelSandboxOrder({
        accountId,
        orderId: placed.orderId,
        orderIdType: OrderIdType.ORDER_ID_TYPE_EXCHANGE
      });
      state = await sdk.sandbox.getSandboxOrderState(order);
    }

    console.log(state);
  }
  finally {
    await sdk.sandbox.closeSandboxAccount({ accountId });
  }
}
finally {
  sdk.close();
}
```

Клиентский `orderRequestId` передаётся при выставлении заявки как `orderId`; при повторе того же поручения сохраняйте этот ключ. Идентификатор из ответа `placed.orderId` используется для проверки состояния и отмены. SDK не повторяет запросы автоматически.

Отменяется только новая или частично исполненная заявка. Между проверкой и отменой она может исполниться, и провайдер отклонит отмену. Ошибка передаётся вызывающему коду, `finally` выполняется; после такой ошибки уточните состояние заявки. Параметры и статусы определены в [контракте заявок](../../contracts/orders.proto).

Для дальнейших экспериментов со счётом перенесите его закрытие в конец своего сценария. Изменения состояния заявки можно получать [через поток](./order-state-stream.md).
