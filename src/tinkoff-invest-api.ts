import { createChannel, createClient, Channel, Metadata, ChannelCredentials } from 'nice-grpc';
import { InstrumentsServiceDefinition, InstrumentsServiceClient } from './generated/instruments';
import { MarketDataServiceDefinition, MarketDataServiceClient } from './generated/marketdata';
import { OperationsServiceDefinition, OperationsServiceClient } from './generated/operations';
import { OrdersServiceDefinition, OrdersServiceClient } from './generated/orders';
import { SandboxServiceDefinition, SandboxServiceClient } from './generated/sandbox';
import { StopOrdersServiceDefinition, StopOrdersServiceClient } from './generated/stoporders';
import { UsersServiceDefinition, UsersServiceClient } from './generated/users';
import config from './config.json';

export interface TinkoffInvestApiOptions {
  /** Токен доступа */
  token: string;
  /** Имя приложения */
  appName?: string;
  /** API endpoint */
  endpoint?: string;
}

type ServiceDefinition = typeof InstrumentsServiceDefinition
  | typeof MarketDataServiceDefinition
  | typeof OperationsServiceDefinition
  | typeof OrdersServiceDefinition
  | typeof SandboxServiceDefinition
  | typeof StopOrdersServiceDefinition
  | typeof UsersServiceDefinition;

type ServiceClient = InstrumentsServiceClient
  | MarketDataServiceClient
  | OperationsServiceClient
  | OrdersServiceClient
  | SandboxServiceClient
  | StopOrdersServiceClient
  | UsersServiceClient;



export class TinkoffInvestApi {
  options: Required<TinkoffInvestApiOptions>;

  protected storage: Map<ServiceDefinition, ServiceClient> = new Map();
  protected channel: Channel;
  protected metadata: Metadata;
  
  constructor(options: TinkoffInvestApiOptions) {
    const { endpoint, appName } = config;

    this.options = {
      endpoint,
      appName,
      ...options
    };

    this.channel = this.createChannel();
    this.metadata = this.createDefaultMetadata();
  }

 /***
 * Инструменты
 * https://russianinvestments.github.io/investAPI/instruments/#findinstrument
 */

  get instruments() {
    return this.useServiceAsClient<InstrumentsServiceClient>(InstrumentsServiceDefinition);
  }
  
  get marketdata() {
    return this.useServiceAsClient<MarketDataServiceClient>(MarketDataServiceDefinition);
  }

  get operations() {
    return this.useServiceAsClient<OperationsServiceClient>(OperationsServiceDefinition);
  }
  
  get orders() {
    return this.useServiceAsClient<OrdersServiceClient>(OrdersServiceDefinition);
  }

  get sandbox() {
    return this.useServiceAsClient<SandboxServiceClient>(SandboxServiceDefinition);
  }

  get stoporders() {
    return this.useServiceAsClient<StopOrdersServiceClient>(StopOrdersServiceDefinition);
  }

  /***
  * Счета
  * https://russianinvestments.github.io/investAPI/instruments/#findinstrument
  */
  
  get users() {
    return this.useServiceAsClient<UsersServiceClient>(UsersServiceDefinition);
  }

  private useServiceAsClient<T extends ServiceClient>(service: ServiceDefinition) {
    let client = this.storage.get(service);

    if (!client) {
      client = createClient(service, this.channel, {
        '*': {
          metadata: this.metadata
        }
      });

      this.storage.set(service, client);
    }

    return client as T;
  }

  private createChannel() {
    const { endpoint } = this.options;

    const credentials = /^localhost/i.test(endpoint)
      ? ChannelCredentials.createInsecure()
      : ChannelCredentials.createSsl();
      
    return createChannel(endpoint, credentials);
  }

  private createDefaultMetadata() {
    return new Metadata({
      'Authorization': `Bearer ${this.options.token}`,
      'x-app-name': this.options.appName
    });
  }
}

/*
export \w+ 
(<|\s|\().*$
*/

export { Timestamp } from './generated/google/protobuf/timestamp';

export {
  protobufPackage,
  Edition,
  editionFromJSON,
  editionToJSON,
  FileDescriptorSet,
  FileDescriptorProto,
  DescriptorProto,
  DescriptorProto_ExtensionRange,
  DescriptorProto_ReservedRange,
  ExtensionRangeOptions,
  ExtensionRangeOptions_VerificationState,
  extensionRangeOptions_VerificationStateFromJSON,
  extensionRangeOptions_VerificationStateToJSON,
  ExtensionRangeOptions_Declaration,
  FieldDescriptorProto,
  FieldDescriptorProto_Type,
  fieldDescriptorProto_TypeFromJSON,
  fieldDescriptorProto_TypeToJSON,
  FieldDescriptorProto_Label,
  fieldDescriptorProto_LabelFromJSON,
  fieldDescriptorProto_LabelToJSON,
  OneofDescriptorProto,
  EnumDescriptorProto,
  EnumDescriptorProto_EnumReservedRange,
  EnumValueDescriptorProto,
  ServiceDescriptorProto,
  MethodDescriptorProto,
  FileOptions,
  FileOptions_OptimizeMode,
  fileOptions_OptimizeModeFromJSON,
  fileOptions_OptimizeModeToJSON,
  MessageOptions,
  FieldOptions,
  FieldOptions_CType,
  fieldOptions_CTypeFromJSON,
  fieldOptions_CTypeToJSON,
  FieldOptions_JSType,
  fieldOptions_JSTypeFromJSON,
  fieldOptions_JSTypeToJSON,
  FieldOptions_OptionRetention,
  fieldOptions_OptionRetentionFromJSON,
  fieldOptions_OptionRetentionToJSON,
  FieldOptions_OptionTargetType,
  fieldOptions_OptionTargetTypeFromJSON,
  fieldOptions_OptionTargetTypeToJSON,
  FieldOptions_EditionDefault,
  FieldOptions_FeatureSupport,
  OneofOptions,
  EnumOptions,
  EnumValueOptions,
  ServiceOptions,
  MethodOptions,
  MethodOptions_IdempotencyLevel,
  methodOptions_IdempotencyLevelFromJSON,
  methodOptions_IdempotencyLevelToJSON,
  UninterpretedOption,
  UninterpretedOption_NamePart,
  FeatureSet,
  FeatureSet_FieldPresence,
  featureSet_FieldPresenceFromJSON,
  featureSet_FieldPresenceToJSON,
  FeatureSet_EnumType,
  featureSet_EnumTypeFromJSON,
  featureSet_EnumTypeToJSON,
  FeatureSet_RepeatedFieldEncoding,
  featureSet_RepeatedFieldEncodingFromJSON,
  featureSet_RepeatedFieldEncodingToJSON,
  FeatureSet_Utf8Validation,
  featureSet_Utf8ValidationFromJSON,
  featureSet_Utf8ValidationToJSON,
  FeatureSet_MessageEncoding,
  featureSet_MessageEncodingFromJSON,
  featureSet_MessageEncodingToJSON,
  FeatureSet_JsonFormat,
  featureSet_JsonFormatFromJSON,
  featureSet_JsonFormatToJSON,
  FeatureSetDefaults,
  FeatureSetDefaults_FeatureSetEditionDefault,
  SourceCodeInfo,
  SourceCodeInfo_Location,
  GeneratedCodeInfo,
  GeneratedCodeInfo_Annotation,
  GeneratedCodeInfo_Annotation_Semantic,
  generatedCodeInfo_Annotation_SemanticFromJSON,
  generatedCodeInfo_Annotation_SemanticToJSON
} from './generated/google/protobuf/descriptor';

export {
  InstrumentType,
  instrumentTypeFromJSON,
  instrumentTypeToJSON,
  SecurityTradingStatus,
  securityTradingStatusFromJSON,
  securityTradingStatusToJSON,
  PriceType,
  priceTypeFromJSON,
  priceTypeToJSON,
  ResultSubscriptionStatus,
  resultSubscriptionStatusFromJSON,
  resultSubscriptionStatusToJSON,
  MoneyValue,
  Quotation,
  Ping,
  Page,
  PageResponse,
  ResponseMetadata,
  BrandData,
  ErrorDetail
} from './generated/common';

