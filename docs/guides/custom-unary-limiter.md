# Собственная реализация unary limiter-а

> Type: Consumer Guide. Документ описывает публичный port, который позволяет
> приложению самостоятельно владеть ожиданием unary-квоты. Это отдельный класс
> архитектурных решений, а не рекомендация использовать конкретный алгоритм или
> готовую реализацию SDK.

## Граница ответственности

SDK владеет знаниями о T-Invest API:

- сопоставляет полный gRPC method path с service fallback или более точным
  method rule;
- объединяет методы, расходующие общую квоту, одним `bucket`;
- передаёт исходные `maxRequests` и `windowMs` без нормализации секундного окна
  в минутное;
- объединяет отмену конкретного RPC с закрытием SDK instance.

Consumer-owned limiter владеет механизмом выдачи permit:

- выбирает алгоритм ожидания;
- хранит или координирует состояние;
- определяет границу process, host или deployment;
- прекращает ожидание по `AbortSignal`;
- определяет поведение при отказе собственного backend-а.

SDK не передаёт limiter-у OAuth token, request payload, metadata или service
client. Эти данные не нужны для управления готовой квотой и не должны
становиться неявными ключами внешнего хранилища.

## Публичные типы

Все типы импортируются только из корня пакета:

```ts
import type {
  TInvestUnaryLimit,
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter,
  TInvestUnaryLimits,
  TInvestUnaryQuota
} from '@woodger/t-invest-node-sdk';
```

Их контракт имеет следующую форму:

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

`TInvestOptions.unaryLimiter` принимает любой объект, структурно реализующий
`TInvestUnaryLimiter`. Наследование от SDK-класса и регистрация plugin-а не
требуются.

## Когда вызывается `acquire()`

Для каждого unary RPC с настроенным limiter-ом последовательность такова:

```text
проверка lifecycle SDK
  -> разрешение path в quota
  -> unaryLimiter.acquire(context)
  -> повторная проверка lifecycle и AbortSignal
  -> передача request в gRPC transport
```

Инварианты вызова:

1. `acquire()` вызывается ровно один раз непосредственно перед каждой
   попыткой передать unary request transport-у.
2. Успешное завершение `Promise<void>` означает выдачу permit. После него SDK
   вправе сразу начать transport call.
3. Отклонение Promise запрещает отправку request. Обычная ошибка limiter-а
   возвращается Consumer-у без преобразования в transport `SdkError`.
4. Server-side и bidirectional streams через этот port не проходят. Их
   соединения и subscriptions имеют отдельную политику.
5. Если `unaryLimiter` не передан, SDK не создаёт скрытый limiter и сразу
   передаёт unary-вызов transport-у.

Limiter вызывается на уровне transport middleware, поэтому прямой вызов любого
публичного service client проходит через тот же контракт. Вызов `acquire()` не
означает, что provider принял request: он означает только разрешение локальной
или внешней стратегии продолжить вызов.

## Семантика полей контекста

### `path`

`path` — полный путь вызываемого RPC, например:

```text
/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles
```

Поле пригодно для диагностики, метрик и дополнительной Consumer-owned policy.
Не следует заново выводить из него квоту: SDK уже передал разрешённое правило в
`quota`.

### `quota.bucket`

`bucket` — непрозрачный идентификатор общего временного состояния. Одинаковые
значения означают, что вызовы должны учитывать одну очередь или один счётчик.
Например, несколько methods формирования отчётов могут получить общий bucket.

Consumer должен:

- использовать значение целиком;
- сравнивать его только на равенство;
- не разбирать prefixes и segments;
- не связывать с ним бизнес-смысл или формат persisted data;
- добавлять собственный scope отдельным полем или внешним prefix, если один
  backend обслуживает несколько пользователей, environments или endpoints.

Состав buckets следует считать частью текущего snapshot лимитной policy SDK,
а не вечным идентификатором между произвольными версиями пакета. При
одновременной работе разных версий Consumer должен явно проверить, что их
quota policy совместима.

### `quota.maxRequests` и `quota.windowMs`

Пара задаёт максимум запросов в исходном временном окне. Например:

```ts
{
  bucket: '...',
  maxRequests: 15,
  windowMs: 1_000
}
```

означает 15 запросов за секунду. Представление не превращает эту квоту в 900
запросов за минуту, поскольку такие записи допускают разную burst-семантику.

SDK гарантирует конечные положительные значения. Это статическая package
policy с учётом `TInvestOptions.unaryLimits`, но не автоматически обновляемый
тариф пользователя. Limiter может применить более строгую Consumer-owned
policy, учитывать `x-ratelimit-*` metadata или данные `getUserTariff()`, не
изменяя переданный объект.

Один вызов получает одно наиболее специфичное правило. Оно не моделирует
одновременно все возможные service-, user- и IP-ограничения provider-а.
Дополнительные ограничения принадлежат реализации Consumer-а.

### `signal`

`signal` отменяется при отмене конкретного вызова или при `sdk.close()`. Он
может быть результатом `AbortSignal.any()`, поэтому нельзя полагаться на
identity с signal, переданным в call options.

Реализация должна:

