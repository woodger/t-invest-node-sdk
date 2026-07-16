import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type {
  InstrumentsServiceClient,
  InstrumentsServiceDefinition
} from '../../generated/instruments';
import type {
  MarketDataServiceClient,
  MarketDataServiceDefinition,
  MarketDataStreamServiceClient,
  MarketDataStreamServiceDefinition
} from '../../generated/marketdata';
import type {
  OperationsServiceClient,
  OperationsServiceDefinition,
  OperationsStreamServiceClient,
  OperationsStreamServiceDefinition
} from '../../generated/operations';
import type {
  OrdersServiceClient,
  OrdersServiceDefinition,
  OrdersStreamServiceClient,
  OrdersStreamServiceDefinition
} from '../../generated/orders';
import type {
  SandboxServiceClient,
  SandboxServiceDefinition
} from '../../generated/sandbox';
import type {
  StopOrdersServiceClient,
  StopOrdersServiceDefinition
} from '../../generated/stoporders';
import type {
  UsersServiceClient,
  UsersServiceDefinition
} from '../../generated/users';
import type {
  InstrumentsService,
  MarketDataService,
  MarketDataStreamService,
  OperationsService,
  OperationsStreamService,
  OrdersService,
  OrdersStreamService,
  SandboxService,
  StopOrdersService,
  UsersService
} from './tinkoff-invest-services';

type SameKeys<Left, Right> =
  [keyof Left] extends [keyof Right]
    ? [keyof Right] extends [keyof Left]
      ? true
      : false
    : false;

type SameType<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? (<Value>() => Value extends Right ? 1 : 2) extends
      (<Value>() => Value extends Left ? 1 : 2)
      ? true
      : false
    : false;

type ServiceContractMatches<
  PublicService,
  GeneratedClient,
  GeneratedDefinition extends { readonly methods: object }
> = SameType<PublicService, GeneratedClient> extends true
  ? SameKeys<PublicService, GeneratedDefinition['methods']>
  : false;

const serviceMethodContracts = {
  InstrumentsService: true satisfies ServiceContractMatches<
    InstrumentsService,
    InstrumentsServiceClient,
    InstrumentsServiceDefinition
  >,
  MarketDataService: true satisfies ServiceContractMatches<
    MarketDataService,
    MarketDataServiceClient,
    MarketDataServiceDefinition
  >,
  MarketDataStreamService: true satisfies ServiceContractMatches<
    MarketDataStreamService,
    MarketDataStreamServiceClient,
    MarketDataStreamServiceDefinition
  >,
  OperationsService: true satisfies ServiceContractMatches<
    OperationsService,
    OperationsServiceClient,
    OperationsServiceDefinition
  >,
  OperationsStreamService: true satisfies ServiceContractMatches<
    OperationsStreamService,
    OperationsStreamServiceClient,
    OperationsStreamServiceDefinition
  >,
  OrdersService: true satisfies ServiceContractMatches<
    OrdersService,
    OrdersServiceClient,
    OrdersServiceDefinition
  >,
  OrdersStreamService: true satisfies ServiceContractMatches<
    OrdersStreamService,
    OrdersStreamServiceClient,
    OrdersStreamServiceDefinition
  >,
  SandboxService: true satisfies ServiceContractMatches<
    SandboxService,
    SandboxServiceClient,
    SandboxServiceDefinition
  >,
  StopOrdersService: true satisfies ServiceContractMatches<
    StopOrdersService,
    StopOrdersServiceClient,
    StopOrdersServiceDefinition
  >,
  UsersService: true satisfies ServiceContractMatches<
    UsersService,
    UsersServiceClient,
    UsersServiceDefinition
  >
} as const;

describe('public service contracts', () => {
  test('match generated client signatures and definition method keys', () => {
    assert.equal(Object.keys(serviceMethodContracts).length, 10);
    assert.equal(Object.values(serviceMethodContracts).every(Boolean), true);
  });
});
