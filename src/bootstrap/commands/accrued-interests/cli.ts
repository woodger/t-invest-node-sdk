import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const accruedInterestsArgNames = new Set([
  ...sdkOptionArgNames,
  'figi',
  'from',
  'to',
  'format'
]);

export function parseAccruedInterestsRequest(argv: CliArgs): GetAccruedInterestsRequest {
  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: ArgGuards.requireStringArg(argv, 'figi'),
    from,
    to
  };
}

export function parseAccruedInterestsFormat(argv: CliArgs): AccruedInterestsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', accruedInterestsFormats) ?? 'table';
}

export function createAccruedInterestsCommand(
  createSdk: AccruedInterestsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function accruedInterests(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, accruedInterestsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-accrued-interests');

    const request = parseAccruedInterestsRequest(argv);
    const format = parseAccruedInterestsFormat(argv);
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
