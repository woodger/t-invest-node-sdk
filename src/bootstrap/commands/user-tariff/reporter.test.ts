import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { GetUserTariffResponse } from '../../../generated/t_tech/invest/grpc/users';
import { createUserTariffReport, formatUserTariffReport } from './reporter';

function response(overrides: Partial<GetUserTariffResponse> = {}): GetUserTariffResponse {
  return {
    unaryLimits: [
      {
        limitPerMinute: 100,
        methods: ['UsersService/GetAccounts', 'UsersService/GetInfo']
      }
    ],
    streamLimits: [
      {
        limit: 10,
        streams: ['MarketDataStreamService/MarketDataStream'],
        open: 2
      }
    ],
    ...overrides
  } as GetUserTariffResponse;
}

describe('user-tariff reporter', () => {
  describe('createUserTariffReport', () => {
    test('maps generated tariff limits to stable report values', () => {
      const report = createUserTariffReport(response());

      assert.deepEqual(report, {
        unaryLimits: [
          {
            limitPerMinute: 100,
            methods: ['UsersService/GetAccounts', 'UsersService/GetInfo']
          }
        ],
        streamLimits: [
          {
            limit: 10,
            streams: ['MarketDataStreamService/MarketDataStream'],
            open: 2
          }
        ]
      });
    });
  });

  describe('formatUserTariffReport', () => {
    test('formats report as table', () => {
      const output = formatUserTariffReport(createUserTariffReport(response()), 'table');

      assert.match(output, /^type\s+limit\s+open\s+methods\/streams/m);
      assert.match(output, /unary\s+100\s+UsersService\/GetAccounts, UsersService\/GetInfo/);
      assert.match(output, /stream\s+10\s+2\s+MarketDataStreamService\/MarketDataStream/);
    });

    test('formats report as json', () => {
      const output = formatUserTariffReport(createUserTariffReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.unaryLimits[0].limitPerMinute, 100);
      assert.deepEqual(parsed.unaryLimits[0].methods, [
        'UsersService/GetAccounts',
        'UsersService/GetInfo'
      ]);
      assert.equal(parsed.streamLimits[0].limit, 10);
      assert.equal(parsed.streamLimits[0].open, 2);
      assert.deepEqual(parsed.streamLimits[0].streams, [
        'MarketDataStreamService/MarketDataStream'
      ]);
    });
  });
});
