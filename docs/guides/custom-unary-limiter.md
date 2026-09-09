# Собственная реализация unary limiter-а

> Type: Consumer Guide. Здесь подробно разобран публичный port для Consumer-owned ожидания unary-квоты. Руководство показывает отдельный класс решений и не навязывает конкретный алгоритм или готовую реализацию SDK.

## Граница ответственности

SDK владеет знаниями о T-Invest API:

- сопоставляет полный gRPC method path с service fallback или более точным method rule;
- объединяет методы, расходующие общую квоту, одним `bucket`;
- передаёт исходные `maxRequests` и `windowMs` без нормализации секундного окна в минутное;
- объединяет отмену конкретного RPC с закрытием SDK instance.

Consumer-owned limiter владеет механизмом выдачи permit:

- выбирает алгоритм ожидания;
- хранит или координирует состояние;
- определяет границу process, host или deployment;
- прекращает ожидание по `AbortSignal`;
- определяет поведение при отказе собственного backend-а.

SDK не передаёт limiter-у OAuth token, request payload, metadata или service client. Эти данные не нужны для управления готовой квотой и не должны становиться неявными ключами внешнего хранилища.

## Публичные типы

Импортируйте все типы из корня пакета:

```ts
import type {
  TInvestUnaryLimit,
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter,
  TInvestUnaryLimits,
  TInvestUnaryQuota
} from '@woodger/t-invest-node-sdk';
```

Контракт выглядит так:

```ts
interface TInvestUnaryLimit {
  readonly maxRequests: number;
  readonly windowMs: number;
}

type TInvestUnaryLimits = Record<string, TInvestUnaryLimit>;

interface TInvestUnaryQuota extends TInvestUnaryLimit {
  readonly bucket: string;
}

interface TInvestUnaryLimitContext {
  readonly path: string;
  readonly quota: TInvestUnaryQuota;
  readonly signal: AbortSignal;
}

interface TInvestUnaryLimiter {
  acquire(context: TInvestUnaryLimitContext): Promise<void>;
}
```

В `TInvestOptions.unaryLimiter` можно передать любой объект, который структурно реализует `TInvestUnaryLimiter`. Не нужно наследоваться от SDK-класса или регистрировать plugin.

## Когда вызывается `acquire()`

Для каждого unary RPC SDK выполняет шаги в таком порядке:

```text
проверка lifecycle SDK
  -> разрешение path в quota
  -> unaryLimiter.acquire(context)
  -> повторная проверка lifecycle и AbortSignal
  -> передача request в gRPC transport
```

Инварианты вызова:

1. `acquire()` вызывается ровно один раз непосредственно перед каждой попыткой передать unary request transport-у.
2. Успешный `Promise<void>` означает, что limiter выдал permit. Сразу после этого SDK может начать transport call.
3. Если Promise отклонён, SDK не отправляет request и возвращает ошибку limiter-а Consumer-у без преобразования в transport `SdkError`.
4. Server-side и bidirectional streams через этот port не проходят. Их соединения и subscriptions имеют отдельную политику.
5. Если `unaryLimiter` не передан, SDK не создаёт скрытый limiter и сразу передаёт unary-вызов transport-у.

Limiter работает в transport middleware, поэтому любой публичный service client использует один и тот же контракт. Успешный `acquire()` лишь разрешает SDK продолжить вызов и не означает, что provider уже принял request.

## Семантика полей контекста

### `path`

`path` — полный путь вызываемого RPC, например:

```text
/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles
```

Используйте поле для диагностики, метрик и дополнительной Consumer-owned policy. Не вычисляйте по нему квоту заново: SDK уже передал готовое правило в `quota`.

### `quota.bucket`

`bucket` — непрозрачный идентификатор общего временного состояния. Одинаковые значения означают, что вызовы должны учитывать одну очередь или один счётчик. Например, несколько methods формирования отчётов могут получить общий bucket.

Consumer должен:

- использовать значение целиком;
- сравнивать его только на равенство;
- не разбирать prefixes и segments;
- не связывать с ним бизнес-смысл или формат persisted data;
- добавлять собственный scope отдельным полем или внешним prefix, если один backend обслуживает несколько пользователей, environments или endpoints.

Считайте набор buckets частью лимитной policy конкретной версии SDK, а не вечным идентификатором. Если одновременно работают разные версии пакета, Consumer должен проверить совместимость их quota policy.

### `quota.maxRequests` и `quota.windowMs`

Пара задаёт максимум запросов в исходном временном окне. Например:

```ts
{
  bucket: '...',
  maxRequests: 15,
  windowMs: 1_000
}
```

означает 15 запросов за секунду. Представление не превращает эту квоту в 900 запросов за минуту, поскольку такие записи допускают разную burst-семантику.

SDK передаёт конечные положительные значения из статической package policy с учётом `TInvestOptions.unaryLimits`. Они не заменяют актуальный тариф пользователя. Limiter может применить более строгую Consumer-owned policy и учесть `x-ratelimit-*` metadata или данные `getUserTariff()`, не меняя переданный объект.