export {
  CouponType,
  couponTypeFromJSON,
  couponTypeToJSON,
  OptionDirection,
  optionDirectionFromJSON,
  optionDirectionToJSON,
  OptionPaymentType,
  optionPaymentTypeFromJSON,
  optionPaymentTypeToJSON,
  OptionStyle,
  optionStyleFromJSON,
  optionStyleToJSON,
  OptionSettlementType,
  optionSettlementTypeFromJSON,
  optionSettlementTypeToJSON,
  InstrumentIdType,
  instrumentIdTypeFromJSON,
  instrumentIdTypeToJSON,
  InstrumentStatus,
  instrumentStatusFromJSON,
  instrumentStatusToJSON,
  ShareType,
  shareTypeFromJSON,
  shareTypeToJSON,
  AssetType,
  assetTypeFromJSON,
  assetTypeToJSON,
  StructuredProductType,
  structuredProductTypeFromJSON,
  structuredProductTypeToJSON,
  EditFavoritesActionType,
  editFavoritesActionTypeFromJSON,
  editFavoritesActionTypeToJSON,
  RealExchange,
  realExchangeFromJSON,
  realExchangeToJSON,
  Recommendation,
  recommendationFromJSON,
  recommendationToJSON,
  RiskLevel,
  riskLevelFromJSON,
  riskLevelToJSON,
  BondType,
  bondTypeFromJSON,
  bondTypeToJSON,
  InstrumentExchangeType,
  instrumentExchangeTypeFromJSON,
  instrumentExchangeTypeToJSON,
  TradingSchedulesRequest,
  TradingSchedulesResponse,
  TradingSchedule,
  TradingDay,
  InstrumentRequest,
  InstrumentsRequest,
  FilterOptionsRequest,
  BondResponse,
  BondsResponse,
  GetBondCouponsRequest,
  GetBondCouponsResponse,
  GetBondEventsRequest,
  GetBondEventsRequest_EventType,
  getBondEventsRequest_EventTypeFromJSON,
  getBondEventsRequest_EventTypeToJSON,
  GetBondEventsResponse,
  GetBondEventsResponse_BondEvent,
  Coupon,
  CurrencyResponse,
  CurrenciesResponse,
  EtfResponse,
  EtfsResponse,
  FutureResponse,
  FuturesResponse,
  OptionResponse,
  OptionsResponse,
  Option,
  ShareResponse,
  SharesResponse,
  Bond,
  Currency,
  Etf,
  Future,
  Share,
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse,
  AccruedInterest,
  GetFuturesMarginRequest,
  GetFuturesMarginResponse,
  InstrumentResponse,
  Instrument,
  GetDividendsRequest,
  GetDividendsResponse,
  Dividend,
  AssetRequest,
  AssetResponse,
  AssetsRequest,
  AssetsResponse,
  AssetFull,
  Asset,
  AssetCurrency,
  AssetSecurity,
  AssetShare,
  AssetBond,
  AssetStructuredProduct,
  AssetEtf,
  AssetClearingCertificate,
  Brand,
  AssetInstrument,
  InstrumentLink,
  GetFavoritesRequest,
  GetFavoritesResponse,
  FavoriteInstrument,
  EditFavoritesRequest,
  EditFavoritesRequestInstrument,
  EditFavoritesResponse,
  GetCountriesRequest,
  GetCountriesResponse,
  IndicativesRequest,
  IndicativesResponse,
  IndicativeResponse,
  CountryResponse,
  FindInstrumentRequest,
  FindInstrumentResponse,
  InstrumentShort,
  GetBrandsRequest,
  GetBrandRequest,
  GetBrandsResponse,
  GetAssetFundamentalsRequest,
  GetAssetFundamentalsResponse,
  GetAssetFundamentalsResponse_StatisticResponse,
  GetAssetReportsRequest,
  GetAssetReportsResponse,
  GetAssetReportsResponse_AssetReportPeriodType,
  getAssetReportsResponse_AssetReportPeriodTypeFromJSON,
  getAssetReportsResponse_AssetReportPeriodTypeToJSON,
  GetAssetReportsResponse_GetAssetReportsEvent,
  GetConsensusForecastsRequest,
  GetConsensusForecastsResponse,
  GetConsensusForecastsResponse_ConsensusForecastsItem,
  GetForecastRequest,
  GetForecastResponse,
  GetForecastResponse_TargetItem,
  GetForecastResponse_ConsensusItem,
  TradingInterval,
  TradingInterval_TimeInterval,
  InstrumentsServiceDefinition,
  InstrumentsServiceImplementation,
  InstrumentsServiceClient
} from './generated/instruments';

