import {
  Channel, Metadata, ChannelCredentials, ClientMiddlewareCall, CallOptions,
  createClientFactory, createChannel
} from 'nice-grpc';
import { InstrumentsServiceDefinition, InstrumentsServiceClient } from './generated/instruments';
import { MarketDataServiceDefinition, MarketDataServiceClient } from './generated/marketdata';
import { OperationsServiceDefinition, OperationsServiceClient } from './generated/operations';
import { OrdersServiceDefinition, OrdersServiceClient } from './generated/orders';
import { SandboxServiceDefinition, SandboxServiceClient } from './generated/sandbox';
import { StopOrdersServiceDefinition, StopOrdersServiceClient } from './generated/stoporders';
import { UsersServiceDefinition, UsersServiceClient } from './generated/users';
import { Throttle, UnaryLimits } from './throttle';

export interface TinkoffInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  unsafe?: boolean;
  trackLimits?: boolean;
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

const unaryLimits: UnaryLimits = {
  InstrumentsService: 200,
  MarketDataService: 600,
  OperationsService: 200,
  OrdersService: 100,
  SandboxService: 200,
  StopOrdersService: 50,
  UsersService: 100
};

const throttle = new Throttle(unaryLimits);

export class TinkoffInvestNodeSDK {
  protected options: TinkoffInvestOptions;
  protected storage: Map<ServiceDefinition, ServiceClient> = new Map();
  protected channel: Channel;
  protected metadata: Metadata;
  
  constructor(options: TinkoffInvestOptions) {
    this.options = {
      unsafe: false,
      trackLimits: true,
      ...options
    };

    this.channel = this.createChannel();
    this.metadata = this.createMetadata();
  }

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
  
  get users() {
    return this.useServiceAsClient<UsersServiceClient>(UsersServiceDefinition);
  }

  private useServiceAsClient<T extends ServiceClient>(service: ServiceDefinition) {
    let client = this.storage.get(service);

    if (!client) {
      client = createClientFactory()
        .use(this.middleware(this.options.trackLimits))
        .create(service, this.channel, {
          '*': {
            metadata: this.metadata
          }
        });

      this.storage.set(service, client);
    }

    return client as T;
  }

  private createChannel() {
    const credentials = this.options.unsafe
      ? ChannelCredentials.createInsecure()
      : ChannelCredentials.createSsl();
      
    return createChannel(this.options.endpoint, credentials);
  }

  private createMetadata() {
    const init = {
      'Authorization': `Bearer ${this.options.token}`
    };

    if (this.options.appName) {
      init['x-app-name'] = this.options.appName
    }

    return new Metadata(init);
  }

  private middleware(trackLimits) {
    return async function*<Request, Response>(call: ClientMiddlewareCall<Request, Response, CallOptions>, options: CallOptions) {
      if (!call.responseStream) {
        if (trackLimits) {
          await throttle.reduce(call.method.path);
        }
        
        const response = yield* call.next(call.request, options);

        return response;
      }
      else {
        for await (const response of call.next(call.request, options)) {
          yield response;
        }

        return;
      }
    }
  }
}

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
  MoneyValue,
  Quotation,
  Ping,
  DeepPartial,
  MessageFns
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
  RiskLevel,
  riskLevelFromJSON,
  riskLevelToJSON,
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
  CountryResponse,
  FindInstrumentRequest,
  FindInstrumentResponse,
  InstrumentShort,
  GetBrandsRequest,
  GetBrandRequest,
  GetBrandsResponse,
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
  TradeDirection,
  tradeDirectionFromJSON,
  tradeDirectionToJSON,
  CandleInterval,
  candleIntervalFromJSON,
  candleIntervalToJSON,
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
  PortfolioRequest_CurrencyRequest,
  portfolioRequest_CurrencyRequestFromJSON,
  portfolioRequest_CurrencyRequestToJSON,
  OperationsRequest,
  OperationsResponse,
  Operation,
  OperationTrade,
  PortfolioRequest,
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
  orderTypeFromJSON,
  orderTypeToJSON,
  OrderExecutionReportStatus,
  orderExecutionReportStatusFromJSON,
  orderExecutionReportStatusToJSON,
  priceTypeFromJSON,
  priceTypeToJSON,
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
  PostStopOrderRequest,
  PostStopOrderResponse,
  GetStopOrdersRequest,
  GetStopOrdersResponse,
  CancelStopOrderRequest,
  CancelStopOrderResponse,
  StopOrder,
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