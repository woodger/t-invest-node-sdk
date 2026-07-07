import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import {
  EditFavoritesActionType,
  type EditFavoritesRequest,
  type EditFavoritesResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createEditFavoritesCommand,
  createEditFavoritesRequest,
  parseEditFavoritesFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function editFavoritesResponse(): EditFavoritesResponse {
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
    ]
  };
}

describe('edit-favorites command', () => {
  describe('createEditFavoritesRequest', () => {
    test('returns generated editFavorites request', () => {
      assert.deepEqual(createEditFavoritesRequest({
        'instrument-id': 'figi-1,figi-2',
        action: 'add'
      }), {
        instruments: [
          { figi: 'figi-1' },
          { figi: 'figi-2' }
        ],
        actionType: EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_ADD
      });
    });
  });

  describe('parseEditFavoritesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseEditFavoritesFormat(rawOptions()), 'table');
    });
  });

  describe('createEditFavoritesCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createEditFavoritesCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          ['instruments', 'edit-favorites', '--instrument-id=figi-1', '--action=add'],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls editFavorites and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: EditFavoritesRequest | undefined;
      let closeCalls = 0;
      const command = createEditFavoritesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async editFavorites(request) {
              receivedRequest = request;

              return editFavoritesResponse();
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
          'edit-favorites',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0',
          '--action=add',
          '--confirm',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        instruments: [
          {
            figi: 'BBG00QPYJ5H0'
          }
        ],
        actionType: EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_ADD
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].ticker, 'TCSG');
    });
  });
});
