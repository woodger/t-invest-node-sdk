import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetFavoritesRequest, GetFavoritesResponse } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { favoritesFormats, formatFavorites, type FavoritesFormat } from './reporter';

type FavoritesSdk = {
  instruments: {
    getFavorites(request: GetFavoritesRequest): Promise<GetFavoritesResponse>;
  };
  close(): void;
};

type FavoritesSdkFactory = (options: TinkoffInvestOptions) => FavoritesSdk;

const favoritesArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

export function parseFavoritesFormat(argv: CliArgs): FavoritesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', favoritesFormats) ?? 'table';
}

export function createFavoritesCommand(
  createSdk: FavoritesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function favorites(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, favoritesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-favorites');

    const format = parseFavoritesFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getFavorites({});

      return formatFavorites(response.favoriteInstruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const favorites = createFavoritesCommand();

export { formatFavorites };
