/**
 * Модуль CLI-команды `instrument favorite list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  GetFavoritesRequest,
  GetFavoritesResponse
} from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { favoritesFormats, formatFavorites } from './reporter';

type FavoritesSdk = {
  instruments: {
    getFavorites(request: GetFavoritesRequest): Promise<GetFavoritesResponse>;
  };
  close(): void;
};

type FavoritesSdkFactory = (options: TInvestOptions) => FavoritesSdk;

export function createFavoritesCommand(
  createSdk: FavoritesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'favorite', 'list'] as const,
    options: withSdkOptions({
      format: {
        type: 'string',
        choices: favoritesFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getFavorites({});

        return formatFavorites(response.favoriteInstruments, format);
      });
    }
  });
}

export const favoritesCommand = createFavoritesCommand();
