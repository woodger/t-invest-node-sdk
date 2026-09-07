import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import { createOptionsByCommand, createOptionsByRequest } from './cli';

function response(overrides: Partial<OptionsResponse> = {}): OptionsResponse {
  return {
    instruments: [],
    ...overrides
  } as OptionsResponse;
}

describe('options-by command', () => {
  describe('createOptionsByRequest', () => {
    test('returns generated optionsBy request', () => {
      const request = createOptionsByRequest({
        'basic-asset-uid': 'asset-uid'
      });

      assert.deepEqual(request, {
        basicAssetUid: 'asset-uid',
        basicAssetPositionUid: ''
      });
    });

    test('uses optional basic asset position uid', () => {
      const request = createOptionsByRequest({
        'basic-asset-uid': 'asset-uid',
        'basic-asset-position-uid': 'position-uid'
      });

      assert.deepEqual(request, {
        basicAssetUid: 'asset-uid',
        basicAssetPositionUid: 'position-uid'
      });
    });

  });

  describe('createOptionsByCommand', () => {
    test('calls optionsBy and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: FilterOptionsRequest | undefined;
      let closeCalls = 0;
      const command = createOptionsByCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async optionsBy(request) {
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
          'option',
          'list',
          '--token=token',
          '--endpoint=localhost:50051',
          '--basic-asset-uid=asset-uid',
          '--basic-asset-position-uid=position-uid',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        basicAssetUid: 'asset-uid',
        basicAssetPositionUid: 'position-uid'
      });
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(output), []);
    });

    test('closes sdk when optionsBy rejects', async () => {
      let closeCalls = 0;
      const command = createOptionsByCommand(() => ({
        instruments: {
          async optionsBy() {
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
            'option',
            'list',
            '--token=token',
            '--endpoint=localhost:50051',
            '--basic-asset-uid=asset-uid'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
