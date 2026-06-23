import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentStatus,
  type FuturesResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createFuturesCommand,
  parseFuturesFormat,
  parseFuturesInstrumentStatus,
  parseFuturesRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments futures'],
    ...args
  };
}

function response(overrides: Partial<FuturesResponse> = {}): FuturesResponse {
  return {
    instruments: [],
    ...overrides
  };
}

describe('futures command', () => {
  describe('parseFuturesInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(parseFuturesInstrumentStatus(argv()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseFuturesInstrumentStatus(argv({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseFuturesInstrumentStatus(argv({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseFuturesInstrumentStatus(argv({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseFuturesInstrumentStatus(argv({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('parseFuturesRequest', () => {
    test('returns generated futures request', () => {
      assert.deepEqual(parseFuturesRequest(argv({ 'instrument-status': 'all' })), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseFuturesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFuturesFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFuturesFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createFuturesCommand', () => {
    test('calls futures and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentsRequest | undefined;
      let closeCalls = 0;
      const command = createFuturesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async futures(request) {
              receivedRequest = request;

              return response();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        'instrument-status': 'all',
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(output), []);
    });

    test('closes sdk when futures rejects', async () => {
      let closeCalls = 0;
      const command = createFuturesCommand(() => ({
        instruments: {
          async futures() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => command(argv({
          token: 'token',
          endpoint: 'localhost:50051'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
