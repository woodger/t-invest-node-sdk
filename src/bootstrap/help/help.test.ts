import assert from 'node:assert';
import { describe, test } from 'node:test';
import { isHelpRequested, renderHelp } from './help';
import { renderCliHelp, renderCommandHelp } from './renderer';

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
