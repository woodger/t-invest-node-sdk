import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetFavoritesRequest, GetFavoritesResponse } from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { favoritesFormats, formatFavorites, type FavoritesFormat } from './reporter';

type FavoritesSdk = {
  instruments: {
    getFavorites(request: GetFavoritesRequest): Promise<GetFavoritesResponse>;
  };
  close(): void;
};

type FavoritesSdkFactory = (options: TinkoffInvestOptions) => FavoritesSdk;

const favoritesOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: favoritesFormats,
    default: 'table'
  }
} as const);

function parseFavoritesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments get-favorites', favoritesOptionsSchema);
}

export function parseFavoritesFormat(argv: CliArgs): FavoritesFormat {
  return parseFavoritesOptions(argv).format;
}

export function createFavoritesCommand(
  createSdk: FavoritesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function favorites(argv: CliArgs): Promise<string> {
    const { format } = parseFavoritesOptions(argv);
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
