# Unary-вызовы

> Type: Guide. Здесь показаны связанные unary-запросы через публичный SDK facade, отдельный deadline для каждого вызова и чтение response metadata.

## Полный сценарий

Пример получает доступный счет, портфель, последние минутные свечи и активные сигналы первой доступной стратегии. Каждый RPC получает собственный deadline.

```ts
import {
  CandleInterval,
  PortfolioRequest_CurrencyRequest,
  SignalState,
  TInvestNodeSDK,
  type TInvestCallOptions,
  type TInvestMetadata
} from '@woodger/t-invest-node-sdk';

type RequiredEnvironmentVariable =
  | 'T_INVEST_TOKEN'
  | 'T_INVEST_ENDPOINT';

function requireEnvironment(name: RequiredEnvironmentVariable): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

function logRateLimit(
  operation: string,
  phase: 'header' | 'trailer',
  metadata: TInvestMetadata
): void {
  const limit = metadata.get('x-ratelimit-limit');
  const remaining = metadata.get('x-ratelimit-remaining');
  const reset = metadata.get('x-ratelimit-reset');

  if (limit !== undefined || remaining !== undefined || reset !== undefined) {
    console.log({
      operation,
      phase,
      limit,
      remaining,
      reset
    });
  }
}

function callOptions(operation: string): TInvestCallOptions {
  return {
    signal: AbortSignal.timeout(5_000),
    onHeader(metadata) {
      logRateLimit(operation, 'header', metadata);
    },
    onTrailer(metadata) {
      logRateLimit(operation, 'trailer', metadata);
    }
  };
}

async function main(): Promise<void> {
  const sdk = new TInvestNodeSDK({
    token: requireEnvironment('T_INVEST_TOKEN'),
    endpoint: requireEnvironment('T_INVEST_ENDPOINT')
  });

  try {
    const { accounts } = await sdk.users.getAccounts(
      {},
      callOptions('users.getAccounts')
    );
    const account = accounts[0];

    if (!account) {
      console.log('No accounts are available for this token');
      return;
    }

    const portfolio = await sdk.operations.getPortfolio(
      {
        accountId: account.id,
        currency:
          PortfolioRequest_CurrencyRequest
            .RUB
      },
      callOptions('operations.getPortfolio')
    );

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const candles = await sdk.marketData.getCandles(
      {
        instrumentId: 'BBG00QPYJ5H0',
        interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
        from: fiveMinutesAgo,
        to: now
      },
      callOptions('marketdata.getCandles')
    );

    const { strategies } = await sdk.signals.getStrategies(
      {},
      callOptions('signals.getStrategies')
    );
    const strategy = strategies[0];

    const signals = strategy
      ? await sdk.signals.getSignals(
          {
            strategyId: strategy.strategyId,
            active: SignalState.SIGNAL_STATE_ACTIVE,
            from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            to: now,
            paging: {
              limit: 20,
              pageNumber: 0
            }
          },
          callOptions('signals.getSignals')
        )
      : undefined;

    console.log({
      accountId: account.id,
      portfolioPositions: portfolio.positions.length,
      candles: candles.candles.length,
      strategies: strategies.length,
      activeSignals: signals?.signals.length ?? 0
    });
  }
  finally {
    sdk.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Опции отдельного вызова

`TInvestCallOptions` действует на один RPC:

- `signal` отменяет ожидание локальной unary-квоты и последующий transport call;
- `onHeader` получает initial response metadata;
- `onTrailer` получает trailing response metadata.

Metadata callbacks работают синхронно. Если `onHeader` или `onTrailer` бросает исключение, SDK отклоняет той же ошибкой текущий RPC и отменяет незавершённый transport call. Не передавайте сюда `async` functions: обрабатывайте metadata асинхронно после завершения вызова.

`AbortSignal.timeout()` создает независимый deadline для каждого вызова в примере. Если один signal нужно разделить между несколькими RPC, его отмена остановит все вызовы, которым он был передан.

SDK управляет заголовками authorization и instance `x-app-name`. Он добавляет Consumer metadata к instance metadata, но не позволяет подменить эти два заголовка.

## Устаревшие поля провайдера

Публичные generated declarations повторяют исходный контракт T-Invest вместе с пометками `@deprecated`. Не переносите такое поле автоматически в стабильную доменную или HTTP-модель: сначала разберитесь в его бизнес-смысле и контракте замены.

В частности, `klong` и `kshort` описывают коэффициенты ставки риска по клиенту, а `dlong` и `dshort` — ставки риска начальной маржи. SDK не подставляет `dlong`/`dshort` вместо `klong`/`kshort` и не объявляет их прямой заменой.

Отчёты CLI ветки `0.4.x` сохраняли `klong` и `kshort` для совместимости. Начиная с `0.5.0` нормализованный JSON-вывод CLI не содержит эти поля. `dlong` и `dshort` остаются отдельными полями со своей семантикой и не подставляются вместо удалённых значений. Публичные generated DTO по-прежнему дословно отражают upstream-контракт, поэтому прямые service-вызовы продолжают возвращать `klong` и `kshort`, пока они присутствуют в T-Invest API.

Алиас CLI `--figi` сохранён для совместимости, но его значение преобразуется в актуальное protobuf-поле `instrumentId`. Во встроенном CLI устаревшие FIGI-поля контрактов запросов и подписок сохраняют значения по умолчанию protobuf и не сериализуются. При прямом вызове фасада сервисов содержимое сгенерированного запроса по-прежнему задаёт сам Consumer.

Consumer-у стоит:

- не переносить устаревшие поля провайдера за пределы транспортного адаптера, если у приложения нет подтвержденного бизнес-сценария;
- пометить уже опубликованные `klong`/`kshort` как устаревшие и сохранить их на переходный период, если от них зависят внешние клиенты;
- вводить `dlong`/`dshort` как отдельные поля с собственной семантикой, а не как переименование или резервную подстановку для `klong`/`kshort`;
- изолировать временное чтение устаревших полей и объяснять точечное подавление `typescript/no-deprecated` на границе адаптера T-Invest.

## Ограничение частоты запросов

Unary limiter по умолчанию выключен. Consumer может передать собственную реализацию через `TInvestOptions.unaryLimiter`; SDK передаст ей package quota и объединённый `AbortSignal`. Подробный контракт разобран в [руководстве по собственной реализации](./custom-unary-limiter.md), а значения provider-а — в [лимитной политике](../limits-policy.md).

Не повторяйте `RESOURCE_EXHAUSTED` только из-за кода. Перед retry учтите idempotency RPC, metadata provider-а и backoff. Пример narrowing есть в руководстве [Ошибки и lifecycle](./errors-and-lifecycle.md).
