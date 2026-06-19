import type { CliArgs } from '../../cli-contract';
import {
  isCommandHelpName,
  renderCliHelp,
  renderCommandHelp
} from '../../help';

export function help(argv: CliArgs): string {
  const [, commandName] = argv._;

  if (!isCommandHelpName(commandName)) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
