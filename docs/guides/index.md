# Руководства для Consumer-ов

> Type: Navigation. Этот раздел содержит законченные сценарии использования
> публичного API пакета и не заменяет generated contracts или CLI reference.

## Начало работы

- [Первый SDK-вызов](./getting-started.md) — установка из GitHub, настройка
  окружения, выбор счета и корректное закрытие SDK.
- [Unary-вызовы](./unary-calls.md) — портфель, свечи, сигналы, deadline и
  response metadata.

## Долгоживущие операции

- [Потоки и отмена](./streams-and-cancellation.md) — server-side и
  bidirectional streams, `AbortSignal` и владение shutdown lifecycle.
- [Ошибки и lifecycle](./errors-and-lifecycle.md) — narrowing `SdkError`,
  различение источников ошибок и граница retry policy.

## Управление unary-квотами

- [Собственная реализация unary limiter-а](./custom-unary-limiter.md) —
  публичный port, точный lifecycle `acquire()`, cancellation, ownership,
  process-local и межпроцессные варианты.

## Consumer-тесты

- [Mock-сервисы через public exports](./testing-with-service-definitions.md) —
  регистрация `*ServiceDefinition` и типизированной implementation без deep
  imports.

## Справочные материалы

Актуальный список public exports определяет корневой entrypoint пакета.
Generated DTO, enum-ы и service methods определяются vendored proto contracts,
а не этим разделом.

Дополнительные reference-документы:

- [Лимитная политика](../limits-policy.md);
- [Справочник потокового CLI](../cli-stream-reference.md);
- [Справочник конфигурации потокового CLI](../cli-stream-configuration.md);
- [Навигация по документации](../index.md).
