/**
 * Модуль реестра команд связывает имя CLI-команды с ее handler.
 *
 * Здесь допустимы:
 * - декларативное описание доступных CLI-команд;
 * - валидация имени команды из positionals;
 * - возврат canonical и matched path metadata для bootstrap CLI;
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
import type { CommandPath } from 'icore';
import { commandPathAliases } from './domains';

type CliCommandDefinition = ReturnType<typeof command.define>;
type CliCommandDefinitionPath = Pick<CliCommandDefinition, 'path'>;

type WithCompatibilityAliases<TDefinition> = Omit<TDefinition, 'aliases'> & {
  aliases: readonly CommandPath[];
};

const deprecatedFigiOptionCommandNames = new Set<string>(
  [
    'instrument bond accrued',
    'instrument bond coupons',
    'instrument dividends',
    'instrument favorite edit',
    'instrument future margin',
    'operation list',
    'sandbox operation list'
  ]
);

export function resolveCommandWarnings(
  commandName: string,
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
    defineCommandLineCommand(accountsCommand),
    defineCommandLineCommand(userInfoCommand),
    defineCommandLineCommand(marginAttributesCommand),
    defineCommandLineCommand(userTariffCommand),
    defineCommandLineCommand(candlesCommand),
    defineCommandLineCommand(ordersCommand),
    defineCommandLineCommand(orderStateCommand),
    defineCommandLineCommand(postOrderCommand),
    defineCommandLineCommand(cancelOrderCommand),
    defineCommandLineCommand(replaceOrderCommand),
    defineCommandLineCommand(stopOrdersCommand),
    defineCommandLineCommand(postStopOrderCommand),
    defineCommandLineCommand(cancelStopOrderCommand),
    defineCommandLineCommand(sandboxOpenAccountCommand),
    defineCommandLineCommand(sandboxAccountsCommand),
    defineCommandLineCommand(sandboxCloseAccountCommand),
    defineCommandLineCommand(sandboxPostOrderCommand),
    defineCommandLineCommand(sandboxReplaceOrderCommand),
    defineCommandLineCommand(sandboxOrdersCommand),
    defineCommandLineCommand(sandboxCancelOrderCommand),
    defineCommandLineCommand(sandboxOrderStateCommand),
    defineCommandLineCommand(sandboxPositionsCommand),
    defineCommandLineCommand(sandboxOperationsCommand),
    defineCommandLineCommand(sandboxOperationsByCursorCommand),
    defineCommandLineCommand(sandboxPortfolioCommand),
    defineCommandLineCommand(sandboxPayInCommand),
    defineCommandLineCommand(sandboxWithdrawLimitsCommand),
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
    defineCommandLineCommand(editFavoritesCommand),
    defineCommandLineCommand(findInstrumentCommand),
    defineCommandLineCommand(futuresMarginCommand),
    defineCommandLineCommand(optionsByCommand),
    defineCommandLineCommand(accruedInterestsCommand),
    defineCommandLineCommand(bondCouponsCommand),
    defineCommandLineCommand(dividendsCommand),
    defineCommandLineCommand(tradingSchedulesCommand),
    defineCommandLineCommand(streamRunCommand),
    defineCommandLineCommand(compileProtoCommand),
    defineCommandLineCommand(helpCommand),
    defineCommandLineCommand(versionCommand)
  ]
);

function defineCommandLineCommand<
  const TDefinition extends CliCommandDefinitionPath
>(
  definition: TDefinition
): WithCompatibilityAliases<TDefinition> {
  const [, ...aliases] = commandPathAliases(definition.path);

  return {
    ...definition,
    aliases
  };
}

function hasOption(args: readonly string[], name: string): boolean {
  const optionName = `--${name}`;

  return args.some((arg) => arg === optionName || arg.startsWith(`${optionName}=`));
}