export {
  SubscriptionAction,
  subscriptionActionFromJSON,
  subscriptionActionToJSON,
  SubscriptionInterval,
  subscriptionIntervalFromJSON,
  subscriptionIntervalToJSON,
  SubscriptionStatus,
  subscriptionStatusFromJSON,
  subscriptionStatusToJSON,
  TradeSourceType,
  tradeSourceTypeFromJSON,
  tradeSourceTypeToJSON,
  TradeDirection,
  tradeDirectionFromJSON,
  tradeDirectionToJSON,
  CandleInterval,
  candleIntervalFromJSON,
  candleIntervalToJSON,
  CandleSource,
  candleSourceFromJSON,
  candleSourceToJSON,
  OrderBookType,
  orderBookTypeFromJSON,
  orderBookTypeToJSON,
  MarketDataRequest,
  MarketDataServerSideStreamRequest,
  MarketDataResponse,
  SubscribeCandlesRequest,
  CandleInstrument,
  SubscribeCandlesResponse,
  CandleSubscription,
  SubscribeOrderBookRequest,
  OrderBookInstrument,
  SubscribeOrderBookResponse,
  OrderBookSubscription,
  SubscribeTradesRequest,
  TradeInstrument,
  SubscribeTradesResponse,
  TradeSubscription,
  SubscribeInfoRequest,
  InfoInstrument,
  SubscribeInfoResponse,
  InfoSubscription,
  SubscribeLastPriceRequest,
  LastPriceInstrument,
  SubscribeLastPriceResponse,
  LastPriceSubscription,
  Candle,
  OrderBook,
  Order,
  Trade,
  TradingStatus,
  GetCandlesRequest,
  GetCandlesRequest_CandleSource,
  getCandlesRequest_CandleSourceFromJSON,
  getCandlesRequest_CandleSourceToJSON,
  GetCandlesResponse,
  HistoricCandle,
  GetLastPricesRequest,
  GetLastPricesResponse,
  LastPrice,
  GetOrderBookRequest,
  GetOrderBookResponse,
  GetTradingStatusRequest,
  GetTradingStatusesRequest,
  GetTradingStatusesResponse,
  GetTradingStatusResponse,
  GetLastTradesRequest,
  GetLastTradesResponse,
  GetMySubscriptions,
  GetClosePricesRequest,
  InstrumentClosePriceRequest,
  GetClosePricesResponse,
  InstrumentClosePriceResponse,
  GetTechAnalysisRequest,
  GetTechAnalysisRequest_IndicatorInterval,
  getTechAnalysisRequest_IndicatorIntervalFromJSON,
  getTechAnalysisRequest_IndicatorIntervalToJSON,
  GetTechAnalysisRequest_TypeOfPrice,
  getTechAnalysisRequest_TypeOfPriceFromJSON,
  getTechAnalysisRequest_TypeOfPriceToJSON,
  GetTechAnalysisRequest_IndicatorType,
  getTechAnalysisRequest_IndicatorTypeFromJSON,
  getTechAnalysisRequest_IndicatorTypeToJSON,
  GetTechAnalysisRequest_Smoothing,
  GetTechAnalysisRequest_Deviation,
  GetTechAnalysisResponse,
  GetTechAnalysisResponse_TechAnalysisItem,
  MarketDataServiceDefinition,
  MarketDataServiceImplementation,
  MarketDataServiceClient,
  MarketDataStreamServiceDefinition,
  MarketDataStreamServiceImplementation,
  MarketDataStreamServiceClient,
  ServerStreamingMethodResult
} from './generated/marketdata';

export {
  OperationState,
  operationStateFromJSON,
  operationStateToJSON,
  OperationType,
  operationTypeFromJSON,
  operationTypeToJSON,
  PortfolioSubscriptionStatus,
  portfolioSubscriptionStatusFromJSON,
  portfolioSubscriptionStatusToJSON,
  PositionsAccountSubscriptionStatus,
  positionsAccountSubscriptionStatusFromJSON,
  positionsAccountSubscriptionStatusToJSON,
  OperationsRequest,
  OperationsResponse,
  Operation,
  OperationTrade,
  PortfolioRequest,
  PortfolioRequest_CurrencyRequest,
  portfolioRequest_CurrencyRequestFromJSON,
  portfolioRequest_CurrencyRequestToJSON,
  PortfolioResponse,
  PositionsRequest,
  PositionsResponse,
  WithdrawLimitsRequest,
  WithdrawLimitsResponse,
  PortfolioPosition,
  VirtualPortfolioPosition,
  PositionsSecurities,
  PositionsFutures,
  PositionsOptions,
  BrokerReportRequest,
  BrokerReportResponse,
  GenerateBrokerReportRequest,
  GenerateBrokerReportResponse,
  GetBrokerReportRequest,
  GetBrokerReportResponse,
  BrokerReport,
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse,
  GenerateDividendsForeignIssuerReportRequest,
  GetDividendsForeignIssuerReportRequest,
  GenerateDividendsForeignIssuerReportResponse,
  GetDividendsForeignIssuerReportResponse,
  DividendsForeignIssuerReport,
  PortfolioStreamRequest,
  PortfolioStreamResponse,
  PortfolioSubscriptionResult,
  AccountSubscriptionStatus,
  GetOperationsByCursorRequest,
  GetOperationsByCursorResponse,
  OperationItem,
  OperationItemTrades,
  OperationItemTrade,
  PositionsStreamRequest,
  PositionsStreamResponse,
  PositionsSubscriptionResult,
  PositionsSubscriptionStatus,
  PositionData,
  PositionsMoney,
  OperationsServiceDefinition,
  OperationsServiceImplementation,
  OperationsServiceClient,
  OperationsStreamServiceDefinition,
  OperationsStreamServiceImplementation,
  OperationsStreamServiceClient
} from './generated/operations';

