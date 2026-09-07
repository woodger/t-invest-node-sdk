import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createCancelStopOrderReport, formatCancelStopOrderReport } from './reporter';

describe('cancel-stop-order reporter', () => {
  describe('createCancelStopOrderReport', () => {
    test('maps generated cancel stop order response to stable report values', () => {
      assert.deepEqual(createCancelStopOrderReport({
        time: new Date('2026-06-19T10:00:00.000Z')
      }), {
        time: '2026-06-19T10:00:00.000Z'
      });
    });
  });

  describe('formatCancelStopOrderReport', () => {
    test('formats report as json', () => {
      const report = {
        time: '2026-06-19T10:00:00.000Z'
      };
      const output = formatCancelStopOrderReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
