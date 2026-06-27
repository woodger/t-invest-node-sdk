import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetBondCouponsRequest,
  GetBondCouponsResponse
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
import { bondCouponsFormats, formatBondCoupons, type BondCouponsFormat } from './reporter';

type BondCouponsSdk = {
  instruments: {
    getBondCoupons(request: GetBondCouponsRequest): Promise<GetBondCouponsResponse>;
  };
  close(): void;
};

type BondCouponsSdkFactory = (options: TinkoffInvestOptions) => BondCouponsSdk;

const bondCouponsCommandName = 'instruments get-bond-coupons';
const bondCouponsCommandPath = ['instruments', 'get-bond-coupons'] as const;
const defaultBondCouponsSdkFactory: BondCouponsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const bondCouponsRequestOptionsSchema = {
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

const bondCouponsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: bondCouponsFormats,
    default: 'table'
  }
} as const;

const bondCouponsOptionsSchema = withSdkOptions(
  bondCouponsRequestOptionsSchema,
  bondCouponsFormatOptionsSchema
);

function parseBondCouponsOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(
    rawOptions,
    bondCouponsCommandName,
    bondCouponsOptionsSchema
  );
}

export function parseBondCouponsRequest(rawOptions: CommandRawOptions): GetBondCouponsRequest {
  return createBondCouponsRequest(parseBondCouponsOptions(rawOptions));
}

export function parseBondCouponsFormat(rawOptions: CommandRawOptions): BondCouponsFormat {
  return parseCommandOptions(
    rawOptions,
    bondCouponsCommandName,
    bondCouponsFormatOptionsSchema
  ).format;
}

export function createBondCouponsCommand(
  createSdk: BondCouponsSdkFactory = defaultBondCouponsSdkFactory
) {
  return defineCommand({
    path: bondCouponsCommandPath,
    options: bondCouponsOptionsSchema,
    handle({ options }) {
      return runBondCouponsCommand(options, createSdk);
    }
  });
}

export const bondCouponsCommand = createBondCouponsCommand();

async function runBondCouponsCommand(
  options: ReturnType<typeof parseBondCouponsOptions>,
  createSdk: BondCouponsSdkFactory
): Promise<string> {
  const request = createBondCouponsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getBondCoupons(request);

    return formatBondCoupons(response.events, format);
  }
  finally {
    sdk.close();
  }
}

export { formatBondCoupons };

function createBondCouponsRequest(
  options: ReturnType<typeof parseBondCouponsOptions>
): GetBondCouponsRequest {
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
