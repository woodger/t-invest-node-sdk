/**
 * Модуль CLI-команды `instruments get-asset-by`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../command-options';
import { parseCommandOptions, withSdkOptions } from '../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { assetFormats, formatAsset, type AssetFormat } from './reporter';

type AssetSdk = {
  instruments: {
    getAssetBy(request: AssetRequest): Promise<AssetResponse>;
  };
  close(): void;
};

type AssetSdkFactory = (options: TinkoffInvestOptions) => AssetSdk;

const assetCommandPath = ['instruments', 'get-asset-by'] as const;
const defaultAssetSdkFactory: AssetSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const assetRequestOptionsSchema = {
  id: {
    type: 'string',
    required: true
  }
} as const;

const assetFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: assetFormats,
    default: 'table'
  }
} as const;

const assetOptionsSchema = withSdkOptions(
  assetRequestOptionsSchema,
  assetFormatOptionsSchema
);

type AssetOptions = InferOptions<typeof assetOptionsSchema>;
type AssetRequestOptions = CommandRequestOptions<AssetOptions, 'id'>;



export function parseAssetFormat(rawOptions: CommandRawOptions): AssetFormat {
  return parseCommandOptions(rawOptions, assetFormatOptionsSchema).format;
}

export function createAssetCommand(
  createSdk: AssetSdkFactory = defaultAssetSdkFactory
) {
  return command.define({
    path: assetCommandPath,
    options: assetOptionsSchema,
    handle({ options }) {
      return runAssetCommand(options, createSdk);
    }
  });
}

export const assetCommand = createAssetCommand();

async function runAssetCommand(
  options: AssetOptions,
  createSdk: AssetSdkFactory
): Promise<string> {
  const request = createAssetRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getAssetBy(request);

    return formatAsset(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatAsset };

export function createAssetRequest(
  options: AssetRequestOptions
): AssetRequest {
  return {
    id: options.id
  };
}
