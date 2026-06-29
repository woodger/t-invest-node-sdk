import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  createSandboxPayInReport,
  formatSandboxPayInReport
} from './reporter';

describe('sandbox-pay-in reporter', () => {
  describe('createSandboxPayInReport', () => {
    test('maps generated balance to stable report values', () => {
      assert.deepEqual(createSandboxPayInReport({
        balance: {
          units: 100,
          nano: 250_000_000,
          currency: 'rub'
        }
      }), {
        balance: {
          amount: '100.25',
          currency: 'rub'
        }
      });
    });

    test('maps missing balance to null', () => {
      assert.deepEqual(createSandboxPayInReport({ balance: undefined }), {
        balance: null
      });
    });
  });

  describe('formatSandboxPayInReport', () => {
    test('formats report as json', () => {
      const output = formatSandboxPayInReport({
        balance: {
          amount: '100',
          currency: 'rub'
        }
      }, 'json');

      assert.deepEqual(JSON.parse(output), {
        balance: {
          amount: '100',
          currency: 'rub'
        }
      });
    });

    test('formats report as table', () => {
      const output = formatSandboxPayInReport({
        balance: {
          amount: '100',
          currency: 'rub'
        }
      }, 'table');

      assert.match(output, /balance/);
      assert.match(output, /100 rub/);
    });
  });
});
