import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentStatus,
  type BondsResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createBondsCommand,
  parseBondsFormat,
  parseBondsInstrumentStatus,
  parseBondsRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments bonds'],
    ...args
  };
}

function response(overrides: Partial<BondsResponse> = {}): BondsResponse {
  return {
    instruments: [],
    ...overrides
  };
}

describe('bonds command', () => {
  describe('parseBondsInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(parseBondsInstrumentStatus(argv()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseBondsInstrumentStatus(argv({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseBondsInstrumentStatus(argv({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseBondsInstrumentStatus(argv({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseBondsInstrumentStatus(argv({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('parseBondsRequest', () => {
    test('returns generated bonds request', () => {
      assert.deepEqual(parseBondsRequest(argv({ 'instrument-status': 'all' })), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseBondsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBondsFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBondsFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createBondsCommand', () => {
    test('calls bonds and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentsRequest | undefined;
      let closeCalls = 0;
      const command = createBondsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async bonds(request) {
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

    test('closes sdk when bonds rejects', async () => {
      let closeCalls = 0;
      const command = createBondsCommand(() => ({
        instruments: {
          async bonds() {
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
