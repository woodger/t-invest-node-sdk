import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { assetFormats, formatAsset, type AssetFormat } from './reporter';

type AssetSdk = {
  instruments: {
    getAssetBy(request: AssetRequest): Promise<AssetResponse>;
  };
  close(): void;
};

type AssetSdkFactory = (options: TinkoffInvestOptions) => AssetSdk;

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

const assetOptionsSchema = withSdkOptions({
  ...assetRequestOptionsSchema,
  ...assetFormatOptionsSchema
} as const);

function parseAssetOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments get-asset-by', assetOptionsSchema);
}

export function parseAssetRequest(argv: CliArgs): AssetRequest {
  return createAssetRequest(parseAssetOptions(argv));
}

export function parseAssetFormat(argv: CliArgs): AssetFormat {
  return parseCommandOptions(
    argv,
    'instruments get-asset-by',
    assetFormatOptionsSchema
  ).format;
}

export function createAssetCommand(
  createSdk: AssetSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function asset(argv: CliArgs): Promise<string> {
    const options = parseAssetOptions(argv);
    const request = createAssetRequest(options);
    const { format } = options;
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

function createAssetRequest(
  options: ReturnType<typeof parseAssetOptions>
): AssetRequest {
  return {
    id: options.id
  };
}
