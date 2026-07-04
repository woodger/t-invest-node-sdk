/**
 * Модуль utility CLI-команды `help`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - вызов bootstrap helper-а, который формирует utility output;
 * - возврат строки без обращения к provider API;
 *
 * Здесь не должно быть SDK wiring или generated API request logic.
 */

import { command } from '../command';
import { resolveCommandHelpName } from '../../help/commands';
import { renderCliHelp, renderCommandHelp } from '../../help/renderer';

export const helpCommand = command.define({
  path: ['help'],
  options: {},
  allowExtraPositionals: true,
  handle({ positionals }) {
    return renderHelpOutput(positionals);
  }
});

function renderHelpOutput(positionals: readonly unknown[]): string {
  const commandName = resolveCommandHelpName(positionals);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
