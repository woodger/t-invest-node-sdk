import type { CliArgs } from '../../cli-contract';
import { resolveCommandHelpName } from '../../help/commands';
import { renderCliHelp, renderCommandHelp } from '../../help/renderer';

export function help(argv: CliArgs): string {
  const [, ...positionals] = argv._;
  const commandName = resolveCommandHelpName(positionals);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
