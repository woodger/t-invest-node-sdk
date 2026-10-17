<a id="собственная-реализация-unary-limiter-а"></a>
# Реализовать свой ограничитель одиночных gRPC-запросов

Используйте этот пример, когда готовый ограничитель не подходит алгоритмом или нужно координировать квоты между процессами. Приложение реализует `TInvestUnaryLimiter`, ждёт разрешение для переданной квоты и прекращает ожидание по `AbortSignal`. В итоге SDK вызывает единый интерфейс перед одиночным (`unary`) запросом, а приложение сохраняет контроль над очередью, хранилищем и отказами координатора.

<a id="per-instance-overrides"></a>
<a id="необязательная-реализация-пакета"></a>
<a id="необязательная-реализация-модуля"></a>
<a id="статическая-доля-квоты"></a>

Подключение готового ограничителя, переопределение квот и `quotaShare` показаны в руководстве [Ограничение частоты запросов](./unary-limits.md).

<a id="граница-ответственности"></a>
## Разделить ответственность SDK и ограничителя

SDK владеет знаниями о T-Invest API:

- сопоставляет полный путь gRPC-метода с правилом сервиса или более точным правилом метода;
- объединяет методы, расходующие общую квоту, одним `bucket`;
- передаёт исходные `maxRequests` и `windowMs` без нормализации секундного окна в минутное;
- объединяет отмену конкретного RPC с закрытием экземпляра SDK.

Ограничитель приложения решает, когда разрешить очередной запрос:

- выбирает алгоритм ожидания;
- хранит или координирует состояние;
- определяет, какие процессы, машины или развёртывания делят состояние;
- прекращает ожидание по `AbortSignal`;
- определяет поведение при отказе собственного хранилища или сервиса.

SDK не передаёт ограничителю OAuth-токен, содержимое запроса, метаданные или клиент сервиса. Эти данные не нужны для управления готовой квотой и не должны становиться неявными ключами внешнего хранилища.

<a id="публичные-типы"></a>
## Импортировать публичные типы

Импортируйте все типы из корня модуля:

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

В `TInvestOptions.unaryLimiter` можно передать любой объект, который структурно реализует `TInvestUnaryLimiter`. Наследование от класса SDK или регистрация плагина не требуются.

<a id="когда-вызывается-acquire"></a>
## Понять порядок вызова `acquire()`

Для каждого unary RPC SDK выполняет шаги в таком порядке:

```text
проверка lifecycle SDK
  -> разрешение path в quota
  -> unaryLimiter.acquire(context)
  -> повторная проверка lifecycle и AbortSignal
  -> передача request в gRPC transport
```

Инварианты вызова:

1. `acquire()` вызывается ровно один раз непосредственно перед каждой попыткой передать unary-запрос транспорту.
2. Успешное завершение `Promise<void>` означает, что ограничитель разрешил запрос. Сразу после этого SDK может начать gRPC-вызов.
3. Если Promise отклонён, SDK не отправляет запрос и возвращает приложению ошибку ограничителя без преобразования в транспортный `SdkError`.
4. Серверные и двусторонние потоки через этот интерфейс не проходят. Их соединения и подписки имеют отдельные ограничения.
5. Если `unaryLimiter` не передан, SDK не создаёт скрытый ограничитель и сразу передаёт unary-вызов транспорту.

Ограничитель вызывается в транспортном middleware, поэтому все публичные клиенты сервисов используют один контракт. Успешный `acquire()` разрешает SDK продолжить вызов, но не подтверждает, что провайдер принял запрос.

<a id="семантика-полей-контекста"></a>
## Использовать данные, переданные в `acquire()`

<a id="path"></a>
### Использовать `path` для диагностики

`path` — полный путь вызываемого RPC, например:

```text
/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles
```

Используйте поле для диагностики, метрик и дополнительных правил приложения. Не вычисляйте по нему квоту заново: SDK уже передал готовое правило в `quota`.

<a id="quotabucket"></a>
### Использовать `quota.bucket` для общего учёта

`bucket` — непрозрачный идентификатор общего временного состояния. Одинаковые значения означают, что вызовы должны учитывать одну очередь или один счётчик. Например, несколько методов формирования отчётов могут получить общий `bucket`.

Код приложения должен:

