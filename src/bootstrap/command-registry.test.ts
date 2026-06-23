import assert from 'node:assert';
import { describe, test } from 'node:test';
import { isCommandName, resolveCommand } from './command-registry';

describe('resolveCommand', () => {
  test('resolves accounts command without context requirement', () => {
    const command = resolveCommand(['users', 'get-accounts']);

    assert.equal(command.name, 'users get-accounts');
    assert.deepEqual(command.path, ['users', 'get-accounts']);
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves candles command without context requirement', () => {
    const command = resolveCommand(['marketdata', 'get-candles']);

    assert.equal(command.name, 'marketdata get-candles');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves instrument command without context requirement', () => {
    const command = resolveCommand(['instruments', 'get-instrument-by']);

    assert.equal(command.name, 'instruments get-instrument-by');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves portfolio command without context requirement', () => {
    const command = resolveCommand(['operations', 'get-portfolio']);

    assert.equal(command.name, 'operations get-portfolio');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves last-prices command without context requirement', () => {
    const command = resolveCommand(['marketdata', 'get-last-prices']);

    assert.equal(command.name, 'marketdata get-last-prices');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves positions command without context requirement', () => {
    const command = resolveCommand(['operations', 'get-positions']);

    assert.equal(command.name, 'operations get-positions');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves orders command without context requirement', () => {
    const command = resolveCommand(['orders', 'get-orders']);

    assert.equal(command.name, 'orders get-orders');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves help command without context requirement', () => {
    const command = resolveCommand(['help']);

    assert.equal(command.name, 'help');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves version command without context requirement', () => {
    const command = resolveCommand(['version']);

    assert.equal(command.name, 'version');
    assert.equal(command.requiresContext, false);
    assert.equal(typeof command.handler, 'function');
  });

  test('throws for unknown command', () => {
    assert.throws(
      () => resolveCommand(['unknown-command']),
      /is not a program command/
    );
  });

  test('does not resolve legacy shortcut names', () => {
    assert.throws(
      () => resolveCommand(['portfolio']),
      /is not a program command/
    );
  });
});

describe('isCommandName', () => {
  test('accepts registered command names only', () => {
    assert.equal(isCommandName('users get-accounts'), true);
    assert.equal(isCommandName('marketdata get-candles'), true);
    assert.equal(isCommandName('instruments get-instrument-by'), true);
    assert.equal(isCommandName('marketdata get-last-prices'), true);
    assert.equal(isCommandName('orders get-orders'), true);
    assert.equal(isCommandName('operations get-portfolio'), true);
    assert.equal(isCommandName('operations get-positions'), true);
    assert.equal(isCommandName('help'), true);
    assert.equal(isCommandName('version'), true);
    assert.equal(isCommandName('portfolio'), false);
    assert.equal(isCommandName('unknown-command'), false);
    assert.equal(isCommandName(undefined), false);
  });
});
