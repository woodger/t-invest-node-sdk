/**
 * Модуль реестра команд связывает имя CLI-команды с ее handler.
 *
 * Здесь допустимы:
 * - декларативное описание доступных CLI-команд;
 * - валидация имени команды из argv;
 * - возврат handler metadata для bootstrap CLI;
 *
 * Здесь не должно быть исполнения команд, разбора argv или форматирования help/version output.
 */

import { help } from './commands/help/cli';
import { version } from './commands/version/cli';
import type { CliCommand } from './cli-contract';

export type ResolvedCommand = {
  requiresContext: boolean;
  handler: CliCommand;
};

const commandRegistry = {
  help: {
    requiresContext: false,
    handler: help
  },
  version: {
    requiresContext: false,
    handler: version
  }
} as const satisfies Record<string, ResolvedCommand>;

export type CommandName = keyof typeof commandRegistry;

export function isCommandName(value: unknown): value is CommandName {
  return typeof value === 'string' && value in commandRegistry;
}

export function resolveCommand(rawAction: unknown): ResolvedCommand {
  if (!isCommandName(rawAction)) {
    throw new Error(`'${String(rawAction)}' is not a program command`);
  }

  return commandRegistry[rawAction];
}
