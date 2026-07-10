import { InstrumentStatus } from '../../../generated/t_tech/invest/grpc/common';
import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { type FuturesResponse, type InstrumentsRequest } from '../../../generated/t_tech/invest/grpc/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createFuturesCommand,
  parseFuturesFormat,
  parseFuturesInstrumentStatus,
  createFuturesRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<FuturesResponse> = {}): FuturesResponse {
  return {
    instruments: [],
    ...overrides
  } as FuturesResponse;
}

describe('futures command', () => {
  describe('parseFuturesInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(parseFuturesInstrumentStatus(rawOptions()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseFuturesInstrumentStatus(rawOptions({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseFuturesInstrumentStatus(rawOptions({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseFuturesInstrumentStatus(rawOptions({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseFuturesInstrumentStatus(rawOptions({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('createFuturesRequest', () => {
    test('returns generated futures request', () => {
      assert.deepEqual(createFuturesRequest({ 'instrument-status': 'all' }), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseFuturesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFuturesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFuturesFormat(rawOptions({ format: 'xml' })),
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

      const output = await commandFacade.run(
        command,
        [
          'instrument',
          'future',
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
        () => commandFacade.run(
          command,
          [
            'instrument',
            'future',
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