Один вызов получает одно наиболее специфичное правило. Оно не моделирует одновременно все возможные service-, user- и IP-ограничения provider-а. Дополнительные ограничения принадлежат реализации Consumer-а.

### `signal`

SDK отменяет `signal` вместе с конкретным вызовом или при `sdk.close()`. Signal может быть результатом `AbortSignal.any()`, поэтому не сравнивайте его identity с signal из call options.

Реализация должна:

- проверить `signal.aborted` до постановки в очередь;
- удалить незавершённое ожидание после события `abort`;
- отклонить Promise значением `signal.reason`, если оно доступно;
- удалить event listener при любом завершении;
- не выдавать permit после отмены.

Если limiter игнорирует signal и не завершает Promise, SDK не сможет остановить его внутреннее ожидание. Pending RPC продолжит ждать limiter даже после `sdk.close()`.

SDK преобразует call-level отмену в публичный `SdkErrorCode.Cancelled` с `source: 'abort'`, а при закрытии сохраняет lifecycle error. Остальные ошибки limiter-а проходят без маскировки под gRPC failures.

## Ownership и время жизни

Limiter принадлежит коду, который его создал:

- `TInvestNodeSDK.close()` не вызывает у него `close()`, `dispose()` или иной lifecycle method;
- один limiter можно передать нескольким SDK instances, если они должны делить состояние;
- разные объекты limiter-а не делят состояние автоматически;
- Consumer закрывает внешние connections и workers после завершения всех SDK instances, которые используют limiter.

Пример общего process-local ownership:

```ts
import {
  TInvestNodeSDK,
  type TInvestUnaryLimiter
} from '@woodger/t-invest-node-sdk';

declare const unaryLimiter: TInvestUnaryLimiter;

const firstSdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter
});

const secondSdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter
});

try {
  await Promise.all([
    firstSdk.marketData.getCandles(firstRequest),
    secondSdk.marketData.getCandles(secondRequest)
  ]);
}
finally {
  firstSdk.close();
  secondSdk.close();
}
```

Если instances используют разные `unaryLimits`, один bucket может получить разные параметры. Заранее выберите явную policy: отклонять конфликт, использовать наиболее строгую квоту или разделять scopes. Не принимайте молча последнее значение.

## Полный process-local пример

Ниже — самостоятельная rolling-window реализация. Это пример Consumer-кода, а не универсальный алгоритм. Он допускает burst в пределах окна и хранит состояние только в текущем процессе.

```ts
import type {
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter,
  TInvestUnaryQuota
} from '@woodger/t-invest-node-sdk';

interface BucketState {
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly issuedAt: number[];
}

const maxTimerDelayMs = 2_147_483_647;

export class RollingWindowUnaryLimiter implements TInvestUnaryLimiter {
  private readonly buckets = new Map<string, BucketState>();

  async acquire(context: TInvestUnaryLimitContext): Promise<void> {
    const state = this.getBucket(context.quota);

    while (true) {
      throwIfAborted(context.signal);

      const now = performance.now();

      this.removeExpired(state, now);

      if (state.issuedAt.length < state.maxRequests) {
        state.issuedAt.push(now);

        return;
      }

      const oldestPermit = state.issuedAt[0];

      if (oldestPermit === undefined) {
        continue;
      }

      await wait(
        Math.max(0, oldestPermit + state.windowMs - now),
        context.signal
      );
    }
  }

  private getBucket(quota: TInvestUnaryQuota): BucketState {
    const current = this.buckets.get(quota.bucket);

    if (current !== undefined) {
      if (
        current.maxRequests !== quota.maxRequests
        || current.windowMs !== quota.windowMs
      ) {
        throw new Error(`Conflicting quota for bucket ${quota.bucket}`);
      }

      return current;
    }

    const created: BucketState = {
      maxRequests: quota.maxRequests,
      windowMs: quota.windowMs,
      issuedAt: []
    };

    this.buckets.set(quota.bucket, created);

    return created;
  }

  private removeExpired(state: BucketState, now: number): void {
    const threshold = now - state.windowMs;
    let expired = 0;

    while (
      expired < state.issuedAt.length
      && (state.issuedAt[expired] ?? Number.POSITIVE_INFINITY) <= threshold
    ) {
      expired += 1;
    }

    if (expired > 0) {
      state.issuedAt.splice(0, expired);
    }
  }
}

async function wait(delayMs: number, signal: AbortSignal): Promise<void> {
  let remainingMs = delayMs;

  while (remainingMs > 0) {
    throwIfAborted(signal);

    const startedAt = performance.now();

    await waitOnce(Math.min(remainingMs, maxTimerDelayMs), signal);
    remainingMs -= performance.now() - startedAt;
  }
}

function waitOnce(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortReason(signal));

      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(abortReason(signal));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw abortReason(signal);
  }
}

function abortReason(signal: AbortSignal): unknown {
  if (signal.reason !== undefined) {
    return signal.reason;
  }

  const error = new Error('The operation was aborted');

  error.name = 'AbortError';

  return error;
}
```

