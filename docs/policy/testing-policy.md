# Политика тестирования

> Type: Policy. Этот документ задает требования к тестируемости, структуре и именованию тестов.

## Назначение

Тесты должны защищать production-контракты, наблюдаемое поведение и граничные сценарии SDK.

Тест не должен фиксировать случайную реализацию, временную структуру кода или внутренний порядок действий, если это не является частью публичного контракта.

Основной вопрос, на который должен отвечать тест:

> Какое поведение или какой production-риск защищен?

А не:

> Какие строки кода были выполнены?

## Как запускать тесты

Тесты пишутся на TypeScript в `src/**/*.test.ts` и используют стандартные модули Node.js:

- `node:test`;
- `node:assert`.

Перед запуском тестов после изменений в `src` нужно пересобрать проект:

```bash
npm run build
npm test
```

`npm run build` является обязательной compile-проверкой. Он должен проходить на текущем `tsconfig.json`: при ошибках типизации нужно исправлять source или tests, а не ослаблять TypeScript-конфигурацию без отдельного решения.

`npm test` запускает внешний compiled runner `fwa`:

```bash
fwa --prune
```

Runner `fwa`:

- читает `rootDir` и `outDir` из `tsconfig.json`;
- рекурсивно собирает compiled tests из `dist`;
- удаляет stale compiled tests без source-пары через `--prune`;
- останавливает запуск, если compiled test старше своего source test;
- делегирует выполнение стандартному `node:test`;
- запускает тестовые файлы в отдельных процессах.

Если `npm test` сообщает, что compiled tests старше source tests, нужно выполнить `npm run build` и повторить запуск. Если `npm test` удаляет stale compiled tests без source-пары, это ожидаемое поведение `fwa --prune`.

## Обязательность тестов

Любой переиспользуемый код должен иметь тесты.

Тесты обязательны для:

- shared modules;
- SDK internals;
- middleware;
- unary limiter logic;
- parsing;
- validation;
- adapters к внешним API;
- filesystem logic;
- reusable application logic;
- code paths с несколькими допустимыми или ошибочными сценариями.

Если код используется из нескольких мест, является boundary между слоями или нормализует внешний input, он должен быть покрыт тестами.

## Что обязательно тестировать

Нужно тестировать:

- публичное поведение `TInvestNodeSDK`;
- создание metadata, channel и typed clients;
- middleware behavior для unary и streaming calls;
- unary limiter и resolution квот;
- mapping конфигурации в runtime behavior;
- validation helpers;
- edge cases, которые могут привести к silent data corruption;
- regression cases, которые уже ломались или выглядят хрупкими;
- project-specific test pipeline behavior, если оно реализовано в коде проекта.

## Что обычно не требует отдельного теста

Обычно не нужно выносить в отдельные тесты:

- одноразовую склейку вызовов без собственной логики;
- тривиальный passthrough без ветвлений;
- простую передачу аргументов без нормализации или contract mapping;
- private helper, если его поведение полностью проверяется через публичный API;
- framework boilerplate без собственной project-specific логики;
- generated code из `src/generated`.

Отсутствие теста допустимо только если код действительно не содержит собственного поведения. Если появляется ветвление, нормализация, fallback, mapping ошибки или нестандартный edge case, тест становится обязательным.

## Требования к тестам

Тесты должны быть:

- изолированными;
- детерминированными;
- читаемыми;
- минимальными, но достаточными;
- сфокусированными на одном поведении;
- ориентированными на наблюдаемый результат, а не на внутреннюю реализацию.

Один тест должен проверять одно поведение.

Допустимо иметь несколько assertions в одном тесте, если они описывают один и тот же contract. Если assertions проверяют разные причины изменения поведения, их нужно разделить на отдельные тесты.

## Граница тестового файла

Тестовый файл должен покрывать конкретный production-файл, а не директорию.

Правило соответствия:

```text
src/bootstrap/cli/help.ts           -> src/bootstrap/cli/help.test.ts
src/bootstrap/cli/registry.ts       -> src/bootstrap/cli/registry.test.ts
src/bootstrap/cli/runner.ts         -> src/bootstrap/cli/runner.test.ts
src/bootstrap/cli/version.ts        -> src/bootstrap/cli/version.test.ts
```

Запрещено создавать тест, который по имени выглядит как тест директории или barrel-модуля:

```text
src/bootstrap/cli.test.ts           # покрывает директорию cli/
src/bootstrap/cli/index.test.ts     # покрывает barrel-only index.ts
```

