/**
 * Модуль CLI-команды `stop-order place`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { PriceType } from '../../../generated/common';
import {
  ExchangeOrderType,
  StopOrderDirection,
  StopOrderExpirationType,
  StopOrderType,
  TakeProfitType,
  type PostStopOrderRequest,
  type PostStopOrderResponse
} from '../../../generated/stoporders';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  parseOptionalPositiveQuotationOption,
  parsePositiveQuotationOption,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  formatPostStopOrder,
  postStopOrderFormats,
  type PostStopOrderFormat
} from './reporter';

type PostStopOrderSdk = {
  stoporders: {
    postStopOrder(request: PostStopOrderRequest): Promise<PostStopOrderResponse>;
  };
  close(): void;
};

type PostStopOrderSdkFactory = (options: TinkoffInvestOptions) => PostStopOrderSdk;

const postStopOrderCommandPath = ['stop-order', 'place'] as const;
const defaultPostStopOrderSdkFactory: PostStopOrderSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const stopOrderDirections = {
  buy: StopOrderDirection.STOP_ORDER_DIRECTION_BUY,
  sell: StopOrderDirection.STOP_ORDER_DIRECTION_SELL
} as const;

type StopOrderDirectionName = keyof typeof stopOrderDirections;

const stopOrderDirectionNames = Object.keys(stopOrderDirections) as StopOrderDirectionName[];

const stopOrderExpirationTypes = {
  'good-till-cancel': StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL,
  'good-till-date': StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE
} as const;

type StopOrderExpirationTypeName = keyof typeof stopOrderExpirationTypes;

const stopOrderExpirationTypeNames = Object.keys(
  stopOrderExpirationTypes
) as StopOrderExpirationTypeName[];

const stopOrderTypes = {
  'take-profit': StopOrderType.STOP_ORDER_TYPE_TAKE_PROFIT,
  'stop-loss': StopOrderType.STOP_ORDER_TYPE_STOP_LOSS,
  'stop-limit': StopOrderType.STOP_ORDER_TYPE_STOP_LIMIT
} as const;

type StopOrderTypeName = keyof typeof stopOrderTypes;

const stopOrderTypeNames = Object.keys(stopOrderTypes) as StopOrderTypeName[];

const postStopOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'instrument-id': {
    type: 'string',
    required: true
  },
  quantity: {
    type: 'number',
    integer: true,
    min: 1,
    required: true
  },
  price: {
    type: 'string'
  },
  'stop-price': {
    type: 'string',
    required: true
  },
  direction: {
    type: 'string',
    choices: stopOrderDirectionNames,
    required: true
  },
  'expiration-type': {
    type: 'string',
    choices: stopOrderExpirationTypeNames,
    required: true
  },
  'stop-order-type': {
    type: 'string',
    choices: stopOrderTypeNames,
    required: true
  },
  'expire-date': {
    type: 'string'
  }
} as const;

const postStopOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: postStopOrderFormats,
    default: 'table'
  }
} as const;

const postStopOrderOptionsSchema = withSdkOptions(
  postStopOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  postStopOrderFormatOptionsSchema
);

type PostStopOrderOptions = InferOptions<typeof postStopOrderOptionsSchema>;
type PostStopOrderRequestOptions = CommandRequestOptions<
  PostStopOrderOptions,
  'account-id' |
  'instrument-id' |
  'quantity' |
  'price' |
  'stop-price' |
  'direction' |
  'expiration-type' |
  'stop-order-type' |
  'expire-date'
>;

export function parsePostStopOrderFormat(rawOptions: CommandRawOptions): PostStopOrderFormat {
  return parseCommandOptions(rawOptions, postStopOrderFormatOptionsSchema).format;
}

export function createPostStopOrderCommand(
  createSdk: PostStopOrderSdkFactory = defaultPostStopOrderSdkFactory
) {
  return command.define({
    path: postStopOrderCommandPath,
    options: postStopOrderOptionsSchema,
    handle({ options }) {
      return runPostStopOrderCommand(options, createSdk);
    }
  });
}

export const postStopOrderCommand = createPostStopOrderCommand();

async function runPostStopOrderCommand(
  options: PostStopOrderOptions,
  createSdk: PostStopOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createPostStopOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.stoporders.postStopOrder(request);

    return formatPostStopOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPostStopOrder };

export function createPostStopOrderRequest(
  options: PostStopOrderRequestOptions
): PostStopOrderRequest {
  const expirationType = stopOrderExpirationTypes[options['expiration-type']];

  return {
    figi: '',
    quantity: options.quantity,
    price: parseOptionalPositiveQuotationOption(options.price, 'price'),
    stopPrice: parsePositiveQuotationOption(options['stop-price'], 'stop-price'),
    direction: stopOrderDirections[options.direction],
    accountId: options['account-id'],
    expirationType,
    stopOrderType: stopOrderTypes[options['stop-order-type']],
    expireDate: createStopOrderExpireDate(expirationType, options['expire-date']),
    instrumentId: options['instrument-id'],
    exchangeOrderType: ExchangeOrderType.EXCHANGE_ORDER_TYPE_UNSPECIFIED,
    takeProfitType: TakeProfitType.TAKE_PROFIT_TYPE_UNSPECIFIED,
    trailingData: undefined,
    priceType: PriceType.PRICE_TYPE_UNSPECIFIED,
    orderId: '',
    confirmMarginTrade: false
  };
}

function createStopOrderExpireDate(
  expirationType: StopOrderExpirationType,
  rawExpireDate: string | undefined
): Date | undefined {
  if (expirationType === StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE) {
    if (rawExpireDate === undefined) {
      throw new CliUsageError("Expected '--expire-date' when '--expiration-type=good-till-date'");
    }

    return parseDateTimeOption(rawExpireDate, 'expire-date');
  }

  if (rawExpireDate !== undefined) {
    throw new CliUsageError("Expected '--expire-date' only with '--expiration-type=good-till-date'");
  }

  return undefined;
}
