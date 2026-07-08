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

import { accountsCommand } from '../commands/accounts/cli';
import { accruedInterestsCommand } from '../commands/accrued-interests/cli';
import { assetCommand } from '../commands/asset/cli';
import { assetsCommand } from '../commands/assets/cli';
import { bondCommand } from '../commands/bond/cli';
import { brandCommand } from '../commands/brand/cli';
import { brandsCommand } from '../commands/brands/cli';
import { bondCouponsCommand } from '../commands/bond-coupons/cli';
import { bondsCommand } from '../commands/bonds/cli';
import { brokerReportCommand } from '../commands/broker-report/cli';
import { candlesCommand } from '../commands/candles/cli';
import { cancelOrderCommand } from '../commands/cancel-order/cli';
import { cancelStopOrderCommand } from '../commands/cancel-stop-order/cli';
import { closePricesCommand } from '../commands/close-prices/cli';
import { compileProtoCommand } from '../commands/compile-proto/cli';
import { countriesCommand } from '../commands/countries/cli';
import { currenciesCommand } from '../commands/currencies/cli';
import { currencyCommand } from '../commands/currency/cli';
import { dividendsForeignIssuerCommand } from '../commands/dividends-foreign-issuer/cli';
import { dividendsCommand } from '../commands/dividends/cli';
import { editFavoritesCommand } from '../commands/edit-favorites/cli';
import { etfCommand } from '../commands/etf/cli';
import { etfsCommand } from '../commands/etfs/cli';
import { favoritesCommand } from '../commands/favorites/cli';
import { findInstrumentCommand } from '../commands/find-instrument/cli';
import { futureCommand } from '../commands/future/cli';
import { futuresCommand } from '../commands/futures/cli';
import { futuresMarginCommand } from '../commands/futures-margin/cli';
import { helpCommand } from '../commands/help/cli';
import { instrumentCommand } from '../commands/instrument/cli';
import { lastPricesCommand } from '../commands/last-prices/cli';
import { lastTradesCommand } from '../commands/last-trades/cli';
import { marginAttributesCommand } from '../commands/margin-attributes/cli';
import { optionCommand } from '../commands/option/cli';
import { optionsByCommand } from '../commands/options-by/cli';
import { orderBookCommand } from '../commands/order-book/cli';
import { orderStateCommand } from '../commands/order-state/cli';
import { ordersCommand } from '../commands/orders/cli';
import { operationsByCursorCommand } from '../commands/operations-by-cursor/cli';
import { operationsCommand } from '../commands/operations/cli';
import { portfolioCommand } from '../commands/portfolio/cli';
import { postOrderCommand } from '../commands/post-order/cli';
import { postStopOrderCommand } from '../commands/post-stop-order/cli';
import { positionsCommand } from '../commands/positions/cli';
import { replaceOrderCommand } from '../commands/replace-order/cli';
import { sandboxAccountsCommand } from '../commands/sandbox-accounts/cli';
import { sandboxCancelOrderCommand } from '../commands/sandbox-cancel-order/cli';
import { sandboxCloseAccountCommand } from '../commands/sandbox-close-account/cli';
import { sandboxOperationsCommand } from '../commands/sandbox-operations/cli';
import { sandboxOperationsByCursorCommand } from '../commands/sandbox-operations-by-cursor/cli';
import { sandboxOpenAccountCommand } from '../commands/sandbox-open-account/cli';
import { sandboxOrdersCommand } from '../commands/sandbox-orders/cli';
import { sandboxOrderStateCommand } from '../commands/sandbox-order-state/cli';
import { sandboxPayInCommand } from '../commands/sandbox-pay-in/cli';
import { sandboxPortfolioCommand } from '../commands/sandbox-portfolio/cli';
import { sandboxPositionsCommand } from '../commands/sandbox-positions/cli';
import { sandboxPostOrderCommand } from '../commands/sandbox-post-order/cli';
import { sandboxReplaceOrderCommand } from '../commands/sandbox-replace-order/cli';
import { sandboxWithdrawLimitsCommand } from '../commands/sandbox-withdraw-limits/cli';
import { shareCommand } from '../commands/share/cli';
import { sharesCommand } from '../commands/shares/cli';
import { stopOrdersCommand } from '../commands/stop-orders/cli';
import { streamRunCommand } from '../commands/stream-run/cli';
import { tradingSchedulesCommand } from '../commands/trading-schedules/cli';
import { tradingStatusCommand } from '../commands/trading-status/cli';
import { tradingStatusesCommand } from '../commands/trading-statuses/cli';
import { userInfoCommand } from '../commands/user-info/cli';
import { userTariffCommand } from '../commands/user-tariff/cli';
import { versionCommand } from '../commands/version/cli';
import { withdrawLimitsCommand } from '../commands/withdraw-limits/cli';
import { command } from './contract';
import {
  isCommandName as isCommandLineCommandName,
  resolveCommand as resolveCommandLineCommand,
  type CommandDefinition,
  type OptionsSchema
} from 'icore';
import {
  commandPathAliases,
  commandNameToPath,
  commandPathToName
} from './domains';

