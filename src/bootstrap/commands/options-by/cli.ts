/**
 * Модуль CLI-команды `instrument option list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  FilterOptionsRequest,
  OptionsResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatOptionsBy, optionsByFormats } from './reporter';

type OptionsBySdk = {
  instruments: {
    optionsBy(request: FilterOptionsRequest): Promise<OptionsResponse>;
  };
  close(): void;
};

type OptionsBySdkFactory = (options: TInvestOptions) => OptionsBySdk;

const optionsByCommandPath = ['instrument', 'option', 'list'] as const;
const defaultOptionsBySdkFactory: OptionsBySdkFactory = (options) => new TInvestNodeSDK(options);

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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.optionsBy(request);

    return formatOptionsBy(response.instruments, format);
  });
}

export function createOptionsByRequest(
  options: OptionsByRequestOptions
): FilterOptionsRequest {
  return {
    basicAssetUid: options['basic-asset-uid'],
    basicAssetPositionUid: options['basic-asset-position-uid'] ?? ''
  };
}
