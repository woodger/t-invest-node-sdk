import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createCancelOrderReport, formatCancelOrderReport } from './reporter';

describe('cancel-order reporter', () => {
  describe('createCancelOrderReport', () => {
    test('maps generated cancel order response to stable report values', () => {
      const report = createCancelOrderReport({
        time: new Date('2026-06-19T10:00:00.000Z'),
        responseMetadata: undefined
      });

      assert.deepEqual(report, {
        time: '2026-06-19T10:00:00.000Z'
      });
    });
  });

  describe('formatCancelOrderReport', () => {
    test('formats report as table', () => {
      const output = formatCancelOrderReport({
        time: '2026-06-19T10:00:00.000Z'
      }, 'table');

      assert.match(output, /^time/m);
      assert.match(output, /2026-06-19T10:00:00.000Z/);
    });

    test('formats report as json', () => {
      const output = formatCancelOrderReport({
        time: '2026-06-19T10:00:00.000Z'
      }, 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.time, '2026-06-19T10:00:00.000Z');
    });
  });
});
