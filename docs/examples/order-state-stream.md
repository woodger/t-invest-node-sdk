# Следить за состоянием заявки

Используйте этот пример, когда нужно получать изменения состояния одной заявки через `ordersStream.orderStateStream`. Приложение подписывается на события выбранного счёта, проверяет подтверждение подписки и выделяет события по клиентскому ключу заявки.

## Отобрать события своей заявки

`orderRequestId` — UUID, который приложение передало в поле `orderId` при выставлении заявки. В сообщениях потока он возвращается как `orderState.orderRequestId`. Первый `orderState.orderId` ещё может быть внутренним номером заявки, поэтому для связи с отправленным поручением используйте клиентский ключ. Особенности идентификаторов и статусов описаны в [документации потока заявок](https://developer.tbank.ru/invest/services/orders/orders_state_stream).

Поток принимает ID счёта и передаёт события всех его заявок. Функция пропускает `ping`, события стоп-заявок и сообщения о других заявках.

`watch-order-state.ts`

```ts
import {
  ResultSubscriptionStatus,
  type TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

export async function watchOrderState(
  sdk: Pick<TInvestNodeSDK, 'ordersStream'>,
  accountId: string,
  orderRequestId: string,
  signal: AbortSignal
): Promise<void> {
  const responses = sdk.ordersStream.orderStateStream({
    accounts: [accountId]
  }, { signal });

  for await (const response of responses) {
    if (response.subscription) {
      if (response.subscription.status !== ResultSubscriptionStatus.RESULT_SUBSCRIPTION_STATUS_OK) {
        throw new Error('Order-state subscription was rejected');
      }

      console.log('Подписка на состояния заявок подтверждена');
    }

    const state = response.orderState;

    if (!state || state.orderRequestId !== orderRequestId) {
      continue;
    }

    console.log({
      orderId: state.orderId,
      orderRequestId: state.orderRequestId,
      status: state.executionReportStatus,
      lotsRequested: state.lotsRequested,
      lotsExecuted: state.lotsExecuted
    });
  }
}
```

## Открыть поток и остановить чтение

В примере используется существующий счёт песочницы и сохранённый ключ заявки. Замените `YOUR_SANDBOX_ACCOUNT_ID` и `YOUR_ORDER_REQUEST_ID` своими значениями. Для новой заявки откройте поток и дождитесь подтверждения подписки до её выставления. Подготовку счёта и заявки показывает [цикл в песочнице](./sandbox-orders.md); чтобы оставить счёт для наблюдения, перенесите его закрытие в конец своего сценария.

`main.ts`

```ts
import {
  isSdkError,
  SdkErrorCode,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';
import { watchOrderState } from './watch-order-state.js';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'sandbox-invest-public-api.tbank.ru:443'
});
const shutdown = new AbortController();
const requestShutdown = () => shutdown.abort();

process.once('SIGINT', requestShutdown);
process.once('SIGTERM', requestShutdown);

try {
  await watchOrderState(
    sdk, 'YOUR_SANDBOX_ACCOUNT_ID', 'YOUR_ORDER_REQUEST_ID', shutdown.signal
  );
}
catch (error) {
  if (!shutdown.signal.aborted
    || !isSdkError(error, SdkErrorCode.Cancelled) || error.source !== 'abort') {
    throw error;
  }
}
finally {
  process.off('SIGINT', requestShutdown);
  process.off('SIGTERM', requestShutdown);
  shutdown.abort();
  sdk.close();
}
```

Стрим сообщает изменения, а текущее состояние можно отдельно получить через `getOrderState` или `getSandboxOrderState`. Для уже существующей заявки и после разрыва соединения сверяйте состояние unary-запросом. Пример не восстанавливает пропущенные события.

Модель статусов потока отличается от unary-ответов: после частичного исполнения отменённая заявка может остаться в потоковом статусе `PARTIALLYFILL`. Поэтому пример продолжает чтение до отмены или завершения потока. Порядок отмены и освобождения ресурсов разобран в [общем примере потоков](./streams-and-cancellation.md).
