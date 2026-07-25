import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  canonicalizeCommandName,
  cliDomains,
  commandActionName,
  commandDomainName
} from './domains';
import {
  commandHelp,
  renderCliHelp,
  renderCommandHelp,
  renderDomainHelp,
  renderHelp
} from './help';
import {
  commandLineCommands,
  commandNames,
  resolveCommand
} from './registry';

type CompatibilityAliasGroup = {
  preferred: string;
  aliases: readonly string[];
};

const compatibilityAliasGroups = [
  { preferred: 'account list', aliases: ['account get-accounts', 'users get-accounts'] },
  { preferred: 'account info', aliases: ['account get-info', 'users get-info'] },
  { preferred: 'account margin', aliases: ['account get-margin-attributes', 'users get-margin-attributes'] },
  { preferred: 'account tariff', aliases: ['account get-user-tariff', 'users get-user-tariff'] },
  { preferred: 'market candles', aliases: ['market get-candles', 'marketdata get-candles'] },
  { preferred: 'market close-prices', aliases: ['market get-close-prices', 'marketdata get-close-prices'] },
  { preferred: 'market last-prices', aliases: ['market get-last-prices', 'marketdata get-last-prices'] },
  { preferred: 'market trades', aliases: ['market get-last-trades', 'marketdata get-last-trades'] },
  { preferred: 'market order-book', aliases: ['market get-order-book', 'marketdata get-order-book'] },
  { preferred: 'market status', aliases: ['market get-trading-status', 'marketdata get-trading-status'] },
  { preferred: 'market statuses', aliases: ['market get-trading-statuses', 'marketdata get-trading-statuses'] },
  { preferred: 'instrument search', aliases: ['instrument find-instrument', 'instruments find-instrument'] },
  { preferred: 'instrument show', aliases: ['instrument get-instrument-by', 'instruments get-instrument-by'] },
  { preferred: 'instrument dividends', aliases: ['instrument get-dividends', 'instruments get-dividends'] },
  { preferred: 'instrument schedules', aliases: ['instrument trading-schedules', 'instruments trading-schedules'] },
  { preferred: 'instrument favorite list', aliases: ['instrument get-favorites', 'instruments get-favorites'] },
  { preferred: 'instrument favorite edit', aliases: ['instrument edit-favorites', 'instruments edit-favorites'] },
  { preferred: 'instrument share list', aliases: ['instrument shares', 'instruments shares'] },
  { preferred: 'instrument share show', aliases: ['instrument share-by', 'instruments share-by'] },
  { preferred: 'instrument bond list', aliases: ['instrument bonds', 'instruments bonds'] },
  { preferred: 'instrument bond show', aliases: ['instrument bond-by', 'instruments bond-by'] },
  {
    preferred: 'instrument bond coupons',
    aliases: ['instrument get-bond-coupons', 'instruments get-bond-coupons']
  },
  {
    preferred: 'instrument bond accrued',
    aliases: ['instrument get-accrued-interests', 'instruments get-accrued-interests']
  },
  { preferred: 'instrument etf list', aliases: ['instrument etfs', 'instruments etfs'] },
  { preferred: 'instrument etf show', aliases: ['instrument etf-by', 'instruments etf-by'] },
  { preferred: 'instrument currency list', aliases: ['instrument currencies', 'instruments currencies'] },
  { preferred: 'instrument currency show', aliases: ['instrument currency-by', 'instruments currency-by'] },
  { preferred: 'instrument future list', aliases: ['instrument futures', 'instruments futures'] },
  { preferred: 'instrument future show', aliases: ['instrument future-by', 'instruments future-by'] },
  {
    preferred: 'instrument future margin',
    aliases: ['instrument get-futures-margin', 'instruments get-futures-margin']
  },
  { preferred: 'instrument option list', aliases: ['instrument options-by', 'instruments options-by'] },
  { preferred: 'instrument option show', aliases: ['instrument option-by', 'instruments option-by'] },
  { preferred: 'instrument asset list', aliases: ['instrument get-assets', 'instruments get-assets'] },
  { preferred: 'instrument asset show', aliases: ['instrument get-asset-by', 'instruments get-asset-by'] },
  { preferred: 'instrument brand list', aliases: ['instrument get-brands', 'instruments get-brands'] },
  { preferred: 'instrument brand show', aliases: ['instrument get-brand-by', 'instruments get-brand-by'] },
  { preferred: 'instrument country list', aliases: ['instrument get-countries', 'instruments get-countries'] },
  { preferred: 'order list', aliases: ['order get-orders', 'orders get-orders'] },
  { preferred: 'order show', aliases: ['order get-order-state', 'orders get-order-state'] },
  { preferred: 'order place', aliases: ['order post-order', 'orders post-order'] },
  { preferred: 'order cancel', aliases: ['order cancel-order', 'orders cancel-order'] },
  { preferred: 'order replace', aliases: ['order replace-order', 'orders replace-order'] },
  { preferred: 'stop-order list', aliases: ['stop-order get-stop-orders', 'stoporders get-stop-orders'] },
  { preferred: 'stop-order place', aliases: ['stop-order post-stop-order', 'stoporders post-stop-order'] },
  { preferred: 'stop-order cancel', aliases: ['stop-order cancel-stop-order', 'stoporders cancel-stop-order'] },
  { preferred: 'operation list', aliases: ['operation get-operations', 'operations get-operations'] },
  {
    preferred: 'operation page',
    aliases: ['operation get-operations-by-cursor', 'operations get-operations-by-cursor']
  },
  {
    preferred: 'operation broker-report',
    aliases: ['operation get-broker-report', 'operations get-broker-report']
  },
  {
    preferred: 'operation foreign-dividends-report',
    aliases: [
      'operation get-dividends-foreign-issuer',
      'operations get-dividends-foreign-issuer'
    ]
  },
  { preferred: 'operation portfolio', aliases: ['operation get-portfolio', 'operations get-portfolio'] },
  { preferred: 'operation positions', aliases: ['operation get-positions', 'operations get-positions'] },
  {
    preferred: 'operation withdraw-limits',
    aliases: ['operation get-withdraw-limits', 'operations get-withdraw-limits']
  },
  { preferred: 'sandbox account list', aliases: ['sandbox get-sandbox-accounts'] },
  { preferred: 'sandbox account open', aliases: ['sandbox open-sandbox-account'] },
  { preferred: 'sandbox account close', aliases: ['sandbox close-sandbox-account'] },
  { preferred: 'sandbox order list', aliases: ['sandbox get-sandbox-orders'] },
  { preferred: 'sandbox order show', aliases: ['sandbox get-sandbox-order-state'] },
  { preferred: 'sandbox order place', aliases: ['sandbox post-sandbox-order'] },
  { preferred: 'sandbox order replace', aliases: ['sandbox replace-sandbox-order'] },
  { preferred: 'sandbox order cancel', aliases: ['sandbox cancel-sandbox-order'] },
  { preferred: 'sandbox position list', aliases: ['sandbox get-sandbox-positions'] },
  { preferred: 'sandbox operation list', aliases: ['sandbox get-sandbox-operations'] },
  {
    preferred: 'sandbox operation page',
    aliases: ['sandbox get-sandbox-operations-by-cursor']
  },
  { preferred: 'sandbox portfolio', aliases: ['sandbox get-sandbox-portfolio'] },
  { preferred: 'sandbox withdraw-limits', aliases: ['sandbox get-sandbox-withdraw-limits'] },
  { preferred: 'sandbox pay-in', aliases: ['sandbox sandbox-pay-in'] },
  { preferred: 'dev compile-proto', aliases: ['compile-proto'] }
] as const satisfies readonly CompatibilityAliasGroup[];

