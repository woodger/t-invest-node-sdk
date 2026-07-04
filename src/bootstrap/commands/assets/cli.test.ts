import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { AssetsRequest, AssetsResponse } from '../../../generated/instruments';
import type { CommandRawOptions } from '../../command-options';
import {
  createAssetsCommand,
  parseAssetsFormat,
  parseAssetsInstrumentType,
  createAssetsRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<AssetsResponse> = {}): AssetsResponse {
  return {
    assets: [],
    ...overrides
  };
}

describe('assets command', () => {
  describe('parseAssetsInstrumentType', () => {
    test('returns unspecified by default', () => {
      assert.equal(
        parseAssetsInstrumentType(rawOptions()),
        InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED
      );
    });

    test('maps public instrument type names to generated enum values', () => {
      assert.equal(parseAssetsInstrumentType(rawOptions({ 'instrument-type': 'share' })), InstrumentType.INSTRUMENT_TYPE_SHARE);
      assert.equal(parseAssetsInstrumentType(rawOptions({ 'instrument-type': 'bond' })), InstrumentType.INSTRUMENT_TYPE_BOND);
      assert.equal(
        parseAssetsInstrumentType(rawOptions({ 'instrument-type': 'clearing-certificate' })),
        InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
      );
    });

    test('rejects unknown instrument type names', () => {
      assert.throws(
        () => parseAssetsInstrumentType(rawOptions({ 'instrument-type': 'stock' })),
        /Expected '--instrument-type' as one of: unspecified, bond, share/
      );
    });
  });

  describe('createAssetsRequest', () => {
    test('returns generated getAssets request', () => {
      const request = createAssetsRequest({ 'instrument-type': 'share' });

      assert.deepEqual(request, {
        instrumentType: InstrumentType.INSTRUMENT_TYPE_SHARE
      });
    });
  });

  describe('parseAssetsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseAssetsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseAssetsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createAssetsCommand', () => {
    test('calls getAssets and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: AssetsRequest | undefined;
      let closeCalls = 0;
      const command = createAssetsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getAssets(request) {
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
          'get-assets',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-type=share',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        instrumentType: InstrumentType.INSTRUMENT_TYPE_SHARE
      });
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(output), []);
    });

    test('closes sdk when getAssets rejects', async () => {
      let closeCalls = 0;
      const command = createAssetsCommand(() => ({
        instruments: {
          async getAssets() {
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
            'get-assets',
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
