import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  formatStreamRunResponse,
  type StreamRunResponse
} from './reporter';

const baseOptions = {
  stream: 'operations.portfolioStream',
  sequence: 1,
  receivedAt: '2026-06-29T12:00:00.000Z',
  includePings: false,
  includeSubscriptionEvents: true,
  raw: false
};

describe('stream run reporter', () => {
  describe('formatStreamRunResponse', () => {
    test('returns normalized JSONL envelope', () => {
      const output = formatStreamRunResponse(
        {
          portfolio: {
            accountId: 'account-id'
          }
        } as unknown as StreamRunResponse,
        baseOptions
      );

      assert.ok(output);
      assert.equal(output.endsWith('\n'), true);
      assert.deepEqual(JSON.parse(output), {
        stream: 'operations.portfolioStream',
        sequence: 1,
        receivedAt: '2026-06-29T12:00:00.000Z',
        type: 'portfolio',
        payload: {
          accountId: 'account-id'
        }
      });
    });

    test('skips ping events by default', () => {
      const output = formatStreamRunResponse(
        {
          ping: {
            time: new Date('2026-06-29T12:00:00.000Z')
          }
        } as unknown as StreamRunResponse,
        baseOptions
      );

      assert.equal(output, undefined);
    });

    test('returns raw JSONL response when raw mode is enabled', () => {
      const output = formatStreamRunResponse(
        {
          orderTrades: {
            orderId: 'order-id'
          }
        } as unknown as StreamRunResponse,
        {
          ...baseOptions,
          stream: 'orders.tradesStream',
          raw: true
        }
      );

      assert.ok(output);
      assert.deepEqual(JSON.parse(output), {
        orderTrades: {
          orderId: 'order-id'
        }
      });
    });
  });
});
