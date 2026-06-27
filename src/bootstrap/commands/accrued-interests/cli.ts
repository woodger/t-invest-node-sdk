import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
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

const accruedInterestsCommandName = 'instruments get-accrued-interests';
const accruedInterestsCommandPath = ['instruments', 'get-accrued-interests'] as const;
const defaultAccruedInterestsSdkFactory: AccruedInterestsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

function parseAccruedInterestsOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(
    rawOptions,
    accruedInterestsCommandName,
    accruedInterestsOptionsSchema
  );
}

export function parseAccruedInterestsRequest(rawOptions: CommandRawOptions): GetAccruedInterestsRequest {
  return createAccruedInterestsRequest(parseAccruedInterestsOptions(rawOptions));
}

export function parseAccruedInterestsFormat(rawOptions: CommandRawOptions): AccruedInterestsFormat {
  return parseCommandOptions(
    rawOptions,
    accruedInterestsCommandName,
    accruedInterestsFormatOptionsSchema
  ).format;
}

export function createAccruedInterestsCommand(
  createSdk: AccruedInterestsSdkFactory = defaultAccruedInterestsSdkFactory
) {
  return defineCommand({
    path: accruedInterestsCommandPath,
    options: accruedInterestsOptionsSchema,
    handle({ options }) {
      return runAccruedInterestsCommand(options, createSdk);
    }
  });
}

export const accruedInterestsCommand = createAccruedInterestsCommand();

async function runAccruedInterestsCommand(
  options: ReturnType<typeof parseAccruedInterestsOptions>,
  createSdk: AccruedInterestsSdkFactory
): Promise<string> {
  const request = createAccruedInterestsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getAccruedInterests(request);

    return formatAccruedInterests(response.accruedInterests, format);
  }
  finally {
    sdk.close();
  }
}

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
