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
import type { CommandHelp } from './types';
import { commandHelp, type CommandHelpName } from './commands';

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

export function renderCliHelp(): string {
  return [
    `${packageJson.name} ${packageJson.version}`,
    packageJson.description,
    '',
    'Usage:',
    '  tinkoff-invest-node-sdk <command> [options]',
    '  tinkoff-invest-node-sdk --help',
    '  tinkoff-invest-node-sdk --version',
    '',
    'Global options:',
    '  --help, -h       Show this help and exit',
    '  --version, -v    Show package and runtime version info',
    '',
    'Commands:',
    ...Object.entries(commandHelp).map(
      ([name, command]) => `  ${name.padEnd(10)} ${command.description}`
    ),
    '',
    'Command details:',
    '  tinkoff-invest-node-sdk <command> --help',
    ''
  ].join('\n');
}

export function renderCommandHelp(commandName: CommandHelpName): string {
  const command: CommandHelp = commandHelp[commandName];

  return [
    `${packageJson.name} ${packageJson.version}`,
    `${commandName} - ${command.description}`,
    ...renderSection('Usage', command.usage),
    ...renderSection('Required options', command.required),
    ...renderSection('Optional options', command.optional),
    ...renderSection('Environment', command.environment),
    ...renderSection('Examples', command.examples),
    ...renderSection('Notes', command.notes),
    ''
  ].join('\n');
}
