/**
 * Модуль CLI-команды `instrument asset show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { assetFormats, formatAsset } from './reporter';

type AssetSdk = {
  instruments: {
    getAssetBy(request: AssetRequest): Promise<AssetResponse>;
  };
  close(): void;
};

type AssetSdkFactory = (options: TInvestOptions) => AssetSdk;

const assetCommandPath = ['instrument', 'asset', 'show'] as const;
const defaultAssetSdkFactory: AssetSdkFactory = (options) => new TInvestNodeSDK(options);

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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.getAssetBy(request);

    return formatAsset(response, format);
  });
}

export function createAssetRequest(
  options: AssetRequestOptions
): AssetRequest {
  return {
    id: options.id
  };
}
