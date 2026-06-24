import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const dividendsForeignIssuerArgNames = new Set([
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

export function parseDividendsForeignIssuerRequest(
  argv: CliArgs
): GetDividendsForeignIssuerRequest {
  const isGetMode = hasArg(argv, 'task-id');
  const hasGenerateArgs = hasArg(argv, 'account-id') || hasArg(argv, 'from') || hasArg(argv, 'to');

  if (isGetMode && hasGenerateArgs) {
    throw new Error("Expected either '--task-id' or '--account-id' with '--from' and '--to'");
  }

  if (isGetMode) {
    return {
      getDivForeignIssuerReport: {
        taskId: ArgGuards.requireStringArg(argv, 'task-id'),
        page: parsePage(argv)
      },
      generateDivForeignIssuerReport: undefined
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
    generateDivForeignIssuerReport: {
      accountId: ArgGuards.requireStringArg(argv, 'account-id'),
      from,
      to
    },
    getDivForeignIssuerReport: undefined
  };
}

export function parseDividendsForeignIssuerFormat(
  argv: CliArgs
): DividendsForeignIssuerFormat {
  return ArgGuards.optionalEnumArgValue(
    argv,
    'format',
    dividendsForeignIssuerFormats
  ) ?? 'table';
}

export function createDividendsForeignIssuerCommand(
  createSdk: DividendsForeignIssuerSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function dividendsForeignIssuer(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, dividendsForeignIssuerArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'operations get-dividends-foreign-issuer');

    const request = parseDividendsForeignIssuerRequest(argv);
    const format = parseDividendsForeignIssuerFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getDividendsForeignIssuer(request);

      return formatDividendsForeignIssuer(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const dividendsForeignIssuer = createDividendsForeignIssuerCommand();

export { formatDividendsForeignIssuer };
