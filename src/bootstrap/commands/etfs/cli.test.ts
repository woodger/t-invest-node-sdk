import { InstrumentStatus } from '../../../generated/common';
import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { type EtfsResponse, type InstrumentsRequest } from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createEtfsCommand,
  parseEtfsFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<EtfsResponse> = {}): EtfsResponse {
  return {
    instruments: [],
    ...overrides
  } as EtfsResponse;
}

describe('etfs command', () => {
  describe('parseEtfsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseEtfsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseEtfsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createEtfsCommand', () => {
    test('calls etfs and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: InstrumentsRequest | undefined;
      let closeCalls = 0;
      const command = createEtfsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async etfs(request) {
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
          'etf',
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

    test('closes sdk when etfs rejects', async () => {
      let closeCalls = 0;
      const command = createEtfsCommand(() => ({
        instruments: {
          async etfs() {
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
