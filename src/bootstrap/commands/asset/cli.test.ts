import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { AssetRequest,
  AssetResponse
} from '../../../generated/t_tech/invest/grpc/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createAssetCommand,
  parseAssetFormat,
  createAssetRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<AssetResponse> = {}): AssetResponse {
  return {
    asset: undefined,
    ...overrides
  } as AssetResponse;
}

describe('asset command', () => {
  describe('createAssetRequest', () => {
    test('returns generated getAssetBy request', () => {
      const request = createAssetRequest({ id: 'asset-uid' });

      assert.deepEqual(request, {
        id: 'asset-uid'
      });
    });

  });

  describe('parseAssetFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseAssetFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseAssetFormat(rawOptions({ format: 'xml' })),
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

      const output = await commandFacade.run(
        command,
        [
          'instrument',
          'asset',
          'show',
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
        () => commandFacade.run(
          command,
          [
            'instrument',
            'asset',
            'show',
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