Исключение допустимо только если файл действительно является runtime entrypoint или package entrypoint с собственным поведением. В этом случае тест должен проверять именно поведение entrypoint, а не внутренние файлы директории.

Если `index.ts` содержит только re-export-ы, отдельный тест для него не нужен. Тестировать нужно файлы, в которых находится логика.

## Импорты в тестах

Unit-тесты должны импортировать код из конкретного файла, который они проверяют.

Допустимо:

```ts
import { renderCliHelp, isHelpRequested } from './help';
```

Запрещено для unit-теста конкретного файла:

```ts
import { renderCliHelp } from './index';
import { renderCliHelp } from '../help';
```

Второй пример запрещен, если `../help` резолвится как директория или barrel, а не как конкретный файл.

Integration-тест может идти через публичный entrypoint, если проверяет наблюдаемое поведение entrypoint: exit code, stdout/stderr, dispatch, wiring или public API contract.

## Изоляция

Тест должен минимизировать зависимость от:

- реальной файловой системы, если проверяется не filesystem behavior;
- сети;
- текущего времени;
- порядка запуска тестов;
- внешних процессов;
- глобального mutable state;
- stale build artifacts.

Если зависимость от внешнего ресурса является сутью теста, она должна быть явно видна из имени теста, suite или fixture.

## Тестовые данные

Тестовые данные должны быть минимальными, но достаточными для сценария.

Не нужно создавать realistic dataset, если для проверки достаточно одного объекта с тремя полями.

Хорошо:

```ts
test('returns undefined for an unknown path', () => {
  const perMinute = (maxRequests: number) => ({
    maxRequests,
    windowMs: 60_000
  });
  const resolver = new UnaryLimitResolver({
    KnownService: perMinute(100)
  });

  assert.equal(
    resolver.resolve('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'),
    undefined
  );
});
```

Плохо:

```ts
test('validates unary quotas', () => {
  const perMinute = (maxRequests: number) => ({
    maxRequests,
    windowMs: 60_000
  });
  const resolver = new UnaryLimitResolver({
    InstrumentsService: perMinute(200),
    MarketDataService: perMinute(300),
    OperationsService: perMinute(200),
    OrdersService: perMinute(100),
    SandboxService: perMinute(200),
    StopOrdersService: perMinute(50),
    UsersService: perMinute(100)
  });

  assert.equal(
    resolver.resolve('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'),
    undefined
  );
});
```

Лишние поля скрывают причину теста и увеличивают стоимость сопровождения.

## Именование test suite

Имена тестов должны описывать public API path и ожидаемое поведение.

Top-level `describe()` называет unit under test:

- `ClassName` для классов и runtime components;
- `functionName` для standalone exported functions;
- `objectName` для exported objects или namespaces;
- `module-name` только когда тестируется несколько тесно связанных exports и нет одного основного subject.

Хорошо:

```ts
describe('createInMemoryUnaryLimiter', () => {
  // ...
});

describe('createSdkMetadata', () => {
  // ...
});

describe('command options', () => {
  // ...
});
```

Плохо:

```ts
describe('utils', () => {
  // ...
});

describe('tests for sdk', () => {
  // ...
});
```

## Именование nested suite

Nested `describe()` называет публичный member или operation:

- `constructor` для constructor behavior;
- `#methodName` для instance methods, вызываемых как `instance.methodName()`;
- `.methodName` для static methods, вызываемых как `ClassName.methodName()`;
- `.methodName` для exported object/namespace methods, вызываемых как `objectName.methodName()`;
- `functionName` для standalone functions, сгруппированных под module-level suite.

Примеры:

```ts
describe('UnaryLimitResolver', () => {
  describe('#resolve', () => {
    // ...
  });

  describe('#reduce', () => {
    // ...
  });
});

describe('command options', () => {
  describe('parseDateTimeOption', () => {
    // ...
  });
});
```

A parent suite must not contain sibling `describe()` blocks with the same name. Если два блока имеют одинаковое имя, их нужно объединить или назвать по разным публичным сценариям.

## Именование test case

`test()` называет только expected behavior.

Имя теста не должно повторять subject или method name, если они уже указаны в `describe()`.

Хорошо:

```ts
describe('UnaryLimitResolver', () => {
  describe('#resolve', () => {
    test('returns undefined for an unknown path', () => {
      // ...
    });
  });
});
```

Плохо:

```ts
describe('UnaryLimitResolver', () => {
  describe('#resolve', () => {
    test('UnaryLimitResolver resolve returns undefined for an unknown path', () => {
      // ...
    });
  });
});
```

