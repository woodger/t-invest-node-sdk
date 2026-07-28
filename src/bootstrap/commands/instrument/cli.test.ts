import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentIdType,
  type InstrumentRequest,
  type InstrumentResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createInstrumentCommand,
  parseInstrumentFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function instrumentResponse(overrides: Partial<InstrumentResponse> = {}): InstrumentResponse {
  return {
    instrument: undefined,
    ...overrides
  } as InstrumentResponse;
}

describe('instrument command', () => {
  describe('parseInstrumentFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseInstrumentFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseInstrumentFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createInstrumentCommand', () => {
    test('calls getInstrumentBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createInstrumentCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getInstrumentBy(request) {
              receivedRequest = request;

              return instrumentResponse();
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
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=TCSG',
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
        id: 'TCSG',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQBR'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when getInstrumentBy rejects', async () => {
      let closeCalls = 0;
      const command = createInstrumentCommand(() => ({
        instruments: {
          async getInstrumentBy() {
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
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG00QPYJ5H0',
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
