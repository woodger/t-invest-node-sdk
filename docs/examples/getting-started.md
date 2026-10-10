# Первый SDK-вызов

> Type: Guide. Здесь показано, как получить список счетов, выбрать счёт и закрыть SDK.

<a id="установка"></a>
<a id="переменные-окружения"></a>

## Законченный пример

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

## Почему lifecycle выглядит именно так

- Сначала дождитесь unary-вызова, затем закройте SDK в `finally`.
- `getAccounts()` может не вернуть ни одного счёта. Не подставляйте пустой `accountId`: вызывайте следующий RPC только после явного выбора существующего счёта.

Ограничение времени запроса, метаданные ответа и несколько связанных запросов разобраны в руководстве [Unary-вызовы](./unary-calls.md). Проверка ошибок по стабильным полям показана в руководстве [Ошибки и lifecycle](./errors-and-lifecycle.md).
