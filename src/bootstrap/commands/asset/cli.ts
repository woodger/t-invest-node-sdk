import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { AssetRequest, AssetResponse } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const assetCommandName = 'instruments get-asset-by';
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

function parseAssetOptions(argv: CliArgs) {
  return parseCommandOptions(argv, assetCommandName, assetOptionsSchema);
}

export function parseAssetRequest(argv: CliArgs): AssetRequest {
  return createAssetRequest(parseAssetOptions(argv));
}

export function parseAssetFormat(argv: CliArgs): AssetFormat {
  return parseCommandOptions(
    argv,
    assetCommandName,
    assetFormatOptionsSchema
  ).format;
}

export function createAssetCommand(
  createSdk: AssetSdkFactory = defaultAssetSdkFactory
) {
  return defineCommand({
    path: assetCommandPath,
    options: assetOptionsSchema,
    handle({ options }) {
      return runAssetCommand(options, createSdk);
    }
  });
}

export function asset(argv: CliArgs): Promise<string> {
  return runAssetCommand(
    parseAssetOptions(argv),
    defaultAssetSdkFactory
  );
}

export const assetCommand = createAssetCommand();

async function runAssetCommand(
  options: ReturnType<typeof parseAssetOptions>,
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

function createAssetRequest(
  options: ReturnType<typeof parseAssetOptions>
): AssetRequest {
  return {
    id: options.id
  };
}
