# Собственная реализация unary limiter-а

> Type: Consumer Guide. Здесь показано, как написать и подключить собственный ограничитель частоты unary-запросов. Руководство объясняет публичный интерфейс SDK, порядок ожидания и отмены, а также варианты для одного или нескольких процессов. Алгоритм выбирает приложение.

## Граница ответственности

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

## Публичные типы

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

1. `acquire()` вызывается ровно один раз непосредственно перед каждой попыткой передать unary-запрос транспорту.
2. Успешное завершение `Promise<void>` означает, что ограничитель разрешил запрос. Сразу после этого SDK может начать gRPC-вызов.
3. Если Promise отклонён, SDK не отправляет запрос и возвращает приложению ошибку ограничителя без преобразования в транспортный `SdkError`.
4. Серверные и двусторонние потоки через этот интерфейс не проходят. Их соединения и подписки имеют отдельные ограничения.
5. Если `unaryLimiter` не передан, SDK не создаёт скрытый ограничитель и сразу передаёт unary-вызов транспорту.

Ограничитель вызывается в транспортном middleware, поэтому все публичные клиенты сервисов используют один контракт. Успешный `acquire()` разрешает SDK продолжить вызов, но не подтверждает, что провайдер принял запрос.

## Семантика полей контекста

### `path`

`path` — полный путь вызываемого RPC, например:

```text
/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles
```

Используйте поле для диагностики, метрик и дополнительных правил приложения. Не вычисляйте по нему квоту заново: SDK уже передал готовое правило в `quota`.

### `quota.bucket`

`bucket` — непрозрачный идентификатор общего временного состояния. Одинаковые значения означают, что вызовы должны учитывать одну очередь или один счётчик. Например, несколько методов формирования отчётов могут получить общий `bucket`.

Код приложения должен:

- использовать значение целиком;
- сравнивать его только на равенство;
- не разбирать префиксы и части идентификатора;
- не связывать с ним бизнес-смысл или формат сохраняемых данных;
- добавлять собственный идентификатор области координации отдельным полем или внешним префиксом, если одно хранилище или сервис обслуживает несколько пользователей, окружений или серверов.

Считайте набор значений `bucket` частью лимитных правил конкретной версии SDK, а не неизменным идентификатором. Если одновременно работают разные версии модуля, приложение должно проверить совместимость их правил квотирования.

### `quota.maxRequests` и `quota.windowMs`

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

### `signal`

SDK отменяет `signal` вместе с конкретным вызовом или при `sdk.close()`. Сигнал может быть результатом `AbortSignal.any()`, поэтому не проверяйте его равенство по ссылке с сигналом из опций вызова.

Реализация должна:

- проверить `signal.aborted` до постановки в очередь;
- удалить незавершённое ожидание после события `abort`;
- отклонить Promise значением `signal.reason`, если оно доступно;
- удалить обработчик события при любом завершении;
- не разрешать запрос после отмены.

Если ограничитель игнорирует сигнал и не завершает Promise, SDK не сможет остановить его внутреннее ожидание. RPC продолжит ждать разрешения даже после `sdk.close()`.

SDK преобразует отмену отдельного вызова в публичный `SdkErrorCode.Cancelled` с `source: 'abort'`, а при закрытии сохраняет ошибку закрытого SDK. Остальные ошибки ограничителя передаются без маскировки под ошибки gRPC.

## Ownership и время жизни

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

## Полный process-local пример

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

- кто запускает и завершает координатор;
- какие процессы входят в одну область координации (`scope`);
- как атомарно резервируются разрешения на запросы;
- удаляется ли ещё не разрешённый запрос при отмене или разрыве соединения;
- запрещается ли выдача разрешений при недоступности координатора;
- как выполняется запуск после потери состояния, которое хранилось только в памяти;
- что происходит при разных версиях SDK или несовместимых квотах одного `bucket`;
- какие интеграционные тесты воспроизводят параллельную работу, аварийное завершение и перезапуск.

Не возвращайте квоту после ошибки или отмены RPC: запрос уже мог достичь провайдера и быть учтён в квоте.

SDK не требует конкретного протокола координатора, транспорта IPC или базы данных. Приложение выбирает подходящую своей архитектуре область координации без новой зависимости времени выполнения внутри SDK.

## Per-instance overrides

Через `unaryLimits` можно заменить правило модуля для конкретного экземпляра SDK. Укажите оба параметра окна:

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

Остальные правила SDK берёт из `defaultConfig.unaryLimits`. Если изменить квоту одного метода, SDK отсоединит его от общей группы квот модуля, чтобы один `bucket` не получил разные параметры. Одинаковое изменение всех методов группы сохранит общий `bucket`.

SDK проверяет переопределения квот при создании экземпляра даже без ограничителя. Для ожидания перед запросами нужен `unaryLimiter`.

<a id="необязательная-реализация-пакета"></a>

## Необязательная реализация модуля

Если нужен небольшой готовый вариант, модуль экспортирует `createInMemoryUnaryLimiter()`:

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

Ограничитель равномерно распределяет разрешения на запросы во времени и использует монотонные часы. Ожидающие запросы обслуживаются в порядке FIFO. При отмене запрос удаляется из очереди за O(1), без поиска и сдвига остальных элементов.

Один объект может делить состояние между экземплярами SDK внутри процесса. Разные параметры одного `bucket` отклоняются как конфликт конфигурации.

Ограничитель не координирует разные процессы или машины, не обновляет квоты из тарифа и не учитывает лимиты потоковых соединений. Приложение может выбрать другой ограничитель или работать без него.

### Статическая доля квоты

Если число независимых ограничителей, использующих одну квоту, заранее известно, каждому можно выделить фиксированную долю:

```ts
const unaryLimiter = createInMemoryUnaryLimiter({
  quotaShare: 0.5
});
```

`quotaShare` принимает конечное число в диапазоне `[0.2, 1]`; значение по умолчанию — `1`. Нижняя граница оставляет не меньше одного разрешения на запрос в исходном окне для минимальной квоты модуля `5` запросов в минуту.

При доле меньше единицы ограничитель вычисляет `maxRequests * quotaShare` отдельно для каждой переданной квоты. Результат от единицы и выше округляется вниз: например, при доле `0.5` квота `600` запросов за `60_000` мс превращается в `300`, а `15` запросов за `1_000` мс — в `7`.

Если результат расчёта для пользовательской квоты меньше единицы, ограничитель сохраняет его как дробную скорость и увеличивает интервал между разрешениями на запросы: `1 * 0.2` означает разрешение на один запрос каждые `300_000` мс. Поэтому низкая пользовательская квота не приводит к ошибке во время RPC.

Эта настройка не меняет `TInvestUnaryLimitContext`: собственный ограничитель по-прежнему получает исходные `maxRequests` и `windowMs` T-Invest.

Настройка не обнаруживает другие процессы и не синхронизирует их. При двух независимо настроенных процессах значение `0.5` делит известные квоты поровну. Если останется один процесс, он использует только половину квоты; третий процесс нарушит сделанное предположение. Несколько экземпляров SDK с одним общим объектом ограничителя уже делят его счётчики, поэтому уменьшать долю для них дополнительно не требуется.

## Проверочный список собственной реализации

- `acquire()` разрешается только после фактической выдачи permit.
- Все callers с одинаковыми `bucket` используют одно состояние в выбранном scope.
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
