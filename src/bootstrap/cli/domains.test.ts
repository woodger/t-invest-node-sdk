import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  canonicalizeCommandName,
  commandPathAliases,
  commandPathToName,
  isCliDomainName
} from './domains';

function commandAliasNames(path: readonly [string, ...string[]]): string[] {
  return commandPathAliases(path).map(commandPathToName);
}

describe('CLI domains', () => {
  describe('isCliDomainName', () => {
    test('rejects inherited object property names', () => {
      for (const name of ['toString', 'constructor', '__proto__']) {
        assert.equal(isCliDomainName(name), false);
      }
    });
  });

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
      assert.equal(canonicalizeCommandName('instrument share list'), 'instrument share list');
      assert.equal(canonicalizeCommandName('instrument shares'), 'instrument share list');
      assert.equal(canonicalizeCommandName('instruments shares'), 'instrument share list');
      assert.equal(canonicalizeCommandName('instrument share show'), 'instrument share show');
      assert.equal(canonicalizeCommandName('instrument share-by'), 'instrument share show');
      assert.equal(canonicalizeCommandName('instrument bond list'), 'instrument bond list');
      assert.equal(canonicalizeCommandName('instrument bonds'), 'instrument bond list');
      assert.equal(canonicalizeCommandName('instrument bond coupons'), 'instrument bond coupons');
      assert.equal(canonicalizeCommandName('instrument get-bond-coupons'), 'instrument bond coupons');
      assert.equal(canonicalizeCommandName('instrument search'), 'instrument search');
      assert.equal(canonicalizeCommandName('instrument find-instrument'), 'instrument search');
      assert.equal(canonicalizeCommandName('instrument favorite list'), 'instrument favorite list');
      assert.equal(canonicalizeCommandName('instrument get-favorites'), 'instrument favorite list');
      assert.equal(canonicalizeCommandName('sandbox account list'), 'sandbox account list');
      assert.equal(canonicalizeCommandName('sandbox get-sandbox-accounts'), 'sandbox account list');
      assert.equal(canonicalizeCommandName('sandbox order place'), 'sandbox order place');
      assert.equal(canonicalizeCommandName('sandbox post-sandbox-order'), 'sandbox order place');
      assert.equal(canonicalizeCommandName('sandbox portfolio'), 'sandbox portfolio');
      assert.equal(canonicalizeCommandName('sandbox get-sandbox-portfolio'), 'sandbox portfolio');
      assert.equal(canonicalizeCommandName('sandbox pay-in'), 'sandbox pay-in');
      assert.equal(canonicalizeCommandName('sandbox sandbox-pay-in'), 'sandbox pay-in');
    });

    test('keeps non-renamed public paths and normalizes legacy service domains', () => {
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
      assert.equal(canonicalizeCommandName('instruments share list'), 'instruments share list');
      assert.equal(canonicalizeCommandName('instruments bond list'), 'instruments bond list');
      assert.equal(canonicalizeCommandName('instruments favorite list'), 'instruments favorite list');
      assert.equal(canonicalizeCommandName('sandbox account get-sandbox-accounts'), 'sandbox account get-sandbox-accounts');
      assert.equal(canonicalizeCommandName('sandbox order post-sandbox-order'), 'sandbox order post-sandbox-order');
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
      assert.deepEqual(commandAliasNames(['instrument', 'share', 'list']), [
        'instrument share list',
        'instrument shares',
        'instruments shares'
      ]);
      assert.deepEqual(commandAliasNames(['instrument', 'bond', 'coupons']), [
        'instrument bond coupons',
        'instrument get-bond-coupons',
        'instruments get-bond-coupons'
      ]);
      assert.deepEqual(commandAliasNames(['instrument', 'favorite', 'edit']), [
        'instrument favorite edit',
        'instrument edit-favorites',
        'instruments edit-favorites'
      ]);
      assert.deepEqual(commandAliasNames(['sandbox', 'account', 'list']), [
        'sandbox account list',
        'sandbox get-sandbox-accounts'
      ]);
      assert.deepEqual(commandAliasNames(['sandbox', 'order', 'place']), [
        'sandbox order place',
        'sandbox post-sandbox-order'
      ]);
      assert.deepEqual(commandAliasNames(['sandbox', 'portfolio']), [
        'sandbox portfolio',
        'sandbox get-sandbox-portfolio'
      ]);
      assert.deepEqual(commandAliasNames(['sandbox', 'pay-in']), [
        'sandbox pay-in',
        'sandbox sandbox-pay-in'
      ]);
    });

    test('returns legacy domain aliases for commands without friendly action aliases', () => {
      assert.deepEqual(commandAliasNames(['stream', 'run']), [
        'stream run'
      ]);
    });
  });
});
