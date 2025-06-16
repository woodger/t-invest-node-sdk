import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import type { CallContext, CallOptions } from "nice-grpc-common";
import { InstrumentType, MoneyValue, Quotation, SecurityTradingStatus } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Тип купонов. */
export declare enum CouponType {
    /** COUPON_TYPE_UNSPECIFIED - Неопределенное значение */
    COUPON_TYPE_UNSPECIFIED = 0,
    /** COUPON_TYPE_CONSTANT - Постоянный */
    COUPON_TYPE_CONSTANT = 1,
    /** COUPON_TYPE_FLOATING - Плавающий */
    COUPON_TYPE_FLOATING = 2,
    /** COUPON_TYPE_DISCOUNT - Дисконт */
    COUPON_TYPE_DISCOUNT = 3,
    /** COUPON_TYPE_MORTGAGE - Ипотечный */
    COUPON_TYPE_MORTGAGE = 4,
    /** COUPON_TYPE_FIX - Фиксированный */
    COUPON_TYPE_FIX = 5,
    /** COUPON_TYPE_VARIABLE - Переменный */
    COUPON_TYPE_VARIABLE = 6,
    /** COUPON_TYPE_OTHER - Прочее */
    COUPON_TYPE_OTHER = 7,
    UNRECOGNIZED = -1
}
export declare function couponTypeFromJSON(object: any): CouponType;
export declare function couponTypeToJSON(object: CouponType): string;
/** Тип опциона по направлению сделки. */
export declare enum OptionDirection {
    /** OPTION_DIRECTION_UNSPECIFIED - Тип не определен. */
    OPTION_DIRECTION_UNSPECIFIED = 0,
    /** OPTION_DIRECTION_PUT - Опцион на продажу. */
    OPTION_DIRECTION_PUT = 1,
    /** OPTION_DIRECTION_CALL - Опцион на покупку. */
    OPTION_DIRECTION_CALL = 2,
    UNRECOGNIZED = -1
}
export declare function optionDirectionFromJSON(object: any): OptionDirection;
export declare function optionDirectionToJSON(object: OptionDirection): string;
/** Тип расчетов по опциону. */
export declare enum OptionPaymentType {
    /** OPTION_PAYMENT_TYPE_UNSPECIFIED - Тип не определен. */
    OPTION_PAYMENT_TYPE_UNSPECIFIED = 0,
    /** OPTION_PAYMENT_TYPE_PREMIUM - Опционы с использованием премии в расчетах. */
    OPTION_PAYMENT_TYPE_PREMIUM = 1,
    /** OPTION_PAYMENT_TYPE_MARGINAL - Маржируемые опционы. */
    OPTION_PAYMENT_TYPE_MARGINAL = 2,
    UNRECOGNIZED = -1
}
export declare function optionPaymentTypeFromJSON(object: any): OptionPaymentType;
export declare function optionPaymentTypeToJSON(object: OptionPaymentType): string;
/** Тип опциона по стилю. */
export declare enum OptionStyle {
    /** OPTION_STYLE_UNSPECIFIED - Тип не определен. */
    OPTION_STYLE_UNSPECIFIED = 0,
    /** OPTION_STYLE_AMERICAN - Американский опцион. */
    OPTION_STYLE_AMERICAN = 1,
    /** OPTION_STYLE_EUROPEAN - Европейский опцион. */
    OPTION_STYLE_EUROPEAN = 2,
    UNRECOGNIZED = -1
}
export declare function optionStyleFromJSON(object: any): OptionStyle;
export declare function optionStyleToJSON(object: OptionStyle): string;
/** Тип опциона по способу исполнения. */
export declare enum OptionSettlementType {
    /** OPTION_EXECUTION_TYPE_UNSPECIFIED - Тип не определен. */
    OPTION_EXECUTION_TYPE_UNSPECIFIED = 0,
    /** OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY - Поставочный тип опциона. */
    OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY = 1,
    /** OPTION_EXECUTION_TYPE_CASH_SETTLEMENT - Расчетный тип опциона. */
    OPTION_EXECUTION_TYPE_CASH_SETTLEMENT = 2,
    UNRECOGNIZED = -1
}
export declare function optionSettlementTypeFromJSON(object: any): OptionSettlementType;
export declare function optionSettlementTypeToJSON(object: OptionSettlementType): string;
/** Тип идентификатора инструмента. Подробнее об идентификации инструментов: [Идентификация инструментов](https://tinkoff.github.io/investAPI/faq_identification/) */
export declare enum InstrumentIdType {
    /** INSTRUMENT_ID_UNSPECIFIED - Значение не определено. */
    INSTRUMENT_ID_UNSPECIFIED = 0,
    /** INSTRUMENT_ID_TYPE_FIGI - Figi. */
    INSTRUMENT_ID_TYPE_FIGI = 1,
    /** INSTRUMENT_ID_TYPE_TICKER - Ticker. */
    INSTRUMENT_ID_TYPE_TICKER = 2,
    /** INSTRUMENT_ID_TYPE_UID - Уникальный идентификатор. */
    INSTRUMENT_ID_TYPE_UID = 3,
    /** INSTRUMENT_ID_TYPE_POSITION_UID - Идентификатор позиции. */
    INSTRUMENT_ID_TYPE_POSITION_UID = 4,
    UNRECOGNIZED = -1
}
export declare function instrumentIdTypeFromJSON(object: any): InstrumentIdType;
export declare function instrumentIdTypeToJSON(object: InstrumentIdType): string;
/** Статус запрашиваемых инструментов. */
export declare enum InstrumentStatus {
    /** INSTRUMENT_STATUS_UNSPECIFIED - Значение не определено. */
    INSTRUMENT_STATUS_UNSPECIFIED = 0,
    /** INSTRUMENT_STATUS_BASE - Базовый список инструментов (по умолчанию). Инструменты доступные для торговли через TINKOFF INVEST API. Cейчас списки бумаг, доступных из api и других интерфейсах совпадают (за исключением внебиржевых бумаг), но в будущем возможны ситуации, когда списки инструментов будут отличаться */
    INSTRUMENT_STATUS_BASE = 1,
    /** INSTRUMENT_STATUS_ALL - Список всех инструментов. */
    INSTRUMENT_STATUS_ALL = 2,
    UNRECOGNIZED = -1
}
export declare function instrumentStatusFromJSON(object: any): InstrumentStatus;
export declare function instrumentStatusToJSON(object: InstrumentStatus): string;
/** Тип акций. */
export declare enum ShareType {
    /** SHARE_TYPE_UNSPECIFIED - Значение не определено. */
    SHARE_TYPE_UNSPECIFIED = 0,
    /** SHARE_TYPE_COMMON - Обыкновенная */
    SHARE_TYPE_COMMON = 1,
    /** SHARE_TYPE_PREFERRED - Привилегированная */
    SHARE_TYPE_PREFERRED = 2,
    /** SHARE_TYPE_ADR - Американские депозитарные расписки */
    SHARE_TYPE_ADR = 3,
    /** SHARE_TYPE_GDR - Глобальные депозитарные расписки */
    SHARE_TYPE_GDR = 4,
    /** SHARE_TYPE_MLP - Товарищество с ограниченной ответственностью */
    SHARE_TYPE_MLP = 5,
    /** SHARE_TYPE_NY_REG_SHRS - Акции из реестра Нью-Йорка */
    SHARE_TYPE_NY_REG_SHRS = 6,
    /** SHARE_TYPE_CLOSED_END_FUND - Закрытый инвестиционный фонд */
    SHARE_TYPE_CLOSED_END_FUND = 7,
    /** SHARE_TYPE_REIT - Траст недвижимости */
    SHARE_TYPE_REIT = 8,
    UNRECOGNIZED = -1
}
export declare function shareTypeFromJSON(object: any): ShareType;
export declare function shareTypeToJSON(object: ShareType): string;
/** Тип актива. */
export declare enum AssetType {
    /** ASSET_TYPE_UNSPECIFIED - Тип не определён. */
    ASSET_TYPE_UNSPECIFIED = 0,
    /** ASSET_TYPE_CURRENCY - Валюта. */
    ASSET_TYPE_CURRENCY = 1,
    /** ASSET_TYPE_COMMODITY - Товар. */
    ASSET_TYPE_COMMODITY = 2,
    /** ASSET_TYPE_INDEX - Индекс. */
    ASSET_TYPE_INDEX = 3,
    /** ASSET_TYPE_SECURITY - Ценная бумага. */
    ASSET_TYPE_SECURITY = 4,
    UNRECOGNIZED = -1
}
export declare function assetTypeFromJSON(object: any): AssetType;
export declare function assetTypeToJSON(object: AssetType): string;
/** Тип структурной ноты. */
export declare enum StructuredProductType {
    /** SP_TYPE_UNSPECIFIED - Тип не определён. */
    SP_TYPE_UNSPECIFIED = 0,
    /** SP_TYPE_DELIVERABLE - Поставочный. */
    SP_TYPE_DELIVERABLE = 1,
    /** SP_TYPE_NON_DELIVERABLE - Беспоставочный. */
    SP_TYPE_NON_DELIVERABLE = 2,
    UNRECOGNIZED = -1
}
export declare function structuredProductTypeFromJSON(object: any): StructuredProductType;
export declare function structuredProductTypeToJSON(object: StructuredProductType): string;
/** Тип действия со списком избранных инструментов. */
export declare enum EditFavoritesActionType {
    /** EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED - Тип не определён. */
    EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED = 0,
    /** EDIT_FAVORITES_ACTION_TYPE_ADD - Добавить в список. */
    EDIT_FAVORITES_ACTION_TYPE_ADD = 1,
    /** EDIT_FAVORITES_ACTION_TYPE_DEL - Удалить из списка. */
    EDIT_FAVORITES_ACTION_TYPE_DEL = 2,
    UNRECOGNIZED = -1
}
export declare function editFavoritesActionTypeFromJSON(object: any): EditFavoritesActionType;
export declare function editFavoritesActionTypeToJSON(object: EditFavoritesActionType): string;
/** Реальная площадка исполнения расчётов. */
export declare enum RealExchange {
    /** REAL_EXCHANGE_UNSPECIFIED - Тип не определён. */
    REAL_EXCHANGE_UNSPECIFIED = 0,
    /** REAL_EXCHANGE_MOEX - Московская биржа. */
    REAL_EXCHANGE_MOEX = 1,
    /** REAL_EXCHANGE_RTS - Санкт-Петербургская биржа. */
    REAL_EXCHANGE_RTS = 2,
    /** REAL_EXCHANGE_OTC - Внебиржевой инструмент. */
    REAL_EXCHANGE_OTC = 3,
    UNRECOGNIZED = -1
}
export declare function realExchangeFromJSON(object: any): RealExchange;
export declare function realExchangeToJSON(object: RealExchange): string;
/** Уровень риска облигации. */
export declare enum RiskLevel {
    /** RISK_LEVEL_HIGH - Высокий уровень риска */
    RISK_LEVEL_HIGH = 0,
    /** RISK_LEVEL_MODERATE - Средний уровень риска */
    RISK_LEVEL_MODERATE = 1,
    /** RISK_LEVEL_LOW - Низкий уровень риска */
    RISK_LEVEL_LOW = 2,
    UNRECOGNIZED = -1
}
export declare function riskLevelFromJSON(object: any): RiskLevel;
export declare function riskLevelToJSON(object: RiskLevel): string;
/** Запрос расписания торгов. */
export interface TradingSchedulesRequest {
    /** Наименование биржи или расчетного календаря. </br>Если не передаётся, возвращается информация по всем доступным торговым площадкам. */
    exchange: string;
    /** Начало периода по часовому поясу UTC. */
    from: Date | undefined;
    /** Окончание периода по часовому поясу UTC. */
    to: Date | undefined;
}
/** Список торговых площадок. */
export interface TradingSchedulesResponse {
    /** Список торговых площадок и режимов торгов. */
    exchanges: TradingSchedule[];
}
/** Данные по торговой площадке. */
export interface TradingSchedule {
    /** Наименование торговой площадки. */
    exchange: string;
    /** Массив с торговыми и неторговыми днями. */
    days: TradingDay[];
}
/** Информация о времени торгов. */
export interface TradingDay {
    /** Дата. */
    date: Date | undefined;
    /** Признак торгового дня на бирже. */
    isTradingDay: boolean;
    /** Время начала торгов по часовому поясу UTC. */
    startTime: Date | undefined;
    /** Время окончания торгов по часовому поясу UTC. */
    endTime: Date | undefined;
    /** Время начала аукциона открытия в часовом поясе UTC. */
    openingAuctionStartTime: Date | undefined;
    /** Время окончания аукциона закрытия в часовом поясе UTC. */
    closingAuctionEndTime: Date | undefined;
    /** Время начала аукциона открытия вечерней сессии в часовом поясе UTC. */
    eveningOpeningAuctionStartTime: Date | undefined;
    /** Время начала вечерней сессии в часовом поясе UTC. */
    eveningStartTime: Date | undefined;
    /** Время окончания вечерней сессии в часовом поясе UTC. */
    eveningEndTime: Date | undefined;
    /** Время начала основного клиринга в часовом поясе UTC. */
    clearingStartTime: Date | undefined;
    /** Время окончания основного клиринга в часовом поясе UTC. */
    clearingEndTime: Date | undefined;
    /** Время начала премаркета в часовом поясе UTC. */
    premarketStartTime: Date | undefined;
    /** Время окончания премаркета в часовом поясе UTC. */
    premarketEndTime: Date | undefined;
    /** Время начала аукциона закрытия в часовом поясе UTC. */
    closingAuctionStartTime: Date | undefined;
    /** Время окончания аукциона открытия в часовом поясе UTC. */
    openingAuctionEndTime: Date | undefined;
}
/** Запрос получения инструмента по идентификатору. */
export interface InstrumentRequest {
    /** Тип идентификатора инструмента. Возможные значения: figi, ticker. Подробнее об идентификации инструментов: [Идентификация инструментов](https://tinkoff.github.io/investAPI/faq_identification/) */
    idType: InstrumentIdType;
    /** Идентификатор class_code. Обязателен при id_type = ticker. */
    classCode: string;
    /** Идентификатор запрашиваемого инструмента. */
    id: string;
}
/** Запрос получения инструментов. */
export interface InstrumentsRequest {
    /** Статус запрашиваемых инструментов. Возможные значения: [InstrumentStatus](#instrumentstatus) */
    instrumentStatus: InstrumentStatus;
}
/** Параметры фильтрации опционов */
export interface FilterOptionsRequest {
    /** Идентификатор базового актива опциона.  Обязательный параметр. */
    basicAssetUid: string;
    /** Идентификатор позиции базового актива опциона */
    basicAssetPositionUid: string;
}
/** Информация об облигации. */
export interface BondResponse {
    /** Информация об облигации. */
    instrument: Bond | undefined;
}
/** Список облигаций. */
export interface BondsResponse {
    /** Массив облигаций. */
    instruments: Bond[];
}
/** Запрос купонов по облигации. */
export interface GetBondCouponsRequest {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Начало запрашиваемого периода в часовом поясе UTC. Фильтрация по coupon_date (дата выплаты купона) */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. Фильтрация по coupon_date (дата выплаты купона) */
    to: Date | undefined;
}
/** Купоны по облигации. */
export interface GetBondCouponsResponse {
    events: Coupon[];
}
/** Объект передачи информации о купоне облигации. */
export interface Coupon {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Дата выплаты купона. */
    couponDate: Date | undefined;
    /** Номер купона. */
    couponNumber: number;
    /** (Опционально) Дата фиксации реестра для выплаты купона. */
    fixDate: Date | undefined;
    /** Выплата на одну облигацию. */
    payOneBond: MoneyValue | undefined;
    /** Тип купона. */
    couponType: CouponType;
    /** Начало купонного периода. */
    couponStartDate: Date | undefined;
    /** Окончание купонного периода. */
    couponEndDate: Date | undefined;
    /** Купонный период в днях. */
    couponPeriod: number;
}
/** Данные по валюте. */
export interface CurrencyResponse {
    /** Информация о валюте. */
    instrument: Currency | undefined;
}
/** Данные по валютам. */
export interface CurrenciesResponse {
    /** Массив валют. */
    instruments: Currency[];
}
/** Данные по фонду. */
export interface EtfResponse {
    /** Информация о фонде. */
    instrument: Etf | undefined;
}
/** Данные по фондам. */
export interface EtfsResponse {
    /** Массив фондов. */
    instruments: Etf[];
}
/** Данные по фьючерсу. */
export interface FutureResponse {
    /** Информация о фьючерсу. */
    instrument: Future | undefined;
}
/** Данные по фьючерсам. */
export interface FuturesResponse {
    /** Массив фьючерсов. */
    instruments: Future[];
}
/** Данные по опциону. */
export interface OptionResponse {
    /** Информация по опциону. */
    instrument: Option | undefined;
}
/** Данные по опционам. */
export interface OptionsResponse {
    /** Массив данных по опциону. */
    instruments: Option[];
}
/** Опцион. */
export interface Option {
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Уникальный идентификатор позиции. */
    positionUid: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код. */
    classCode: string;
    /** Уникальный идентификатор позиции основного инструмента. */
    basicAssetPositionUid: string;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Реальная площадка исполнения расчётов (биржа). Допустимые значения: [REAL_EXCHANGE_MOEX, REAL_EXCHANGE_RTS] */
    realExchange: RealExchange;
    /** Направление опциона. */
    direction: OptionDirection;
    /** Тип расчетов по опциону. */
    paymentType: OptionPaymentType;
    /** Стиль опциона. */
    style: OptionStyle;
    /** Способ исполнения опциона. */
    settlementType: OptionSettlementType;
    /** Название инструмента. */
    name: string;
    /** Валюта. */
    currency: string;
    /** Валюта, в которой оценивается контракт. */
    settlementCurrency: string;
    /** Тип актива. */
    assetType: string;
    /** Основной актив. */
    basicAsset: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Код страны рисков. */
    countryOfRisk: string;
    /** Наименование страны рисков. */
    countryOfRiskName: string;
    /** Сектор экономики. */
    sector: string;
    /** Количество бумаг в лоте. */
    lot: number;
    /** Размер основного актива. */
    basicAssetSize: Quotation | undefined;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт.  Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт.  Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Минимальный шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Цена страйка. */
    strikePrice: MoneyValue | undefined;
    /** Дата истечения срока в формате UTC. */
    expirationDate: Date | undefined;
    /** Дата начала обращения контракта в формате UTC. */
    firstTradeDate: Date | undefined;
    /** Дата исполнения в формате UTC. */
    lastTradeDate: Date | undefined;
    /** Дата первой минутной свечи в формате UTC. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи в формате UTC. */
    first1dayCandleDate: Date | undefined;
    /** Признак доступности для операций шорт. */
    shortEnabledFlag: boolean;
    /** Возможность покупки/продажи на ИИС. */
    forIisFlag: boolean;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
}
/** Данные по акции. */
export interface ShareResponse {
    /** Информация об акции. */
    instrument: Share | undefined;
}
/** Данные по акциям. */
export interface SharesResponse {
    /** Массив акций. */
    instruments: Share[];
}
/** Объект передачи информации об облигации. */
export interface Bond {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Isin-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Количество выплат по купонам в год. */
    couponQuantityPerYear: number;
    /** Дата погашения облигации в часовом поясе UTC. */
    maturityDate: Date | undefined;
    /** Номинал облигации. */
    nominal: MoneyValue | undefined;
    /** Первоначальный номинал облигации. */
    initialNominal: MoneyValue | undefined;
    /** Дата выпуска облигации в часовом поясе UTC. */
    stateRegDate: Date | undefined;
    /** Дата размещения в часовом поясе UTC. */
    placementDate: Date | undefined;
    /** Цена размещения. */
    placementPrice: MoneyValue | undefined;
    /** Значение НКД (накопленного купонного дохода) на дату. */
    aciValue: MoneyValue | undefined;
    /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRiskName: string;
    /** Сектор экономики. */
    sector: string;
    /** Форма выпуска. Возможные значения: </br>**documentary** — документарная; </br>**non_documentary** — бездокументарная. */
    issueKind: string;
    /** Размер выпуска. */
    issueSize: number;
    /** Плановый размер выпуска. */
    issueSizePlan: number;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Признак облигации с плавающим купоном. */
    floatingCouponFlag: boolean;
    /** Признак бессрочной облигации. */
    perpetualFlag: boolean;
    /** Признак облигации с амортизацией долга. */
    amortizationFlag: boolean;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов. (биржа) */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС */
    blockedTcaFlag: boolean;
    /** Признак субординированной облигации. */
    subordinatedFlag: boolean;
    /** Флаг достаточной ликвидности */
    liquidityFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Уровень риска. */
    riskLevel: RiskLevel;
}
/** Объект передачи информации о валюте. */
export interface Currency {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Isin-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг.Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи) */
    exchange: string;
    /** Номинал. */
    nominal: MoneyValue | undefined;
    /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRiskName: string;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Строковый ISO-код валюты. */
    isoCurrencyName: string;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов (биржа). */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
}
/** Объект передачи информации об инвестиционном фонде. */
export interface Etf {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Isin-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг.Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Размер фиксированной комиссии фонда. */
    fixedCommission: Quotation | undefined;
    /** Возможные значения: </br>**equity** — акции;</br>**fixed_income** — облигации;</br>**mixed_allocation** — смешанный;</br>**money_market** — денежный рынок;</br>**real_estate** — недвижимость;</br>**commodity** — товары;</br>**specialty** — специальный;</br>**private_equity** — private equity;</br>**alternative_investment** — альтернативные инвестиции. */
    focusType: string;
    /** Дата выпуска в часовом поясе UTC. */
    releasedDate: Date | undefined;
    /** Количество акций фонда в обращении. */
    numShares: Quotation | undefined;
    /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRiskName: string;
    /** Сектор экономики. */
    sector: string;
    /** Частота ребалансировки. */
    rebalancingFreq: string;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов (биржа). */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Флаг достаточной ликвидности */
    liquidityFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
}
/** Объект передачи информации о фьючерсе. */
export interface Future {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг.Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Дата начала обращения контракта в часовом поясе UTC. */
    firstTradeDate: Date | undefined;
    /** Дата в часовом поясе UTC, до которой возможно проведение операций с фьючерсом. */
    lastTradeDate: Date | undefined;
    /** Тип фьючерса. Возможные значения: </br>**physical_delivery** — физические поставки; </br>**cash_settlement** — денежный эквивалент. */
    futuresType: string;
    /** Тип актива. Возможные значения: </br>**commodity** — товар; </br>**currency** — валюта; </br>**security** — ценная бумага; </br>**index** — индекс. */
    assetType: string;
    /** Основной актив. */
    basicAsset: string;
    /** Размер основного актива. */
    basicAssetSize: Quotation | undefined;
    /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRiskName: string;
    /** Сектор экономики. */
    sector: string;
    /** Дата истечения срока в часов поясе UTC. */
    expirationDate: Date | undefined;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов (биржа). */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Уникальный идентификатор позиции основного инструмента. */
    basicAssetPositionUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
}
/** Объект передачи информации об акции. */
export interface Share {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Isin-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг.Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Дата IPO акции в часовом поясе UTC. */
    ipoDate: Date | undefined;
    /** Размер выпуска. */
    issueSize: number;
    /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRiskName: string;
    /** Сектор экономики. */
    sector: string;
    /** Плановый размер выпуска. */
    issueSizePlan: number;
    /** Номинал. */
    nominal: MoneyValue | undefined;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Признак наличия дивидендной доходности. */
    divYieldFlag: boolean;
    /** Тип акции. Возможные значения: [ShareType](https://tinkoff.github.io/investAPI/instruments#sharetype) */
    shareType: ShareType;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов (биржа). */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС */
    blockedTcaFlag: boolean;
    /** Флаг достаточной ликвидности */
    liquidityFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
}
/** Запрос НКД по облигации */
export interface GetAccruedInterestsRequest {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Начало запрашиваемого периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. */
    to: Date | undefined;
}
/** НКД облигации */
export interface GetAccruedInterestsResponse {
    /** Массив операций начисления купонов. */
    accruedInterests: AccruedInterest[];
}
/** Операция начисления купонов. */
export interface AccruedInterest {
    /** Дата и время выплаты в часовом поясе UTC. */
    date: Date | undefined;
    /** Величина выплаты. */
    value: Quotation | undefined;
    /** Величина выплаты в процентах от номинала. */
    valuePercent: Quotation | undefined;
    /** Номинал облигации. */
    nominal: Quotation | undefined;
}
/** Запрос информации о фьючерсе */
export interface GetFuturesMarginRequest {
    /** Идентификатор инструмента. */
    figi: string;
}
/** Данные по фьючерсу */
export interface GetFuturesMarginResponse {
    /** Гарантийное обеспечение при покупке. */
    initialMarginOnBuy: MoneyValue | undefined;
    /** Гарантийное обеспечение при продаже. */
    initialMarginOnSell: MoneyValue | undefined;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Стоимость шага цены. */
    minPriceIncrementAmount: Quotation | undefined;
}
/** Данные по инструменту. */
export interface InstrumentResponse {
    /** Основная информация об инструменте. */
    instrument: Instrument | undefined;
}
/** Объект передачи основной информации об инструменте. */
export interface Instrument {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код инструмента. */
    classCode: string;
    /** Isin-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР). 1 – клиент с повышенным уровнем риска (КПУР) */
    kshort: Quotation | undefined;
    /** ССтавка риска начальной маржи для КСУР лонг.Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
    countryOfRiskName: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Текущий режим торгов инструмента. */
    tradingStatus: SecurityTradingStatus;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов (биржа). */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС */
    blockedTcaFlag: boolean;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
}
/** Запрос дивидендов. */
export interface GetDividendsRequest {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Начало запрашиваемого периода в часовом поясе UTC. Фильтрация происходит по параметру *record_date* (дата фиксации реестра). */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. Фильтрация происходит по параметру *record_date* (дата фиксации реестра). */
    to: Date | undefined;
}
/** Дивиденды. */
export interface GetDividendsResponse {
    dividends: Dividend[];
}
/** Информация о выплате. */
export interface Dividend {
    /** Величина дивиденда на 1 ценную бумагу (включая валюту). */
    dividendNet: MoneyValue | undefined;
    /** Дата фактических выплат в часовом поясе UTC. */
    paymentDate: Date | undefined;
    /** Дата объявления дивидендов в часовом поясе UTC. */
    declaredDate: Date | undefined;
    /** Последний день (включительно) покупки для получения выплаты в часовом поясе UTC. */
    lastBuyDate: Date | undefined;
    /** Тип выплаты. Возможные значения: Regular Cash – регулярные выплаты, Cancelled – выплата отменена, Daily Accrual – ежедневное начисление, Return of Capital – возврат капитала, прочие типы выплат. */
    dividendType: string;
    /** Дата фиксации реестра в часовом поясе UTC. */
    recordDate: Date | undefined;
    /** Регулярность выплаты. Возможные значения: Annual – ежегодная, Semi-Anl – каждые полгода, прочие типы выплат. */
    regularity: string;
    /** Цена закрытия инструмента на момент ex_dividend_date. */
    closePrice: MoneyValue | undefined;
    /** Величина доходности. */
    yieldValue: Quotation | undefined;
    /** Дата и время создания записи в часовом поясе UTC. */
    createdAt: Date | undefined;
}
/** Запрос актива по идентификатору. */
export interface AssetRequest {
    /** uid-идентификатор актива. */
    id: string;
}
/** Данные по активу. */
export interface AssetResponse {
    /** Актив. */
    asset: AssetFull | undefined;
}
/** Запрос списка активов. */
export interface AssetsRequest {
    instrumentType: InstrumentType;
}
/** Список активов. */
export interface AssetsResponse {
    /** Активы. */
    assets: Asset[];
}
export interface AssetFull {
    /** Уникальный идентификатор актива. */
    uid: string;
    /** Тип актива. */
    type: AssetType;
    /** Наименование актива. */
    name: string;
    /** Короткое наименование актива. */
    nameBrief: string;
    /** Описание актива. */
    description: string;
    /** Дата и время удаления актива. */
    deletedAt: Date | undefined;
    /** Тестирование клиентов. */
    requiredTests: string[];
    /** Валюта. Обязательно и заполняется только для type = "ASSET_TYPE_CURRENCY". */
    currency?: AssetCurrency | undefined;
    /** Ценная бумага. Обязательно и заполняется только для type = "ASSET_TYPE_SECURITY". */
    security?: AssetSecurity | undefined;
    /** Номер государственной регистрации. */
    gosRegCode: string;
    /** Код CFI. */
    cfi: string;
    /** Код НРД инструмента. */
    codeNsd: string;
    /** Статус актива. */
    status: string;
    /** Бренд. */
    brand: Brand | undefined;
    /** Дата и время последнего обновления записи. */
    updatedAt: Date | undefined;
    /** Код типа ц.б. по классификации Банка России. */
    brCode: string;
    /** Наименование кода типа ц.б. по классификации Банка России. */
    brCodeName: string;
    /** Массив идентификаторов инструментов. */
    instruments: AssetInstrument[];
}
/** Информация об активе. */
export interface Asset {
    /** Уникальный идентификатор актива. */
    uid: string;
    /** Тип актива. */
    type: AssetType;
    /** Наименование актива. */
    name: string;
    /** Массив идентификаторов инструментов. */
    instruments: AssetInstrument[];
}
/** Валюта. */
export interface AssetCurrency {
    /** ISO-код валюты. */
    baseCurrency: string;
}
/** Ценная бумага. */
export interface AssetSecurity {
    /** ISIN-идентификатор ценной бумаги. */
    isin: string;
    /** Тип ценной бумаги. */
    type: string;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** Акция. Заполняется только для акций (тип актива asset.type = "ASSET_TYPE_SECURITY" и security.type = share). */
    share?: AssetShare | undefined;
    /** Облигация. Заполняется только для облигаций (тип актива asset.type = "ASSET_TYPE_SECURITY" и security.type = bond). */
    bond?: AssetBond | undefined;
    /** Структурная нота. Заполняется только для структурных продуктов (тип актива asset.type = "ASSET_TYPE_SECURITY" и security.type = sp). */
    sp?: AssetStructuredProduct | undefined;
    /** Фонд. Заполняется только для фондов (тип актива asset.type = "ASSET_TYPE_SECURITY" и security.type = etf). */
    etf?: AssetEtf | undefined;
    /** Клиринговый сертификат участия. Заполняется только для клиринговых сертификатов (тип актива asset.type = "ASSET_TYPE_SECURITY" и security.type = clearing_certificate). */
    clearingCertificate?: AssetClearingCertificate | undefined;
}
/** Акция. */
export interface AssetShare {
    /** Тип акции. */
    type: ShareType;
    /** Объем выпуска (шт.). */
    issueSize: Quotation | undefined;
    /** Номинал. */
    nominal: Quotation | undefined;
    /** Валюта номинала. */
    nominalCurrency: string;
    /** Индекс (Bloomberg). */
    primaryIndex: string;
    /** Ставка дивиденда (для привилегированных акций). */
    dividendRate: Quotation | undefined;
    /** Тип привилегированных акций. */
    preferredShareType: string;
    /** Дата IPO. */
    ipoDate: Date | undefined;
    /** Дата регистрации. */
    registryDate: Date | undefined;
    /** Признак наличия дивидендной доходности. */
    divYieldFlag: boolean;
    /** Форма выпуска ФИ. */
    issueKind: string;
    /** Дата размещения акции. */
    placementDate: Date | undefined;
    /** ISIN базового актива. */
    represIsin: string;
    /** Объявленное количество шт. */
    issueSizePlan: Quotation | undefined;
    /** Количество акций в свободном обращении. */
    totalFloat: Quotation | undefined;
}
/** Облигация. */
export interface AssetBond {
    /** Текущий номинал. */
    currentNominal: Quotation | undefined;
    /** Наименование заемщика. */
    borrowName: string;
    /** Объем эмиссии облигации (стоимость). */
    issueSize: Quotation | undefined;
    /** Номинал облигации. */
    nominal: Quotation | undefined;
    /** Валюта номинала. */
    nominalCurrency: string;
    /** Форма выпуска облигации. */
    issueKind: string;
    /** Форма дохода облигации. */
    interestKind: string;
    /** Количество выплат в год. */
    couponQuantityPerYear: number;
    /** Признак облигации с индексируемым номиналом. */
    indexedNominalFlag: boolean;
    /** Признак субординированной облигации. */
    subordinatedFlag: boolean;
    /** Признак обеспеченной облигации. */
    collateralFlag: boolean;
    /** Признак показывает, что купоны облигации не облагаются налогом (для mass market). */
    taxFreeFlag: boolean;
    /** Признак облигации с амортизацией долга. */
    amortizationFlag: boolean;
    /** Признак облигации с плавающим купоном. */
    floatingCouponFlag: boolean;
    /** Признак бессрочной облигации. */
    perpetualFlag: boolean;
    /** Дата погашения облигации. */
    maturityDate: Date | undefined;
    /** Описание и условия получения дополнительного дохода. */
    returnCondition: string;
    /** Дата выпуска облигации. */
    stateRegDate: Date | undefined;
    /** Дата размещения облигации. */
    placementDate: Date | undefined;
    /** Цена размещения облигации. */
    placementPrice: Quotation | undefined;
    /** Объявленное количество шт. */
    issueSizePlan: Quotation | undefined;
}
/** Структурная нота. */
export interface AssetStructuredProduct {
    /** Наименование заемщика. */
    borrowName: string;
    /** Номинал. */
    nominal: Quotation | undefined;
    /** Валюта номинала. */
    nominalCurrency: string;
    /** Тип структурной ноты. */
    type: StructuredProductType;
    /** Стратегия портфеля. */
    logicPortfolio: string;
    /** Тип базового актива. */
    assetType: AssetType;
    /** Вид базового актива в зависимости от типа базового актива. */
    basicAsset: string;
    /** Барьер сохранности (в процентах). */
    safetyBarrier: Quotation | undefined;
    /** Дата погашения. */
    maturityDate: Date | undefined;
    /** Объявленное количество шт. */
    issueSizePlan: Quotation | undefined;
    /** Объем размещения. */
    issueSize: Quotation | undefined;
    /** Дата размещения ноты. */
    placementDate: Date | undefined;
    /** Форма выпуска. */
    issueKind: string;
}
/** Фонд. */
export interface AssetEtf {
    /** Суммарные расходы фонда (в %). */
    totalExpense: Quotation | undefined;
    /** Барьерная ставка доходности после которой фонд имеет право на perfomance fee (в процентах). */
    hurdleRate: Quotation | undefined;
    /** Комиссия за успешные результаты фонда (в процентах). */
    performanceFee: Quotation | undefined;
    /** Фиксированная комиссия за управление (в процентах). */
    fixedCommission: Quotation | undefined;
    /** Тип распределения доходов от выплат по бумагам. */
    paymentType: string;
    /** Признак необходимости выхода фонда в плюс для получения комиссии. */
    watermarkFlag: boolean;
    /** Премия (надбавка к цене) при покупке доли в фонде (в процентах). */
    buyPremium: Quotation | undefined;
    /** Ставка дисконта (вычет из цены) при продаже доли в фонде (в процентах). */
    sellDiscount: Quotation | undefined;
    /** Признак ребалансируемости портфеля фонда. */
    rebalancingFlag: boolean;
    /** Периодичность ребалансировки. */
    rebalancingFreq: string;
    /** Тип управления. */
    managementType: string;
    /** Индекс, который реплицирует (старается копировать) фонд. */
    primaryIndex: string;
    /** База ETF. */
    focusType: string;
    /** Признак использования заемных активов (плечо). */
    leveragedFlag: boolean;
    /** Количество акций в обращении. */
    numShare: Quotation | undefined;
    /** Признак обязательства по отчетности перед регулятором. */
    ucitsFlag: boolean;
    /** Дата выпуска. */
    releasedDate: Date | undefined;
    /** Описание фонда. */
    description: string;
    /** Описание индекса, за которым следует фонд. */
    primaryIndexDescription: string;
    /** Основные компании, в которые вкладывается фонд. */
    primaryIndexCompany: string;
    /** Срок восстановления индекса (после просадки). */
    indexRecoveryPeriod: Quotation | undefined;
    /** IVAV-код. */
    inavCode: string;
    /** Признак наличия дивидендной доходности. */
    divYieldFlag: boolean;
    /** Комиссия на покрытие расходов фонда (в процентах). */
    expenseCommission: Quotation | undefined;
    /** Ошибка следования за индексом (в процентах). */
    primaryIndexTrackingError: Quotation | undefined;
    /** Плановая ребалансировка портфеля. */
    rebalancingPlan: string;
    /** Ставки налогообложения дивидендов и купонов. */
    taxRate: string;
    /** Даты ребалансировок. */
    rebalancingDates: Date[];
    /** Форма выпуска. */
    issueKind: string;
    /** Номинал. */
    nominal: Quotation | undefined;
    /** Валюта номинала. */
    nominalCurrency: string;
}
/** Клиринговый сертификат участия. */
export interface AssetClearingCertificate {
    /** Номинал. */
    nominal: Quotation | undefined;
    /** Валюта номинала. */
    nominalCurrency: string;
}
/** Бренд. */
export interface Brand {
    /** uid идентификатор бренда. */
    uid: string;
    /** Наименование бренда. */
    name: string;
    /** Описание. */
    description: string;
    /** Информация о бренде. */
    info: string;
    /** Компания. */
    company: string;
    /** Сектор. */
    sector: string;
    /** Код страны риска. */
    countryOfRisk: string;
    /** Наименование страны риска. */
    countryOfRiskName: string;
}
/** Идентификаторы инструмента. */
export interface AssetInstrument {
    /** uid идентификатор инструмента. */
    uid: string;
    /** figi идентификатор инструмента. */
    figi: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Массив связанных инструментов. */
    links: InstrumentLink[];
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** id позиции. */
    positionUid: string;
}
/** Связь с другим инструментом. */
export interface InstrumentLink {
    /** Тип связи. */
    type: string;
    /** uid идентификатор связанного инструмента. */
    instrumentUid: string;
}
/** Запрос списка избранных инструментов, входные параметры не требуются. */
export interface GetFavoritesRequest {
}
/** В ответ передаётся список избранных инструментов в качестве массива. */
export interface GetFavoritesResponse {
    /** Массив инструментов */
    favoriteInstruments: FavoriteInstrument[];
}
/** Массив избранных инструментов. */
export interface FavoriteInstrument {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код инструмента. */
    classCode: string;
    /** Isin-идентификатор инструмента. */
    isin: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
}
/** Запрос редактирования списка избранных инструментов. */
export interface EditFavoritesRequest {
    /** Массив инструментов. */
    instruments: EditFavoritesRequestInstrument[];
    /** Тип действия со списком. */
    actionType: EditFavoritesActionType;
}
/** Массив инструментов для редактирования списка избранных инструментов. */
export interface EditFavoritesRequestInstrument {
    /** Figi-идентификатор инструмента. */
    figi: string;
}
/** Результат редактирования списка избранных инструментов. */
export interface EditFavoritesResponse {
    /** Массив инструментов */
    favoriteInstruments: FavoriteInstrument[];
}
/** Запрос справочника стран. */
export interface GetCountriesRequest {
}
/** Справочник стран. */
export interface GetCountriesResponse {
    /** Массив стран. */
    countries: CountryResponse[];
}
/** Данные о стране. */
export interface CountryResponse {
    /** Двухбуквенный код страны. */
    alfaTwo: string;
    /** Трёхбуквенный код страны. */
    alfaThree: string;
    /** Наименование страны. */
    name: string;
    /** Краткое наименование страны. */
    nameBrief: string;
}
/** Запрос на поиск инструментов. */
export interface FindInstrumentRequest {
    /** Строка поиска. */
    query: string;
    /** Фильтр по типу инструмента. */
    instrumentKind: InstrumentType;
    /** Фильтр для отображения только торговых инструментов. */
    apiTradeAvailableFlag: boolean;
}
/** Результат поиска инструментов. */
export interface FindInstrumentResponse {
    /** Массив инструментов, удовлетворяющих условиям поиска. */
    instruments: InstrumentShort[];
}
/** Краткая информация об инструменте. */
export interface InstrumentShort {
    /** Isin инструмента. */
    isin: string;
    /** Figi инструмента. */
    figi: string;
    /** Ticker инструмента. */
    ticker: string;
    /** ClassCode инструмента. */
    classCode: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Название инструмента. */
    name: string;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** Параметр указывает на возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг отображающий доступность торговли инструментом по выходным */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС */
    blockedTcaFlag: boolean;
}
/** Запрос списка брендов. */
export interface GetBrandsRequest {
}
/** Запрос бренда. */
export interface GetBrandRequest {
    /** Uid-идентификатор бренда. */
    id: string;
}
/** Список брендов. */
export interface GetBrandsResponse {
    /** Массив брендов. */
    brands: Brand[];
}
export declare const TradingSchedulesRequest: MessageFns<TradingSchedulesRequest>;
export declare const TradingSchedulesResponse: MessageFns<TradingSchedulesResponse>;
export declare const TradingSchedule: MessageFns<TradingSchedule>;
export declare const TradingDay: MessageFns<TradingDay>;
export declare const InstrumentRequest: MessageFns<InstrumentRequest>;
export declare const InstrumentsRequest: MessageFns<InstrumentsRequest>;
export declare const FilterOptionsRequest: MessageFns<FilterOptionsRequest>;
export declare const BondResponse: MessageFns<BondResponse>;
export declare const BondsResponse: MessageFns<BondsResponse>;
export declare const GetBondCouponsRequest: MessageFns<GetBondCouponsRequest>;
export declare const GetBondCouponsResponse: MessageFns<GetBondCouponsResponse>;
export declare const Coupon: MessageFns<Coupon>;
export declare const CurrencyResponse: MessageFns<CurrencyResponse>;
export declare const CurrenciesResponse: MessageFns<CurrenciesResponse>;
export declare const EtfResponse: MessageFns<EtfResponse>;
export declare const EtfsResponse: MessageFns<EtfsResponse>;
export declare const FutureResponse: MessageFns<FutureResponse>;
export declare const FuturesResponse: MessageFns<FuturesResponse>;
export declare const OptionResponse: MessageFns<OptionResponse>;
export declare const OptionsResponse: MessageFns<OptionsResponse>;
export declare const Option: MessageFns<Option>;
export declare const ShareResponse: MessageFns<ShareResponse>;
export declare const SharesResponse: MessageFns<SharesResponse>;
export declare const Bond: MessageFns<Bond>;
export declare const Currency: MessageFns<Currency>;
export declare const Etf: MessageFns<Etf>;
export declare const Future: MessageFns<Future>;
export declare const Share: MessageFns<Share>;
export declare const GetAccruedInterestsRequest: MessageFns<GetAccruedInterestsRequest>;
export declare const GetAccruedInterestsResponse: MessageFns<GetAccruedInterestsResponse>;
export declare const AccruedInterest: MessageFns<AccruedInterest>;
export declare const GetFuturesMarginRequest: MessageFns<GetFuturesMarginRequest>;
export declare const GetFuturesMarginResponse: MessageFns<GetFuturesMarginResponse>;
export declare const InstrumentResponse: MessageFns<InstrumentResponse>;
export declare const Instrument: MessageFns<Instrument>;
export declare const GetDividendsRequest: MessageFns<GetDividendsRequest>;
export declare const GetDividendsResponse: MessageFns<GetDividendsResponse>;
export declare const Dividend: MessageFns<Dividend>;
export declare const AssetRequest: MessageFns<AssetRequest>;
export declare const AssetResponse: MessageFns<AssetResponse>;
export declare const AssetsRequest: MessageFns<AssetsRequest>;
export declare const AssetsResponse: MessageFns<AssetsResponse>;
export declare const AssetFull: MessageFns<AssetFull>;
export declare const Asset: MessageFns<Asset>;
export declare const AssetCurrency: MessageFns<AssetCurrency>;
export declare const AssetSecurity: MessageFns<AssetSecurity>;
export declare const AssetShare: MessageFns<AssetShare>;
export declare const AssetBond: MessageFns<AssetBond>;
export declare const AssetStructuredProduct: MessageFns<AssetStructuredProduct>;
export declare const AssetEtf: MessageFns<AssetEtf>;
export declare const AssetClearingCertificate: MessageFns<AssetClearingCertificate>;
export declare const Brand: MessageFns<Brand>;
export declare const AssetInstrument: MessageFns<AssetInstrument>;
export declare const InstrumentLink: MessageFns<InstrumentLink>;
export declare const GetFavoritesRequest: MessageFns<GetFavoritesRequest>;
export declare const GetFavoritesResponse: MessageFns<GetFavoritesResponse>;
export declare const FavoriteInstrument: MessageFns<FavoriteInstrument>;
export declare const EditFavoritesRequest: MessageFns<EditFavoritesRequest>;
export declare const EditFavoritesRequestInstrument: MessageFns<EditFavoritesRequestInstrument>;
export declare const EditFavoritesResponse: MessageFns<EditFavoritesResponse>;
export declare const GetCountriesRequest: MessageFns<GetCountriesRequest>;
export declare const GetCountriesResponse: MessageFns<GetCountriesResponse>;
export declare const CountryResponse: MessageFns<CountryResponse>;
export declare const FindInstrumentRequest: MessageFns<FindInstrumentRequest>;
export declare const FindInstrumentResponse: MessageFns<FindInstrumentResponse>;
export declare const InstrumentShort: MessageFns<InstrumentShort>;
export declare const GetBrandsRequest: MessageFns<GetBrandsRequest>;
export declare const GetBrandRequest: MessageFns<GetBrandRequest>;
export declare const GetBrandsResponse: MessageFns<GetBrandsResponse>;
/**
 * Сервис предназначен для получения:</br>**1**. информации об инструментах;</br>**2**.
 * расписания торговых сессий;</br>**3**. календаря выплат купонов по облигациям;</br>**4**.
 * размера гарантийного обеспечения по фьючерсам;</br>**5**. дивидендов по ценной бумаге.
 */
