/**
 * Модуль CLI-команды `operation get-dividends-foreign-issuer`.
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
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  parseOptionalNonNegativeIntegerOption,
  parseRequiredDateTimeOption,
  requireStringOption,
  withSdkOptions
} from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  dividendsForeignIssuerFormats,
  formatDividendsForeignIssuer,
  type DividendsForeignIssuerFormat
} from './reporter';

type DividendsForeignIssuerSdk = {
  operations: {
    getDividendsForeignIssuer(
      request: GetDividendsForeignIssuerRequest
    ): Promise<GetDividendsForeignIssuerResponse>;
  };
  close(): void;
};

type DividendsForeignIssuerSdkFactory = (
  options: TinkoffInvestOptions
) => DividendsForeignIssuerSdk;

const dividendsForeignIssuerCommandPath = ['operation', 'get-dividends-foreign-issuer'] as const;
const defaultDividendsForeignIssuerSdkFactory: DividendsForeignIssuerSdkFactory = (
  options
) => new TinkoffInvestNodeSDK(options);

const dividendsForeignIssuerRequestOptionsSchema = {
  'account-id': {
    type: 'string'
  },
  from: {
    type: 'string'
  },
  to: {
    type: 'string'
  },
  'task-id': {
    type: 'string'
  },
  page: {
    type: 'string'
  }
} as const;

const dividendsForeignIssuerFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: dividendsForeignIssuerFormats,
    default: 'table'
  }
} as const;

const dividendsForeignIssuerOptionsSchema = withSdkOptions(
  dividendsForeignIssuerRequestOptionsSchema,
  dividendsForeignIssuerFormatOptionsSchema
);

type DividendsForeignIssuerOptions = InferOptions<typeof dividendsForeignIssuerOptionsSchema>;
type DividendsForeignIssuerRequestOptions = CommandRequestOptions<
  DividendsForeignIssuerOptions,
  'task-id' |
  'account-id' |
  'from' |
  'to' |
  'page'
>;


export function createDividendsForeignIssuerRequest(
  options: DividendsForeignIssuerRequestOptions
): GetDividendsForeignIssuerRequest {
  const taskId = options['task-id'];
  const hasGenerateArgs = options['account-id'] !== undefined
    || options.from !== undefined
    || options.to !== undefined;

  if (taskId !== undefined && hasGenerateArgs) {
    throw new Error("Expected either '--task-id' or '--account-id' with '--from' and '--to'");
  }

  if (taskId !== undefined) {
    return {
      getDivForeignIssuerReport: {
        taskId,
        page: parseOptionalNonNegativeIntegerOption(options.page, 'page')
      },
      generateDivForeignIssuerReport: undefined
    };
  }

  if (options.page !== undefined) {
    throw new Error("Expected '--page' only with '--task-id'");
  }

  const from = parseRequiredDateTimeOption(options.from, 'from');
  const to = parseRequiredDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    generateDivForeignIssuerReport: {
      accountId: requireStringOption(options['account-id'], 'account-id'),
      from,
      to
    },
    getDivForeignIssuerReport: undefined
  };
}


export function parseDividendsForeignIssuerFormat(
  rawOptions: CommandRawOptions
): DividendsForeignIssuerFormat {
  return parseCommandOptions(rawOptions, dividendsForeignIssuerFormatOptionsSchema).format;
}

export function createDividendsForeignIssuerCommand(
  createSdk: DividendsForeignIssuerSdkFactory = defaultDividendsForeignIssuerSdkFactory
) {
  return command.define({
    path: dividendsForeignIssuerCommandPath,
    options: dividendsForeignIssuerOptionsSchema,
    handle({ options }) {
      return runDividendsForeignIssuerCommand(options, createSdk);
    }
  });
}

export const dividendsForeignIssuerCommand = createDividendsForeignIssuerCommand();

async function runDividendsForeignIssuerCommand(
  options: DividendsForeignIssuerOptions,
  createSdk: DividendsForeignIssuerSdkFactory
): Promise<string> {
  const request = createDividendsForeignIssuerRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getDividendsForeignIssuer(request);

    return formatDividendsForeignIssuer(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatDividendsForeignIssuer };
