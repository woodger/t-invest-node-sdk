/**
 * Модуль application DTO задает публичные service contracts SDK facade.
 *
 * Здесь допустимы:
 * - package-owned interfaces для сервисов T-Invest API;
 * - generated request/response DTO в method signatures;
 * - transport-neutral call options без экспорта generated nice-grpc clients;
 *
 * Здесь не должно быть service definitions, gRPC client creation или bootstrap wiring.
 */

import type { DeepPartial } from '../../generated/common';
import type {
  AssetRequest,
  AssetResponse,
  AssetsRequest,
  AssetsResponse,
  BondResponse,
  BondsResponse,
  Brand,
  CreateFavoriteGroupRequest,
  CreateFavoriteGroupResponse,
  CurrencyResponse,
  CurrenciesResponse,
  DeleteFavoriteGroupRequest,
  DeleteFavoriteGroupResponse,
  DfaResponse,
  DfasRequest,
  DfasResponse,
  EditFavoritesRequest,
  EditFavoritesResponse,
  EtfResponse,
  EtfsResponse,
  FilterOptionsRequest,
  FindInstrumentRequest,
  FindInstrumentResponse,
  FutureResponse,
  FuturesResponse,
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse,
  GetAssetFundamentalsRequest,
  GetAssetFundamentalsResponse,
  GetAssetReportsRequest,
  GetAssetReportsResponse,
  GetBondCouponsRequest,
  GetBondCouponsResponse,
  GetBondEventsRequest,
  GetBondEventsResponse,
  GetBrandRequest,
  GetBrandsRequest,
  GetBrandsResponse,
  GetConsensusForecastsRequest,
  GetConsensusForecastsResponse,
  GetCountriesRequest,
  GetCountriesResponse,
  GetDividendsRequest,
  GetDividendsResponse,
  GetFavoritesRequest,
  GetFavoritesResponse,
  GetFavoriteGroupsRequest,
  GetFavoriteGroupsResponse,
  GetForecastRequest,
  GetForecastResponse,
  GetFuturesMarginRequest,
  GetFuturesMarginResponse,
  GetInsiderDealsRequest,
  GetInsiderDealsResponse,
  IndicativesRequest,
  IndicativesResponse,
  InstrumentRequest,
  InstrumentResponse,
  InstrumentsRequest,
  NewsRequest,
  NewsResponse,
  OptionResponse,
  OptionsResponse,
  RiskRatesRequest,
  RiskRatesResponse,
  ShareResponse,
  SharesResponse,
  StructuredNoteResponse,
  StructuredNotesResponse,
  TradingSchedulesRequest,
  TradingSchedulesResponse
} from '../../generated/instruments';
import type {
  GetCandlesRequest,
  GetCandlesResponse,
  GetClosePricesRequest,
  GetClosePricesResponse,
  GetLastPricesRequest,
  GetLastPricesResponse,
  GetLastTradesRequest,
  GetLastTradesResponse,
  GetMarketValuesRequest,
  GetMarketValuesResponse,
  GetOrderBookRequest,
  GetOrderBookResponse,
  GetTechAnalysisRequest,
  GetTechAnalysisResponse,
  GetTradingStatusRequest,
  GetTradingStatusResponse,
  GetTradingStatusesRequest,
  GetTradingStatusesResponse,
  MarketDataRequest,
  MarketDataResponse,
  MarketDataServerSideStreamRequest
} from '../../generated/marketdata';
import type {
  BrokerReportRequest,
  BrokerReportResponse,
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse,
  GetOperationsByCursorRequest,
  GetOperationsByCursorResponse,
  OperationsRequest,
  OperationsResponse,
  OperationsStreamRequest,
  OperationsStreamResponse,
  PortfolioRequest,
  PortfolioResponse,
  PortfolioStreamRequest,
  PortfolioStreamResponse,
  PositionsRequest,
  PositionsResponse,
  PositionsStreamRequest,
  PositionsStreamResponse,
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../generated/operations';
import type {
  CancelOrderRequest,
  CancelOrderResponse,
  GetMaxLotsRequest,
  GetMaxLotsResponse,
  GetOrderPriceRequest,
  GetOrderPriceResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderStateRequest,
  OrderState,
  OrderStateStreamRequest,
  OrderStateStreamResponse,
  PostOrderAsyncRequest,
  PostOrderAsyncResponse,
  PostOrderRequest,
  PostOrderResponse,
  ReplaceOrderRequest,
  TradesStreamRequest,
  TradesStreamResponse
} from '../../generated/orders';
import type {
  CloseSandboxAccountRequest,
  CloseSandboxAccountResponse,
  OpenSandboxAccountRequest,
  OpenSandboxAccountResponse,
  SandboxPayInRequest,
  SandboxPayInResponse
} from '../../generated/sandbox';
import type {
  GetSignalsRequest,
  GetSignalsResponse,
  GetStrategiesRequest,
  GetStrategiesResponse
} from '../../generated/signals';
import type {
  CancelStopOrderRequest,
  CancelStopOrderResponse,
  GetStopOrdersRequest,
  GetStopOrdersResponse,
  PostStopOrderRequest,
  PostStopOrderResponse
} from '../../generated/stoporders';
import type {
  CurrencyTransferRequest,
  CurrencyTransferResponse,
  GetAccountValuesRequest,
  GetAccountValuesResponse,
  GetAccountsRequest,
  GetAccountsResponse,
  GetBankAccountsRequest,
  GetBankAccountsResponse,
  GetInfoRequest,
  GetInfoResponse,
  GetMarginAttributesRequest,
  GetMarginAttributesResponse,
  GetUserTariffRequest,
  GetUserTariffResponse,
  PayInRequest,
  PayInResponse
} from '../../generated/users';

export type TInvestMetadataValue<Key extends string> = string extends Key
  ? string | Uint8Array
  : Lowercase<Key> extends `${string}-bin`
    ? Uint8Array
    : string;

export interface TInvestMetadata {
  set<Key extends string>(
    key: Key,
    value: TInvestMetadataValue<Key> | Array<TInvestMetadataValue<Key>>
  ): TInvestMetadata;
  append<Key extends string>(
    key: Key,
    value: TInvestMetadataValue<Key>
  ): TInvestMetadata;
  delete(key: string): void;
  get<Key extends string>(key: Key): TInvestMetadataValue<Key> | undefined;
  getAll<Key extends string>(key: Key): Array<TInvestMetadataValue<Key>>;
  has(key: string): boolean;
  [Symbol.iterator](): IterableIterator<[string, Array<string | Uint8Array>]>;
}

export interface TInvestCallOptions {
  metadata?: TInvestMetadata;
  /** Отменяет ожидание локальной квоты и переданный transport-вызов. */
  signal?: AbortSignal;
  onHeader?(header: TInvestMetadata): void;
  onTrailer?(trailer: TInvestMetadata): void;
}

export interface UsersService {
  getAccounts(
    request: DeepPartial<GetAccountsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetAccountsResponse>;
  getMarginAttributes(
    request: DeepPartial<GetMarginAttributesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetMarginAttributesResponse>;
  getUserTariff(
    request: DeepPartial<GetUserTariffRequest>,
    options?: TInvestCallOptions
  ): Promise<GetUserTariffResponse>;
  getInfo(
    request: DeepPartial<GetInfoRequest>,
    options?: TInvestCallOptions
  ): Promise<GetInfoResponse>;
  getBankAccounts(
    request: DeepPartial<GetBankAccountsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetBankAccountsResponse>;
  currencyTransfer(
    request: DeepPartial<CurrencyTransferRequest>,
    options?: TInvestCallOptions
  ): Promise<CurrencyTransferResponse>;
  payIn(
    request: DeepPartial<PayInRequest>,
    options?: TInvestCallOptions
  ): Promise<PayInResponse>;
  getAccountValues(
    request: DeepPartial<GetAccountValuesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetAccountValuesResponse>;
}

export interface OrdersService {
  postOrder(
    request: DeepPartial<PostOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<PostOrderResponse>;
  postOrderAsync(
    request: DeepPartial<PostOrderAsyncRequest>,
    options?: TInvestCallOptions
  ): Promise<PostOrderAsyncResponse>;
  cancelOrder(
    request: DeepPartial<CancelOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<CancelOrderResponse>;
  getOrderState(
    request: DeepPartial<GetOrderStateRequest>,
    options?: TInvestCallOptions
  ): Promise<OrderState>;
  getOrders(
    request: DeepPartial<GetOrdersRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOrdersResponse>;
  replaceOrder(
    request: DeepPartial<ReplaceOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<PostOrderResponse>;
  getMaxLots(
    request: DeepPartial<GetMaxLotsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetMaxLotsResponse>;
  getOrderPrice(
    request: DeepPartial<GetOrderPriceRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOrderPriceResponse>;
}

export interface OrdersStreamService {
  tradesStream(
    request: DeepPartial<TradesStreamRequest>,
    options?: TInvestCallOptions
  ): AsyncIterable<TradesStreamResponse>;
  orderStateStream(
    request: DeepPartial<OrderStateStreamRequest>,
    options?: TInvestCallOptions
  ): AsyncIterable<OrderStateStreamResponse>;
}

export interface StopOrdersService {
  postStopOrder(
    request: DeepPartial<PostStopOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<PostStopOrderResponse>;
  getStopOrders(
    request: DeepPartial<GetStopOrdersRequest>,
    options?: TInvestCallOptions
  ): Promise<GetStopOrdersResponse>;
  cancelStopOrder(
    request: DeepPartial<CancelStopOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<CancelStopOrderResponse>;
}

export interface SandboxService {
  openSandboxAccount(
    request: DeepPartial<OpenSandboxAccountRequest>,
    options?: TInvestCallOptions
  ): Promise<OpenSandboxAccountResponse>;
  getSandboxAccounts(
    request: DeepPartial<GetAccountsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetAccountsResponse>;
  closeSandboxAccount(
    request: DeepPartial<CloseSandboxAccountRequest>,
    options?: TInvestCallOptions
  ): Promise<CloseSandboxAccountResponse>;
  postSandboxOrder(
    request: DeepPartial<PostOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<PostOrderResponse>;
  postSandboxOrderAsync(
    request: DeepPartial<PostOrderAsyncRequest>,
    options?: TInvestCallOptions
  ): Promise<PostOrderAsyncResponse>;
  replaceSandboxOrder(
    request: DeepPartial<ReplaceOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<PostOrderResponse>;
  getSandboxOrders(
    request: DeepPartial<GetOrdersRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOrdersResponse>;
  cancelSandboxOrder(
    request: DeepPartial<CancelOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<CancelOrderResponse>;
  getSandboxOrderState(
    request: DeepPartial<GetOrderStateRequest>,
    options?: TInvestCallOptions
  ): Promise<OrderState>;
  getSandboxOrderPrice(
    request: DeepPartial<GetOrderPriceRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOrderPriceResponse>;
  getSandboxPositions(
    request: DeepPartial<PositionsRequest>,
    options?: TInvestCallOptions
  ): Promise<PositionsResponse>;
  getSandboxOperations(
    request: DeepPartial<OperationsRequest>,
    options?: TInvestCallOptions
  ): Promise<OperationsResponse>;
  getSandboxOperationsByCursor(
    request: DeepPartial<GetOperationsByCursorRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOperationsByCursorResponse>;
  getSandboxPortfolio(
    request: DeepPartial<PortfolioRequest>,
    options?: TInvestCallOptions
  ): Promise<PortfolioResponse>;
  sandboxPayIn(
    request: DeepPartial<SandboxPayInRequest>,
    options?: TInvestCallOptions
  ): Promise<SandboxPayInResponse>;
  getSandboxWithdrawLimits(
    request: DeepPartial<WithdrawLimitsRequest>,
    options?: TInvestCallOptions
  ): Promise<WithdrawLimitsResponse>;
  getSandboxMaxLots(
    request: DeepPartial<GetMaxLotsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetMaxLotsResponse>;
  postSandboxStopOrder(
    request: DeepPartial<PostStopOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<PostStopOrderResponse>;
  getSandboxStopOrders(
    request: DeepPartial<GetStopOrdersRequest>,
    options?: TInvestCallOptions
  ): Promise<GetStopOrdersResponse>;
  cancelSandboxStopOrder(
    request: DeepPartial<CancelStopOrderRequest>,
    options?: TInvestCallOptions
  ): Promise<CancelStopOrderResponse>;
}

export interface SignalService {
  getStrategies(
    request: DeepPartial<GetStrategiesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetStrategiesResponse>;
  getSignals(
    request: DeepPartial<GetSignalsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetSignalsResponse>;
}

export interface MarketDataService {
  getCandles(
    request: DeepPartial<GetCandlesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetCandlesResponse>;
  getLastPrices(
    request: DeepPartial<GetLastPricesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetLastPricesResponse>;
  getOrderBook(
    request: DeepPartial<GetOrderBookRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOrderBookResponse>;
  getTradingStatus(
    request: DeepPartial<GetTradingStatusRequest>,
    options?: TInvestCallOptions
  ): Promise<GetTradingStatusResponse>;
  getTradingStatuses(
    request: DeepPartial<GetTradingStatusesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetTradingStatusesResponse>;
  getLastTrades(
    request: DeepPartial<GetLastTradesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetLastTradesResponse>;
  getClosePrices(
    request: DeepPartial<GetClosePricesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetClosePricesResponse>;
  getTechAnalysis(
    request: DeepPartial<GetTechAnalysisRequest>,
    options?: TInvestCallOptions
  ): Promise<GetTechAnalysisResponse>;
  getMarketValues(
    request: DeepPartial<GetMarketValuesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetMarketValuesResponse>;
}

export interface MarketDataStreamService {
  marketDataStream(
    request: AsyncIterable<DeepPartial<MarketDataRequest>>,
    options?: TInvestCallOptions
  ): AsyncIterable<MarketDataResponse>;
  marketDataServerSideStream(
    request: DeepPartial<MarketDataServerSideStreamRequest>,
    options?: TInvestCallOptions
  ): AsyncIterable<MarketDataResponse>;
}

export interface OperationsService {
  getOperations(
    request: DeepPartial<OperationsRequest>,
    options?: TInvestCallOptions
  ): Promise<OperationsResponse>;
  getPortfolio(
    request: DeepPartial<PortfolioRequest>,
    options?: TInvestCallOptions
  ): Promise<PortfolioResponse>;
  getPositions(
    request: DeepPartial<PositionsRequest>,
    options?: TInvestCallOptions
  ): Promise<PositionsResponse>;
  getWithdrawLimits(
    request: DeepPartial<WithdrawLimitsRequest>,
    options?: TInvestCallOptions
  ): Promise<WithdrawLimitsResponse>;
  getBrokerReport(
    request: DeepPartial<BrokerReportRequest>,
    options?: TInvestCallOptions
  ): Promise<BrokerReportResponse>;
  getDividendsForeignIssuer(
    request: DeepPartial<GetDividendsForeignIssuerRequest>,
    options?: TInvestCallOptions
  ): Promise<GetDividendsForeignIssuerResponse>;
  getOperationsByCursor(
    request: DeepPartial<GetOperationsByCursorRequest>,
    options?: TInvestCallOptions
  ): Promise<GetOperationsByCursorResponse>;
}

export interface OperationsStreamService {
  portfolioStream(
    request: DeepPartial<PortfolioStreamRequest>,
    options?: TInvestCallOptions
  ): AsyncIterable<PortfolioStreamResponse>;
  positionsStream(
    request: DeepPartial<PositionsStreamRequest>,
    options?: TInvestCallOptions
  ): AsyncIterable<PositionsStreamResponse>;
  operationsStream(
    request: DeepPartial<OperationsStreamRequest>,
    options?: TInvestCallOptions
  ): AsyncIterable<OperationsStreamResponse>;
}

export interface InstrumentsService {
  tradingSchedules(
    request: DeepPartial<TradingSchedulesRequest>,
    options?: TInvestCallOptions
  ): Promise<TradingSchedulesResponse>;
  bondBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<BondResponse>;
  bonds(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<BondsResponse>;
  getBondCoupons(
    request: DeepPartial<GetBondCouponsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetBondCouponsResponse>;
  getBondEvents(
    request: DeepPartial<GetBondEventsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetBondEventsResponse>;
  currencyBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<CurrencyResponse>;
  currencies(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<CurrenciesResponse>;
  etfBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<EtfResponse>;
  etfs(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<EtfsResponse>;
  futureBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<FutureResponse>;
  futures(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<FuturesResponse>;
  optionBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<OptionResponse>;
  /** @deprecated Generated-контракт T-Invest помечает этот метод устаревшим. */
  options(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<OptionsResponse>;
  optionsBy(
    request: DeepPartial<FilterOptionsRequest>,
    options?: TInvestCallOptions
  ): Promise<OptionsResponse>;
  shareBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<ShareResponse>;
  shares(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<SharesResponse>;
  dfaBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<DfaResponse>;
  dfas(
    request: DeepPartial<DfasRequest>,
    options?: TInvestCallOptions
  ): Promise<DfasResponse>;
  indicatives(
    request: DeepPartial<IndicativesRequest>,
    options?: TInvestCallOptions
  ): Promise<IndicativesResponse>;
  getAccruedInterests(
    request: DeepPartial<GetAccruedInterestsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetAccruedInterestsResponse>;
  getFuturesMargin(
    request: DeepPartial<GetFuturesMarginRequest>,
    options?: TInvestCallOptions
  ): Promise<GetFuturesMarginResponse>;
  getInstrumentBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<InstrumentResponse>;
  getDividends(
    request: DeepPartial<GetDividendsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetDividendsResponse>;
  getAssetBy(
    request: DeepPartial<AssetRequest>,
    options?: TInvestCallOptions
  ): Promise<AssetResponse>;
  getAssets(
    request: DeepPartial<AssetsRequest>,
    options?: TInvestCallOptions
  ): Promise<AssetsResponse>;
  getFavorites(
    request: DeepPartial<GetFavoritesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetFavoritesResponse>;
  editFavorites(
    request: DeepPartial<EditFavoritesRequest>,
    options?: TInvestCallOptions
  ): Promise<EditFavoritesResponse>;
  createFavoriteGroup(
    request: DeepPartial<CreateFavoriteGroupRequest>,
    options?: TInvestCallOptions
  ): Promise<CreateFavoriteGroupResponse>;
  deleteFavoriteGroup(
    request: DeepPartial<DeleteFavoriteGroupRequest>,
    options?: TInvestCallOptions
  ): Promise<DeleteFavoriteGroupResponse>;
  getFavoriteGroups(
    request: DeepPartial<GetFavoriteGroupsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetFavoriteGroupsResponse>;
  getCountries(
    request: DeepPartial<GetCountriesRequest>,
    options?: TInvestCallOptions
  ): Promise<GetCountriesResponse>;
  findInstrument(
    request: DeepPartial<FindInstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<FindInstrumentResponse>;
  getBrands(
    request: DeepPartial<GetBrandsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetBrandsResponse>;
  getBrandBy(
    request: DeepPartial<GetBrandRequest>,
    options?: TInvestCallOptions
  ): Promise<Brand>;
  getAssetFundamentals(
    request: DeepPartial<GetAssetFundamentalsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetAssetFundamentalsResponse>;
  getAssetReports(
    request: DeepPartial<GetAssetReportsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetAssetReportsResponse>;
  getConsensusForecasts(
    request: DeepPartial<GetConsensusForecastsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetConsensusForecastsResponse>;
  getForecastBy(
    request: DeepPartial<GetForecastRequest>,
    options?: TInvestCallOptions
  ): Promise<GetForecastResponse>;
  getRiskRates(
    request: DeepPartial<RiskRatesRequest>,
    options?: TInvestCallOptions
  ): Promise<RiskRatesResponse>;
  getInsiderDeals(
    request: DeepPartial<GetInsiderDealsRequest>,
    options?: TInvestCallOptions
  ): Promise<GetInsiderDealsResponse>;
  structuredNoteBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TInvestCallOptions
  ): Promise<StructuredNoteResponse>;
  structuredNotes(
    request: DeepPartial<InstrumentsRequest>,
    options?: TInvestCallOptions
  ): Promise<StructuredNotesResponse>;
  news(
    request: DeepPartial<NewsRequest>,
    options?: TInvestCallOptions
  ): Promise<NewsResponse>;
}
