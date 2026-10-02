import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createPositionsRequest } from './request.mapper';

describe('createPositionsRequest', () => {
  test('возвращает generated PositionsRequest', () => {
    assert.deepEqual(createPositionsRequest({
      'account-id': 'account-id'
    }), {
      accountId: 'account-id'
    });
  });
});
