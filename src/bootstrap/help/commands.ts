/**
 * Модуль help-реестра хранит декларативное описание CLI-команд.
 *
 * Здесь допустимы:
 * - описание доступных bootstrap-команд;
 * - централизация usage и examples;
 * - экспорт presentation-only metadata для renderer-а.
 *
 * Здесь не должно быть исполнения команд или разбора argv.
 */

import type { CommandHelp } from './types';

export const commandHelp = {
  accounts: {
    description: 'Print user accounts',
    usage: [
      'tinkoff-invest-node-sdk accounts [options]'
    ],
    optional: [
      '--token=TOKEN          OAuth token, overrides TINKOFF_TOKEN',
      '--endpoint=HOST:PORT   gRPC endpoint, overrides TINKOFF_ENDPOINT',
      '--app-name=NAME        Optional x-app-name metadata value',
      '--insecure             Disable TLS for local or test endpoints',
      '--format=json|table    Output format (default: table)'
    ],
    environment: [
      'TINKOFF_TOKEN',
      'TINKOFF_ENDPOINT'
    ],
    examples: [
      'tinkoff-invest-node-sdk accounts --format=json'
    ]
  },
  candles: {
    description: 'Print historical candles',
    usage: [
      'tinkoff-invest-node-sdk candles --instrument-id=ID --from=ISO --to=ISO --interval=INTERVAL [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive',
      '--interval=INTERVAL    1min|2min|3min|5min|10min|15min|30min|hour|2hour|4hour|day|week|month'
    ],
    optional: [
      '--token=TOKEN          OAuth token, overrides TINKOFF_TOKEN',
      '--endpoint=HOST:PORT   gRPC endpoint, overrides TINKOFF_ENDPOINT',
      '--app-name=NAME        Optional x-app-name metadata value',
      '--insecure             Disable TLS for local or test endpoints',
      '--format=json|csv      Output format (default: json)'
    ],
    environment: [
      'TINKOFF_TOKEN',
      'TINKOFF_ENDPOINT'
    ],
    examples: [
      'tinkoff-invest-node-sdk candles --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T00:00:00Z --to=2026-06-19T01:00:00Z --interval=1min --format=csv'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  help: {
    description: 'Show top-level or command-specific help',
    usage: [
      'tinkoff-invest-node-sdk help',
      'tinkoff-invest-node-sdk help <command>',
      'tinkoff-invest-node-sdk <command> --help'
    ],
    examples: [
      'tinkoff-invest-node-sdk help',
      'tinkoff-invest-node-sdk help version'
    ],
    notes: [
      'Unknown command help falls back to the top-level help page.'
    ]
  },
  version: {
    description: 'Show package and runtime version info',
    usage: [
      'tinkoff-invest-node-sdk version',
      'tinkoff-invest-node-sdk --version'
    ],
    examples: [
      'tinkoff-invest-node-sdk version'
    ]
  }
} as const satisfies Record<string, CommandHelp>;

export type CommandHelpName = keyof typeof commandHelp;

export function isCommandHelpName(value: unknown): value is CommandHelpName {
  return typeof value === 'string' && value in commandHelp;
}
