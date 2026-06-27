import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createAssetCommand,
  parseAssetFormat,
  parseAssetRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments get-asset-by'],
    ...args
  };
}

function response(overrides: Partial<AssetResponse> = {}): AssetResponse {
  return {
    asset: undefined,
    ...overrides
  };
}

describe('asset command', () => {
  describe('parseAssetRequest', () => {
    test('returns generated getAssetBy request', () => {
      const request = parseAssetRequest(argv({ id: 'asset-uid' }));

      assert.deepEqual(request, {
        id: 'asset-uid'
      });
    });

    test('requires id', () => {
      assert.throws(
        () => parseAssetRequest(argv()),
        /Expected required argument '--id'/
      );
    });
  });

  describe('parseAssetFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseAssetFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseAssetFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createAssetCommand', () => {
    test('calls getAssetBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: AssetRequest | undefined;
      let closeCalls = 0;
      const command = createAssetCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getAssetBy(request) {
              receivedRequest = request;

              return response();
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
          'instruments',
          'get-asset-by',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=asset-uid',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'asset-uid'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when getAssetBy rejects', async () => {
      let closeCalls = 0;
      const command = createAssetCommand(() => ({
        instruments: {
          async getAssetBy() {
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
            'instruments',
            'get-asset-by',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=asset-uid'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
