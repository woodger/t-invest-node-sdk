import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from './cli-contract';
import {
  isHelpRequested,
  renderCliHelp,
  renderCommandHelp,
  renderHelp
} from './help';

function argv(args: Partial<CliArgs>): CliArgs {
  return {
    _: [],
    ...args
  };
}

describe('help', () => {
  test('detects help flag aliases', () => {
    assert.equal(isHelpRequested(argv({ help: true })), true);
    assert.equal(isHelpRequested(argv({ h: true })), true);
    assert.equal(isHelpRequested(argv({ help: false })), false);
  });

  test('renders top-level help page', () => {
    const help = renderCliHelp();

    assert.match(help, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
    assert.match(help, /Usage:/);
    assert.match(help, /Global options:/);
    assert.match(help, /Commands:/);
    assert.match(help, /accounts/);
    assert.match(help, /candles/);
    assert.match(help, /version/);
  });

  test('renders command-specific help from command help flag', () => {
    const help = renderHelp(argv({
      _: ['candles'],
      help: true
    }));

    assert.match(help, /candles - Print historical candles/);
    assert.match(help, /Required options:/);
    assert.match(help, /--instrument-id=ID/);
    assert.match(help, /Environment:/);
    assert.doesNotMatch(help, /Commands:/);
  });

  test('keeps top-level help for unknown command help', () => {
    const help = renderHelp(argv({
      _: ['unknown'],
      help: true
    }));

    assert.match(help, /Commands:/);
    assert.match(help, /tinkoff-invest-node-sdk <command> --help/);
  });

  test('renders direct command help', () => {
    const help = renderCommandHelp('help');

    assert.match(help, /help - Show top-level or command-specific help/);
    assert.match(help, /tinkoff-invest-node-sdk help <command>/);
  });
});