const directPreferredPaths = [
  'stream run',
  'help',
  'version'
] as const;

const mixedAliasNames = [
  'users list',
  'marketdata candles',
  'orders place',
  'stoporders list',
  'operations portfolio',
  'instruments share list',
  'sandbox account get-sandbox-accounts',
  'sandbox order post-sandbox-order'
] as const;

function commandPath(commandName: string): string[] {
  return commandName.split(' ');
}

function hasDomainCommandLine(help: string, actionName: string): boolean {
  return help.split('\n').some((line) => line.startsWith(`  ${actionName} `));
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

describe('CLI contract inventory', () => {
  test('matches preferred command help surface', () => {
    const preferredCommandNames = [
      ...compatibilityAliasGroups.map(({ preferred }) => preferred),
      ...directPreferredPaths
    ];

    assert.equal(preferredCommandNames.length, 70);
    assert.deepEqual(
      uniqueSorted(Object.keys(commandHelp)),
      uniqueSorted(preferredCommandNames)
    );
    assert.deepEqual(
      uniqueSorted(commandNames),
      uniqueSorted(preferredCommandNames)
    );
    assert.equal(commandLineCommands.definitions.length, preferredCommandNames.length);

    for (const commandName of preferredCommandNames) {
      const path = commandPath(commandName);
      const command = resolveCommand(path);

      assert.equal(command.name, commandName);
      assert.deepEqual(command.path, path);
      assert.deepEqual(command.matchedPath, path);
    }
  });

  test('normalizes compatibility aliases and command help to preferred paths', () => {
    for (const { preferred, aliases } of compatibilityAliasGroups) {
      assert.equal(canonicalizeCommandName(preferred), preferred);

      for (const alias of aliases) {
        const preferredPath = commandPath(preferred);
        const aliasPath = commandPath(alias);
        const command = resolveCommand(aliasPath);

        assert.equal(canonicalizeCommandName(alias), preferred);
        assert.equal(command.name, preferred);
        assert.deepEqual(command.path, preferredPath);
        assert.deepEqual(command.matchedPath, aliasPath);
        assert.equal(renderHelp(commandPath(alias)), renderCommandHelp(preferred));
      }
    }
  });

  test('does not create mixed legacy-domain friendly aliases', () => {
    for (const commandName of mixedAliasNames) {
      assert.equal(
        commandNames.some((registeredName) => registeredName === String(commandName)),
        false
      );
      assert.throws(
        () => resolveCommand(commandPath(commandName)),
        /is not a program command/
      );
      assert.equal(renderHelp(commandPath(commandName)), renderCliHelp());
    }
  });

  test('renders top-level help with domains only', () => {
    const help = renderCliHelp();

    for (const domainName of Object.keys(cliDomains)) {
      assert.match(help, new RegExp(`\\n {2}${domainName}\\s+`));
    }

    for (const { preferred } of compatibilityAliasGroups) {
      assert.equal(hasDomainCommandLine(help, preferred), false);
    }
  });

  test('renders domain help with preferred actions only', () => {
    for (const { preferred, aliases } of compatibilityAliasGroups) {
      const domainName = commandDomainName(preferred);

      if (domainName === undefined) {
        continue;
      }

      const help = renderDomainHelp(domainName);

      assert.equal(hasDomainCommandLine(help, commandActionName(preferred)), true);

      for (const alias of aliases) {
        if (commandDomainName(alias) !== domainName) {
          continue;
        }

        assert.equal(hasDomainCommandLine(help, commandActionName(alias)), false);
      }
    }
  });
});
