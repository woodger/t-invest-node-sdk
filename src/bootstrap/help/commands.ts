/**
 * Модуль help-реестра хранит декларативное описание CLI-команд.
 *
 * Здесь допустимы:
 * - описание доступных bootstrap-команд;
 * - централизация usage и examples;
 * - экспорт presentation-only metadata для renderer-а.
 *
 * Здесь не должно быть исполнения команд или разбора raw CLI input.
 */

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

export const commandHelp = {
  'users get-accounts': {
    description: 'Print user accounts',
    sdkCall: 'sdk.users.getAccounts',
    grpcMethod: 'UsersService/GetAccounts',
    usage: [
      'tinkoff-invest-node-sdk users get-accounts [options]'
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
      'tinkoff-invest-node-sdk users get-accounts --format=json'
    ]
  },
  'users get-info': {
    description: 'Print user info',
    sdkCall: 'sdk.users.getInfo',
    grpcMethod: 'UsersService/GetInfo',
    usage: [
      'tinkoff-invest-node-sdk users get-info [options]'
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
      'tinkoff-invest-node-sdk users get-info',
      'tinkoff-invest-node-sdk users get-info --format=json'
    ]
  },
  'users get-margin-attributes': {
    description: 'Print account margin attributes',
    sdkCall: 'sdk.users.getMarginAttributes',
    grpcMethod: 'UsersService/GetMarginAttributes',
    usage: [
      'tinkoff-invest-node-sdk users get-margin-attributes --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
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
      'tinkoff-invest-node-sdk users get-margin-attributes --account-id=2000000000',
      'tinkoff-invest-node-sdk users get-margin-attributes --account-id=2000000000 --format=json'
    ]
  },
  'users get-user-tariff': {
    description: 'Print user API limits',
    sdkCall: 'sdk.users.getUserTariff',
    grpcMethod: 'UsersService/GetUserTariff',
    usage: [
      'tinkoff-invest-node-sdk users get-user-tariff [options]'
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
      'tinkoff-invest-node-sdk users get-user-tariff',
      'tinkoff-invest-node-sdk users get-user-tariff --format=json'
    ]
  },
  'marketdata get-candles': {
    description: 'Print historical candles',
    sdkCall: 'sdk.marketdata.getCandles',
    grpcMethod: 'MarketDataService/GetCandles',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-candles --instrument-id=ID --from=ISO --to=ISO --interval=INTERVAL [options]'
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
      'tinkoff-invest-node-sdk marketdata get-candles --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T00:00:00Z --to=2026-06-19T01:00:00Z --interval=1min --format=csv'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'marketdata get-close-prices': {
    description: 'Print close prices',
    sdkCall: 'sdk.marketdata.getClosePrices',
    grpcMethod: 'MarketDataService/GetClosePrices',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-close-prices --instrument-id=ID[,ID] [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] FIGI or instrument UID list'
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
      'tinkoff-invest-node-sdk marketdata get-close-prices --instrument-id=BBG00QPYJ5H0',
      'tinkoff-invest-node-sdk marketdata get-close-prices --instrument-id=BBG00QPYJ5H0,instrument-uid --format=json'
    ]
  },
  'instruments get-accrued-interests': {
    description: 'Print bond accrued interests',
    sdkCall: 'sdk.instruments.getAccruedInterests',
    grpcMethod: 'InstrumentsService/GetAccruedInterests',
    usage: [
      'tinkoff-invest-node-sdk instruments get-accrued-interests --figi=FIGI --from=ISO --to=ISO [options]'
    ],
    required: [
      '--figi=FIGI           Bond FIGI',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
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
      'tinkoff-invest-node-sdk instruments get-accrued-interests --figi=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z',
      'tinkoff-invest-node-sdk instruments get-accrued-interests --figi=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instruments get-asset-by': {
    description: 'Print asset details',
    sdkCall: 'sdk.instruments.getAssetBy',
    grpcMethod: 'InstrumentsService/GetAssetBy',
    usage: [
      'tinkoff-invest-node-sdk instruments get-asset-by --id=UID [options]'
    ],
    required: [
      '--id=UID              Asset UID'
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
      'tinkoff-invest-node-sdk instruments get-asset-by --id=asset-uid',
      'tinkoff-invest-node-sdk instruments get-asset-by --id=asset-uid --format=json'
    ],
    notes: [
      'Table output is a compact asset overview; use --format=json for brand, security and instrument details.'
    ]
  },
  'instruments get-assets': {
    description: 'Print assets',
    sdkCall: 'sdk.instruments.getAssets',
    grpcMethod: 'InstrumentsService/GetAssets',
    usage: [
      'tinkoff-invest-node-sdk instruments get-assets [options]'
    ],
    optional: [
      '--instrument-type=TYPE unspecified|bond|share|currency|etf|futures|sp|option|clearing-certificate (default: unspecified)',
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
      'tinkoff-invest-node-sdk instruments get-assets',
      'tinkoff-invest-node-sdk instruments get-assets --instrument-type=share --format=json'
    ],
    notes: [
      'The gRPC method does not include futures and options assets in this list.'
    ]
  },
  'instruments get-bond-coupons': {
    description: 'Print bond coupons',
    sdkCall: 'sdk.instruments.getBondCoupons',
    grpcMethod: 'InstrumentsService/GetBondCoupons',
    usage: [
      'tinkoff-invest-node-sdk instruments get-bond-coupons --figi=FIGI --from=ISO --to=ISO [options]'
    ],
    required: [
      '--figi=FIGI           Bond FIGI',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
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
      'tinkoff-invest-node-sdk instruments get-bond-coupons --figi=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z',
      'tinkoff-invest-node-sdk instruments get-bond-coupons --figi=BOND-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instruments bond-by': {
    description: 'Print bond details',
    sdkCall: 'sdk.instruments.bondBy',
    grpcMethod: 'InstrumentsService/BondBy',
    usage: [
      'tinkoff-invest-node-sdk instruments bond-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments bond-by --id=BBG00B9XRY4J --id-type=figi',
      'tinkoff-invest-node-sdk instruments bond-by --id=SU26238RMFS4 --id-type=ticker --class-code=TQOB --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and placement values out of columns; use --format=json for the full report.'
    ]
  },
  'instruments bonds': {
    description: 'Print bonds',
    sdkCall: 'sdk.instruments.bonds',
    grpcMethod: 'InstrumentsService/Bonds',
    usage: [
      'tinkoff-invest-node-sdk instruments bonds [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
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
      'tinkoff-invest-node-sdk instruments bonds',
      'tinkoff-invest-node-sdk instruments bonds --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and placement values out of columns; use --format=json for the full report.'
    ]
  },
  'instruments get-brand-by': {
    description: 'Print brand details',
    sdkCall: 'sdk.instruments.getBrandBy',
    grpcMethod: 'InstrumentsService/GetBrandBy',
    usage: [
      'tinkoff-invest-node-sdk instruments get-brand-by --id=ID [options]'
    ],
    required: [
      '--id=ID               Brand UID'
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
      'tinkoff-invest-node-sdk instruments get-brand-by --id=brand-uid',
      'tinkoff-invest-node-sdk instruments get-brand-by --id=brand-uid --format=json'
    ]
  },
  'instruments get-brands': {
    description: 'Print brands dictionary',
    sdkCall: 'sdk.instruments.getBrands',
    grpcMethod: 'InstrumentsService/GetBrands',
    usage: [
      'tinkoff-invest-node-sdk instruments get-brands [options]'
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
      'tinkoff-invest-node-sdk instruments get-brands',
      'tinkoff-invest-node-sdk instruments get-brands --format=json'
    ],
    notes: [
      'Table output keeps long description/info fields out of columns; use --format=json for the full report.'
    ]
  },
  'instruments get-countries': {
    description: 'Print countries dictionary',
    sdkCall: 'sdk.instruments.getCountries',
    grpcMethod: 'InstrumentsService/GetCountries',
    usage: [
      'tinkoff-invest-node-sdk instruments get-countries [options]'
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
      'tinkoff-invest-node-sdk instruments get-countries',
      'tinkoff-invest-node-sdk instruments get-countries --format=json'
    ]
  },
  'instruments currencies': {
    description: 'Print currencies',
    sdkCall: 'sdk.instruments.currencies',
    grpcMethod: 'InstrumentsService/Currencies',
    usage: [
      'tinkoff-invest-node-sdk instruments currencies [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
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
      'tinkoff-invest-node-sdk instruments currencies',
      'tinkoff-invest-node-sdk instruments currencies --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments currency-by': {
    description: 'Print currency details',
    sdkCall: 'sdk.instruments.currencyBy',
    grpcMethod: 'InstrumentsService/CurrencyBy',
    usage: [
      'tinkoff-invest-node-sdk instruments currency-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments currency-by --id=BBG0013HGFT4 --id-type=figi',
      'tinkoff-invest-node-sdk instruments currency-by --id=USD000UTSTOM --id-type=ticker --class-code=CETS --format=json'
    ],
    notes: [
      'Table output keeps risk rates and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments etf-by': {
    description: 'Print ETF details',
    sdkCall: 'sdk.instruments.etfBy',
    grpcMethod: 'InstrumentsService/EtfBy',
    usage: [
      'tinkoff-invest-node-sdk instruments etf-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments etf-by --id=BBG333333333 --id-type=figi',
      'tinkoff-invest-node-sdk instruments etf-by --id=TMOS --id-type=ticker --class-code=TQTF --format=json'
    ],
    notes: [
      'Table output keeps risk rates, fund metadata and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments etfs': {
    description: 'Print ETFs',
    sdkCall: 'sdk.instruments.etfs',
    grpcMethod: 'InstrumentsService/Etfs',
    usage: [
      'tinkoff-invest-node-sdk instruments etfs [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
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
      'tinkoff-invest-node-sdk instruments etfs',
      'tinkoff-invest-node-sdk instruments etfs --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates, fund metadata and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments get-dividends': {
    description: 'Print instrument dividends',
    sdkCall: 'sdk.instruments.getDividends',
    grpcMethod: 'InstrumentsService/GetDividends',
    usage: [
      'tinkoff-invest-node-sdk instruments get-dividends --figi=FIGI --from=ISO --to=ISO [options]'
    ],
    required: [
      '--figi=FIGI           Share FIGI',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
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
      'tinkoff-invest-node-sdk instruments get-dividends --figi=SHARE-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z',
      'tinkoff-invest-node-sdk instruments get-dividends --figi=SHARE-FIGI --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'instruments get-favorites': {
    description: 'Print favorite instruments',
    sdkCall: 'sdk.instruments.getFavorites',
    grpcMethod: 'InstrumentsService/GetFavorites',
    usage: [
      'tinkoff-invest-node-sdk instruments get-favorites [options]'
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
      'tinkoff-invest-node-sdk instruments get-favorites',
      'tinkoff-invest-node-sdk instruments get-favorites --format=json'
    ]
  },
  'instruments edit-favorites': {
    description: 'Add or remove favorite instruments',
    sdkCall: 'sdk.instruments.editFavorites',
    grpcMethod: 'InstrumentsService/EditFavorites',
    usage: [
      'tinkoff-invest-node-sdk instruments edit-favorites --figi=FIGI[,FIGI] --action=add|del --confirm [options]'
    ],
    required: [
      '--figi=FIGI[,FIGI]   Comma-separated FIGI list',
      '--action=ACTION       add|del',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk instruments edit-favorites --figi=BBG00QPYJ5H0 --action=add --confirm',
      'tinkoff-invest-node-sdk instruments edit-favorites --figi=BBG00QPYJ5H0,BBG004730N88 --action=del --confirm --format=json'
    ],
    notes: [
      'This command changes account favorites and refuses to run without --confirm.'
    ]
  },
  'instruments find-instrument': {
    description: 'Search instruments',
    sdkCall: 'sdk.instruments.findInstrument',
    grpcMethod: 'InstrumentsService/FindInstrument',
    usage: [
      'tinkoff-invest-node-sdk instruments find-instrument --query=TEXT [options]'
    ],
    required: [
      '--query=TEXT          Search query'
    ],
    optional: [
      '--instrument-kind=KIND unspecified|bond|share|currency|etf|futures|sp|option|clearing-certificate',
      '--api-trade-available Only instruments available for API trading',
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
      'tinkoff-invest-node-sdk instruments find-instrument --query=TCSG',
      'tinkoff-invest-node-sdk instruments find-instrument --query=TCSG --instrument-kind=share --api-trade-available --format=json'
    ]
  },
  'instruments future-by': {
    description: 'Print futures contract details',
    sdkCall: 'sdk.instruments.futureBy',
    grpcMethod: 'InstrumentsService/FutureBy',
    usage: [
      'tinkoff-invest-node-sdk instruments future-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments future-by --id=FUTFIGI --id-type=figi',
      'tinkoff-invest-node-sdk instruments future-by --id=SiM6 --id-type=ticker --class-code=SPBFUT --format=json'
    ],
    notes: [
      'Table output keeps margin rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments futures': {
    description: 'Print futures contracts',
    sdkCall: 'sdk.instruments.futures',
    grpcMethod: 'InstrumentsService/Futures',
    usage: [
      'tinkoff-invest-node-sdk instruments futures [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
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
      'tinkoff-invest-node-sdk instruments futures',
      'tinkoff-invest-node-sdk instruments futures --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps margin rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments get-futures-margin': {
    description: 'Print futures margin details',
    sdkCall: 'sdk.instruments.getFuturesMargin',
    grpcMethod: 'InstrumentsService/GetFuturesMargin',
    usage: [
      'tinkoff-invest-node-sdk instruments get-futures-margin --figi=FIGI [options]'
    ],
    required: [
      '--figi=FIGI           Futures FIGI'
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
      'tinkoff-invest-node-sdk instruments get-futures-margin --figi=FUTFIGI',
      'tinkoff-invest-node-sdk instruments get-futures-margin --figi=FUTFIGI --format=json'
    ]
  },
  'instruments get-instrument-by': {
    description: 'Print instrument details',
    sdkCall: 'sdk.instruments.getInstrumentBy',
    grpcMethod: 'InstrumentsService/GetInstrumentBy',
    usage: [
      'tinkoff-invest-node-sdk instruments get-instrument-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments get-instrument-by --id=BBG00QPYJ5H0 --id-type=figi',
      'tinkoff-invest-node-sdk instruments get-instrument-by --id=TCSG --id-type=ticker --class-code=TQBR --format=json'
    ]
  },
  'instruments option-by': {
    description: 'Print option contract details',
    sdkCall: 'sdk.instruments.optionBy',
    grpcMethod: 'InstrumentsService/OptionBy',
    usage: [
      'tinkoff-invest-node-sdk instruments option-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments option-by --id=OPTIONUID --id-type=uid',
      'tinkoff-invest-node-sdk instruments option-by --id=OPTIONTICKER --id-type=ticker --class-code=SPBOPT --format=json'
    ],
    notes: [
      'Table output keeps risk rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments options-by': {
    description: 'Print option contracts by underlying asset',
    sdkCall: 'sdk.instruments.optionsBy',
    grpcMethod: 'InstrumentsService/OptionsBy',
    usage: [
      'tinkoff-invest-node-sdk instruments options-by --basic-asset-uid=UID [options]'
    ],
    required: [
      '--basic-asset-uid=UID Underlying asset UID'
    ],
    optional: [
      '--basic-asset-position-uid=UID Underlying asset position UID',
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
      'tinkoff-invest-node-sdk instruments options-by --basic-asset-uid=asset-uid',
      'tinkoff-invest-node-sdk instruments options-by --basic-asset-uid=asset-uid --basic-asset-position-uid=position-uid --format=json'
    ],
    notes: [
      '`sdk.instruments.options` is deprecated in the generated contract, so the CLI exposes `options-by` instead.',
      'Table output keeps risk rates, underlying asset details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments share-by': {
    description: 'Print share details',
    sdkCall: 'sdk.instruments.shareBy',
    grpcMethod: 'InstrumentsService/ShareBy',
    usage: [
      'tinkoff-invest-node-sdk instruments share-by --id=ID --id-type=TYPE [options]'
    ],
    required: [
      '--id=ID               FIGI, ticker, instrument UID or position UID',
      '--id-type=TYPE        figi|ticker|uid|position-uid'
    ],
    optional: [
      '--class-code=CODE     Required when --id-type=ticker',
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
      'tinkoff-invest-node-sdk instruments share-by --id=BBG004730N88 --id-type=figi',
      'tinkoff-invest-node-sdk instruments share-by --id=SBER --id-type=ticker --class-code=TQBR --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments shares': {
    description: 'Print shares',
    sdkCall: 'sdk.instruments.shares',
    grpcMethod: 'InstrumentsService/Shares',
    usage: [
      'tinkoff-invest-node-sdk instruments shares [options]'
    ],
    optional: [
      '--instrument-status=STATUS unspecified|base|all (default: base)',
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
      'tinkoff-invest-node-sdk instruments shares',
      'tinkoff-invest-node-sdk instruments shares --instrument-status=all --format=json'
    ],
    notes: [
      'Table output keeps risk rates, issue details and candle dates out of columns; use --format=json for the full report.'
    ]
  },
  'instruments trading-schedules': {
    description: 'Print trading schedules',
    sdkCall: 'sdk.instruments.tradingSchedules',
    grpcMethod: 'InstrumentsService/TradingSchedules',
    usage: [
      'tinkoff-invest-node-sdk instruments trading-schedules --from=ISO --to=ISO [options]'
    ],
    required: [
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--exchange=EXCHANGE    Optional exchange or settlement calendar code',
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
      'tinkoff-invest-node-sdk instruments trading-schedules --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z',
      'tinkoff-invest-node-sdk instruments trading-schedules --exchange=MOEX --from=2026-01-01T00:00:00Z --to=2026-01-31T00:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'marketdata get-last-prices': {
    description: 'Print latest market prices',
    sdkCall: 'sdk.marketdata.getLastPrices',
    grpcMethod: 'MarketDataService/GetLastPrices',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-last-prices --instrument-id=ID[,ID] [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] FIGI or instrument UID list'
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
      'tinkoff-invest-node-sdk marketdata get-last-prices --instrument-id=BBG00QPYJ5H0 --format=json'
    ]
  },
  'marketdata get-last-trades': {
    description: 'Print recent trades',
    sdkCall: 'sdk.marketdata.getLastTrades',
    grpcMethod: 'MarketDataService/GetLastTrades',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-last-trades --instrument-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
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
      'tinkoff-invest-node-sdk marketdata get-last-trades --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T10:00:00Z --to=2026-06-19T11:00:00Z',
      'tinkoff-invest-node-sdk marketdata get-last-trades --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T10:00:00Z --to=2026-06-19T11:00:00Z --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'marketdata get-order-book': {
    description: 'Print instrument order book',
    sdkCall: 'sdk.marketdata.getOrderBook',
    grpcMethod: 'MarketDataService/GetOrderBook',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-order-book --instrument-id=ID --depth=DEPTH [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID',
      '--depth=DEPTH          Order book depth as positive integer'
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
      'tinkoff-invest-node-sdk marketdata get-order-book --instrument-id=BBG00QPYJ5H0 --depth=10',
      'tinkoff-invest-node-sdk marketdata get-order-book --instrument-id=instrument-uid --depth=20 --format=json'
    ]
  },
  'marketdata get-trading-status': {
    description: 'Print instrument trading status',
    sdkCall: 'sdk.marketdata.getTradingStatus',
    grpcMethod: 'MarketDataService/GetTradingStatus',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-trading-status --instrument-id=ID [options]'
    ],
    required: [
      '--instrument-id=ID     FIGI or instrument UID'
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
      'tinkoff-invest-node-sdk marketdata get-trading-status --instrument-id=BBG00QPYJ5H0',
      'tinkoff-invest-node-sdk marketdata get-trading-status --instrument-id=instrument-uid --format=json'
    ]
  },
  'marketdata get-trading-statuses': {
    description: 'Print instrument trading statuses',
    sdkCall: 'sdk.marketdata.getTradingStatuses',
    grpcMethod: 'MarketDataService/GetTradingStatuses',
    usage: [
      'tinkoff-invest-node-sdk marketdata get-trading-statuses --instrument-id=ID[,ID] [options]'
    ],
    required: [
      '--instrument-id=ID[,ID] FIGI or instrument UID list'
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
      'tinkoff-invest-node-sdk marketdata get-trading-statuses --instrument-id=BBG00QPYJ5H0,instrument-uid',
      'tinkoff-invest-node-sdk marketdata get-trading-statuses --instrument-id=BBG00QPYJ5H0 --format=json'
    ]
  },
  'orders get-orders': {
    description: 'Print active account orders',
    sdkCall: 'sdk.orders.getOrders',
    grpcMethod: 'OrdersService/GetOrders',
    usage: [
      'tinkoff-invest-node-sdk orders get-orders --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
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
      'tinkoff-invest-node-sdk orders get-orders --account-id=2000000000 --format=json'
    ]
  },
  'orders get-order-state': {
    description: 'Print order state',
    sdkCall: 'sdk.orders.getOrderState',
    grpcMethod: 'OrdersService/GetOrderState',
    usage: [
      'tinkoff-invest-node-sdk orders get-order-state --account-id=ID --order-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--order-id=ID         Exchange order identifier'
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
      'tinkoff-invest-node-sdk orders get-order-state --account-id=2000000000 --order-id=12345',
      'tinkoff-invest-node-sdk orders get-order-state --account-id=2000000000 --order-id=12345 --format=json'
    ]
  },
  'orders post-order': {
    description: 'Post an order',
    sdkCall: 'sdk.orders.postOrder',
    grpcMethod: 'OrdersService/PostOrder',
    usage: [
      'tinkoff-invest-node-sdk orders post-order --account-id=ID --instrument-id=ID --quantity=N --direction=buy|sell --order-type=TYPE --order-id=KEY --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--instrument-id=ID    FIGI or instrument UID',
      '--quantity=N          Positive integer lots count',
      '--direction=DIR       buy|sell',
      '--order-type=TYPE     limit|market|bestprice',
      '--order-id=KEY        Idempotency key, max provider length is 36 chars',
      '--confirm             Required side-effect confirmation flag'
    ],
    optional: [
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits; omitted for market orders',
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
      'tinkoff-invest-node-sdk orders post-order --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --price=100.25 --direction=buy --order-type=limit --order-id=00000000-0000-0000-0000-000000000001 --confirm',
      'tinkoff-invest-node-sdk orders post-order --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000002 --confirm --format=json'
    ],
    notes: [
      'This command places an order and refuses to run without --confirm.',
      'Deprecated generated figi request field is sent as an empty string; use --instrument-id.'
    ]
  },
  'orders cancel-order': {
    description: 'Cancel an order',
    sdkCall: 'sdk.orders.cancelOrder',
    grpcMethod: 'OrdersService/CancelOrder',
    usage: [
      'tinkoff-invest-node-sdk orders cancel-order --account-id=ID --order-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--order-id=ID         Exchange order identifier',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk orders cancel-order --account-id=2000000000 --order-id=12345 --confirm',
      'tinkoff-invest-node-sdk orders cancel-order --account-id=2000000000 --order-id=12345 --confirm --format=json'
    ],
    notes: [
      'This command cancels an order and refuses to run without --confirm.'
    ]
  },
  'orders replace-order': {
    description: 'Replace an order',
    sdkCall: 'sdk.orders.replaceOrder',
    grpcMethod: 'OrdersService/ReplaceOrder',
    usage: [
      'tinkoff-invest-node-sdk orders replace-order --account-id=ID --order-id=ID --idempotency-key=KEY --quantity=N --price=DECIMAL --price-type=TYPE --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--order-id=ID         Exchange order identifier',
      '--idempotency-key=KEY New idempotency key, max provider length is 36 chars',
      '--quantity=N          Positive integer lots count',
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits',
      '--price-type=TYPE     point|currency',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk orders replace-order --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000003 --quantity=2 --price=101.5 --price-type=currency --confirm',
      'tinkoff-invest-node-sdk orders replace-order --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000004 --quantity=2 --price=101.5 --price-type=currency --confirm --format=json'
    ],
    notes: [
      'This command changes an existing order and refuses to run without --confirm.',
      'The CLI does not generate idempotency keys automatically.'
    ]
  },
  'operations get-operations': {
    description: 'Print account operations',
    sdkCall: 'sdk.operations.getOperations',
    grpcMethod: 'OperationsService/GetOperations',
    usage: [
      'tinkoff-invest-node-sdk operations get-operations --account-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--state=STATE          unspecified|executed|canceled|progress (default: unspecified)',
      '--figi=FIGI            Optional instrument FIGI filter',
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
      'tinkoff-invest-node-sdk operations get-operations --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z',
      'tinkoff-invest-node-sdk operations get-operations --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z --state=executed --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operations get-operations-by-cursor': {
    description: 'Print one cursor page of account operations',
    sdkCall: 'sdk.operations.getOperationsByCursor',
    grpcMethod: 'OperationsService/GetOperationsByCursor',
    usage: [
      'tinkoff-invest-node-sdk operations get-operations-by-cursor --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
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
      'tinkoff-invest-node-sdk operations get-operations-by-cursor --account-id=2000000000 --limit=100',
      'tinkoff-invest-node-sdk operations get-operations-by-cursor --account-id=2000000000 --cursor=NEXT --format=json'
    ],
    notes: [
      'The command returns one page; pass nextCursor as --cursor to request the next page.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operations get-broker-report': {
    description: 'Generate or print a broker report page',
    sdkCall: 'sdk.operations.getBrokerReport',
    grpcMethod: 'OperationsService/GetBrokerReport',
    usage: [
      'tinkoff-invest-node-sdk operations get-broker-report --account-id=ID --from=ISO --to=ISO [options]',
      'tinkoff-invest-node-sdk operations get-broker-report --task-id=ID [options]'
    ],
    required: [
      'Generate mode: --account-id=ID --from=ISO --to=ISO',
      'Page mode:     --task-id=ID'
    ],
    optional: [
      '--page=N              Report page number, only with --task-id (default: 0)',
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
      'tinkoff-invest-node-sdk operations get-broker-report --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z',
      'tinkoff-invest-node-sdk operations get-broker-report --task-id=TASK --page=1 --format=json'
    ],
    notes: [
      'The command maps the generated oneof contract to two CLI modes: generate by period or get a page by task id.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operations get-dividends-foreign-issuer': {
    description: 'Generate or print a foreign issuer dividends report page',
    sdkCall: 'sdk.operations.getDividendsForeignIssuer',
    grpcMethod: 'OperationsService/GetDividendsForeignIssuer',
    usage: [
      'tinkoff-invest-node-sdk operations get-dividends-foreign-issuer --account-id=ID --from=ISO --to=ISO [options]',
      'tinkoff-invest-node-sdk operations get-dividends-foreign-issuer --task-id=ID [options]'
    ],
    required: [
      'Generate mode: --account-id=ID --from=ISO --to=ISO',
      'Page mode:     --task-id=ID'
    ],
    optional: [
      '--page=N              Report page number, only with --task-id (default: 0)',
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
      'tinkoff-invest-node-sdk operations get-dividends-foreign-issuer --account-id=2000000000 --from=2026-01-01T00:00:00Z --to=2026-12-31T00:00:00Z',
      'tinkoff-invest-node-sdk operations get-dividends-foreign-issuer --task-id=TASK --page=1 --format=json'
    ],
    notes: [
      'The command maps the generated oneof contract to two CLI modes: generate by period or get a page by task id.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'operations get-portfolio': {
    description: 'Print account portfolio',
    sdkCall: 'sdk.operations.getPortfolio',
    grpcMethod: 'OperationsService/GetPortfolio',
    usage: [
      'tinkoff-invest-node-sdk operations get-portfolio --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
    ],
    optional: [
      '--token=TOKEN          OAuth token, overrides TINKOFF_TOKEN',
      '--endpoint=HOST:PORT   gRPC endpoint, overrides TINKOFF_ENDPOINT',
      '--app-name=NAME        Optional x-app-name metadata value',
      '--insecure             Disable TLS for local or test endpoints',
      '--currency=rub|usd|eur Portfolio valuation currency (default: rub)',
      '--format=json|table    Output format (default: table)'
    ],
    environment: [
      'TINKOFF_TOKEN',
      'TINKOFF_ENDPOINT'
    ],
    examples: [
      'tinkoff-invest-node-sdk operations get-portfolio --account-id=2000000000 --format=json'
    ]
  },
  'operations get-positions': {
    description: 'Print account positions',
    sdkCall: 'sdk.operations.getPositions',
    grpcMethod: 'OperationsService/GetPositions',
    usage: [
      'tinkoff-invest-node-sdk operations get-positions --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
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
      'tinkoff-invest-node-sdk operations get-positions --account-id=2000000000 --format=json'
    ]
  },
  'operations get-withdraw-limits': {
    description: 'Print account withdraw limits',
    sdkCall: 'sdk.operations.getWithdrawLimits',
    grpcMethod: 'OperationsService/GetWithdrawLimits',
    usage: [
      'tinkoff-invest-node-sdk operations get-withdraw-limits --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
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
      'tinkoff-invest-node-sdk operations get-withdraw-limits --account-id=2000000000',
      'tinkoff-invest-node-sdk operations get-withdraw-limits --account-id=2000000000 --format=json'
    ]
  },
  'stoporders get-stop-orders': {
    description: 'Print active stop orders',
    sdkCall: 'sdk.stoporders.getStopOrders',
    grpcMethod: 'StopOrdersService/GetStopOrders',
    usage: [
      'tinkoff-invest-node-sdk stoporders get-stop-orders --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts'
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
      'tinkoff-invest-node-sdk stoporders get-stop-orders --account-id=2000000000',
      'tinkoff-invest-node-sdk stoporders get-stop-orders --account-id=2000000000 --format=json'
    ]
  },
  'stoporders post-stop-order': {
    description: 'Post a stop order',
    sdkCall: 'sdk.stoporders.postStopOrder',
    grpcMethod: 'StopOrdersService/PostStopOrder',
    usage: [
      'tinkoff-invest-node-sdk stoporders post-stop-order --account-id=ID --instrument-id=ID --quantity=N --stop-price=DECIMAL --direction=buy|sell --expiration-type=TYPE --stop-order-type=TYPE --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--instrument-id=ID    FIGI or instrument UID',
      '--quantity=N          Positive integer lots count',
      '--stop-price=DECIMAL  Stop price, up to 9 fractional digits',
      '--direction=DIR       buy|sell',
      '--expiration-type=TYPE good-till-cancel|good-till-date',
      '--stop-order-type=TYPE take-profit|stop-loss|stop-limit',
      '--confirm             Required side-effect confirmation flag'
    ],
    optional: [
      '--price=DECIMAL       Order price, up to 9 fractional digits',
      '--expire-date=ISO     Required when --expiration-type=good-till-date',
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
      'tinkoff-invest-node-sdk stoporders post-stop-order --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --stop-price=95.5 --direction=sell --expiration-type=good-till-cancel --stop-order-type=stop-loss --confirm',
      'tinkoff-invest-node-sdk stoporders post-stop-order --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --price=95 --stop-price=95.5 --direction=sell --expiration-type=good-till-date --expire-date=2026-06-20T10:00:00Z --stop-order-type=stop-limit --confirm --format=json'
    ],
    notes: [
      'This command places a stop order and refuses to run without --confirm.',
      'Deprecated generated figi request field is sent as an empty string; use --instrument-id.'
    ]
  },
  'stoporders cancel-stop-order': {
    description: 'Cancel a stop order',
    sdkCall: 'sdk.stoporders.cancelStopOrder',
    grpcMethod: 'StopOrdersService/CancelStopOrder',
    usage: [
      'tinkoff-invest-node-sdk stoporders cancel-stop-order --account-id=ID --stop-order-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Account identifier from users get-accounts',
      '--stop-order-id=ID    Stop order identifier',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk stoporders cancel-stop-order --account-id=2000000000 --stop-order-id=stop-order-id --confirm',
      'tinkoff-invest-node-sdk stoporders cancel-stop-order --account-id=2000000000 --stop-order-id=stop-order-id --confirm --format=json'
    ],
    notes: [
      'This command cancels a stop order and refuses to run without --confirm.'
    ]
  },
  'sandbox get-sandbox-accounts': {
    description: 'Print sandbox accounts',
    sdkCall: 'sdk.sandbox.getSandboxAccounts',
    grpcMethod: 'SandboxService/GetSandboxAccounts',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-accounts [options]'
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-accounts',
      'tinkoff-invest-node-sdk sandbox get-sandbox-accounts --format=json'
    ]
  },
  'sandbox open-sandbox-account': {
    description: 'Open a sandbox account',
    sdkCall: 'sdk.sandbox.openSandboxAccount',
    grpcMethod: 'SandboxService/OpenSandboxAccount',
    usage: [
      'tinkoff-invest-node-sdk sandbox open-sandbox-account --confirm [options]'
    ],
    required: [
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk sandbox open-sandbox-account --confirm',
      'tinkoff-invest-node-sdk sandbox open-sandbox-account --confirm --format=json'
    ],
    notes: [
      'This command opens a sandbox account and refuses to run without --confirm.'
    ]
  },
  'sandbox close-sandbox-account': {
    description: 'Close a sandbox account',
    sdkCall: 'sdk.sandbox.closeSandboxAccount',
    grpcMethod: 'SandboxService/CloseSandboxAccount',
    usage: [
      'tinkoff-invest-node-sdk sandbox close-sandbox-account --account-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk sandbox close-sandbox-account --account-id=2000000000 --confirm',
      'tinkoff-invest-node-sdk sandbox close-sandbox-account --account-id=2000000000 --confirm --format=json'
    ],
    notes: [
      'This command closes a sandbox account and refuses to run without --confirm.'
    ]
  },
  'sandbox post-sandbox-order': {
    description: 'Post a sandbox order',
    sdkCall: 'sdk.sandbox.postSandboxOrder',
    grpcMethod: 'SandboxService/PostSandboxOrder',
    usage: [
      'tinkoff-invest-node-sdk sandbox post-sandbox-order --account-id=ID --instrument-id=ID --quantity=N --direction=buy|sell --order-type=TYPE --order-id=KEY --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--instrument-id=ID    FIGI or instrument UID',
      '--quantity=N          Positive integer lots count',
      '--direction=DIR       buy|sell',
      '--order-type=TYPE     limit|market|bestprice',
      '--order-id=KEY        Idempotency key, max provider length is 36 chars',
      '--confirm             Required side-effect confirmation flag'
    ],
    optional: [
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits; omitted for market orders',
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
      'tinkoff-invest-node-sdk sandbox post-sandbox-order --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --price=100.25 --direction=buy --order-type=limit --order-id=00000000-0000-0000-0000-000000000001 --confirm',
      'tinkoff-invest-node-sdk sandbox post-sandbox-order --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000002 --confirm --format=json'
    ],
    notes: [
      'This command places a sandbox order and refuses to run without --confirm.',
      'Deprecated generated figi request field is sent as an empty string; use --instrument-id.'
    ]
  },
  'sandbox replace-sandbox-order': {
    description: 'Replace a sandbox order',
    sdkCall: 'sdk.sandbox.replaceSandboxOrder',
    grpcMethod: 'SandboxService/ReplaceSandboxOrder',
    usage: [
      'tinkoff-invest-node-sdk sandbox replace-sandbox-order --account-id=ID --order-id=ID --idempotency-key=KEY --quantity=N --price=DECIMAL --price-type=TYPE --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--order-id=ID         Exchange order identifier',
      '--idempotency-key=KEY New idempotency key, max provider length is 36 chars',
      '--quantity=N          Positive integer lots count',
      '--price=DECIMAL       Price per instrument, up to 9 fractional digits',
      '--price-type=TYPE     point|currency',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk sandbox replace-sandbox-order --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000003 --quantity=2 --price=101.5 --price-type=currency --confirm',
      'tinkoff-invest-node-sdk sandbox replace-sandbox-order --account-id=2000000000 --order-id=12345 --idempotency-key=00000000-0000-0000-0000-000000000004 --quantity=2 --price=101.5 --price-type=currency --confirm --format=json'
    ],
    notes: [
      'This command changes an existing sandbox order and refuses to run without --confirm.',
      'The CLI does not generate idempotency keys automatically.'
    ]
  },
  'sandbox cancel-sandbox-order': {
    description: 'Cancel a sandbox order',
    sdkCall: 'sdk.sandbox.cancelSandboxOrder',
    grpcMethod: 'SandboxService/CancelSandboxOrder',
    usage: [
      'tinkoff-invest-node-sdk sandbox cancel-sandbox-order --account-id=ID --order-id=ID --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--order-id=ID         Exchange order identifier',
      '--confirm             Required side-effect confirmation flag'
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
      'tinkoff-invest-node-sdk sandbox cancel-sandbox-order --account-id=2000000000 --order-id=12345 --confirm',
      'tinkoff-invest-node-sdk sandbox cancel-sandbox-order --account-id=2000000000 --order-id=12345 --confirm --format=json'
    ],
    notes: [
      'This command cancels a sandbox order and refuses to run without --confirm.'
    ]
  },
  'sandbox get-sandbox-orders': {
    description: 'Print active sandbox orders',
    sdkCall: 'sdk.sandbox.getSandboxOrders',
    grpcMethod: 'SandboxService/GetSandboxOrders',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-orders --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts'
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-orders --account-id=2000000000',
      'tinkoff-invest-node-sdk sandbox get-sandbox-orders --account-id=2000000000 --format=json'
    ]
  },
  'sandbox get-sandbox-order-state': {
    description: 'Print sandbox order state',
    sdkCall: 'sdk.sandbox.getSandboxOrderState',
    grpcMethod: 'SandboxService/GetSandboxOrderState',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-order-state --account-id=ID --order-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--order-id=ID         Exchange order identifier'
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-order-state --account-id=2000000000 --order-id=12345',
      'tinkoff-invest-node-sdk sandbox get-sandbox-order-state --account-id=2000000000 --order-id=12345 --format=json'
    ]
  },
  'sandbox get-sandbox-positions': {
    description: 'Print sandbox positions',
    sdkCall: 'sdk.sandbox.getSandboxPositions',
    grpcMethod: 'SandboxService/GetSandboxPositions',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-positions --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts'
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-positions --account-id=2000000000',
      'tinkoff-invest-node-sdk sandbox get-sandbox-positions --account-id=2000000000 --format=json'
    ]
  },
  'sandbox get-sandbox-operations': {
    description: 'Print sandbox operations',
    sdkCall: 'sdk.sandbox.getSandboxOperations',
    grpcMethod: 'SandboxService/GetSandboxOperations',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-operations --account-id=ID --from=ISO --to=ISO [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--from=ISO             Start timestamp, inclusive',
      '--to=ISO               End timestamp, inclusive'
    ],
    optional: [
      '--state=STATE          unspecified|executed|canceled|progress (default: unspecified)',
      '--figi=FIGI            Optional instrument FIGI filter',
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-operations --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z',
      'tinkoff-invest-node-sdk sandbox get-sandbox-operations --account-id=2000000000 --from=2026-06-01T00:00:00Z --to=2026-06-19T00:00:00Z --state=executed --format=json'
    ],
    notes: [
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'sandbox get-sandbox-operations-by-cursor': {
    description: 'Print one cursor page of sandbox operations',
    sdkCall: 'sdk.sandbox.getSandboxOperationsByCursor',
    grpcMethod: 'SandboxService/GetSandboxOperationsByCursor',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-operations-by-cursor --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts'
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-operations-by-cursor --account-id=2000000000 --limit=100',
      'tinkoff-invest-node-sdk sandbox get-sandbox-operations-by-cursor --account-id=2000000000 --cursor=NEXT --format=json'
    ],
    notes: [
      'The command returns one page; pass nextCursor as --cursor to request the next page.',
      "The command validates only CLI syntax and date ordering; API range limits remain provider-side."
    ]
  },
  'sandbox get-sandbox-portfolio': {
    description: 'Print sandbox portfolio',
    sdkCall: 'sdk.sandbox.getSandboxPortfolio',
    grpcMethod: 'SandboxService/GetSandboxPortfolio',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-portfolio --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts'
    ],
    optional: [
      '--token=TOKEN          OAuth token, overrides TINKOFF_TOKEN',
      '--endpoint=HOST:PORT   gRPC endpoint, overrides TINKOFF_ENDPOINT',
      '--app-name=NAME        Optional x-app-name metadata value',
      '--insecure             Disable TLS for local or test endpoints',
      '--currency=rub|usd|eur Portfolio valuation currency (default: rub)',
      '--format=json|table    Output format (default: table)'
    ],
    environment: [
      'TINKOFF_TOKEN',
      'TINKOFF_ENDPOINT'
    ],
    examples: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-portfolio --account-id=2000000000',
      'tinkoff-invest-node-sdk sandbox get-sandbox-portfolio --account-id=2000000000 --currency=usd --format=json'
    ]
  },
  'sandbox sandbox-pay-in': {
    description: 'Pay in to a sandbox account',
    sdkCall: 'sdk.sandbox.sandboxPayIn',
    grpcMethod: 'SandboxService/SandboxPayIn',
    usage: [
      'tinkoff-invest-node-sdk sandbox sandbox-pay-in --account-id=ID --amount=DECIMAL --currency=rub|usd --confirm [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts',
      '--amount=DECIMAL      Positive decimal amount, up to 9 fractional digits',
      '--confirm             Required side-effect confirmation flag'
    ],
    optional: [
      '--currency=rub|usd    Pay-in currency (default: rub)',
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
      'tinkoff-invest-node-sdk sandbox sandbox-pay-in --account-id=2000000000 --amount=1000 --currency=rub --confirm',
      'tinkoff-invest-node-sdk sandbox sandbox-pay-in --account-id=2000000000 --amount=1000 --currency=rub --confirm --format=json'
    ],
    notes: [
      'This command changes sandbox account balance and refuses to run without --confirm.',
      'Unknown currency values are rejected by CLI parsing; --currency=usd is accepted by the parser but fails as unsupported.'
    ]
  },
  'sandbox get-sandbox-withdraw-limits': {
    description: 'Print sandbox withdraw limits',
    sdkCall: 'sdk.sandbox.getSandboxWithdrawLimits',
    grpcMethod: 'SandboxService/GetSandboxWithdrawLimits',
    usage: [
      'tinkoff-invest-node-sdk sandbox get-sandbox-withdraw-limits --account-id=ID [options]'
    ],
    required: [
      '--account-id=ID       Sandbox account identifier from sandbox get-sandbox-accounts'
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
      'tinkoff-invest-node-sdk sandbox get-sandbox-withdraw-limits --account-id=2000000000',
      'tinkoff-invest-node-sdk sandbox get-sandbox-withdraw-limits --account-id=2000000000 --format=json'
    ]
  },
  help: {
    description: 'Show top-level or command-specific help',
    usage: [
      'tinkoff-invest-node-sdk help',
      'tinkoff-invest-node-sdk help <service> <method>',
      'tinkoff-invest-node-sdk <service> <method> --help'
    ],
    examples: [
      'tinkoff-invest-node-sdk help',
      'tinkoff-invest-node-sdk help operations get-portfolio',
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

export function resolveCommandHelpName(positionals: readonly unknown[]): CommandHelpName | undefined {
  const [serviceOrCommand, method] = positionals;

  if (serviceOrCommand === 'help' || serviceOrCommand === 'version') {
    return serviceOrCommand;
  }

  const commandName = `${String(serviceOrCommand)} ${String(method)}`;

  return isCommandHelpName(commandName) ? commandName : undefined;
}
