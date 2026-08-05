import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  Dividend,
  GetDividendsRequest,
  GetDividendsResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createDividendsCommand,
  parseDividendsFormat,
  createDividendsRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function dividend(overrides: Partial<Dividend> = {}): Dividend {
  return {
    dividendNet: {
      currency: 'rub',
      units: 12,
      nano: 500_000_000
    },
    paymentDate: new Date('2026-02-01T00:00:00Z'),
    declaredDate: new Date('2026-01-01T00:00:00Z'),
    lastBuyDate: new Date('2026-01-20T00:00:00Z'),
    dividendType: 'Regular Cash',
    recordDate: new Date('2026-01-22T00:00:00Z'),
    regularity: 'Annual',
    closePrice: {
      currency: 'rub',
      units: 100,
      nano: 250_000_000
    },
    yieldValue: {
      units: 5,
      nano: 125_000_000
    },
    createdAt: new Date('2026-01-03T00:00:00Z'),
    ...overrides
  } as Dividend;
}

function response(overrides: Partial<GetDividendsResponse> = {}): GetDividendsResponse {
  return {
    dividends: [dividend()],
    ...overrides
  } as GetDividendsResponse;
}

describe('dividends command', () => {
  describe('createDividendsRequest', () => {
    test('returns generated getDividends request', () => {
      const request = createDividendsRequest({
        'instrument-id': 'SHARE-FIGI',
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T00:00:00Z'
      });

      assert.deepEqual(request, {
        figi: 'SHARE-FIGI',
        instrumentId: 'SHARE-FIGI',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => createDividendsRequest({
          figi: 'SHARE-FIGI',
          from: '2026-02-01T00:00:00Z',
          to: '2026-01-01T00:00:00Z'
        }),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseDividendsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseDividendsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseDividendsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createDividendsCommand', () => {
    test('calls getDividends and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetDividendsRequest | undefined;
      let getDividendsCalls = 0;
      let closeCalls = 0;
      const command = createDividendsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getDividends(request) {
              receivedRequest = request;
              getDividendsCalls += 1;

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
          'instrument',
          'dividends',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=SHARE-FIGI',
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
      assert.equal(getDividendsCalls, 1);
      assert.deepEqual(receivedRequest, {
        figi: 'SHARE-FIGI',
        instrumentId: 'SHARE-FIGI',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(output)[0].dividendNet, {
        currency: 'rub',
        amount: '12.5'
      });
    });

    test('closes sdk when getDividends rejects', async () => {
      let closeCalls = 0;
      const command = createDividendsCommand(() => ({
        instruments: {
          async getDividends() {
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
            'instrument',
            'dividends',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=SHARE-FIGI',
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
