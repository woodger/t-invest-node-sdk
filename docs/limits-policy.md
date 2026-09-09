# Лимитная политика T-Invest API

Здесь собраны лимиты из актуальной официальной документации T-Bank Dev Portal: <https://developer.tbank.ru/invest/intro/intro/limits>.

Брокер может изменить эти значения. В таком случае обновите одним изменением этот файл, декларацию `packageConfig.unaryLimits` в `src/config.ts` и связанные тесты.

## Что важно учитывать

- Сервисный лимит provider-а суммирует запросы ко всем методам сервиса.
- Лимитная политика распространяется на все счета пользователя.
- Для запросов с одного IP-адреса действует отдельная суммарная политика. Официальная рекомендация — не превышать `50` запросов в секунду по всем счетам и токенам.
- Фактические лимиты пользователя доступны через `users.getUserTariff()` и response metadata `x-ratelimit-limit`, `x-ratelimit-remaining` и `x-ratelimit-reset`.

## Лимиты unary-методов

SDK работает через `gRPC`. В таблице приведена его статическая unary quota policy.

| Сервис или метод | gRPC-лимит |
| --- | ---: |
| Сервис инструментов | 200 в минуту |
| `Bonds`, `Shares`, `Options`, `Futures`, `Etfs`, `GetAssets` | 15 в минуту |
| Сервис счетов | 100 в минуту |
| Сервис операций | 200 в минуту |
| Формирование отчетов в сервисе операций | 5 в минуту |
| Сервис котировок | 600 в минуту |
| Сервис сигналов | 100 в минуту |
| Сервис стоп-ордеров | 50 в минуту |
| `GetStopOrders` | 60 в минуту |
| Песочница | 200 в минуту |
| Сервис ордеров | 100 в минуту |
| `GetOrders` | 200 в минуту |
| `PostOrder` | 15 в секунду |
| `CancelOrder` | 300 в минуту |
| `ReplaceOrder` | 300 в минуту |
| `PostOrderAsync` | 600 в минуту |

Строки с несколькими методами описывают общую квоту: вызовы `Bonds`, `Shares`, `Options`, `Futures`, `Etfs` и `GetAssets` суммарно используют bucket `15` запросов в минуту, а два RPC формирования отчетов — общий bucket `5` запросов в минуту. Методы ордеров, перечисленные отдельными строками, используют индивидуальные buckets.

`UnaryLimits` хранит каждое правило как пару `maxRequests` и `windowMs`. Поэтому секундное окно `PostOrder` остаётся `{ maxRequests: 15, windowMs: 1_000 }` и не нормализуется в допускающую другую burst-семантику минутную запись.

`GetBrokerReport` и `GetDividendsForeignIssuer` совмещают в одном RPC запуск формирования и получение готового отчёта. Transport resolver не анализирует request payload, поэтому для всех режимов обоих RPC выбирает общее правило: `5` запросов за `60_000` мс.

## Лимиты stream-соединений

Официальная политика задает следующие пределы активных соединений:

| Stream service | Лимит соединений |
| --- | ---: |
| MarketData | 32 |
| Orders | 16 на каждый тип stream-соединения |
| Operations | 11 на каждый тип stream-соединения |

Дополнительные ограничения:

- В одном MarketData stream можно держать не более `300` одновременных подписок суммарно на свечи, стаканы и обезличенные сделки.
- Подписки `Info` на торговые статусы не входят в лимит `300`.
- Максимальное количество запросов подписки — `100` в минуту.
- `users.getUserTariff()` может вернуть лимит соединений на `1` больше для безопасного переподключения; использовать этот дополнительный слот как рабочий не рекомендуется.
- Счетчик stream-соединений обновляется каждые `2` минуты.
- Для `OrderBook` и `Candles` сервер отправляет не более одного сообщения по подписке за `100` мс. Для `Trades`, `LastPrice` и `Info` такого интервала нет.

## Как это связано с SDK

SDK предоставляет необязательный `TInvestUnaryLimiter` port. Если Consumer передал `TInvestOptions.unaryLimiter`, SDK перед каждым unary transport call:

- использует service fallback или более специфичное правило по полному gRPC method path;
- разрешает общий quota bucket;
- передаёт limiter-у `path`, `bucket`, `maxRequests`, `windowMs` и объединённый `AbortSignal`;
- продолжает вызов только после успешного завершения `acquire()`.

Без `unaryLimiter` скрытого ожидания и локальных counters нет. Streams через этот port не проходят. Встроенный CLI также не добавляет limiter. SDK создаёт отдельный snapshot таблицы квот для каждого instance, объединяет per-instance `unaryLimits` с `defaultConfig.unaryLimits`, но не обновляет его автоматически из `users.getUserTariff()` или response metadata.

После выдачи permit и передачи unary-вызова transport-у limiter не возвращает слот даже при последующей отмене: provider уже мог учесть запрос в своей квоте.

Для каждого вызова gRPC resolver выбирает самое специфичное совпавшее правило. Method override заменяет service fallback и не становится вторым одновременным ограничением. Поэтому один resolved context не описывает все service aggregate и IP policies provider-а. Package policy дополнительно связывает некоторые method rules общей quota group. Если per-instance override меняет квоту одного метода, этот метод отделяется от package default group; согласованный override всех методов группы сохраняет общий bucket.

[Отдельное руководство](./guides/custom-unary-limiter.md) подробно описывает собственную реализацию, cancellation и ownership. Пакет также экспортирует необязательную process-local фабрику `createInMemoryUnaryLimiter()`. Она равномерно распределяет permits, использует монотонное время и отменяемую очередь, но не координирует разные процессы и не моделирует все ограничения provider-а.

## Декларативный package config

Package defaults хранятся в `src/config.ts` как одна типизированная декларация. [Архитектура SDK](./architecture.md#конфигурация-терминология-и-ownership) описывает термины source/runtime config и ownership этого pipeline. Поле `default` задаёт service fallback, `methods` — правила отдельных RPC, а один элемент `groups` — общую квоту:

```ts
OperationsService: {
  default: {
    maxRequests: 200,
    windowMs: 60_000
  },
  groups: {
    reports: {
      limit: {
        maxRequests: 5,
        windowMs: 60_000
      },
      methods: [
        'GetBrokerReport',
        'GetDividendsForeignIssuer'
      ]
    }
  }
}
```

`PackageConfigDefinition` из `src/config.types.ts` проверяет при компиляции значения квот, имена сервисов и RPC. Bootstrap compiler один раз преобразует декларацию в плоские runtime limits и quota buckets, отклоняя неположительные или неконечные `maxRequests` и `windowMs`. Публичный `defaultConfig.unaryLimits` остаётся плоским. После merge public defaults с per-instance overrides bootstrap повторно проверяет итоговый snapshot до создания transport resolver, включая соответствие service names и полных method paths поддерживаемым generated unary definitions.

Пример точечного ограничения для отдельного экземпляра:

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

`defineUnaryLimits()` преобразует вложенную декларацию в плоский runtime `UnaryLimits`. Остальные service и method limits в этом примере наследуются из `defaultConfig.unaryLimits`.

Consumer-owned limiter должен учитывать выбранную границу координации, фактический тариф пользователя и rate-limit metadata provider-а. Статическая package policy сама по себе не задаёт retry или deployment policy приложения.
