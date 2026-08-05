/**
 * Модуль CLI help хранит декларативное описание команд и рендерит справку.
 *
 * Здесь допустимы:
 * - описание доступных bootstrap-команд;
 * - централизация usage и examples;
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

export interface CommandHelp {
  description: string;
  sdkCall?: string;
  grpcMethod?: string;
  usage: readonly string[];
  required?: readonly string[];
  optional?: readonly string[];
  environment?: readonly string[];
  examples: readonly string[];
  notes?: readonly string[];
}

const sdkConnectionOptions = [
  '--token=TOKEN          OAuth token, overrides T_INVEST_TOKEN',
  '--endpoint=HOST:PORT   gRPC endpoint, overrides T_INVEST_ENDPOINT',
  '--app-name=NAME        Optional x-app-name metadata value',
  '--insecure             Disable TLS for local or test endpoints'
] as const;

const sdkEnvironment = [
  'T_INVEST_TOKEN',
  'T_INVEST_ENDPOINT'
] as const;

const tableFormatOption = '--format=json|table    Output format (default: table)';
const csvFormatOption = '--format=json|csv      Output format (default: json)';
const jsonlFormatOption = '--format=jsonl         Output format (default: jsonl)';

export const commandHelp = {
  'account list': {
    description: 'Print user accounts',
    sdkCall: 'sdk.users.getAccounts',
    grpcMethod: 'UsersService/GetAccounts',
    usage: [
      't-invest-node-sdk account list [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk account list --format=json'
    ]
  },
  'account info': {
    description: 'Print user info',
    sdkCall: 'sdk.users.getInfo',
    grpcMethod: 'UsersService/GetInfo',
    usage: [
      't-invest-node-sdk account info [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk account info',
      't-invest-node-sdk account info --format=json'
    ]
  },
  'account margin': {
    description: 'Print account margin attributes',
    sdkCall: 'sdk.users.getMarginAttributes',
    grpcMethod: 'UsersService/GetMarginAttributes',
    usage: [
      't-invest-node-sdk account margin --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk account margin --account-id=2000000000',
      't-invest-node-sdk account margin --account-id=2000000000 --format=json'
    ]
  },
  'account tariff': {
    description: 'Print user API limits',
    sdkCall: 'sdk.users.getUserTariff',
    grpcMethod: 'UsersService/GetUserTariff',
    usage: [
      't-invest-node-sdk account tariff [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk account tariff',
      't-invest-node-sdk account tariff --format=json'
    ]
  },
  'market candles': {
    description: 'Print historical candles',
    sdkCall: 'sdk.marketdata.getCandles',
    grpcMethod: 'MarketDataService/GetCandles',
    usage: [
      't-invest-node-sdk market candles --instrument-id=ID --from=ISO --to=ISO --interval=INTERVAL [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive',
      '--interval=INTERVAL    1min|2min|3min|5min|10min|15min|30min|hour|2hour|4hour|day|week|month'
    ],
    optional: [
      ...sdkConnectionOptions,
      csvFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market candles --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T00:00:00Z --to=2026-06-19T01:00:00Z --interval=1min --format=csv'
    ],
    notes: [
      'Use --format=csv when candle rows are consumed by spreadsheets or batch tools.',
      'The CLI accepts interval aliases, but provider history depth and request window limits still apply.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'market close-prices': {
    description: 'Print close prices',
    sdkCall: 'sdk.marketdata.getClosePrices',
    grpcMethod: 'MarketDataService/GetClosePrices',
    usage: [
      't-invest-node-sdk market close-prices --instrument-id=ID[,ID] [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] FIGI or instrument UID list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market close-prices --instrument-id=BBG00QPYJ5H0',
      't-invest-node-sdk market close-prices --instrument-id=BBG00QPYJ5H0,instrument-uid --format=json'
    ]
  },
  'instrument search': {
    description: 'Search instruments',
    sdkCall: 'sdk.instruments.findInstrument',
    grpcMethod: 'InstrumentsService/FindInstrument',
    usage: [
      't-invest-node-sdk instrument search --query=TEXT [options]'
    ],
    required: [
      '--query=TEXT          Search query'
    ],
    optional: [
      '--instrument-kind=KIND unspecified|bond|share|currency|etf|futures|sp|option|clearing-certificate',
      '--api-trade-available Only instrument available for API trading',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument search --query=TCSG',
      't-invest-node-sdk instrument search --query=TCSG --instrument-kind=share --api-trade-available --format=json'
    ]
  },
  'instrument show': {
    description: 'Print instrument details',
    sdkCall: 'sdk.instruments.getInstrumentBy',
    grpcMethod: 'InstrumentsService/GetInstrumentBy',
    usage: [
      't-invest-node-sdk instrument show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument show --id=BBG00QPYJ5H0 --id-type=figi',
      't-invest-node-sdk instrument show --id=TCSG --id-type=ticker --class-code=TQBR --format=json'
    ]
  },
  'instrument dividends': {
    description: 'Print instrument dividends',
    sdkCall: 'sdk.instruments.getDividends',
    grpcMethod: 'InstrumentsService/GetDividends',
    usage: [
      't-invest-node-sdk instrument dividends --instrument-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--instrument-id=ID    Share instrument identifier',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--figi=FIGI            Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument dividends --instrument-id=SHARE-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z',
      't-invest-node-sdk instrument dividends --instrument-id=SHARE-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z --format=json'
    ],
    notes: [
      "Deprecated --figi is still accepted and prints a warning to stderr.",
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instrument schedules': {
    description: 'Print trading schedules',
    sdkCall: 'sdk.instruments.tradingSchedules',
    grpcMethod: 'InstrumentsService/TradingSchedules',
    usage: [
      't-invest-node-sdk instrument schedules --from=ISO --to=ISO [options]'
    ],
    required: [
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--exchange=EXCHANGE    Optional exchange or settlement calendar code',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument schedules --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z',
      't-invest-node-sdk instrument schedules --exchange=MOEX --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instrument favorite list': {
    description: 'Print favorite instruments',
    sdkCall: 'sdk.instruments.getFavorites',
    grpcMethod: 'InstrumentsService/GetFavorites',
    usage: [
      't-invest-node-sdk instrument favorite list [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument favorite list',
      't-invest-node-sdk instrument favorite list --format=json'
    ]
  },
  'instrument favorite edit': {
    description: 'Add or remove favorite instruments',
    sdkCall: 'sdk.instruments.editFavorites',
    grpcMethod: 'InstrumentsService/EditFavorites',
    usage: [
      't-invest-node-sdk instrument favorite edit --instrument-id=ID[,ID] --action=add|del --confirm [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] Comma-separated instrument identifiers',
      '--action=ACTION       add|del',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      '--figi=FIGI[,FIGI]    Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument favorite edit --instrument-id=BBG00QPYJ5H0 --action=add --confirm',
      't-invest-node-sdk instrument favorite edit --instrument-id=BBG00QPYJ5H0,BBG004730N88 --action=del --confirm --format=json'
    ],
    notes: [
      'Deprecated --figi is still accepted and prints a warning to stderr.',
      'This command changes account favorites and refuses to run without --confirm by default CLI policy.'
    ]
  },
  'instrument share list': {
    description: 'Print shares',
    sdkCall: 'sdk.instruments.shares',
    grpcMethod: 'InstrumentsService/Shares',
    usage: [
      't-invest-node-sdk instrument share list [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument share list',
      't-invest-node-sdk instrument share list --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument share show': {
    description: 'Print share details',
    sdkCall: 'sdk.instruments.shareBy',
    grpcMethod: 'InstrumentsService/ShareBy',
    usage: [
      't-invest-node-sdk instrument share show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument share show --id=BBG004730N88 --id-type=figi',
      't-invest-node-sdk instrument share show --id=SBER --id-type=ticker --class-code=TQBR --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument bond list': {
    description: 'Print bonds',
    sdkCall: 'sdk.instruments.bonds',
    grpcMethod: 'InstrumentsService/Bonds',
    usage: [
      't-invest-node-sdk instrument bond list [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument bond list',
      't-invest-node-sdk instrument bond list --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and placement values out of columns; use --format=json for the full report.'
    ]
  },
  'instrument bond show': {
    description: 'Print bond details',
    sdkCall: 'sdk.instruments.bondBy',
    grpcMethod: 'InstrumentsService/BondBy',
    usage: [
      't-invest-node-sdk instrument bond show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument bond show --id=BBG00B9XRY4J --id-type=figi',
      't-invest-node-sdk instrument bond show --id=SU26238RMFS4 --id-type=ticker --class-code=TQOB --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and placement values out of columns; use --format=json for the full report.'
    ]
  },
  'instrument bond coupons': {
    description: 'Print bond coupons',
    sdkCall: 'sdk.instruments.getBondCoupons',
    grpcMethod: 'InstrumentsService/GetBondCoupons',
    usage: [
      't-invest-node-sdk instrument bond coupons --instrument-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--instrument-id=ID    Bond instrument identifier',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--figi=FIGI            Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument bond coupons --instrument-id=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z',
      't-invest-node-sdk instrument bond coupons --instrument-id=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z --format=json'
    ],
    notes: [
      "Deprecated --figi is still accepted and prints a warning to stderr.",
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instrument bond accrued': {
    description: 'Print bond accrued interests',
    sdkCall: 'sdk.instruments.getAccruedInterests',
    grpcMethod: 'InstrumentsService/GetAccruedInterests',
    usage: [
      't-invest-node-sdk instrument bond accrued --instrument-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--instrument-id=ID    Bond instrument identifier',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--figi=FIGI            Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument bond accrued --instrument-id=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z',
      't-invest-node-sdk instrument bond accrued --instrument-id=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z --format=json'
    ],
    notes: [
      "Deprecated --figi is still accepted and prints a warning to stderr.",
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instrument etf list': {
    description: 'Print ETFs',
    sdkCall: 'sdk.instruments.etfs',
    grpcMethod: 'InstrumentsService/Etfs',
    usage: [
      't-invest-node-sdk instrument etf list [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument etf list',
      't-invest-node-sdk instrument etf list --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates, fund metadata and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument etf show': {
    description: 'Print ETF details',
    sdkCall: 'sdk.instruments.etfBy',
    grpcMethod: 'InstrumentsService/EtfBy',
    usage: [
      't-invest-node-sdk instrument etf show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument etf show --id=BBG333333333 --id-type=figi',
      't-invest-node-sdk instrument etf show --id=TMOS --id-type=ticker --class-code=TQTF --format=json'
    ],
    notes: [
      'Table output keeps risk rates, fund metadata and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument currency list': {
    description: 'Print currencies',
    sdkCall: 'sdk.instruments.currencies',
    grpcMethod: 'InstrumentsService/Currencies',
    usage: [
      't-invest-node-sdk instrument currency list [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument currency list',
      't-invest-node-sdk instrument currency list --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument currency show': {
    description: 'Print currency details',
    sdkCall: 'sdk.instruments.currencyBy',
    grpcMethod: 'InstrumentsService/CurrencyBy',
    usage: [
      't-invest-node-sdk instrument currency show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument currency show --id=BBG0013HGFT4 --id-type=figi',
      't-invest-node-sdk instrument currency show --id=USD000UTSTOM --id-type=ticker --class-code=CETS --format=json'
    ],
    notes: [
      'Table output keeps risk rates and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument future list': {
    description: 'Print futures contracts',
    sdkCall: 'sdk.instruments.futures',
    grpcMethod: 'InstrumentsService/Futures',
    usage: [
      't-invest-node-sdk instrument future list [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument future list',
      't-invest-node-sdk instrument future list --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps margin rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument future show': {
    description: 'Print futures contract details',
    sdkCall: 'sdk.instruments.futureBy',
    grpcMethod: 'InstrumentsService/FutureBy',
    usage: [
      't-invest-node-sdk instrument future show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument future show --id=FUTFIGI --id-type=figi',
      't-invest-node-sdk instrument future show --id=SiM6 --id-type=ticker --class-code=SPBFUT --format=json'
    ],
    notes: [
      'Table output keeps margin rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument future margin': {
    description: 'Print futures margin details',
    sdkCall: 'sdk.instruments.getFuturesMargin',
    grpcMethod: 'InstrumentsService/GetFuturesMargin',
    usage: [
      't-invest-node-sdk instrument future margin --instrument-id=ID [options]'
    ],
    required: [
      '--instrument-id=ID    Futures instrument identifier'
    ],
    optional: [
      '--figi=FIGI            Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument future margin --instrument-id=FUTFIGI',
      't-invest-node-sdk instrument future margin --instrument-id=FUTFIGI --format=json'
    ],
    notes: [
      'Deprecated --figi is still accepted and prints a warning to stderr.'
    ]
  },
  'instrument option list': {
    description: 'Print option contracts by underlying asset',
    sdkCall: 'sdk.instruments.optionsBy',
    grpcMethod: 'InstrumentsService/OptionsBy',
    usage: [
      't-invest-node-sdk instrument option list --basic-asset-uid=UID [options]'
    ],
    required: [
      '--basic-asset-uid=UID Underlying asset UID'
    ],
    optional: [
      '--basic-asset-position-uid=UID Underlying asset position UID',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument option list --basic-asset-uid=asset-uid',
      't-invest-node-sdk instrument option list --basic-asset-uid=asset-uid --basic-asset-position-uid=position-uid --format=json'
    ],
    notes: [
      '`sdk.instruments.options` is deprecated in the generated contract, so the CLI exposes `option list` instead.',
      'Table output keeps risk rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument option show': {
    description: 'Print option contract details',
    sdkCall: 'sdk.instruments.optionBy',
    grpcMethod: 'InstrumentsService/OptionBy',
    usage: [
      't-invest-node-sdk instrument option show --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument option show --id=OPTIONUID --id-type=uid',
      't-invest-node-sdk instrument option show --id=OPTIONTICKER --id-type=ticker --class-code=SPBOPT --format=json'
    ],
    notes: [
      'Table output keeps risk rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instrument asset list': {
    description: 'Print assets',
    sdkCall: 'sdk.instruments.getAssets',
    grpcMethod: 'InstrumentsService/GetAssets',
    usage: [
      't-invest-node-sdk instrument asset list [options]'
    ],
    optional: [
      '--instrument-type=TYPE unspecified|bond|share|currency|etf|futures|sp|option|clearing-certificate (default: unspecified)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument asset list',
      't-invest-node-sdk instrument asset list --instrument-type=share --format=json'
    ],
    notes: [
      'The gRPC method does not include futures and options assets in this list.'
    ]
  },
  'instrument asset show': {
    description: 'Print asset details',
    sdkCall: 'sdk.instruments.getAssetBy',
    grpcMethod: 'InstrumentsService/GetAssetBy',
    usage: [
      't-invest-node-sdk instrument asset show --id=UID [options]'
    ],
    required: [
      '--id=UID              Asset UID'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument asset show --id=asset-uid',
      't-invest-node-sdk instrument asset show --id=asset-uid --format=json'
    ],
    notes: [
      'Table output is a compact asset overview; use --format=json for brand, security and instrument details.'
    ]
  },
  'instrument brand list': {
    description: 'Print brands dictionary',
    sdkCall: 'sdk.instruments.getBrands',
    grpcMethod: 'InstrumentsService/GetBrands',
    usage: [
      't-invest-node-sdk instrument brand list [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument brand list',
      't-invest-node-sdk instrument brand list --format=json'
    ],
    notes: [
      'Table output keeps long description/info fields out of columns; use --format=json for the full report.'
    ]
  },
  'instrument brand show': {
    description: 'Print brand details',
    sdkCall: 'sdk.instruments.getBrandBy',
    grpcMethod: 'InstrumentsService/GetBrandBy',
    usage: [
      't-invest-node-sdk instrument brand show --id=ID [options]'
    ],
    required: [
      '--id=ID               Brand UID'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument brand show --id=brand-uid',
      't-invest-node-sdk instrument brand show --id=brand-uid --format=json'
    ]
  },
  'instrument country list': {
    description: 'Print countries dictionary',
    sdkCall: 'sdk.instruments.getCountries',
    grpcMethod: 'InstrumentsService/GetCountries',
    usage: [
      't-invest-node-sdk instrument country list [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk instrument country list',
      't-invest-node-sdk instrument country list --format=json'
    ]
  },
  'market last-prices': {
    description: 'Print latest market prices',
    sdkCall: 'sdk.marketdata.getLastPrices',
    grpcMethod: 'MarketDataService/GetLastPrices',
    usage: [
      't-invest-node-sdk market last-prices --instrument-id=ID[,ID] [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] FIGI or instrument UID list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market last-prices --instrument-id=BBG00QPYJ5H0 --format=json'
    ]
  },
  'market trades': {
    description: 'Print recent trades',
    sdkCall: 'sdk.marketdata.getLastTrades',
    grpcMethod: 'MarketDataService/GetLastTrades',
    usage: [
      't-invest-node-sdk market trades --instrument-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market trades --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T10:00:00Z --to=2026-06-19T11:00:00Z',
      't-invest-node-sdk market trades --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T10:00:00Z --to=2026-06-19T11:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'market order-book': {
    description: 'Print instrument order book',
    sdkCall: 'sdk.marketdata.getOrderBook',
    grpcMethod: 'MarketDataService/GetOrderBook',
    usage: [
      't-invest-node-sdk market order-book --instrument-id=ID --depth=DEPTH [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID',
      '--depth=DEPTH          Order book depth as positive integer'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market order-book --instrument-id=BBG00QPYJ5H0 --depth=10',
      't-invest-node-sdk market order-book --instrument-id=instrument-uid --depth=20 --format=json'
    ]
  },
  'market status': {
    description: 'Print instrument trading status',
    sdkCall: 'sdk.marketdata.getTradingStatus',
    grpcMethod: 'MarketDataService/GetTradingStatus',
    usage: [
      't-invest-node-sdk market status --instrument-id=ID [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market status --instrument-id=BBG00QPYJ5H0',
      't-invest-node-sdk market status --instrument-id=instrument-uid --format=json'
    ]
  },
  'market statuses': {
    description: 'Print instrument trading statuses',
    sdkCall: 'sdk.marketdata.getTradingStatuses',
    grpcMethod: 'MarketDataService/GetTradingStatuses',
    usage: [
      't-invest-node-sdk market statuses --instrument-id=ID[,ID] [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] FIGI or instrument UID list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk market statuses --instrument-id=BBG00QPYJ5H0,instrument-uid',
      't-invest-node-sdk market statuses --instrument-id=BBG00QPYJ5H0 --format=json'
    ]
  },
  'order list': {
    description: 'Print active account orders',
    sdkCall: 'sdk.orders.getOrders',
    grpcMethod: 'OrdersService/GetOrders',
    usage: [
      't-invest-node-sdk order list --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk order list --account-id=2000000000 --format=json'
    ]
  },
  'order show': {
    description: 'Print order state',
    sdkCall: 'sdk.orders.getOrderState',
    grpcMethod: 'OrdersService/GetOrderState',
    usage: [
      't-invest-node-sdk order show --account-id=ID --order-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--order-id=ID         Exchange order identifier'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk order show --account-id=2000000000 --order-id=12345',
      't-invest-node-sdk order show --account-id=2000000000 --order-id=12345 --format=json'
    ]
  },
  'order place': {
    description: 'Post an order',
    sdkCall: 'sdk.orders.postOrder',
    grpcMethod: 'OrdersService/PostOrder',
    usage: [
      't-invest-node-sdk order place --account-id=ID --instrument-id=ID --quantity=N --direction=buy|sell --order-type=TYPE --order-id=KEY --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--instrument-id=ID    FIGI or instrument UID',
      '--quantity=N          Positive integer lots count',
      '--direction=DIR       buy|sell',
      '--order-type=TYPE     limit|market|bestprice',
      '--order-id=KEY        Idempotency key, max provider length is 36 chars',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits; omitted for market orders',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --price=100.25 --direction=buy --order-type=limit --order-id=00000000-0000-0000-0000-000000000001 --confirm',
      't-invest-node-sdk order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000002 --confirm --format=json'
    ],
    notes: [
      'This command places an order and refuses to run without --confirm by default CLI policy.',
      '--confirm is an SDK CLI safety guard; it is not a gRPC request field.',
      'Use a stable --order-id value for retries so provider idempotency can identify the same order request.',
      'The CLI does not infer pricing rules; provider validation decides whether --price is valid for the selected order type.',
      'Deprecated generated figi request field is sent as an empty string; use --instrument-id.'
    ]
  },
  'order cancel': {
    description: 'Cancel an order',
    sdkCall: 'sdk.orders.cancelOrder',
    grpcMethod: 'OrdersService/CancelOrder',
    usage: [
      't-invest-node-sdk order cancel --account-id=ID --order-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--order-id=ID         Exchange order identifier',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk order cancel --account-id=2000000000 --order-id=12345 --confirm',
      't-invest-node-sdk order cancel --account-id=2000000000 --order-id=12345 --confirm --format=json'
    ],
    notes: [
      'This command cancels an order and refuses to run without --confirm by default CLI policy.'
    ]
  },
  'order replace': {
    description: 'Replace an order',
    sdkCall: 'sdk.orders.replaceOrder',
    grpcMethod: 'OrdersService/ReplaceOrder',
    usage: [
      't-invest-node-sdk order replace --account-id=ID --order-id=ID --idempotency-key=KEY --quantity=N --price=DECIMAL --price-type=TYPE --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--order-id=ID         Exchange order identifier',
      '--idempotency-key=KEY New idempotency key, max provider length is 36 chars',
      '--quantity=N          Positive integer lots count',
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits',
      '--price-type=TYPE     point|currency',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk order replace --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000003 --quantity=2 --price=101.5 --price-type=currency --confirm',
      't-invest-node-sdk order replace --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000004 --quantity=2 --price=101.5 --price-type=currency --confirm --format=json'
    ],
    notes: [
      'This command changes an existing order and refuses to run without --confirm by default CLI policy.',
      '--idempotency-key identifies the replacement request, not the original order.',
      'The command does not fetch the existing order first; pass the full replacement values explicitly.',
      'The CLI does not generate idempotency keys automatically.'
    ]
  },
  'operation list': {
    description: 'Print account operations',
    sdkCall: 'sdk.operations.getOperations',
    grpcMethod: 'OperationsService/GetOperations',
    usage: [
      't-invest-node-sdk operation list --account-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--state=STATE          unspecified|executed|canceled|progress (default: unspecified)',
      '--instrument-id=ID    Optional instrument identifier filter',
      '--figi=FIGI            Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation list --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z',
      't-invest-node-sdk operation list --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z --instrument-id=BBG00QPYJ5H0 --state=executed --format=json'
    ],
    notes: [
      'Deprecated --figi is still accepted and prints a warning to stderr.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operation page': {
    description: 'Print one cursor page of account operations',
    sdkCall: 'sdk.operations.getOperationsByCursor',
    grpcMethod: 'OperationsService/GetOperationsByCursor',
    usage: [
      't-invest-node-sdk operation page --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      '--instrument-id=ID    Optional FIGI or instrument UID filter',
      '--from=ISO             Optional start timestamp, inclusive',
      '--to=ISO               Optional end timestamp, inclusive',
      '--cursor=CURSOR        Cursor returned as nextCursor by the previous page',
      '--limit=N              Page size from 1 to 1000; provider default is used when omitted',
      '--operation-type=TYPE  Generated OperationType name; comma-separated list is allowed',
      '--state=STATE          unspecified|executed|canceled|progress (default: unspecified)',
      '--without-commissions  Exclude commissions',
      '--without-trades       Exclude trades',
      '--without-overnights   Exclude overnight operations',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation page --account-id=2000000000 --limit=100',
      't-invest-node-sdk operation page --account-id=2000000000 --cursor=NEXT --format=json'
    ],
    notes: [
      'The command returns one page; pass nextCursor as --cursor to request the next page.',
      'Cursor pagination is explicit: the CLI does not loop through pages automatically.',
      'Use --limit to control page size when replaying a cursor flow in scripts.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operation broker-report': {
    description: 'Generate or print a broker report page',
    sdkCall: 'sdk.operations.getBrokerReport',
    grpcMethod: 'OperationsService/GetBrokerReport',
    usage: [
      't-invest-node-sdk operation broker-report --account-id=ID --from=ISO --to=ISO [options]',
      't-invest-node-sdk operation broker-report --task-id=ID [options]'
    ],
    required: [
      'Generate mode: --account-id=ID --from=ISO --to=ISO',
      'Page mode:     --task-id=ID'
    ],
    optional: [
      '--page=N              Report page number, only with --task-id (default: 0)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation broker-report --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z',
      't-invest-node-sdk operation broker-report --task-id=TASK --page=1 --format=json'
    ],
    notes: [
      'The command maps the generated oneof contract to two CLI modes: generate by period or get a page by task id.',
      'Generate mode starts a report task; page mode reads an existing report task page.',
      'Use --task-id returned by generate mode for later page requests.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operation foreign-dividends-report': {
    description: 'Generate or print a foreign issuer dividends report page',
    sdkCall: 'sdk.operations.getDividendsForeignIssuer',
    grpcMethod: 'OperationsService/GetDividendsForeignIssuer',
    usage: [
      't-invest-node-sdk operation foreign-dividends-report --account-id=ID --from=ISO --to=ISO [options]',
      't-invest-node-sdk operation foreign-dividends-report --task-id=ID [options]'
    ],
    required: [
      'Generate mode: --account-id=ID --from=ISO --to=ISO',
      'Page mode:     --task-id=ID'
    ],
    optional: [
      '--page=N              Report page number, only with --task-id (default: 0)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation foreign-dividends-report --account-id=2000000000 --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z',
      't-invest-node-sdk operation foreign-dividends-report --task-id=TASK --page=1 --format=json'
    ],
    notes: [
      'The command maps the generated oneof contract to two CLI modes: generate by period or get a page by task id.',
      'Generate mode starts a report task; page mode reads an existing report task page.',
      'Use --task-id returned by generate mode for later page requests.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operation portfolio': {
    description: 'Print account portfolio',
    sdkCall: 'sdk.operations.getPortfolio',
    grpcMethod: 'OperationsService/GetPortfolio',
    usage: [
      't-invest-node-sdk operation portfolio --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      '--currency=rub|usd|eur Portfolio valuation currency (default: rub)',
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation portfolio --account-id=2000000000 --format=json'
    ]
  },
  'operation positions': {
    description: 'Print account positions',
    sdkCall: 'sdk.operations.getPositions',
    grpcMethod: 'OperationsService/GetPositions',
    usage: [
      't-invest-node-sdk operation positions --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation positions --account-id=2000000000 --format=json'
    ]
  },
  'operation withdraw-limits': {
    description: 'Print account withdraw limits',
    sdkCall: 'sdk.operations.getWithdrawLimits',
    grpcMethod: 'OperationsService/GetWithdrawLimits',
    usage: [
      't-invest-node-sdk operation withdraw-limits --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk operation withdraw-limits --account-id=2000000000',
      't-invest-node-sdk operation withdraw-limits --account-id=2000000000 --format=json'
    ]
  },
  'stop-order list': {
    description: 'Print active stop orders',
    sdkCall: 'sdk.stoporders.getStopOrders',
    grpcMethod: 'StopOrdersService/GetStopOrders',
    usage: [
      't-invest-node-sdk stop-order list --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk stop-order list --account-id=2000000000',
      't-invest-node-sdk stop-order list --account-id=2000000000 --format=json'
    ]
  },
  'stop-order place': {
    description: 'Post a stop order',
    sdkCall: 'sdk.stoporders.postStopOrder',
    grpcMethod: 'StopOrdersService/PostStopOrder',
    usage: [
      't-invest-node-sdk stop-order place --account-id=ID --instrument-id=ID --quantity=N --stop-price=DECIMAL --direction=buy|sell --expiration-type=TYPE --stop-order-type=TYPE --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--instrument-id=ID    FIGI or instrument UID',
      '--quantity=N          Positive integer lots count',
      '--stop-price=DECIMAL  Stop price, up to 9 fractional digits',
      '--direction=DIR       buy|sell',
      '--expiration-type=TYPE good-till-cancel|good-till-date',
      '--stop-order-type=TYPE take-profit|stop-loss|stop-limit',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      '--price=DECIMAL       Order price, up to 9 fractional digits',
      '--expire-date=ISO     Required when --expiration-type=good-till-date',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk stop-order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --stop-price=95.5 --direction=sell --expiration-type=good-till-cancel --stop-order-type=stop-loss --confirm',
      't-invest-node-sdk stop-order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --price=95 --stop-price=95.5 --direction=sell --expiration-type=good-till-date --expire-date=2026-06-20T10:00:00Z --stop-order-type=stop-limit --confirm --format=json'
    ],
    notes: [
      'This command places a stop order and refuses to run without --confirm by default CLI policy.',
      'Deprecated generated figi request field is sent as an empty string; use --instrument-id.'
    ]
  },
  'stop-order cancel': {
    description: 'Cancel a stop order',
    sdkCall: 'sdk.stoporders.cancelStopOrder',
    grpcMethod: 'StopOrdersService/CancelStopOrder',
    usage: [
      't-invest-node-sdk stop-order cancel --account-id=ID --stop-order-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from account list',
      '--stop-order-id=ID    Stop order identifier',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk stop-order cancel --account-id=2000000000 --stop-order-id=stop-order-id --confirm',
      't-invest-node-sdk stop-order cancel --account-id=2000000000 --stop-order-id=stop-order-id --confirm --format=json'
    ],
    notes: [
      'This command cancels a stop order and refuses to run without --confirm by default CLI policy.'
    ]
  },
  'sandbox account list': {
    description: 'Print sandbox accounts',
    sdkCall: 'sdk.sandbox.getSandboxAccounts',
    grpcMethod: 'SandboxService/GetSandboxAccounts',
    usage: [
      't-invest-node-sdk sandbox account list [options]'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox account list',
      't-invest-node-sdk sandbox account list --format=json'
    ]
  },
  'sandbox account open': {
    description: 'Open a sandbox account',
    sdkCall: 'sdk.sandbox.openSandboxAccount',
    grpcMethod: 'SandboxService/OpenSandboxAccount',
    usage: [
      't-invest-node-sdk sandbox account open --confirm [options]'
    ],
    required: [
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox account open --confirm',
      't-invest-node-sdk sandbox account open --confirm --format=json'
    ],
    notes: [
      'This command opens a sandbox account and refuses to run without --confirm by default CLI policy.'
    ]
  },
  'sandbox account close': {
    description: 'Close a sandbox account',
    sdkCall: 'sdk.sandbox.closeSandboxAccount',
    grpcMethod: 'SandboxService/CloseSandboxAccount',
    usage: [
      't-invest-node-sdk sandbox account close --account-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox account close --account-id=2000000000 --confirm',
      't-invest-node-sdk sandbox account close --account-id=2000000000 --confirm --format=json'
    ],
    notes: [
      'This command closes a sandbox account and refuses to run without --confirm by default CLI policy.'
    ]
  },
  'sandbox order list': {
    description: 'Print active sandbox orders',
    sdkCall: 'sdk.sandbox.getSandboxOrders',
    grpcMethod: 'SandboxService/GetSandboxOrders',
    usage: [
      't-invest-node-sdk sandbox order list --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox order list --account-id=2000000000',
      't-invest-node-sdk sandbox order list --account-id=2000000000 --format=json'
    ]
  },
  'sandbox order show': {
    description: 'Print sandbox order state',
    sdkCall: 'sdk.sandbox.getSandboxOrderState',
    grpcMethod: 'SandboxService/GetSandboxOrderState',
    usage: [
      't-invest-node-sdk sandbox order show --account-id=ID --order-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--order-id=ID         Exchange order identifier'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox order show --account-id=2000000000 --order-id=12345',
      't-invest-node-sdk sandbox order show --account-id=2000000000 --order-id=12345 --format=json'
    ]
  },
  'sandbox order place': {
    description: 'Post a sandbox order',
    sdkCall: 'sdk.sandbox.postSandboxOrder',
    grpcMethod: 'SandboxService/PostSandboxOrder',
    usage: [
      't-invest-node-sdk sandbox order place --account-id=ID --instrument-id=ID --quantity=N --direction=buy|sell --order-type=TYPE --order-id=KEY --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--instrument-id=ID    FIGI or instrument UID',
      '--quantity=N          Positive integer lots count',
      '--direction=DIR       buy|sell',
      '--order-type=TYPE     limit|market|bestprice',
      '--order-id=KEY        Idempotency key, max provider length is 36 chars',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits; omitted for market orders',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --price=100.25 --direction=buy --order-type=limit --order-id=00000000-0000-0000-0000-000000000001 --confirm',
      't-invest-node-sdk sandbox order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000002 --confirm --format=json'
    ],
    notes: [
      'This command places a sandbox order and refuses to run without --confirm by default CLI policy.',
      'Deprecated generated figi request field is sent as an empty string; use --instrument-id.'
    ]
  },
  'sandbox order replace': {
    description: 'Replace a sandbox order',
    sdkCall: 'sdk.sandbox.replaceSandboxOrder',
    grpcMethod: 'SandboxService/ReplaceSandboxOrder',
    usage: [
      't-invest-node-sdk sandbox order replace --account-id=ID --order-id=ID --idempotency-key=KEY --quantity=N --price=DECIMAL --price-type=TYPE --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--order-id=ID         Exchange order identifier',
      '--idempotency-key=KEY New idempotency key, max provider length is 36 chars',
      '--quantity=N          Positive integer lots count',
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits',
      '--price-type=TYPE     point|currency',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox order replace --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000003 --quantity=2 --price=101.5 --price-type=currency --confirm',
      't-invest-node-sdk sandbox order replace --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000004 --quantity=2 --price=101.5 --price-type=currency --confirm --format=json'
    ],
    notes: [
      'This command changes an existing sandbox order and refuses to run without --confirm by default CLI policy.',
      'The CLI does not generate idempotency keys automatically.'
    ]
  },
  'sandbox order cancel': {
    description: 'Cancel a sandbox order',
    sdkCall: 'sdk.sandbox.cancelSandboxOrder',
    grpcMethod: 'SandboxService/CancelSandboxOrder',
    usage: [
      't-invest-node-sdk sandbox order cancel --account-id=ID --order-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--order-id=ID         Exchange order identifier',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox order cancel --account-id=2000000000 --order-id=12345 --confirm',
      't-invest-node-sdk sandbox order cancel --account-id=2000000000 --order-id=12345 --confirm --format=json'
    ],
    notes: [
      'This command cancels a sandbox order and refuses to run without --confirm by default CLI policy.'
    ]
  },
  'sandbox portfolio': {
    description: 'Print sandbox portfolio',
    sdkCall: 'sdk.sandbox.getSandboxPortfolio',
    grpcMethod: 'SandboxService/GetSandboxPortfolio',
    usage: [
      't-invest-node-sdk sandbox portfolio --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      '--currency=rub|usd|eur Portfolio valuation currency (default: rub)',
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox portfolio --account-id=2000000000',
      't-invest-node-sdk sandbox portfolio --account-id=2000000000 --currency=usd --format=json'
    ]
  },
  'sandbox position list': {
    description: 'Print sandbox positions',
    sdkCall: 'sdk.sandbox.getSandboxPositions',
    grpcMethod: 'SandboxService/GetSandboxPositions',
    usage: [
      't-invest-node-sdk sandbox position list --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox position list --account-id=2000000000',
      't-invest-node-sdk sandbox position list --account-id=2000000000 --format=json'
    ]
  },
  'sandbox withdraw-limits': {
    description: 'Print sandbox withdraw limits',
    sdkCall: 'sdk.sandbox.getSandboxWithdrawLimits',
    grpcMethod: 'SandboxService/GetSandboxWithdrawLimits',
    usage: [
      't-invest-node-sdk sandbox withdraw-limits --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list'
    ],
    optional: [
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox withdraw-limits --account-id=2000000000',
      't-invest-node-sdk sandbox withdraw-limits --account-id=2000000000 --format=json'
    ]
  },
  'sandbox operation list': {
    description: 'Print sandbox operations',
    sdkCall: 'sdk.sandbox.getSandboxOperations',
    grpcMethod: 'SandboxService/GetSandboxOperations',
    usage: [
      't-invest-node-sdk sandbox operation list --account-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--state=STATE          unspecified|executed|canceled|progress (default: unspecified)',
      '--instrument-id=ID    Optional instrument identifier filter',
      '--figi=FIGI            Deprecated alias for --instrument-id',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox operation list --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z',
      't-invest-node-sdk sandbox operation list --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z --instrument-id=BBG00QPYJ5H0 --state=executed --format=json'
    ],
    notes: [
      'Deprecated --figi is still accepted and prints a warning to stderr.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'sandbox operation page': {
    description: 'Print one cursor page of sandbox operations',
    sdkCall: 'sdk.sandbox.getSandboxOperationsByCursor',
    grpcMethod: 'SandboxService/GetSandboxOperationsByCursor',
    usage: [
      't-invest-node-sdk sandbox operation page --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list'
    ],
    optional: [
      '--instrument-id=ID    Optional FIGI or instrument UID filter',
      '--from=ISO             Optional start timestamp, inclusive',
      '--to=ISO               Optional end timestamp, inclusive',
      '--cursor=CURSOR        Cursor returned as nextCursor by the previous page',
      '--limit=N              Page size from 1 to 1000; provider default is used when omitted',
      '--operation-type=TYPE  Generated OperationType name; comma-separated list is allowed',
      '--state=STATE          unspecified|executed|canceled|progress (default: unspecified)',
      '--without-commissions  Exclude commissions',
      '--without-trades       Exclude trades',
      '--without-overnights   Exclude overnight operations',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox operation page --account-id=2000000000 --limit=100',
      't-invest-node-sdk sandbox operation page --account-id=2000000000 --cursor=NEXT --format=json'
    ],
    notes: [
      'The command returns one page; pass nextCursor as --cursor to request the next page.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'sandbox pay-in': {
    description: 'Pay in to a sandbox account',
    sdkCall: 'sdk.sandbox.sandboxPayIn',
    grpcMethod: 'SandboxService/SandboxPayIn',
    usage: [
      't-invest-node-sdk sandbox pay-in --account-id=ID --amount=DECIMAL --currency=rub|usd --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox account list',
      '--amount=DECIMAL      Positive decimal amount, up to 9 fractional digits',
      '--confirm             Required by default CLI side-effect policy'
    ],
    optional: [
      '--currency=rub|usd    Pay-in currency (default: rub)',
      ...sdkConnectionOptions,
      tableFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk sandbox pay-in --account-id=2000000000 --amount=1000 --currency=rub --confirm',
      't-invest-node-sdk sandbox pay-in --account-id=2000000000 --amount=1000 --currency=rub --confirm --format=json'
    ],
    notes: [
      'This command changes sandbox account balance and refuses to run without --confirm by default CLI policy.',
      'Unknown currency values are rejected by CLI parsing; --currency=usd is accepted by the parser but fails as unsupported.'
    ]
  },
  'stream run': {
    description: 'Run a configured stream and print JSONL events',
    usage: [
      't-invest-node-sdk stream run --config=PATH [options]'
    ],
    required: [
      '--config=PATH        Path to stream JSON config'
    ],
    optional: [
      ...sdkConnectionOptions,
      '--max-events=N         Stop after N printed events',
      '--duration-ms=N        Stop after N milliseconds from stream start',
      '--idle-timeout-ms=N    Stop after N milliseconds without provider events',
      '--include-pings        Print ping events',
      '--raw                  Print generated response shape without envelope',
      jsonlFormatOption
    ],
    environment: sdkEnvironment,
    examples: [
      't-invest-node-sdk stream run --config=portfolio-stream.json --max-events=10',
      't-invest-node-sdk stream run --config=marketdata-stream.json --include-pings'
    ],
    notes: [
      'Supports server-side streams and static initial requests for marketdata.marketDataStream.',
      'Output is JSONL so each provider event can be processed as an independent line.',
      'Use --max-events, --duration-ms or --idle-timeout-ms to make long-running streams finite in scripts.',
      '--raw prints generated response objects; the default output wraps events in a stable CLI envelope.',
      'Dynamic bidirectional request sources are not implemented.'
    ]
  },
  'dev compile-proto': {
    description: 'Generate TypeScript contracts from local proto files',
    usage: [
      't-invest-node-sdk dev compile-proto'
    ],
    examples: [
      't-invest-node-sdk dev compile-proto'
    ],
    notes: [
      'The command uses proto files already present in the repository; it does not download upstream proto sources.',
      'Runs system protoc from PATH and the local ts-proto plugin from node_modules.',
      'Run yarn build before this command when bootstrap TypeScript sources changed.',
      'Generated files are part of the SDK runtime contract; do not edit them manually.'
    ]
  },
  help: {
    description: 'Show top-level or command-specific help',
    usage: [
      't-invest-node-sdk help',
      't-invest-node-sdk help <domain> [<command>]',
      't-invest-node-sdk <domain> <command> --help'
    ],
    examples: [
      't-invest-node-sdk help',
      't-invest-node-sdk help operation portfolio',
      't-invest-node-sdk help version'
    ],
    notes: [
      'Unknown command help falls back to the top-level help page.'
    ]
  },
  version: {
    description: 'Show package version',
    usage: [
      't-invest-node-sdk version',
      't-invest-node-sdk --version'
    ],
    examples: [
      't-invest-node-sdk version'
    ]
  }
} as const satisfies Record<string, CommandHelp>;

export type CommandHelpName = keyof typeof commandHelp;

export function isCommandHelpName(value: unknown): value is CommandHelpName {
  return typeof value === 'string' && value in commandHelp;
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
    `${packageJson.name} ${packageJson.version}`,
    packageJson.description,
    '',
    'Usage:',
    `  ${packageJson.name} <domain> <command> [options]`,
    `  ${packageJson.name} <domain> --help`,
    `  ${packageJson.name} <domain> <command> --help`,
    `  ${packageJson.name} --help`,
    `  ${packageJson.name} --version`,
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
    `  ${packageJson.name} <domain> --help`,
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
    `${packageJson.name} ${packageJson.version}`,
    `${domainName} - ${cliDomains[domainName].description}`,
    '',
    'Usage:',
    `  ${packageJson.name} ${domainName} <command> [options]`,
    `  ${packageJson.name} ${domainName} <command> --help`,
    '',
    'Commands:',
    ...commands.map(
      ({ action, command }) => `  ${action.padEnd(commandNameWidth)} ${command.description}`
    ),
    '',
    'Command details:',
    `  ${packageJson.name} ${domainName} <command> --help`,
    ''
  ].join('\n');
}

export function renderCommandHelp(commandName: CommandHelpName): string {
  const command = commandHelp[commandName] as CommandHelp | undefined;

  if (command === undefined) {
    throw new Error(`Unknown command help: ${commandName}`);
  }

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