- проверить `signal.aborted` до постановки в очередь;
- удалить незавершённое ожидание после события `abort`;
- отклонить Promise значением `signal.reason`, если оно доступно;
- удалить event listener при любом завершении;
- не выдавать permit после отмены.

Если limiter игнорирует signal и оставляет Promise незавершённым, SDK не может
принудительно остановить его внутреннее ожидание. В этом случае pending RPC
останется в ожидании limiter-а даже после `sdk.close()`.

Отмена call-level ожидания преобразуется в публичный `SdkErrorCode.Cancelled`
с `source: 'abort'`. Закрытие SDK сохраняет lifecycle error. Остальные ошибки
limiter-а не маскируются под gRPC failures.

## Ownership и время жизни

Limiter принадлежит коду, который его создал:

- `TInvestNodeSDK.close()` не вызывает у него `close()`, `dispose()` или иной
  lifecycle method;
- один limiter можно передать нескольким SDK instances, если они должны делить
  состояние;
- разные объекты limiter-а не делят состояние автоматически;
- Consumer закрывает внешние connections и workers после завершения всех SDK
  instances, которые используют limiter.

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
    firstSdk.marketdata.getCandles(firstRequest),
    secondSdk.marketdata.getCandles(secondRequest)
  ]);
}
finally {
  firstSdk.close();
  secondSdk.close();
}
```

Если instances используют разные `unaryLimits`, один bucket может прийти с
разными параметрами. Реализация должна заранее выбрать явную policy: отклонять
конфликт, использовать наиболее строгую квоту или разделять scopes. Незаметно
принимать последнее полученное значение небезопасно.

## Полный process-local пример

Ниже приведена самостоятельная rolling-window реализация. Это пример
Consumer-кода, а не эталон алгоритма для всех workloads. Она допускает burst в
пределах окна и хранит состояние только в текущем процессе.

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

При использовании этого примера один объект нужно создать на требуемый scope и
передать во все соответствующие SDK instances:

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const unaryLimiter = new RollingWindowUnaryLimiter();

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter
});
```

Для production-реализации дополнительно определяются наблюдаемость, предел
очереди, fairness, поведение при перегрузке и очистка неиспользуемых buckets.
Они зависят от приложения и поэтому не входят в минимальный port SDK.

## Межпроцессная реализация

Передача одного JavaScript-объекта объединяет только SDK instances одного
процесса. Для нескольких процессов `acquire()` может быть тонким adapter-ом к
явно запущенному coordinator-у:

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

Для такого решения нужно отдельно зафиксировать:

- кто запускает и завершает coordinator;
- какие processes входят в один `scope`;
- как выполняются atomic permit reservations;
- удаляется ли ещё не выданный request при cancellation или disconnect;
- применяется ли fail-closed при недоступности coordinator-а;
- как обрабатывается cold start после потери неперсистентного состояния;
- что происходит при разных версиях SDK или несовместимых квотах одного
  bucket;
- какие integration-тесты воспроизводят concurrency, crash и restart.

После выдачи permit его не следует возвращать из-за последующей ошибки или
отмены RPC: request уже мог достичь provider-а и быть учтён в квоте.

SDK не требует конкретного coordinator protocol, IPC transport или базы
данных. Это позволяет Consumer-у выбрать границу, соответствующую собственной
архитектуре, без runtime dependency внутри SDK.

## Per-instance overrides

`unaryLimits` позволяет заменить package rule для конкретного SDK instance.
Поля окна задаются явно:

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

Остальные rules наследуются из `defaultConfig.unaryLimits`. Изменение одного
method rule отсоединяет его от package quota group, если иначе у общего bucket
получились бы разные параметры. Одинаковое изменение всех methods группы
сохраняет общий bucket.

Overrides проверяются при создании SDK независимо от наличия limiter-а. Без
`unaryLimiter` они не создают ожидание сами по себе.

## Необязательная реализация пакета

Пакет предоставляет `createInMemoryUnaryLimiter()` как небольшой готовый
вариант:

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

Эта реализация равномерно разносит permits, использует монотонное время,
поддерживает cancellation и может делить состояние между SDK instances одного
процесса при передаче одного объекта. Несовпадающие параметры одного bucket
она отклоняет как конфликт конфигурации. Реализация не координирует разные
процессы или hosts, не обновляет квоты из тарифа и не моделирует stream limits.
Consumer может не использовать её вовсе.

## Проверочный список собственной реализации

- `acquire()` разрешается только после фактической выдачи permit.
- Все callers с одинаковыми `bucket` используют одно состояние в выбранном
  scope.
- `maxRequests` и `windowMs` применяются как пара без смены единиц.
- Неиспользованные ожидания удаляются по `signal` без listener leaks.
- После выдачи permit нет автоматического refund.
- Конфликт квот одного bucket обрабатывается явно.
- Ошибка backend-а не включает незаметный локальный fallback.
- Streams не считаются unary-вызовами.
- Limiter не ожидает OAuth token или request payload от SDK.
- Lifecycle limiter-а остаётся у Consumer-а.
- Multi-process координация проверена отдельным integration-тестом, если она
  заявлена реализацией.

Официальные значения и известные границы package policy описаны отдельно в
[лимитной политике](../limits-policy.md). Варианты межпроцессной архитектуры и
их trade-offs сохранены в [roadmap](../roadmap.md).
