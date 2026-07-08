/**
 * Модуль CLI error formatting нормализует unknown errors в текст stderr.
 *
 * Здесь допустимы:
 * - преобразование Error и неизвестных thrown values в строку;
 * - сохранение стабильного newline-контракта CLI errors.
 *
 * Здесь не должно быть command execution, stdout/stderr writes или SDK wiring.
 */

export function renderCommandError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}\n`;
  }

  return `${String(error)}\n`;
}
