import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandNames, resolveCommand } from './registry';
import {
  commandHelp,
  isCommandHelpName,
  isHelpRequested,
  renderDomainHelp,
  renderCliHelp,
  renderCommandHelp,
  renderHelp
} from './help';
import { cliDomainNames } from './domains';

const unknownHelpNames = [
  'instruments options',
  'marketdata stream',
  'portfolio',
  'unknown-command',
  undefined
] as const;

describe('commandHelp', () => {
  test('contains help entries for canonical public bootstrap commands', () => {
    for (const commandName of Object.keys(commandHelp)) {
      assert.equal(commandNames.includes(commandName), true);
    }

    assert.equal('account get-accounts' in commandHelp, true);
    assert.equal('market get-candles' in commandHelp, true);
    assert.equal('instrument bonds' in commandHelp, true);
    assert.equal('order post-order' in commandHelp, true);
    assert.equal('stop-order get-stop-orders' in commandHelp, true);
    assert.equal('operation get-portfolio' in commandHelp, true);
    assert.equal('dev compile-proto' in commandHelp, true);
    assert.equal('users get-accounts' in commandHelp, false);
    assert.equal('marketdata get-candles' in commandHelp, false);
    assert.equal('compile-proto' in commandHelp, false);
  });
});

describe('isCommandHelpName', () => {
  test('accepts canonical help command names only', () => {
    for (const commandName of Object.keys(commandHelp)) {
      assert.equal(isCommandHelpName(commandName), true);
    }

    for (const commandName of unknownHelpNames) {
      assert.equal(isCommandHelpName(commandName), false);
    }
  });
});

describe('isHelpRequested', () => {
  test('detects help flag aliases', () => {
    assert.equal(isHelpRequested({ help: true }), true);
    assert.equal(isHelpRequested({ h: true }), true);
    assert.equal(isHelpRequested({ help: false }), false);
  });
});

describe('renderHelp', () => {
  test('returns command-specific help for known command name', () => {
    assert.equal(
      renderHelp(['market', 'get-candles']),
      renderCommandHelp('market get-candles')
    );
  });

  test('returns command-specific help for legacy command name', () => {
    assert.equal(
      renderHelp(['marketdata', 'get-candles']),
      renderCommandHelp('market get-candles')
    );
  });

  test('returns domain help for known domain name', () => {
    assert.equal(
      renderHelp(['account']),
      renderDomainHelp('account')
    );
  });

  test('returns top-level help for unknown command name', () => {
    assert.equal(
      renderHelp(['unknown']),
      renderCliHelp()
    );
  });

  test('returns top-level help when command name is absent', () => {
    assert.equal(renderHelp([]), renderCliHelp());
  });
});

describe('renderCliHelp', () => {
  test('renders top-level help page', () => {
    const help = renderCliHelp();

    assert.match(help, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
    assert.match(help, /Usage:/);
    assert.match(help, /Domains:/);
    assert.match(help, /Global options:/);
    assert.match(help, /account\s+Accounts, user info, tariff and limits/);
    assert.match(help, /instrument\s+Shares, bonds, ETFs, currencies, futures, options and dictionaries/);
    assert.match(help, /market\s+Historical and live market data/);
    assert.match(help, /order\s+Real account orders/);
    assert.match(help, /stop-order\s+Real account stop orders/);
    assert.match(help, /operation\s+Operations and broker reports/);
    assert.match(help, /sandbox\s+Sandbox accounts, orders and portfolio/);
    assert.match(help, /stream\s+Streaming API runners/);
    assert.match(help, /dev\s+Developer tools/);
    assert.match(help, /tinkoff-invest-node-sdk --help/);
    assert.doesNotMatch(help, /users get-accounts/);
    assert.doesNotMatch(help, /account get-accounts/);
    assert.doesNotMatch(help, /Examples:/);
  });
});

describe('renderDomainHelp', () => {
  test('renders domain commands that are registered in routing', () => {
    for (const domainName of cliDomainNames) {
      const help = renderDomainHelp(domainName);

      assert.match(help, new RegExp(`^tinkoff-invest-node-sdk \\d+\\.\\d+\\.\\d+\\n${domainName} - `));
      assert.match(help, /Commands:/);

      for (const commandName of Object.keys(commandHelp)) {
        if (!commandName.startsWith(`${domainName} `)) {
          continue;
        }

        const command = resolveCommand(commandName.split(' '));

        assert.equal(command.name, commandName);
        assert.match(help, new RegExp(commandName.split(' ').slice(1).join(' ')));
      }
    }
  });
});

describe('renderCommandHelp', () => {
  test('renders command-specific help page', () => {
    const help = renderCommandHelp('market get-candles');

    assert.match(help, /market get-candles - Print historical candles/);
    assert.match(help, /SDK call:\n {2}sdk\.marketdata\.getCandles/);
    assert.match(help, /gRPC method:\n {2}MarketDataService\/GetCandles/);
    assert.match(help, /Required options:/);
    assert.match(help, /--instrument-id=ID/);
    assert.match(help, /Environment:/);
    assert.match(help, /tinkoff-invest-node-sdk market get-candles --instrument-id=ID/);
    assert.doesNotMatch(help, /tinkoff-invest-node-sdk marketdata get-candles/);
    assert.doesNotMatch(help, /Commands:/);
  });

  test('renders help command page', () => {
    const help = renderCommandHelp('help');

    assert.match(help, /help - Show top-level or command-specific help/);
    assert.match(help, /tinkoff-invest-node-sdk help <domain> \[<command>\]/);
  });

  test('renders stream run command page', () => {
    const help = renderCommandHelp('stream run');

    assert.match(help, /stream run - Run a configured stream/);
    assert.match(help, /tinkoff-invest-node-sdk stream run --config=PATH/);
    assert.match(help, /static initial requests for marketdata\.marketDataStream/);
  });

  test('renders compile-proto command page', () => {
    const help = renderCommandHelp('dev compile-proto');

    assert.match(help, /dev compile-proto - Generate TypeScript contracts/);
    assert.match(help, /tinkoff-invest-node-sdk dev compile-proto/);
    assert.match(help, /system protoc/);
  });
});
