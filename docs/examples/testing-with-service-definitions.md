# Mock-сервисы через public exports

> Type: Guide. Здесь показано, как проверить приложение с тестовым gRPC-сервером, используя публичные описания сервисов и типы их реализаций из SDK.

## Зависимость server adapter

SDK экспортирует контракты сервисов, а тестовый сервер создаёт приложение. Добавьте `nice-grpc` как прямую зависимость разработки тестируемого проекта; наличие модуля среди косвенных зависимостей недостаточно:

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

Импортируйте только из корня модуля:

- `SignalServiceDefinition` — описание сервиса для `server.add()`;
- `SignalServiceImplementation` — типовой контракт mock-реализации;
- типы запросов, ответов, перечисления и их JSON-конвертеры — из корня того же модуля.

Сгенерированные `*ServiceClient` не входят в публичные экспорты: фасад SDK создаёт клиент сам. Поле `exports` модуля блокирует нестабильные импорты внутренних файлов из `dist/generated/**`.

Для других сервисов используйте соответствующие `*ServiceDefinition` и `*ServiceImplementation`. Полный список смотрите в публичных экспортах модуля.
