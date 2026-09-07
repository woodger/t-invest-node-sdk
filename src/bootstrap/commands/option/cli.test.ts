import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  InstrumentIdType,
  type InstrumentRequest,
  type OptionResponse
} from '../../../generated/instruments';
import { createOptionCommand } from './cli';

function optionResponse(overrides: Partial<OptionResponse> = {}): OptionResponse {
  return {
    instrument: undefined,
    ...overrides
  } as OptionResponse;
}

describe('option command', () => {
  describe('createOptionCommand', () => {
    test('calls optionBy and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createOptionCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async optionBy(request) {
              receivedRequest = request;

              return optionResponse();
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
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=OPTIONTICKER',
          '--id-type=ticker',
          '--class-code=SPBOPT',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'OPTIONTICKER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'SPBOPT'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when optionBy rejects', async () => {
      let closeCalls = 0;
      const command = createOptionCommand(() => ({
        instruments: {
          async optionBy() {
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
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=OPTIONUID',
            '--id-type=uid'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
