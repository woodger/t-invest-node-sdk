import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createPostStopOrderReport, formatPostStopOrderReport } from './reporter';

describe('post-stop-order reporter', () => {
  describe('createPostStopOrderReport', () => {
    test('maps generated post stop order response to stable report values', () => {
      assert.deepEqual(createPostStopOrderReport({
        stopOrderId: 'stop-order-id',
        orderRequestId: '',
        responseMetadata: undefined
      }), {
        stopOrderId: 'stop-order-id'
      });
    });
  });

  describe('formatPostStopOrderReport', () => {
    test('formats report as table', () => {
      const output = formatPostStopOrderReport({
        stopOrderId: 'stop-order-id'
      }, 'table');

      assert.match(output, /^stopOrderId/m);
      assert.match(output, /stop-order-id/);
    });

    test('formats report as json', () => {
      const report = {
        stopOrderId: 'stop-order-id'
      };
      const output = formatPostStopOrderReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
