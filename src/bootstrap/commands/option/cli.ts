/**
 * Модуль CLI-команды `instrument option show`.
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
  InstrumentRequest,
  OptionResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { formatOption, optionFormats } from './reporter';

type OptionSdk = {
  instruments: {
    optionBy(request: InstrumentRequest): Promise<OptionResponse>;
  };
  close(): void;
};

type OptionSdkFactory = (options: TInvestOptions) => OptionSdk;

const optionCommandPath = ['instrument', 'option', 'show'] as const;
const defaultOptionSdkFactory: OptionSdkFactory = (options) => new TInvestNodeSDK(options);

const optionFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: optionFormats,
    default: 'table'
  }
} as const;

const optionOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  optionFormatOptionsSchema
);

type OptionOptions = InferOptions<typeof optionOptionsSchema>;

export function createOptionCommand(
  createSdk: OptionSdkFactory = defaultOptionSdkFactory
) {
  return command.define({
    path: optionCommandPath,
    options: optionOptionsSchema,
    handle({ options }) {
      return runOptionCommand(options, createSdk);
    }
  });
}

export const optionCommand = createOptionCommand();

async function runOptionCommand(
  options: OptionOptions,
  createSdk: OptionSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.optionBy(request);

    return formatOption(response, format);
  });
}
