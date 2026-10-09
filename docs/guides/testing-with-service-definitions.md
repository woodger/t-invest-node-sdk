# Mock-сервисы через public exports

> Type: Guide. Здесь показан Consumer-тест с generated service definition и implementation type из корня SDK.

## Зависимость server adapter

SDK экспортирует service contracts, а mock server runtime остаётся у Consumer-а. Добавьте `nice-grpc` как прямую dev-зависимость тестируемого проекта и не полагайтесь на transitive hoisting:

```sh
npm install --save-dev nice-grpc@^2.1.17
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
} from '@woodger/t-invest-node-sdk';

const signalService: SignalServiceImplementation = {
  async getStrategies() {
    return {
      strategies: [
        {
          strategyId: 'demo-strategy',
          strategyName: 'Demo strategy',
          strategyType: StrategyType.STRATEGY_TYPE_TECHNICAL
        }
      ]
    };
  },

  async getSignals() {
    return { signals: [] };
  }
};

const server = createServer();
server.add(SignalServiceDefinition, signalService);

const port = await server.listen('127.0.0.1:0');
const sdk = new TInvestNodeSDK({
  token: 'test-token',
  endpoint: `127.0.0.1:${port}`,
  useSsl: false
});

try {
  const response = await sdk.signals.getStrategies({
    strategyId: 'demo-strategy'
  });

  assert.equal(response.strategies.length, 1);
  assert.equal(response.strategies[0]?.strategyId, 'demo-strategy');
}
finally {
  sdk.close();
  await server.shutdown();
}
```

## Граница контракта

Используйте только root imports:

- `SignalServiceDefinition` — runtime definition для `server.add()`;
- `SignalServiceImplementation` — типовой контракт mock-реализации;
- request, response, enum contracts и их JSON-конвертеры — из того же package entrypoint.

Generated `*ServiceClient` намеренно не входят в public exports: SDK facade создаёт настоящий client сам. Package `exports` блокирует нестабильные deep imports из `dist/generated/**`.

Для других сервисов используйте соответствующие `*ServiceDefinition` и `*ServiceImplementation`. Полный список смотрите в корневом entrypoint пакета.
