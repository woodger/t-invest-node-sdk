import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { GetUserTariffResponse } from '../../../generated/users';
import { createUserTariffReport, formatUserTariffReport } from './reporter';

function response(
  overrides: Partial<GetUserTariffResponse> = {}
): GetUserTariffResponse {
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
  };
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
      const output = formatUserTariffReport(
        createUserTariffReport(response()),
        'table'
      );

      assert.match(
        output,
        /^type\s+limit\/min\s+limit\/sec\s+connections\s+open\s+methods\/streams/m
      );
      assert.match(
        output,
        /unary\s+100\s+UsersService\/GetAccounts, UsersService\/GetInfo/
      );
      assert.match(
        output,
        /stream\s+10\s+2\s+MarketDataStreamService\/MarketDataStream/
      );
    });

    test('omits absent per-second limits from json', () => {
      const report = createUserTariffReport(response());
      const output = formatUserTariffReport(report, 'json');

      assert.deepEqual(JSON.parse(output), {
        unaryLimits: [{
          limitPerMinute: 100,
          methods: ['UsersService/GetAccounts', 'UsersService/GetInfo']
        }],
        streamLimits: [{
          limit: 10,
          streams: ['MarketDataStreamService/MarketDataStream'],
          open: 2
        }]
      });
    });

    for (const limitPerSecond of [15, 0]) {
      test(`preserves a per-second limit of ${limitPerSecond} in json`, () => {
        const report = createUserTariffReport(response({
          unaryLimits: [{
            limitPerMinute: 900,
            limitPerSecond,
            methods: ['OrdersService/PostOrder']
          }]
        }));
        const output = formatUserTariffReport(report, 'json');

        assert.deepEqual(JSON.parse(output).unaryLimits, [{
          limitPerMinute: 900,
          limitPerSecond,
          methods: ['OrdersService/PostOrder']
        }]);
      });

      test(`shows a per-second limit of ${limitPerSecond} beside the per-minute limit`, () => {
        const report = createUserTariffReport(response({
          unaryLimits: [{
            limitPerMinute: 900,
            limitPerSecond,
            methods: ['OrdersService/PostOrder']
          }]
        }));
        const output = formatUserTariffReport(report, 'table');

        assert.match(
          output,
          new RegExp(
            `^unary\\s+900\\s+${limitPerSecond}\\s+OrdersService/PostOrder$`,
            'm'
          )
        );
      });
    }
  });
});
