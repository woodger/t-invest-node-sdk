/**
 * Модуль application DTO задает публичные service contracts SDK facade.
 *
 * Здесь допустимы:
 * - package-owned interfaces для сервисов Tinkoff Invest API;
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

export type TinkoffInvestMetadataValue<Key extends string> = string extends Key
  ? string | Uint8Array
  : Lowercase<Key> extends `${string}-bin`
    ? Uint8Array
    : string;

export interface TinkoffInvestMetadata {
  set<Key extends string>(
    key: Key,
    value: TinkoffInvestMetadataValue<Key> | Array<TinkoffInvestMetadataValue<Key>>
  ): TinkoffInvestMetadata;
  append<Key extends string>(
    key: Key,
    value: TinkoffInvestMetadataValue<Key>
  ): TinkoffInvestMetadata;
  delete(key: string): void;
  get<Key extends string>(key: Key): TinkoffInvestMetadataValue<Key> | undefined;
  getAll<Key extends string>(key: Key): Array<TinkoffInvestMetadataValue<Key>>;
  has(key: string): boolean;
  [Symbol.iterator](): IterableIterator<[string, Array<string | Uint8Array>]>;
}

export interface TinkoffInvestCallOptions {
  metadata?: TinkoffInvestMetadata;
  signal?: AbortSignal;
  onHeader?(header: TinkoffInvestMetadata): void;
  onTrailer?(trailer: TinkoffInvestMetadata): void;
}

export interface UsersService {
  getAccounts(
    request: DeepPartial<GetAccountsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetAccountsResponse>;
  getMarginAttributes(
    request: DeepPartial<GetMarginAttributesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetMarginAttributesResponse>;
  getUserTariff(
    request: DeepPartial<GetUserTariffRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetUserTariffResponse>;
  getInfo(
    request: DeepPartial<GetInfoRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetInfoResponse>;
  getBankAccounts(
    request: DeepPartial<GetBankAccountsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetBankAccountsResponse>;
  currencyTransfer(
    request: DeepPartial<CurrencyTransferRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CurrencyTransferResponse>;
  payIn(
    request: DeepPartial<PayInRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PayInResponse>;
  getAccountValues(
    request: DeepPartial<GetAccountValuesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetAccountValuesResponse>;
}

export interface OrdersService {
  postOrder(
    request: DeepPartial<PostOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderResponse>;
  postOrderAsync(
    request: DeepPartial<PostOrderAsyncRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderAsyncResponse>;
  cancelOrder(
    request: DeepPartial<CancelOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CancelOrderResponse>;
  getOrderState(
    request: DeepPartial<GetOrderStateRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OrderState>;
  getOrders(
    request: DeepPartial<GetOrdersRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOrdersResponse>;
  replaceOrder(
    request: DeepPartial<ReplaceOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderResponse>;
  getMaxLots(
    request: DeepPartial<GetMaxLotsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetMaxLotsResponse>;
  getOrderPrice(
    request: DeepPartial<GetOrderPriceRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOrderPriceResponse>;
}

export interface OrdersStreamService {
  tradesStream(
    request: DeepPartial<TradesStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<TradesStreamResponse>;
  orderStateStream(
    request: DeepPartial<OrderStateStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<OrderStateStreamResponse>;
}

export interface StopOrdersService {
  postStopOrder(
    request: DeepPartial<PostStopOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostStopOrderResponse>;
  getStopOrders(
    request: DeepPartial<GetStopOrdersRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetStopOrdersResponse>;
  cancelStopOrder(
    request: DeepPartial<CancelStopOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CancelStopOrderResponse>;
}

export interface SandboxService {
  openSandboxAccount(
    request: DeepPartial<OpenSandboxAccountRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OpenSandboxAccountResponse>;
  getSandboxAccounts(
    request: DeepPartial<GetAccountsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetAccountsResponse>;
  closeSandboxAccount(
    request: DeepPartial<CloseSandboxAccountRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CloseSandboxAccountResponse>;
  postSandboxOrder(
    request: DeepPartial<PostOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderResponse>;
  postSandboxOrderAsync(
    request: DeepPartial<PostOrderAsyncRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderAsyncResponse>;
  replaceSandboxOrder(
    request: DeepPartial<ReplaceOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderResponse>;
  getSandboxOrders(
    request: DeepPartial<GetOrdersRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOrdersResponse>;
  cancelSandboxOrder(
    request: DeepPartial<CancelOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CancelOrderResponse>;
  getSandboxOrderState(
    request: DeepPartial<GetOrderStateRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OrderState>;
  getSandboxOrderPrice(
    request: DeepPartial<GetOrderPriceRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOrderPriceResponse>;
  getSandboxPositions(
    request: DeepPartial<PositionsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PositionsResponse>;
  getSandboxOperations(
    request: DeepPartial<OperationsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OperationsResponse>;
  getSandboxOperationsByCursor(
    request: DeepPartial<GetOperationsByCursorRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOperationsByCursorResponse>;
  getSandboxPortfolio(
    request: DeepPartial<PortfolioRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PortfolioResponse>;
  sandboxPayIn(
    request: DeepPartial<SandboxPayInRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<SandboxPayInResponse>;
  getSandboxWithdrawLimits(
    request: DeepPartial<WithdrawLimitsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<WithdrawLimitsResponse>;
  getSandboxMaxLots(
    request: DeepPartial<GetMaxLotsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetMaxLotsResponse>;
  postSandboxStopOrder(
    request: DeepPartial<PostStopOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostStopOrderResponse>;
  getSandboxStopOrders(
    request: DeepPartial<GetStopOrdersRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetStopOrdersResponse>;
  cancelSandboxStopOrder(
    request: DeepPartial<CancelStopOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CancelStopOrderResponse>;
}

export interface MarketDataService {
  getCandles(
    request: DeepPartial<GetCandlesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetCandlesResponse>;
  getLastPrices(
    request: DeepPartial<GetLastPricesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetLastPricesResponse>;
  getOrderBook(
    request: DeepPartial<GetOrderBookRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOrderBookResponse>;
  getTradingStatus(
    request: DeepPartial<GetTradingStatusRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetTradingStatusResponse>;
  getTradingStatuses(
    request: DeepPartial<GetTradingStatusesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetTradingStatusesResponse>;
  getLastTrades(
    request: DeepPartial<GetLastTradesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetLastTradesResponse>;
  getClosePrices(
    request: DeepPartial<GetClosePricesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetClosePricesResponse>;
  getTechAnalysis(
    request: DeepPartial<GetTechAnalysisRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetTechAnalysisResponse>;
  getMarketValues(
    request: DeepPartial<GetMarketValuesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetMarketValuesResponse>;
}

export interface MarketDataStreamService {
  marketDataStream(
    request: AsyncIterable<DeepPartial<MarketDataRequest>>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<MarketDataResponse>;
  marketDataServerSideStream(
    request: DeepPartial<MarketDataServerSideStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<MarketDataResponse>;
}

export interface OperationsService {
  getOperations(
    request: DeepPartial<OperationsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OperationsResponse>;
  getPortfolio(
    request: DeepPartial<PortfolioRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PortfolioResponse>;
  getPositions(
    request: DeepPartial<PositionsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PositionsResponse>;
  getWithdrawLimits(
    request: DeepPartial<WithdrawLimitsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<WithdrawLimitsResponse>;
  getBrokerReport(
    request: DeepPartial<BrokerReportRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<BrokerReportResponse>;
  getDividendsForeignIssuer(
    request: DeepPartial<GetDividendsForeignIssuerRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetDividendsForeignIssuerResponse>;
  getOperationsByCursor(
    request: DeepPartial<GetOperationsByCursorRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetOperationsByCursorResponse>;
}

export interface OperationsStreamService {
  portfolioStream(
    request: DeepPartial<PortfolioStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<PortfolioStreamResponse>;
  positionsStream(
    request: DeepPartial<PositionsStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<PositionsStreamResponse>;
  operationsStream(
    request: DeepPartial<OperationsStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<OperationsStreamResponse>;
}

export interface InstrumentsService {
  tradingSchedules(
    request: DeepPartial<TradingSchedulesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<TradingSchedulesResponse>;
  bondBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<BondResponse>;
  bonds(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<BondsResponse>;
  getBondCoupons(
    request: DeepPartial<GetBondCouponsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetBondCouponsResponse>;
  getBondEvents(
    request: DeepPartial<GetBondEventsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetBondEventsResponse>;
  currencyBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CurrencyResponse>;
  currencies(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CurrenciesResponse>;
  etfBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<EtfResponse>;
  etfs(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<EtfsResponse>;
  futureBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<FutureResponse>;
  futures(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<FuturesResponse>;
  optionBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OptionResponse>;
  /** @deprecated Generated-контракт Tinkoff помечает этот метод устаревшим. */
  options(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OptionsResponse>;
  optionsBy(
    request: DeepPartial<FilterOptionsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<OptionsResponse>;
  shareBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<ShareResponse>;
  shares(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<SharesResponse>;
  dfaBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<DfaResponse>;
  dfas(
    request: DeepPartial<DfasRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<DfasResponse>;
  indicatives(
    request: DeepPartial<IndicativesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<IndicativesResponse>;
  getAccruedInterests(
    request: DeepPartial<GetAccruedInterestsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetAccruedInterestsResponse>;
  getFuturesMargin(
    request: DeepPartial<GetFuturesMarginRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetFuturesMarginResponse>;
  getInstrumentBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<InstrumentResponse>;
  getDividends(
    request: DeepPartial<GetDividendsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetDividendsResponse>;
  getAssetBy(
    request: DeepPartial<AssetRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<AssetResponse>;
  getAssets(
    request: DeepPartial<AssetsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<AssetsResponse>;
  getFavorites(
    request: DeepPartial<GetFavoritesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetFavoritesResponse>;
  editFavorites(
    request: DeepPartial<EditFavoritesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<EditFavoritesResponse>;
  createFavoriteGroup(
    request: DeepPartial<CreateFavoriteGroupRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<CreateFavoriteGroupResponse>;
  deleteFavoriteGroup(
    request: DeepPartial<DeleteFavoriteGroupRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<DeleteFavoriteGroupResponse>;
  getFavoriteGroups(
    request: DeepPartial<GetFavoriteGroupsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetFavoriteGroupsResponse>;
  getCountries(
    request: DeepPartial<GetCountriesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetCountriesResponse>;
  findInstrument(
    request: DeepPartial<FindInstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<FindInstrumentResponse>;
  getBrands(
    request: DeepPartial<GetBrandsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetBrandsResponse>;
  getBrandBy(
    request: DeepPartial<GetBrandRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<Brand>;
  getAssetFundamentals(
    request: DeepPartial<GetAssetFundamentalsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetAssetFundamentalsResponse>;
  getAssetReports(
    request: DeepPartial<GetAssetReportsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetAssetReportsResponse>;
  getConsensusForecasts(
    request: DeepPartial<GetConsensusForecastsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetConsensusForecastsResponse>;
  getForecastBy(
    request: DeepPartial<GetForecastRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetForecastResponse>;
  getRiskRates(
    request: DeepPartial<RiskRatesRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<RiskRatesResponse>;
  getInsiderDeals(
    request: DeepPartial<GetInsiderDealsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<GetInsiderDealsResponse>;
  structuredNoteBy(
    request: DeepPartial<InstrumentRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<StructuredNoteResponse>;
  structuredNotes(
    request: DeepPartial<InstrumentsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<StructuredNotesResponse>;
  news(
    request: DeepPartial<NewsRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<NewsResponse>;
}
