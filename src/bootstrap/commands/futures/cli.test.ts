import { InstrumentStatus } from '../../../generated/common';
import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { type FuturesResponse, type InstrumentsRequest } from '../../../generated/instruments';
import { createFuturesCommand } from './cli';

function response(overrides: Partial<FuturesResponse> = {}): FuturesResponse {
  return {
    instruments: [],
    ...overrides
  } as FuturesResponse;
}

describe('futures command', () => {
  describe('createFuturesCommand', () => {
    test('calls futures and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
