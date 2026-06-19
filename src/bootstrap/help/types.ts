/**
 * Модуль типов help-слоя описывает декларативный контракт CLI-справки.
 *
 * Здесь допустимы:
 * - описание структуры usage, examples и notes;
 * - типизация help registry и renderer interface;
 * - экспорт compile-time контракта без runtime-логики.
 *
 * Здесь не должно быть рендеринга текста, разбора argv или привязки к command handlers.
 */

export interface CommandHelp {
  description: string;
  usage: string[];
  examples: string[];
  notes?: string[];
}
