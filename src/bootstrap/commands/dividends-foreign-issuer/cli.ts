/**
 * Модуль CLI-команды `operation foreign-dividends-report`.
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
import type {
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import {
  parseOptionalNonNegativeInt32Option,
  parseRequiredDateTimeOption,
  requireStringOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  dividendsForeignIssuerFormats,
  formatDividendsForeignIssuer
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
  options: TInvestOptions
) => DividendsForeignIssuerSdk;

type DividendsForeignIssuerOptions = InferOptions<
  typeof dividendsForeignIssuerOptionsSchema
>;
type DividendsForeignIssuerRequestOptions = CommandRequestOptions<
  DividendsForeignIssuerOptions,
  | 'task-id'
  | 'account-id'
  | 'from'
  | 'to'
  | 'page'
>;

const dividendsForeignIssuerOptionsSchema = withSdkOptions({
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
  },
  format: {
    type: 'string',
    choices: dividendsForeignIssuerFormats,
    default: 'table'
  }
});

export function createDividendsForeignIssuerRequest(
  options: DividendsForeignIssuerRequestOptions
): GetDividendsForeignIssuerRequest {
  const taskId = options['task-id'];
  const hasGenerateArgs = options['account-id'] !== undefined
    || options.from !== undefined
    || options.to !== undefined;

  if (taskId !== undefined && hasGenerateArgs) {
    throw new CliUsageError(
      "Expected either '--task-id' or '--account-id' with '--from' and '--to'"
    );
  }

  if (taskId !== undefined) {
    return {
      getDivForeignIssuerReport: {
        taskId,
        page: parseOptionalNonNegativeInt32Option(options.page, 'page')
      },
      generateDivForeignIssuerReport: undefined
    };
  }

  if (options.page !== undefined) {
    throw new CliUsageError("Expected '--page' only with '--task-id'");
  }

  const from = parseRequiredDateTimeOption(options.from, 'from');
  const to = parseRequiredDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
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

export function createDividendsForeignIssuerCommand(
  createSdk: DividendsForeignIssuerSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['operation', 'foreign-dividends-report'] as const,
    options: dividendsForeignIssuerOptionsSchema,
    async handle({ options }) {
      const request = createDividendsForeignIssuerRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.operations.getDividendsForeignIssuer(request);

        return formatDividendsForeignIssuer(response, format);
      });
    }
  });
}

export const dividendsForeignIssuerCommand =
  createDividendsForeignIssuerCommand();
