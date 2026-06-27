import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetBondCouponsRequest,
  GetBondCouponsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

function parseBondCouponsOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    'instruments get-bond-coupons',
    bondCouponsOptionsSchema
  );
}

export function parseBondCouponsRequest(argv: CliArgs): GetBondCouponsRequest {
  return createBondCouponsRequest(parseBondCouponsOptions(argv));
}

export function parseBondCouponsFormat(argv: CliArgs): BondCouponsFormat {
  return parseCommandOptions(
    argv,
    'instruments get-bond-coupons',
    bondCouponsFormatOptionsSchema
  ).format;
}

export function createBondCouponsCommand(
  createSdk: BondCouponsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function bondCoupons(argv: CliArgs): Promise<string> {
    const options = parseBondCouponsOptions(argv);
    const request = createBondCouponsRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getBondCoupons(request);

      return formatBondCoupons(response.events, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const bondCoupons = createBondCouponsCommand();

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