export type InstrumentsServiceDefinition = typeof InstrumentsServiceDefinition;
export declare const InstrumentsServiceDefinition: {
    readonly name: "InstrumentsService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.InstrumentsService";
    readonly methods: {
        /** Метод получения расписания торгов торговых площадок. */
        readonly tradingSchedules: {
            readonly name: "TradingSchedules";
            readonly requestType: MessageFns<TradingSchedulesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<TradingSchedulesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения облигации по её идентификатору. */
        readonly bondBy: {
            readonly name: "BondBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<BondResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка облигаций. */
        readonly bonds: {
            readonly name: "Bonds";
            readonly requestType: MessageFns<InstrumentsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<BondsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения графика выплат купонов по облигации. */
        readonly getBondCoupons: {
            readonly name: "GetBondCoupons";
            readonly requestType: MessageFns<GetBondCouponsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetBondCouponsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения валюты по её идентификатору. */
        readonly currencyBy: {
            readonly name: "CurrencyBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CurrencyResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка валют. */
        readonly currencies: {
            readonly name: "Currencies";
            readonly requestType: MessageFns<InstrumentsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CurrenciesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения инвестиционного фонда по его идентификатору. */
        readonly etfBy: {
            readonly name: "EtfBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<EtfResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка инвестиционных фондов. */
        readonly etfs: {
            readonly name: "Etfs";
            readonly requestType: MessageFns<InstrumentsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<EtfsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения фьючерса по его идентификатору. */
        readonly futureBy: {
            readonly name: "FutureBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<FutureResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка фьючерсов. */
        readonly futures: {
            readonly name: "Futures";
            readonly requestType: MessageFns<InstrumentsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<FuturesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения опциона по его идентификатору. */
        readonly optionBy: {
            readonly name: "OptionBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<OptionResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /**
         * Deprecated Метод получения списка опционов.
         *
         * @deprecated
         */
        readonly options: {
            readonly name: "Options";
            readonly requestType: MessageFns<InstrumentsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<OptionsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка опционов. */
        readonly optionsBy: {
            readonly name: "OptionsBy";
            readonly requestType: MessageFns<FilterOptionsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<OptionsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения акции по её идентификатору. */
        readonly shareBy: {
            readonly name: "ShareBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<ShareResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка акций. */
        readonly shares: {
            readonly name: "Shares";
            readonly requestType: MessageFns<InstrumentsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<SharesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения накопленного купонного дохода по облигации. */
        readonly getAccruedInterests: {
            readonly name: "GetAccruedInterests";
            readonly requestType: MessageFns<GetAccruedInterestsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetAccruedInterestsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения размера гарантийного обеспечения по фьючерсам. */
        readonly getFuturesMargin: {
            readonly name: "GetFuturesMargin";
            readonly requestType: MessageFns<GetFuturesMarginRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetFuturesMarginResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения основной информации об инструменте. */
        readonly getInstrumentBy: {
            readonly name: "GetInstrumentBy";
            readonly requestType: MessageFns<InstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<InstrumentResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод для получения событий выплаты дивидендов по инструменту. */
        readonly getDividends: {
            readonly name: "GetDividends";
            readonly requestType: MessageFns<GetDividendsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetDividendsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения актива по его идентификатору. */
        readonly getAssetBy: {
            readonly name: "GetAssetBy";
            readonly requestType: MessageFns<AssetRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<AssetResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка активов. Метод работает для всех инструментов, за исключением срочных - опционов и фьючерсов. */
        readonly getAssets: {
            readonly name: "GetAssets";
            readonly requestType: MessageFns<AssetsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<AssetsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка избранных инструментов. */
        readonly getFavorites: {
            readonly name: "GetFavorites";
            readonly requestType: MessageFns<GetFavoritesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetFavoritesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод редактирования списка избранных инструментов. */
        readonly editFavorites: {
            readonly name: "EditFavorites";
            readonly requestType: MessageFns<EditFavoritesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<EditFavoritesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка стран. */
        readonly getCountries: {
            readonly name: "GetCountries";
            readonly requestType: MessageFns<GetCountriesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetCountriesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод поиска инструмента. */
        readonly findInstrument: {
            readonly name: "FindInstrument";
            readonly requestType: MessageFns<FindInstrumentRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<FindInstrumentResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка брендов. */
        readonly getBrands: {
            readonly name: "GetBrands";
            readonly requestType: MessageFns<GetBrandsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetBrandsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения бренда по его идентификатору. */
        readonly getBrandBy: {
            readonly name: "GetBrandBy";
            readonly requestType: MessageFns<GetBrandRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<Brand>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface InstrumentsServiceImplementation<CallContextExt = {}> {
    /** Метод получения расписания торгов торговых площадок. */
    tradingSchedules(request: TradingSchedulesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<TradingSchedulesResponse>>;
    /** Метод получения облигации по её идентификатору. */
    bondBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<BondResponse>>;
    /** Метод получения списка облигаций. */
    bonds(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<BondsResponse>>;
    /** Метод получения графика выплат купонов по облигации. */
    getBondCoupons(request: GetBondCouponsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetBondCouponsResponse>>;
    /** Метод получения валюты по её идентификатору. */
    currencyBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CurrencyResponse>>;
    /** Метод получения списка валют. */
    currencies(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CurrenciesResponse>>;
    /** Метод получения инвестиционного фонда по его идентификатору. */
    etfBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<EtfResponse>>;
    /** Метод получения списка инвестиционных фондов. */
    etfs(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<EtfsResponse>>;
    /** Метод получения фьючерса по его идентификатору. */
    futureBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<FutureResponse>>;
    /** Метод получения списка фьючерсов. */
    futures(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<FuturesResponse>>;
    /** Метод получения опциона по его идентификатору. */
    optionBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OptionResponse>>;
    /**
     * Deprecated Метод получения списка опционов.
     *
     * @deprecated
     */
    options(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OptionsResponse>>;
    /** Метод получения списка опционов. */
    optionsBy(request: FilterOptionsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OptionsResponse>>;
    /** Метод получения акции по её идентификатору. */
    shareBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<ShareResponse>>;
    /** Метод получения списка акций. */
    shares(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<SharesResponse>>;
    /** Метод получения накопленного купонного дохода по облигации. */
    getAccruedInterests(request: GetAccruedInterestsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAccruedInterestsResponse>>;
    /** Метод получения размера гарантийного обеспечения по фьючерсам. */
    getFuturesMargin(request: GetFuturesMarginRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetFuturesMarginResponse>>;
    /** Метод получения основной информации об инструменте. */
    getInstrumentBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<InstrumentResponse>>;
    /** Метод для получения событий выплаты дивидендов по инструменту. */
    getDividends(request: GetDividendsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetDividendsResponse>>;
    /** Метод получения актива по его идентификатору. */
    getAssetBy(request: AssetRequest, context: CallContext & CallContextExt): Promise<DeepPartial<AssetResponse>>;
    /** Метод получения списка активов. Метод работает для всех инструментов, за исключением срочных - опционов и фьючерсов. */
    getAssets(request: AssetsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<AssetsResponse>>;
    /** Метод получения списка избранных инструментов. */
    getFavorites(request: GetFavoritesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetFavoritesResponse>>;
    /** Метод редактирования списка избранных инструментов. */
    editFavorites(request: EditFavoritesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<EditFavoritesResponse>>;
    /** Метод получения списка стран. */
    getCountries(request: GetCountriesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetCountriesResponse>>;
    /** Метод поиска инструмента. */
    findInstrument(request: FindInstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<FindInstrumentResponse>>;
    /** Метод получения списка брендов. */
    getBrands(request: GetBrandsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetBrandsResponse>>;
    /** Метод получения бренда по его идентификатору. */
    getBrandBy(request: GetBrandRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Brand>>;
}
export interface InstrumentsServiceClient<CallOptionsExt = {}> {
    /** Метод получения расписания торгов торговых площадок. */
    tradingSchedules(request: DeepPartial<TradingSchedulesRequest>, options?: CallOptions & CallOptionsExt): Promise<TradingSchedulesResponse>;
    /** Метод получения облигации по её идентификатору. */
    bondBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<BondResponse>;
    /** Метод получения списка облигаций. */
    bonds(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<BondsResponse>;
    /** Метод получения графика выплат купонов по облигации. */
    getBondCoupons(request: DeepPartial<GetBondCouponsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetBondCouponsResponse>;
    /** Метод получения валюты по её идентификатору. */
    currencyBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<CurrencyResponse>;
    /** Метод получения списка валют. */
    currencies(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<CurrenciesResponse>;
    /** Метод получения инвестиционного фонда по его идентификатору. */
    etfBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<EtfResponse>;
    /** Метод получения списка инвестиционных фондов. */
    etfs(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<EtfsResponse>;
    /** Метод получения фьючерса по его идентификатору. */
    futureBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<FutureResponse>;
    /** Метод получения списка фьючерсов. */
    futures(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<FuturesResponse>;
    /** Метод получения опциона по его идентификатору. */
    optionBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<OptionResponse>;
    /**
     * Deprecated Метод получения списка опционов.
     *
     * @deprecated
     */
    options(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<OptionsResponse>;
    /** Метод получения списка опционов. */
    optionsBy(request: DeepPartial<FilterOptionsRequest>, options?: CallOptions & CallOptionsExt): Promise<OptionsResponse>;
    /** Метод получения акции по её идентификатору. */
    shareBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<ShareResponse>;
    /** Метод получения списка акций. */
    shares(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<SharesResponse>;
    /** Метод получения накопленного купонного дохода по облигации. */
    getAccruedInterests(request: DeepPartial<GetAccruedInterestsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAccruedInterestsResponse>;
    /** Метод получения размера гарантийного обеспечения по фьючерсам. */
    getFuturesMargin(request: DeepPartial<GetFuturesMarginRequest>, options?: CallOptions & CallOptionsExt): Promise<GetFuturesMarginResponse>;
    /** Метод получения основной информации об инструменте. */
    getInstrumentBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<InstrumentResponse>;
    /** Метод для получения событий выплаты дивидендов по инструменту. */
    getDividends(request: DeepPartial<GetDividendsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetDividendsResponse>;
    /** Метод получения актива по его идентификатору. */
    getAssetBy(request: DeepPartial<AssetRequest>, options?: CallOptions & CallOptionsExt): Promise<AssetResponse>;
    /** Метод получения списка активов. Метод работает для всех инструментов, за исключением срочных - опционов и фьючерсов. */
    getAssets(request: DeepPartial<AssetsRequest>, options?: CallOptions & CallOptionsExt): Promise<AssetsResponse>;
    /** Метод получения списка избранных инструментов. */
    getFavorites(request: DeepPartial<GetFavoritesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetFavoritesResponse>;
    /** Метод редактирования списка избранных инструментов. */
    editFavorites(request: DeepPartial<EditFavoritesRequest>, options?: CallOptions & CallOptionsExt): Promise<EditFavoritesResponse>;
    /** Метод получения списка стран. */
    getCountries(request: DeepPartial<GetCountriesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetCountriesResponse>;
    /** Метод поиска инструмента. */
    findInstrument(request: DeepPartial<FindInstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<FindInstrumentResponse>;
    /** Метод получения списка брендов. */
    getBrands(request: DeepPartial<GetBrandsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetBrandsResponse>;
    /** Метод получения бренда по его идентификатору. */
    getBrandBy(request: DeepPartial<GetBrandRequest>, options?: CallOptions & CallOptionsExt): Promise<Brand>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