type CliCommandOutput = string | AsyncIterable<string> | undefined;
type CliCommand = (args: readonly string[]) => CliCommandOutput | Promise<CliCommandOutput>;

export type ResolvedCommand = {
  name: CommandName;
  path: readonly string[];
  handler: CliCommand;
};

type RegisteredCommand = Omit<ResolvedCommand, 'name' | 'path'>;

/**
 * TODO: restore a literal command-name union after alias expansion preserves
 * tuple literal paths through `icore` registry construction.
 */
export type CommandName = string;

export function isCommandName(value: unknown): value is CommandName {
  return isCommandLineCommandName(commandLineRegistry, value);
}

function commandNameFromPositionals(positionals: readonly unknown[]): string {
  return positionals.length === 0
    ? '<empty>'
    : positionals.map((value) => String(value)).join(' ');
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
  const registeredCommand = resolvedCommand.command;

  if (!isCommandName(commandName)) {
    throw new Error(`'${commandName}' is not a program command`);
  }

  return {
    name: commandName,
    path: resolvedCommand.path,
    handler: registeredCommand.handler
  };
}

type CommandLineDefinition = CommandDefinition<
  OptionsSchema,
  undefined,
  CliCommandOutput,
  readonly [string, ...string[]]
> & RegisteredCommand;

const deprecatedFigiOptionCommandNames = new Set<string>(
  [
    'instrument get-accrued-interests',
    'instrument get-bond-coupons',
    'instrument get-dividends',
    'instrument edit-favorites',
    'instrument get-futures-margin',
    'operation list',
    'sandbox get-sandbox-operations'
  ].flatMap(commandNameAliases)
);

export function resolveCommandWarnings(
  commandName: CommandName,
  args: readonly string[]
): string[] {
  if (!deprecatedFigiOptionCommandNames.has(commandName) || !hasOption(args, 'figi')) {
    return [];
  }

  return [
    "Warning: '--figi' is deprecated for this command; use '--instrument-id' instead.\n"
  ];
}

