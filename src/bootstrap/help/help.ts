/**
 * Модуль help-фасада обслуживает верхнеуровневый CLI-контракт справки.
 *
 * Здесь допустимы:
 * - распознавание help-флагов;
 * - выбор между общим help и command-specific help.
 *
 * Здесь не должно быть разбора command arguments или зависимости от application/infrastructure слоя.
 */

import { resolveCommandHelpName } from './commands';
import { renderCliHelp, renderCommandHelp } from './renderer';

type HelpOptions = {
  help?: unknown;
  h?: unknown;
};

export function isHelpRequested(options: HelpOptions): boolean {
  return options.help === true || options.h === true;
}

export function renderHelp(positionals: readonly unknown[]): string {
  const commandName = resolveCommandHelpName(positionals);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
