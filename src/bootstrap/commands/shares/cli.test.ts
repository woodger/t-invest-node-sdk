import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentStatus,
  type InstrumentsRequest,
  type SharesResponse
} from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createSharesCommand,
  parseSharesFormat,
  parseSharesInstrumentStatus,
  parseSharesRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments shares'],
    ...args
  };
}

function response(overrides: Partial<SharesResponse> = {}): SharesResponse {
  return {
    instruments: [],
    ...overrides
  };
}

describe('shares command', () => {
  describe('parseSharesInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(parseSharesInstrumentStatus(argv()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseSharesInstrumentStatus(argv({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseSharesInstrumentStatus(argv({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseSharesInstrumentStatus(argv({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseSharesInstrumentStatus(argv({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('parseSharesRequest', () => {
    test('returns generated shares request', () => {
      assert.deepEqual(parseSharesRequest(argv({ 'instrument-status': 'all' })), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseSharesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSharesFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseSharesFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createSharesCommand', () => {
    test('calls shares and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentsRequest | undefined;
      let closeCalls = 0;
      const command = createSharesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async shares(request) {
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

    test('closes sdk when shares rejects', async () => {
      let closeCalls = 0;
      const command = createSharesCommand(() => ({
        instruments: {
          async shares() {
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
