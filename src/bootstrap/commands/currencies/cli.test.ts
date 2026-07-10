import { InstrumentStatus } from '../../../generated/common';
import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { type CurrenciesResponse, type InstrumentsRequest } from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createCurrenciesCommand,
  parseCurrenciesFormat,
  parseCurrenciesInstrumentStatus,
  createCurrenciesRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<CurrenciesResponse> = {}): CurrenciesResponse {
  return {
    instruments: [],
    ...overrides
  } as CurrenciesResponse;
}

describe('currencies command', () => {
  describe('parseCurrenciesInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(
        parseCurrenciesInstrumentStatus(rawOptions()),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
    });

    test('maps public instrument status names to generated enum values', () => {
      assert.equal(
        parseCurrenciesInstrumentStatus(rawOptions({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseCurrenciesInstrumentStatus(rawOptions({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseCurrenciesInstrumentStatus(rawOptions({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown instrument status names', () => {
      assert.throws(
        () => parseCurrenciesInstrumentStatus(rawOptions({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('createCurrenciesRequest', () => {
    test('returns generated currencies request', () => {
      assert.deepEqual(createCurrenciesRequest({ 'instrument-status': 'all' }), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });

  describe('parseCurrenciesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseCurrenciesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseCurrenciesFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createCurrenciesCommand', () => {
    test('calls currencies and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentsRequest | undefined;
      let closeCalls = 0;
      const command = createCurrenciesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async currencies(request) {
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
          'currency',
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

    test('closes sdk when currencies rejects', async () => {
      let closeCalls = 0;
      const command = createCurrenciesCommand(() => ({
        instruments: {
          async currencies() {
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
            'currency',
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
