/**
 * Модуль CLI domains задает публичную доменную структуру командной строки.
 *
 * Здесь допустимы:
 * - описание публичных CLI domains;
 * - преобразование между публичными domain paths и legacy service paths;
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

export function canonicalizeCommandName(name: string): string {
  return commandPathToName(canonicalizeCommandPath(commandNameToPath(name)));
}

export function commandPathAliases(path: CliCommandPath): CliCommandPath[] {
  const canonicalPath = canonicalizeCommandPath(path);
  const legacyPath = legacyCommandPath(canonicalPath);

  if (
    legacyPath === undefined ||
    commandPathToName(canonicalPath) === commandPathToName(legacyPath)
  ) {
    return [canonicalPath];
  }

  return [
    canonicalPath,
    legacyPath
  ];
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
