"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneofOptions = exports.FieldOptions_FeatureSupport = exports.FieldOptions_EditionDefault = exports.fieldOptions_OptionTargetTypeToJSON = exports.fieldOptions_OptionTargetTypeFromJSON = exports.FieldOptions_OptionTargetType = exports.fieldOptions_OptionRetentionToJSON = exports.fieldOptions_OptionRetentionFromJSON = exports.FieldOptions_OptionRetention = exports.fieldOptions_JSTypeToJSON = exports.fieldOptions_JSTypeFromJSON = exports.FieldOptions_JSType = exports.fieldOptions_CTypeToJSON = exports.fieldOptions_CTypeFromJSON = exports.FieldOptions_CType = exports.FieldOptions = exports.MessageOptions = exports.fileOptions_OptimizeModeToJSON = exports.fileOptions_OptimizeModeFromJSON = exports.FileOptions_OptimizeMode = exports.FileOptions = exports.MethodDescriptorProto = exports.ServiceDescriptorProto = exports.EnumValueDescriptorProto = exports.EnumDescriptorProto_EnumReservedRange = exports.EnumDescriptorProto = exports.OneofDescriptorProto = exports.fieldDescriptorProto_LabelToJSON = exports.fieldDescriptorProto_LabelFromJSON = exports.FieldDescriptorProto_Label = exports.fieldDescriptorProto_TypeToJSON = exports.fieldDescriptorProto_TypeFromJSON = exports.FieldDescriptorProto_Type = exports.FieldDescriptorProto = exports.ExtensionRangeOptions_Declaration = exports.extensionRangeOptions_VerificationStateToJSON = exports.extensionRangeOptions_VerificationStateFromJSON = exports.ExtensionRangeOptions_VerificationState = exports.ExtensionRangeOptions = exports.DescriptorProto_ReservedRange = exports.DescriptorProto_ExtensionRange = exports.DescriptorProto = exports.FileDescriptorProto = exports.FileDescriptorSet = exports.editionToJSON = exports.editionFromJSON = exports.Edition = exports.protobufPackage = exports.Timestamp = exports.TinkoffInvestNodeSDK = void 0;
exports.OptionDirection = exports.couponTypeToJSON = exports.couponTypeFromJSON = exports.CouponType = exports.Ping = exports.Quotation = exports.MoneyValue = exports.securityTradingStatusToJSON = exports.securityTradingStatusFromJSON = exports.SecurityTradingStatus = exports.instrumentTypeToJSON = exports.instrumentTypeFromJSON = exports.InstrumentType = exports.generatedCodeInfo_Annotation_SemanticToJSON = exports.generatedCodeInfo_Annotation_SemanticFromJSON = exports.GeneratedCodeInfo_Annotation_Semantic = exports.GeneratedCodeInfo_Annotation = exports.GeneratedCodeInfo = exports.SourceCodeInfo_Location = exports.SourceCodeInfo = exports.FeatureSetDefaults_FeatureSetEditionDefault = exports.FeatureSetDefaults = exports.featureSet_JsonFormatToJSON = exports.featureSet_JsonFormatFromJSON = exports.FeatureSet_JsonFormat = exports.featureSet_MessageEncodingToJSON = exports.featureSet_MessageEncodingFromJSON = exports.FeatureSet_MessageEncoding = exports.featureSet_Utf8ValidationToJSON = exports.featureSet_Utf8ValidationFromJSON = exports.FeatureSet_Utf8Validation = exports.featureSet_RepeatedFieldEncodingToJSON = exports.featureSet_RepeatedFieldEncodingFromJSON = exports.FeatureSet_RepeatedFieldEncoding = exports.featureSet_EnumTypeToJSON = exports.featureSet_EnumTypeFromJSON = exports.FeatureSet_EnumType = exports.featureSet_FieldPresenceToJSON = exports.featureSet_FieldPresenceFromJSON = exports.FeatureSet_FieldPresence = exports.FeatureSet = exports.UninterpretedOption_NamePart = exports.UninterpretedOption = exports.methodOptions_IdempotencyLevelToJSON = exports.methodOptions_IdempotencyLevelFromJSON = exports.MethodOptions_IdempotencyLevel = exports.MethodOptions = exports.ServiceOptions = exports.EnumValueOptions = exports.EnumOptions = void 0;
exports.EtfResponse = exports.CurrenciesResponse = exports.CurrencyResponse = exports.Coupon = exports.GetBondCouponsResponse = exports.GetBondCouponsRequest = exports.BondsResponse = exports.BondResponse = exports.FilterOptionsRequest = exports.InstrumentsRequest = exports.InstrumentRequest = exports.TradingDay = exports.TradingSchedule = exports.TradingSchedulesResponse = exports.TradingSchedulesRequest = exports.riskLevelToJSON = exports.riskLevelFromJSON = exports.RiskLevel = exports.realExchangeToJSON = exports.realExchangeFromJSON = exports.RealExchange = exports.editFavoritesActionTypeToJSON = exports.editFavoritesActionTypeFromJSON = exports.EditFavoritesActionType = exports.structuredProductTypeToJSON = exports.structuredProductTypeFromJSON = exports.StructuredProductType = exports.assetTypeToJSON = exports.assetTypeFromJSON = exports.AssetType = exports.shareTypeToJSON = exports.shareTypeFromJSON = exports.ShareType = exports.instrumentStatusToJSON = exports.instrumentStatusFromJSON = exports.InstrumentStatus = exports.instrumentIdTypeToJSON = exports.instrumentIdTypeFromJSON = exports.InstrumentIdType = exports.optionSettlementTypeToJSON = exports.optionSettlementTypeFromJSON = exports.OptionSettlementType = exports.optionStyleToJSON = exports.optionStyleFromJSON = exports.OptionStyle = exports.optionPaymentTypeToJSON = exports.optionPaymentTypeFromJSON = exports.OptionPaymentType = exports.optionDirectionToJSON = exports.optionDirectionFromJSON = void 0;
exports.FindInstrumentResponse = exports.FindInstrumentRequest = exports.CountryResponse = exports.GetCountriesResponse = exports.GetCountriesRequest = exports.EditFavoritesResponse = exports.EditFavoritesRequestInstrument = exports.EditFavoritesRequest = exports.FavoriteInstrument = exports.GetFavoritesResponse = exports.GetFavoritesRequest = exports.InstrumentLink = exports.AssetInstrument = exports.Brand = exports.AssetClearingCertificate = exports.AssetEtf = exports.AssetStructuredProduct = exports.AssetBond = exports.AssetShare = exports.AssetSecurity = exports.AssetCurrency = exports.Asset = exports.AssetFull = exports.AssetsResponse = exports.AssetsRequest = exports.AssetResponse = exports.AssetRequest = exports.Dividend = exports.GetDividendsResponse = exports.GetDividendsRequest = exports.Instrument = exports.InstrumentResponse = exports.GetFuturesMarginResponse = exports.GetFuturesMarginRequest = exports.AccruedInterest = exports.GetAccruedInterestsResponse = exports.GetAccruedInterestsRequest = exports.Share = exports.Future = exports.Etf = exports.Currency = exports.Bond = exports.SharesResponse = exports.ShareResponse = exports.Option = exports.OptionsResponse = exports.OptionResponse = exports.FuturesResponse = exports.FutureResponse = exports.EtfsResponse = void 0;
exports.GetCandlesResponse = exports.GetCandlesRequest = exports.TradingStatus = exports.Trade = exports.Order = exports.OrderBook = exports.Candle = exports.LastPriceSubscription = exports.SubscribeLastPriceResponse = exports.LastPriceInstrument = exports.SubscribeLastPriceRequest = exports.InfoSubscription = exports.SubscribeInfoResponse = exports.InfoInstrument = exports.SubscribeInfoRequest = exports.TradeSubscription = exports.SubscribeTradesResponse = exports.TradeInstrument = exports.SubscribeTradesRequest = exports.OrderBookSubscription = exports.SubscribeOrderBookResponse = exports.OrderBookInstrument = exports.SubscribeOrderBookRequest = exports.CandleSubscription = exports.SubscribeCandlesResponse = exports.CandleInstrument = exports.SubscribeCandlesRequest = exports.MarketDataResponse = exports.MarketDataServerSideStreamRequest = exports.MarketDataRequest = exports.candleIntervalToJSON = exports.candleIntervalFromJSON = exports.CandleInterval = exports.tradeDirectionToJSON = exports.tradeDirectionFromJSON = exports.TradeDirection = exports.subscriptionStatusToJSON = exports.subscriptionStatusFromJSON = exports.SubscriptionStatus = exports.subscriptionIntervalToJSON = exports.subscriptionIntervalFromJSON = exports.SubscriptionInterval = exports.subscriptionActionToJSON = exports.subscriptionActionFromJSON = exports.SubscriptionAction = exports.InstrumentsServiceDefinition = exports.GetBrandsResponse = exports.GetBrandRequest = exports.GetBrandsRequest = exports.InstrumentShort = void 0;
exports.BrokerReportRequest = exports.PositionsOptions = exports.PositionsFutures = exports.PositionsSecurities = exports.VirtualPortfolioPosition = exports.PortfolioPosition = exports.WithdrawLimitsResponse = exports.WithdrawLimitsRequest = exports.PositionsResponse = exports.PositionsRequest = exports.PortfolioResponse = exports.PortfolioRequest = exports.OperationTrade = exports.Operation = exports.OperationsResponse = exports.OperationsRequest = exports.portfolioRequest_CurrencyRequestToJSON = exports.portfolioRequest_CurrencyRequestFromJSON = exports.PortfolioRequest_CurrencyRequest = exports.positionsAccountSubscriptionStatusToJSON = exports.positionsAccountSubscriptionStatusFromJSON = exports.PositionsAccountSubscriptionStatus = exports.portfolioSubscriptionStatusToJSON = exports.portfolioSubscriptionStatusFromJSON = exports.PortfolioSubscriptionStatus = exports.operationTypeToJSON = exports.operationTypeFromJSON = exports.OperationType = exports.operationStateToJSON = exports.operationStateFromJSON = exports.OperationState = exports.MarketDataStreamServiceDefinition = exports.MarketDataServiceDefinition = exports.InstrumentClosePriceResponse = exports.GetClosePricesResponse = exports.InstrumentClosePriceRequest = exports.GetClosePricesRequest = exports.GetMySubscriptions = exports.GetLastTradesResponse = exports.GetLastTradesRequest = exports.GetTradingStatusResponse = exports.GetTradingStatusesResponse = exports.GetTradingStatusesRequest = exports.GetTradingStatusRequest = exports.GetOrderBookResponse = exports.GetOrderBookRequest = exports.LastPrice = exports.GetLastPricesResponse = exports.GetLastPricesRequest = exports.HistoricCandle = void 0;
exports.GetOrdersRequest = exports.GetOrderStateRequest = exports.CancelOrderResponse = exports.CancelOrderRequest = exports.PostOrderResponse = exports.PostOrderRequest = exports.OrderTrade = exports.OrderTrades = exports.TradesStreamResponse = exports.TradesStreamRequest = exports.priceTypeToJSON = exports.priceTypeFromJSON = exports.orderExecutionReportStatusToJSON = exports.orderExecutionReportStatusFromJSON = exports.OrderExecutionReportStatus = exports.orderTypeToJSON = exports.orderTypeFromJSON = exports.orderDirectionToJSON = exports.orderDirectionFromJSON = exports.OrderDirection = exports.OperationsStreamServiceDefinition = exports.OperationsServiceDefinition = exports.PositionsMoney = exports.PositionData = exports.PositionsSubscriptionStatus = exports.PositionsSubscriptionResult = exports.PositionsStreamResponse = exports.PositionsStreamRequest = exports.OperationItemTrade = exports.OperationItemTrades = exports.OperationItem = exports.GetOperationsByCursorResponse = exports.GetOperationsByCursorRequest = exports.AccountSubscriptionStatus = exports.PortfolioSubscriptionResult = exports.PortfolioStreamResponse = exports.PortfolioStreamRequest = exports.DividendsForeignIssuerReport = exports.GetDividendsForeignIssuerReportResponse = exports.GenerateDividendsForeignIssuerReportResponse = exports.GetDividendsForeignIssuerReportRequest = exports.GenerateDividendsForeignIssuerReportRequest = exports.GetDividendsForeignIssuerResponse = exports.GetDividendsForeignIssuerRequest = exports.BrokerReport = exports.GetBrokerReportResponse = exports.GetBrokerReportRequest = exports.GenerateBrokerReportResponse = exports.GenerateBrokerReportRequest = exports.BrokerReportResponse = void 0;
exports.GetInfoResponse = exports.GetInfoRequest = exports.StreamLimit = exports.UnaryLimit = exports.GetUserTariffResponse = exports.GetUserTariffRequest = exports.GetMarginAttributesResponse = exports.GetMarginAttributesRequest = exports.Account = exports.GetAccountsResponse = exports.GetAccountsRequest = exports.accessLevelToJSON = exports.accessLevelFromJSON = exports.AccessLevel = exports.accountStatusToJSON = exports.accountStatusFromJSON = exports.AccountStatus = exports.accountTypeToJSON = exports.accountTypeFromJSON = exports.AccountType = exports.StopOrdersServiceDefinition = exports.StopOrder = exports.CancelStopOrderResponse = exports.CancelStopOrderRequest = exports.GetStopOrdersResponse = exports.GetStopOrdersRequest = exports.PostStopOrderResponse = exports.PostStopOrderRequest = exports.stopOrderTypeToJSON = exports.stopOrderTypeFromJSON = exports.StopOrderType = exports.stopOrderExpirationTypeToJSON = exports.stopOrderExpirationTypeFromJSON = exports.StopOrderExpirationType = exports.stopOrderDirectionToJSON = exports.stopOrderDirectionFromJSON = exports.StopOrderDirection = exports.SandboxServiceDefinition = exports.SandboxPayInResponse = exports.SandboxPayInRequest = exports.CloseSandboxAccountResponse = exports.CloseSandboxAccountRequest = exports.OpenSandboxAccountResponse = exports.OpenSandboxAccountRequest = exports.OrdersServiceDefinition = exports.OrdersStreamServiceDefinition = exports.ReplaceOrderRequest = exports.OrderStage = exports.OrderState = exports.GetOrdersResponse = void 0;
exports.UsersServiceDefinition = void 0;
const nice_grpc_1 = require("nice-grpc");
const instruments_1 = require("./generated/instruments");
const marketdata_1 = require("./generated/marketdata");
const operations_1 = require("./generated/operations");
const orders_1 = require("./generated/orders");
const sandbox_1 = require("./generated/sandbox");
const stoporders_1 = require("./generated/stoporders");
const users_1 = require("./generated/users");
const throttle_1 = require("./throttle");
const config_json_1 = __importDefault(require("./config.json"));
const unaryLimits = {
    InstrumentsService: 200,
    MarketDataService: 600,
    OperationsService: 200,
    OrdersService: 100,
    SandboxService: 200,
    StopOrdersService: 50,
    UsersService: 100
};
const throttle = new throttle_1.Throttle(unaryLimits);
class TinkoffInvestNodeSDK {
    options;
    storage = new Map();
    channel;
    metadata;
    constructor(options) {
        this.options = {
            endpoint: config_json_1.default.endpoint,
            appName: config_json_1.default.appName,
            ...options
        };
        this.channel = this.createChannel();
        this.metadata = this.createMetadata();
    }
    get instruments() {
        return this.useServiceAsClient(instruments_1.InstrumentsServiceDefinition);
    }
    get marketdata() {
        return this.useServiceAsClient(marketdata_1.MarketDataServiceDefinition);
    }
    get operations() {
        return this.useServiceAsClient(operations_1.OperationsServiceDefinition);
    }
    get orders() {
        return this.useServiceAsClient(orders_1.OrdersServiceDefinition);
    }
    get sandbox() {
        return this.useServiceAsClient(sandbox_1.SandboxServiceDefinition);
    }
    get stoporders() {
        return this.useServiceAsClient(stoporders_1.StopOrdersServiceDefinition);
    }
    get users() {
        return this.useServiceAsClient(users_1.UsersServiceDefinition);
    }
    useServiceAsClient(service) {
        let client = this.storage.get(service);
        if (!client) {
            client = (0, nice_grpc_1.createClientFactory)()
                .use(this.middleware)
                .create(service, this.channel, {
                '*': {
                    metadata: this.metadata
                }
            });
            this.storage.set(service, client);
        }
        return client;
    }
    createChannel() {
        const credentials = config_json_1.default.useSsl
            ? nice_grpc_1.ChannelCredentials.createSsl()
            : nice_grpc_1.ChannelCredentials.createInsecure();
        return (0, nice_grpc_1.createChannel)(this.options.endpoint, credentials);
    }
    createMetadata() {
        return new nice_grpc_1.Metadata({
            'Authorization': `Bearer ${this.options.token}`,
            'x-app-name': this.options.appName
        });
    }
    async *middleware(call, options) {
        if (!call.responseStream) {
            await throttle.reduce(call.method.path);
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
exports.TinkoffInvestNodeSDK = TinkoffInvestNodeSDK;
var timestamp_1 = require("./generated/google/protobuf/timestamp");
Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return timestamp_1.Timestamp; } });
var descriptor_1 = require("./generated/google/protobuf/descriptor");
Object.defineProperty(exports, "protobufPackage", { enumerable: true, get: function () { return descriptor_1.protobufPackage; } });
Object.defineProperty(exports, "Edition", { enumerable: true, get: function () { return descriptor_1.Edition; } });
Object.defineProperty(exports, "editionFromJSON", { enumerable: true, get: function () { return descriptor_1.editionFromJSON; } });
Object.defineProperty(exports, "editionToJSON", { enumerable: true, get: function () { return descriptor_1.editionToJSON; } });
Object.defineProperty(exports, "FileDescriptorSet", { enumerable: true, get: function () { return descriptor_1.FileDescriptorSet; } });
Object.defineProperty(exports, "FileDescriptorProto", { enumerable: true, get: function () { return descriptor_1.FileDescriptorProto; } });
Object.defineProperty(exports, "DescriptorProto", { enumerable: true, get: function () { return descriptor_1.DescriptorProto; } });
Object.defineProperty(exports, "DescriptorProto_ExtensionRange", { enumerable: true, get: function () { return descriptor_1.DescriptorProto_ExtensionRange; } });
Object.defineProperty(exports, "DescriptorProto_ReservedRange", { enumerable: true, get: function () { return descriptor_1.DescriptorProto_ReservedRange; } });
Object.defineProperty(exports, "ExtensionRangeOptions", { enumerable: true, get: function () { return descriptor_1.ExtensionRangeOptions; } });
Object.defineProperty(exports, "ExtensionRangeOptions_VerificationState", { enumerable: true, get: function () { return descriptor_1.ExtensionRangeOptions_VerificationState; } });
Object.defineProperty(exports, "extensionRangeOptions_VerificationStateFromJSON", { enumerable: true, get: function () { return descriptor_1.extensionRangeOptions_VerificationStateFromJSON; } });
Object.defineProperty(exports, "extensionRangeOptions_VerificationStateToJSON", { enumerable: true, get: function () { return descriptor_1.extensionRangeOptions_VerificationStateToJSON; } });
Object.defineProperty(exports, "ExtensionRangeOptions_Declaration", { enumerable: true, get: function () { return descriptor_1.ExtensionRangeOptions_Declaration; } });
Object.defineProperty(exports, "FieldDescriptorProto", { enumerable: true, get: function () { return descriptor_1.FieldDescriptorProto; } });
Object.defineProperty(exports, "FieldDescriptorProto_Type", { enumerable: true, get: function () { return descriptor_1.FieldDescriptorProto_Type; } });
Object.defineProperty(exports, "fieldDescriptorProto_TypeFromJSON", { enumerable: true, get: function () { return descriptor_1.fieldDescriptorProto_TypeFromJSON; } });
Object.defineProperty(exports, "fieldDescriptorProto_TypeToJSON", { enumerable: true, get: function () { return descriptor_1.fieldDescriptorProto_TypeToJSON; } });
Object.defineProperty(exports, "FieldDescriptorProto_Label", { enumerable: true, get: function () { return descriptor_1.FieldDescriptorProto_Label; } });
Object.defineProperty(exports, "fieldDescriptorProto_LabelFromJSON", { enumerable: true, get: function () { return descriptor_1.fieldDescriptorProto_LabelFromJSON; } });
Object.defineProperty(exports, "fieldDescriptorProto_LabelToJSON", { enumerable: true, get: function () { return descriptor_1.fieldDescriptorProto_LabelToJSON; } });
Object.defineProperty(exports, "OneofDescriptorProto", { enumerable: true, get: function () { return descriptor_1.OneofDescriptorProto; } });
Object.defineProperty(exports, "EnumDescriptorProto", { enumerable: true, get: function () { return descriptor_1.EnumDescriptorProto; } });
Object.defineProperty(exports, "EnumDescriptorProto_EnumReservedRange", { enumerable: true, get: function () { return descriptor_1.EnumDescriptorProto_EnumReservedRange; } });
Object.defineProperty(exports, "EnumValueDescriptorProto", { enumerable: true, get: function () { return descriptor_1.EnumValueDescriptorProto; } });
Object.defineProperty(exports, "ServiceDescriptorProto", { enumerable: true, get: function () { return descriptor_1.ServiceDescriptorProto; } });
Object.defineProperty(exports, "MethodDescriptorProto", { enumerable: true, get: function () { return descriptor_1.MethodDescriptorProto; } });
Object.defineProperty(exports, "FileOptions", { enumerable: true, get: function () { return descriptor_1.FileOptions; } });
Object.defineProperty(exports, "FileOptions_OptimizeMode", { enumerable: true, get: function () { return descriptor_1.FileOptions_OptimizeMode; } });
Object.defineProperty(exports, "fileOptions_OptimizeModeFromJSON", { enumerable: true, get: function () { return descriptor_1.fileOptions_OptimizeModeFromJSON; } });
Object.defineProperty(exports, "fileOptions_OptimizeModeToJSON", { enumerable: true, get: function () { return descriptor_1.fileOptions_OptimizeModeToJSON; } });
Object.defineProperty(exports, "MessageOptions", { enumerable: true, get: function () { return descriptor_1.MessageOptions; } });
Object.defineProperty(exports, "FieldOptions", { enumerable: true, get: function () { return descriptor_1.FieldOptions; } });
Object.defineProperty(exports, "FieldOptions_CType", { enumerable: true, get: function () { return descriptor_1.FieldOptions_CType; } });
Object.defineProperty(exports, "fieldOptions_CTypeFromJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_CTypeFromJSON; } });
Object.defineProperty(exports, "fieldOptions_CTypeToJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_CTypeToJSON; } });
Object.defineProperty(exports, "FieldOptions_JSType", { enumerable: true, get: function () { return descriptor_1.FieldOptions_JSType; } });
Object.defineProperty(exports, "fieldOptions_JSTypeFromJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_JSTypeFromJSON; } });
Object.defineProperty(exports, "fieldOptions_JSTypeToJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_JSTypeToJSON; } });
Object.defineProperty(exports, "FieldOptions_OptionRetention", { enumerable: true, get: function () { return descriptor_1.FieldOptions_OptionRetention; } });
Object.defineProperty(exports, "fieldOptions_OptionRetentionFromJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_OptionRetentionFromJSON; } });
Object.defineProperty(exports, "fieldOptions_OptionRetentionToJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_OptionRetentionToJSON; } });
Object.defineProperty(exports, "FieldOptions_OptionTargetType", { enumerable: true, get: function () { return descriptor_1.FieldOptions_OptionTargetType; } });
Object.defineProperty(exports, "fieldOptions_OptionTargetTypeFromJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_OptionTargetTypeFromJSON; } });
Object.defineProperty(exports, "fieldOptions_OptionTargetTypeToJSON", { enumerable: true, get: function () { return descriptor_1.fieldOptions_OptionTargetTypeToJSON; } });
Object.defineProperty(exports, "FieldOptions_EditionDefault", { enumerable: true, get: function () { return descriptor_1.FieldOptions_EditionDefault; } });
Object.defineProperty(exports, "FieldOptions_FeatureSupport", { enumerable: true, get: function () { return descriptor_1.FieldOptions_FeatureSupport; } });
Object.defineProperty(exports, "OneofOptions", { enumerable: true, get: function () { return descriptor_1.OneofOptions; } });
Object.defineProperty(exports, "EnumOptions", { enumerable: true, get: function () { return descriptor_1.EnumOptions; } });
Object.defineProperty(exports, "EnumValueOptions", { enumerable: true, get: function () { return descriptor_1.EnumValueOptions; } });
Object.defineProperty(exports, "ServiceOptions", { enumerable: true, get: function () { return descriptor_1.ServiceOptions; } });
Object.defineProperty(exports, "MethodOptions", { enumerable: true, get: function () { return descriptor_1.MethodOptions; } });
Object.defineProperty(exports, "MethodOptions_IdempotencyLevel", { enumerable: true, get: function () { return descriptor_1.MethodOptions_IdempotencyLevel; } });
Object.defineProperty(exports, "methodOptions_IdempotencyLevelFromJSON", { enumerable: true, get: function () { return descriptor_1.methodOptions_IdempotencyLevelFromJSON; } });
Object.defineProperty(exports, "methodOptions_IdempotencyLevelToJSON", { enumerable: true, get: function () { return descriptor_1.methodOptions_IdempotencyLevelToJSON; } });
Object.defineProperty(exports, "UninterpretedOption", { enumerable: true, get: function () { return descriptor_1.UninterpretedOption; } });
Object.defineProperty(exports, "UninterpretedOption_NamePart", { enumerable: true, get: function () { return descriptor_1.UninterpretedOption_NamePart; } });
Object.defineProperty(exports, "FeatureSet", { enumerable: true, get: function () { return descriptor_1.FeatureSet; } });
Object.defineProperty(exports, "FeatureSet_FieldPresence", { enumerable: true, get: function () { return descriptor_1.FeatureSet_FieldPresence; } });
Object.defineProperty(exports, "featureSet_FieldPresenceFromJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_FieldPresenceFromJSON; } });
Object.defineProperty(exports, "featureSet_FieldPresenceToJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_FieldPresenceToJSON; } });
Object.defineProperty(exports, "FeatureSet_EnumType", { enumerable: true, get: function () { return descriptor_1.FeatureSet_EnumType; } });
Object.defineProperty(exports, "featureSet_EnumTypeFromJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_EnumTypeFromJSON; } });
Object.defineProperty(exports, "featureSet_EnumTypeToJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_EnumTypeToJSON; } });
Object.defineProperty(exports, "FeatureSet_RepeatedFieldEncoding", { enumerable: true, get: function () { return descriptor_1.FeatureSet_RepeatedFieldEncoding; } });
Object.defineProperty(exports, "featureSet_RepeatedFieldEncodingFromJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_RepeatedFieldEncodingFromJSON; } });
Object.defineProperty(exports, "featureSet_RepeatedFieldEncodingToJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_RepeatedFieldEncodingToJSON; } });
Object.defineProperty(exports, "FeatureSet_Utf8Validation", { enumerable: true, get: function () { return descriptor_1.FeatureSet_Utf8Validation; } });
Object.defineProperty(exports, "featureSet_Utf8ValidationFromJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_Utf8ValidationFromJSON; } });
Object.defineProperty(exports, "featureSet_Utf8ValidationToJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_Utf8ValidationToJSON; } });
Object.defineProperty(exports, "FeatureSet_MessageEncoding", { enumerable: true, get: function () { return descriptor_1.FeatureSet_MessageEncoding; } });
Object.defineProperty(exports, "featureSet_MessageEncodingFromJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_MessageEncodingFromJSON; } });
Object.defineProperty(exports, "featureSet_MessageEncodingToJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_MessageEncodingToJSON; } });
Object.defineProperty(exports, "FeatureSet_JsonFormat", { enumerable: true, get: function () { return descriptor_1.FeatureSet_JsonFormat; } });
Object.defineProperty(exports, "featureSet_JsonFormatFromJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_JsonFormatFromJSON; } });
Object.defineProperty(exports, "featureSet_JsonFormatToJSON", { enumerable: true, get: function () { return descriptor_1.featureSet_JsonFormatToJSON; } });
Object.defineProperty(exports, "FeatureSetDefaults", { enumerable: true, get: function () { return descriptor_1.FeatureSetDefaults; } });
Object.defineProperty(exports, "FeatureSetDefaults_FeatureSetEditionDefault", { enumerable: true, get: function () { return descriptor_1.FeatureSetDefaults_FeatureSetEditionDefault; } });
Object.defineProperty(exports, "SourceCodeInfo", { enumerable: true, get: function () { return descriptor_1.SourceCodeInfo; } });
Object.defineProperty(exports, "SourceCodeInfo_Location", { enumerable: true, get: function () { return descriptor_1.SourceCodeInfo_Location; } });
Object.defineProperty(exports, "GeneratedCodeInfo", { enumerable: true, get: function () { return descriptor_1.GeneratedCodeInfo; } });
Object.defineProperty(exports, "GeneratedCodeInfo_Annotation", { enumerable: true, get: function () { return descriptor_1.GeneratedCodeInfo_Annotation; } });
Object.defineProperty(exports, "GeneratedCodeInfo_Annotation_Semantic", { enumerable: true, get: function () { return descriptor_1.GeneratedCodeInfo_Annotation_Semantic; } });
Object.defineProperty(exports, "generatedCodeInfo_Annotation_SemanticFromJSON", { enumerable: true, get: function () { return descriptor_1.generatedCodeInfo_Annotation_SemanticFromJSON; } });
Object.defineProperty(exports, "generatedCodeInfo_Annotation_SemanticToJSON", { enumerable: true, get: function () { return descriptor_1.generatedCodeInfo_Annotation_SemanticToJSON; } });
var common_1 = require("./generated/common");
Object.defineProperty(exports, "InstrumentType", { enumerable: true, get: function () { return common_1.InstrumentType; } });
Object.defineProperty(exports, "instrumentTypeFromJSON", { enumerable: true, get: function () { return common_1.instrumentTypeFromJSON; } });
Object.defineProperty(exports, "instrumentTypeToJSON", { enumerable: true, get: function () { return common_1.instrumentTypeToJSON; } });
Object.defineProperty(exports, "SecurityTradingStatus", { enumerable: true, get: function () { return common_1.SecurityTradingStatus; } });
Object.defineProperty(exports, "securityTradingStatusFromJSON", { enumerable: true, get: function () { return common_1.securityTradingStatusFromJSON; } });
Object.defineProperty(exports, "securityTradingStatusToJSON", { enumerable: true, get: function () { return common_1.securityTradingStatusToJSON; } });
Object.defineProperty(exports, "MoneyValue", { enumerable: true, get: function () { return common_1.MoneyValue; } });
Object.defineProperty(exports, "Quotation", { enumerable: true, get: function () { return common_1.Quotation; } });
Object.defineProperty(exports, "Ping", { enumerable: true, get: function () { return common_1.Ping; } });
var instruments_2 = require("./generated/instruments");
Object.defineProperty(exports, "CouponType", { enumerable: true, get: function () { return instruments_2.CouponType; } });
Object.defineProperty(exports, "couponTypeFromJSON", { enumerable: true, get: function () { return instruments_2.couponTypeFromJSON; } });
Object.defineProperty(exports, "couponTypeToJSON", { enumerable: true, get: function () { return instruments_2.couponTypeToJSON; } });
Object.defineProperty(exports, "OptionDirection", { enumerable: true, get: function () { return instruments_2.OptionDirection; } });
Object.defineProperty(exports, "optionDirectionFromJSON", { enumerable: true, get: function () { return instruments_2.optionDirectionFromJSON; } });
Object.defineProperty(exports, "optionDirectionToJSON", { enumerable: true, get: function () { return instruments_2.optionDirectionToJSON; } });
Object.defineProperty(exports, "OptionPaymentType", { enumerable: true, get: function () { return instruments_2.OptionPaymentType; } });
Object.defineProperty(exports, "optionPaymentTypeFromJSON", { enumerable: true, get: function () { return instruments_2.optionPaymentTypeFromJSON; } });
Object.defineProperty(exports, "optionPaymentTypeToJSON", { enumerable: true, get: function () { return instruments_2.optionPaymentTypeToJSON; } });
Object.defineProperty(exports, "OptionStyle", { enumerable: true, get: function () { return instruments_2.OptionStyle; } });
Object.defineProperty(exports, "optionStyleFromJSON", { enumerable: true, get: function () { return instruments_2.optionStyleFromJSON; } });
Object.defineProperty(exports, "optionStyleToJSON", { enumerable: true, get: function () { return instruments_2.optionStyleToJSON; } });
Object.defineProperty(exports, "OptionSettlementType", { enumerable: true, get: function () { return instruments_2.OptionSettlementType; } });
Object.defineProperty(exports, "optionSettlementTypeFromJSON", { enumerable: true, get: function () { return instruments_2.optionSettlementTypeFromJSON; } });
Object.defineProperty(exports, "optionSettlementTypeToJSON", { enumerable: true, get: function () { return instruments_2.optionSettlementTypeToJSON; } });
Object.defineProperty(exports, "InstrumentIdType", { enumerable: true, get: function () { return instruments_2.InstrumentIdType; } });
Object.defineProperty(exports, "instrumentIdTypeFromJSON", { enumerable: true, get: function () { return instruments_2.instrumentIdTypeFromJSON; } });
Object.defineProperty(exports, "instrumentIdTypeToJSON", { enumerable: true, get: function () { return instruments_2.instrumentIdTypeToJSON; } });
Object.defineProperty(exports, "InstrumentStatus", { enumerable: true, get: function () { return instruments_2.InstrumentStatus; } });
Object.defineProperty(exports, "instrumentStatusFromJSON", { enumerable: true, get: function () { return instruments_2.instrumentStatusFromJSON; } });
Object.defineProperty(exports, "instrumentStatusToJSON", { enumerable: true, get: function () { return instruments_2.instrumentStatusToJSON; } });
Object.defineProperty(exports, "ShareType", { enumerable: true, get: function () { return instruments_2.ShareType; } });
Object.defineProperty(exports, "shareTypeFromJSON", { enumerable: true, get: function () { return instruments_2.shareTypeFromJSON; } });
Object.defineProperty(exports, "shareTypeToJSON", { enumerable: true, get: function () { return instruments_2.shareTypeToJSON; } });
Object.defineProperty(exports, "AssetType", { enumerable: true, get: function () { return instruments_2.AssetType; } });
Object.defineProperty(exports, "assetTypeFromJSON", { enumerable: true, get: function () { return instruments_2.assetTypeFromJSON; } });
Object.defineProperty(exports, "assetTypeToJSON", { enumerable: true, get: function () { return instruments_2.assetTypeToJSON; } });
Object.defineProperty(exports, "StructuredProductType", { enumerable: true, get: function () { return instruments_2.StructuredProductType; } });
Object.defineProperty(exports, "structuredProductTypeFromJSON", { enumerable: true, get: function () { return instruments_2.structuredProductTypeFromJSON; } });
Object.defineProperty(exports, "structuredProductTypeToJSON", { enumerable: true, get: function () { return instruments_2.structuredProductTypeToJSON; } });
Object.defineProperty(exports, "EditFavoritesActionType", { enumerable: true, get: function () { return instruments_2.EditFavoritesActionType; } });
Object.defineProperty(exports, "editFavoritesActionTypeFromJSON", { enumerable: true, get: function () { return instruments_2.editFavoritesActionTypeFromJSON; } });
Object.defineProperty(exports, "editFavoritesActionTypeToJSON", { enumerable: true, get: function () { return instruments_2.editFavoritesActionTypeToJSON; } });
Object.defineProperty(exports, "RealExchange", { enumerable: true, get: function () { return instruments_2.RealExchange; } });
Object.defineProperty(exports, "realExchangeFromJSON", { enumerable: true, get: function () { return instruments_2.realExchangeFromJSON; } });
Object.defineProperty(exports, "realExchangeToJSON", { enumerable: true, get: function () { return instruments_2.realExchangeToJSON; } });
Object.defineProperty(exports, "RiskLevel", { enumerable: true, get: function () { return instruments_2.RiskLevel; } });
Object.defineProperty(exports, "riskLevelFromJSON", { enumerable: true, get: function () { return instruments_2.riskLevelFromJSON; } });
Object.defineProperty(exports, "riskLevelToJSON", { enumerable: true, get: function () { return instruments_2.riskLevelToJSON; } });
Object.defineProperty(exports, "TradingSchedulesRequest", { enumerable: true, get: function () { return instruments_2.TradingSchedulesRequest; } });
Object.defineProperty(exports, "TradingSchedulesResponse", { enumerable: true, get: function () { return instruments_2.TradingSchedulesResponse; } });
Object.defineProperty(exports, "TradingSchedule", { enumerable: true, get: function () { return instruments_2.TradingSchedule; } });
Object.defineProperty(exports, "TradingDay", { enumerable: true, get: function () { return instruments_2.TradingDay; } });
Object.defineProperty(exports, "InstrumentRequest", { enumerable: true, get: function () { return instruments_2.InstrumentRequest; } });
Object.defineProperty(exports, "InstrumentsRequest", { enumerable: true, get: function () { return instruments_2.InstrumentsRequest; } });
Object.defineProperty(exports, "FilterOptionsRequest", { enumerable: true, get: function () { return instruments_2.FilterOptionsRequest; } });
Object.defineProperty(exports, "BondResponse", { enumerable: true, get: function () { return instruments_2.BondResponse; } });
Object.defineProperty(exports, "BondsResponse", { enumerable: true, get: function () { return instruments_2.BondsResponse; } });
Object.defineProperty(exports, "GetBondCouponsRequest", { enumerable: true, get: function () { return instruments_2.GetBondCouponsRequest; } });
Object.defineProperty(exports, "GetBondCouponsResponse", { enumerable: true, get: function () { return instruments_2.GetBondCouponsResponse; } });
Object.defineProperty(exports, "Coupon", { enumerable: true, get: function () { return instruments_2.Coupon; } });
Object.defineProperty(exports, "CurrencyResponse", { enumerable: true, get: function () { return instruments_2.CurrencyResponse; } });
Object.defineProperty(exports, "CurrenciesResponse", { enumerable: true, get: function () { return instruments_2.CurrenciesResponse; } });
Object.defineProperty(exports, "EtfResponse", { enumerable: true, get: function () { return instruments_2.EtfResponse; } });
Object.defineProperty(exports, "EtfsResponse", { enumerable: true, get: function () { return instruments_2.EtfsResponse; } });
Object.defineProperty(exports, "FutureResponse", { enumerable: true, get: function () { return instruments_2.FutureResponse; } });
Object.defineProperty(exports, "FuturesResponse", { enumerable: true, get: function () { return instruments_2.FuturesResponse; } });
Object.defineProperty(exports, "OptionResponse", { enumerable: true, get: function () { return instruments_2.OptionResponse; } });
Object.defineProperty(exports, "OptionsResponse", { enumerable: true, get: function () { return instruments_2.OptionsResponse; } });
Object.defineProperty(exports, "Option", { enumerable: true, get: function () { return instruments_2.Option; } });
Object.defineProperty(exports, "ShareResponse", { enumerable: true, get: function () { return instruments_2.ShareResponse; } });
Object.defineProperty(exports, "SharesResponse", { enumerable: true, get: function () { return instruments_2.SharesResponse; } });
Object.defineProperty(exports, "Bond", { enumerable: true, get: function () { return instruments_2.Bond; } });
Object.defineProperty(exports, "Currency", { enumerable: true, get: function () { return instruments_2.Currency; } });
Object.defineProperty(exports, "Etf", { enumerable: true, get: function () { return instruments_2.Etf; } });
Object.defineProperty(exports, "Future", { enumerable: true, get: function () { return instruments_2.Future; } });
Object.defineProperty(exports, "Share", { enumerable: true, get: function () { return instruments_2.Share; } });
Object.defineProperty(exports, "GetAccruedInterestsRequest", { enumerable: true, get: function () { return instruments_2.GetAccruedInterestsRequest; } });
Object.defineProperty(exports, "GetAccruedInterestsResponse", { enumerable: true, get: function () { return instruments_2.GetAccruedInterestsResponse; } });
Object.defineProperty(exports, "AccruedInterest", { enumerable: true, get: function () { return instruments_2.AccruedInterest; } });
Object.defineProperty(exports, "GetFuturesMarginRequest", { enumerable: true, get: function () { return instruments_2.GetFuturesMarginRequest; } });
Object.defineProperty(exports, "GetFuturesMarginResponse", { enumerable: true, get: function () { return instruments_2.GetFuturesMarginResponse; } });
Object.defineProperty(exports, "InstrumentResponse", { enumerable: true, get: function () { return instruments_2.InstrumentResponse; } });
Object.defineProperty(exports, "Instrument", { enumerable: true, get: function () { return instruments_2.Instrument; } });
Object.defineProperty(exports, "GetDividendsRequest", { enumerable: true, get: function () { return instruments_2.GetDividendsRequest; } });
Object.defineProperty(exports, "GetDividendsResponse", { enumerable: true, get: function () { return instruments_2.GetDividendsResponse; } });
Object.defineProperty(exports, "Dividend", { enumerable: true, get: function () { return instruments_2.Dividend; } });
Object.defineProperty(exports, "AssetRequest", { enumerable: true, get: function () { return instruments_2.AssetRequest; } });
Object.defineProperty(exports, "AssetResponse", { enumerable: true, get: function () { return instruments_2.AssetResponse; } });
Object.defineProperty(exports, "AssetsRequest", { enumerable: true, get: function () { return instruments_2.AssetsRequest; } });
Object.defineProperty(exports, "AssetsResponse", { enumerable: true, get: function () { return instruments_2.AssetsResponse; } });
Object.defineProperty(exports, "AssetFull", { enumerable: true, get: function () { return instruments_2.AssetFull; } });
Object.defineProperty(exports, "Asset", { enumerable: true, get: function () { return instruments_2.Asset; } });
Object.defineProperty(exports, "AssetCurrency", { enumerable: true, get: function () { return instruments_2.AssetCurrency; } });
Object.defineProperty(exports, "AssetSecurity", { enumerable: true, get: function () { return instruments_2.AssetSecurity; } });
Object.defineProperty(exports, "AssetShare", { enumerable: true, get: function () { return instruments_2.AssetShare; } });
Object.defineProperty(exports, "AssetBond", { enumerable: true, get: function () { return instruments_2.AssetBond; } });
Object.defineProperty(exports, "AssetStructuredProduct", { enumerable: true, get: function () { return instruments_2.AssetStructuredProduct; } });
Object.defineProperty(exports, "AssetEtf", { enumerable: true, get: function () { return instruments_2.AssetEtf; } });
Object.defineProperty(exports, "AssetClearingCertificate", { enumerable: true, get: function () { return instruments_2.AssetClearingCertificate; } });
Object.defineProperty(exports, "Brand", { enumerable: true, get: function () { return instruments_2.Brand; } });
Object.defineProperty(exports, "AssetInstrument", { enumerable: true, get: function () { return instruments_2.AssetInstrument; } });
Object.defineProperty(exports, "InstrumentLink", { enumerable: true, get: function () { return instruments_2.InstrumentLink; } });
Object.defineProperty(exports, "GetFavoritesRequest", { enumerable: true, get: function () { return instruments_2.GetFavoritesRequest; } });
Object.defineProperty(exports, "GetFavoritesResponse", { enumerable: true, get: function () { return instruments_2.GetFavoritesResponse; } });
Object.defineProperty(exports, "FavoriteInstrument", { enumerable: true, get: function () { return instruments_2.FavoriteInstrument; } });
Object.defineProperty(exports, "EditFavoritesRequest", { enumerable: true, get: function () { return instruments_2.EditFavoritesRequest; } });
Object.defineProperty(exports, "EditFavoritesRequestInstrument", { enumerable: true, get: function () { return instruments_2.EditFavoritesRequestInstrument; } });
Object.defineProperty(exports, "EditFavoritesResponse", { enumerable: true, get: function () { return instruments_2.EditFavoritesResponse; } });
Object.defineProperty(exports, "GetCountriesRequest", { enumerable: true, get: function () { return instruments_2.GetCountriesRequest; } });
Object.defineProperty(exports, "GetCountriesResponse", { enumerable: true, get: function () { return instruments_2.GetCountriesResponse; } });
Object.defineProperty(exports, "CountryResponse", { enumerable: true, get: function () { return instruments_2.CountryResponse; } });
Object.defineProperty(exports, "FindInstrumentRequest", { enumerable: true, get: function () { return instruments_2.FindInstrumentRequest; } });
Object.defineProperty(exports, "FindInstrumentResponse", { enumerable: true, get: function () { return instruments_2.FindInstrumentResponse; } });
Object.defineProperty(exports, "InstrumentShort", { enumerable: true, get: function () { return instruments_2.InstrumentShort; } });
Object.defineProperty(exports, "GetBrandsRequest", { enumerable: true, get: function () { return instruments_2.GetBrandsRequest; } });
Object.defineProperty(exports, "GetBrandRequest", { enumerable: true, get: function () { return instruments_2.GetBrandRequest; } });
Object.defineProperty(exports, "GetBrandsResponse", { enumerable: true, get: function () { return instruments_2.GetBrandsResponse; } });
Object.defineProperty(exports, "InstrumentsServiceDefinition", { enumerable: true, get: function () { return instruments_2.InstrumentsServiceDefinition; } });
var marketdata_2 = require("./generated/marketdata");
Object.defineProperty(exports, "SubscriptionAction", { enumerable: true, get: function () { return marketdata_2.SubscriptionAction; } });
Object.defineProperty(exports, "subscriptionActionFromJSON", { enumerable: true, get: function () { return marketdata_2.subscriptionActionFromJSON; } });
Object.defineProperty(exports, "subscriptionActionToJSON", { enumerable: true, get: function () { return marketdata_2.subscriptionActionToJSON; } });
Object.defineProperty(exports, "SubscriptionInterval", { enumerable: true, get: function () { return marketdata_2.SubscriptionInterval; } });
Object.defineProperty(exports, "subscriptionIntervalFromJSON", { enumerable: true, get: function () { return marketdata_2.subscriptionIntervalFromJSON; } });
Object.defineProperty(exports, "subscriptionIntervalToJSON", { enumerable: true, get: function () { return marketdata_2.subscriptionIntervalToJSON; } });
Object.defineProperty(exports, "SubscriptionStatus", { enumerable: true, get: function () { return marketdata_2.SubscriptionStatus; } });
Object.defineProperty(exports, "subscriptionStatusFromJSON", { enumerable: true, get: function () { return marketdata_2.subscriptionStatusFromJSON; } });
Object.defineProperty(exports, "subscriptionStatusToJSON", { enumerable: true, get: function () { return marketdata_2.subscriptionStatusToJSON; } });
Object.defineProperty(exports, "TradeDirection", { enumerable: true, get: function () { return marketdata_2.TradeDirection; } });
Object.defineProperty(exports, "tradeDirectionFromJSON", { enumerable: true, get: function () { return marketdata_2.tradeDirectionFromJSON; } });
Object.defineProperty(exports, "tradeDirectionToJSON", { enumerable: true, get: function () { return marketdata_2.tradeDirectionToJSON; } });
Object.defineProperty(exports, "CandleInterval", { enumerable: true, get: function () { return marketdata_2.CandleInterval; } });
Object.defineProperty(exports, "candleIntervalFromJSON", { enumerable: true, get: function () { return marketdata_2.candleIntervalFromJSON; } });
Object.defineProperty(exports, "candleIntervalToJSON", { enumerable: true, get: function () { return marketdata_2.candleIntervalToJSON; } });
Object.defineProperty(exports, "MarketDataRequest", { enumerable: true, get: function () { return marketdata_2.MarketDataRequest; } });
Object.defineProperty(exports, "MarketDataServerSideStreamRequest", { enumerable: true, get: function () { return marketdata_2.MarketDataServerSideStreamRequest; } });
Object.defineProperty(exports, "MarketDataResponse", { enumerable: true, get: function () { return marketdata_2.MarketDataResponse; } });
Object.defineProperty(exports, "SubscribeCandlesRequest", { enumerable: true, get: function () { return marketdata_2.SubscribeCandlesRequest; } });
Object.defineProperty(exports, "CandleInstrument", { enumerable: true, get: function () { return marketdata_2.CandleInstrument; } });
Object.defineProperty(exports, "SubscribeCandlesResponse", { enumerable: true, get: function () { return marketdata_2.SubscribeCandlesResponse; } });
Object.defineProperty(exports, "CandleSubscription", { enumerable: true, get: function () { return marketdata_2.CandleSubscription; } });
Object.defineProperty(exports, "SubscribeOrderBookRequest", { enumerable: true, get: function () { return marketdata_2.SubscribeOrderBookRequest; } });
Object.defineProperty(exports, "OrderBookInstrument", { enumerable: true, get: function () { return marketdata_2.OrderBookInstrument; } });
Object.defineProperty(exports, "SubscribeOrderBookResponse", { enumerable: true, get: function () { return marketdata_2.SubscribeOrderBookResponse; } });
Object.defineProperty(exports, "OrderBookSubscription", { enumerable: true, get: function () { return marketdata_2.OrderBookSubscription; } });
Object.defineProperty(exports, "SubscribeTradesRequest", { enumerable: true, get: function () { return marketdata_2.SubscribeTradesRequest; } });
Object.defineProperty(exports, "TradeInstrument", { enumerable: true, get: function () { return marketdata_2.TradeInstrument; } });
Object.defineProperty(exports, "SubscribeTradesResponse", { enumerable: true, get: function () { return marketdata_2.SubscribeTradesResponse; } });
Object.defineProperty(exports, "TradeSubscription", { enumerable: true, get: function () { return marketdata_2.TradeSubscription; } });
Object.defineProperty(exports, "SubscribeInfoRequest", { enumerable: true, get: function () { return marketdata_2.SubscribeInfoRequest; } });
Object.defineProperty(exports, "InfoInstrument", { enumerable: true, get: function () { return marketdata_2.InfoInstrument; } });
Object.defineProperty(exports, "SubscribeInfoResponse", { enumerable: true, get: function () { return marketdata_2.SubscribeInfoResponse; } });
Object.defineProperty(exports, "InfoSubscription", { enumerable: true, get: function () { return marketdata_2.InfoSubscription; } });
Object.defineProperty(exports, "SubscribeLastPriceRequest", { enumerable: true, get: function () { return marketdata_2.SubscribeLastPriceRequest; } });
Object.defineProperty(exports, "LastPriceInstrument", { enumerable: true, get: function () { return marketdata_2.LastPriceInstrument; } });
Object.defineProperty(exports, "SubscribeLastPriceResponse", { enumerable: true, get: function () { return marketdata_2.SubscribeLastPriceResponse; } });
Object.defineProperty(exports, "LastPriceSubscription", { enumerable: true, get: function () { return marketdata_2.LastPriceSubscription; } });
Object.defineProperty(exports, "Candle", { enumerable: true, get: function () { return marketdata_2.Candle; } });
Object.defineProperty(exports, "OrderBook", { enumerable: true, get: function () { return marketdata_2.OrderBook; } });
Object.defineProperty(exports, "Order", { enumerable: true, get: function () { return marketdata_2.Order; } });
Object.defineProperty(exports, "Trade", { enumerable: true, get: function () { return marketdata_2.Trade; } });
Object.defineProperty(exports, "TradingStatus", { enumerable: true, get: function () { return marketdata_2.TradingStatus; } });
Object.defineProperty(exports, "GetCandlesRequest", { enumerable: true, get: function () { return marketdata_2.GetCandlesRequest; } });
Object.defineProperty(exports, "GetCandlesResponse", { enumerable: true, get: function () { return marketdata_2.GetCandlesResponse; } });
Object.defineProperty(exports, "HistoricCandle", { enumerable: true, get: function () { return marketdata_2.HistoricCandle; } });
Object.defineProperty(exports, "GetLastPricesRequest", { enumerable: true, get: function () { return marketdata_2.GetLastPricesRequest; } });
Object.defineProperty(exports, "GetLastPricesResponse", { enumerable: true, get: function () { return marketdata_2.GetLastPricesResponse; } });
Object.defineProperty(exports, "LastPrice", { enumerable: true, get: function () { return marketdata_2.LastPrice; } });
Object.defineProperty(exports, "GetOrderBookRequest", { enumerable: true, get: function () { return marketdata_2.GetOrderBookRequest; } });
Object.defineProperty(exports, "GetOrderBookResponse", { enumerable: true, get: function () { return marketdata_2.GetOrderBookResponse; } });
Object.defineProperty(exports, "GetTradingStatusRequest", { enumerable: true, get: function () { return marketdata_2.GetTradingStatusRequest; } });
Object.defineProperty(exports, "GetTradingStatusesRequest", { enumerable: true, get: function () { return marketdata_2.GetTradingStatusesRequest; } });
Object.defineProperty(exports, "GetTradingStatusesResponse", { enumerable: true, get: function () { return marketdata_2.GetTradingStatusesResponse; } });
Object.defineProperty(exports, "GetTradingStatusResponse", { enumerable: true, get: function () { return marketdata_2.GetTradingStatusResponse; } });
Object.defineProperty(exports, "GetLastTradesRequest", { enumerable: true, get: function () { return marketdata_2.GetLastTradesRequest; } });
Object.defineProperty(exports, "GetLastTradesResponse", { enumerable: true, get: function () { return marketdata_2.GetLastTradesResponse; } });
Object.defineProperty(exports, "GetMySubscriptions", { enumerable: true, get: function () { return marketdata_2.GetMySubscriptions; } });
Object.defineProperty(exports, "GetClosePricesRequest", { enumerable: true, get: function () { return marketdata_2.GetClosePricesRequest; } });
Object.defineProperty(exports, "InstrumentClosePriceRequest", { enumerable: true, get: function () { return marketdata_2.InstrumentClosePriceRequest; } });
Object.defineProperty(exports, "GetClosePricesResponse", { enumerable: true, get: function () { return marketdata_2.GetClosePricesResponse; } });
Object.defineProperty(exports, "InstrumentClosePriceResponse", { enumerable: true, get: function () { return marketdata_2.InstrumentClosePriceResponse; } });
Object.defineProperty(exports, "MarketDataServiceDefinition", { enumerable: true, get: function () { return marketdata_2.MarketDataServiceDefinition; } });
Object.defineProperty(exports, "MarketDataStreamServiceDefinition", { enumerable: true, get: function () { return marketdata_2.MarketDataStreamServiceDefinition; } });
var operations_2 = require("./generated/operations");
Object.defineProperty(exports, "OperationState", { enumerable: true, get: function () { return operations_2.OperationState; } });
Object.defineProperty(exports, "operationStateFromJSON", { enumerable: true, get: function () { return operations_2.operationStateFromJSON; } });
Object.defineProperty(exports, "operationStateToJSON", { enumerable: true, get: function () { return operations_2.operationStateToJSON; } });
Object.defineProperty(exports, "OperationType", { enumerable: true, get: function () { return operations_2.OperationType; } });
Object.defineProperty(exports, "operationTypeFromJSON", { enumerable: true, get: function () { return operations_2.operationTypeFromJSON; } });
Object.defineProperty(exports, "operationTypeToJSON", { enumerable: true, get: function () { return operations_2.operationTypeToJSON; } });
Object.defineProperty(exports, "PortfolioSubscriptionStatus", { enumerable: true, get: function () { return operations_2.PortfolioSubscriptionStatus; } });
Object.defineProperty(exports, "portfolioSubscriptionStatusFromJSON", { enumerable: true, get: function () { return operations_2.portfolioSubscriptionStatusFromJSON; } });
Object.defineProperty(exports, "portfolioSubscriptionStatusToJSON", { enumerable: true, get: function () { return operations_2.portfolioSubscriptionStatusToJSON; } });
Object.defineProperty(exports, "PositionsAccountSubscriptionStatus", { enumerable: true, get: function () { return operations_2.PositionsAccountSubscriptionStatus; } });
Object.defineProperty(exports, "positionsAccountSubscriptionStatusFromJSON", { enumerable: true, get: function () { return operations_2.positionsAccountSubscriptionStatusFromJSON; } });
Object.defineProperty(exports, "positionsAccountSubscriptionStatusToJSON", { enumerable: true, get: function () { return operations_2.positionsAccountSubscriptionStatusToJSON; } });
Object.defineProperty(exports, "PortfolioRequest_CurrencyRequest", { enumerable: true, get: function () { return operations_2.PortfolioRequest_CurrencyRequest; } });
Object.defineProperty(exports, "portfolioRequest_CurrencyRequestFromJSON", { enumerable: true, get: function () { return operations_2.portfolioRequest_CurrencyRequestFromJSON; } });
Object.defineProperty(exports, "portfolioRequest_CurrencyRequestToJSON", { enumerable: true, get: function () { return operations_2.portfolioRequest_CurrencyRequestToJSON; } });
Object.defineProperty(exports, "OperationsRequest", { enumerable: true, get: function () { return operations_2.OperationsRequest; } });
Object.defineProperty(exports, "OperationsResponse", { enumerable: true, get: function () { return operations_2.OperationsResponse; } });
Object.defineProperty(exports, "Operation", { enumerable: true, get: function () { return operations_2.Operation; } });
Object.defineProperty(exports, "OperationTrade", { enumerable: true, get: function () { return operations_2.OperationTrade; } });
Object.defineProperty(exports, "PortfolioRequest", { enumerable: true, get: function () { return operations_2.PortfolioRequest; } });
Object.defineProperty(exports, "PortfolioResponse", { enumerable: true, get: function () { return operations_2.PortfolioResponse; } });
Object.defineProperty(exports, "PositionsRequest", { enumerable: true, get: function () { return operations_2.PositionsRequest; } });
Object.defineProperty(exports, "PositionsResponse", { enumerable: true, get: function () { return operations_2.PositionsResponse; } });
Object.defineProperty(exports, "WithdrawLimitsRequest", { enumerable: true, get: function () { return operations_2.WithdrawLimitsRequest; } });
Object.defineProperty(exports, "WithdrawLimitsResponse", { enumerable: true, get: function () { return operations_2.WithdrawLimitsResponse; } });
Object.defineProperty(exports, "PortfolioPosition", { enumerable: true, get: function () { return operations_2.PortfolioPosition; } });
Object.defineProperty(exports, "VirtualPortfolioPosition", { enumerable: true, get: function () { return operations_2.VirtualPortfolioPosition; } });
Object.defineProperty(exports, "PositionsSecurities", { enumerable: true, get: function () { return operations_2.PositionsSecurities; } });
Object.defineProperty(exports, "PositionsFutures", { enumerable: true, get: function () { return operations_2.PositionsFutures; } });
Object.defineProperty(exports, "PositionsOptions", { enumerable: true, get: function () { return operations_2.PositionsOptions; } });
Object.defineProperty(exports, "BrokerReportRequest", { enumerable: true, get: function () { return operations_2.BrokerReportRequest; } });
Object.defineProperty(exports, "BrokerReportResponse", { enumerable: true, get: function () { return operations_2.BrokerReportResponse; } });
Object.defineProperty(exports, "GenerateBrokerReportRequest", { enumerable: true, get: function () { return operations_2.GenerateBrokerReportRequest; } });
Object.defineProperty(exports, "GenerateBrokerReportResponse", { enumerable: true, get: function () { return operations_2.GenerateBrokerReportResponse; } });
Object.defineProperty(exports, "GetBrokerReportRequest", { enumerable: true, get: function () { return operations_2.GetBrokerReportRequest; } });
Object.defineProperty(exports, "GetBrokerReportResponse", { enumerable: true, get: function () { return operations_2.GetBrokerReportResponse; } });
Object.defineProperty(exports, "BrokerReport", { enumerable: true, get: function () { return operations_2.BrokerReport; } });
Object.defineProperty(exports, "GetDividendsForeignIssuerRequest", { enumerable: true, get: function () { return operations_2.GetDividendsForeignIssuerRequest; } });
Object.defineProperty(exports, "GetDividendsForeignIssuerResponse", { enumerable: true, get: function () { return operations_2.GetDividendsForeignIssuerResponse; } });
Object.defineProperty(exports, "GenerateDividendsForeignIssuerReportRequest", { enumerable: true, get: function () { return operations_2.GenerateDividendsForeignIssuerReportRequest; } });
Object.defineProperty(exports, "GetDividendsForeignIssuerReportRequest", { enumerable: true, get: function () { return operations_2.GetDividendsForeignIssuerReportRequest; } });
Object.defineProperty(exports, "GenerateDividendsForeignIssuerReportResponse", { enumerable: true, get: function () { return operations_2.GenerateDividendsForeignIssuerReportResponse; } });
Object.defineProperty(exports, "GetDividendsForeignIssuerReportResponse", { enumerable: true, get: function () { return operations_2.GetDividendsForeignIssuerReportResponse; } });
Object.defineProperty(exports, "DividendsForeignIssuerReport", { enumerable: true, get: function () { return operations_2.DividendsForeignIssuerReport; } });
Object.defineProperty(exports, "PortfolioStreamRequest", { enumerable: true, get: function () { return operations_2.PortfolioStreamRequest; } });
Object.defineProperty(exports, "PortfolioStreamResponse", { enumerable: true, get: function () { return operations_2.PortfolioStreamResponse; } });
Object.defineProperty(exports, "PortfolioSubscriptionResult", { enumerable: true, get: function () { return operations_2.PortfolioSubscriptionResult; } });
Object.defineProperty(exports, "AccountSubscriptionStatus", { enumerable: true, get: function () { return operations_2.AccountSubscriptionStatus; } });
Object.defineProperty(exports, "GetOperationsByCursorRequest", { enumerable: true, get: function () { return operations_2.GetOperationsByCursorRequest; } });
Object.defineProperty(exports, "GetOperationsByCursorResponse", { enumerable: true, get: function () { return operations_2.GetOperationsByCursorResponse; } });
Object.defineProperty(exports, "OperationItem", { enumerable: true, get: function () { return operations_2.OperationItem; } });
Object.defineProperty(exports, "OperationItemTrades", { enumerable: true, get: function () { return operations_2.OperationItemTrades; } });
Object.defineProperty(exports, "OperationItemTrade", { enumerable: true, get: function () { return operations_2.OperationItemTrade; } });
Object.defineProperty(exports, "PositionsStreamRequest", { enumerable: true, get: function () { return operations_2.PositionsStreamRequest; } });
Object.defineProperty(exports, "PositionsStreamResponse", { enumerable: true, get: function () { return operations_2.PositionsStreamResponse; } });
Object.defineProperty(exports, "PositionsSubscriptionResult", { enumerable: true, get: function () { return operations_2.PositionsSubscriptionResult; } });
Object.defineProperty(exports, "PositionsSubscriptionStatus", { enumerable: true, get: function () { return operations_2.PositionsSubscriptionStatus; } });
Object.defineProperty(exports, "PositionData", { enumerable: true, get: function () { return operations_2.PositionData; } });
Object.defineProperty(exports, "PositionsMoney", { enumerable: true, get: function () { return operations_2.PositionsMoney; } });
Object.defineProperty(exports, "OperationsServiceDefinition", { enumerable: true, get: function () { return operations_2.OperationsServiceDefinition; } });
Object.defineProperty(exports, "OperationsStreamServiceDefinition", { enumerable: true, get: function () { return operations_2.OperationsStreamServiceDefinition; } });
var orders_2 = require("./generated/orders");
Object.defineProperty(exports, "OrderDirection", { enumerable: true, get: function () { return orders_2.OrderDirection; } });
Object.defineProperty(exports, "orderDirectionFromJSON", { enumerable: true, get: function () { return orders_2.orderDirectionFromJSON; } });
Object.defineProperty(exports, "orderDirectionToJSON", { enumerable: true, get: function () { return orders_2.orderDirectionToJSON; } });
Object.defineProperty(exports, "orderTypeFromJSON", { enumerable: true, get: function () { return orders_2.orderTypeFromJSON; } });
Object.defineProperty(exports, "orderTypeToJSON", { enumerable: true, get: function () { return orders_2.orderTypeToJSON; } });
Object.defineProperty(exports, "OrderExecutionReportStatus", { enumerable: true, get: function () { return orders_2.OrderExecutionReportStatus; } });
Object.defineProperty(exports, "orderExecutionReportStatusFromJSON", { enumerable: true, get: function () { return orders_2.orderExecutionReportStatusFromJSON; } });
Object.defineProperty(exports, "orderExecutionReportStatusToJSON", { enumerable: true, get: function () { return orders_2.orderExecutionReportStatusToJSON; } });
Object.defineProperty(exports, "priceTypeFromJSON", { enumerable: true, get: function () { return orders_2.priceTypeFromJSON; } });
Object.defineProperty(exports, "priceTypeToJSON", { enumerable: true, get: function () { return orders_2.priceTypeToJSON; } });
Object.defineProperty(exports, "TradesStreamRequest", { enumerable: true, get: function () { return orders_2.TradesStreamRequest; } });
Object.defineProperty(exports, "TradesStreamResponse", { enumerable: true, get: function () { return orders_2.TradesStreamResponse; } });
Object.defineProperty(exports, "OrderTrades", { enumerable: true, get: function () { return orders_2.OrderTrades; } });
Object.defineProperty(exports, "OrderTrade", { enumerable: true, get: function () { return orders_2.OrderTrade; } });
Object.defineProperty(exports, "PostOrderRequest", { enumerable: true, get: function () { return orders_2.PostOrderRequest; } });
Object.defineProperty(exports, "PostOrderResponse", { enumerable: true, get: function () { return orders_2.PostOrderResponse; } });
Object.defineProperty(exports, "CancelOrderRequest", { enumerable: true, get: function () { return orders_2.CancelOrderRequest; } });
Object.defineProperty(exports, "CancelOrderResponse", { enumerable: true, get: function () { return orders_2.CancelOrderResponse; } });
Object.defineProperty(exports, "GetOrderStateRequest", { enumerable: true, get: function () { return orders_2.GetOrderStateRequest; } });
Object.defineProperty(exports, "GetOrdersRequest", { enumerable: true, get: function () { return orders_2.GetOrdersRequest; } });
Object.defineProperty(exports, "GetOrdersResponse", { enumerable: true, get: function () { return orders_2.GetOrdersResponse; } });
Object.defineProperty(exports, "OrderState", { enumerable: true, get: function () { return orders_2.OrderState; } });
Object.defineProperty(exports, "OrderStage", { enumerable: true, get: function () { return orders_2.OrderStage; } });
Object.defineProperty(exports, "ReplaceOrderRequest", { enumerable: true, get: function () { return orders_2.ReplaceOrderRequest; } });
Object.defineProperty(exports, "OrdersStreamServiceDefinition", { enumerable: true, get: function () { return orders_2.OrdersStreamServiceDefinition; } });
Object.defineProperty(exports, "OrdersServiceDefinition", { enumerable: true, get: function () { return orders_2.OrdersServiceDefinition; } });
var sandbox_2 = require("./generated/sandbox");
Object.defineProperty(exports, "OpenSandboxAccountRequest", { enumerable: true, get: function () { return sandbox_2.OpenSandboxAccountRequest; } });
Object.defineProperty(exports, "OpenSandboxAccountResponse", { enumerable: true, get: function () { return sandbox_2.OpenSandboxAccountResponse; } });
Object.defineProperty(exports, "CloseSandboxAccountRequest", { enumerable: true, get: function () { return sandbox_2.CloseSandboxAccountRequest; } });
Object.defineProperty(exports, "CloseSandboxAccountResponse", { enumerable: true, get: function () { return sandbox_2.CloseSandboxAccountResponse; } });
Object.defineProperty(exports, "SandboxPayInRequest", { enumerable: true, get: function () { return sandbox_2.SandboxPayInRequest; } });
Object.defineProperty(exports, "SandboxPayInResponse", { enumerable: true, get: function () { return sandbox_2.SandboxPayInResponse; } });
Object.defineProperty(exports, "SandboxServiceDefinition", { enumerable: true, get: function () { return sandbox_2.SandboxServiceDefinition; } });
var stoporders_2 = require("./generated/stoporders");
Object.defineProperty(exports, "StopOrderDirection", { enumerable: true, get: function () { return stoporders_2.StopOrderDirection; } });
Object.defineProperty(exports, "stopOrderDirectionFromJSON", { enumerable: true, get: function () { return stoporders_2.stopOrderDirectionFromJSON; } });
Object.defineProperty(exports, "stopOrderDirectionToJSON", { enumerable: true, get: function () { return stoporders_2.stopOrderDirectionToJSON; } });
Object.defineProperty(exports, "StopOrderExpirationType", { enumerable: true, get: function () { return stoporders_2.StopOrderExpirationType; } });
Object.defineProperty(exports, "stopOrderExpirationTypeFromJSON", { enumerable: true, get: function () { return stoporders_2.stopOrderExpirationTypeFromJSON; } });
Object.defineProperty(exports, "stopOrderExpirationTypeToJSON", { enumerable: true, get: function () { return stoporders_2.stopOrderExpirationTypeToJSON; } });
Object.defineProperty(exports, "StopOrderType", { enumerable: true, get: function () { return stoporders_2.StopOrderType; } });
Object.defineProperty(exports, "stopOrderTypeFromJSON", { enumerable: true, get: function () { return stoporders_2.stopOrderTypeFromJSON; } });
Object.defineProperty(exports, "stopOrderTypeToJSON", { enumerable: true, get: function () { return stoporders_2.stopOrderTypeToJSON; } });
Object.defineProperty(exports, "PostStopOrderRequest", { enumerable: true, get: function () { return stoporders_2.PostStopOrderRequest; } });
Object.defineProperty(exports, "PostStopOrderResponse", { enumerable: true, get: function () { return stoporders_2.PostStopOrderResponse; } });
Object.defineProperty(exports, "GetStopOrdersRequest", { enumerable: true, get: function () { return stoporders_2.GetStopOrdersRequest; } });
Object.defineProperty(exports, "GetStopOrdersResponse", { enumerable: true, get: function () { return stoporders_2.GetStopOrdersResponse; } });
Object.defineProperty(exports, "CancelStopOrderRequest", { enumerable: true, get: function () { return stoporders_2.CancelStopOrderRequest; } });
Object.defineProperty(exports, "CancelStopOrderResponse", { enumerable: true, get: function () { return stoporders_2.CancelStopOrderResponse; } });
Object.defineProperty(exports, "StopOrder", { enumerable: true, get: function () { return stoporders_2.StopOrder; } });
Object.defineProperty(exports, "StopOrdersServiceDefinition", { enumerable: true, get: function () { return stoporders_2.StopOrdersServiceDefinition; } });
var users_2 = require("./generated/users");
Object.defineProperty(exports, "AccountType", { enumerable: true, get: function () { return users_2.AccountType; } });
Object.defineProperty(exports, "accountTypeFromJSON", { enumerable: true, get: function () { return users_2.accountTypeFromJSON; } });
Object.defineProperty(exports, "accountTypeToJSON", { enumerable: true, get: function () { return users_2.accountTypeToJSON; } });
Object.defineProperty(exports, "AccountStatus", { enumerable: true, get: function () { return users_2.AccountStatus; } });
Object.defineProperty(exports, "accountStatusFromJSON", { enumerable: true, get: function () { return users_2.accountStatusFromJSON; } });
Object.defineProperty(exports, "accountStatusToJSON", { enumerable: true, get: function () { return users_2.accountStatusToJSON; } });
Object.defineProperty(exports, "AccessLevel", { enumerable: true, get: function () { return users_2.AccessLevel; } });
Object.defineProperty(exports, "accessLevelFromJSON", { enumerable: true, get: function () { return users_2.accessLevelFromJSON; } });
Object.defineProperty(exports, "accessLevelToJSON", { enumerable: true, get: function () { return users_2.accessLevelToJSON; } });
Object.defineProperty(exports, "GetAccountsRequest", { enumerable: true, get: function () { return users_2.GetAccountsRequest; } });
Object.defineProperty(exports, "GetAccountsResponse", { enumerable: true, get: function () { return users_2.GetAccountsResponse; } });
Object.defineProperty(exports, "Account", { enumerable: true, get: function () { return users_2.Account; } });
Object.defineProperty(exports, "GetMarginAttributesRequest", { enumerable: true, get: function () { return users_2.GetMarginAttributesRequest; } });
Object.defineProperty(exports, "GetMarginAttributesResponse", { enumerable: true, get: function () { return users_2.GetMarginAttributesResponse; } });
Object.defineProperty(exports, "GetUserTariffRequest", { enumerable: true, get: function () { return users_2.GetUserTariffRequest; } });
Object.defineProperty(exports, "GetUserTariffResponse", { enumerable: true, get: function () { return users_2.GetUserTariffResponse; } });
Object.defineProperty(exports, "UnaryLimit", { enumerable: true, get: function () { return users_2.UnaryLimit; } });
Object.defineProperty(exports, "StreamLimit", { enumerable: true, get: function () { return users_2.StreamLimit; } });
Object.defineProperty(exports, "GetInfoRequest", { enumerable: true, get: function () { return users_2.GetInfoRequest; } });
Object.defineProperty(exports, "GetInfoResponse", { enumerable: true, get: function () { return users_2.GetInfoResponse; } });
Object.defineProperty(exports, "UsersServiceDefinition", { enumerable: true, get: function () { return users_2.UsersServiceDefinition; } });
//# sourceMappingURL=tinkoff-invest-node-sdk.js.map