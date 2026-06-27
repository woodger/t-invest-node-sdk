import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { brandFormats, formatBrand, type BrandFormat } from './reporter';

type BrandSdk = {
  instruments: {
    getBrandBy(request: GetBrandRequest): Promise<Brand>;
  };
  close(): void;
};

type BrandSdkFactory = (options: TinkoffInvestOptions) => BrandSdk;

const brandRequestOptionsSchema = {
  id: {
    type: 'string',
    required: true
  }
} as const;

const brandFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: brandFormats,
    default: 'table'
  }
} as const;

const brandOptionsSchema = withSdkOptions({
  ...brandRequestOptionsSchema,
  ...brandFormatOptionsSchema
} as const);

function parseBrandOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments get-brand-by', brandOptionsSchema);
}

export function parseBrandRequest(argv: CliArgs): GetBrandRequest {
  return createBrandRequest(parseBrandOptions(argv));
}

export function parseBrandFormat(argv: CliArgs): BrandFormat {
  return parseCommandOptions(
    argv,
    'instruments get-brand-by',
    brandFormatOptionsSchema
  ).format;
}

export function createBrandCommand(
  createSdk: BrandSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function brand(argv: CliArgs): Promise<string> {
    const options = parseBrandOptions(argv);
    const request = createBrandRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getBrandBy(request);

      return formatBrand(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const brand = createBrandCommand();

export { formatBrand };

function createBrandRequest(
  options: ReturnType<typeof parseBrandOptions>
): GetBrandRequest {
  return {
    id: options.id
  };
}
