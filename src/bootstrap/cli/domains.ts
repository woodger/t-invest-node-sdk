/**
 * Модуль CLI domains задает публичную доменную структуру командной строки.
 *
 * Здесь допустимы:
 * - описание публичных CLI domains;
 * - описание preferred command paths и compatibility aliases;
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

type CliPathAliasDefinition = {
  preferred: CliCommandPath;
  aliases: readonly CliCommandPath[];
};

const publicDomainByLegacyHead = {
  users: 'account',
  instruments: 'instrument',
  marketdata: 'market',
  orders: 'order',
  stoporders: 'stop-order',
  operations: 'operation'
} as const satisfies Record<string, CliDomainName>;

const cliPathAliases = [
  {
    preferred: ['account', 'list'],
    aliases: [
      ['account', 'get-accounts'],
      ['users', 'get-accounts']
    ]
  },
  {
    preferred: ['account', 'info'],
    aliases: [
      ['account', 'get-info'],
      ['users', 'get-info']
    ]
  },
  {
    preferred: ['account', 'margin'],
    aliases: [
      ['account', 'get-margin-attributes'],
      ['users', 'get-margin-attributes']
    ]
  },
  {
    preferred: ['account', 'tariff'],
    aliases: [
      ['account', 'get-user-tariff'],
      ['users', 'get-user-tariff']
    ]
  },
  {
    preferred: ['market', 'candles'],
    aliases: [
      ['market', 'get-candles'],
      ['marketdata', 'get-candles']
    ]
  },
  {
    preferred: ['market', 'close-prices'],
    aliases: [
      ['market', 'get-close-prices'],
      ['marketdata', 'get-close-prices']
    ]
  },
  {
    preferred: ['market', 'last-prices'],
    aliases: [
      ['market', 'get-last-prices'],
      ['marketdata', 'get-last-prices']
    ]
  },
  {
    preferred: ['market', 'trades'],
    aliases: [
      ['market', 'get-last-trades'],
      ['marketdata', 'get-last-trades']
    ]
  },
  {
    preferred: ['market', 'order-book'],
    aliases: [
      ['market', 'get-order-book'],
      ['marketdata', 'get-order-book']
    ]
  },
  {
    preferred: ['market', 'status'],
    aliases: [
      ['market', 'get-trading-status'],
      ['marketdata', 'get-trading-status']
    ]
  },
  {
    preferred: ['market', 'statuses'],
    aliases: [
      ['market', 'get-trading-statuses'],
      ['marketdata', 'get-trading-statuses']
    ]
  },
  {
    preferred: ['order', 'list'],
    aliases: [
      ['order', 'get-orders'],
      ['orders', 'get-orders']
    ]
  },
  {
    preferred: ['order', 'show'],
    aliases: [
      ['order', 'get-order-state'],
      ['orders', 'get-order-state']
    ]
  },
  {
    preferred: ['order', 'place'],
    aliases: [
      ['order', 'post-order'],
      ['orders', 'post-order']
    ]
  },
  {
    preferred: ['order', 'cancel'],
    aliases: [
      ['order', 'cancel-order'],
      ['orders', 'cancel-order']
    ]
  },
  {
    preferred: ['order', 'replace'],
    aliases: [
      ['order', 'replace-order'],
      ['orders', 'replace-order']
    ]
  },
  {
    preferred: ['dev', 'compile-proto'],
    aliases: [
      ['compile-proto']
    ]
  }
] as const satisfies readonly CliPathAliasDefinition[];

const preferredPathByAliasName = createPreferredPathByAliasName(cliPathAliases);
const aliasPathsByPreferredName = createAliasPathsByPreferredName(cliPathAliases);
const explicitAliasDomains = createExplicitAliasDomains(cliPathAliases);

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
  const preferredPath = preferredPathByAliasName.get(commandPathToName(path));

  if (preferredPath !== undefined) {
    return preferredPath;
  }

  const publicPath = publicDomainPath(path);

  if (commandPathToName(publicPath) === commandPathToName(path)) {
    return publicPath;
  }

  const [domain] = publicPath;

  return isCliDomainName(domain) && explicitAliasDomains.has(domain) ? path : publicPath;
}

export function canonicalizeCommandName(name: string): string {
  return commandPathToName(canonicalizeCommandPath(commandNameToPath(name)));
}

export function commandPathAliases(path: CliCommandPath): CliCommandPath[] {
  const canonicalPath = canonicalizeCommandPath(path);
  const aliasPaths = aliasPathsByPreferredName.get(commandPathToName(canonicalPath));

  if (aliasPaths !== undefined) {
    return uniqueCommandPaths([canonicalPath, ...aliasPaths]);
  }

  return uniqueCommandPaths([canonicalPath, legacyCommandPath(canonicalPath)]);
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

function createPreferredPathByAliasName(
  pathAliases: readonly CliPathAliasDefinition[]
): Map<string, CliCommandPath> {
  const result = new Map<string, CliCommandPath>();

  for (const { preferred, aliases } of pathAliases) {
    result.set(commandPathToName(preferred), preferred);

    for (const alias of aliases) {
      result.set(commandPathToName(alias), preferred);
    }
  }

  return result;
}

function createAliasPathsByPreferredName(
  pathAliases: readonly CliPathAliasDefinition[]
): Map<string, readonly CliCommandPath[]> {
  const result = new Map<string, readonly CliCommandPath[]>();

  for (const { preferred, aliases } of pathAliases) {
    result.set(commandPathToName(preferred), aliases);
  }

  return result;
}

function createExplicitAliasDomains(
  pathAliases: readonly CliPathAliasDefinition[]
): ReadonlySet<CliDomainName> {
  const result = new Set<CliDomainName>();

  for (const { preferred } of pathAliases) {
    const [domain] = preferred;

    if (isCliDomainName(domain)) {
      result.add(domain);
    }
  }

  return result;
}

function publicDomainPath(path: CliCommandPath): CliCommandPath {
  const [head, ...tail] = path;

  const domain = isLegacyPathHead(head) ? publicDomainByLegacyHead[head] : undefined;

  if (domain === undefined) {
    return path;
  }

  return [domain, ...tail];
}

function legacyCommandPath(path: CliCommandPath): CliCommandPath | undefined {
  const [head, ...tail] = path;

  if (!isCliDomainName(head)) {
    return undefined;
  }

  const legacyHead = legacyHeadForDomain(head);

  return legacyHead === undefined ? undefined : [legacyHead, ...tail];
}

function legacyHeadForDomain(domain: CliDomainName): string | undefined {
  for (const [legacyHead, publicDomain] of Object.entries(publicDomainByLegacyHead)) {
    if (publicDomain === domain) {
      return legacyHead;
    }
  }

  return undefined;
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
