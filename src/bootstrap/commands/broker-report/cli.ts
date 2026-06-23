import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BrokerReportRequest,
  BrokerReportResponse
} from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const brokerReportArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'from',
  'to',
  'task-id',
  'page',
  'format'
]);

function hasArg(argv: CliArgs, name: string): boolean {
  return argv[name] !== undefined;
}

function parsePage(argv: CliArgs): number {
  const rawValue = ArgGuards.optionalStringArgValue(argv, 'page');

  if (rawValue === undefined) {
    return 0;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new Error("Expected '--page' as integer greater than or equal to 0");
  }

  const page = Number(rawValue);

  if (!Number.isSafeInteger(page)) {
    throw new Error("Expected '--page' as integer greater than or equal to 0");
  }

  return page;
}

export function parseBrokerReportRequest(argv: CliArgs): BrokerReportRequest {
  const isGetMode = hasArg(argv, 'task-id');
  const hasGenerateArgs = hasArg(argv, 'account-id') || hasArg(argv, 'from') || hasArg(argv, 'to');

  if (isGetMode && hasGenerateArgs) {
    throw new Error("Expected either '--task-id' or '--account-id' with '--from' and '--to'");
  }

  if (isGetMode) {
    return {
      getBrokerReportRequest: {
        taskId: ArgGuards.requireStringArg(argv, 'task-id'),
        page: parsePage(argv)
      },
      generateBrokerReportRequest: undefined
    };
  }

  if (hasArg(argv, 'page')) {
    throw new Error("Expected '--page' only with '--task-id'");
  }

  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    generateBrokerReportRequest: {
      accountId: ArgGuards.requireStringArg(argv, 'account-id'),
      from,
      to
    },
    getBrokerReportRequest: undefined
  };
}

export function parseBrokerReportFormat(argv: CliArgs): BrokerReportFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', brokerReportFormats) ?? 'table';
}

export function createBrokerReportCommand(
  createSdk: BrokerReportSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function brokerReport(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, brokerReportArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'operations get-broker-report');

    const request = parseBrokerReportRequest(argv);
    const format = parseBrokerReportFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getBrokerReport(request);

      return formatBrokerReport(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const brokerReport = createBrokerReportCommand();

export { formatBrokerReport };
