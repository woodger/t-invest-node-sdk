import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetBrandsRequest, GetBrandsResponse } from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { brandsFormats, formatBrands, type BrandsFormat } from './reporter';

type BrandsSdk = {
  instruments: {
    getBrands(request: GetBrandsRequest): Promise<GetBrandsResponse>;
  };
  close(): void;
};

type BrandsSdkFactory = (options: TinkoffInvestOptions) => BrandsSdk;

const brandsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: brandsFormats,
    default: 'table'
  }
} as const);

function parseBrandsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments get-brands', brandsOptionsSchema);
}

export function parseBrandsFormat(argv: CliArgs): BrandsFormat {
  return parseBrandsOptions(argv).format;
}

export function createBrandsCommand(
  createSdk: BrandsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function brands(argv: CliArgs): Promise<string> {
    const { format } = parseBrandsOptions(argv);
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
