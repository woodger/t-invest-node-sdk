import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { AssetsRequest, AssetsResponse } from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createAssetsCommand,
  parseAssetsFormat,
  parseAssetsInstrumentType,
  parseAssetsRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments get-assets'],
    ...args
  };
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
        parseAssetsInstrumentType(argv()),
        InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED
      );
    });

    test('maps public instrument type names to generated enum values', () => {
      assert.equal(parseAssetsInstrumentType(argv({ 'instrument-type': 'share' })), InstrumentType.INSTRUMENT_TYPE_SHARE);
      assert.equal(parseAssetsInstrumentType(argv({ 'instrument-type': 'bond' })), InstrumentType.INSTRUMENT_TYPE_BOND);
      assert.equal(
        parseAssetsInstrumentType(argv({ 'instrument-type': 'clearing-certificate' })),
        InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
      );
    });

    test('rejects unknown instrument type names', () => {
      assert.throws(
        () => parseAssetsInstrumentType(argv({ 'instrument-type': 'stock' })),
        /Expected '--instrument-type' as one of: unspecified, bond, share/
      );
    });
  });

  describe('parseAssetsRequest', () => {
    test('returns generated getAssets request', () => {
      const request = parseAssetsRequest(argv({ 'instrument-type': 'share' }));

      assert.deepEqual(request, {
        instrumentType: InstrumentType.INSTRUMENT_TYPE_SHARE
      });
    });
  });

  describe('parseAssetsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseAssetsFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseAssetsFormat(argv({ format: 'xml' })),
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

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        'instrument-type': 'share',
        format: 'json'
      }));

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
