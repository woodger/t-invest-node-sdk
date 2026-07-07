/**
 * Модуль CLI-команды `instrument get-brand-by`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { brandFormats, formatBrand, type BrandFormat } from './reporter';

type BrandSdk = {
  instruments: {
    getBrandBy(request: GetBrandRequest): Promise<Brand>;
  };
  close(): void;
};

type BrandSdkFactory = (options: TinkoffInvestOptions) => BrandSdk;

const brandCommandPath = ['instrument', 'get-brand-by'] as const;
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

type BrandOptions = InferOptions<typeof brandOptionsSchema>;
type BrandRequestOptions = CommandRequestOptions<BrandOptions, 'id'>;



export function parseBrandFormat(rawOptions: CommandRawOptions): BrandFormat {
  return parseCommandOptions(rawOptions, brandFormatOptionsSchema).format;
}

export function createBrandCommand(
  createSdk: BrandSdkFactory = defaultBrandSdkFactory
) {
  return command.define({
    path: brandCommandPath,
    options: brandOptionsSchema,
    handle({ options }) {
      return runBrandCommand(options, createSdk);
    }
  });
}

export const brandCommand = createBrandCommand();

async function runBrandCommand(
  options: BrandOptions,
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

export function createBrandRequest(
  options: BrandRequestOptions
): GetBrandRequest {
  return {
    id: options.id
  };
}
