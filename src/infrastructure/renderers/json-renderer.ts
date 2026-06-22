/**
 * Модуль рендеринга pretty JSON.
 *
 * Здесь не должно быть знаний о конкретных командах, application reports или
 * provider DTO.
 */

export function renderJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