- использовать значение целиком;
- сравнивать его только на равенство;
- не разбирать префиксы и части идентификатора;
- не связывать с ним бизнес-смысл или формат сохраняемых данных;
- добавлять собственный идентификатор области координации отдельным полем или внешним префиксом, если одно хранилище или сервис обслуживает несколько пользователей, окружений или серверов.

Считайте набор значений `bucket` частью лимитных правил конкретной версии SDK, а не неизменным идентификатором. Если одновременно работают разные версии модуля, приложение должно проверить совместимость их правил квотирования.

<a id="quotamaxrequests-и-quotawindowms"></a>
### Учесть `quota.maxRequests` и `quota.windowMs`

Пара задаёт максимум запросов в исходном временном окне. Например:

```ts
{
  bucket: '...',
  maxRequests: 15,
  windowMs: 1_000
}
```

означает 15 запросов за секунду. Такая квота отличается от 900 запросов за минуту: эти окна допускают разное число запросов, отправленных подряд.

SDK передаёт конечные положительные значения из статических правил модуля с учётом `TInvestOptions.unaryLimits`. Они не заменяют актуальный тариф пользователя. Ограничитель может применить более строгие правила приложения и учесть метаданные `x-ratelimit-*` или данные `getUserTariff()`, не меняя переданный объект.

Один вызов получает одно наиболее специфичное правило. Оно не учитывает одновременно все возможные ограничения провайдера для сервисов, пользователей и IP-адресов. Дополнительные ограничения реализует приложение.

<a id="signal"></a>
### Прекратить ожидание по `signal`

SDK отменяет `signal` вместе с конкретным вызовом или при `sdk.close()`. Сигнал может быть результатом `AbortSignal.any()`, поэтому не проверяйте его равенство по ссылке с сигналом из опций вызова.

Реализация должна:

- проверить `signal.aborted` до постановки в очередь;
- удалить незавершённое ожидание после события `abort`;
- отклонить Promise значением `signal.reason`, если оно доступно;
- удалить обработчик события при любом завершении;
- не разрешать запрос после отмены.

Если ограничитель игнорирует сигнал и не завершает Promise, SDK не сможет остановить его внутреннее ожидание. RPC продолжит ждать разрешения даже после `sdk.close()`.

SDK преобразует отмену отдельного вызова в публичный `SdkErrorCode.Cancelled` с `source: 'abort'`, а при закрытии сохраняет ошибку закрытого SDK. Остальные ошибки ограничителя передаются без маскировки под ошибки gRPC.

<a id="время-жизни-ограничителя"></a>
## Управлять временем жизни ограничителя

Временем жизни ограничителя управляет код, который его создал:

- `TInvestNodeSDK.close()` не вызывает у него `close()`, `dispose()` или иной метод завершения работы;
- один ограничитель можно передать нескольким экземплярам SDK, если они должны делить состояние;
- разные объекты ограничителей не делят состояние автоматически;
- приложение закрывает внешние соединения и останавливает воркеры после завершения всех экземпляров SDK, использующих ограничитель.

Пример общего ограничителя для двух экземпляров SDK в одном процессе:

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
  const results = await Promise.allSettled([
    firstSdk.marketData.getCandles(firstRequest),
    secondSdk.marketData.getCandles(secondRequest)
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      throw result.reason;
    }
  }
}
finally {
  firstSdk.close();
  secondSdk.close();
}
```

`Promise.allSettled()` дожидается обоих запросов, даже если один завершился ошибкой. После этого пример передаёт ошибку дальше и закрывает оба SDK в `finally`.

Если экземпляры используют разные `unaryLimits`, один `bucket` может получить разные параметры. Заранее выберите правило: отклонять конфликт, использовать наиболее строгую квоту или разделять области координации. Не принимайте молча последнее значение.

<a id="полный-process-local-пример"></a>
## Реализовать ограничитель для одного процесса

Ниже — реализация ограничителя со скользящим временным окном для кода приложения. Алгоритм допускает отправку нескольких запросов подряд в пределах квоты и хранит состояние только в текущем процессе. При `maxRequests >= 1` допустимое число таких запросов округляется вниз. При `maxRequests < 1` один запрос разрешается за увеличенное окно `windowMs / maxRequests`: квота `0.5` за `100` мс допускает одно разрешение каждые `200` мс.

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
    const maxRequests = Math.max(1, Math.floor(state.maxRequests));
    const windowMs = state.maxRequests < 1
      ? state.windowMs / state.maxRequests
      : state.windowMs;

    while (true) {
      throwIfAborted(context.signal);

      const now = performance.now();

      this.removeExpired(state, now, windowMs);

      if (state.issuedAt.length < maxRequests) {
        state.issuedAt.push(now);

        return;
      }

      const oldestPermit = state.issuedAt[0];

      if (oldestPermit === undefined) {
        continue;
      }

      await wait(
        Math.max(0, oldestPermit + windowMs - now),
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

  private removeExpired(state: BucketState, now: number, windowMs: number): void {
    const threshold = now - windowMs;
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

Передайте один объект ограничителя всем экземплярам SDK в процессе, которые должны учитывать одну квоту:

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const unaryLimiter = new RollingWindowUnaryLimiter();

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimiter
});
```

