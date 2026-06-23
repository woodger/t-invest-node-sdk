import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetBondCouponsRequest,
  GetBondCouponsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { bondCouponsFormats, formatBondCoupons, type BondCouponsFormat } from './reporter';

type BondCouponsSdk = {
  instruments: {
    getBondCoupons(request: GetBondCouponsRequest): Promise<GetBondCouponsResponse>;
  };
  close(): void;
};

type BondCouponsSdkFactory = (options: TinkoffInvestOptions) => BondCouponsSdk;

const bondCouponsArgNames = new Set([
  ...sdkOptionArgNames,
  'figi',
  'from',
  'to',
  'format'
]);

export function parseBondCouponsRequest(argv: CliArgs): GetBondCouponsRequest {
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

export function parseBondCouponsFormat(argv: CliArgs): BondCouponsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', bondCouponsFormats) ?? 'table';
}

export function createBondCouponsCommand(
  createSdk: BondCouponsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function bondCoupons(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, bondCouponsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-bond-coupons');

    const request = parseBondCouponsRequest(argv);
    const format = parseBondCouponsFormat(argv);
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
