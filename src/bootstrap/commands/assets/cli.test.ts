import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { InstrumentType } from '../../../generated/common';
import type {
  AssetsRequest,
  AssetsResponse
} from '../../../generated/instruments';
import { createAssetsCommand, createAssetsRequest } from './cli';

function response(overrides: Partial<AssetsResponse> = {}): AssetsResponse {
  return {
    assets: [],
    ...overrides
  } as AssetsResponse;
}

describe('assets command', () => {
  describe('createAssetsRequest', () => {
    test('returns generated getAssets request', () => {
      const request = createAssetsRequest({ 'instrument-type': 'share' });

      assert.deepEqual(request, {
        instrumentType: InstrumentType.INSTRUMENT_TYPE_SHARE
      });
    });

    test('maps unspecified, bond, and clearing certificate types', () => {
      const cases = [
        ['unspecified', InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED],
        ['bond', InstrumentType.INSTRUMENT_TYPE_BOND],
        ['clearing-certificate', InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE]
      ] as const;

      for (const [instrumentType, expected] of cases) {
        assert.deepEqual(createAssetsRequest({
          'instrument-type': instrumentType
        }), {
          instrumentType: expected
        });
      }
    });
  });

  describe('createAssetsCommand', () => {
    test('calls getAssets and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
          'instrument',
          'asset',
          'list',
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
            'instrument',
            'asset',
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
