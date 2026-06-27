import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const brandCommandName = 'instruments get-brand-by';
const brandCommandPath = ['instruments', 'get-brand-by'] as const;
const defaultBrandSdkFactory: BrandSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

const brandOptionsSchema = withSdkOptions(
  brandRequestOptionsSchema,
  brandFormatOptionsSchema
);

function parseBrandOptions(argv: CliArgs) {
  return parseCommandOptions(argv, brandCommandName, brandOptionsSchema);
}

export function parseBrandRequest(argv: CliArgs): GetBrandRequest {
  return createBrandRequest(parseBrandOptions(argv));
}

export function parseBrandFormat(argv: CliArgs): BrandFormat {
  return parseCommandOptions(
    argv,
    brandCommandName,
    brandFormatOptionsSchema
  ).format;
}

export function createBrandCommand(
  createSdk: BrandSdkFactory = defaultBrandSdkFactory
) {
  return defineCommand({
    path: brandCommandPath,
    options: brandOptionsSchema,
    handle({ options }) {
      return runBrandCommand(options, createSdk);
    }
  });
}

export function brand(argv: CliArgs): Promise<string> {
  return runBrandCommand(
    parseBrandOptions(argv),
    defaultBrandSdkFactory
  );
}

export const brandCommand = createBrandCommand();

async function runBrandCommand(
  options: ReturnType<typeof parseBrandOptions>,
  createSdk: BrandSdkFactory
): Promise<string> {
  const request = createBrandRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getBrandBy(request);

    return formatBrand(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatBrand };

function createBrandRequest(
  options: ReturnType<typeof parseBrandOptions>
): GetBrandRequest {
  return {
    id: options.id
  };
}
