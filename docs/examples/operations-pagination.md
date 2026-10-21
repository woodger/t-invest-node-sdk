# Прочитать операции по страницам

Используйте этот пример, когда история операций не помещается в один ответ. Приложение фиксирует счёт и период, последовательно вызывает `getOperationsByCursor` и обрабатывает операции без накопления всей истории в памяти.

## Пройти страницы по курсору

Первая страница запрашивается с пустым курсором. После обработки страницы функция проверяет `hasNext` и передаёт `nextCursor` следующему запросу. Пустой массив `items` сам по себе не завершает обход. Размер страницы выбран равным `100`; особенности метода описаны в [документации провайдера](https://developer.tbank.ru/invest/services/operations/operations_problems).

`read-operations.ts`

```ts
import type {
  OperationItem,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

export async function* readOperations(
  sdk: Pick<TInvestNodeSDK, 'operations'>,
  accountId: string,
  from: Date,
  to: Date,
  signal: AbortSignal
): AsyncGenerator<OperationItem> {
  const pageSize = 100;
  let cursor = '';

  while (true) {
    signal.throwIfAborted();

    const page = await sdk.operations.getOperationsByCursor({
      accountId,
      from,
      to,
      cursor,
      limit: pageSize
    }, { signal });

    for (const operation of page.items) {
      signal.throwIfAborted();
      yield operation;
    }

    if (!page.hasNext) {
      return;
    }

    cursor = page.nextCursor;
  }
}
```

## Обработать операции и закрыть SDK

Выберите счёт, как показано в [первом вызове](./getting-started.md), и подставьте его ID в `accountId`. В этом примере один срок ожидания ограничивает весь обход, а встроенный ограничитель регулирует частоту запросов страниц.

`main.ts`

```ts
import {
  createInMemoryUnaryLimiter,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';
import { readOperations } from './read-operations.js';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443',
  unaryLimiter: createInMemoryUnaryLimiter()
});
const accountId = 'YOUR_ACCOUNT_ID';
const from = new Date('2026-01-01T00:00:00Z');
const to = new Date('2026-02-01T00:00:00Z');
const readTimeoutMs = 60_000;
const signal = AbortSignal.timeout(readTimeoutMs);

try {
  for await (const operation of readOperations(sdk, accountId, from, to, signal)) {
    console.log(operation);
  }
}
finally {
  sdk.close();
}
```

Счёт, границы периода и фильтры должны оставаться одинаковыми при переходе между страницами; меняется только курсор. Дополнительные фильтры перечислены в [контракте операций](../../contracts/operations.proto). Для песочницы аналогичный метод доступен как `sdk.sandbox.getSandboxOperationsByCursor`.

Чтобы завершить чтение вручную, передайте сигнал своего `AbortController`. Отмена прерывает ожидание квоты, RPC и обработку следующей операции. Если потребитель завершает `for await` через `break`, следующая страница не запрашивается. Ошибки чтения передаются вызывающему коду; пример не повторяет запросы автоматически.