Для реализации приложения также продумайте наблюдаемость, предел очереди, порядок выдачи разрешений, поведение при перегрузке и очистку неиспользуемых `bucket`. Эти решения зависят от приложения; SDK требует только соблюдения интерфейса `TInvestUnaryLimiter`.

<a id="межпроцессная-реализация"></a>
## Координировать квоты между процессами

Один JavaScript-объект объединяет экземпляры SDK только внутри процесса. Для нескольких процессов `acquire()` может обращаться к отдельно запущенному координатору.

Если координатор обслуживает несколько пользователей, окружений или развёртываний, его запрос должен содержать ключ, который определяет общий учёт квот. В примере этот ключ называется `quotaCoordinationKey`; он относится к протоколу приложения и не входит в интерфейс SDK:

```ts
import type {
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter
} from '@woodger/t-invest-node-sdk';

interface CoordinatorClient {
  acquire(
    request: {
      readonly quotaCoordinationKey: string;
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
    private readonly quotaCoordinationKey: string
  ) {}

  async acquire(context: TInvestUnaryLimitContext): Promise<void> {
    await this.client.acquire({
      quotaCoordinationKey: this.quotaCoordinationKey,
      bucket: context.quota.bucket,
      maxRequests: context.quota.maxRequests,
      windowMs: context.quota.windowMs
    }, context.signal);
  }
}
```

Для такого решения заранее определите:

- кто запускает и завершает координатор;
- какие процессы используют один `quotaCoordinationKey`;
- как атомарно резервируются разрешения на запросы;
- удаляется ли ещё не разрешённый запрос при отмене или разрыве соединения;
- запрещается ли выдача разрешений при недоступности координатора;
- как выполняется запуск после потери состояния, которое хранилось только в памяти;
- что происходит при разных версиях SDK или несовместимых квотах одного `bucket`;
- какие интеграционные тесты воспроизводят параллельную работу, аварийное завершение и перезапуск.

Не возвращайте квоту после ошибки или отмены RPC: запрос уже мог достичь провайдера и быть учтён в квоте.

SDK не задаёт протокол координатора, транспорт IPC или базу данных. Приложение само выбирает ключ координации и способ его передачи, не добавляя зависимость в SDK.

<a id="проверочный-список-собственной-реализации"></a>
## Проверить собственную реализацию

- `acquire()` завершается успешно только после фактической выдачи разрешения.
- Все вызовы с одинаковыми `bucket` и `quotaCoordinationKey` используют одно общее состояние.
- `maxRequests` и `windowMs` применяются как пара без смены единиц.
- Отменённые ожидания удаляются по `signal` без утечек обработчиков событий.
- После выдачи разрешения квота не возвращается автоматически.
- Конфликт квот одного `bucket` обрабатывается явно.
- Ошибка хранилища или сервиса не включает незаметную замену общих ограничений локальными.
- Потоки не считаются unary-вызовами.
- Ограничитель не ожидает OAuth-токен или содержимое запроса от SDK.
- Временем жизни ограничителя управляет приложение.
- Межпроцессная координация проверена отдельным интеграционным тестом, если она заявлена реализацией.

Официальные значения и ограничения правил модуля смотрите в [лимитной политике](../limits-policy.md), а варианты межпроцессной архитектуры, их преимущества и ограничения — в [roadmap](../roadmap.md).
