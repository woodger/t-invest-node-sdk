/**
 * Модуль CLI-команды `instrument bond accrued`.
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
  GetAccruedInterestsRequest,
  type GetAccruedInterestsResponse
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
import { accruedInterestsFormats, formatAccruedInterests } from './reporter';

type AccruedInterestsSdk = {
  instruments: {
    getAccruedInterests(
      request: GetAccruedInterestsRequest
    ): Promise<GetAccruedInterestsResponse>;
  };
  close(): void;
};

type AccruedInterestsSdkFactory = (
  options: TInvestOptions
) => AccruedInterestsSdk;

type AccruedInterestsOptions = InferOptions<
  typeof accruedInterestsOptionsSchema
>;
type AccruedInterestsRequestOptions = CommandRequestOptions<
  AccruedInterestsOptions,
  'from' | 'to' | 'instrument-id' | 'figi'
>;

const accruedInterestsOptionsSchema = withSdkOptions({
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
    choices: accruedInterestsFormats,
    default: 'table'
  }
});

export function createAccruedInterestsCommand(
  createSdk: AccruedInterestsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'bond', 'accrued'] as const,
    options: accruedInterestsOptionsSchema,
    async handle({ options }) {
      const request = createAccruedInterestsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getAccruedInterests(request);

        return formatAccruedInterests(response.accruedInterests, format);
      });
    }
  });
}

export const accruedInterestsCommand = createAccruedInterestsCommand();

export function createAccruedInterestsRequest(
  options: AccruedInterestsRequestOptions
): GetAccruedInterestsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
  }

  const instrumentId = resolveInstrumentIdOption(options);

  return GetAccruedInterestsRequest.create({
    instrumentId,
    from,
    to
  });
}
