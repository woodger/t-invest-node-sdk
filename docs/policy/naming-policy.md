# Политика именования

> Type: Policy. Здесь собраны правила именования сущностей в коде.

## Цель

Имена в коде должны быть единообразными, предсказуемыми и не создавать ложных смысловых сигналов.

Нотация имени должна отражать роль сущности, а не личное предпочтение автора.

## Базовые правила именования

В TypeScript/JavaScript-коде:

- `camelCase` - переменные, функции, значения, exported const;
- `PascalCase` - классы, типы, интерфейсы, enum;
- `kebab-case` - runtime names и file names;
- `SCREAMING_SNAKE_CASE` / `ALL_CAPS` - запрещено для внутренних идентификаторов проекта.

Примеры:

```ts
const maxRetryCount = 3;

export const defaultConfig = {
  // ...
};

export function createSdkMetadata() {
  // ...
}

type UnaryLimits = Record<string, TInvestUnaryLimit>;

interface TInvestOptions {
  // ...
}

class TInvestNodeSDK {
  // ...
}
```

## Запрет `ALL_CAPS` / `SCREAMING_SNAKE_CASE`

Во внутреннем TypeScript/JavaScript-коде запрещено использовать `ALL_CAPS` / `SCREAMING_SNAKE_CASE` для имен TypeScript/JavaScript-идентификаторов.

Запрет распространяется на:

- локальные переменные;
- экспортируемые константы;
- функции;
- классы;
- типы;
- интерфейсы;
- enum members;
- registry/resolver/map-переменные.

Запрещено:

```ts
export const DEFAULT_CONFIG = {};
export const UNARY_LIMITS = {};

const MAX_RETRY_COUNT = 3;

enum Status {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}
```

Допустимо:

```ts
export const defaultConfig = {};
export const unaryLimits = {};

const maxRetryCount = 3;

enum Status {
  Active = 'active',
  Disabled = 'disabled'
}
```

Сам по себе `export const` не требует `ALL_CAPS`.

Даже если значение не изменяется после объявления, имя должно оставаться в `camelCase`, если это внутренняя сущность проекта.

## Symbolic codes

Строковые symbolic codes могут использовать `SCREAMING_SNAKE_CASE`, если это стабильные машинные коды, а не имена переменных, функций, классов или runtime names.

Допустимые случаи:

- application error codes;
- machine-readable diagnostic codes;
- compatibility codes;
- external protocol/status codes;
- generated enum values или wire-format values;
- semi-external string contracts между слоями приложения.

Допустимо:

```ts
export type SdkErrorCode =
  | 'UNKNOWN_UNARY_LIMIT';

const sdkErrorMessages: Record<SdkErrorCode, string> = {
  'UNKNOWN_UNARY_LIMIT': 'Unhandled unary limits'
};
```

Запрещено:

```ts
const UNKNOWN_UNARY_LIMIT = 'Unhandled unary limits';
const SDK_ERROR_MESSAGES = {};
```

Используйте `SCREAMING_SNAKE_CASE` в string value только для осознанного стабильного кода, а не вместо обычного имени.

Хорошее правило:

```text
ALL_CAPS identifier  -> запрещено
ALL_CAPS string code -> допустимо, если это stable symbolic code
```

Для object literal с symbolic code ключами предпочтительно явно писать ключи в кавычках, чтобы подчеркнуть, что это string contract, а не стиль именования идентификатора.

## Исключения

Используйте `ALL_CAPS` только для имён из внешнего контракта, но не для внутренних имён проекта.

Допустимые исключения:

- переменные окружения;
- внешние protocol/API fields;
- имена, требуемые сторонней библиотекой;
- generated code из proto;
- SQL/CLI/wire-format значения;
- значения, которые должны дословно совпадать с внешним контрактом.

Примеры допустимых исключений:

```ts
process.env.NODE_ENV;
process.env.INVEST_TOKEN;
```

```ts
const envName = 'INVEST_TOKEN';
```

```ts
const externalPayload = {
  API_KEY: valueFromExternalSystem
};
```

Исключение действует, только когда `ALL_CAPS` требует внешняя система.

Не используйте `ALL_CAPS` только потому, что значение — константа.

## Object properties

Внутренние object properties пишутся в `camelCase`.

Допустимо:

```ts
const options = {
  maxRequests: 100,
  useSsl: true
};
```

Запрещено:

```ts
const options = {
  MAX_REQUESTS: 100,
  USE_SSL: true
};
```

Исключение действует только для внешних payload-ов, wire-format структур или контрактов сторонних систем.

## Enum members

В handwritten enum members нужно использовать `PascalCase`.

Допустимо:

```ts
enum RuntimeMode {
  Production = 'production',
  Test = 'test'
}
```

Запрещено:

```ts
enum RuntimeMode {
  PRODUCTION = 'production',
  TEST = 'test'
}
```

Generated enum members могут сохранять форму внешнего proto contract. Их нельзя переименовывать вручную.

Если внешнее значение должно быть `ALL_CAPS`, оно должно быть значением enum, а не именем enum member:

```ts
enum ExternalStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED'
}
```

## Runtime-имена

Правила TypeScript-идентификаторов не распространяются на runtime names и file names.

Для них предпочтителен `kebab-case`.

Допустимо:

```ts
const serviceName = 'market-data-service';
const optionName = '--track-limits';
```

Запрещено использовать `ALL_CAPS` runtime-name без внешней необходимости:

```ts
const serviceName = 'MARKET_DATA_SERVICE';
```

## Сгенерированный код

Generated code может нарушать эту policy, если такое имя пришло из proto contract или code generator.

Запрещено:

- вручную переименовывать generated symbols;
- применять policy к generated files как к handwritten code;
- менять generated naming без изменения source contract и generator workflow.

Для handwritten wrappers вокруг generated code нужно соблюдать обычные правила именования.

## Запрет переименований без задачи

Эта политика сама по себе не разрешает массовые переименования.

Переименовывайте сущность, только если:

- оно прямо требуется задачей;
- оно устраняет нарушение этой политики;
- изменение минимально необходимо;
- поведение программы не меняется.

Нельзя использовать эту политику как повод для сопутствующего cleanup, рефакторинга или изменения архитектуры.

## Проверка

Review должно блокировать нарушения этой политики.

## Краткое правило

Внутренние имена проекта не используют `ALL_CAPS`.

`ALL_CAPS` допустим только во внешних контрактах, где такую форму требует внешняя система, а также в generated code, который воспроизводит внешний contract.
