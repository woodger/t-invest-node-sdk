/**
 * Модуль CLI domains задает публичную доменную структуру командной строки.
 *
 * Здесь допустимы:
 * - описание публичных CLI domains;
 * - преобразование между friendly, technical и legacy command paths;
 * - helpers для domain-level help и registry aliases.
 *
 * Здесь не должно быть исполнения команд, SDK wiring или command-specific parsing.
 */

export const cliDomains = {
  account: {
    description: 'Accounts, user info, tariff and limits'
  },
  instrument: {
    description: 'Shares, bonds, ETFs, currencies, futures, options and dictionaries'
  },
  market: {
    description: 'Historical and live market data'
  },
  order: {
    description: 'Real account orders'
  },
  'stop-order': {
    description: 'Real account stop orders'
  },
  operation: {
    description: 'Operations and broker reports'
  },
  sandbox: {
    description: 'Sandbox accounts, orders and portfolio'
  },
  stream: {
    description: 'Streaming API runners'
  },
  dev: {
    description: 'Developer tools'
  }
} as const;

export type CliDomainName = keyof typeof cliDomains;
export type CliCommandPath = readonly [string, ...string[]];

const publicDomainByLegacyHead = {
  users: 'account',
  instruments: 'instrument',
  marketdata: 'market',
  orders: 'order',
  stoporders: 'stop-order',
  operations: 'operation',
  sandbox: 'sandbox',
  stream: 'stream'
} as const satisfies Record<string, CliDomainName>;

const legacyHeadByPublicDomain: Partial<Record<CliDomainName, string>> = {
  account: 'users',
  instrument: 'instruments',
  market: 'marketdata',
  order: 'orders',
  'stop-order': 'stoporders',
  operation: 'operations'
} as const;

const friendlyActionByTechnicalAction: Partial<Record<CliDomainName, Record<string, string>>> = {
  account: {
    'get-accounts': 'list',
    'get-info': 'info',
    'get-margin-attributes': 'margin',
    'get-user-tariff': 'tariff'
  },
  market: {
    'get-candles': 'candles',
    'get-close-prices': 'close-prices',
    'get-last-prices': 'last-prices',
    'get-last-trades': 'trades',
    'get-order-book': 'order-book',
    'get-trading-status': 'status',
    'get-trading-statuses': 'statuses'
  },
  order: {
    'get-orders': 'list',
    'get-order-state': 'show',
    'post-order': 'place',
    'cancel-order': 'cancel',
    'replace-order': 'replace'
  }
} as const;

const technicalActionByFriendlyAction: Partial<Record<CliDomainName, Record<string, string>>> = {
  account: {
    list: 'get-accounts',
    info: 'get-info',
    margin: 'get-margin-attributes',
    tariff: 'get-user-tariff'
  },
  market: {
    candles: 'get-candles',
    'close-prices': 'get-close-prices',
    'last-prices': 'get-last-prices',
    trades: 'get-last-trades',
    'order-book': 'get-order-book',
    status: 'get-trading-status',
    statuses: 'get-trading-statuses'
  },
  order: {
    list: 'get-orders',
    show: 'get-order-state',
    place: 'post-order',
    cancel: 'cancel-order',
    replace: 'replace-order'
  }
} as const;

export const cliDomainNames = Object.keys(cliDomains) as CliDomainName[];

export function isCliDomainName(value: unknown): value is CliDomainName {
  return typeof value === 'string' && value in cliDomains;
}

export function commandPathToName(path: readonly string[]): string {
  return path.join(' ');
}

export function commandNameToPath(name: string): CliCommandPath {
  const path = name.split(' ');

  if (path[0] === undefined || path[0] === '') {
    throw new Error('Expected command name');
  }

  return path as unknown as CliCommandPath;
}

export function canonicalizeCommandPath(path: CliCommandPath): CliCommandPath {
  return friendlyCommandPath(publicDomainPath(path));
}

export function canonicalizeCommandName(name: string): string {
  return commandPathToName(canonicalizeCommandPath(commandNameToPath(name)));
}

export function commandPathAliases(path: CliCommandPath): CliCommandPath[] {
  const canonicalPath = canonicalizeCommandPath(path);
  const technicalPath = technicalCommandPath(canonicalPath);
  const legacyPath = legacyCommandPath(technicalPath ?? canonicalPath);

  return uniqueCommandPaths([
    canonicalPath,
    technicalPath,
    legacyPath
  ]);
}

export function commandDomainName(commandName: string): CliDomainName | undefined {
  const [domain] = commandName.split(' ');

  return isCliDomainName(domain) ? domain : undefined;
}

export function commandActionName(commandName: string): string {
  return commandName.split(' ').slice(1).join(' ');
}

function isLegacyPathHead(value: string): value is keyof typeof publicDomainByLegacyHead {
  return value in publicDomainByLegacyHead;
}

function publicDomainPath(path: CliCommandPath): CliCommandPath {
  const [head, ...tail] = path;

  if (head === 'compile-proto') {
    return ['dev', 'compile-proto'];
  }

  const domain = isLegacyPathHead(head) ? publicDomainByLegacyHead[head] : undefined;

  if (domain === undefined) {
    return path;
  }

  return [domain, ...tail];
}

function friendlyCommandPath(path: CliCommandPath): CliCommandPath {
  const [domain, action, ...tail] = path;

  if (action === undefined || !isCliDomainName(domain)) {
    return path;
  }

  const friendlyAction = friendlyActionByTechnicalAction[domain]?.[action];

  return friendlyAction === undefined ? path : [domain, friendlyAction, ...tail];
}

function technicalCommandPath(path: CliCommandPath): CliCommandPath | undefined {
  const [domain, action, ...tail] = path;

  if (action === undefined || !isCliDomainName(domain)) {
    return undefined;
  }

  const technicalAction = technicalActionByFriendlyAction[domain]?.[action];

  return technicalAction === undefined ? undefined : [domain, technicalAction, ...tail];
}

function legacyCommandPath(path: CliCommandPath): CliCommandPath | undefined {
  const [head, ...tail] = path;

  if (head === 'dev' && tail[0] === 'compile-proto') {
    return ['compile-proto', ...tail.slice(1)];
  }

  if (!isCliDomainName(head)) {
    return undefined;
  }

  const legacyHead = legacyHeadByPublicDomain[head];

  return legacyHead === undefined ? undefined : [legacyHead, ...tail];
}

function uniqueCommandPaths(paths: readonly (CliCommandPath | undefined)[]): CliCommandPath[] {
  const names = new Set<string>();
  const result: CliCommandPath[] = [];

  for (const path of paths) {
    if (path === undefined) {
      continue;
    }

    const name = commandPathToName(path);

    if (names.has(name)) {
      continue;
    }

    names.add(name);
    result.push(path);
  }

  return result;
}
