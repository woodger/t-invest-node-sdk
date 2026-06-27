import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOptionsBy, optionsByFormats, type OptionsByFormat } from './reporter';

type OptionsBySdk = {
  instruments: {
    optionsBy(request: FilterOptionsRequest): Promise<OptionsResponse>;
  };
  close(): void;
};

type OptionsBySdkFactory = (options: TinkoffInvestOptions) => OptionsBySdk;

const optionsByRequestOptionsSchema = {
  'basic-asset-uid': {
    type: 'string',
    required: true
  },
  'basic-asset-position-uid': {
    type: 'string'
  }
} as const;

const optionsByFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: optionsByFormats,
    default: 'table'
  }
} as const;

const optionsByOptionsSchema = withSdkOptions(
  optionsByRequestOptionsSchema,
  optionsByFormatOptionsSchema
);

function parseOptionsByOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments options-by', optionsByOptionsSchema);
}

export function parseOptionsByRequest(argv: CliArgs): FilterOptionsRequest {
  return createOptionsByRequest(parseOptionsByOptions(argv));
}

export function parseOptionsByFormat(argv: CliArgs): OptionsByFormat {
  return parseCommandOptions(
    argv,
    'instruments options-by',
    optionsByFormatOptionsSchema
  ).format;
}

export function createOptionsByCommand(
  createSdk: OptionsBySdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function optionsBy(argv: CliArgs): Promise<string> {
    const options = parseOptionsByOptions(argv);
    const request = createOptionsByRequest(options);
    const { format } = options;
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

function createOptionsByRequest(
  options: ReturnType<typeof parseOptionsByOptions>
): FilterOptionsRequest {
  return {
    basicAssetUid: options['basic-asset-uid'],
    basicAssetPositionUid: options['basic-asset-position-uid'] ?? ''
  };
}
