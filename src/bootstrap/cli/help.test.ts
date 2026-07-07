import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandNames } from './registry';
import {
  commandHelp,
  isCommandHelpName,
  isHelpRequested,
  renderCliHelp,
  renderCommandHelp,
  renderHelp
} from './help';

const unknownHelpNames = [
  'instruments options',
  'marketdata stream',
  'portfolio',
  'unknown-command',
  undefined
] as const;

describe('commandHelp', () => {
  test('contains help entries for registered public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [...commandNames].sort()
    );
  });
});

describe('isCommandHelpName', () => {
  test('accepts registered help command names only', () => {
    for (const commandName of commandNames) {
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
      renderHelp(['marketdata', 'get-candles']),
      renderCommandHelp('marketdata get-candles')
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
    assert.match(help, /Global options:/);
    assert.match(help, /Commands:/);
    assert.match(help, /users get-accounts/);
    assert.match(help, /users get-info/);
    assert.match(help, /users get-margin-attributes/);
    assert.match(help, /users get-user-tariff/);
    assert.match(help, /marketdata get-candles/);
    assert.match(help, /marketdata get-close-prices/);
    assert.match(help, /instruments bond-by/);
    assert.match(help, /instruments bonds/);
    assert.match(help, /instruments find-instrument/);
    assert.match(help, /instruments get-accrued-interests/);
    assert.match(help, /instruments get-asset-by/);
    assert.match(help, /instruments get-assets/);
    assert.match(help, /instruments get-bond-coupons/);
    assert.match(help, /instruments get-brand-by/);
    assert.match(help, /instruments get-brands/);
    assert.match(help, /instruments get-countries/);
    assert.match(help, /instruments currencies/);
    assert.match(help, /instruments currency-by/);
    assert.match(help, /instruments etf-by/);
    assert.match(help, /instruments etfs/);
    assert.match(help, /instruments get-dividends/);
    assert.match(help, /instruments get-favorites/);
    assert.match(help, /instruments edit-favorites/);
    assert.match(help, /instruments future-by/);
    assert.match(help, /instruments futures/);
    assert.match(help, /instruments get-futures-margin/);
    assert.match(help, /instruments option-by/);
    assert.match(help, /instruments options-by/);
    assert.match(help, /instruments share-by/);
    assert.match(help, /instruments shares/);
    assert.match(help, /marketdata get-last-prices/);
    assert.match(help, /instruments trading-schedules/);
    assert.match(help, /marketdata get-last-trades/);
    assert.match(help, /marketdata get-order-book/);
    assert.match(help, /marketdata get-trading-status/);
    assert.match(help, /marketdata get-trading-statuses/);
    assert.match(help, /operations get-broker-report/);
    assert.match(help, /operations get-dividends-foreign-issuer/);
    assert.match(help, /operations get-operations/);
    assert.match(help, /operations get-operations-by-cursor/);
    assert.match(help, /operations get-portfolio/);
    assert.match(help, /operations get-positions/);
    assert.match(help, /operations get-withdraw-limits/);
    assert.match(help, /orders get-order-state/);
    assert.match(help, /orders post-order/);
    assert.match(help, /orders cancel-order/);
    assert.match(help, /orders replace-order/);
    assert.match(help, /stoporders post-stop-order/);
    assert.match(help, /stoporders cancel-stop-order/);
    assert.match(help, /stoporders get-stop-orders/);
    assert.match(help, /sandbox open-sandbox-account/);
    assert.match(help, /sandbox get-sandbox-accounts/);
    assert.match(help, /sandbox close-sandbox-account/);
    assert.match(help, /sandbox post-sandbox-order/);
    assert.match(help, /sandbox replace-sandbox-order/);
    assert.match(help, /sandbox get-sandbox-orders/);
    assert.match(help, /sandbox cancel-sandbox-order/);
    assert.match(help, /sandbox get-sandbox-order-state/);
    assert.match(help, /sandbox get-sandbox-positions/);
    assert.match(help, /sandbox get-sandbox-operations/);
    assert.match(help, /sandbox get-sandbox-operations-by-cursor/);
    assert.match(help, /sandbox get-sandbox-portfolio/);
    assert.match(help, /sandbox sandbox-pay-in/);
    assert.match(help, /sandbox get-sandbox-withdraw-limits/);
    assert.match(help, /stream run/);
    assert.match(help, /compile-proto/);
    assert.match(help, /version/);
    assert.match(help, /tinkoff-invest-node-sdk --help/);
    assert.doesNotMatch(help, /Examples:/);
  });
});

describe('renderCommandHelp', () => {
  test('renders command-specific help page', () => {
    const help = renderCommandHelp('marketdata get-candles');

    assert.match(help, /marketdata get-candles - Print historical candles/);
    assert.match(help, /SDK call:\n {2}sdk\.marketdata\.getCandles/);
    assert.match(help, /gRPC method:\n {2}MarketDataService\/GetCandles/);
    assert.match(help, /Required options:/);
    assert.match(help, /--instrument-id=ID/);
    assert.match(help, /Environment:/);
    assert.doesNotMatch(help, /Commands:/);
  });

  test('renders help command page', () => {
    const help = renderCommandHelp('help');

    assert.match(help, /help - Show top-level or command-specific help/);
    assert.match(help, /tinkoff-invest-node-sdk help <service> <method>/);
  });

  test('renders stream run command page', () => {
    const help = renderCommandHelp('stream run');

    assert.match(help, /stream run - Run a configured stream/);
    assert.match(help, /tinkoff-invest-node-sdk stream run --config=PATH/);
    assert.match(help, /static initial requests for marketdata\.marketDataStream/);
  });

  test('renders compile-proto command page', () => {
    const help = renderCommandHelp('compile-proto');

    assert.match(help, /compile-proto - Generate TypeScript contracts/);
    assert.match(help, /tinkoff-invest-node-sdk compile-proto/);
    assert.match(help, /system protoc/);
  });
});
