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
