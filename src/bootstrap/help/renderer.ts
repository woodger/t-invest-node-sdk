/**
 * Модуль help-рендеринга превращает декларативный registry в стабильный CLI-текст.
 *
 * Здесь допустимы:
 * - форматирование секций help-вывода;
 * - сборка общего и command-specific help текста;
 * - изоляция presentation-формата от registry и entrypoint слоя.
 *
 * Здесь не должно быть знания о command parser-ах или SDK runtime wiring.
 */

import packageJson from '../../../package.json';
import { commandHelp, type CommandHelp, type CommandHelpName } from './commands';

function renderSection(title: string, rows: readonly string[] | undefined): string[] {
  if (rows === undefined || rows.length === 0) {
    return [];
  }

  return [
    '',
    `${title}:`,
    ...rows.map((row) => `  ${row}`)
  ];
}

function renderCommandContract(command: CommandHelp): string[] {
  return [
    ...renderSection('SDK call', command.sdkCall === undefined ? undefined : [command.sdkCall]),
    ...renderSection('gRPC method', command.grpcMethod === undefined ? undefined : [command.grpcMethod])
  ];
}

export function renderCliHelp(): string {
  const commandNameWidth = Math.max(...Object.keys(commandHelp).map((name) => name.length));

  return [
    `${packageJson.name} ${packageJson.version}`,
    packageJson.description,
    '',
    'Usage:',
    '  tinkoff-invest-node-sdk <service> <method> [options]',
    '  tinkoff-invest-node-sdk help [<service> <method>|version]',
    '  tinkoff-invest-node-sdk --help',
    '  tinkoff-invest-node-sdk --version',
    '',
    'Global options:',
    '  --help, -h       Show this help and exit',
    '  --version, -v    Show package and runtime version info',
    '',
    'Commands:',
    ...Object.entries(commandHelp).map(
      ([name, command]) => `  ${name.padEnd(commandNameWidth)} ${command.description}`
    ),
    '',
    'Command details:',
    '  tinkoff-invest-node-sdk <service> <method> --help',
    ''
  ].join('\n');
}

export function renderCommandHelp(commandName: CommandHelpName): string {
  const command: CommandHelp = commandHelp[commandName];

  return [
    `${packageJson.name} ${packageJson.version}`,
    `${commandName} - ${command.description}`,
    ...renderCommandContract(command),
    ...renderSection('Usage', command.usage),
    ...renderSection('Required options', command.required),
    ...renderSection('Optional options', command.optional),
    ...renderSection('Environment', command.environment),
    ...renderSection('Examples', command.examples),
    ...renderSection('Notes', command.notes),
    ''
  ].join('\n');
}
