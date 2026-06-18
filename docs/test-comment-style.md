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
  const throttle = new Throttle({
    KnownService: 100
  });

  // Act
  const limit = throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.UnknownService/Get');

  // Assert
  assert.equal(limit, undefined);
});
```

Лучше:

```ts
test('returns undefined for an unknown path', () => {
  const throttle = new Throttle({
    KnownService: 100
  });

  assert.equal(
    throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'),
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
 * Сценарий: suite runner синхронизирует compiled tests с source tests.
 *
 * Защищает:
 * - запуск только актуальных compiled tests;
 * - удаление orphaned test artifacts;
 * - явную ошибку при stale build.
 *
 * Не проверяет:
 * - behavior отдельных SDK tests;
 * - TypeScript compiler output.
 */
describe('suite runner helpers', () => {
  // ...
});
```

Плохо:

```ts
/**
 * Тесты suite runner.
 */
describe('suite runner helpers', () => {
  // ...
});
```

Такой комментарий не добавляет смысла: subject уже виден из имени `describe()`.

## Комментарий внутри теста

Локальный комментарий внутри теста допустим только если без него теряется причина конкретной подготовки, expectation или необычной проверки.

Хорошо:

```ts
test('throws when compiled test is older than source test', async () => {
  await touch(staleCompiled);
  await touch(freshSource);

  // Source намеренно новее compiled file:
  // runner должен требовать rebuild, а не запускать stale artifact.
  await utimes(staleCompiled, oldTime, oldTime);
  await utimes(freshSource, freshTime, freshTime);

  assert.throws(() => removeCompiledTestsWithoutSource([staleCompiled], options));
});
```

Плохо:

```ts
test('throws when compiled test is older than source test', async () => {
  // Create files
  await touch(staleCompiled);
  await touch(freshSource);

  // Set times
  await utimes(staleCompiled, oldTime, oldTime);
  await utimes(freshSource, freshTime, freshTime);

  // Check error
  assert.throws(() => removeCompiledTestsWithoutSource([staleCompiled], options));
});
```

## Regression-комментарии

Regression-комментарий нужен, если без него непонятно, почему тест фиксирует именно такой scenario.

Хорошо:

```ts
test('does not rewrite runnable compiled tests', async () => {
  // Regression: cleanup должен удалять только orphaned artifacts.
  // Перезапись runnable compiled tests маскирует stale build и ломает воспроизводимость.
  await writeFile(runnableCompiled, 'compiled test');

  const runnableFiles = removeCompiledTestsWithoutSource([runnableCompiled], options);

  assert.deepStrictEqual(runnableFiles, [runnableCompiled]);
  assert.strictEqual(await readFile(runnableCompiled, 'utf8'), 'compiled test');
});
```

Плохо:

```ts
test('does not rewrite runnable compiled tests', async () => {
  // Bugfix test
  await writeFile(runnableCompiled, 'compiled test');

  const runnableFiles = removeCompiledTestsWithoutSource([runnableCompiled], options);

  assert.deepStrictEqual(runnableFiles, [runnableCompiled]);
});
```

Regression-комментарий должен объяснять production-риск, а не ссылаться на факт существования старого bugfix.

## Комментарии к expected value

Комментарий к expected value нужен, если значение выглядит как magic number, но на самом деле является частью contract.

Хорошо:

```ts
test('waits according to the configured limit between requests', async () => {
  const throttle = new Throttle({
    OrdersService: 100
  });

  await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
  await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');

  // 600 ms = 60_000 ms / 100 requests per minute.
  assert.deepEqual(delays, [600]);
});
```

Плохо:

```ts
test('waits according to the configured limit between requests', async () => {
  await throttle.reduce(path);
  await throttle.reduce(path);

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
// этот тест проверяет middleware throttling, а не behavior nice-grpc.
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
  const throttle = new Throttle({
    KnownService: 100
  });

  // When
  const limit = throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.UnknownService/Get');

  // Then
  assert.equal(limit, undefined);
});
```

Для коротких тестов структура должна быть очевидна из самого кода.

## Комментарии к intentional omissions

Если тест намеренно не проверяет соседнюю ответственность, это можно указать комментарием на уровне scenario или рядом с setup.

Хорошо:

```ts
/**
 * Сценарий: SDK middleware применяет throttling только к unary calls.
 *
 * Защищает:
 * - unary limit policy;
 * - отсутствие throttling на response streams.
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
  // Проверяем, что response streams не throttled.
});
```

Хорошо:

```ts
test('does not throttle response streams', async () => {
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
