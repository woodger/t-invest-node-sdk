/**
 * Модуль реестра команд связывает имя CLI-команды с ее handler.
 *
 * Здесь допустимы:
 * - декларативное описание доступных CLI-команд;
 * - валидация имени команды из positionals;
 * - возврат handler metadata для bootstrap CLI;
 *
 * Здесь не должно быть исполнения команд, разбора raw argv или форматирования help/version output.
 */

import { accountsCommand } from './commands/accounts/cli';
import { accruedInterestsCommand } from './commands/accrued-interests/cli';
import { assetCommand } from './commands/asset/cli';
import { assetsCommand } from './commands/assets/cli';
import { bondCommand } from './commands/bond/cli';
import { brandCommand } from './commands/brand/cli';
import { brandsCommand } from './commands/brands/cli';
import { bondCouponsCommand } from './commands/bond-coupons/cli';
import { bondsCommand } from './commands/bonds/cli';
import { brokerReportCommand } from './commands/broker-report/cli';
import { candlesCommand } from './commands/candles/cli';
import { closePricesCommand } from './commands/close-prices/cli';
import { countriesCommand } from './commands/countries/cli';
import { currenciesCommand } from './commands/currencies/cli';
import { currencyCommand } from './commands/currency/cli';
import { dividendsForeignIssuerCommand } from './commands/dividends-foreign-issuer/cli';
import { dividendsCommand } from './commands/dividends/cli';
import { etfCommand } from './commands/etf/cli';
import { etfsCommand } from './commands/etfs/cli';
import { favoritesCommand } from './commands/favorites/cli';
import { findInstrumentCommand } from './commands/find-instrument/cli';
import { futureCommand } from './commands/future/cli';
import { futuresCommand } from './commands/futures/cli';
import { futuresMarginCommand } from './commands/futures-margin/cli';
import { helpCommand } from './commands/help/cli';
import { instrumentCommand } from './commands/instrument/cli';
import { lastPricesCommand } from './commands/last-prices/cli';
import { lastTradesCommand } from './commands/last-trades/cli';
import { marginAttributesCommand } from './commands/margin-attributes/cli';
import { optionCommand } from './commands/option/cli';
import { optionsByCommand } from './commands/options-by/cli';
import { orderBookCommand } from './commands/order-book/cli';
import { orderStateCommand } from './commands/order-state/cli';
import { ordersCommand } from './commands/orders/cli';
import { operationsByCursorCommand } from './commands/operations-by-cursor/cli';
import { operationsCommand } from './commands/operations/cli';
import { portfolioCommand } from './commands/portfolio/cli';
import { positionsCommand } from './commands/positions/cli';
import { shareCommand } from './commands/share/cli';
import { sharesCommand } from './commands/shares/cli';
import { stopOrdersCommand } from './commands/stop-orders/cli';
import { tradingSchedulesCommand } from './commands/trading-schedules/cli';
import { tradingStatusCommand } from './commands/trading-status/cli';
import { tradingStatusesCommand } from './commands/trading-statuses/cli';
import { userInfoCommand } from './commands/user-info/cli';
import { userTariffCommand } from './commands/user-tariff/cli';
import { versionCommand } from './commands/version/cli';
import { withdrawLimitsCommand } from './commands/withdraw-limits/cli';
import {
  defineCommandRegistry,
  isCommandName as isCommandLineCommandName,
  resolveCommand as resolveCommandLineCommand,
  runCommand,
  type CommandDefinition,
  type OptionsSchema
} from 'icore';

type CliCommandOutput = string | undefined;
type CliCommand = (args: readonly string[]) => CliCommandOutput | Promise<CliCommandOutput>;

export type ResolvedCommand = {
  name: CommandName;
  path: readonly string[];
  handler: CliCommand;
};

type RegisteredCommand = Omit<ResolvedCommand, 'name' | 'path'>;

type UsersCommandName =
  | 'users get-accounts'
  | 'users get-info'
  | 'users get-margin-attributes'
  | 'users get-user-tariff';

type OrdersCommandName =
  | 'orders get-orders'
  | 'orders get-order-state';

type StopOrdersCommandName = 'stoporders get-stop-orders';

type MarketDataCommandName =
  | 'marketdata get-candles'
  | 'marketdata get-close-prices'
  | 'marketdata get-last-prices'
  | 'marketdata get-last-trades'
  | 'marketdata get-order-book'
  | 'marketdata get-trading-status'
  | 'marketdata get-trading-statuses';

