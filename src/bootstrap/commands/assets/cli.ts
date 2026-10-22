/**
 * Модуль CLI-команды `instrument asset list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { AssetsRequest, AssetsResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { assetsFormats, formatAssets } from './reporter';

type AssetsSdk = {
  instruments: {
    getAssets(request: AssetsRequest): Promise<AssetsResponse>;
  };
  close(): void;
};

type AssetsSdkFactory = (options: TInvestOptions) => AssetsSdk;

type AssetInstrumentTypeName = typeof assetInstrumentTypeNames[number];

type AssetsOptions = InferOptions<typeof assetsOptionsSchema>;
type AssetsRequestOptions = CommandRequestOptions<AssetsOptions, 'instrument-type'>;

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

const assetInstrumentTypeNames = Object.keys(assetInstrumentTypes) as Array<
  keyof typeof assetInstrumentTypes
>;

const assetsOptionsSchema = withSdkOptions({
  'instrument-type': {
    type: 'string',
    choices: assetInstrumentTypeNames,
    default: 'unspecified'
  },
  format: {
    type: 'string',
    choices: assetsFormats,
    default: 'table'
  }
});

export function createAssetsCommand(
  createSdk: AssetsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'asset', 'list'] as const,
    options: assetsOptionsSchema,
    async handle({ options }) {
      const request = createAssetsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getAssets(request);

        return formatAssets(response.assets, format);
      });
    }
  });
}

export const assetsCommand = createAssetsCommand();

export function createAssetsRequest(options: AssetsRequestOptions): AssetsRequest {
  return {
    instrumentType: assetInstrumentTypes[
      options['instrument-type'] as AssetInstrumentTypeName
    ]
  };
}
