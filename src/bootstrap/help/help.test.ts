import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from '../cli-contract';
import { isHelpRequested, renderHelp } from './help';
import { renderCliHelp, renderCommandHelp } from './renderer';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: [],
    ...args
  };
}

describe('isHelpRequested', () => {
  test('detects help flag aliases', () => {
    assert.equal(isHelpRequested(argv({ help: true })), true);
    assert.equal(isHelpRequested(argv({ h: true })), true);
    assert.equal(isHelpRequested(argv({ help: false })), false);
  });
});

describe('renderHelp', () => {
  test('returns command-specific help for known command name', () => {
    assert.equal(
      renderHelp(argv({
        _: ['candles'],
        help: true
      })),
      renderCommandHelp('candles')
    );
  });

  test('returns top-level help for unknown command name', () => {
    assert.equal(
      renderHelp(argv({
        _: ['unknown'],
        help: true
      })),
      renderCliHelp()
    );
  });

  test('returns top-level help when command name is absent', () => {
    assert.equal(renderHelp(argv({ help: true })), renderCliHelp());
  });
});
