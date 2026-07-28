/**
 * Модуль тестов package entrypoint проверяет публичную runtime export surface.
 *
 * Тесты смотрят на observable exports корневого модуля и не зависят от
 * внутренних bootstrap или generated implementation details.
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import * as packageExports from './index';
import type {
  InstrumentsServiceImplementation,
  MarketDataServiceImplementation,
  MarketDataStreamServiceImplementation,
  OperationsServiceImplementation,
  OperationsStreamServiceImplementation,
  OrdersServiceImplementation,
  OrdersStreamServiceImplementation,
  SandboxServiceImplementation,
  SdkError,
  SdkErrorOptions,
  SdkErrorSource,
  SignalService,
  SignalServiceImplementation,
  StopOrdersServiceImplementation,
  UsersServiceImplementation
} from './index';

type RootServerSideImplementationContracts = [
  InstrumentsServiceImplementation,
  MarketDataServiceImplementation,
  MarketDataStreamServiceImplementation,
  OperationsServiceImplementation,
  OperationsStreamServiceImplementation,
  OrdersServiceImplementation,
  OrdersStreamServiceImplementation,
  SandboxServiceImplementation,
  SignalServiceImplementation,
  StopOrdersServiceImplementation,
  UsersServiceImplementation
];

type RootSdkErrorContracts = [
  SdkError,
  SdkErrorOptions,
  SdkErrorSource
];

const expectedServerSideImplementationContractCount: RootServerSideImplementationContracts['length'] = 11;
const expectedSdkErrorContractCount: RootSdkErrorContracts['length'] = 3;

const signalServiceMethodNames = [
  'getStrategies',
  'getSignals'
] as const satisfies readonly (keyof SignalService)[];

const serverSideServiceDefinitionNames = [
  'InstrumentsServiceDefinition',
  'MarketDataServiceDefinition',
  'MarketDataStreamServiceDefinition',
  'OperationsServiceDefinition',
  'OperationsStreamServiceDefinition',
  'OrdersServiceDefinition',
  'OrdersStreamServiceDefinition',
  'SandboxServiceDefinition',
  'SignalServiceDefinition',
  'StopOrdersServiceDefinition',
  'UsersServiceDefinition'
] as const;

const signalRuntimeContractNames = [
  'StrategyType',
  'strategyTypeFromJSON',
  'strategyTypeToJSON',
  'SignalDirection',
  'signalDirectionFromJSON',
  'signalDirectionToJSON',
  'SignalState',
  'signalStateFromJSON',
  'signalStateToJSON',
  'GetStrategiesRequest',
  'GetStrategiesResponse',
  'Strategy',
  'GetSignalsRequest',
  'GetSignalsResponse',
  'Signal',
  'SignalServiceDefinition'
] as const;

type GeneratedServiceDefinitionRuntimeContract = {
  methods: Record<string, {
    requestType?: unknown;
    responseType?: unknown;
  }>;
};

describe('package entrypoint', () => {
  test('exposes generated server-side service definitions', () => {
    for (const exportName of serverSideServiceDefinitionNames) {
      assert.equal(hasPackageExport(exportName), true);
    }
  });

  test('exposes request and response runtime contracts used by service definitions', () => {
    for (const exportName of serverSideServiceDefinitionNames) {
      const serviceDefinition = getPackageExport(exportName) as GeneratedServiceDefinitionRuntimeContract;

      for (const method of Object.values(serviceDefinition.methods)) {
        assertMessageRuntimeContractIsExported(method.requestType);
        assertMessageRuntimeContractIsExported(method.responseType);
      }
    }
  });

  test('exposes generated server-side service implementation types', () => {
    assert.equal(expectedServerSideImplementationContractCount, 11);
  });

  test('exposes SignalService contracts', () => {
    assert.deepEqual(signalServiceMethodNames, [
      'getStrategies',
      'getSignals'
    ]);

    for (const exportName of signalRuntimeContractNames) {
      assert.equal(hasPackageExport(exportName), true);
    }
  });

  test('does not expose generated client runtime contracts', () => {
    assert.equal(hasPackageExport('UsersServiceClient'), false);
  });

  test('keeps public SDK runtime exports', () => {
    assert.equal(hasPackageExport('TinkoffInvestNodeSDK'), true);
    assert.equal(hasPackageExport('CandleInterval'), true);
    assert.equal(hasPackageExport('OrderType'), true);
    assert.equal(hasPackageExport('defaultConfig'), true);
    assert.equal(hasPackageExport('defineUnaryLimits'), true);
    assert.equal(hasPackageExport('SdkError'), true);
    assert.equal(hasPackageExport('SdkErrorCode'), true);
    assert.equal(hasPackageExport('isSdkError'), true);
    assert.equal(expectedSdkErrorContractCount, 3);
  });
});

function hasPackageExport(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(packageExports, name);
}

function getPackageExport(name: string): unknown {
  return packageExports[name as keyof typeof packageExports];
}

function assertMessageRuntimeContractIsExported(message: unknown): void {
  assert.ok(message);
  assert.equal((Object.values(packageExports) as readonly unknown[]).includes(message), true);
}