export const commandLineCommands = command.registry(
  [
    ...defineCommandLineCommandAliases(accountsCommand),
    ...defineCommandLineCommandAliases(userInfoCommand),
    ...defineCommandLineCommandAliases(marginAttributesCommand),
    ...defineCommandLineCommandAliases(userTariffCommand),
    ...defineCommandLineCommandAliases(candlesCommand),
    ...defineCommandLineCommandAliases(ordersCommand),
    ...defineCommandLineCommandAliases(orderStateCommand),
    ...defineCommandLineCommandAliases(postOrderCommand),
    ...defineCommandLineCommandAliases(cancelOrderCommand),
    ...defineCommandLineCommandAliases(replaceOrderCommand),
    ...defineCommandLineCommandAliases(stopOrdersCommand),
    ...defineCommandLineCommandAliases(postStopOrderCommand),
    ...defineCommandLineCommandAliases(cancelStopOrderCommand),
    ...defineCommandLineCommandAliases(sandboxOpenAccountCommand),
    ...defineCommandLineCommandAliases(sandboxAccountsCommand),
    ...defineCommandLineCommandAliases(sandboxCloseAccountCommand),
    ...defineCommandLineCommandAliases(sandboxPostOrderCommand),
    ...defineCommandLineCommandAliases(sandboxReplaceOrderCommand),
    ...defineCommandLineCommandAliases(sandboxOrdersCommand),
    ...defineCommandLineCommandAliases(sandboxCancelOrderCommand),
    ...defineCommandLineCommandAliases(sandboxOrderStateCommand),
    ...defineCommandLineCommandAliases(sandboxPositionsCommand),
    ...defineCommandLineCommandAliases(sandboxOperationsCommand),
    ...defineCommandLineCommandAliases(sandboxOperationsByCursorCommand),
    ...defineCommandLineCommandAliases(sandboxPortfolioCommand),
    ...defineCommandLineCommandAliases(sandboxPayInCommand),
    ...defineCommandLineCommandAliases(sandboxWithdrawLimitsCommand),
    ...defineCommandLineCommandAliases(closePricesCommand),
    ...defineCommandLineCommandAliases(lastPricesCommand),
    ...defineCommandLineCommandAliases(lastTradesCommand),
    ...defineCommandLineCommandAliases(orderBookCommand),
    ...defineCommandLineCommandAliases(tradingStatusCommand),
    ...defineCommandLineCommandAliases(tradingStatusesCommand),
    ...defineCommandLineCommandAliases(operationsCommand),
    ...defineCommandLineCommandAliases(operationsByCursorCommand),
    ...defineCommandLineCommandAliases(brokerReportCommand),
    ...defineCommandLineCommandAliases(dividendsForeignIssuerCommand),
    ...defineCommandLineCommandAliases(portfolioCommand),
    ...defineCommandLineCommandAliases(positionsCommand),
    ...defineCommandLineCommandAliases(withdrawLimitsCommand),
    ...defineCommandLineCommandAliases(brandsCommand),
    ...defineCommandLineCommandAliases(countriesCommand),
    ...defineCommandLineCommandAliases(currenciesCommand),
    ...defineCommandLineCommandAliases(bondsCommand),
    ...defineCommandLineCommandAliases(etfsCommand),
    ...defineCommandLineCommandAliases(futuresCommand),
    ...defineCommandLineCommandAliases(sharesCommand),
    ...defineCommandLineCommandAliases(bondCommand),
    ...defineCommandLineCommandAliases(etfCommand),
    ...defineCommandLineCommandAliases(futureCommand),
    ...defineCommandLineCommandAliases(shareCommand),
    ...defineCommandLineCommandAliases(assetCommand),
    ...defineCommandLineCommandAliases(brandCommand),
    ...defineCommandLineCommandAliases(currencyCommand),
    ...defineCommandLineCommandAliases(instrumentCommand),
    ...defineCommandLineCommandAliases(optionCommand),
    ...defineCommandLineCommandAliases(assetsCommand),
    ...defineCommandLineCommandAliases(favoritesCommand),
    ...defineCommandLineCommandAliases(editFavoritesCommand),
    ...defineCommandLineCommandAliases(findInstrumentCommand),
    ...defineCommandLineCommandAliases(futuresMarginCommand),
    ...defineCommandLineCommandAliases(optionsByCommand),
    ...defineCommandLineCommandAliases(accruedInterestsCommand),
    ...defineCommandLineCommandAliases(bondCouponsCommand),
    ...defineCommandLineCommandAliases(dividendsCommand),
    ...defineCommandLineCommandAliases(tradingSchedulesCommand),
    ...defineCommandLineCommandAliases(streamRunCommand),
    ...defineCommandLineCommandAliases(compileProtoCommand),
    defineCommandLineCommand(helpCommand),
    defineCommandLineCommand(versionCommand)
  ]
);
const commandLineRegistry = commandLineCommands.registry;

export const commandNames = commandLineCommands.names;

function commandNameAliases(commandName: string): string[] {
  return commandPathAliases(commandNameToPath(commandName)).map(commandPathToName);
}

function defineCommandLineCommandAliases<const TSchema extends OptionsSchema>(
  definition: CommandDefinition<
    TSchema,
    undefined,
    CliCommandOutput,
    readonly [string, ...string[]]
  >
): CommandLineDefinition[] {
  return commandPathAliases(definition.path).map((path) => defineCommandLineCommand({
    ...definition,
    path
  }));
}

function defineCommandLineCommand<const TSchema extends OptionsSchema>(
  definition: CommandDefinition<
    TSchema,
    undefined,
    CliCommandOutput,
    readonly [string, ...string[]]
  >
): CommandLineDefinition {
  return {
    ...definition,
    handler(args) {
      // Resolved commands are still executed from raw CLI args, so `icore`
      // remains the single owner of path, extra positional, and option parsing.
      return command.run(definition, args, undefined);
    }
  };
}

function hasOption(args: readonly string[], name: string): boolean {
  const optionName = `--${name}`;

  return args.some((arg) => arg === optionName || arg.startsWith(`${optionName}=`));
}
