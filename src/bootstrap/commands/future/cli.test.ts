import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  InstrumentIdType,
  type FutureResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import { createFutureCommand } from './cli';

function futureResponse(overrides: Partial<FutureResponse> = {}): FutureResponse {
  return {
    instrument: undefined,
    ...overrides
  } as FutureResponse;
}

describe('future command', () => {
  describe('createFutureCommand', () => {
    test('calls futureBy and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createFutureCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async futureBy(request) {
              receivedRequest = request;

              return futureResponse();
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
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=SiM6',
          '--id-type=ticker',
          '--class-code=SPBFUT',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'SiM6',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'SPBFUT'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when futureBy rejects', async () => {
      let closeCalls = 0;
      const command = createFutureCommand(() => ({
        instruments: {
          async futureBy() {
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
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=FUTFIGI',
            '--id-type=figi'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
