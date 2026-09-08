# Политика комментариев в тестах

> Type: Policy. Этот документ дополняет [testing-policy.md](./testing-policy.md) и задает правила комментариев в тестах.

## Назначение

Комментарии в тестах должны объяснять проверяемый scenario, production-инвариант или причину существования тестового блока.

Комментарий в тесте не должен пересказывать arrange/act/assert-механику, дублировать имя теста или объяснять очевидный синтаксис test framework.

Основной вопрос, на который должен отвечать комментарий в тесте:

> Какой риск, contract или regression case защищает этот тест?

А не:

> Какие строки выполняются внутри теста?

## Общее правило

Сначала нужно сделать ясное имя `describe()` и `test()`.

Комментарий добавляется только если имени теста недостаточно для понимания:

- production-риска;
- regression case;
- неочевидной подготовки данных;
- странного expected value;
- ограничения внешнего API;
- границы ответственности теста;
- причины, по которой соседнее поведение намеренно не проверяется.

Если комментарий можно заменить хорошим именем теста, нужно улучшить имя теста, а не добавлять комментарий.

## Когда комментарий в тесте нужен

Комментарий нужен, если он объясняет:

- production-инвариант;
- regression case;
- исторически хрупкое место;
- неочевидную подготовку данных;
- причину странного expected value;
- ограничение внешнего API;
- отличие mock/stub от реального поведения;
- почему проверяется именно такое поведение;
- почему тест намеренно не проверяет соседнюю ответственность;
- какой contract фиксирует snapshot или golden output.

## Когда комментарий в тесте не нужен

Комментарий не нужен, если:

- он повторяет имя `describe()` или `test()`;
- он описывает arrange/act/assert буквально;
- он объясняет синтаксис test framework;
- он описывает очевидное действие;
- expected value очевиден из входных данных;
- поведение уже ясно из имени теста и assertion.

Плохо:

```ts
test('returns undefined for an unknown path', () => {
  // Arrange
  const resolver = new UnaryLimitResolver({
    KnownService: {
      maxRequests: 100,
      windowMs: 60_000
    }
  });

  // Act
  const quota = resolver.resolve('/tinkoff.public.invest.api.contract.v1.UnknownService/Get');

  // Assert
  assert.equal(quota, undefined);
});
```

Лучше:

```ts
test('returns undefined for an unknown path', () => {
  const resolver = new UnaryLimitResolver({
    KnownService: {
      maxRequests: 100,
      windowMs: 60_000
    }
  });

  assert.equal(
    resolver.resolve('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'),
    undefined
  );
});
```

## Блок тестового сценария

Если группа тестов защищает важный production contract, перед ней допустим отдельный сценарный блок.

Шаблон:

```ts
/**
 * Сценарий: <что проверяется>.
 *
 * Защищает:
 * - <production-инвариант 1>;
 * - <production-инвариант 2>;
 *
 * Не проверяет:
 * - <соседняя ответственность, которая должна тестироваться отдельно>.
 */
```

Хорошо:

```ts
/**
 * Сценарий: CLI reporter формирует стабильный output contract.
 *
 * Защищает:
 * - отсутствие generated DTO в stdout-формате;
 * - одинаковую структуру table и JSON вывода;
 * - предсказуемые empty values для optional API fields.
 *
 * Не проверяет:
 * - gRPC transport behavior;
 * - механическое выравнивание table renderer-а.
 */
describe('accounts reporter', () => {
  // ...
});
```

Плохо:

```ts
/**
 * Тесты accounts reporter.
 */
describe('accounts reporter', () => {
  // ...
});
```

Такой комментарий не добавляет смысла: subject уже виден из имени `describe()`.

## Комментарий внутри теста

Локальный комментарий внутри теста допустим только если без него теряется причина конкретной подготовки, expectation или необычной проверки.

Хорошо:

```ts
test('throws for mixed broker report modes', () => {
  // Generate and get modes map to different API request contracts.
  // The command must reject ambiguous input before calling SDK.
  const options = {
    accountId: 'account-id',
    from: '2024-01-01T00:00:00Z',
    to: '2024-01-02T00:00:00Z',
    taskId: 'task-id'
  };

  assert.throws(() => createBrokerReportRequest(options));
});
```

Плохо:

```ts
test('throws for mixed broker report modes', () => {
  // Prepare options
  const options = {
    accountId: 'account-id',
    from: '2024-01-01T00:00:00Z',
    to: '2024-01-02T00:00:00Z',
    taskId: 'task-id'
  };

  // Check error
  assert.throws(() => createBrokerReportRequest(options));
});
```

## Regression-комментарии

Regression-комментарий нужен, если без него непонятно, почему тест фиксирует именно такой scenario.

Хорошо:

```ts
test('renders pretty JSON with the trailing newline used by CLI output', () => {
  // Regression: CLI output is line-oriented.
  // Missing trailing newline glues the shell prompt to JSON output.
  const output = renderJson({
    id: 'account-id'
  });

  assert.strictEqual(output, '{\n  "id": "account-id"\n}\n');
});
```

Плохо:

```ts
test('renders pretty JSON with the trailing newline used by CLI output', () => {
  // Bugfix test
  const output = renderJson({
    id: 'account-id'
  });

  assert.strictEqual(output, '{\n  "id": "account-id"\n}\n');
});
```

Regression-комментарий должен объяснять production-риск, а не ссылаться на факт существования старого bugfix.

## Комментарии к expected value

Комментарий к expected value нужен, если значение выглядит как magic number, но на самом деле является частью contract.

Хорошо:

```ts
test('waits according to the configured limit between requests', async () => {
  const limiter = createInMemoryUnaryLimiter();
  const context = {
    path: '/test.OrdersService/GetOrders',
    quota: {
      bucket: 'rule:OrdersService',
      maxRequests: 100,
      windowMs: 60_000
    },
    signal: new AbortController().signal
  };

  await limiter.acquire(context);
  await limiter.acquire(context);

  // 600 ms = 60_000 ms / 100 requests per minute.
  assert.deepEqual(delays, [600]);
});
```

Плохо:

```ts
test('waits according to the configured limit between requests', async () => {
  const limiter = createInMemoryUnaryLimiter();
  const context = {
    path: '/test.OrdersService/GetOrders',
    quota: {
      bucket: 'rule:OrdersService',
      maxRequests: 100,
      windowMs: 60_000
    },
    signal: new AbortController().signal
  };

  await limiter.acquire(context);
  await limiter.acquire(context);

  // Check delay
  assert.deepEqual(delays, [600]);
});
```

Если expected value очевиден из входных данных, комментарий не нужен.

## Комментарии к test fixtures

Fixture-комментарий нужен, если тестовые данные выглядят странно, но выбраны намеренно.

Хорошо:

```ts
// Пустой объект запроса намеренный: users.getAccounts принимает empty request,
// а тест проверяет metadata/middleware behavior, а не request payload.
const request = {};
```

Плохо:

```ts
// Test request
const request = {};
```

Комментарий должен объяснять причину fixture, а не его тип.

## Комментарии к mock/stub/fake

Mock, stub или fake нужно комментировать только если его поведение намеренно отличается от реального поведения и это важно для границ теста.

Хорошо:

```ts
// Stub не эмулирует real gRPC channel намеренно:
// этот тест проверяет unary limiter middleware, а не behavior nice-grpc.
const call = createUnaryCall(path);
```

Плохо:

```ts
// Create mock
const call = createUnaryCall(path);
```

Если fake полностью очевиден из имени функции и setup, комментарий не нужен.

## Блоки Given / When / Then

Комментарии `Given`, `When`, `Then` допустимы только в длинных тестах, где они реально улучшают читаемость.

Они не являются обязательным стилем и не должны появляться в коротких тестах.

Не нужно:

```ts
test('returns undefined for an unknown path', () => {
  // Given
  const resolver = new UnaryLimitResolver({
    KnownService: {
      maxRequests: 100,
      windowMs: 60_000
    }
  });

  // When
  const quota = resolver.resolve('/tinkoff.public.invest.api.contract.v1.UnknownService/Get');

  // Then
  assert.equal(quota, undefined);
});
```

Для коротких тестов структура должна быть очевидна из самого кода.

## Комментарии к intentional omissions

Если тест намеренно не проверяет соседнюю ответственность, это можно указать комментарием на уровне scenario или рядом с setup.

Хорошо:

```ts
/**
 * Сценарий: SDK middleware вызывает limiter только для unary calls.
 *
 * Защищает:
 * - unary limiter contract;
 * - отсутствие вызова limiter-а для response streams.
 *
 * Не проверяет:
 * - сетевое поведение gRPC channel;
 * - корректность сгенерированных service definition.
 */
describe('createSdkMiddleware', () => {
  // ...
});
```

Плохо:

```ts
/**
 * Проверяем middleware.
 */
describe('createSdkMiddleware', () => {
  // ...
});
```

Intentional omission полезен там, где граница теста может быть неправильно расширена будущими изменениями.

## Комментарии и имена тестов

Комментарий не должен компенсировать плохое имя теста.

Плохо:

```ts
test('works correctly', async () => {
  // Проверяем, что response streams не проходят через unary limiter.
});
```

Хорошо:

```ts
test('does not invoke the unary limiter for response streams', async () => {
  const responses = [];

  for await (const response of iterator) {
    responses.push(response);
  }

  assert.deepEqual(responses, [{ seq: 1 }, { seq: 2 }]);
});
```

## Язык комментариев

Комментарии в тестах должны быть написаны тем же языком, что и остальные production-комментарии проекта.

Допустимо использовать технические английские термины, если они являются частью устойчивого vocabulary проекта:

- regression;
- fixture;
- mock;
- stub;
- fake;
- snapshot;
- golden output;
- runtime;
- contract;
- mapping;
- fallback.

Не нужно переводить такие термины искусственно, если перевод делает комментарий менее точным.

## Запрещенные комментарии

Запрещены комментарии, которые:

- пересказывают следующую строку кода;
- объясняют очевидный syntax;
- дублируют имя теста;
- описывают временную историю изменения без production-смысла;
- содержат TODO без привязки к issue, decision или owner decision;
- оправдывают хрупкий тест вместо исправления структуры теста;
- маскируют слишком большой test case.

Плохо:

```ts
// Call function
const result = parseArgs(argv);

// Check result
assert.deepEqual(result, expected);
```

Плохо:

```ts
// TODO: improve test later
```

Если тест требует такого комментария, сначала нужно упростить test setup или разделить test case.

## Хорошие практики

- сначала улучшать имя теста, потом решать, нужен ли комментарий;
- комментировать риск, а не действие;
- комментировать contract, а не implementation step;
- держать комментарий рядом с причиной, которую он объясняет;
- удалять комментарий, если после рефакторинга теста он стал очевидным;
- не использовать `Given / When / Then` как обязательный шаблон;
- не комментировать каждый assertion;
- не превращать тест в документацию по framework.

## Общий критерий

Хороший комментарий в тесте отвечает хотя бы на один вопрос:

- какой production-риск защищен;
- какой regression case зафиксирован;
- почему данные выглядят именно так;
- почему expected value неочевиден;
- какая ответственность намеренно не тестируется здесь.