Создайте один объект на нужный scope и передайте его всем соответствующим SDK instances:

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const unaryLimiter = new RollingWindowUnaryLimiter();

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter
});
```

Для production-реализации также продумайте наблюдаемость, предел очереди, fairness, поведение при перегрузке и очистку неиспользуемых buckets. Эти решения зависят от приложения и не входят в минимальный port SDK.

## Межпроцессная реализация

Один JavaScript-объект объединяет SDK instances только внутри процесса. Для нескольких процессов сделайте `acquire()` тонким adapter-ом к отдельно запущенному coordinator-у:

```ts
import type {
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter
} from '@woodger/t-invest-node-sdk';

interface CoordinatorClient {
  acquire(
    request: {
      readonly scope: string;
      readonly bucket: string;
      readonly maxRequests: number;
      readonly windowMs: number;
    },
    signal: AbortSignal
  ): Promise<void>;
}

class CoordinatorUnaryLimiter implements TInvestUnaryLimiter {
  constructor(
    private readonly client: CoordinatorClient,
    private readonly scope: string
  ) {}

  async acquire(context: TInvestUnaryLimitContext): Promise<void> {
    await this.client.acquire({
      scope: this.scope,
      bucket: context.quota.bucket,
      maxRequests: context.quota.maxRequests,
      windowMs: context.quota.windowMs
    }, context.signal);
  }
}
```

Для такого решения заранее определите:

- кто запускает и завершает coordinator;
- какие processes входят в один `scope`;
- как выполняются atomic permit reservations;
- удаляется ли ещё не выданный request при cancellation или disconnect;
- применяется ли fail-closed при недоступности coordinator-а;
- как обрабатывается cold start после потери неперсистентного состояния;
- что происходит при разных версиях SDK или несовместимых квотах одного bucket;
- какие integration-тесты воспроизводят concurrency, crash и restart.

Не возвращайте permit после ошибки или отмены RPC: request уже мог достичь provider-а и попасть в квоту.

SDK не требует конкретного coordinator protocol, IPC transport или базы данных. Consumer выбирает подходящую своей архитектуре границу без новой runtime dependency внутри SDK.

## Per-instance overrides

Через `unaryLimits` можно заменить package rule для конкретного SDK instance. Укажите оба параметра окна:

```ts
import {
  defineUnaryLimits,
  TInvestNodeSDK,
  type TInvestUnaryLimiter
} from '@woodger/t-invest-node-sdk';

declare const unaryLimiter: TInvestUnaryLimiter;

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter,
  unaryLimits: defineUnaryLimits({
    UsersService: {
      default: {
        maxRequests: 50,
        windowMs: 60_000
      }
    },
    OrdersService: {
      methods: {
        PostOrder: {
          maxRequests: 10,
          windowMs: 1_000
        }
      }
    }
  })
});
```

Остальные rules SDK берёт из `defaultConfig.unaryLimits`. Если изменить один method rule, SDK отсоединит его от package quota group, чтобы общий bucket не получил разные параметры. Одинаковое изменение всех methods группы сохранит общий bucket.

SDK проверяет overrides при создании instance даже без limiter-а. Сами по себе они не добавляют ожидание: для этого нужен `unaryLimiter`.

## Необязательная реализация пакета

Если нужен небольшой готовый вариант, пакет экспортирует `createInMemoryUnaryLimiter()`:

```ts
import {
  createInMemoryUnaryLimiter,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter: createInMemoryUnaryLimiter()
});
```

Эта реализация равномерно разносит permits, использует монотонное время и поддерживает cancellation. Один объект может делить состояние между SDK instances одного процесса. Несовпадающие параметры одного bucket она отклоняет как конфликт конфигурации. Реализация не координирует разные процессы или hosts, не обновляет квоты из тарифа и не моделирует stream limits. Consumer может выбрать другой limiter или вовсе обойтись без него.

## Проверочный список собственной реализации

- `acquire()` разрешается только после фактической выдачи permit.
- Все callers с одинаковыми `bucket` используют одно состояние в выбранном scope.
- `maxRequests` и `windowMs` применяются как пара без смены единиц.
- Неиспользованные ожидания удаляются по `signal` без listener leaks.
- После выдачи permit нет автоматического refund.
- Конфликт квот одного bucket обрабатывается явно.
- Ошибка backend-а не включает незаметный локальный fallback.
- Streams не считаются unary-вызовами.
- Limiter не ожидает OAuth token или request payload от SDK.
- Lifecycle limiter-а остаётся у Consumer-а.
- Multi-process координация проверена отдельным integration-тестом, если она заявлена реализацией.

Официальные значения и ограничения package policy смотрите в [лимитной политике](../limits-policy.md), а варианты межпроцессной архитектуры и их trade-offs — в [roadmap](../roadmap.md).
