import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import type { GetUserTariffResponse } from '../../../generated/users';
import { createUserTariffReport, formatUserTariffReport } from './reporter';

const defaultUnaryLimitPerMinute = 100;
const defaultStreamConnectionLimit = 10;
const defaultOpenStreamCount = 2;
const postOrderUnaryLimitPerMinute = 900;
const postOrderUnaryLimitPerSecond = 15;

function response(
  overrides: Partial<GetUserTariffResponse> = {}
): GetUserTariffResponse {
  return {
    unaryLimits: [
      {
        limitPerMinute: defaultUnaryLimitPerMinute,
        methods: ['UsersService/GetAccounts', 'UsersService/GetInfo']
      }
    ],
    streamLimits: [
      {
        limit: defaultStreamConnectionLimit,
        streams: ['MarketDataStreamService/MarketDataStream'],
        open: defaultOpenStreamCount
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
            limitPerMinute: defaultUnaryLimitPerMinute,
            methods: ['UsersService/GetAccounts', 'UsersService/GetInfo']
          }
        ],
        streamLimits: [
          {
            limit: defaultStreamConnectionLimit,
            streams: ['MarketDataStreamService/MarketDataStream'],
            open: defaultOpenStreamCount
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
        new RegExp(
          `unary\\s+${defaultUnaryLimitPerMinute}\\s+UsersService/GetAccounts, UsersService/GetInfo`
        )
      );
      assert.match(
        output,
        new RegExp(
          `stream\\s+${defaultStreamConnectionLimit}\\s+${defaultOpenStreamCount}\\s+`
            + 'MarketDataStreamService/MarketDataStream'
        )
      );
    });

    test('omits absent per-second limits from json', () => {
      const report = createUserTariffReport(response());
      const output = formatUserTariffReport(report, 'json');

      assert.deepEqual(JSON.parse(output), {
        unaryLimits: [{
          limitPerMinute: defaultUnaryLimitPerMinute,
          methods: ['UsersService/GetAccounts', 'UsersService/GetInfo']
        }],
        streamLimits: [{
          limit: defaultStreamConnectionLimit,
          streams: ['MarketDataStreamService/MarketDataStream'],
          open: defaultOpenStreamCount
        }]
      });
    });

    for (const limitPerSecond of [postOrderUnaryLimitPerSecond, 0]) {
      test(`preserves a per-second limit of ${limitPerSecond} in json`, () => {
        const report = createUserTariffReport(response({
          unaryLimits: [{
            limitPerMinute: postOrderUnaryLimitPerMinute,
            limitPerSecond,
            methods: ['OrdersService/PostOrder']
          }]
        }));
        const output = formatUserTariffReport(report, 'json');

        assert.deepEqual(JSON.parse(output).unaryLimits, [{
          limitPerMinute: postOrderUnaryLimitPerMinute,
          limitPerSecond,
          methods: ['OrdersService/PostOrder']
        }]);
      });

      test(`shows a per-second limit of ${limitPerSecond} beside the per-minute limit`, () => {
        const report = createUserTariffReport(response({
          unaryLimits: [{
            limitPerMinute: postOrderUnaryLimitPerMinute,
            limitPerSecond,
            methods: ['OrdersService/PostOrder']
          }]
        }));
        const output = formatUserTariffReport(report, 'table');

        assert.match(
          output,
          new RegExp(
            `^unary\\s+${postOrderUnaryLimitPerMinute}\\s+${limitPerSecond}\\s+OrdersService/PostOrder$`,
            'm'
          )
        );
      });
    }
  });
});
