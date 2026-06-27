import { defineCommand } from 'icore';
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

function renderHelpOutput(positionals: readonly unknown[]): string {
  const commandName = resolveCommandHelpName(positionals);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}
