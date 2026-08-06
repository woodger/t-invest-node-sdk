# Лимитная политика T-Invest API

Документ фиксирует лимиты из активной официальной документации T-Bank Dev
Portal: <https://developer.tbank.ru/invest/intro/intro/limits>.

Актуальность значений зависит от политики брокера. При изменении официальной
документации нужно обновить этот файл, декларацию `packageConfig.unaryLimits`
в `src/config.ts` и связанные тесты одним изменением.

## Что важно учитывать

- Сервисный лимит provider-а суммирует запросы ко всем методам сервиса.
- Лимитная политика распространяется на все счета пользователя.
- Для запросов с одного IP-адреса действует отдельная суммарная политика.
  Официальная рекомендация — не превышать `50` запросов в секунду по всем
  счетам и токенам.
- Фактические лимиты пользователя доступны через `users.getUserTariff()` и
  response metadata `x-ratelimit-limit`, `x-ratelimit-remaining` и
  `x-ratelimit-reset`.

## Лимиты unary-методов

SDK работает через `gRPC`, поэтому ниже приведены значения, используемые его
локальной throttling policy.

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
| `PostOrder` | 15 в секунду, или 900 в минуту |
| `CancelOrder` | 300 в минуту |
| `ReplaceOrder` | 300 в минуту |
| `PostOrderAsync` | 600 в минуту |

Строки с несколькими методами описывают общую квоту: вызовы `Bonds`, `Shares`,
`Options`, `Futures`, `Etfs` и `GetAssets` суммарно используют bucket
`15` запросов в минуту, а два RPC формирования отчетов — общий bucket
`5` запросов в минуту. Методы ордеров, перечисленные отдельными строками,
используют индивидуальные buckets.

`UnaryLimits` хранит значения в запросах за минуту. Поэтому лимит
`PostOrder` записан в `defaultConfig` как `900`; равномерный throttling не
превышает официальные `15` запросов в секунду.

`GetBrokerReport` и `GetDividendsForeignIssuer` объединяют запуск формирования
и получение готового отчета в одном RPC. Transport resolver не анализирует
request payload и для всех режимов обоих RPC выбирает одно общее правило с
лимитом `5`; application scheduler применяет его общий временной график.

## Лимиты stream-соединений

Официальная политика задает следующие пределы активных соединений:

| Stream service | Лимит соединений |
| --- | ---: |
| MarketData | 32 |
| Orders | 16 на каждый тип stream-соединения |
| Operations | 11 на каждый тип stream-соединения |

Дополнительные ограничения:

- В одном MarketData stream можно держать не более `300` одновременных
  подписок суммарно на свечи, стаканы и обезличенные сделки.
- Подписки `Info` на торговые статусы не входят в лимит `300`.
- Максимальное количество запросов подписки — `100` в минуту.
- `users.getUserTariff()` может вернуть лимит соединений на `1` больше для
  безопасного переподключения; использовать этот дополнительный слот как
  рабочий не рекомендуется.
- Счетчик stream-соединений обновляется каждые `2` минуты.
- Для `OrderBook` и `Candles` сервер отправляет не более одного сообщения по
  подписке за `100` мс. Для `Trades`, `LastPrice` и `Info` такого интервала нет.

## Как это связано с SDK

SDK поддерживает локальный throttling unary-запросов через `trackLimits`,
который включен по умолчанию.

Что делает SDK:

- равномерно распределяет unary-вызовы по времени;
- отсчитывает полный интервал от фактической выдачи локального слота, поэтому
  задержка timer callback не приводит к последующему burst queued calls;
- использует сервисные fallback и более специфичные лимиты по полным gRPC
  method paths;
- ведет независимый график для каждого quota bucket: методы, разрешившиеся в
  service fallback, делят его график, методы из явно заданной общей группы
  делят график группы, а индивидуальные method rules и другие сервисы не
  задерживают друг друга;
- создает отдельный snapshot таблицы лимитов для каждого SDK-инстанса;
- объединяет per-instance `unaryLimits` с `defaultConfig.unaryLimits`;
- при явном `hostLocalQuotaSharing: true` делит resolved limits на число
  активных SDK instances в том же host-local scope;
- отменяет ожидание локальной квоты через `TInvestCallOptions.signal` и
  удаляет неотправленную операцию из bucket queue, чтобы следующий вызов занял
  освободившийся слот;
- не ограничивает stream-соединения и stream subscriptions;
- не обновляет локальную таблицу автоматически из `users.getUserTariff()` или
  response metadata.

После передачи unary-вызова transport-у его слот не возвращается даже при
последующей отмене: provider уже мог учесть запрос в своей квоте.

## Host-local cooperative sharing

`hostLocalQuotaSharing` — opt-in дополнение к существующему локальному
scheduler-у. Оно не заменяет bucket queues общей межпроцессной очередью.
Каждый SDK instance сохраняет собственные counters и timers, но перед расчетом
следующего интервала получает число активных участников и использует долю:

```text
effectiveLimit = resolvedLimit / activeInstances
```

При двух активных instances с одним resolved limit `600` каждый планирует до
`300` запросов в минуту; при трех — до `200`. Деление применяется ко всем
resolved buckets instance. Участник считается активным с момента создания SDK
до `sdk.close()` или истечения lease, а не только пока в его очереди есть
запросы. Поэтому механизм намеренно не является work-conserving: неиспользуемая
доля простаивающего instance не передается остальным.

Scope определяется автоматически по нормализованному `endpoint` и OAuth token.
В temporary filesystem записывается только SHA-256 fingerprint scope и пустой
lease-файл со случайным именем; исходные `endpoint` и token не сохраняются.
Один lease соответствует одному SDK instance, включая несколько instances в
одном Node.js process.

Package policy использует:

- heartbeat lease каждые `5` секунд;
- expiry через `15` секунд без heartbeat;
- cache наблюдаемого participant count на `1` секунду.

Heartbeat timer вызван с `unref()` и сам по себе не удерживает process. При
штатном `sdk.close()` lease удаляется сразу. После аварийного завершения stale
lease временно уменьшает доступную долю и затем истекает. Ошибка создания или
обновления opt-in lease завершает создание SDK или соответствующий SDK-вызов
как `SdkErrorCode.Internal` с `source: 'sdk'`; небезопасного fallback к полной
локальной квоте нет.

Между обнаружением изменения состава участников и перестройкой уже
запланированного timer допускается кратковременная погрешность. Механизм не
обеспечивает централизованную FIFO, строгую fairness или синхронизацию фаз
локальных scheduler-ов.

Граница координации — общий system temporary directory namespace одного OS
user. Containers с изолированным `/tmp`, разные hosts, endpoints и tokens
образуют независимые scope. Несколько tokens одного provider user и общий
IP-limit этим механизмом не объединяются. Одновременно работающие instances
одного scope должны иметь согласованные `unaryLimits`: leases обмениваются
только присутствием и не передают конфигурацию квот.

При `trackLimits: false` локальный throttling выключен, поэтому instance не
создает lease даже при `hostLocalQuotaSharing: true`. Защитное деление общей
квоты работает только когда каждый одновременно использующий тот же token и
endpoint SDK instance включает cooperative sharing; non-participating process
остается невидимым для leases.

Для одного вызова gRPC resolver выбирает только самое специфичное
совпавшее правило, а application scheduler планирует вызов по готовому bucket
и limit. Method override заменяет service fallback и не учитывается в
его графике одновременно, поэтому service aggregate provider-а для таких
вызовов локально не воспроизводится. Package policy дополнительно связывает
некоторые method rules с общей quota group. Per-instance override, который
меняет лимит отдельного метода, отсоединяет его от package default group;
согласованный override всех методов группы сохраняет общий bucket. Это
защитный локальный limiter, а не полная модель всех агрегированных ограничений
provider-а или IP.

## Декларативный package config

Package defaults хранятся в `src/config.ts` как одна типизированная декларация.
Термины source/runtime config и ownership этого pipeline зафиксированы в
[архитектуре SDK](./architecture.md#конфигурация-терминология-и-ownership).
Сервисный fallback задается через `default`, индивидуальные RPC — через
`methods`, а общая квота — одним элементом `groups`:

```ts
OperationsService: {
  default: 200,
  groups: {
    reports: {
      limit: 5,
      methods: [
        'GetBrokerReport',
        'GetDividendsForeignIssuer'
      ]
    }
  }
}
```

`PackageConfigDefinition` из `src/config.types.ts` проверяет при компиляции
числовые значения, имена сервисов и RPC. Bootstrap compiler один раз
преобразует декларацию в плоские runtime limits и quota buckets и отклоняет
неположительные или неконечные числовые значения. Публичный
`defaultConfig.unaryLimits` остается плоским для совместимости. После merge с
public defaults и per-instance overrides bootstrap повторно проверяет весь
итоговый snapshot до создания transport resolver и scheduler.

Пример точечного ограничения для отдельного экземпляра:

```ts
import { defineUnaryLimits, TInvestNodeSDK } from 't-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimits: defineUnaryLimits({
    UsersService: {
      default: 50
    },
    OrdersService: {
      methods: {
        PostOrder: 300
      }
    }
  })
});
```

`defineUnaryLimits()` преобразует вложенную декларацию в плоский runtime
`UnaryLimits`. Остальные service и method limits в этом примере наследуются из
`defaultConfig.unaryLimits`.

Для высоконагруженных и торговых сценариев локальный throttling остается
защитным fallback. Consumer должен учитывать фактический тариф пользователя и
rate-limit metadata provider-а.
