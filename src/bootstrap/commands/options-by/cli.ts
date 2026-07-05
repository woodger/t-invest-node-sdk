/**
 * Модуль CLI-команды `instruments options-by`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../command-options';
import { parseCommandOptions, withSdkOptions } from '../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOptionsBy, optionsByFormats, type OptionsByFormat } from './reporter';

type OptionsBySdk = {
  instruments: {
    optionsBy(request: FilterOptionsRequest): Promise<OptionsResponse>;
  };
  close(): void;
};

type OptionsBySdkFactory = (options: TinkoffInvestOptions) => OptionsBySdk;

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

type OptionsByOptions = InferOptions<typeof optionsByOptionsSchema>;
type OptionsByRequestOptions = CommandRequestOptions<OptionsByOptions, 'basic-asset-uid' | 'basic-asset-position-uid'>;



export function parseOptionsByFormat(rawOptions: CommandRawOptions): OptionsByFormat {
  return parseCommandOptions(rawOptions, optionsByFormatOptionsSchema).format;
}

export function createOptionsByCommand(
  createSdk: OptionsBySdkFactory = defaultOptionsBySdkFactory
) {
  return command.define({
    path: optionsByCommandPath,
    options: optionsByOptionsSchema,
    handle({ options }) {
      return runOptionsByCommand(options, createSdk);
    }
  });
}

export const optionsByCommand = createOptionsByCommand();

async function runOptionsByCommand(
  options: OptionsByOptions,
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

export function createOptionsByRequest(
  options: OptionsByRequestOptions
): FilterOptionsRequest {
  return {
    basicAssetUid: options['basic-asset-uid'],
    basicAssetPositionUid: options['basic-asset-position-uid'] ?? ''
  };
}
