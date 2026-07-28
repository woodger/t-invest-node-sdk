import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type EtfResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createEtfCommand,
  parseEtfFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function etfResponse(overrides: Partial<EtfResponse> = {}): EtfResponse {
  return {
    instrument: undefined,
    ...overrides
  } as EtfResponse;
}

describe('etf command', () => {
  describe('parseEtfFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseEtfFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseEtfFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createEtfCommand', () => {
    test('calls etfBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createEtfCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async etfBy(request) {
              receivedRequest = request;

              return etfResponse();
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
          'etf',
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=TMOS',
          '--id-type=ticker',
          '--class-code=TQTF',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'TMOS',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQTF'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when etfBy rejects', async () => {
      let closeCalls = 0;
      const command = createEtfCommand(() => ({
        instruments: {
          async etfBy() {
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
            'etf',
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG333333333',
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
