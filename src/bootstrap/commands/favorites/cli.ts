/**
 * Модуль CLI-команды `instrument favorite list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetFavoritesRequest, GetFavoritesResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { favoritesFormats, formatFavorites, type FavoritesFormat } from './reporter';

type FavoritesSdk = {
  instruments: {
    getFavorites(request: GetFavoritesRequest): Promise<GetFavoritesResponse>;
  };
  close(): void;
};

type FavoritesSdkFactory = (options: TInvestOptions) => FavoritesSdk;

const favoritesCommandPath = ['instrument', 'favorite', 'list'] as const;
const defaultFavoritesSdkFactory: FavoritesSdkFactory = (options) => new TInvestNodeSDK(options);

const favoritesOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: favoritesFormats,
    default: 'table'
  }
} as const);

type FavoritesOptions = InferOptions<typeof favoritesOptionsSchema>;

export function parseFavoritesFormat(rawOptions: CommandRawOptions): FavoritesFormat {
  return parseCommandOptions(rawOptions, favoritesOptionsSchema).format;
}

export function createFavoritesCommand(
  createSdk: FavoritesSdkFactory = defaultFavoritesSdkFactory
) {
  return command.define({
    path: favoritesCommandPath,
    options: favoritesOptionsSchema,
    handle({ options }) {
      return runFavoritesCommand(options, createSdk);
    }
  });
}

export const favoritesCommand = createFavoritesCommand();

async function runFavoritesCommand(
  options: FavoritesOptions,
  createSdk: FavoritesSdkFactory
): Promise<string> {
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getFavorites({});

    return formatFavorites(response.favoriteInstruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFavorites };
