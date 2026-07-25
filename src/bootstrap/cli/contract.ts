/**
 * Модуль CLI command facade закрепляет единую форму объявления bootstrap-команд.
 *
 * Здесь допустимы:
 * - создание pre-bound фасада command mechanics из icore;
 * - закрепление общих context, result и metadata типов bootstrap-команд;
 * - экспорт фасада для command modules;
 *
 * Здесь не должно быть command-specific path, option schema или handler logic.
 */

import { createCommand, type TerminalCommandOutput } from 'icore';

export const command = createCommand.withTypes<{
  context: undefined;
  result: TerminalCommandOutput;
  metadata: undefined;
}>();
