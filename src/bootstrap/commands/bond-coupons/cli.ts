/**
 * Модуль CLI-команды `instruments get-bond-coupons`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetBondCouponsRequest,
  GetBondCouponsResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../instrument-id-options';
import { bondCouponsFormats, formatBondCoupons, type BondCouponsFormat } from './reporter';

type BondCouponsSdk = {
  instruments: {
    getBondCoupons(request: GetBondCouponsRequest): Promise<GetBondCouponsResponse>;
  };
  close(): void;
};

type BondCouponsSdkFactory = (options: TinkoffInvestOptions) => BondCouponsSdk;

const bondCouponsCommandPath = ['instruments', 'get-bond-coupons'] as const;
const defaultBondCouponsSdkFactory: BondCouponsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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



export function parseBondCouponsFormat(rawOptions: CommandRawOptions): BondCouponsFormat {
  return parseCommandOptions(rawOptions, bondCouponsFormatOptionsSchema).format;
}

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

export function createBondCouponsRequest(
  options: BondCouponsRequestOptions
): GetBondCouponsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: resolveInstrumentIdOption(options),
    from,
    to
  };
}
