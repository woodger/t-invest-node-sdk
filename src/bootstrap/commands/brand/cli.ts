import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
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

function parseBrandOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(rawOptions, brandCommandName, brandOptionsSchema);
}

export function parseBrandRequest(rawOptions: CommandRawOptions): GetBrandRequest {
  return createBrandRequest(parseBrandOptions(rawOptions));
}

export function parseBrandFormat(rawOptions: CommandRawOptions): BrandFormat {
  return parseCommandOptions(
    rawOptions,
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
