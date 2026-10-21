/**
 * Модуль CLI-команды `instrument bond coupons`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
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
import {
  parseDateTimeOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import { bondCouponsFormats, formatBondCoupons } from './reporter';

type BondCouponsSdk = {
  instruments: {
    getBondCoupons(
      request: GetBondCouponsRequest
    ): Promise<GetBondCouponsResponse>;
  };
  close(): void;
};

type BondCouponsSdkFactory = (options: TInvestOptions) => BondCouponsSdk;

const bondCouponsOptionsSchema = withSdkOptions({
  ...instrumentIdWithDeprecatedFigiOptionsSchema,
  from: {
    type: 'string',
    required: true
  },
  to: {
    type: 'string',
    required: true
  },
  format: {
    type: 'string',
    choices: bondCouponsFormats,
    default: 'table'
  }
});

type BondCouponsOptions = InferOptions<typeof bondCouponsOptionsSchema>;
type BondCouponsRequestOptions = CommandRequestOptions<
  BondCouponsOptions,
  'from' | 'to' | 'instrument-id' | 'figi'
>;

export function createBondCouponsCommand(
  createSdk: BondCouponsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'bond', 'coupons'] as const,
    options: bondCouponsOptionsSchema,
    async handle({ options }) {
      const request = createBondCouponsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getBondCoupons(request);

        return formatBondCoupons(response.events, format);
      });
    }
  });
}

export const bondCouponsCommand = createBondCouponsCommand();

export function createBondCouponsRequest(
  options: BondCouponsRequestOptions
): GetBondCouponsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
  }

  const instrumentId = resolveInstrumentIdOption(options);

  return GetBondCouponsRequest.create({
    instrumentId,
    from,
    to
  });
}
