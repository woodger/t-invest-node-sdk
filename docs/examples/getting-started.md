# Получить список счетов и закрыть SDK

Используйте этот пример, когда нужно проверить подключение и получить счёт для следующего API-вызова. Приложение создаёт SDK, запрашивает список счетов и выводит данные первого доступного счёта. В итоге оно либо получает выбранный счёт, либо явно сообщает, что счетов нет, и в обоих случаях закрывает SDK.


## Создать SDK, получить счёт и закрыть канал

В примере параметры указаны явно: замените `YOUR_TOKEN` своим токеном доступа.

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});

try {
  const { accounts } = await sdk.users.getAccounts({});
  const account = accounts[0];

  if (account) {
    console.log({
      id: account.id,
      name: account.name,
      status: account.status
    });
  }
  else {
    console.log('Нет доступных счетов');
  }
}
finally {
  sdk.close();
}
```

## Закрыть SDK после запроса

- Сначала дождитесь unary-вызова, затем закройте SDK в `finally`.
- `getAccounts()` может не вернуть ни одного счёта. Не подставляйте пустой `accountId`: вызывайте следующий RPC только после явного выбора существующего счёта.

Ограничение времени запроса, метаданные ответа и несколько связанных запросов разобраны в руководстве [Unary-вызовы](./unary-calls.md). Проверка ошибок по стабильным полям показана в руководстве [Ошибки и lifecycle](./errors-and-lifecycle.md).
