# Следить за состоянием заявки

`orderStateStream` передаёт изменения всех заявок выбранного счёта. Чтобы следить за одной заявкой, отбирайте события по `orderRequestId` — UUID, переданному в поле `orderId` при её выставлении. Первый `orderState.orderId` ещё может быть внутренним номером заявки.

Фрагмент использует готовый `sdk`, подключённый к песочнице, и `signal` для остановки чтения. Их создание, обработка отмены и закрытие SDK показаны в [общем примере потоков](./streams-and-cancellation.md#открыть-серверный-поток). Подставьте ID существующего счёта песочницы и сохранённый ключ заявки.

`order-state-stream.ts`

```ts
import { ResultSubscriptionStatus } from '@woodger/t-invest-node-sdk';

const accountId = 'YOUR_SANDBOX_ACCOUNT_ID';
const orderRequestId = 'YOUR_ORDER_REQUEST_ID';
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

  if (state?.orderRequestId === orderRequestId) {
    console.log(state);
  }
}
```

Для новой заявки откройте поток и дождитесь подтверждения подписки до её выставления. Подготовка счёта и заявки разобрана в [цикле песочницы](./sandbox-orders.md); чтобы продолжить работу со счётом, закройте его в конце своего сценария.

Текущее состояние существующей заявки и состояние после разрыва соединения сверяйте через `getOrderState` или `getSandboxOrderState`: поток не восстанавливает пропущенные события.

После частичного исполнения отменённая заявка может остаться в потоковом статусе `PARTIALLYFILL`. Поэтому чтение продолжается до отмены `signal` или завершения потока. Особенности идентификаторов и статусов описаны в [документации провайдера](https://developer.tbank.ru/invest/services/orders/orders_state_stream).
