import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  accruedInterestsFormats,
  formatAccruedInterests,
  type AccruedInterestsFormat
} from './reporter';

type AccruedInterestsSdk = {
  instruments: {
    getAccruedInterests(request: GetAccruedInterestsRequest): Promise<GetAccruedInterestsResponse>;
  };
  close(): void;
};

type AccruedInterestsSdkFactory = (options: TinkoffInvestOptions) => AccruedInterestsSdk;

const accruedInterestsRequestOptionsSchema = {
  figi: {
    type: 'string',
    required: true
  },
  from: {
    type: 'string',
    required: true
  },
  to: {
    type: 'string',
    required: true
  }
} as const;

const accruedInterestsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: accruedInterestsFormats,
    default: 'table'
  }
} as const;

const accruedInterestsOptionsSchema = withSdkOptions(
  accruedInterestsRequestOptionsSchema,
  accruedInterestsFormatOptionsSchema
);

function parseAccruedInterestsOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    'instruments get-accrued-interests',
    accruedInterestsOptionsSchema
  );
}

export function parseAccruedInterestsRequest(argv: CliArgs): GetAccruedInterestsRequest {
  return createAccruedInterestsRequest(parseAccruedInterestsOptions(argv));
}

export function parseAccruedInterestsFormat(argv: CliArgs): AccruedInterestsFormat {
  return parseCommandOptions(
    argv,
    'instruments get-accrued-interests',
    accruedInterestsFormatOptionsSchema
  ).format;
}

export function createAccruedInterestsCommand(
  createSdk: AccruedInterestsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function accruedInterests(argv: CliArgs): Promise<string> {
    const options = parseAccruedInterestsOptions(argv);
    const request = createAccruedInterestsRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getAccruedInterests(request);

      return formatAccruedInterests(response.accruedInterests, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const accruedInterests = createAccruedInterestsCommand();

export { formatAccruedInterests };

function createAccruedInterestsRequest(
  options: ReturnType<typeof parseAccruedInterestsOptions>
): GetAccruedInterestsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: options.figi,
    from,
    to
  };
}
