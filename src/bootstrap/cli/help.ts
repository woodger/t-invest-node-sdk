/**
 * Модуль CLI help разрешает help target и рендерит справку.
 *
 * Здесь допустимы:
 * - распознавание help-флагов;
 * - сборка общего и command-specific help текста.
 *
 * Здесь не должно быть исполнения команд, разбора raw CLI input или SDK runtime wiring.
 */

import packageJson from '../../../package.json';
import {
  canonicalizeCommandName,
  cliDomainNames,
  cliDomains,
  commandActionName,
  commandDomainName,
  isCliDomainName,
  type CliDomainName
} from './domains';
import { cliName } from './version';
import {
  commandHelp,
  type CommandHelp,
  type CommandHelpName
} from './help-catalog';

export function isCommandHelpName(value: unknown): value is CommandHelpName {
  return typeof value === 'string' && Object.hasOwn(commandHelp, value);
}

export function resolveCommandHelpName(positionals: readonly unknown[]): CommandHelpName | undefined {
  const commandName = normalizeHelpCommandName(positionals);

  if (commandName === undefined) {
    return undefined;
  }

  return isCommandHelpName(commandName) ? commandName : undefined;
}

export function resolveDomainHelpName(positionals: readonly unknown[]): CliDomainName | undefined {
  if (positionals.length !== 1) {
    return undefined;
  }

  const [domain] = positionals;

  return isCliDomainName(domain) ? domain : undefined;
}

type HelpOptions = {
  help?: unknown;
};

export function isHelpRequested(options: HelpOptions): boolean {
  return options.help === true;
}

export function renderHelp(positionals: readonly unknown[]): string {
  const domainName = resolveDomainHelpName(positionals);

  if (domainName !== undefined) {
    return renderDomainHelp(domainName);
  }

  const commandName = resolveCommandHelpName(positionals);

  if (commandName === undefined) {
    return renderCliHelp();
  }

  return renderCommandHelp(commandName);
}

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

function normalizeHelpCommandName(positionals: readonly unknown[]): string | undefined {
  if (positionals.length === 0) {
    return undefined;
  }

  return canonicalizeCommandName(positionals.map((value) => String(value)).join(' '));
}

export function renderCliHelp(): string {
  const domainNameWidth = Math.max(...cliDomainNames.map((name) => name.length));

  return [
    `${cliName} ${packageJson.version}`,
    packageJson.description,
    '',
    'Usage:',
    `  ${cliName} <domain> <command> [options]`,
    `  ${cliName} <domain> --help`,
    `  ${cliName} <domain> <command> --help`,
    `  ${cliName} --help`,
    `  ${cliName} --version`,
    '',
    'Domains:',
    ...cliDomainNames.map(
      (domainName) => `  ${domainName.padEnd(domainNameWidth)} ${cliDomains[domainName].description}`
    ),
    '',
    'Global options:',
    '  --help, -h       Show help and exit',
    '  --version, -v    Show package version',
    '',
    'Domain details:',
    `  ${cliName} <domain> --help`,
    ''
  ].join('\n');
}

export function renderDomainHelp(domainName: CliDomainName): string {
  const commands = Object.entries(commandHelp)
    .filter(([name]) => commandDomainName(name) === domainName)
    .map(([name, command]) => ({
      name,
      action: commandActionName(name),
      command
    }));
  const commandNameWidth = Math.max(...commands.map(({ action }) => action.length));

  return [
    `${cliName} ${packageJson.version}`,
    `${domainName} - ${cliDomains[domainName].description}`,
    '',
    'Usage:',
    `  ${cliName} ${domainName} <command> [options]`,
    `  ${cliName} ${domainName} <command> --help`,
    '',
    'Commands:',
    ...commands.map(
      ({ action, command }) => `  ${action.padEnd(commandNameWidth)} ${command.description}`
    ),
    '',
    'Command details:',
    `  ${cliName} ${domainName} <command> --help`,
    ''
  ].join('\n');
}

export function renderCommandHelp(commandName: CommandHelpName): string {
  const command = commandHelp[commandName] as CommandHelp | undefined;

  if (command === undefined) {
    throw new Error(`Unknown command help: ${commandName}`);
  }

  return [
    `${cliName} ${packageJson.version}`,
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
