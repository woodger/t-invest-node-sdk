import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  createCloseSandboxAccountReport,
  formatCloseSandboxAccountReport
} from './reporter';

describe('sandbox-close-account reporter', () => {
  describe('createCloseSandboxAccountReport', () => {
    test('maps closed account id to stable report values', () => {
      assert.deepEqual(createCloseSandboxAccountReport('sandbox-account-id'), {
        accountId: 'sandbox-account-id',
        status: 'closed'
      });
    });
  });

  describe('formatCloseSandboxAccountReport', () => {
    test('formats report as json', () => {
      const output = formatCloseSandboxAccountReport({
        accountId: 'sandbox-account-id',
        status: 'closed'
      }, 'json');

      assert.deepEqual(JSON.parse(output), {
        accountId: 'sandbox-account-id',
        status: 'closed'
      });
    });

    test('formats report as table', () => {
      const output = formatCloseSandboxAccountReport({
        accountId: 'sandbox-account-id',
        status: 'closed'
      }, 'table');

      assert.match(output, /accountId/);
      assert.match(output, /sandbox-account-id/);
      assert.match(output, /closed/);
    });
  });
});
