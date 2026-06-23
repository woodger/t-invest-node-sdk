import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { assetFormats, formatAsset, type AssetFormat } from './reporter';

type AssetSdk = {
  instruments: {
    getAssetBy(request: AssetRequest): Promise<AssetResponse>;
  };
  close(): void;
};

type AssetSdkFactory = (options: TinkoffInvestOptions) => AssetSdk;

const assetArgNames = new Set([
  ...sdkOptionArgNames,
  'id',
  'format'
]);

export function parseAssetRequest(argv: CliArgs): AssetRequest {
  return {
    id: ArgGuards.requireStringArg(argv, 'id')
  };
}

export function parseAssetFormat(argv: CliArgs): AssetFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', assetFormats) ?? 'table';
}

export function createAssetCommand(
  createSdk: AssetSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function asset(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, assetArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-asset-by');

    const request = parseAssetRequest(argv);
    const format = parseAssetFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getAssetBy(request);

      return formatAsset(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const asset = createAssetCommand();

export { formatAsset };
