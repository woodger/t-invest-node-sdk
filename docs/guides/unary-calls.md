# Unary-вызовы

> Type: Guide. Руководство показывает несколько связанных unary-запросов через
> публичный SDK facade, per-call deadline и чтение response metadata.

## Полный сценарий

Пример получает доступный счет, портфель, последние минутные свечи и активные
сигналы первой доступной стратегии. Каждый RPC получает собственный deadline.

```ts
import {
  CandleInterval,
  PortfolioRequest_CurrencyRequest,
  SignalState,
  TInvestNodeSDK,
  type TInvestCallOptions,
  type TInvestMetadata
} from 't-invest-node-sdk';

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
    const candles = await sdk.marketdata.getCandles(
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

## Per-call options

`TInvestCallOptions` действует на один RPC:

- `signal` отменяет ожидание локальной unary-квоты и последующий transport call;
- `onHeader` получает initial response metadata;
- `onTrailer` получает trailing response metadata.

`AbortSignal.timeout()` создает независимый deadline для каждого вызова в
примере. Если один signal нужно разделить между несколькими RPC, его отмена
остановит все вызовы, которым он был передан.

Authorization и instance `x-app-name` принадлежат SDK. Consumer metadata
объединяется с instance metadata, но не должна использоваться для подмены этих
заголовков.

## Deprecated provider-поля

Публичные generated declarations повторяют upstream T-Invest contract вместе с
его пометками `@deprecated`. Такая пометка означает, что поле нельзя переносить
в стабильную доменную или HTTP-модель автоматически: сначала нужно определить
его бизнес-смысл и контракт замены.

В частности, `klong` и `kshort` описывают коэффициенты ставки риска по клиенту,
а `dlong` и `dshort` — ставки риска начальной маржи. SDK не подставляет
`dlong`/`dshort` вместо `klong`/`kshort` и не объявляет их прямой заменой.

CLI reports ветки `0.4.x` сохраняют `klong` и `kshort` без изменения значений
для совместимости существующего output. Handwritten report-контракты помечают
эти поля как deprecated; их удаление потребует отдельного breaking change.

CLI alias `--figi` сохранён для совместимости, но его значение преобразуется в
актуальное protobuf-поле `instrumentId`. Во встроенном CLI deprecated FIGI-поля
request- и subscription-контрактов остаются на protobuf-defaults и не
сериализуются. При прямом вызове service facade содержимое generated request
по-прежнему задаёт сам Consumer.

Consumer-у рекомендуется:

- не переносить deprecated provider-поля за пределы transport adapter, если у
  приложения нет подтвержденного бизнес-сценария;
- пометить уже опубликованные `klong`/`kshort` как deprecated и сохранить их на
  переходный период, если от них зависят внешние клиенты;
- вводить `dlong`/`dshort` как отдельные поля с собственной семантикой, а не как
  переименование или fallback для `klong`/`kshort`;
- изолировать временное чтение legacy-полей и объяснять точечное подавление
  `typescript/no-deprecated` на границе T-Invest adapter.

## Throttling

Локальный throttling unary-вызовов включен по умолчанию. Он защищает от
очевидного превышения package limits, но не заменяет provider quota, тариф
пользователя или IP-level limits. Подробная модель описана в
[лимитной политике](../limits-policy.md).

Ошибку `RESOURCE_EXHAUSTED` нельзя автоматически повторять только на основании
кода. Перед retry нужно учитывать idempotency RPC, metadata provider-а и
backoff. Пример narrowing приведен в руководстве
[Ошибки и lifecycle](./errors-and-lifecycle.md).