type OperationsCommandName =
  | 'operations get-operations'
  | 'operations get-operations-by-cursor'
  | 'operations get-broker-report'
  | 'operations get-dividends-foreign-issuer'
  | 'operations get-portfolio'
  | 'operations get-positions'
  | 'operations get-withdraw-limits';

type InstrumentsCommandLineName =
  | 'instruments get-accrued-interests'
  | 'instruments get-assets'
  | 'instruments get-asset-by'
  | 'instruments get-brand-by'
  | 'instruments get-bond-coupons'
  | 'instruments bond-by'
  | 'instruments bonds'
  | 'instruments currency-by'
  | 'instruments get-dividends'
  | 'instruments etf-by'
  | 'instruments etfs'
  | 'instruments future-by'
  | 'instruments futures'
  | 'instruments get-favorites'
  | 'instruments find-instrument'
  | 'instruments get-brands'
  | 'instruments get-countries'
  | 'instruments get-futures-margin'
  | 'instruments get-instrument-by'
  | 'instruments currencies'
  | 'instruments option-by'
  | 'instruments options-by'
  | 'instruments share-by'
  | 'instruments shares'
  | 'instruments trading-schedules';

export type CommandName =
  | UsersCommandName
  | OrdersCommandName
  | StopOrdersCommandName
  | MarketDataCommandName
  | OperationsCommandName
  | InstrumentsCommandLineName
  | 'help'
  | 'version';

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
    handler: command.handler
  };
}

type CommandLineDefinition = CommandDefinition<
  OptionsSchema,
  undefined,
  CliCommandOutput,
  readonly [string, ...string[]]
> & RegisteredCommand;

const commandLineRegistry = defineCommandRegistry(
  [
    defineCommandLineCommand(accountsCommand),
    defineCommandLineCommand(userInfoCommand),
    defineCommandLineCommand(marginAttributesCommand),
    defineCommandLineCommand(userTariffCommand),
    defineCommandLineCommand(candlesCommand),
    defineCommandLineCommand(ordersCommand),
    defineCommandLineCommand(orderStateCommand),
    defineCommandLineCommand(stopOrdersCommand),
    defineCommandLineCommand(closePricesCommand),
    defineCommandLineCommand(lastPricesCommand),
    defineCommandLineCommand(lastTradesCommand),
    defineCommandLineCommand(orderBookCommand),
    defineCommandLineCommand(tradingStatusCommand),
    defineCommandLineCommand(tradingStatusesCommand),
    defineCommandLineCommand(operationsCommand),
    defineCommandLineCommand(operationsByCursorCommand),
    defineCommandLineCommand(brokerReportCommand),
    defineCommandLineCommand(dividendsForeignIssuerCommand),
    defineCommandLineCommand(portfolioCommand),
    defineCommandLineCommand(positionsCommand),
    defineCommandLineCommand(withdrawLimitsCommand),
    defineCommandLineCommand(brandsCommand),
    defineCommandLineCommand(countriesCommand),
    defineCommandLineCommand(currenciesCommand),
    defineCommandLineCommand(bondsCommand),
    defineCommandLineCommand(etfsCommand),
    defineCommandLineCommand(futuresCommand),
    defineCommandLineCommand(sharesCommand),
    defineCommandLineCommand(bondCommand),
    defineCommandLineCommand(etfCommand),
    defineCommandLineCommand(futureCommand),
    defineCommandLineCommand(shareCommand),
    defineCommandLineCommand(assetCommand),
    defineCommandLineCommand(brandCommand),
    defineCommandLineCommand(currencyCommand),
    defineCommandLineCommand(instrumentCommand),
    defineCommandLineCommand(optionCommand),
    defineCommandLineCommand(assetsCommand),
    defineCommandLineCommand(favoritesCommand),
    defineCommandLineCommand(findInstrumentCommand),
    defineCommandLineCommand(futuresMarginCommand),
    defineCommandLineCommand(optionsByCommand),
    defineCommandLineCommand(accruedInterestsCommand),
    defineCommandLineCommand(bondCouponsCommand),
    defineCommandLineCommand(dividendsCommand),
    defineCommandLineCommand(tradingSchedulesCommand),
    defineCommandLineCommand(helpCommand),
    defineCommandLineCommand(versionCommand)
  ]
);

function defineCommandLineCommand<const TSchema extends OptionsSchema>(
  command: CommandDefinition<
    TSchema,
    undefined,
    CliCommandOutput,
    readonly [string, ...string[]]
  >
): CommandLineDefinition {
  return {
    ...command,
    handler(args) {
      // Resolved commands are still executed from raw CLI args, so `icore`
      // remains the single owner of path, extra positional, and option parsing.
      return runCommand(command, args, undefined);
    }
  };
}
