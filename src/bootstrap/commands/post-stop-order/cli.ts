/**
 * Модуль CLI-команды `stop-order place`.
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
import { PriceType } from '../../../generated/common';
import {
  ExchangeOrderType,
  StopOrderDirection,
  StopOrderExpirationType,
  StopOrderType,
  TakeProfitType,
  PostStopOrderRequest,
  type PostStopOrderResponse
} from '../../../generated/stoporders';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import {
  parseDateTimeOption,
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  parseOptionalPositiveQuotationOption,
  parsePositiveQuotationOption,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { formatPostStopOrder, postStopOrderFormats } from './reporter';

type PostStopOrderSdk = {
  stopOrders: {
    postStopOrder(
      request: PostStopOrderRequest
    ): Promise<PostStopOrderResponse>;
  };
  close(): void;
};

type PostStopOrderSdkFactory = (options: TInvestOptions) => PostStopOrderSdk;

type StopOrderDirectionName = keyof typeof stopOrderDirections;

type StopOrderExpirationTypeName = keyof typeof stopOrderExpirationTypes;

type StopOrderTypeName = keyof typeof stopOrderTypes;

type PostStopOrderOptions = InferOptions<typeof postStopOrderOptionsSchema>;
type PostStopOrderRequestOptions = CommandRequestOptions<
  PostStopOrderOptions,
  | 'account-id'
  | 'instrument-id'
  | 'quantity'
  | 'price'
  | 'stop-price'
  | 'direction'
  | 'expiration-type'
  | 'stop-order-type'
  | 'expire-date'
>;

const stopOrderDirections = {
  buy: StopOrderDirection.STOP_ORDER_DIRECTION_BUY,
  sell: StopOrderDirection.STOP_ORDER_DIRECTION_SELL
} as const;

const stopOrderDirectionNames = Object.keys(
  stopOrderDirections
) as StopOrderDirectionName[];

const stopOrderExpirationTypes = {
  'good-till-cancel':
    StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL,
  'good-till-date':
    StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE
} as const;

const stopOrderExpirationTypeNames = Object.keys(
  stopOrderExpirationTypes
) as StopOrderExpirationTypeName[];

const stopOrderTypes = {
  'take-profit': StopOrderType.STOP_ORDER_TYPE_TAKE_PROFIT,
  'stop-loss': StopOrderType.STOP_ORDER_TYPE_STOP_LOSS,
  'stop-limit': StopOrderType.STOP_ORDER_TYPE_STOP_LIMIT
} as const;

const stopOrderTypeNames = Object.keys(stopOrderTypes) as StopOrderTypeName[];

const postStopOrderOptionsSchema = withSdkOptions({
  'account-id': {
    type: 'string',
    required: true
  },
  'instrument-id': {
    type: 'string',
    required: true
  },
  quantity: {
    ...positiveSafeIntegerOption,
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
  },
  ...sideEffectConfirmationOptionsSchema,
  format: {
    type: 'string',
    choices: postStopOrderFormats,
    default: 'table'
  }
});

export function createPostStopOrderCommand(
  createSdk: PostStopOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['stop-order', 'place'] as const,
    options: postStopOrderOptionsSchema,
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createPostStopOrderRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.stopOrders.postStopOrder(request);

        return formatPostStopOrder(response, format);
      });
    }
  });
}

export const postStopOrderCommand = createPostStopOrderCommand();

export function createPostStopOrderRequest(
  options: PostStopOrderRequestOptions
): PostStopOrderRequest {
  const expirationType = stopOrderExpirationTypes[options['expiration-type']];

  return PostStopOrderRequest.create({
    quantity: options.quantity,
    price: parseOptionalPositiveQuotationOption(options.price, 'price'),
    stopPrice: parsePositiveQuotationOption(
      options['stop-price'],
      'stop-price'
    ),
    direction: stopOrderDirections[options.direction],
    accountId: options['account-id'],
    expirationType,
    stopOrderType: stopOrderTypes[options['stop-order-type']],
    expireDate: createStopOrderExpireDate(
      expirationType,
      options['expire-date']
    ),
    instrumentId: options['instrument-id'],
    exchangeOrderType: ExchangeOrderType.EXCHANGE_ORDER_TYPE_UNSPECIFIED,
    takeProfitType: TakeProfitType.TAKE_PROFIT_TYPE_UNSPECIFIED,
    trailingData: undefined,
    priceType: PriceType.PRICE_TYPE_UNSPECIFIED,
    orderId: '',
    confirmMarginTrade: false
  });
}

function createStopOrderExpireDate(
  expirationType: StopOrderExpirationType,
  rawExpireDate: string | undefined
): Date | undefined {
  if (
    expirationType
      === StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE
  ) {
    if (rawExpireDate === undefined) {
      throw new CliUsageError(
        "Expected '--expire-date' when '--expiration-type=good-till-date'"
      );
    }

    return parseDateTimeOption(rawExpireDate, 'expire-date');
  }

  if (rawExpireDate !== undefined) {
    throw new CliUsageError(
      "Expected '--expire-date' only with '--expiration-type=good-till-date'"
    );
  }

  return undefined;
}
