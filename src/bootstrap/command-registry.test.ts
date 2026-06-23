import assert from 'node:assert';
import { describe, test } from 'node:test';
import { isCommandName, resolveCommand } from './command-registry';

describe('resolveCommand', () => {
  test('resolves accounts command without context requirement', () => {
    const command = resolveCommand('accounts');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves candles command without context requirement', () => {
    const command = resolveCommand('candles');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves portfolio command without context requirement', () => {
    const command = resolveCommand('portfolio');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves last-prices command without context requirement', () => {
    const command = resolveCommand('last-prices');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves positions command without context requirement', () => {
    const command = resolveCommand('positions');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves orders command without context requirement', () => {
    const command = resolveCommand('orders');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves help command without context requirement', () => {
    const command = resolveCommand('help');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves version command without context requirement', () => {
    const command = resolveCommand('version');

    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('throws for unknown command', () => {
    assert.throws(
      () => resolveCommand('unknown-command'),
      /is not a program command/
    );
  });
});

describe('isCommandName', () => {
  test('accepts registered command names only', () => {
    assert.equal(isCommandName('accounts'), true);
    assert.equal(isCommandName('candles'), true);
    assert.equal(isCommandName('last-prices'), true);
    assert.equal(isCommandName('orders'), true);
    assert.equal(isCommandName('portfolio'), true);
    assert.equal(isCommandName('positions'), true);
    assert.equal(isCommandName('help'), true);
    assert.equal(isCommandName('version'), true);
    assert.equal(isCommandName('unknown-command'), false);
    assert.equal(isCommandName(undefined), false);
  });
});
