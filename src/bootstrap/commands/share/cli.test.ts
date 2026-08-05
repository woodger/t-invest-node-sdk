import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  InstrumentIdType,
  type InstrumentRequest,
  type ShareResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createShareCommand,
  parseShareFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function shareResponse(overrides: Partial<ShareResponse> = {}): ShareResponse {
  return {
    instrument: undefined,
    ...overrides
  } as ShareResponse;
}

describe('share command', () => {
  describe('parseShareFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseShareFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseShareFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createShareCommand', () => {
    test('calls shareBy and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createShareCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async shareBy(request) {
              receivedRequest = request;

              return shareResponse();
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
          'share',
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=SBER',
          '--id-type=ticker',
          '--class-code=TQBR',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'SBER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQBR'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when shareBy rejects', async () => {
      let closeCalls = 0;
      const command = createShareCommand(() => ({
        instruments: {
          async shareBy() {
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
            'share',
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG004730N88',
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