export {
  OrderDirection,
  orderDirectionFromJSON,
  orderDirectionToJSON,
  OrderType,
  orderTypeFromJSON,
  orderTypeToJSON,
  OrderExecutionReportStatus,
  orderExecutionReportStatusFromJSON,
  orderExecutionReportStatusToJSON,
  TimeInForceType,
  timeInForceTypeFromJSON,
  timeInForceTypeToJSON,
  TradesStreamRequest,
  TradesStreamResponse,
  OrderTrades,
  OrderTrade,
  PostOrderRequest,
  PostOrderResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  GetOrderStateRequest,
  GetOrdersRequest,
  GetOrdersResponse,
  OrderState,
  OrderStage,
  ReplaceOrderRequest,
  GetMaxLotsRequest,
  GetMaxLotsResponse,
  GetMaxLotsResponse_BuyLimitsView,
  GetMaxLotsResponse_SellLimitsView,
  GetOrderPriceRequest,
  GetOrderPriceResponse,
  GetOrderPriceResponse_ExtraBond,
  GetOrderPriceResponse_ExtraFuture,
  OrderStateStreamRequest,
  OrderStateStreamResponse,
  OrderStateStreamResponse_MarkerType,
  orderStateStreamResponse_MarkerTypeFromJSON,
  orderStateStreamResponse_MarkerTypeToJSON,
  OrderStateStreamResponse_StatusCauseInfo,
  orderStateStreamResponse_StatusCauseInfoFromJSON,
  orderStateStreamResponse_StatusCauseInfoToJSON,
  OrderStateStreamResponse_SubscriptionResponse,
  OrderStateStreamResponse_OrderState,
  OrdersStreamServiceDefinition,
  OrdersStreamServiceImplementation,
  OrdersStreamServiceClient,
  OrdersServiceDefinition,
  OrdersServiceImplementation,
  OrdersServiceClient
} from './generated/orders';

export {
  OpenSandboxAccountRequest,
  OpenSandboxAccountResponse,
  CloseSandboxAccountRequest,
  CloseSandboxAccountResponse,
  SandboxPayInRequest,
  SandboxPayInResponse,
  SandboxServiceDefinition,
  SandboxServiceImplementation,
  SandboxServiceClient
} from './generated/sandbox';

export {
  StopOrderDirection,
  stopOrderDirectionFromJSON,
  stopOrderDirectionToJSON,
  StopOrderExpirationType,
  stopOrderExpirationTypeFromJSON,
  stopOrderExpirationTypeToJSON,
  StopOrderType,
  stopOrderTypeFromJSON,
  stopOrderTypeToJSON,
  StopOrderStatusOption,
  stopOrderStatusOptionFromJSON,
  stopOrderStatusOptionToJSON,
  ExchangeOrderType,
  exchangeOrderTypeFromJSON,
  exchangeOrderTypeToJSON,
  TakeProfitType,
  takeProfitTypeFromJSON,
  takeProfitTypeToJSON,
  TrailingValueType,
  trailingValueTypeFromJSON,
  trailingValueTypeToJSON,
  TrailingStopStatus,
  trailingStopStatusFromJSON,
  trailingStopStatusToJSON,
  PostStopOrderRequest,
  PostStopOrderRequest_TrailingData,
  PostStopOrderResponse,
  GetStopOrdersRequest,
  GetStopOrdersResponse,
  CancelStopOrderRequest,
  CancelStopOrderResponse,
  StopOrder,
  StopOrder_TrailingData,
  StopOrdersServiceDefinition,
  StopOrdersServiceImplementation,
  StopOrdersServiceClient
} from './generated/stoporders';

export {
  AccountType,
  accountTypeFromJSON,
  accountTypeToJSON,
  AccountStatus,
  accountStatusFromJSON,
  accountStatusToJSON,
  AccessLevel,
  accessLevelFromJSON,
  accessLevelToJSON,
  GetAccountsRequest,
  GetAccountsResponse,
  Account,
  GetMarginAttributesRequest,
  GetMarginAttributesResponse,
  GetUserTariffRequest,
  GetUserTariffResponse,
  UnaryLimit,
  StreamLimit,
  GetInfoRequest,
  GetInfoResponse,
  UsersServiceDefinition,
  UsersServiceImplementation,
  UsersServiceClient
} from './generated/users';