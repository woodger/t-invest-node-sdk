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

import { defineCommand } from 'icore';
import { renderVersionInfo } from '../../version';

export const versionCommand = defineCommand({
  path: ['version'],
  options: {},
  allowExtraPositionals: true,
  handle() {
    return renderVersionInfo();
  }
});

