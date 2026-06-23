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
import { accruedInterests } from './commands/accrued-interests/cli';
import { bond } from './commands/bond/cli';
import { brand } from './commands/brand/cli';
import { brands } from './commands/brands/cli';
import { bondCoupons } from './commands/bond-coupons/cli';
import { bonds } from './commands/bonds/cli';
import { candles } from './commands/candles/cli';
import { closePrices } from './commands/close-prices/cli';
import { countries } from './commands/countries/cli';
import { currencies } from './commands/currencies/cli';
import { currency } from './commands/currency/cli';
import { dividends } from './commands/dividends/cli';
import { etf } from './commands/etf/cli';
import { etfs } from './commands/etfs/cli';
import { favorites } from './commands/favorites/cli';
import { findInstrument } from './commands/find-instrument/cli';
import { future } from './commands/future/cli';
import { futures } from './commands/futures/cli';
import { futuresMargin } from './commands/futures-margin/cli';
import { help } from './commands/help/cli';
import { instrument } from './commands/instrument/cli';
import { lastPrices } from './commands/last-prices/cli';
import { lastTrades } from './commands/last-trades/cli';
import { marginAttributes } from './commands/margin-attributes/cli';
import { orderBook } from './commands/order-book/cli';
import { orderState } from './commands/order-state/cli';
import { orders } from './commands/orders/cli';
import { operationsByCursor } from './commands/operations-by-cursor/cli';
import { operations } from './commands/operations/cli';
import { portfolio } from './commands/portfolio/cli';
import { positions } from './commands/positions/cli';
import { share } from './commands/share/cli';
import { shares } from './commands/shares/cli';
import { stopOrders } from './commands/stop-orders/cli';
import { tradingSchedules } from './commands/trading-schedules/cli';
import { tradingStatus } from './commands/trading-status/cli';
import { tradingStatuses } from './commands/trading-statuses/cli';
import { userInfo } from './commands/user-info/cli';
import { userTariff } from './commands/user-tariff/cli';
import { version } from './commands/version/cli';
import { withdrawLimits } from './commands/withdraw-limits/cli';
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
  'users get-margin-attributes': {
    requiresContext: false,
    handler: marginAttributes
  },
  'users get-user-tariff': {
    requiresContext: false,
    handler: userTariff
  },
  'marketdata get-candles': {
    requiresContext: false,
    handler: candles
  },
  'marketdata get-close-prices': {
    requiresContext: false,
    handler: closePrices
  },
  'instruments get-accrued-interests': {
    requiresContext: false,
    handler: accruedInterests
  },
  'instruments get-bond-coupons': {
    requiresContext: false,
    handler: bondCoupons
  },
  'instruments bond-by': {
    requiresContext: false,
    handler: bond
  },
  'instruments bonds': {
    requiresContext: false,
    handler: bonds
  },
  'instruments get-brand-by': {
    requiresContext: false,
    handler: brand
  },
  'instruments get-brands': {
    requiresContext: false,
    handler: brands
  },
  'instruments get-countries': {
    requiresContext: false,
    handler: countries
  },
  'instruments currencies': {
    requiresContext: false,
    handler: currencies
  },
  'instruments currency-by': {
    requiresContext: false,
    handler: currency
  },
  'instruments get-dividends': {
    requiresContext: false,
    handler: dividends
  },
  'instruments etf-by': {
    requiresContext: false,
    handler: etf
  },
  'instruments etfs': {
    requiresContext: false,
    handler: etfs
  },
  'instruments get-favorites': {
    requiresContext: false,
    handler: favorites
  },
  'instruments find-instrument': {
    requiresContext: false,
    handler: findInstrument
  },
  'instruments future-by': {
    requiresContext: false,
    handler: future
  },
  'instruments futures': {
    requiresContext: false,
    handler: futures
  },
  'instruments get-futures-margin': {
    requiresContext: false,
    handler: futuresMargin
  },
  'instruments get-instrument-by': {
    requiresContext: false,
    handler: instrument
  },
  'instruments share-by': {
    requiresContext: false,
    handler: share
  },
  'instruments shares': {
    requiresContext: false,
    handler: shares
  },
  'instruments trading-schedules': {
    requiresContext: false,
    handler: tradingSchedules
  },
  'marketdata get-last-prices': {
    requiresContext: false,
    handler: lastPrices
  },
  'marketdata get-last-trades': {
    requiresContext: false,
    handler: lastTrades
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
  'orders get-order-state': {
    requiresContext: false,
    handler: orderState
  },
  'operations get-operations': {
    requiresContext: false,
    handler: operations
  },
  'operations get-operations-by-cursor': {
    requiresContext: false,
    handler: operationsByCursor
  },
  'operations get-portfolio': {
    requiresContext: false,
    handler: portfolio
  },
  'operations get-positions': {
    requiresContext: false,
    handler: positions
  },
  'operations get-withdraw-limits': {
    requiresContext: false,
    handler: withdrawLimits
  },
  'stoporders get-stop-orders': {
    requiresContext: false,
    handler: stopOrders
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
