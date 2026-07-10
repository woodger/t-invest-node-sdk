/**
 * Модуль CLI-команды `instrument share show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { type InstrumentRequest, type ShareResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema,
  parseInstrumentLookupIdType,
} from '../../args/instruments-args';
import { formatShare, shareFormats, type ShareFormat } from './reporter';

type ShareSdk = {
  instruments: {
    shareBy(request: InstrumentRequest): Promise<ShareResponse>;
  };
  close(): void;
};

type ShareSdkFactory = (options: TinkoffInvestOptions) => ShareSdk;

const shareCommandPath = ['instrument', 'share', 'show'] as const;
const defaultShareSdkFactory: ShareSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const shareFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: shareFormats,
    default: 'table'
  }
} as const;

const shareOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  shareFormatOptionsSchema
);

type ShareOptions = InferOptions<typeof shareOptionsSchema>;

export const parseShareIdType = parseInstrumentLookupIdType;
export const createShareRequest = createInstrumentLookupRequestFromOptions;

export function parseShareFormat(rawOptions: CommandRawOptions): ShareFormat {
  return parseCommandOptions(rawOptions, shareFormatOptionsSchema).format;
}

export function createShareCommand(
  createSdk: ShareSdkFactory = defaultShareSdkFactory
) {
  return command.define({
    path: shareCommandPath,
    options: shareOptionsSchema,
    handle({ options }) {
      return runShareCommand(options, createSdk);
    }
  });
}

export const shareCommand = createShareCommand();

async function runShareCommand(
  options: ShareOptions,
  createSdk: ShareSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.shareBy(request);

    return formatShare(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatShare };
