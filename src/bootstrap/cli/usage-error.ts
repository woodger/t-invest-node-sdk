/**
 * Модуль CLI usage error маркирует ошибки входных данных, проверяемые проектом.
 *
 * `icore` классифицирует ошибки собственного parser/schema runtime. Этот тип
 * дополняет его для command-specific arguments, ENV и JSON-конфигурации.
 * Здесь не должно быть rendering, exit-code policy или command execution.
 */

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliUsageError';
  }
}
