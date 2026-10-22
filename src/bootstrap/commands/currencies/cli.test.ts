import { InstrumentStatus } from '../../../generated/common';
import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { type CurrenciesResponse, type InstrumentsRequest } from '../../../generated/instruments';
import { createCurrenciesCommand } from './cli';

function response(
  overrides: Partial<CurrenciesResponse> = {}
): CurrenciesResponse {
  return {
    instruments: [],
    ...overrides
  } as CurrenciesResponse;
}

describe('currencies command', () => {
  describe('createCurrenciesCommand', () => {
    test('calls currencies and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
  });
});
