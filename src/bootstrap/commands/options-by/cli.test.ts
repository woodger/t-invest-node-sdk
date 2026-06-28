import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../command-options';
import {
  createOptionsByCommand,
  parseOptionsByFormat,
  createOptionsByRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<OptionsResponse> = {}): OptionsResponse {
  return {
    instruments: [],
    ...overrides
  };
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

  describe('parseOptionsByFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseOptionsByFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseOptionsByFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createOptionsByCommand', () => {
    test('calls optionsBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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

      const output = await runCommand(
        command,
        [
          'instruments',
          'options-by',
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
        () => runCommand(
          command,
          [
            'instruments',
            'options-by',
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
