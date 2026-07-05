import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  AccruedInterest,
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../command-options';
import {
  createAccruedInterestsCommand,
  parseAccruedInterestsFormat,
  createAccruedInterestsRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function accruedInterest(overrides: Partial<AccruedInterest> = {}): AccruedInterest {
  return {
    date: new Date('2026-01-02T03:04:05Z'),
    value: {
      units: 10,
      nano: 250_000_000
    },
    valuePercent: {
      units: 5,
      nano: 500_000_000
    },
    nominal: {
      units: 1000,
      nano: 0
    },
    ...overrides
  };
}

function response(
  overrides: Partial<GetAccruedInterestsResponse> = {}
): GetAccruedInterestsResponse {
  return {
    accruedInterests: [accruedInterest()],
    ...overrides
  };
}

describe('accrued-interests command', () => {
  describe('createAccruedInterestsRequest', () => {
    test('returns generated getAccruedInterests request', () => {
      const request = createAccruedInterestsRequest({
        'instrument-id': 'BOND-FIGI',
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T00:00:00Z'
      });

      assert.deepEqual(request, {
        figi: 'BOND-FIGI',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => createAccruedInterestsRequest({
          figi: 'BOND-FIGI',
          from: '2026-02-01T00:00:00Z',
          to: '2026-01-01T00:00:00Z'
        }),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseAccruedInterestsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseAccruedInterestsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseAccruedInterestsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createAccruedInterestsCommand', () => {
    test('calls getAccruedInterests and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetAccruedInterestsRequest | undefined;
      let getAccruedInterestsCalls = 0;
      let closeCalls = 0;
      const command = createAccruedInterestsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getAccruedInterests(request) {
              receivedRequest = request;
              getAccruedInterestsCalls += 1;

              return response();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await commandFacade.run(
        command,
        [
          'instruments',
          'get-accrued-interests',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BOND-FIGI',
          '--from=2026-01-01T00:00:00Z',
          '--to=2026-01-31T00:00:00Z',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getAccruedInterestsCalls, 1);
      assert.deepEqual(receivedRequest, {
        figi: 'BOND-FIGI',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].value, '10.25');
    });

    test('closes sdk when getAccruedInterests rejects', async () => {
      let closeCalls = 0;
      const command = createAccruedInterestsCommand(() => ({
        instruments: {
          async getAccruedInterests() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'instruments',
            'get-accrued-interests',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=BOND-FIGI',
            '--from=2026-01-01T00:00:00Z',
            '--to=2026-01-31T00:00:00Z'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
