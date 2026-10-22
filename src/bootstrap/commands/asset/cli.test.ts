import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import { createAssetCommand } from './cli';

function response(overrides: Partial<AssetResponse> = {}): AssetResponse {
  return {
    asset: undefined,
    ...overrides
  } as AssetResponse;
}

describe('asset command', () => {
  describe('createAssetCommand', () => {
    test('calls getAssetBy and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
  });
});
