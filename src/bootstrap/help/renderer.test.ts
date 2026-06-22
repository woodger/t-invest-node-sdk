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
    assert.match(help, /accounts/);
    assert.match(help, /candles/);
    assert.match(help, /version/);
    assert.match(help, /tinkoff-invest-node-sdk --help/);
    assert.doesNotMatch(help, /Examples:/);
  });
});

describe('renderCommandHelp', () => {
  test('renders command-specific help page', () => {
    const help = renderCommandHelp('candles');

    assert.match(help, /candles - Print historical candles/);
    assert.match(help, /Required options:/);
    assert.match(help, /--instrument-id=ID/);
    assert.match(help, /Environment:/);
    assert.doesNotMatch(help, /Commands:/);
  });

  test('renders help command page', () => {
    const help = renderCommandHelp('help');

    assert.match(help, /help - Show top-level or command-specific help/);
    assert.match(help, /tinkoff-invest-node-sdk help <command>/);
  });
});
