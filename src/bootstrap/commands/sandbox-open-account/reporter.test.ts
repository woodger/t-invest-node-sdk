import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  createOpenSandboxAccountReport,
  formatOpenSandboxAccountReport
} from './reporter';

describe('sandbox-open-account reporter', () => {
  describe('createOpenSandboxAccountReport', () => {
    test('maps generated response to stable report values', () => {
      assert.deepEqual(createOpenSandboxAccountReport({
        accountId: 'sandbox-account-id'
      }), {
        accountId: 'sandbox-account-id'
      });
    });
  });

  describe('formatOpenSandboxAccountReport', () => {
    test('formats report as json', () => {
      const output = formatOpenSandboxAccountReport({
        accountId: 'sandbox-account-id'
      }, 'json');

      assert.deepEqual(JSON.parse(output), {
        accountId: 'sandbox-account-id'
      });
    });

    test('formats report as table', () => {
      const output = formatOpenSandboxAccountReport({
        accountId: 'sandbox-account-id'
      }, 'table');

      assert.match(output, /accountId/);
      assert.match(output, /sandbox-account-id/);
    });
  });
});
