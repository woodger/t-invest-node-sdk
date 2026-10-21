# Выполнить цикл заявки в песочнице

Используйте этот пример, чтобы пройти путь от создания тестового счёта до проверки и отмены лимитной заявки. Приложение открывает собственный счёт песочницы, пополняет его, выставляет заявку и закрывает созданный счёт в `finally`.

## Подготовить параметры заявки

Используется [адрес песочницы](https://developer.tbank.ru/invest/intro/developer/sandbox) `sandbox-invest-public-api.tbank.ru:443` и методы `sdk.sandbox`. Замените `YOUR_TOKEN` токеном для песочницы, а `YOUR_INSTRUMENT_UID` — UID выбранной рублёвой акции. Получение UID, валюты, размера лота и шага цены показано в [поиске инструмента](./instrument-lookup.md).

В коде цена `100.25` рубля записана как `{ units: 100, nano: 250_000_000 }`. Укажите цену, кратную шагу цены инструмента. Поле `quantity` содержит количество лотов; один лот включает `instrument.lot` бумаг. Пополнение счёта в примере задано в рублях.

Клиентский `orderRequestId` создаётся до отправки заявки и передаётся как `PostOrderRequest.orderId`. При повторе того же поручения сохраняйте этот ключ. В ответе `PostOrderResponse.orderId` находится идентификатор заявки, который используется для получения состояния и отмены. SDK не повторяет запросы автоматически.

## Выставить заявку, проверить состояние и отменить остаток

Пример отменяет заявку, если прочитанное состояние — новая или частично исполненная заявка. Полностью исполненную, отклонённую или уже отменённую заявку он только выводит.

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

    console.log({
      orderId: state.orderId,
      orderRequestId,
      status: state.executionReportStatus,
      lotsRequested: state.lotsRequested,
      lotsExecuted: state.lotsExecuted
    });
  }
  finally {
    await sdk.sandbox.closeSandboxAccount({ accountId });
  }
}
finally {
  sdk.close();
}
```

Между проверкой состояния и отменой заявка может исполниться. Тогда провайдер может отклонить отмену; пример передаёт эту ошибку вызывающему коду и выполняет `finally`. В приложении уточняйте состояние заявки после такой ошибки. Параметры и статусы определены в [контракте заявок](../../contracts/orders.proto).

Пример закрывает только счёт, который сам создал. Для дальнейших экспериментов со счётом перенесите его закрытие в конец своего сценария. Как получать изменения состояния заявки через поток, показано в [отдельном примере](./order-state-stream.md).
