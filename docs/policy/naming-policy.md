# Политика именования

> Type: Policy. Этот документ задает правила именования сущностей в коде.

## Цель

Имена в коде должны быть единообразными, предсказуемыми и не создавать ложных смысловых сигналов.

Нотация имени должна отражать роль сущности, а не личное предпочтение автора.

## Базовые правила именования

В TypeScript/JavaScript-коде используются следующие правила:

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

type UnaryLimits = Record<string, number>;

interface TinkoffInvestOptions {
  // ...
}

class TinkoffInvestNodeSDK {
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

`export const` не является основанием для `ALL_CAPS`.

Даже если значение не изменяется после объявления, имя должно оставаться в `camelCase`, если это внутренняя сущность проекта.

## Symbolic codes

`SCREAMING_SNAKE_CASE` допускается для строковых symbolic codes, если значение является стабильным машинным кодом, а не именем переменной, функции, класса или runtime-name.

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

Если `SCREAMING_SNAKE_CASE` используется как string value, это должно быть осознанным стабильным кодом, а не заменой обычному имени.

Хорошее правило:

```text
ALL_CAPS identifier  -> запрещено
ALL_CAPS string code -> допустимо, если это stable symbolic code
```

Для object literal с symbolic code ключами предпочтительно явно писать ключи в кавычках, чтобы подчеркнуть, что это string contract, а не стиль именования идентификатора.

## Исключения

`ALL_CAPS` допускается только там, где имя является внешним контрактом, а не внутренним именем проекта.

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

Исключение допустимо только тогда, когда `ALL_CAPS` требуется внешним миром.

Нельзя использовать `ALL_CAPS` просто потому, что значение является константой.

## Object properties

Для внутренних object properties используется `camelCase`.

Допустимо:

```ts
const options = {
  trackLimits: true,
  useSsl: true
};
```

Запрещено:

```ts
const options = {
  TRACK_LIMITS: true,
  USE_SSL: true
};
```

Исключение допускается только для внешних payload-ов, wire-format структур или контрактов сторонних систем.

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

## Runtime names

Runtime names и file names не обязаны следовать правилам TypeScript-идентификаторов.

Для них предпочтительно использовать `kebab-case`.

Допустимо:

```ts
const serviceName = 'market-data-service';
const optionName = '--track-limits';
```

Запрещено использовать `ALL_CAPS` runtime-name без внешней необходимости:

```ts
const serviceName = 'MARKET_DATA_SERVICE';
```

## Generated code

Generated code может нарушать эту policy, если такое имя пришло из proto contract или code generator.

Запрещено:

- вручную переименовывать generated symbols;
- применять policy к generated files как к handwritten code;
- менять generated naming без изменения source contract и generator workflow.

Для handwritten wrappers вокруг generated code нужно соблюдать обычные правила именования.

## Запрет переименований без задачи

Эта политика не разрешает массовые переименования сама по себе.

Переименование допускается только если:

- оно прямо требуется задачей;
- оно устраняет нарушение этой политики;
- изменение минимально необходимо;
- поведение программы не меняется.

Нельзя использовать эту политику как повод для сопутствующего cleanup, рефакторинга или изменения архитектуры.

## Проверка

Нарушения этой политики должны блокироваться на уровне review.

## Краткое правило

Внутренние имена проекта не используют `ALL_CAPS`.

`ALL_CAPS` допустим только для внешних контрактов, где такая форма имени требуется внешней системой, или в generated code, который воспроизводит внешний contract.
