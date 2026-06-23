import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { brandFormats, formatBrand, type BrandFormat } from './reporter';

type BrandSdk = {
  instruments: {
    getBrandBy(request: GetBrandRequest): Promise<Brand>;
  };
  close(): void;
};

type BrandSdkFactory = (options: TinkoffInvestOptions) => BrandSdk;

const brandArgNames = new Set([
  ...sdkOptionArgNames,
  'id',
  'format'
]);

export function parseBrandRequest(argv: CliArgs): GetBrandRequest {
  return {
    id: ArgGuards.requireStringArg(argv, 'id')
  };
}

export function parseBrandFormat(argv: CliArgs): BrandFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', brandFormats) ?? 'table';
}

export function createBrandCommand(
  createSdk: BrandSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function brand(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, brandArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-brand-by');

    const request = parseBrandRequest(argv);
    const format = parseBrandFormat(argv);
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
