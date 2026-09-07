import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { GetInfoResponse } from '../../../generated/users';
import { createUserInfoReport, formatUserInfoReport } from './reporter';

function response(overrides: Partial<GetInfoResponse> = {}): GetInfoResponse {
  return {
    premStatus: true,
    qualStatus: false,
    qualifiedForWorkWith: ['shares', 'bonds'],
    tariff: 'premium',
    ...overrides
  } as GetInfoResponse;
}

describe('user-info reporter', () => {
  describe('createUserInfoReport', () => {
    test('maps generated user info fields to stable report values', () => {
      const report = createUserInfoReport(response());

      assert.deepEqual(report, {
        premStatus: true,
        qualStatus: false,
        qualifiedForWorkWith: ['shares', 'bonds'],
        tariff: 'premium'
      });
    });
  });

  describe('formatUserInfoReport', () => {
    test('formats report as table', () => {
      const output = formatUserInfoReport(createUserInfoReport(response()), 'table');

      assert.match(output, /^premStatus\s+qualStatus\s+qualifiedForWorkWith\s+tariff/m);
      assert.match(output, /true\s+false\s+shares, bonds\s+premium/);
    });

    test('formats report as json', () => {
      const report = createUserInfoReport(response());
      const output = formatUserInfoReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
