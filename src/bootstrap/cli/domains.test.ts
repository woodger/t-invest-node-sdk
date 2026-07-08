import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  canonicalizeCommandName,
  commandPathAliases,
  commandPathToName
} from './domains';

function commandAliasNames(path: readonly [string, ...string[]]): string[] {
  return commandPathAliases(path).map(commandPathToName);
}

describe('CLI domains', () => {
  describe('canonicalizeCommandName', () => {
    test('normalizes friendly, technical and legacy paths to the preferred command path', () => {
      assert.equal(canonicalizeCommandName('account list'), 'account list');
      assert.equal(canonicalizeCommandName('account get-accounts'), 'account list');
      assert.equal(canonicalizeCommandName('users get-accounts'), 'account list');
      assert.equal(canonicalizeCommandName('market candles'), 'market candles');
      assert.equal(canonicalizeCommandName('market get-candles'), 'market candles');
      assert.equal(canonicalizeCommandName('marketdata get-candles'), 'market candles');
      assert.equal(canonicalizeCommandName('order place'), 'order place');
      assert.equal(canonicalizeCommandName('order post-order'), 'order place');
      assert.equal(canonicalizeCommandName('orders post-order'), 'order place');
      assert.equal(canonicalizeCommandName('stop-order list'), 'stop-order list');
      assert.equal(canonicalizeCommandName('stop-order get-stop-orders'), 'stop-order list');
      assert.equal(canonicalizeCommandName('stoporders get-stop-orders'), 'stop-order list');
      assert.equal(canonicalizeCommandName('operation portfolio'), 'operation portfolio');
      assert.equal(canonicalizeCommandName('operation get-portfolio'), 'operation portfolio');
      assert.equal(canonicalizeCommandName('operations get-portfolio'), 'operation portfolio');
    });

    test('keeps non-renamed public paths and normalizes legacy service domains', () => {
      assert.equal(canonicalizeCommandName('instrument bonds'), 'instrument bonds');
      assert.equal(canonicalizeCommandName('instruments bonds'), 'instrument bonds');
      assert.equal(canonicalizeCommandName('dev compile-proto'), 'dev compile-proto');
      assert.equal(canonicalizeCommandName('compile-proto'), 'dev compile-proto');
    });

    test('does not invent mixed legacy-domain friendly-action aliases', () => {
      assert.equal(canonicalizeCommandName('users list'), 'users list');
      assert.equal(canonicalizeCommandName('marketdata candles'), 'marketdata candles');
      assert.equal(canonicalizeCommandName('orders place'), 'orders place');
      assert.equal(canonicalizeCommandName('stoporders list'), 'stoporders list');
      assert.equal(canonicalizeCommandName('stoporders place'), 'stoporders place');
      assert.equal(canonicalizeCommandName('operations list'), 'operations list');
      assert.equal(canonicalizeCommandName('operations portfolio'), 'operations portfolio');
      assert.equal(canonicalizeCommandName('operations broker-report'), 'operations broker-report');
    });
  });

  describe('commandPathAliases', () => {
    test('returns preferred, technical and legacy aliases for renamed commands', () => {
      assert.deepEqual(commandAliasNames(['account', 'list']), [
        'account list',
        'account get-accounts',
        'users get-accounts'
      ]);
      assert.deepEqual(commandAliasNames(['market', 'candles']), [
        'market candles',
        'market get-candles',
        'marketdata get-candles'
      ]);
      assert.deepEqual(commandAliasNames(['order', 'place']), [
        'order place',
        'order post-order',
        'orders post-order'
      ]);
      assert.deepEqual(commandAliasNames(['stop-order', 'list']), [
        'stop-order list',
        'stop-order get-stop-orders',
        'stoporders get-stop-orders'
      ]);
      assert.deepEqual(commandAliasNames(['stop-order', 'place']), [
        'stop-order place',
        'stop-order post-stop-order',
        'stoporders post-stop-order'
      ]);
      assert.deepEqual(commandAliasNames(['operation', 'portfolio']), [
        'operation portfolio',
        'operation get-portfolio',
        'operations get-portfolio'
      ]);
      assert.deepEqual(commandAliasNames(['operation', 'broker-report']), [
        'operation broker-report',
        'operation get-broker-report',
        'operations get-broker-report'
      ]);
    });

    test('returns legacy domain aliases for commands without friendly action aliases', () => {
      assert.deepEqual(commandAliasNames(['instrument', 'bonds']), [
        'instrument bonds',
        'instruments bonds'
      ]);
      assert.deepEqual(commandAliasNames(['stream', 'run']), [
        'stream run'
      ]);
    });
  });
});
