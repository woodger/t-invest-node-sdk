import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommandOptions,
  parseOptionalNonNegativeIntegerOption,
  parseRequiredDateTimeOption,
  requireStringOption,
  withSdkOptions
} from '../../command-mechanics';
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

function parseDividendsForeignIssuerOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    'operations get-dividends-foreign-issuer',
    dividendsForeignIssuerOptionsSchema
  );
}

function createDividendsForeignIssuerRequest(
  options: ReturnType<typeof parseDividendsForeignIssuerOptions>
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

export function parseDividendsForeignIssuerRequest(
  argv: CliArgs
): GetDividendsForeignIssuerRequest {
  return createDividendsForeignIssuerRequest(parseDividendsForeignIssuerOptions(argv));
}

export function parseDividendsForeignIssuerFormat(
  argv: CliArgs
): DividendsForeignIssuerFormat {
  return parseCommandOptions(
    argv,
    'operations get-dividends-foreign-issuer',
    dividendsForeignIssuerFormatOptionsSchema
  ).format;
}

export function createDividendsForeignIssuerCommand(
  createSdk: DividendsForeignIssuerSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function dividendsForeignIssuer(argv: CliArgs): Promise<string> {
    const options = parseDividendsForeignIssuerOptions(argv);
    const request = createDividendsForeignIssuerRequest(options);
    const { format } = options;
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
