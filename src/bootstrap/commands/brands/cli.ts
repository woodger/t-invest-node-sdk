/**
 * Модуль CLI-команды `instruments get-brands`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetBrandsRequest, GetBrandsResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { brandsFormats, formatBrands, type BrandsFormat } from './reporter';

type BrandsSdk = {
  instruments: {
    getBrands(request: GetBrandsRequest): Promise<GetBrandsResponse>;
  };
  close(): void;
};

type BrandsSdkFactory = (options: TinkoffInvestOptions) => BrandsSdk;

const brandsCommandPath = ['instruments', 'get-brands'] as const;
const defaultBrandsSdkFactory: BrandsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const brandsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: brandsFormats,
    default: 'table'
  }
} as const);

type BrandsOptions = InferOptions<typeof brandsOptionsSchema>;

export function parseBrandsFormat(rawOptions: CommandRawOptions): BrandsFormat {
  return parseCommandOptions(rawOptions, brandsOptionsSchema).format;
}

export function createBrandsCommand(
  createSdk: BrandsSdkFactory = defaultBrandsSdkFactory
) {
  return command.define({
    path: brandsCommandPath,
    options: brandsOptionsSchema,
    handle({ options }) {
      return runBrandsCommand(options, createSdk);
    }
  });
}

export const brandsCommand = createBrandsCommand();

async function runBrandsCommand(
  options: BrandsOptions,
  createSdk: BrandsSdkFactory
): Promise<string> {
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getBrands({});

    return formatBrands(response.brands, format);
  }
  finally {
    sdk.close();
  }
}

export { formatBrands };