Повтор subject делает имя шумным и ухудшает читаемость test output.

## Предпочтительные behavior verbs

Предпочтительные глаголы для `test()`:

- `returns ...`;
- `throws ...`;
- `rejects ...`;
- `parses ...`;
- `formats ...`;
- `writes ...`;
- `reads ...`;
- `keeps ...`;
- `skips ...`;
- `uses ...`;
- `does not ...`;
- `handles ...`;
- `preserves ...`;
- `computes ...`;
- `maps ...`;
- `normalizes ...`;
- `ignores ...`.

Хорошо:

```ts
test('throws for unknown unary limit path', async () => {
  // ...
});

test('does not invoke the unary limiter for response streams', async () => {
  // ...
});
```

Плохо:

```ts
test('works correctly', () => {
  // ...
});

test('should process data', () => {
  // ...
});
```

`should` не запрещен технически, но предпочтительный стиль - прямое описание наблюдаемого поведения без лишнего модального слова.

## Публичное поведение вместо private implementation

Детали приватной реализации обычно не должны получать отдельные имена suite.

Приватные детали нужно тестировать через публичное поведение.

Исключение допустимо только если helper является reusable export и сам по себе становится частью module contract. В этом случае тест должен проверять наблюдаемое поведение helper-а, а не private implementation.

## Error cases и boundary cases

Reusable-код должен иметь тесты не только на happy path, но и на ошибочные и граничные сценарии.

Особенно важно тестировать:

- пустой input;
- минимально допустимый input;
- максимально допустимый input;
- invalid format;
- unsupported enum value;
- missing required field;
- duplicate input;
- out-of-order input;
- repeated call;
- idempotency;
- fallback behavior;
- error mapping;
- skipped branch.

Не каждый модуль обязан иметь все эти сценарии. Нужны только те, которые соответствуют его responsibility.

## Regression tests

Regression test нужен, если поведение уже ломалось или риск повторного дефекта высок.

Regression test должен фиксировать production contract, а не конкретную старую ошибочную реализацию.

Хорошо:

```ts
test('does not rewrite runnable compiled tests', async () => {
  // ...
});
```

Плохо:

```ts
test('fixes old suite bug', async () => {
  // ...
});
```

Контекст regression case можно раскрыть комментарием, если без него причина теста неочевидна.

## Комментарии в тестах

Комментарии в тестах регулируются отдельным документом:

- [Политика комментариев в тестах](./test-comment-style.md)

Краткое правило:

> Комментарий в тесте нужен только тогда, когда он объясняет production-риск, regression case, неочевидный fixture, странный expected value или границу ответственности теста.

Комментарий не должен пересказывать arrange/act/assert-механику и не должен дублировать имя теста.

Если комментарий можно заменить хорошим именем теста, нужно улучшить имя теста, а не добавлять комментарий.

## Связь с изменениями

Добавление или изменение тестов должно оставаться в scope задачи.

Запрещено:

- переписывать соседние тесты без необходимости;
- менять test pipeline без явного запроса;
- переименовывать unrelated suites "по пути";
- добавлять broad cleanup вместе с точечным regression test;
- фиксировать новую архитектуру тестами, если задача была про локальный дефект.

Допустимо:

- добавить минимальный тест под новое требование;
- добавить regression test под исправляемый дефект;
- переименовать test case, если текущее имя мешает понять проверяемое поведение;
- локально улучшить fixture, если без этого тест не выражает сценарий.

## Хорошие практики

- называть тест по наблюдаемому поведению, а не по внутренней реализации;
- держать тестовые данные минимальными, но достаточными для сценария;
- добавлять тесты на граничные и ошибочные случаи для reusable-логики;
- избегать test-only abstractions без необходимости;
- не проверять несколько независимых behaviors одним тестом;
- не использовать snapshot/golden output без явного contract reason;
- не делать тест зависимым от порядка запуска других тестов;
- не использовать production credentials, real network или mutable external state;
- предпочитать explicit expected value вместо проверки "не упало";
- не хранить unrelated compiled test artifacts внутри `dist`.

## Общий критерий

Хороший тест:

- защищает конкретный production contract;
- имеет понятный subject через `describe()`;
- имеет behavior-oriented имя через `test()`;
- использует минимальные данные;
- не зависит от случайного состояния окружения;
- проверяет публичное поведение;
- не фиксирует private implementation без необходимости.

Если тест сложно назвать, скорее всего, он проверяет слишком много или не имеет ясного contract.
