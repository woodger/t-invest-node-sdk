import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentStatus,
  type EtfsResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createEtfsCommand,
  parseEtfsFormat,
  parseEtfsInstrumentStatus,
  createEtfsRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<EtfsResponse> = {}): EtfsResponse {
  return {
    instruments: [],
    ...overrides
  };
}

describe('etfs command', () => {
  describe('parseEtfsInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(parseEtfsInstrumentStatus(rawOptions()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseEtfsInstrumentStatus(rawOptions({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseEtfsInstrumentStatus(rawOptions({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseEtfsInstrumentStatus(rawOptions({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseEtfsInstrumentStatus(rawOptions({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('createEtfsRequest', () => {
    test('returns generated etfs request', () => {
      assert.deepEqual(createEtfsRequest({ 'instrument-status': 'all' }), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseEtfsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseEtfsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseEtfsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createEtfsCommand', () => {
    test('calls etfs and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentsRequest | undefined;
      let closeCalls = 0;
      const command = createEtfsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async etfs(request) {
              receivedRequest = request;

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
          'etf',
          'list',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-status=all',
          '--format=json'
        ],
        undefined
      );

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

    test('closes sdk when etfs rejects', async () => {
      let closeCalls = 0;
      const command = createEtfsCommand(() => ({
        instruments: {
          async etfs() {
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
            'etf',
            'list',
            '--token=token',
            '--endpoint=localhost:50051'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
