import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Quotation } from '../../../generated/common';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse,
  InstrumentClosePriceResponse
} from '../../../generated/marketdata';
import type { CliArgs } from '../../cli-contract';
import {
  createClosePricesCommand,
  parseClosePricesFormat,
  parseClosePricesInstrumentIds,
  parseClosePricesRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['marketdata get-close-prices'],
    ...args
  };
}

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function closePrice(
  overrides: Partial<InstrumentClosePriceResponse> = {}
): InstrumentClosePriceResponse {
  return {
    figi: 'BBG00QPYJ5H0',
    instrumentUid: 'instrument-uid',
    price: quotation(100, 0),
    time: new Date('2026-06-19T00:00:00.000Z'),
    ...overrides
  };
}

function closePricesResponse(
  overrides: Partial<GetClosePricesResponse> = {}
): GetClosePricesResponse {
  return {
    closePrices: [closePrice()],
    ...overrides
  };
}

describe('close-prices command', () => {
  describe('parseClosePricesInstrumentIds', () => {
    test('returns one instrument id', () => {
      assert.deepEqual(
        parseClosePricesInstrumentIds(argv({ 'instrument-id': 'BBG00QPYJ5H0' })),
        ['BBG00QPYJ5H0']
      );
    });

    test('returns trimmed comma-separated instrument ids', () => {
      assert.deepEqual(
        parseClosePricesInstrumentIds(argv({
          'instrument-id': 'BBG00QPYJ5H0, instrument-uid'
        })),
        ['BBG00QPYJ5H0', 'instrument-uid']
      );
    });

    test('rejects empty comma-separated items', () => {
      assert.throws(
        () => parseClosePricesInstrumentIds(argv({ 'instrument-id': 'BBG00QPYJ5H0,,instrument-uid' })),
        /Expected '--instrument-id' as comma-separated list/
      );
    });
  });

  describe('parseClosePricesRequest', () => {
    test('returns generated getClosePrices request', () => {
      const request = parseClosePricesRequest(argv({
        'instrument-id': 'BBG00QPYJ5H0,instrument-uid'
      }));

      assert.deepEqual(request.instruments, [
        { instrumentId: 'BBG00QPYJ5H0' },
        { instrumentId: 'instrument-uid' }
      ]);
    });
  });

  describe('parseClosePricesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseClosePricesFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseClosePricesFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createClosePricesCommand', () => {
    test('calls getClosePrices and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetClosePricesRequest | undefined;
      let closeCalls = 0;
      const command = createClosePricesCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getClosePrices(request) {
              receivedRequest = request;

              return closePricesResponse();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await runCommand(
        command,
        [
          'marketdata',
          'get-close-prices',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0,instrument-uid',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest?.instruments, [
        { instrumentId: 'BBG00QPYJ5H0' },
        { instrumentId: 'instrument-uid' }
      ]);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].figi, 'BBG00QPYJ5H0');
    });

    test('closes sdk when getClosePrices rejects', async () => {
      let closeCalls = 0;
      const command = createClosePricesCommand(() => ({
        marketdata: {
          async getClosePrices() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => runCommand(
          command,
          [
            'marketdata',
            'get-close-prices',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=BBG00QPYJ5H0'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
