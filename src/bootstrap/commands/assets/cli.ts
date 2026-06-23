import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { AssetsRequest, AssetsResponse } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { assetsFormats, formatAssets, type AssetsFormat } from './reporter';

type AssetsSdk = {
  instruments: {
    getAssets(request: AssetsRequest): Promise<AssetsResponse>;
  };
  close(): void;
};

type AssetsSdkFactory = (options: TinkoffInvestOptions) => AssetsSdk;

const assetsArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-type',
  'format'
]);

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

export function parseAssetsInstrumentType(argv: CliArgs): InstrumentType {
  const instrumentType = ArgGuards.optionalStringArgValue(argv, 'instrument-type') ?? 'unspecified';

  if (!(instrumentType in assetInstrumentTypes)) {
    throw new Error(`Expected '--instrument-type' as one of: ${assetInstrumentTypeNames.join(', ')}`);
  }

  return assetInstrumentTypes[instrumentType as AssetInstrumentTypeName];
}

export function parseAssetsRequest(argv: CliArgs): AssetsRequest {
  return {
    instrumentType: parseAssetsInstrumentType(argv)
  };
}

export function parseAssetsFormat(argv: CliArgs): AssetsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', assetsFormats) ?? 'table';
}

export function createAssetsCommand(
  createSdk: AssetsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function assets(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, assetsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-assets');

    const request = parseAssetsRequest(argv);
    const format = parseAssetsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getAssets(request);

      return formatAssets(response.assets, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const assets = createAssetsCommand();

export { formatAssets };
