import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { GetFavoritesRequest, GetFavoritesResponse } from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createFavoritesCommand,
  parseFavoritesFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<GetFavoritesResponse> = {}): GetFavoritesResponse {
  return {
    favoriteInstruments: [
      {
        figi: 'BBG00QPYJ5H0',
        ticker: 'TCSG',
        classCode: 'TQBR',
        isin: 'RU000A107UL4',
        instrumentType: 'share',
        otcFlag: false,
        apiTradeAvailableFlag: true,
        instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE
      }
    ],
    ...overrides
  };
}

describe('favorites command', () => {
  describe('parseFavoritesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFavoritesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFavoritesFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createFavoritesCommand', () => {
    test('calls getFavorites and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetFavoritesRequest | undefined;
      let getFavoritesCalls = 0;
      let closeCalls = 0;
      const command = createFavoritesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getFavorites(request) {
              receivedRequest = request;
              getFavoritesCalls += 1;

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
          'instruments',
          'get-favorites',
          '--token=token',
          '--endpoint=localhost:50051',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getFavoritesCalls, 1);
      assert.deepEqual(receivedRequest, {});
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].ticker, 'TCSG');
    });

    test('closes sdk when getFavorites rejects', async () => {
      let closeCalls = 0;
      const command = createFavoritesCommand(() => ({
        instruments: {
          async getFavorites() {
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
            'instruments',
            'get-favorites',
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
