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
