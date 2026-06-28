import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetFavoritesRequest, GetFavoritesResponse } from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { favoritesFormats, formatFavorites, type FavoritesFormat } from './reporter';

type FavoritesSdk = {
  instruments: {
    getFavorites(request: GetFavoritesRequest): Promise<GetFavoritesResponse>;
  };
  close(): void;
};

type FavoritesSdkFactory = (options: TinkoffInvestOptions) => FavoritesSdk;

const favoritesCommandPath = ['instruments', 'get-favorites'] as const;
const defaultFavoritesSdkFactory: FavoritesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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
  return defineCommand({
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
