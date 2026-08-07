# Mock-сервисы через public exports

> Type: Guide. Руководство показывает Consumer-тест с generated service
> definition и implementation type, экспортированными из корня SDK.

## Зависимость server adapter

SDK экспортирует service contracts, но Consumer сам владеет mock server
runtime. Добавьте `nice-grpc` как прямую dev-зависимость тестируемого проекта,
не полагаясь на transitive hoisting:

```sh
npm install --save-dev nice-grpc@^2.1.15
```

## Полный пример с `SignalService`

```ts
import assert from 'node:assert/strict';
import { createServer } from 'nice-grpc';
import {
  SignalServiceDefinition,
  StrategyType,
  TInvestNodeSDK,
  type SignalServiceImplementation
} from 't-invest-node-sdk';

const signalService: SignalServiceImplementation = {
  async getStrategies(request) {
    const strategies = [
      {
        strategyId: 'demo-strategy',
        strategyName: 'Demo strategy',
        strategyType: StrategyType.STRATEGY_TYPE_TECHNICAL
      }
    ];

    return {
      strategies: request.strategyId === undefined
        ? strategies
        : strategies.filter(
            (strategy) => strategy.strategyId === request.strategyId
          )
    };
  },

  async getSignals(request) {
    return {
      signals: [],
      paging: {
        limit: request.paging?.limit ?? 0,
        pageNumber: request.paging?.pageNumber ?? 0,
        totalCount: 0
      }
    };
  }
};

async function main(): Promise<void> {
  const server = createServer();
  server.add(SignalServiceDefinition, signalService);

  const port = await server.listen('127.0.0.1:0');
  let sdk: TInvestNodeSDK | undefined;

  try {
    sdk = new TInvestNodeSDK({
      token: 'test-token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false,
      trackLimits: false
    });

    const response = await sdk.signals.getStrategies({
      strategyId: 'demo-strategy'
    });

    assert.equal(response.strategies.length, 1);
    assert.equal(
      response.strategies[0]?.strategyId,
      'demo-strategy'
    );
  }
  finally {
    sdk?.close();
    await server.shutdown();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Граница контракта

Используйте только root imports:

- `SignalServiceDefinition` — runtime definition для `server.add()`;
- `SignalServiceImplementation` — compile-time contract mock implementation;
- request, response и enum contracts — из того же package entrypoint.

Generated `*ServiceClient` намеренно не входят в public exports: настоящий
client создается SDK facade. Deep imports из `dist/generated/**` нестабильны и
блокируются package `exports`.

Для других сервисов применяется тот же подход с соответствующими
`*ServiceDefinition` и `*ServiceImplementation`. Полный список не дублируется
здесь: актуальную export surface определяет корневой entrypoint пакета.
