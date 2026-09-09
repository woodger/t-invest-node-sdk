# Руководства для Consumer-ов

> Type: Navigation. Здесь собраны законченные сценарии для публичного API. За точными generated contracts и CLI reference переходите к исходным справочникам.

## Начало работы

- [Первый SDK-вызов](./getting-started.md) — установка из npm, настройка окружения, выбор счета и корректное закрытие SDK.
- [Unary-вызовы](./unary-calls.md) — портфель, свечи, сигналы, deadline и response metadata.

## Долгоживущие операции

- [Потоки и отмена](./streams-and-cancellation.md) — server-side и bidirectional streams, `AbortSignal` и владение shutdown lifecycle.
- [Ошибки и lifecycle](./errors-and-lifecycle.md) — narrowing `SdkError`, различение источников ошибок и граница retry policy.

## Управление unary-квотами

- [Собственная реализация unary limiter-а](./custom-unary-limiter.md) — публичный port, точный lifecycle `acquire()`, cancellation, ownership, process-local и межпроцессные варианты.

## Consumer-тесты

- [Mock-сервисы через public exports](./testing-with-service-definitions.md) — регистрация `*ServiceDefinition` и типизированной implementation без deep imports.

## Справочные материалы

Актуальные public exports смотрите в корневом entrypoint пакета, а generated DTO, enum-ы и service methods — в proto contracts проекта.

Дополнительные справочники:

- [Лимитная политика](../limits-policy.md);
- [Справочник потокового CLI](../cli-stream-reference.md);
- [Справочник конфигурации потокового CLI](../cli-stream-configuration.md);
- [Навигация по документации](../index.md).
