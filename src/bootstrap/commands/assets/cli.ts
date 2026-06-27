import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { AssetsRequest, AssetsResponse } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { assetsFormats, formatAssets, type AssetsFormat } from './reporter';

type AssetsSdk = {
  instruments: {
    getAssets(request: AssetsRequest): Promise<AssetsResponse>;
  };
  close(): void;
};

type AssetsSdkFactory = (options: TinkoffInvestOptions) => AssetsSdk;

const assetsCommandName = 'instruments get-assets';
const assetsCommandPath = ['instruments', 'get-assets'] as const;
const defaultAssetsSdkFactory: AssetsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const assetInstrumentTypes = {
  unspecified: InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED,
  bond: InstrumentType.INSTRUMENT_TYPE_BOND,
  share: InstrumentType.INSTRUMENT_TYPE_SHARE,
  currency: InstrumentType.INSTRUMENT_TYPE_CURRENCY,
  etf: InstrumentType.INSTRUMENT_TYPE_ETF,
  futures: InstrumentType.INSTRUMENT_TYPE_FUTURES,
  sp: InstrumentType.INSTRUMENT_TYPE_SP,
  option: InstrumentType.INSTRUMENT_TYPE_OPTION,
  'clearing-certificate': InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
} as const;

export const assetInstrumentTypeNames = Object.keys(assetInstrumentTypes) as Array<keyof typeof assetInstrumentTypes>;

type AssetInstrumentTypeName = typeof assetInstrumentTypeNames[number];

const assetsInstrumentTypeOptionsSchema = {
  'instrument-type': {
    type: 'string',
    choices: assetInstrumentTypeNames,
    default: 'unspecified'
  }
} as const;

const assetsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: assetsFormats,
    default: 'table'
  }
} as const;

const assetsOptionsSchema = withSdkOptions(
  assetsInstrumentTypeOptionsSchema,
  assetsFormatOptionsSchema
);

function parseAssetsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, assetsCommandName, assetsOptionsSchema);
}

export function parseAssetsInstrumentType(argv: CliArgs): InstrumentType {
  const options = parseCommandOptions(
    argv,
    assetsCommandName,
    assetsInstrumentTypeOptionsSchema
  );

  return assetInstrumentTypes[options['instrument-type'] as AssetInstrumentTypeName];
}

export function parseAssetsRequest(argv: CliArgs): AssetsRequest {
  return createAssetsRequest(parseAssetsOptions(argv));
}

export function parseAssetsFormat(argv: CliArgs): AssetsFormat {
  return parseCommandOptions(
    argv,
    assetsCommandName,
    assetsFormatOptionsSchema
  ).format;
}

export function createAssetsCommand(
  createSdk: AssetsSdkFactory = defaultAssetsSdkFactory
) {
  return defineCommand({
    path: assetsCommandPath,
    options: assetsOptionsSchema,
    handle({ options }) {
      return runAssetsCommand(options, createSdk);
    }
  });
}

export const assetsCommand = createAssetsCommand();

async function runAssetsCommand(
  options: ReturnType<typeof parseAssetsOptions>,
  createSdk: AssetsSdkFactory
): Promise<string> {
  const request = createAssetsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getAssets(request);

    return formatAssets(response.assets, format);
  }
  finally {
    sdk.close();
  }
}

export { formatAssets };

function createAssetsRequest(
  options: ReturnType<typeof parseAssetsOptions>
): AssetsRequest {
  return {
    instrumentType: assetInstrumentTypes[options['instrument-type'] as AssetInstrumentTypeName]
  };
}
