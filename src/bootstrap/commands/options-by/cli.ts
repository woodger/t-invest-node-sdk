import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const optionsByCommandName = 'instruments options-by';
const optionsByCommandPath = ['instruments', 'options-by'] as const;
const defaultOptionsBySdkFactory: OptionsBySdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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
  return parseCommandOptions(argv, optionsByCommandName, optionsByOptionsSchema);
}

export function parseOptionsByRequest(argv: CliArgs): FilterOptionsRequest {
  return createOptionsByRequest(parseOptionsByOptions(argv));
}

export function parseOptionsByFormat(argv: CliArgs): OptionsByFormat {
  return parseCommandOptions(
    argv,
    optionsByCommandName,
    optionsByFormatOptionsSchema
  ).format;
}

export function createOptionsByCommand(
  createSdk: OptionsBySdkFactory = defaultOptionsBySdkFactory
) {
  return defineCommand({
    path: optionsByCommandPath,
    options: optionsByOptionsSchema,
    handle({ options }) {
      return runOptionsByCommand(options, createSdk);
    }
  });
}

export function optionsBy(argv: CliArgs): Promise<string> {
  return runOptionsByCommand(
    parseOptionsByOptions(argv),
    defaultOptionsBySdkFactory
  );
}

export const optionsByCommand = createOptionsByCommand();

async function runOptionsByCommand(
  options: ReturnType<typeof parseOptionsByOptions>,
  createSdk: OptionsBySdkFactory
): Promise<string> {
  const request = createOptionsByRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.optionsBy(request);

    return formatOptionsBy(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOptionsBy };

function createOptionsByRequest(
  options: ReturnType<typeof parseOptionsByOptions>
): FilterOptionsRequest {
  return {
    basicAssetUid: options['basic-asset-uid'],
    basicAssetPositionUid: options['basic-asset-position-uid'] ?? ''
  };
}
