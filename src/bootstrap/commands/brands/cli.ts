import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetBrandsRequest, GetBrandsResponse } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { brandsFormats, formatBrands, type BrandsFormat } from './reporter';

type BrandsSdk = {
  instruments: {
    getBrands(request: GetBrandsRequest): Promise<GetBrandsResponse>;
  };
  close(): void;
};

type BrandsSdkFactory = (options: TinkoffInvestOptions) => BrandsSdk;

const brandsArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

export function parseBrandsFormat(argv: CliArgs): BrandsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', brandsFormats) ?? 'table';
}

export function createBrandsCommand(
  createSdk: BrandsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function brands(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, brandsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-brands');

    const format = parseBrandsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getBrands({});

      return formatBrands(response.brands, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const brands = createBrandsCommand();

export { formatBrands };
