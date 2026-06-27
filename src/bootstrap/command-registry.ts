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

import { accountsCommand } from './commands/accounts/cli';
import { accruedInterests } from './commands/accrued-interests/cli';
import { asset } from './commands/asset/cli';
import { assets } from './commands/assets/cli';
import { bond } from './commands/bond/cli';
import { brand } from './commands/brand/cli';
import { brands } from './commands/brands/cli';
import { bondCoupons } from './commands/bond-coupons/cli';
import { bonds } from './commands/bonds/cli';
import { brokerReport } from './commands/broker-report/cli';
import { candles } from './commands/candles/cli';
import { closePrices } from './commands/close-prices/cli';
import { countries } from './commands/countries/cli';
import { currencies } from './commands/currencies/cli';
import { currency } from './commands/currency/cli';
import { dividendsForeignIssuer } from './commands/dividends-foreign-issuer/cli';
import { dividends } from './commands/dividends/cli';
import { etf } from './commands/etf/cli';
import { etfs } from './commands/etfs/cli';
import { favorites } from './commands/favorites/cli';
import { findInstrument } from './commands/find-instrument/cli';
import { future } from './commands/future/cli';
import { futures } from './commands/futures/cli';
import { futuresMargin } from './commands/futures-margin/cli';
import { helpCommand } from './commands/help/cli';
import { instrument } from './commands/instrument/cli';
import { lastPrices } from './commands/last-prices/cli';
import { lastTrades } from './commands/last-trades/cli';
import { marginAttributesCommand } from './commands/margin-attributes/cli';
import { option } from './commands/option/cli';
import { optionsBy } from './commands/options-by/cli';
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
import { userInfoCommand } from './commands/user-info/cli';
import { userTariffCommand } from './commands/user-tariff/cli';
import { versionCommand } from './commands/version/cli';
import { withdrawLimits } from './commands/withdraw-limits/cli';
import {
  defineCommandRegistry,
  isCommandName as isCommandLineCommandName,
  resolveCommand as resolveCommandLineCommand,
  runCommand,
  type CommandDefinition,
  type OptionsSchema
} from 'icore';
import type { CliArgs, CliCommand, CliCommandOutput } from './cli-contract';

export type ResolvedCommand = {
  name: CommandName;
  path: readonly string[];
  requiresContext: boolean;
  handler: CliCommand;
};

type RegisteredCommand = Omit<ResolvedCommand, 'name' | 'path'>;

const commandRegistry = {
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
  'instruments get-asset-by': {
    requiresContext: false,
    handler: asset
  },
  'instruments get-assets': {
    requiresContext: false,
    handler: assets
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
  'instruments option-by': {
    requiresContext: false,
    handler: option
  },
  'instruments options-by': {
    requiresContext: false,
    handler: optionsBy
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
  'operations get-broker-report': {
    requiresContext: false,
    handler: brokerReport
  },
  'operations get-dividends-foreign-issuer': {
    requiresContext: false,
    handler: dividendsForeignIssuer
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
  }
} as const satisfies Record<string, RegisteredCommand>;

type UsersCommandName =
  | 'users get-accounts'
  | 'users get-info'
  | 'users get-margin-attributes'
  | 'users get-user-tariff';

export type CommandName = keyof typeof commandRegistry | UsersCommandName | 'help' | 'version';

export function isCommandName(value: unknown): value is CommandName {
  return isCommandLineCommandName(commandLineRegistry, value);
}

function commandNameFromPositionals(positionals: readonly unknown[]): string {
  const [serviceOrCommand, method] = positionals;

  if (serviceOrCommand === 'help' || serviceOrCommand === 'version') {
    return serviceOrCommand;
  }

  return `${String(serviceOrCommand)} ${String(method)}`;
}

export function resolveCommand(positionals: readonly unknown[]): ResolvedCommand {
  let resolvedCommand;

  try {
    resolvedCommand = resolveCommandLineCommand(
      commandLineRegistry,
      positionals.map((value) => String(value))
    );
  }
  catch {
    const commandName = commandNameFromPositionals(positionals);

    throw new Error(`'${commandName}' is not a program command`);
  }

  const commandName = resolvedCommand.name;
  const command = resolvedCommand.command;

  if (!isCommandName(commandName)) {
    throw new Error(`'${commandName}' is not a program command`);
  }

  return {
    name: commandName,
    path: resolvedCommand.path,
    requiresContext: command.requiresContext,
    handler: command.handler
  };
}

type LegacyCliCommandDefinition = CommandDefinition<
  Record<never, never>,
  CliArgs,
  CliCommandOutput,
  [string, ...string[]]
> & RegisteredCommand;

type CommandLineDefinition = CommandDefinition<
  OptionsSchema,
  undefined,
  CliCommandOutput,
  readonly [string, ...string[]]
> & RegisteredCommand;

const commandLineRegistry = defineCommandRegistry(
  [
    ...Object.entries(commandRegistry).map(([name, command]) => defineLegacyCliCommand(name, command)),
    defineCommandLineCommand(accountsCommand, {
      requiresContext: false
    }),
    defineCommandLineCommand(userInfoCommand, {
      requiresContext: false
    }),
    defineCommandLineCommand(marginAttributesCommand, {
      requiresContext: false
    }),
    defineCommandLineCommand(userTariffCommand, {
      requiresContext: false
    }),
    defineCommandLineCommand(helpCommand, {
      requiresContext: false
    }),
    defineCommandLineCommand(versionCommand, {
      requiresContext: false
    })
  ]
);

function defineLegacyCliCommand(
  name: string,
  command: RegisteredCommand
): LegacyCliCommandDefinition {
  return {
    path: commandPathFromName(name),
    options: {},
    allowExtraPositionals: true,
    requiresContext: command.requiresContext,
    handler: command.handler,
    handle({ context, positionals }) {
      return command.handler({
        ...context,
        _: [
          name,
          ...positionals
        ]
      });
    }
  };
}

function defineCommandLineCommand<const TSchema extends OptionsSchema>(
  command: CommandDefinition<
    TSchema,
    undefined,
    CliCommandOutput,
    readonly [string, ...string[]]
  >,
  metadata: Pick<RegisteredCommand, 'requiresContext'>
): CommandLineDefinition {
  return {
    ...command,
    requiresContext: metadata.requiresContext,
    handler(argv) {
      return runCommand(command, commandArgsFromCliArgs(command.path, argv), undefined);
    }
  };
}

function commandArgsFromCliArgs(path: readonly string[], argv: CliArgs): string[] {
  const positionals = argv._[0] === path.join(' ')
    ? argv._.slice(1)
    : argv._.slice(path.length);
  const args = [
    ...path,
    ...positionals
  ];

  for (const name of Object.keys(argv)) {
    if (name === '_') {
      continue;
    }

    const value = argv[name];

    if (value === undefined || value === false) {
      continue;
    }

    if (value === true) {
      args.push(`--${name}`);
      continue;
    }

    if (typeof value !== 'string') {
      throw new Error(`Expected '--${name}' as scalar option`);
    }

    args.push(`--${name}=${value}`);
  }

  return args;
}

function commandPathFromName(name: string): [string, ...string[]] {
  const [first, ...rest] = name.split(' ');

  if (first === undefined || first === '') {
    throw new Error('Expected command name to be non-empty');
  }

  return [first, ...rest];
}
