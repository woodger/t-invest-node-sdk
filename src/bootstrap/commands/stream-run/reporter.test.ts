import assert from 'node:assert';
import { describe, test } from 'node:test';
import { ResultSubscriptionStatus } from '../../../generated/common';
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
        } as StreamRunResponse,
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
        } as StreamRunResponse,
        baseOptions
      );

      assert.equal(output, undefined);
    });

    test('reports a trades stream subscription acknowledgement', () => {
      const subscription = {
        trackingId: 'tracking-id',
        status: ResultSubscriptionStatus.RESULT_SUBSCRIPTION_STATUS_OK,
        streamId: 'stream-id',
        accounts: ['account-id']
      };
      const output = formatStreamRunResponse({ subscription }, {
        ...baseOptions,
        stream: 'orders.tradesStream'
      });

      assert.ok(output);
      assert.deepEqual(JSON.parse(output), {
        stream: 'orders.tradesStream',
        sequence: 1,
        receivedAt: baseOptions.receivedAt,
        type: 'subscription',
        payload: subscription
      });
    });

    test('filters trades stream subscriptions in normalized and raw output', () => {
      for (const raw of [false, true]) {
        const output = formatStreamRunResponse({
          subscription: {
            trackingId: 'tracking-id',
            status: ResultSubscriptionStatus.RESULT_SUBSCRIPTION_STATUS_OK,
            streamId: 'stream-id',
            accounts: ['account-id']
          }
        }, {
          ...baseOptions,
          stream: 'orders.tradesStream',
          includeSubscriptionEvents: false,
          raw
        });

        assert.equal(output, undefined);
      }
    });

    test('returns raw JSONL response when raw mode is enabled', () => {
      const output = formatStreamRunResponse(
        {
          orderTrades: {
            orderId: 'order-id'
          }
        } as StreamRunResponse,
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
