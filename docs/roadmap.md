# Roadmap и рабочие идеи

> Type: Brainstorm. Здесь собраны идеи, а не утверждённый план, публичное обещание или согласованный контракт. До начала реализации любой вариант можно пересмотреть или отклонить.

## Межпроцессная координация unary-квот

### Контекст

Unary limiter не включается фасадом по умолчанию. Consumer может передать собственную реализацию или явно создать process-local limiter. Два независимо созданных process-local limiter-а не видят reservations друг друга и каждый планирует вызовы по полной переданной квоте.

У команд, которые используют разные provider services, service quotas могут не пересекаться. Однако процессы всё равно участвуют в общих ограничениях пользователя и IP. Два процесса, вызывающие один service или quota group, могут вместе превысить provider limit. Актуальную модель и известные границы локального limiter-а описывает [лимитная политика](./limits-policy.md).

Текущие source of truth:

- публичный port и необязательная process-local реализация — [`src/application/services/unary-limiter.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/application/services/unary-limiter.ts);
- wiring Consumer-owned limiter-а — [`src/bootstrap/t-invest-node-sdk.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/bootstrap/t-invest-node-sdk.ts);
- разрешение RPC в quota bucket — [`src/infrastructure/transport/grpc/unary-limit-resolver.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/infrastructure/transport/grpc/unary-limit-resolver.ts).

### Термины, которые нельзя смешивать

`bucket` — заданный SDK идентификатор provider quota. Например, один bucket объединяет вызовы service fallback, а другой — методы явно объявленной quota group. Он не идентифицирует Consumer-а, пользователя или процесс.

Scope координации — отдельное понятие. Он отвечает на вопрос, какие SDK instances должны делить состояние: один T-Invest user и environment, одна точка выхода в сеть или весь конкретный deployment.

Также различаются два механизма:

- job lock запрещает одновременное выполнение несовместимых sync lifecycle;
- rate limiter разрешает параллельную работу, но координирует частоту RPC.

Rate limiter не предотвращает дублирование sync, гонки записи и повторную обработку данных. Если параллельный запуск сам по себе недопустим, нужен job lock или единый владелец очереди независимо от quota coordination.

### Вариант: один долгоживущий sync-worker у Consumer-а

Consumer может заменить независимое выполнение CLI-команд одним процессом, который владеет SDK instance и очередью sync-задач:

```text
CLI / scheduler
  -> sync-worker
       -> candles sync
       -> instruments sync
       -> один SDK lifecycle и один набор quota counters
```

Преимущества:

- не нужны новое хранилище и межпроцессное состояние limiter-а;
- один scheduler естественно координирует все SDK calls;
- в одном месте решаются повторный запуск, порядок задач, cancellation, graceful shutdown и обработка `RESOURCE_EXHAUSTED`;
- не возникает вопроса ownership внешнего limiter backend-а.

Ограничения:

- Consumer должен владеть lifecycle долгоживущего worker-а;
- CLI становится клиентом worker-а или тонким способом поставить задачу;
- протокол постановки задачи и доставки результата становится application contract Consumer-а.

Для текущего сценария это основной кандидат: он снимает не только риск превышения квот, но и проблему одновременного выполнения sync lifecycle.

### Вариант: локальный IPC coordinator

Если независимые CLI-процессы должны сами выполнять SDK calls, на одной машине можно запустить отдельный coordinator с общим in-memory scheduler. Клиенты будут запрашивать permits через Unix domain socket или Windows named pipe.

Предполагаемые свойства:

- coordinator запускается и контролируется явно через process supervisor;
- SDK-процессы не пытаются автоматически выбрать лидера или породить hidden background daemon;
- OAuth token не передается по IPC и не используется как bucket key;
- один IPC endpoint может соответствовать одному явно определенному scope;
- disconnect или `AbortSignal` удаляет еще не выданный request из очереди;
- после выдачи permit слот не возвращается, поскольку provider уже мог учесть вызов;
- при недоступности coordinator-а действует fail-closed, без локального fallback;
- решение честно ограничено одной машиной или общим IPC namespace.

Без persistent state после аварийного перезапуска coordinator не знает о недавних запросах, уже учтённых provider-ом. Для безопасного cold start придётся ждать не меньше полного quota window перед выдачей новых permits. Это осознанная плата за отсутствие базы данных.

### Реализованная граница: injectable limiter contract

SDK предоставляет capability-based port без зависимости от конкретного backend-а:

```ts
interface TInvestUnaryLimitContext {
  readonly path: string;
  readonly quota: {
    readonly bucket: string;
    readonly maxRequests: number;
    readonly windowMs: number;
  };
  readonly signal: AbortSignal;
}

interface TInvestUnaryLimiter {
  acquire(context: TInvestUnaryLimitContext): Promise<void>;
}
```

Текущая семантика:

- SDK сам разрешает gRPC method в `path`, `bucket`, `maxRequests` и `windowMs`;
- Consumer передаёт реализацию limiter-а, но не формирует buckets вручную;
- без injection SDK не создаёт скрытого scheduler-а;
- injected limiter принадлежит Consumer-у и не закрывается через `sdk.close()`;
- backend failure не переключает SDK на локальные counters;
- streams через этот port не проходят.

Полный публичный контракт и примеры описаны в [Consumer guide](./guides/custom-unary-limiter.md).

Один только port не решает межпроцессную координацию. Для неё по-прежнему нужен реальный coordinator и его integration tests. Ниже сохранены рассмотренные варианты такой реализации.

### Вариант: Redis или другое общее хранилище

Один из рассмотренных вариантов — внешний coordinator на базе Redis с атомарной выдачей permit, общими ключами quota buckets, cancellation и TTL. Он может координировать процессы на разных машинах и переживать lifecycle отдельных CLI-процессов.

Для текущего проекта этот вариант исключён: Redis, SQL или другая база данных не должны становиться инфраструктурным требованием SDK или Consumer-а только ради координации квот. Не нужно добавлять Redis dependency, optional dynamic import или неявный сетевой fallback.

Вернуться к этому варианту имеет смысл, только если появятся готовая общая infrastructure platform и реальная multi-host потребность. Даже тогда backend должен остаться реализацией внешнего port-а, а не частью provider mapping или application scheduling rules SDK.

### Рассмотренные упрощения

Следующие варианты не считаются полноценным общим limiter-ом:

- независимые in-memory counters в каждом процессе — не координируют суммарную нагрузку;
- статическое деление лимита между предполагаемым числом процессов — ломается при изменении concurrency и неэффективно использует свободную квоту;
- lockfile с JSON-состоянием — требует решения stale locks, process crashes, PID reuse, атомарной записи, cancellation и portability;
- краткоживущий filesystem lock вокруг одного RPC — сериализует критическую секцию, но не хранит корректный временной график;
- автоматический background daemon, создаваемый первым CLI-процессом, — имеет неоднозначные ownership, shutdown, upgrade и recovery semantics;
- один job mutex — предотвращает одновременные jobs, но не координирует квоты между разрешенными параллельными workloads.

### Инварианты возможной реализации

Если к задаче вернутся, до изменения публичного API нужно зафиксировать:

1. Точную границу: одна машина или несколько hosts.
2. Владельца coordinator process и его startup/shutdown lifecycle.
3. Stable scope без использования raw OAuth token.
4. Стабильную идентичность SDK-generated quota buckets.
5. FIFO, cancellation и правило отсутствия refund после выдачи permit.
6. Fail-closed поведение при потере coordinator-а.
7. Cold-start policy после потери неперсистентного состояния.
8. Отдельную модель service/user quotas и общей IP policy.
9. Поведение при разных `unaryLimits` у одновременно работающих процессов.
10. Integration-тесты с реальными дочерними процессами, включая crash и restart.

### Текущее решение

SDK не реализует межпроцессный limiter. Публичный port позволяет Consumer-у подключить coordinator без изменения таблицы квот SDK, но не задаёт его runtime.

Один долгоживущий sync-worker остаётся отдельным вариантом. Локальный IPC coordinator возможен, если нужно сохранить независимые CLI-процессы и все они работают на одной машине. Redis и другие базы данных исключены из текущего направления.
