/**
 * Модуль utility CLI-команды `version`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - вызов bootstrap helper-а, который формирует utility output;
 * - возврат строки без обращения к provider API;
 *
 * Здесь не должно быть SDK wiring или generated API request logic.
 */

import { command } from '../../cli/contract';
import { renderVersionInfo } from '../../cli/version';

export const versionCommand = command.define({
  path: ['version'],
  options: {},
  handle() {
    return renderVersionInfo();
  }
});
