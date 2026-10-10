# Разработка SDK

> Type: Development guide. Здесь описаны генерация TypeScript-кода из proto-контрактов и выпуск новой версии SDK.

Команды в этом документе запускаются из корня репозитория после установки зависимостей через `npm ci`.

## Генерация proto

Чтобы сгенерировать TypeScript-код из proto-файлов проекта, выполните:

```sh
npm run cli -- dev compile-proto
```

Для генерации используются закреплённые зависимости разработки `protoc` и `ts-proto`. Устанавливать компилятор в систему не нужно: команда запускает инструменты из локального `node_modules`.

Официальный источник контрактов — активный репозиторий [`invest-contracts`](https://opensource.tbank.ru/invest/invest-contracts). [Manifest репозитория](https://github.com/woodger/t-invest-node-sdk/blob/main/contracts/upstream.json) хранит точные тег и коммит. Файлы T-Invest лежат в плоской структуре `contracts/*.proto`, а сгенерированный TypeScript — в `src/generated/*.ts`. Генератор читает только локальные файлы и не скачивает контракты из внешнего репозитория.

Контракты и производный сгенерированный код распространяются по [Apache License 2.0](../../LICENSE-APACHE-2.0). Происхождение компонентов и необходимые уведомления приведены в [`NOTICE`](../../NOTICE).

Вспомогательные `google/protobuf/descriptor.proto` и `google/protobuf/timestamp.proto` взяты из официального выпуска protobuf `v32.1`; тот же manifest хранит их источник. `package.json` закрепляет версию компилятора, сейчас это `protoc 36.2`.

CLI использует собранные файлы из `dist`, поэтому перед первым запуском после изменений в bootstrap TypeScript-коде нужно выполнить:

```sh
npm run build
```

## Публикация релиза

`publishConfig.access` делает scoped-пакет общедоступным. Сценарий `prepack` запускает `tsc` перед `npm pack` и `npm publish`. Перед слиянием релизного коммита проверьте версию, changelog и проект:

```sh
VERSION="$(node -p "require('./package.json').version")"

npm run build
npm run lint
npm test
npm pack --dry-run
git status --short
```

После merge в `main` создайте annotated tag на актуальном `origin/main`:

```sh
VERSION="$(node -p "require('./package.json').version")"

git fetch origin
git tag -a "$VERSION" "origin/main" -m "$VERSION"
git push origin "$VERSION"
```

Из того же коммита `origin/main` опубликуйте пакет в npm:

```sh
npm publish
```

Git tag совпадает со значением `version` из `package.json`, а GitHub Release может использовать то же значение с префиксом `v`. Возьмите release notes из одноимённого раздела `CHANGELOG.md`. Для annotated tag настройте `git user.name` и `git user.email`.
