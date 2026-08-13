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
  GetTechAnalysisRequest,
  InstrumentsServiceImplementation,
  MarketDataServiceImplementation,
  MarketDataStreamServiceImplementation,
  OperationsServiceImplementation,
  OperationsStreamServiceImplementation,
  OrdersServiceImplementation,
  OrdersStreamServiceImplementation,
  PostOrderRequest,
  SandboxServiceImplementation,
  SdkError,
  SdkErrorOptions,
  SdkErrorSource,
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
  'Signal'
] as const;

const generatedEnumRuntimeContractNames = [
  ['Recommendation', 'recommendation'],
  ['BondType', 'bondType'],
  ['InstrumentExchangeType', 'instrumentExchangeType'],
  ['GetBondEventsRequest_EventType', 'getBondEventsRequest_EventType'],
  ['StructuredNote_LogicPortfolio', 'structuredNote_LogicPortfolio'],
  ['StructuredNote_ObservationPrinciple', 'structuredNote_ObservationPrinciple'],
  ['StructuredNote_YieldType', 'structuredNote_YieldType'],
  ['GetAssetReportsResponse_AssetReportPeriodType', 'getAssetReportsResponse_AssetReportPeriodType'],
  ['GetInsiderDealsResponse_TradeDirection', 'getInsiderDealsResponse_TradeDirection'],
  ['TradeSourceType', 'tradeSourceType'],
  ['CandleSource', 'candleSource'],
  ['MarketValueType', 'marketValueType'],
  ['OrderBookType', 'orderBookType'],
  ['LastPriceType', 'lastPriceType'],
  ['GetCandlesRequest_CandleSource', 'getCandlesRequest_CandleSource'],
  ['GetTechAnalysisRequest_IndicatorInterval', 'getTechAnalysisRequest_IndicatorInterval'],
  ['GetTechAnalysisRequest_TypeOfPrice', 'getTechAnalysisRequest_TypeOfPrice'],
  ['GetTechAnalysisRequest_IndicatorType', 'getTechAnalysisRequest_IndicatorType'],
  ['OperationsAccountSubscriptionStatus', 'operationsAccountSubscriptionStatus'],
  ['TimeInForceType', 'timeInForceType'],
  ['OrderIdType', 'orderIdType'],
  ['OrderStateStreamResponse_MarkerType', 'orderStateStreamResponse_MarkerType'],
  ['OrderStateStreamResponse_StatusCauseInfo', 'orderStateStreamResponse_StatusCauseInfo'],
  ['StopOrderStatusOption', 'stopOrderStatusOption'],
  ['ExchangeOrderType', 'exchangeOrderType'],
  ['TakeProfitType', 'takeProfitType'],
  ['TrailingValueType', 'trailingValueType'],
  ['TrailingStopStatus', 'trailingStopStatus'],
  ['AccountValue', 'accountValue']
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
    for (const exportName of signalRuntimeContractNames) {
      assert.equal(hasPackageExport(exportName), true);
    }
  });

  test('exposes generated enum contracts used by public DTOs', () => {
    for (const [enumName, converterName] of generatedEnumRuntimeContractNames) {
      assert.equal(hasPackageExport(enumName), true);
      assert.equal(typeof getPackageExport(`${converterName}FromJSON`), 'function');
      assert.equal(typeof getPackageExport(`${converterName}ToJSON`), 'function');
    }

    const timeInForce: PostOrderRequest['timeInForce'] = packageExports.timeInForceTypeFromJSON('TIME_IN_FORCE_DAY');
    const indicatorType: GetTechAnalysisRequest['indicatorType'] =
      packageExports.getTechAnalysisRequest_IndicatorTypeFromJSON('INDICATOR_TYPE_SMA');
    const interval: GetTechAnalysisRequest['interval'] =
      packageExports.getTechAnalysisRequest_IndicatorIntervalFromJSON('INDICATOR_INTERVAL_ONE_DAY');
    const typeOfPrice: GetTechAnalysisRequest['typeOfPrice'] =
      packageExports.getTechAnalysisRequest_TypeOfPriceFromJSON('TYPE_OF_PRICE_CLOSE');

    assert.equal(packageExports.timeInForceTypeToJSON(timeInForce), 'TIME_IN_FORCE_DAY');
    assert.equal(packageExports.getTechAnalysisRequest_IndicatorTypeToJSON(indicatorType), 'INDICATOR_TYPE_SMA');
    assert.equal(packageExports.getTechAnalysisRequest_IndicatorIntervalToJSON(interval), 'INDICATOR_INTERVAL_ONE_DAY');
    assert.equal(packageExports.getTechAnalysisRequest_TypeOfPriceToJSON(typeOfPrice), 'TYPE_OF_PRICE_CLOSE');
  });

  test('does not expose generated client runtime contracts', () => {
    assert.equal(hasPackageExport('UsersServiceClient'), false);
  });

  test('exposes rebranded public SDK runtime exports', () => {
    assert.equal(hasPackageExport('TInvestNodeSDK'), true);
    assert.equal(hasPackageExport('TinkoffInvestNodeSDK'), false);
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
  return Object.hasOwn(packageExports, name);
}

function getPackageExport(name: string): unknown {
  return packageExports[name as keyof typeof packageExports];
}

function assertMessageRuntimeContractIsExported(message: unknown): void {
  assert.ok(message);
  assert.equal((Object.values(packageExports) as readonly unknown[]).includes(message), true);
}
