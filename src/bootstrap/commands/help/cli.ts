import type { CliArgs } from '../../cli-contract';
import { isCommandHelpName } from '../../help/commands';
import { renderCliHelp, renderCommandHelp } from '../../help/renderer';

export function help(argv: CliArgs): string {
  const [, commandName] = argv._;

  if (!isCommandHelpName(commandName)) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
