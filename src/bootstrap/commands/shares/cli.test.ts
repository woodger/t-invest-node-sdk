import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentStatus,
  type InstrumentsRequest,
  type SharesResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSharesCommand,
  parseSharesFormat,
  parseSharesInstrumentStatus,
  createSharesRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
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
      assert.equal(parseSharesInstrumentStatus(rawOptions()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseSharesInstrumentStatus(rawOptions({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseSharesInstrumentStatus(rawOptions({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseSharesInstrumentStatus(rawOptions({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseSharesInstrumentStatus(rawOptions({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('createSharesRequest', () => {
    test('returns generated shares request', () => {
      assert.deepEqual(createSharesRequest({ 'instrument-status': 'all' }), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseSharesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSharesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseSharesFormat(rawOptions({ format: 'xml' })),
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

      const output = await commandFacade.run(
        command,
        [
          'instruments',
          'shares',
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
        () => commandFacade.run(
          command,
          [
            'instruments',
            'shares',
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
