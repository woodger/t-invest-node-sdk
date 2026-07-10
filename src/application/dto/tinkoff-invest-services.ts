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

import type { DeepPartial } from '../../generated/t_tech/invest/grpc/common';
import type {
  AssetRequest,
  AssetResponse,
  AssetsRequest,
  AssetsResponse,
  BondResponse,
  BondsResponse,
  Brand,
  CurrencyResponse,
  CurrenciesResponse,
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
  GetBondCouponsRequest,
  GetBondCouponsResponse,
  GetBrandRequest,
  GetBrandsRequest,
  GetBrandsResponse,
  GetCountriesRequest,
  GetCountriesResponse,
  GetDividendsRequest,
  GetDividendsResponse,
  GetFavoritesRequest,
  GetFavoritesResponse,
  GetFuturesMarginRequest,
  GetFuturesMarginResponse,
  InstrumentRequest,
  InstrumentResponse,
  InstrumentsRequest,
  OptionResponse,
  OptionsResponse,
  ShareResponse,
  SharesResponse,
  TradingSchedulesRequest,
  TradingSchedulesResponse
} from '../../generated/t_tech/invest/grpc/instruments';
import type {
  GetCandlesRequest,
  GetCandlesResponse,
  GetClosePricesRequest,
  GetClosePricesResponse,
  GetLastPricesRequest,
  GetLastPricesResponse,
  GetLastTradesRequest,
  GetLastTradesResponse,
  GetOrderBookRequest,
  GetOrderBookResponse,
  GetTradingStatusRequest,
  GetTradingStatusResponse,
  GetTradingStatusesRequest,
  GetTradingStatusesResponse,
  MarketDataRequest,
  MarketDataResponse,
  MarketDataServerSideStreamRequest
} from '../../generated/t_tech/invest/grpc/marketdata';
import type {
  BrokerReportRequest,
  BrokerReportResponse,
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse,
  GetOperationsByCursorRequest,
  GetOperationsByCursorResponse,
  OperationsRequest,
  OperationsResponse,
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
} from '../../generated/t_tech/invest/grpc/operations';
import type {
  CancelOrderRequest,
  CancelOrderResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderStateRequest,
  OrderState,
  PostOrderRequest,
  PostOrderResponse,
  ReplaceOrderRequest,
  TradesStreamRequest,
  TradesStreamResponse
} from '../../generated/t_tech/invest/grpc/orders';
import type {
  CloseSandboxAccountRequest,
  CloseSandboxAccountResponse,
  OpenSandboxAccountRequest,
  OpenSandboxAccountResponse,
  SandboxPayInRequest,
  SandboxPayInResponse
} from '../../generated/t_tech/invest/grpc/sandbox';
import type {
  CancelStopOrderRequest,
  CancelStopOrderResponse,
  GetStopOrdersRequest,
  GetStopOrdersResponse,
  PostStopOrderRequest,
  PostStopOrderResponse
} from '../../generated/t_tech/invest/grpc/stoporders';
import type {
  GetAccountsRequest,
  GetAccountsResponse,
  GetInfoRequest,
  GetInfoResponse,
  GetMarginAttributesRequest,
  GetMarginAttributesResponse,
  GetUserTariffRequest,
  GetUserTariffResponse
} from '../../generated/t_tech/invest/grpc/users';

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
}

export interface OrdersService {
  postOrder(
    request: DeepPartial<PostOrderRequest>,
    options?: TinkoffInvestCallOptions
  ): Promise<PostOrderResponse>;
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
}

export interface OrdersStreamService {
  tradesStream(
    request: DeepPartial<TradesStreamRequest>,
    options?: TinkoffInvestCallOptions
  ): AsyncIterable<TradesStreamResponse>;
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
}
