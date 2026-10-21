/**
 * Модуль CLI-команды `instrument dividends`.
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
  GetDividendsRequest,
  type GetDividendsResponse
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
import { dividendsFormats, formatDividends } from './reporter';

type DividendsSdk = {
  instruments: {
    getDividends(request: GetDividendsRequest): Promise<GetDividendsResponse>;
  };
  close(): void;
};

type DividendsSdkFactory = (options: TInvestOptions) => DividendsSdk;

const dividendsOptionsSchema = withSdkOptions({
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
    choices: dividendsFormats,
    default: 'table'
  }
});

type DividendsOptions = InferOptions<typeof dividendsOptionsSchema>;
type DividendsRequestOptions = CommandRequestOptions<
  DividendsOptions,
  'from' | 'to' | 'instrument-id' | 'figi'
>;

export function createDividendsCommand(
  createSdk: DividendsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'dividends'] as const,
    options: dividendsOptionsSchema,
    async handle({ options }) {
      const request = createDividendsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getDividends(request);

        return formatDividends(response.dividends, format);
      });
    }
  });
}

export const dividendsCommand = createDividendsCommand();

export function createDividendsRequest(
  options: DividendsRequestOptions
): GetDividendsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
  }

  const instrumentId = resolveInstrumentIdOption(options);

  return GetDividendsRequest.create({
    instrumentId,
    from,
    to
  });
}
