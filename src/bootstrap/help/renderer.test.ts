import assert from 'node:assert';
import { describe, test } from 'node:test';
import { renderCliHelp, renderCommandHelp } from './renderer';

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
    assert.match(help, /instruments get-bond-coupons/);
    assert.match(help, /instruments get-brand-by/);
    assert.match(help, /instruments get-brands/);
    assert.match(help, /instruments get-countries/);
    assert.match(help, /instruments currencies/);
    assert.match(help, /instruments currency-by/);
    assert.match(help, /instruments get-dividends/);
    assert.match(help, /instruments get-favorites/);
    assert.match(help, /instruments get-futures-margin/);
    assert.match(help, /instruments share-by/);
    assert.match(help, /instruments shares/);
    assert.match(help, /marketdata get-last-prices/);
    assert.match(help, /instruments trading-schedules/);
    assert.match(help, /marketdata get-last-trades/);
    assert.match(help, /marketdata get-order-book/);
    assert.match(help, /marketdata get-trading-status/);
    assert.match(help, /marketdata get-trading-statuses/);
    assert.match(help, /operations get-operations/);
    assert.match(help, /operations get-operations-by-cursor/);
    assert.match(help, /operations get-portfolio/);
    assert.match(help, /operations get-positions/);
    assert.match(help, /operations get-withdraw-limits/);
    assert.match(help, /orders get-order-state/);
    assert.match(help, /stoporders get-stop-orders/);
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
});
