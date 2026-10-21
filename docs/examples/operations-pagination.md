# Прочитать операции по страницам

`getOperationsByCursor` возвращает историю счёта по страницам. Начните с пустого курсора и передавайте `nextCursor` следующему запросу, пока `hasNext` равен `true`. Подставьте токен, [ID счёта](./getting-started.md) и нужный период.

`operations-pagination.ts`

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});
const request = {
  accountId: 'YOUR_ACCOUNT_ID',
  from: new Date('2026-01-01T00:00:00Z'),
  to: new Date('2026-02-01T00:00:00Z'),
  limit: 100
};
let cursor = '';

try {
  while (true) {
    const page = await sdk.operations.getOperationsByCursor({
      ...request,
      cursor
    });

    for (const operation of page.items) {
      console.log(operation);
    }

    if (!page.hasNext) {
      break;
    }

    cursor = page.nextCursor;
  }
}
finally {
  sdk.close();
}
```

При переходе между страницами меняйте только курсор: счёт, период и фильтры должны оставаться прежними. Пустой массив `items` не означает конец истории — проверяйте `hasNext`. Размер страницы здесь равен `100`; особенности метода описаны в [документации провайдера](https://developer.tbank.ru/invest/services/operations/operations_problems), фильтры — в [контракте операций](../../contracts/operations.proto). В песочнице используйте `sdk.sandbox.getSandboxOperationsByCursor`.

Для большого числа страниц подключите [ограничитель частоты запросов](./unary-limits.md). Как задать срок ожидания или отмену вызова, показано в [руководстве по unary-запросам](./unary-calls.md).
