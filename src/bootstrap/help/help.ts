/**
 * Модуль help-фасада обслуживает верхнеуровневый CLI-контракт справки.
 *
 * Здесь допустимы:
 * - распознавание help-флагов;
 * - выбор между общим help и command-specific help.
 *
 * Здесь не должно быть разбора command arguments или зависимости от application/infrastructure слоя.
 */

import type { CliArgs } from '../cli-contract';
import { resolveCommandHelpName } from './commands';
import { renderCliHelp, renderCommandHelp } from './renderer';

export function isHelpRequested(argv: CliArgs): boolean {
  return argv.help === true || argv.h === true;
}

export function renderHelp(argv: CliArgs): string {
  const commandName = resolveCommandHelpName(argv._);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
