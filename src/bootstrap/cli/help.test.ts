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
  test('contains help entries for preferred public bootstrap commands', () => {
    for (const commandName of Object.keys(commandHelp)) {
      assert.equal(commandNames.includes(commandName), true);
    }

    assert.equal('account list' in commandHelp, true);
    assert.equal('market candles' in commandHelp, true);
    assert.equal('instrument bonds' in commandHelp, true);
    assert.equal('order place' in commandHelp, true);
    assert.equal('stop-order list' in commandHelp, true);
    assert.equal('operation portfolio' in commandHelp, true);
    assert.equal('dev compile-proto' in commandHelp, true);
    assert.equal('account get-accounts' in commandHelp, false);
    assert.equal('market get-candles' in commandHelp, false);
    assert.equal('order post-order' in commandHelp, false);
    assert.equal('stop-order get-stop-orders' in commandHelp, false);
    assert.equal('operation get-portfolio' in commandHelp, false);
    assert.equal('users get-accounts' in commandHelp, false);
    assert.equal('marketdata get-candles' in commandHelp, false);
    assert.equal('orders post-order' in commandHelp, false);
    assert.equal('stoporders get-stop-orders' in commandHelp, false);
    assert.equal('operations get-portfolio' in commandHelp, false);
    assert.equal('compile-proto' in commandHelp, false);
  });
});

describe('isCommandHelpName', () => {
  test('accepts preferred help command names only', () => {
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
      renderHelp(['market', 'candles']),
      renderCommandHelp('market candles')
    );
  });

  test('returns friendly command-specific help for technical command name', () => {
    assert.equal(
      renderHelp(['account', 'get-accounts']),
      renderCommandHelp('account list')
    );
    assert.equal(
      renderHelp(['market', 'get-candles']),
      renderCommandHelp('market candles')
    );
    assert.equal(
      renderHelp(['order', 'post-order']),
      renderCommandHelp('order place')
    );
    assert.equal(
      renderHelp(['stop-order', 'get-stop-orders']),
      renderCommandHelp('stop-order list')
    );
    assert.equal(
      renderHelp(['operation', 'get-portfolio']),
      renderCommandHelp('operation portfolio')
    );
  });

  test('returns command-specific help for legacy command name', () => {
    assert.equal(
      renderHelp(['users', 'get-accounts']),
      renderCommandHelp('account list')
    );
    assert.equal(
      renderHelp(['marketdata', 'get-candles']),
      renderCommandHelp('market candles')
    );
    assert.equal(
      renderHelp(['orders', 'post-order']),
      renderCommandHelp('order place')
    );
    assert.equal(
      renderHelp(['stoporders', 'get-stop-orders']),
      renderCommandHelp('stop-order list')
    );
    assert.equal(
      renderHelp(['operations', 'get-portfolio']),
      renderCommandHelp('operation portfolio')
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
    assert.equal(
      renderHelp(['stoporders', 'list']),
      renderCliHelp()
    );
    assert.equal(
      renderHelp(['operations', 'portfolio']),
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
    assert.doesNotMatch(help, /account list/);
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

  test('renders friendly stop-order and operation domain commands', () => {
    const stopOrderHelp = renderDomainHelp('stop-order');
    const operationHelp = renderDomainHelp('operation');

    assert.match(stopOrderHelp, /list\s+Print active stop orders/);
    assert.match(stopOrderHelp, /place\s+Post a stop order/);
    assert.match(stopOrderHelp, /cancel\s+Cancel a stop order/);
    assert.doesNotMatch(stopOrderHelp, /get-stop-orders\s+Print active stop orders/);
    assert.doesNotMatch(stopOrderHelp, /post-stop-order\s+Post a stop order/);

    assert.match(operationHelp, /list\s+Print account operations/);
    assert.match(operationHelp, /page\s+Print one cursor page of account operations/);
    assert.match(operationHelp, /broker-report\s+Generate or print a broker report page/);
    assert.match(
      operationHelp,
      /foreign-dividends-report\s+Generate or print a foreign issuer dividends report page/
    );
    assert.match(operationHelp, /portfolio\s+Print account portfolio/);
    assert.match(operationHelp, /positions\s+Print account positions/);
    assert.match(operationHelp, /withdraw-limits\s+Print account withdraw limits/);
    assert.doesNotMatch(operationHelp, /get-portfolio\s+Print account portfolio/);
    assert.doesNotMatch(operationHelp, /get-broker-report\s+Generate or print a broker report page/);
  });
});

describe('renderCommandHelp', () => {
  test('renders command-specific help page', () => {
    const help = renderCommandHelp('market candles');

    assert.match(help, /market candles - Print historical candles/);
    assert.match(help, /SDK call:\n {2}sdk\.marketdata\.getCandles/);
    assert.match(help, /gRPC method:\n {2}MarketDataService\/GetCandles/);
    assert.match(help, /Required options:/);
    assert.match(help, /--instrument-id=ID/);
    assert.match(help, /Environment:/);
    assert.match(help, /tinkoff-invest-node-sdk market candles --instrument-id=ID/);
    assert.doesNotMatch(help, /tinkoff-invest-node-sdk market get-candles/);
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

  test('renders extended command notes where short descriptions are not enough', () => {
    assert.match(
      renderCommandHelp('order place'),
      /--confirm is an SDK CLI safety guard; it is not a gRPC request field/
    );
    assert.match(
      renderCommandHelp('operation broker-report'),
      /Generate mode starts a report task; page mode reads an existing report task page/
    );
    assert.match(
      renderCommandHelp('stream run'),
      /Output is JSONL so each provider event can be processed as an independent line/
    );
  });

  test('renders compile-proto command page', () => {
    const help = renderCommandHelp('dev compile-proto');

    assert.match(help, /dev compile-proto - Generate TypeScript contracts/);
    assert.match(help, /tinkoff-invest-node-sdk dev compile-proto/);
    assert.match(help, /system protoc/);
    assert.match(help, /does not download upstream proto sources/);
  });
});
