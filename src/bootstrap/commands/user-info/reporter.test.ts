import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { GetInfoResponse } from '../../../generated/t_tech/invest/grpc/users';
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
      const output = formatUserInfoReport(createUserInfoReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.premStatus, true);
      assert.equal(parsed.qualStatus, false);
      assert.deepEqual(parsed.qualifiedForWorkWith, ['shares', 'bonds']);
      assert.equal(parsed.tariff, 'premium');
    });
  });
});
