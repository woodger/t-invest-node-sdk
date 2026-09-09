/**
 * Модуль CLI-команды `instrument future margin`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetFuturesMarginRequest,
  type GetFuturesMarginResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import { formatFuturesMargin, futuresMarginFormats } from './reporter';

type FuturesMarginSdk = {
  instruments: {
    getFuturesMargin(request: GetFuturesMarginRequest): Promise<GetFuturesMarginResponse>;
  };
  close(): void;
};

type FuturesMarginSdkFactory = (options: TInvestOptions) => FuturesMarginSdk;

const futuresMarginCommandPath = ['instrument', 'future', 'margin'] as const;
const defaultFuturesMarginSdkFactory: FuturesMarginSdkFactory = (options) => new TInvestNodeSDK(options);

const futuresMarginRequestOptionsSchema = {
  ...instrumentIdWithDeprecatedFigiOptionsSchema
} as const;

const futuresMarginFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futuresMarginFormats,
    default: 'table'
  }
} as const;

const futuresMarginOptionsSchema = withSdkOptions(
  futuresMarginRequestOptionsSchema,
  futuresMarginFormatOptionsSchema
);

type FuturesMarginOptions = InferOptions<typeof futuresMarginOptionsSchema>;
type FuturesMarginRequestOptions = CommandRequestOptions<
  FuturesMarginOptions,
  'instrument-id' | 'figi'
>;

export function createFuturesMarginCommand(
  createSdk: FuturesMarginSdkFactory = defaultFuturesMarginSdkFactory
) {
  return command.define({
    path: futuresMarginCommandPath,
    options: futuresMarginOptionsSchema,
    handle({ options }) {
      return runFuturesMarginCommand(options, createSdk);
    }
  });
}

export const futuresMarginCommand = createFuturesMarginCommand();

async function runFuturesMarginCommand(
  options: FuturesMarginOptions,
  createSdk: FuturesMarginSdkFactory
): Promise<string> {
  const request = createFuturesMarginRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.getFuturesMargin(request);

    return formatFuturesMargin(response, format);
  });
}

export function createFuturesMarginRequest(
  options: FuturesMarginRequestOptions
): GetFuturesMarginRequest {
  const instrumentId = resolveInstrumentIdOption(options);

  return GetFuturesMarginRequest.create({
    instrumentId
  });
}
