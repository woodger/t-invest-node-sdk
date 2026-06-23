import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOptionsBy, optionsByFormats, type OptionsByFormat } from './reporter';

type OptionsBySdk = {
  instruments: {
    optionsBy(request: FilterOptionsRequest): Promise<OptionsResponse>;
  };
  close(): void;
};

type OptionsBySdkFactory = (options: TinkoffInvestOptions) => OptionsBySdk;

const optionsByArgNames = new Set([
  ...sdkOptionArgNames,
  'basic-asset-uid',
  'basic-asset-position-uid',
  'format'
]);

export function parseOptionsByRequest(argv: CliArgs): FilterOptionsRequest {
  return {
    basicAssetUid: ArgGuards.requireStringArg(argv, 'basic-asset-uid'),
    basicAssetPositionUid: ArgGuards.optionalStringArgValue(argv, 'basic-asset-position-uid') ?? ''
  };
}

export function parseOptionsByFormat(argv: CliArgs): OptionsByFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', optionsByFormats) ?? 'table';
}

export function createOptionsByCommand(
  createSdk: OptionsBySdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function optionsBy(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, optionsByArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments options-by');

    const request = parseOptionsByRequest(argv);
    const format = parseOptionsByFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.optionsBy(request);

      return formatOptionsBy(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const optionsBy = createOptionsByCommand();

export { formatOptionsBy };
