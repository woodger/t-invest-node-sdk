import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetBrandsRequest, GetBrandsResponse } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const brandsCommandName = 'instruments get-brands';
const brandsCommandPath = ['instruments', 'get-brands'] as const;
const defaultBrandsSdkFactory: BrandsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const brandsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: brandsFormats,
    default: 'table'
  }
} as const);

function parseBrandsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, brandsCommandName, brandsOptionsSchema);
}

export function parseBrandsFormat(argv: CliArgs): BrandsFormat {
  return parseBrandsOptions(argv).format;
}

export function createBrandsCommand(
  createSdk: BrandsSdkFactory = defaultBrandsSdkFactory
) {
  return defineCommand({
    path: brandsCommandPath,
    options: brandsOptionsSchema,
    handle({ options }) {
      return runBrandsCommand(options, createSdk);
    }
  });
}

export const brandsCommand = createBrandsCommand();

async function runBrandsCommand(
  options: ReturnType<typeof parseBrandsOptions>,
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
