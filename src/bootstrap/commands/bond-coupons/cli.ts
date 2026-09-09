/**
 * Модуль CLI-команды `instrument bond coupons`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetBondCouponsRequest,
  type GetBondCouponsResponse
} from '../../../generated/instruments';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseDateTimeOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import { bondCouponsFormats, formatBondCoupons } from './reporter';

type BondCouponsSdk = {
  instruments: {
    getBondCoupons(request: GetBondCouponsRequest): Promise<GetBondCouponsResponse>;
  };
  close(): void;
};

type BondCouponsSdkFactory = (options: TInvestOptions) => BondCouponsSdk;

const bondCouponsCommandPath = ['instrument', 'bond', 'coupons'] as const;
const defaultBondCouponsSdkFactory: BondCouponsSdkFactory = (options) => new TInvestNodeSDK(options);

const bondCouponsRequestOptionsSchema = {
  ...instrumentIdWithDeprecatedFigiOptionsSchema,
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

type BondCouponsOptions = InferOptions<typeof bondCouponsOptionsSchema>;
type BondCouponsRequestOptions = CommandRequestOptions<
  BondCouponsOptions,
  'from' | 'to' | 'instrument-id' | 'figi'
>;

export function createBondCouponsCommand(
  createSdk: BondCouponsSdkFactory = defaultBondCouponsSdkFactory
) {
  return command.define({
    path: bondCouponsCommandPath,
    options: bondCouponsOptionsSchema,
    handle({ options }) {
      return runBondCouponsCommand(options, createSdk);
    }
  });
}

export const bondCouponsCommand = createBondCouponsCommand();

async function runBondCouponsCommand(
  options: BondCouponsOptions,
  createSdk: BondCouponsSdkFactory
): Promise<string> {
  const request = createBondCouponsRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.getBondCoupons(request);

    return formatBondCoupons(response.events, format);
  });
}

export function createBondCouponsRequest(
  options: BondCouponsRequestOptions
): GetBondCouponsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError("Expected '--from' to be earlier than or equal to '--to'");
  }

  const instrumentId = resolveInstrumentIdOption(options);

  return GetBondCouponsRequest.create({
    instrumentId,
    from,
    to
  });
}
