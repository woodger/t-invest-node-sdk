/**
 * Модуль CLI-команды `operations get-broker-report`.
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
  BrokerReportRequest,
  BrokerReportResponse
} from '../../../generated/operations';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import {
  parseCommandOptions,
  parseOptionalNonNegativeIntegerOption,
  parseRequiredDateTimeOption,
  requireStringOption,
  withSdkOptions
} from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  brokerReportFormats,
  formatBrokerReport,
  type BrokerReportFormat
} from './reporter';

type BrokerReportSdk = {
  operations: {
    getBrokerReport(request: BrokerReportRequest): Promise<BrokerReportResponse>;
  };
  close(): void;
};

type BrokerReportSdkFactory = (options: TinkoffInvestOptions) => BrokerReportSdk;

const brokerReportCommandPath = ['operations', 'get-broker-report'] as const;
const defaultBrokerReportSdkFactory: BrokerReportSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const brokerReportRequestOptionsSchema = {
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

const brokerReportFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: brokerReportFormats,
    default: 'table'
  }
} as const;

const brokerReportOptionsSchema = withSdkOptions(
  brokerReportRequestOptionsSchema,
  brokerReportFormatOptionsSchema
);

type BrokerReportOptions = InferOptions<typeof brokerReportOptionsSchema>;
type BrokerReportRequestOptions = CommandRequestOptions<
  BrokerReportOptions,
  'task-id' |
  'account-id' |
  'from' |
  'to' |
  'page'
>;


export function createBrokerReportRequest(
  options: BrokerReportRequestOptions
): BrokerReportRequest {
  const taskId = options['task-id'];
  const hasGenerateArgs = options['account-id'] !== undefined
    || options.from !== undefined
    || options.to !== undefined;

  if (taskId !== undefined && hasGenerateArgs) {
    throw new Error("Expected either '--task-id' or '--account-id' with '--from' and '--to'");
  }

  if (taskId !== undefined) {
    return {
      getBrokerReportRequest: {
        taskId,
        page: parseOptionalNonNegativeIntegerOption(options.page, 'page')
      },
      generateBrokerReportRequest: undefined
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
    generateBrokerReportRequest: {
      accountId: requireStringOption(options['account-id'], 'account-id'),
      from,
      to
    },
    getBrokerReportRequest: undefined
  };
}


export function parseBrokerReportFormat(rawOptions: CommandRawOptions): BrokerReportFormat {
  return parseCommandOptions(rawOptions, brokerReportFormatOptionsSchema).format;
}

export function createBrokerReportCommand(
  createSdk: BrokerReportSdkFactory = defaultBrokerReportSdkFactory
) {
  return defineCommand({
    path: brokerReportCommandPath,
    options: brokerReportOptionsSchema,
    handle({ options }) {
      return runBrokerReportCommand(options, createSdk);
    }
  });
}

export const brokerReportCommand = createBrokerReportCommand();

async function runBrokerReportCommand(
  options: BrokerReportOptions,
  createSdk: BrokerReportSdkFactory
): Promise<string> {
  const request = createBrokerReportRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getBrokerReport(request);

    return formatBrokerReport(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatBrokerReport };
