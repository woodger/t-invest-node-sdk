import { defineCommand } from 'icore';
import type { CliArgs } from '../../cli-contract';
import { resolveCommandHelpName } from '../../help/commands';
import { renderCliHelp, renderCommandHelp } from '../../help/renderer';

export const helpCommand = defineCommand({
  path: ['help'],
  options: {},
  allowExtraPositionals: true,
  handle({ positionals }) {
    return renderHelpOutput(positionals);
  }
});

export function help(argv: CliArgs): string {
  const [, ...positionals] = argv._;

  return renderHelpOutput(positionals);
}

function renderHelpOutput(positionals: readonly unknown[]): string {
  const commandName = resolveCommandHelpName(positionals);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
