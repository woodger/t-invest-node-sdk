import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderStateRequest,
  OrderState
} from '../../../generated/orders';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrderState, orderStateFormats, type OrderStateFormat } from './reporter';

type OrderStateSdk = {
  orders: {
    getOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type OrderStateSdkFactory = (options: TinkoffInvestOptions) => OrderStateSdk;

const orderStateArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'order-id',
  'format'
]);

export function parseOrderStateRequest(argv: CliArgs): GetOrderStateRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id'),
    orderId: ArgGuards.requireStringArg(argv, 'order-id')
  };
}

export function parseOrderStateFormat(argv: CliArgs): OrderStateFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', orderStateFormats) ?? 'table';
}

export function createOrderStateCommand(
  createSdk: OrderStateSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function orderState(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, orderStateArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'orders get-order-state');

    const request = parseOrderStateRequest(argv);
    const format = parseOrderStateFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.orders.getOrderState(request);

      return formatOrderState(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const orderState = createOrderStateCommand();

export { formatOrderState };
