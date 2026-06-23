/**
 * Модуль реестра команд связывает имя CLI-команды с ее handler.
 *
 * Здесь допустимы:
 * - декларативное описание доступных CLI-команд;
 * - валидация имени команды из argv;
 * - возврат handler metadata для bootstrap CLI;
 *
 * Здесь не должно быть исполнения команд, разбора argv или форматирования help/version output.
 */

import { accounts } from './commands/accounts/cli';
import { candles } from './commands/candles/cli';
import { help } from './commands/help/cli';
import { instrument } from './commands/instrument/cli';
import { lastPrices } from './commands/last-prices/cli';
import { orderBook } from './commands/order-book/cli';
import { orders } from './commands/orders/cli';
import { portfolio } from './commands/portfolio/cli';
import { positions } from './commands/positions/cli';
import { tradingStatus } from './commands/trading-status/cli';
import { tradingStatuses } from './commands/trading-statuses/cli';
import { userInfo } from './commands/user-info/cli';
import { version } from './commands/version/cli';
import type { CliCommand } from './cli-contract';

export type ResolvedCommand = {
  name: CommandName;
  path: readonly string[];
  requiresContext: boolean;
  handler: CliCommand;
};

type RegisteredCommand = Omit<ResolvedCommand, 'name' | 'path'>;

const commandRegistry = {
  'users get-accounts': {
    requiresContext: false,
    handler: accounts
  },
  'users get-info': {
    requiresContext: false,
    handler: userInfo
  },
  'marketdata get-candles': {
    requiresContext: false,
    handler: candles
  },
  'instruments get-instrument-by': {
    requiresContext: false,
    handler: instrument
  },
  'marketdata get-last-prices': {
    requiresContext: false,
    handler: lastPrices
  },
  'marketdata get-order-book': {
    requiresContext: false,
    handler: orderBook
  },
  'marketdata get-trading-status': {
    requiresContext: false,
    handler: tradingStatus
  },
  'marketdata get-trading-statuses': {
    requiresContext: false,
    handler: tradingStatuses
  },
  'orders get-orders': {
    requiresContext: false,
    handler: orders
  },
  'operations get-portfolio': {
    requiresContext: false,
    handler: portfolio
  },
  'operations get-positions': {
    requiresContext: false,
    handler: positions
  },
  help: {
    requiresContext: false,
    handler: help
  },
  version: {
    requiresContext: false,
    handler: version
  }
} as const satisfies Record<string, RegisteredCommand>;

export type CommandName = keyof typeof commandRegistry;

export function isCommandName(value: unknown): value is CommandName {
  return typeof value === 'string' && value in commandRegistry;
}

function commandNameFromPositionals(positionals: readonly unknown[]): string {
  const [serviceOrCommand, method] = positionals;

  if (serviceOrCommand === 'help' || serviceOrCommand === 'version') {
    return serviceOrCommand;
  }

  return `${String(serviceOrCommand)} ${String(method)}`;
}

export function resolveCommand(positionals: readonly unknown[]): ResolvedCommand {
  const commandName = commandNameFromPositionals(positionals);

  if (!isCommandName(commandName)) {
    throw new Error(`'${commandName}' is not a program command`);
  }

  const command = commandRegistry[commandName];
  const path = commandName.split(' ');

  return {
    ...command,
    name: commandName,
    path
  };
}
