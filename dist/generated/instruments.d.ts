import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { BrandData, InstrumentType, MoneyValue, Page, PageResponse, Quotation, SecurityTradingStatus } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Тип купонов. */
export declare enum CouponType {
    /** COUPON_TYPE_UNSPECIFIED - Неопределённое значение. */
    COUPON_TYPE_UNSPECIFIED = 0,
    /** COUPON_TYPE_CONSTANT - Постоянный. */
    COUPON_TYPE_CONSTANT = 1,
    /** COUPON_TYPE_FLOATING - Плавающий. */
    COUPON_TYPE_FLOATING = 2,
    /** COUPON_TYPE_DISCOUNT - Дисконт. */
    COUPON_TYPE_DISCOUNT = 3,
    /** COUPON_TYPE_MORTGAGE - Ипотечный. */
    COUPON_TYPE_MORTGAGE = 4,
    /** COUPON_TYPE_FIX - Фиксированный. */
    COUPON_TYPE_FIX = 5,
    /** COUPON_TYPE_VARIABLE - Переменный. */
    COUPON_TYPE_VARIABLE = 6,
    /** COUPON_TYPE_OTHER - Прочее. */
    COUPON_TYPE_OTHER = 7,
    UNRECOGNIZED = -1
}
export declare function couponTypeFromJSON(object: any): CouponType;
export declare function couponTypeToJSON(object: CouponType): string;
/** Тип опциона по направлению сделки. */
export declare enum OptionDirection {
    /** OPTION_DIRECTION_UNSPECIFIED - Тип не определён. */
    OPTION_DIRECTION_UNSPECIFIED = 0,
    /** OPTION_DIRECTION_PUT - Опцион на продажу. */
    OPTION_DIRECTION_PUT = 1,
    /** OPTION_DIRECTION_CALL - Опцион на покупку. */
    OPTION_DIRECTION_CALL = 2,
    UNRECOGNIZED = -1
}
export declare function optionDirectionFromJSON(object: any): OptionDirection;
export declare function optionDirectionToJSON(object: OptionDirection): string;
/** Тип расчётов по опциону. */
export declare enum OptionPaymentType {
    /** OPTION_PAYMENT_TYPE_UNSPECIFIED - Тип не определён. */
    OPTION_PAYMENT_TYPE_UNSPECIFIED = 0,
    /** OPTION_PAYMENT_TYPE_PREMIUM - Опционы с использованием премии в расчётах. */
    OPTION_PAYMENT_TYPE_PREMIUM = 1,
    /** OPTION_PAYMENT_TYPE_MARGINAL - Маржируемые опционы. */
    OPTION_PAYMENT_TYPE_MARGINAL = 2,
    UNRECOGNIZED = -1
}
export declare function optionPaymentTypeFromJSON(object: any): OptionPaymentType;
export declare function optionPaymentTypeToJSON(object: OptionPaymentType): string;
/** Тип опциона по стилю. */
export declare enum OptionStyle {
    /** OPTION_STYLE_UNSPECIFIED - Тип не определён. */
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
    /** OPTION_EXECUTION_TYPE_UNSPECIFIED - Тип не определён. */
    OPTION_EXECUTION_TYPE_UNSPECIFIED = 0,
    /** OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY - Поставочный тип опциона. */
    OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY = 1,
    /** OPTION_EXECUTION_TYPE_CASH_SETTLEMENT - Расчётный тип опциона. */
    OPTION_EXECUTION_TYPE_CASH_SETTLEMENT = 2,
    UNRECOGNIZED = -1
}
export declare function optionSettlementTypeFromJSON(object: any): OptionSettlementType;
export declare function optionSettlementTypeToJSON(object: OptionSettlementType): string;
/** Тип идентификатора инструмента. [Подробнее об идентификации инструментов](https://russianinvestments.github.io/investAPI/faq_identification/). */
export declare enum InstrumentIdType {
    /** INSTRUMENT_ID_UNSPECIFIED - Значение не определено. */
    INSTRUMENT_ID_UNSPECIFIED = 0,
    /** INSTRUMENT_ID_TYPE_FIGI - FIGI. */
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
    /** INSTRUMENT_STATUS_BASE - Базовый список инструментов (по умолчанию). Инструменты, доступные для торговли через Tinkoff Invest API. Cейчас списки бумаг, которые доступны из API и других интерфейсах совпадают — кроме внебиржевых бумаг. Но в будущем возможны ситуации, когда списки инструментов будут отличаться. */
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
    /** SHARE_TYPE_COMMON - Обыкновенная. */
    SHARE_TYPE_COMMON = 1,
    /** SHARE_TYPE_PREFERRED - Привилегированная. */
    SHARE_TYPE_PREFERRED = 2,
    /** SHARE_TYPE_ADR - Американские депозитарные расписки. */
    SHARE_TYPE_ADR = 3,
    /** SHARE_TYPE_GDR - Глобальные депозитарные расписки. */
    SHARE_TYPE_GDR = 4,
    /** SHARE_TYPE_MLP - Товарищество с ограниченной ответственностью. */
    SHARE_TYPE_MLP = 5,
    /** SHARE_TYPE_NY_REG_SHRS - Акции из реестра Нью-Йорка. */
    SHARE_TYPE_NY_REG_SHRS = 6,
    /** SHARE_TYPE_CLOSED_END_FUND - Закрытый инвестиционный фонд. */
    SHARE_TYPE_CLOSED_END_FUND = 7,
    /** SHARE_TYPE_REIT - Траст недвижимости. */
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
export declare enum Recommendation {
    /** RECOMMENDATION_UNSPECIFIED - Не определено. */
    RECOMMENDATION_UNSPECIFIED = 0,
    /** RECOMMENDATION_BUY - Покупать. */
    RECOMMENDATION_BUY = 1,
    /** RECOMMENDATION_HOLD - Держать. */
    RECOMMENDATION_HOLD = 2,
    /** RECOMMENDATION_SELL - Продавать. */
    RECOMMENDATION_SELL = 3,
    UNRECOGNIZED = -1
}
export declare function recommendationFromJSON(object: any): Recommendation;
export declare function recommendationToJSON(object: Recommendation): string;
/** Уровень риска облигации. */
export declare enum RiskLevel {
    /** RISK_LEVEL_UNSPECIFIED - Не указан. */
    RISK_LEVEL_UNSPECIFIED = 0,
    /** RISK_LEVEL_LOW - Низкий уровень риска. */
    RISK_LEVEL_LOW = 1,
    /** RISK_LEVEL_MODERATE - Средний уровень риска. */
    RISK_LEVEL_MODERATE = 2,
    /** RISK_LEVEL_HIGH - Высокий уровень риска. */
    RISK_LEVEL_HIGH = 3,
    UNRECOGNIZED = -1
}
export declare function riskLevelFromJSON(object: any): RiskLevel;
export declare function riskLevelToJSON(object: RiskLevel): string;
export declare enum BondType {
    /** BOND_TYPE_UNSPECIFIED - Тип облигации не определён. */
    BOND_TYPE_UNSPECIFIED = 0,
    /** BOND_TYPE_REPLACED - Замещающая облигация. */
    BOND_TYPE_REPLACED = 1,
    UNRECOGNIZED = -1
}
export declare function bondTypeFromJSON(object: any): BondType;
export declare function bondTypeToJSON(object: BondType): string;
/** Площадка торговли. */
export declare enum InstrumentExchangeType {
    /** INSTRUMENT_EXCHANGE_UNSPECIFIED - Площадка торговли не определена. */
    INSTRUMENT_EXCHANGE_UNSPECIFIED = 0,
    /** INSTRUMENT_EXCHANGE_DEALER - Бумага, торгуемая у дилера. */
    INSTRUMENT_EXCHANGE_DEALER = 1,
    UNRECOGNIZED = -1
}
export declare function instrumentExchangeTypeFromJSON(object: any): InstrumentExchangeType;
export declare function instrumentExchangeTypeToJSON(object: InstrumentExchangeType): string;
/** Запрос расписания торгов. */
export interface TradingSchedulesRequest {
    /** Наименование биржи или расчетного календаря. </br>Если не передаётся, возвращается информация по всем доступным торговым площадкам. */
    exchange?: string | undefined;
    /** Начало периода по UTC. */
    from?: Date | undefined;
    /** Окончание периода по UTC. */
    to?: Date | undefined;
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
    /** Время начала торгов по UTC. */
    startTime: Date | undefined;
    /** Время окончания торгов по UTC. */
    endTime: Date | undefined;
    /** Время начала аукциона открытия по UTC. */
    openingAuctionStartTime: Date | undefined;
    /** Время окончания аукциона закрытия по UTC. */
    closingAuctionEndTime: Date | undefined;
    /** Время начала аукциона открытия вечерней сессии по UTC. */
    eveningOpeningAuctionStartTime: Date | undefined;
    /** Время начала вечерней сессии по UTC. */
    eveningStartTime: Date | undefined;
    /** Время окончания вечерней сессии по UTC. */
    eveningEndTime: Date | undefined;
    /** Время начала основного клиринга по UTC. */
    clearingStartTime: Date | undefined;
    /** Время окончания основного клиринга по UTC. */
    clearingEndTime: Date | undefined;
    /** Время начала премаркета по UTC. */
    premarketStartTime: Date | undefined;
    /** Время окончания премаркета по UTC. */
    premarketEndTime: Date | undefined;
    /** Время начала аукциона закрытия по UTC. */
    closingAuctionStartTime: Date | undefined;
    /** Время окончания аукциона открытия по UTC. */
    openingAuctionEndTime: Date | undefined;
    /** Торговые интервалы. */
    intervals: TradingInterval[];
}
/** Запрос получения инструмента по идентификатору. */
export interface InstrumentRequest {
    /** Тип идентификатора инструмента. Возможные значения — `figi`, `ticker`. [Подробнее об идентификации инструментов](https://russianinvestments.github.io/investAPI/faq_identification/). */
    idType: InstrumentIdType;
    /** Идентификатор `class_code`. Обязательный, если `id_type = ticker`. */
    classCode?: string | undefined;
    /** Идентификатор запрашиваемого инструмента. */
    id: string;
}
/** Запрос получения инструментов. */
export interface InstrumentsRequest {
    /** Статус запрашиваемых инструментов. [Возможные значения](#instrumentstatus). */
    instrumentStatus?: InstrumentStatus | undefined;
    /** Тип площадки торговли. [Возможные значения](#instrumentexchangetype). */
    instrumentExchange?: InstrumentExchangeType | undefined;
}
/** Параметры фильтрации опционов. */
export interface FilterOptionsRequest {
    /** Идентификатор базового актива опциона.  Обязательный параметр. */
    basicAssetUid?: string | undefined;
    /** Идентификатор позиции базового актива опциона. */
    basicAssetPositionUid?: string | undefined;
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
    /**
     * FIGI-идентификатор инструмента.
     *
     * @deprecated
     */
    figi: string;
    /** Начало запрашиваемого периода по UTC. Фильтрация по `coupon_date` — дата выплаты купона. */
    from?: Date | undefined;
    /** Окончание запрашиваемого периода по UTC. Фильтрация по `coupon_date` — дата выплаты купона. */
    to?: Date | undefined;
    /** Идентификатор инструмента — `figi` или `instrument_uid`. */
    instrumentId: string;
}
/** Купоны по облигации. */
export interface GetBondCouponsResponse {
    events: Coupon[];
}
/** События по облигации. */
export interface GetBondEventsRequest {
    /** Начало запрашиваемого периода по UTC. */
    from?: Date | undefined;
    /** Окончание запрашиваемого периода по UTC. */
    to?: Date | undefined;
    /** Идентификатор инструмента — `figi` или `instrument_uid`. */
    instrumentId: string;
    /** Тип события */
    type: GetBondEventsRequest_EventType;
}
export declare enum GetBondEventsRequest_EventType {
    /** EVENT_TYPE_UNSPECIFIED - Неопределённое значение. */
    EVENT_TYPE_UNSPECIFIED = 0,
    /** EVENT_TYPE_CPN - Купон. */
    EVENT_TYPE_CPN = 1,
    /** EVENT_TYPE_CALL - Опцион (оферта). */
    EVENT_TYPE_CALL = 2,
    /** EVENT_TYPE_MTY - Погашение. */
    EVENT_TYPE_MTY = 3,
    /** EVENT_TYPE_CONV - Конвертация. */
    EVENT_TYPE_CONV = 4,
    UNRECOGNIZED = -1
}
export declare function getBondEventsRequest_EventTypeFromJSON(object: any): GetBondEventsRequest_EventType;
export declare function getBondEventsRequest_EventTypeToJSON(object: GetBondEventsRequest_EventType): string;
/** Объект передачи информации о событии облигации. */
export interface GetBondEventsResponse {
    events: GetBondEventsResponse_BondEvent[];
}
export interface GetBondEventsResponse_BondEvent {
    /** Идентификатор инструмента. */
    instrumentId: string;
    /** Номер события для данного типа события. */
    eventNumber: number;
    /** Дата события. */
    eventDate: Date | undefined;
    /** Тип события. */
    eventType: GetBondEventsRequest_EventType;
    /** Полное количество бумаг, задействованных в событии. */
    eventTotalVol: Quotation | undefined;
    /** Дата фиксации владельцев для участия в событии. */
    fixDate: Date | undefined;
    /** Дата определения даты или факта события. */
    rateDate: Date | undefined;
    /** Дата дефолта, если применимо. */
    defaultDate: Date | undefined;
    /** Дата реального исполнения обязательства. */
    realPayDate: Date | undefined;
    /** Дата выплаты. */
    payDate: Date | undefined;
    /** Выплата на одну облигацию. */
    payOneBond: MoneyValue | undefined;
    /** Выплаты на все бумаги, задействованные в событии. */
    moneyFlowVal: MoneyValue | undefined;
    /** Признак исполнения. */
    execution: string;
    /** Тип операции. */
    operationType: string;
    /** Стоимость операции — ставка купона, доля номинала, цена выкупа или коэффициент конвертации. */
    value: Quotation | undefined;
    /** Примечание. */
    note: string;
    /** ID выпуска бумаг, в который произведена конвертация (для конвертаций). */
    convertToFinToolId: string;
    /** Начало купонного периода. */
    couponStartDate: Date | undefined;
    /** Окончание купонного периода. */
    couponEndDate: Date | undefined;
    /** Купонный период. */
    couponPeriod: number;
    /** Ставка купона, процентов годовых. */
    couponInterestRate: Quotation | undefined;
}
/** Объект передачи информации о купоне облигации. */
export interface Coupon {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Дата выплаты купона. */
    couponDate: Date | undefined;
    /** Номер купона. */
    couponNumber: number;
    /** Дата фиксации реестра для выплаты купона — опционально. */
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
    /** Реальная площадка исполнения расчётов (биржа). Допустимые значения — `REAL_EXCHANGE_MOEX`, `REAL_EXCHANGE_RTS`. */
    realExchange: RealExchange;
    /** Направление опциона. */
    direction: OptionDirection;
    /** Тип расчётов по опциону. */
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
    /** Информация о бренде. */
    brand: BrandData | undefined;
    /** Количество бумаг в лоте. */
    lot: number;
    /** Размер основного актива. */
    basicAssetSize: Quotation | undefined;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
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
    /** Возможность покупки или продажи на ИИС. */
    forIisFlag: boolean;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Возможность торговать инструментом через API. */
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
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** ISIN-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру `lot`. [Подробнее](https://russianinvestments.github.io/investAPI/glossary#lot). */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Количество выплат по купонам в год. */
    couponQuantityPerYear: number;
    /** Дата погашения облигации по UTC. */
    maturityDate: Date | undefined;
    /** Номинал облигации. */
    nominal: MoneyValue | undefined;
    /** Первоначальный номинал облигации. */
    initialNominal: MoneyValue | undefined;
    /** Дата выпуска облигации по UTC. */
    stateRegDate: Date | undefined;
    /** Дата размещения по UTC. */
    placementDate: Date | undefined;
    /** Цена размещения. */
    placementPrice: MoneyValue | undefined;
    /** Значение НКД (накопленного купонного дохода) на дату. */
    aciValue: MoneyValue | undefined;
    /** Код страны риска — то есть страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска — то есть страны, в которой компания ведёт основной бизнес. */
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
    /** Уникальный идентификатор актива. */
    assetUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Признак субординированной облигации. */
    subordinatedFlag: boolean;
    /** Флаг достаточной ликвидности. */
    liquidityFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Уровень риска. */
    riskLevel: RiskLevel;
    /** Информация о бренде. */
    brand: BrandData | undefined;
    /** Тип облигации. */
    bondType: BondType;
}
/** Объект передачи информации о валюте. */
export interface Currency {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** ISIN-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру `lot`. [Подробнее](https://russianinvestments.github.io/investAPI/glossary#lot). */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Номинал. */
    nominal: MoneyValue | undefined;
    /** Код страны риска — то есть страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска — то есть страны, в которой компания ведёт основной бизнес. */
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
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Информация о бренде. */
    brand: BrandData | undefined;
}
/** Объект передачи информации об инвестиционном фонде. */
export interface Etf {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** ISIN-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру `lot`. [Подробнее](https://russianinvestments.github.io/investAPI/glossary#lot). */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
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
    /** Дата выпуска по UTC. */
    releasedDate: Date | undefined;
    /** Количество паев фонда в обращении. */
    numShares: Quotation | undefined;
    /** Код страны риска — то есть страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска — то есть страны, в которой компания ведёт основной бизнес. */
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
    /** Уникальный идентификатор актива. */
    assetUid: string;
    /** Тип площадки торговли. */
    instrumentExchange: InstrumentExchangeType;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** ФлагФлаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Флаг достаточной ликвидности. */
    liquidityFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Информация о бренде. */
    brand: BrandData | undefined;
}
/** Объект передачи информации о фьючерсе. */
export interface Future {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру `lot`. [Подробнее](https://russianinvestments.github.io/investAPI/glossary#lot). */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки риска в шорт ](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Дата начала обращения контракта по UTC. */
    firstTradeDate: Date | undefined;
    /** Дата по UTC, до которой возможно проведение операций с фьючерсом. */
    lastTradeDate: Date | undefined;
    /** Тип фьючерса. Возможные значения: </br>**physical_delivery** — физические поставки; </br>**cash_settlement** — денежный эквивалент. */
    futuresType: string;
    /** Тип актива. Возможные значения: </br>**commodity** — товар; </br>**currency** — валюта; </br>**security** — ценная бумага; </br>**index** — индекс. */
    assetType: string;
    /** Основной актив. */
    basicAsset: string;
    /** Размер основного актива. */
    basicAssetSize: Quotation | undefined;
    /** Код страны риска — то есть страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска — то есть страны, в которой компания ведёт основной бизнес. */
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
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Гарантийное обеспечение при покупке. */
    initialMarginOnBuy: MoneyValue | undefined;
    /** Гарантийное обеспечение при продаже. */
    initialMarginOnSell: MoneyValue | undefined;
    /** Стоимость шага цены. */
    minPriceIncrementAmount: Quotation | undefined;
    /** Информация о бренде. */
    brand: BrandData | undefined;
}
/** Объект передачи информации об акции. */
export interface Share {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код (секция торгов). */
    classCode: string;
    /** ISIN-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру `lot`. [Подробнее](https://russianinvestments.github.io/investAPI/glossary#lot) */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Дата IPO акции по UTC. */
    ipoDate: Date | undefined;
    /** Размер выпуска. */
    issueSize: number;
    /** Код страны риска — то есть страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска — то есть страны, в которой компания ведёт основной бизнес. */
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
    /** Тип акции. Возможные значения — `[ShareType](https://russianinvestments.github.io/investAPI/instruments#sharetype)`. */
    shareType: ShareType;
    /** Шаг цены. */
    minPriceIncrement: Quotation | undefined;
    /** Возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Реальная площадка исполнения расчётов (биржа). */
    realExchange: RealExchange;
    /** Уникальный идентификатор позиции инструмента. */
    positionUid: string;
    /** Уникальный идентификатор актива. */
    assetUid: string;
    /** Тип площадки торговли. */
    instrumentExchange: InstrumentExchangeType;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Флаг достаточной ликвидности. */
    liquidityFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Информация о бренде. */
    brand: BrandData | undefined;
}
/** Запрос НКД по облигации. */
export interface GetAccruedInterestsRequest {
    /**
     * FIGI-идентификатор инструмента.
     *
     * @deprecated
     */
    figi: string;
    /** Начало запрашиваемого периода по UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода по UTC. */
    to: Date | undefined;
    /** Идентификатор инструмента — `figi` или `instrument_uid`. */
    instrumentId: string;
}
/** НКД облигации. */
export interface GetAccruedInterestsResponse {
    /** Массив операций начисления купонов. */
    accruedInterests: AccruedInterest[];
}
/** Операция начисления купонов. */
export interface AccruedInterest {
    /** Дата и время выплаты по UTC. */
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
    /**
     * Идентификатор инструмента.
     *
     * @deprecated
     */
    figi: string;
    /** Идентификатор инструмента — `figi` или `instrument_uid`. */
    instrumentId: string;
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
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код инструмента. */
    classCode: string;
    /** ISIN-идентификатор инструмента. */
    isin: string;
    /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру `lot`. [Подробнее](https://russianinvestments.github.io/investAPI/glossary#lot). */
    lot: number;
    /** Валюта расчётов. */
    currency: string;
    /** Коэффициент ставки риска длинной позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    klong: Quotation | undefined;
    /** Коэффициент ставки риска короткой позиции по клиенту. 2 – клиент со стандартным уровнем риска (КСУР); 1 – клиент с повышенным уровнем риска (КПУР). */
    kshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlong: Quotation | undefined;
    /** Ставка риска начальной маржи для КСУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshort: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР лонг. [Подробнее про ставки риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/). */
    dlongMin: Quotation | undefined;
    /** Ставка риска начальной маржи для КПУР шорт. [Подробнее про ставки риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/). */
    dshortMin: Quotation | undefined;
    /** Признак доступности для операций в шорт. */
    shortEnabledFlag: boolean;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Код страны риска — то есть страны, в которой компания ведёт основной бизнес. */
    countryOfRisk: string;
    /** Наименование страны риска — то есть страны, в которой компания ведёт основной бизнес. */
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
    /** Уникальный идентификатор актива. */
    assetUid: string;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Информация о бренде. */
    brand: BrandData | undefined;
}
/** Запрос дивидендов. */
export interface GetDividendsRequest {
    /**
     * FIGI-идентификатор инструмента.
     *
     * @deprecated
     */
    figi: string;
    /** Начало запрашиваемого периода по UTC. Фильтрация происходит по параметру `record_date` — дата фиксации реестра. */
    from?: Date | undefined;
    /** Окончание запрашиваемого периода по UTC. Фильтрация происходит по параметру `record_date` — дата фиксации реестра. */
    to?: Date | undefined;
    /** Идентификатор инструмента — `figi` или `instrument_uid`. */
    instrumentId: string;
}
/** Дивиденды. */
export interface GetDividendsResponse {
    dividends: Dividend[];
}
/** Информация о выплате. */
export interface Dividend {
    /** Величина дивиденда на 1 ценную бумагу (включая валюту). */
    dividendNet: MoneyValue | undefined;
    /** Дата фактических выплат по UTC. */
    paymentDate: Date | undefined;
    /** Дата объявления дивидендов по UTC. */
    declaredDate: Date | undefined;
    /** Последний день (включительно) покупки для получения выплаты по UTC. */
    lastBuyDate: Date | undefined;
    /** Тип выплаты. Возможные значения: `Regular Cash` – регулярные выплаты, `Cancelled` – выплата отменена, `Daily Accrual` – ежедневное начисление, `Return of Capital` – возврат капитала, прочие типы выплат. */
    dividendType: string;
    /** Дата фиксации реестра по UTC. */
    recordDate: Date | undefined;
    /** Регулярность выплаты. Возможные значения: `Annual` – ежегодная, `Semi-Anl` – каждые полгода, прочие типы выплат. */
    regularity: string;
    /** Цена закрытия инструмента на момент `ex_dividend_date`. */
    closePrice: MoneyValue | undefined;
    /** Величина доходности. */
    yieldValue: Quotation | undefined;
    /** Дата и время создания записи по UTC. */
    createdAt: Date | undefined;
}
/** Запрос актива по идентификатору. */
export interface AssetRequest {
    /** UID-идентификатор актива. */
    id: string;
}
/** Данные по активу. */
export interface AssetResponse {
    /** Актив. */
    asset: AssetFull | undefined;
}
/** Запрос списка активов. */
export interface AssetsRequest {
    instrumentType?: InstrumentType | undefined;
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
    /** Валюта. Обязательно и заполняется только для `type = ASSET_TYPE_CURRENCY`. */
    currency?: AssetCurrency | undefined;
    /** Ценная бумага. Обязательно и заполняется только для `type = ASSET_TYPE_SECURITY`. */
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
    /** Акция. Заполняется только для акций — тип актива `asset.type = ASSET_TYPE_SECURITY` и `security.type = share`. */
    share?: AssetShare | undefined;
    /** Облигация. Заполняется только для облигаций — тип актива `asset.type = ASSET_TYPE_SECURITY` и `security.type = bond`. */
    bond?: AssetBond | undefined;
    /** Структурная нота. Заполняется только для структурных продуктов — тип актива `asset.type = ASSET_TYPE_SECURITY` и `security.type = sp`. */
    sp?: AssetStructuredProduct | undefined;
    /** Фонд. Заполняется только для фондов — тип актива `asset.type = ASSET_TYPE_SECURITY` и `security.type = etf`. */
    etf?: AssetEtf | undefined;
    /** Клиринговый сертификат участия. Заполняется только для клиринговых сертификатов — тип актива `asset.type = ASSET_TYPE_SECURITY` и security.type = `clearing_certificate`. */
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
    /** Объявленное количество, шт. */
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
    /** Признак показывает, что купоны облигации не облагаются налогом — для mass market. */
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
    /** Объявленное количество, шт. */
    issueSizePlan: Quotation | undefined;
}
/** Структурная нота. */
export interface AssetStructuredProduct {
    /** Наименование заёмщика. */
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
    /** Барьер сохранности в процентах. */
    safetyBarrier: Quotation | undefined;
    /** Дата погашения. */
    maturityDate: Date | undefined;
    /** Объявленное количество, шт. */
    issueSizePlan: Quotation | undefined;
    /** Объём размещения. */
    issueSize: Quotation | undefined;
    /** Дата размещения ноты. */
    placementDate: Date | undefined;
    /** Форма выпуска. */
    issueKind: string;
}
/** Фонд. */
export interface AssetEtf {
    /** Суммарные расходы фонда в процентах. */
    totalExpense: Quotation | undefined;
    /** Барьерная ставка доходности, после которой фонд имеет право на perfomance fee — в процентах. */
    hurdleRate: Quotation | undefined;
    /** Комиссия за успешные результаты фонда в процентах. */
    performanceFee: Quotation | undefined;
    /** Фиксированная комиссия за управление в процентах. */
    fixedCommission: Quotation | undefined;
    /** Тип распределения доходов от выплат по бумагам. */
    paymentType: string;
    /** Признак необходимости выхода фонда в плюс для получения комиссии. */
    watermarkFlag: boolean;
    /** Премия (надбавка к цене) при покупке доли в фонде — в процентах. */
    buyPremium: Quotation | undefined;
    /** Ставка дисконта (вычет из цены) при продаже доли в фонде — в процентах. */
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
    /** Срок восстановления индекса после просадки. */
    indexRecoveryPeriod: Quotation | undefined;
    /** IVAV-код. */
    inavCode: string;
    /** Признак наличия дивидендной доходности. */
    divYieldFlag: boolean;
    /** Комиссия на покрытие расходов фонда в процентах. */
    expenseCommission: Quotation | undefined;
    /** Ошибка следования за индексом в процентах. */
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
    /** UID-идентификатор бренда. */
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
    /** UID-идентификатор инструмента. */
    uid: string;
    /** FIGI-идентификатор инструмента. */
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
    /** ID позиции. */
    positionUid: string;
}
/** Связь с другим инструментом. */
export interface InstrumentLink {
    /** Тип связи. */
    type: string;
    /** UID-идентификатор связанного инструмента. */
    instrumentUid: string;
}
/** Запрос списка избранных инструментов, входные параметры не требуются. */
export interface GetFavoritesRequest {
}
/** В ответ передаётся список избранных инструментов в качестве массива. */
export interface GetFavoritesResponse {
    /** Массив инструментов. */
    favoriteInstruments: FavoriteInstrument[];
}
/** Массив избранных инструментов. */
export interface FavoriteInstrument {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код инструмента. */
    classCode: string;
    /** ISIN-идентификатор инструмента. */
    isin: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Название инструмента. */
    name: string;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Признак внебиржевой ценной бумаги. */
    otcFlag: boolean;
    /** Возможность торговать инструментом через API. */
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
    /**
     * FIGI-идентификатор инструмента.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Идентификатор инструмента — `figi` или `instrument_uid`. */
    instrumentId: string;
}
/** Результат редактирования списка избранных инструментов. */
export interface EditFavoritesResponse {
    /** Массив инструментов. */
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
/** Запрос справочника индексов и товаров */
export interface IndicativesRequest {
}
/** Справочник индексов и товаров */
export interface IndicativesResponse {
    /** Массив инструментов. */
    instruments: IndicativeResponse[];
}
/** Индикатив */
export interface IndicativeResponse {
    /** FIGI-идентификатор инструмента. */
    figi: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Класс-код инструмента. */
    classCode: string;
    /** Валюта расчётов. */
    currency: string;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** Название инструмента. */
    name: string;
    /** Tорговая площадка (секция биржи). */
    exchange: string;
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Признак доступности для покупки. */
    buyAvailableFlag: boolean;
    /** Признак доступности для продажи. */
    sellAvailableFlag: boolean;
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
    instrumentKind?: InstrumentType | undefined;
    /** Фильтр для отображения только торговых инструментов. */
    apiTradeAvailableFlag?: boolean | undefined;
}
/** Результат поиска инструментов. */
export interface FindInstrumentResponse {
    /** Массив инструментов, удовлетворяющих условиям поиска. */
    instruments: InstrumentShort[];
}
/** Краткая информация об инструменте. */
export interface InstrumentShort {
    /** ISIN инструмента. */
    isin: string;
    /** FIGI инструмента. */
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
    /** Возможность торговать инструментом через API. */
    apiTradeAvailableFlag: boolean;
    /** Признак доступности для ИИС. */
    forIisFlag: boolean;
    /** Дата первой минутной свечи. */
    first1minCandleDate: Date | undefined;
    /** Дата первой дневной свечи. */
    first1dayCandleDate: Date | undefined;
    /** Флаг, отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
    forQualInvestorFlag: boolean;
    /** Флаг, отображающий доступность торговли инструментом по выходным. */
    weekendFlag: boolean;
    /** Флаг заблокированного ТКС. */
    blockedTcaFlag: boolean;
}
/** Запрос списка брендов. */
export interface GetBrandsRequest {
    /** Настройки пагинации. */
    paging: Page | undefined;
}
/** Запрос бренда. */
export interface GetBrandRequest {
    /** UID-идентификатор бренда. */
    id: string;
}
/** Список брендов. */
export interface GetBrandsResponse {
    /** Массив брендов. */
    brands: Brand[];
    /** Данные по пагинации. */
    paging: PageResponse | undefined;
}
/** Запрос фундаментальных показателей */
export interface GetAssetFundamentalsRequest {
    /** Массив идентификаторов активов, не более 100 шт. */
    assets: string[];
}
/** Фундаментальные показатели */
export interface GetAssetFundamentalsResponse {
    fundamentals: GetAssetFundamentalsResponse_StatisticResponse[];
}
/** Фундаментальные показатели по активу */
export interface GetAssetFundamentalsResponse_StatisticResponse {
    /** Идентификатор актива. */
    assetUid: string;
    /** Валюта. */
    currency: string;
    /** Рыночная капитализация. */
    marketCapitalization: number;
    /** Максимум за год. */
    highPriceLast52Weeks: number;
    /** Минимум за год. */
    lowPriceLast52Weeks: number;
    /** Средний объём торгов за 10 дней. */
    averageDailyVolumeLast10Days: number;
    /** Средний объём торгов за месяц. */
    averageDailyVolumeLast4Weeks: number;
    beta: number;
    /** Доля акций в свободном обращении. */
    freeFloat: number;
    /** Процент форвардной дивидендной доходности по отношению к цене акций. */
    forwardAnnualDividendYield: number;
    /** Количество акций в обращении. */
    sharesOutstanding: number;
    /** Выручка. */
    revenueTtm: number;
    /** EBITDA — прибыль до вычета процентов, налогов, износа и амортизации. */
    ebitdaTtm: number;
    /** Чистая прибыль. */
    netIncomeTtm: number;
    /** EPS — величина чистой прибыли компании, которая приходится на каждую обыкновенную акцию. */
    epsTtm: number;
    /** EPS компании с допущением, что все конвертируемые ценные бумаги компании были сконвертированы в обыкновенные акции. */
    dilutedEpsTtm: number;
    /** Свободный денежный поток. */
    freeCashFlowTtm: number;
    /** Среднегодовой  рocт выручки за 5 лет. */
    fiveYearAnnualRevenueGrowthRate: number;
    /** Среднегодовой  рocт выручки за 3 года. */
    threeYearAnnualRevenueGrowthRate: number;
    /** Соотношение рыночной капитализации компании к её чистой прибыли. */
    peRatioTtm: number;
    /** Соотношение рыночной капитализации компании к её выручке. */
    priceToSalesTtm: number;
    /** Соотношение рыночной капитализации компании к её балансовой стоимости. */
    priceToBookTtm: number;
    /** Соотношение рыночной капитализации компании к её свободному денежному потоку. */
    priceToFreeCashFlowTtm: number;
    /** Рыночная стоимость компании. */
    totalEnterpriseValueMrq: number;
    /** Соотношение EV и EBITDA. */
    evToEbitdaMrq: number;
    /** Маржа чистой прибыли. */
    netMarginMrq: number;
    /** Рентабельность чистой прибыли. */
    netInterestMarginMrq: number;
    /** Рентабельность собственного капитала. */
    roe: number;
    /** Рентабельность активов. */
    roa: number;
    /** Рентабельность активов. */
    roic: number;
    /** Сумма краткосрочных и долгосрочных обязательств компании. */
    totalDebtMrq: number;
    /** Соотношение долга к собственному капиталу. */
    totalDebtToEquityMrq: number;
    /** Total Debt/EBITDA. */
    totalDebtToEbitdaMrq: number;
    /** Отношение свободногоо кэша к стоимости. */
    freeCashFlowToPrice: number;
    /** Отношение чистого долга к EBITDA. */
    netDebtToEbitda: number;
    /** Коэффициент текущей ликвидности. */
    currentRatioMrq: number;
    /** Коэффициент покрытия фиксированных платежей — FCCR. */
    fixedChargeCoverageRatioFy: number;
    /** Дивидендная доходность за 12 месяцев. */
    dividendYieldDailyTtm: number;
    /** Выплаченные дивиденды за 12 месяцев. */
    dividendRateTtm: number;
    /** Значение дивидендов на акцию. */
    dividendsPerShare: number;
    /** Средняя дивидендная доходность за 5 лет. */
    fiveYearsAverageDividendYield: number;
    /** Среднегодовой рост дивидендов за 5 лет. */
    fiveYearAnnualDividendGrowthRate: number;
    /** Процент чистой прибыли, уходящий на выплату дивидендов. */
    dividendPayoutRatioFy: number;
    /** Деньги, потраченные на обратный выкуп акций. */
    buyBackTtm: number;
    /** Рост выручки за 1 год. */
    oneYearAnnualRevenueGrowthRate: number;
    /** Код страны. */
    domicileIndicatorCode: string;
    /** Соотношение депозитарной расписки к акциям. */
    adrToCommonShareRatio: number;
    /** Количество сотрудников. */
    numberOfEmployees: number;
    exDividendDate: Date | undefined;
    /** Начало фискального периода. */
    fiscalPeriodStartDate: Date | undefined;
    /** Окончание фискального периода. */
    fiscalPeriodEndDate: Date | undefined;
    /** Изменение общего дохода за 5 лет. */
    revenueChangeFiveYears: number;
    /** Изменение EPS за 5 лет. */
    epsChangeFiveYears: number;
    /** Изменение EBIDTA за 5 лет. */
    ebitdaChangeFiveYears: number;
    /** Изменение общей задолжности за 5 лет. */
    totalDebtChangeFiveYears: number;
    /** Отношение EV к выручке. */
    evToSales: number;
}
/** Запрос отчетов эмитентов */
export interface GetAssetReportsRequest {
    /** Идентификатор инструмента в формате UID. */
    instrumentId: string;
    /** Начало запрашиваемого периода по UTC. */
    from?: Date | undefined;
    /** Окончание запрашиваемого периода по UTC. */
    to?: Date | undefined;
}
/** Отчеты эмитентов */
export interface GetAssetReportsResponse {
    /** Массив событий по облигации. */
    events: GetAssetReportsResponse_GetAssetReportsEvent[];
}
export declare enum GetAssetReportsResponse_AssetReportPeriodType {
    /** PERIOD_TYPE_UNSPECIFIED - Не указан. */
    PERIOD_TYPE_UNSPECIFIED = 0,
    /** PERIOD_TYPE_QUARTER - Квартальный. */
    PERIOD_TYPE_QUARTER = 1,
    /** PERIOD_TYPE_SEMIANNUAL - Полугодовой. */
    PERIOD_TYPE_SEMIANNUAL = 2,
    /** PERIOD_TYPE_ANNUAL - Годовой. */
    PERIOD_TYPE_ANNUAL = 3,
    UNRECOGNIZED = -1
}
export declare function getAssetReportsResponse_AssetReportPeriodTypeFromJSON(object: any): GetAssetReportsResponse_AssetReportPeriodType;
export declare function getAssetReportsResponse_AssetReportPeriodTypeToJSON(object: GetAssetReportsResponse_AssetReportPeriodType): string;
/** Отчет */
export interface GetAssetReportsResponse_GetAssetReportsEvent {
    /** Идентификатор инструмента. */
    instrumentId: string;
    /** Дата публикации отчёта. */
    reportDate: Date | undefined;
    /** Год периода отчета. */
    periodYear: number;
    /** Номер периода. */
    periodNum: number;
    /** Тип отчёта. */
    periodType: GetAssetReportsResponse_AssetReportPeriodType;
    /** Дата создания записи. */
    createdAt: Date | undefined;
}
/** Запрос консенсус-прогнозов */
export interface GetConsensusForecastsRequest {
    /** Настройки пагинации. */
    paging?: Page | undefined;
}
/** Консенсус-прогнозы */
export interface GetConsensusForecastsResponse {
    /** Массив прогнозов. */
    items: GetConsensusForecastsResponse_ConsensusForecastsItem[];
    /** Данные по пагинации. */
    page: PageResponse | undefined;
}
/** Прогноз */
export interface GetConsensusForecastsResponse_ConsensusForecastsItem {
    /** UID-идентификатор. */
    uid: string;
    /** UID-идентификатор актива. */
    assetUid: string;
    /** Дата и время создания записи. */
    createdAt: Date | undefined;
    /** Целевая цена на 12 месяцев. */
    bestTargetPrice: Quotation | undefined;
    /** Минимальная прогнозная цена. */
    bestTargetLow: Quotation | undefined;
    /** Максимальная прогнозная цена. */
    bestTargetHigh: Quotation | undefined;
    /** Количество аналитиков рекомендующих покупать. */
    totalBuyRecommend: number;
    /** Количество аналитиков рекомендующих держать. */
    totalHoldRecommend: number;
    /** Количество аналитиков рекомендующих продавать. */
    totalSellRecommend: number;
    /** Валюта прогнозов инструмента. */
    currency: string;
    /** Консенсус-прогноз. */
    consensus: Recommendation;
    /** Дата прогноза. */
    prognosisDate: Date | undefined;
}
/** Запрос прогнозов инвестдомов. */
export interface GetForecastRequest {
    /** Идентификатор инструмента. */
    instrumentId: string;
}
/** Прогнозы инвестдомов по инструменту. */
export interface GetForecastResponse {
    /** Массив прогнозов. */
    targets: GetForecastResponse_TargetItem[];
    /** Согласованный прогноз. */
    consensus: GetForecastResponse_ConsensusItem | undefined;
}
/** Прогноз */
export interface GetForecastResponse_TargetItem {
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Название компании, давшей прогноз. */
    company: string;
    /** Прогноз. */
    recommendation: Recommendation;
    /** Дата прогноза. */
    recommendationDate: Date | undefined;
    /** Валюта. */
    currency: string;
    /** Текущая цена. */
    currentPrice: Quotation | undefined;
    /** Прогнозируемая цена. */
    targetPrice: Quotation | undefined;
    /** Изменение цены. */
    priceChange: Quotation | undefined;
    /** Относительное изменение цены. */
    priceChangeRel: Quotation | undefined;
    /** Наименование инструмента. */
    showName: string;
}
/** Консенсус-прогноз. */
export interface GetForecastResponse_ConsensusItem {
    /** Уникальный идентификатор инструмента. */
    uid: string;
    /** Тикер инструмента. */
    ticker: string;
    /** Прогноз. */
    recommendation: Recommendation;
    /** Валюта. */
    currency: string;
    /** Текущая цена. */
    currentPrice: Quotation | undefined;
    /** Прогнозируемая цена. */
    consensus: Quotation | undefined;
    /** Минимальная цена прогноза. */
    minTarget: Quotation | undefined;
    /** Максимальная цена прогноза. */
    maxTarget: Quotation | undefined;
    /** Изменение цены. */
    priceChange: Quotation | undefined;
    /** Относительное изменение цены. */
    priceChangeRel: Quotation | undefined;
}
export interface TradingInterval {
    /** Название интервала. */
    type: string;
    /** Интервал. */
    interval: TradingInterval_TimeInterval | undefined;
}
export interface TradingInterval_TimeInterval {
    /** Время начала интервала. */
    startTs: Date | undefined;
    /** Время окончания интервала. */
    endTs: Date | undefined;
}
export declare const TradingSchedulesRequest: {
    encode(message: TradingSchedulesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingSchedulesRequest;
    fromJSON(object: any): TradingSchedulesRequest;
    toJSON(message: TradingSchedulesRequest): unknown;
    create(base?: DeepPartial<TradingSchedulesRequest>): TradingSchedulesRequest;
    fromPartial(object: DeepPartial<TradingSchedulesRequest>): TradingSchedulesRequest;
};
export declare const TradingSchedulesResponse: {
    encode(message: TradingSchedulesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingSchedulesResponse;
    fromJSON(object: any): TradingSchedulesResponse;
    toJSON(message: TradingSchedulesResponse): unknown;
    create(base?: DeepPartial<TradingSchedulesResponse>): TradingSchedulesResponse;
    fromPartial(object: DeepPartial<TradingSchedulesResponse>): TradingSchedulesResponse;
};
export declare const TradingSchedule: {
    encode(message: TradingSchedule, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingSchedule;
    fromJSON(object: any): TradingSchedule;
    toJSON(message: TradingSchedule): unknown;
    create(base?: DeepPartial<TradingSchedule>): TradingSchedule;
    fromPartial(object: DeepPartial<TradingSchedule>): TradingSchedule;
};
export declare const TradingDay: {
    encode(message: TradingDay, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingDay;
    fromJSON(object: any): TradingDay;
    toJSON(message: TradingDay): unknown;
    create(base?: DeepPartial<TradingDay>): TradingDay;
    fromPartial(object: DeepPartial<TradingDay>): TradingDay;
};
export declare const InstrumentRequest: {
    encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
    fromJSON(object: any): InstrumentRequest;
    toJSON(message: InstrumentRequest): unknown;
    create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
    fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
};
export declare const InstrumentsRequest: {
    encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
    fromJSON(object: any): InstrumentsRequest;
    toJSON(message: InstrumentsRequest): unknown;
    create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
    fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
};
export declare const FilterOptionsRequest: {
    encode(message: FilterOptionsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FilterOptionsRequest;
    fromJSON(object: any): FilterOptionsRequest;
    toJSON(message: FilterOptionsRequest): unknown;
    create(base?: DeepPartial<FilterOptionsRequest>): FilterOptionsRequest;
    fromPartial(object: DeepPartial<FilterOptionsRequest>): FilterOptionsRequest;
};
export declare const BondResponse: {
    encode(message: BondResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BondResponse;
    fromJSON(object: any): BondResponse;
    toJSON(message: BondResponse): unknown;
    create(base?: DeepPartial<BondResponse>): BondResponse;
    fromPartial(object: DeepPartial<BondResponse>): BondResponse;
};
export declare const BondsResponse: {
    encode(message: BondsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BondsResponse;
    fromJSON(object: any): BondsResponse;
    toJSON(message: BondsResponse): unknown;
    create(base?: DeepPartial<BondsResponse>): BondsResponse;
    fromPartial(object: DeepPartial<BondsResponse>): BondsResponse;
};
export declare const GetBondCouponsRequest: {
    encode(message: GetBondCouponsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBondCouponsRequest;
    fromJSON(object: any): GetBondCouponsRequest;
    toJSON(message: GetBondCouponsRequest): unknown;
    create(base?: DeepPartial<GetBondCouponsRequest>): GetBondCouponsRequest;
    fromPartial(object: DeepPartial<GetBondCouponsRequest>): GetBondCouponsRequest;
};
export declare const GetBondCouponsResponse: {
    encode(message: GetBondCouponsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBondCouponsResponse;
    fromJSON(object: any): GetBondCouponsResponse;
    toJSON(message: GetBondCouponsResponse): unknown;
    create(base?: DeepPartial<GetBondCouponsResponse>): GetBondCouponsResponse;
    fromPartial(object: DeepPartial<GetBondCouponsResponse>): GetBondCouponsResponse;
};
export declare const GetBondEventsRequest: {
    encode(message: GetBondEventsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBondEventsRequest;
    fromJSON(object: any): GetBondEventsRequest;
    toJSON(message: GetBondEventsRequest): unknown;
    create(base?: DeepPartial<GetBondEventsRequest>): GetBondEventsRequest;
    fromPartial(object: DeepPartial<GetBondEventsRequest>): GetBondEventsRequest;
};
export declare const GetBondEventsResponse: {
    encode(message: GetBondEventsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBondEventsResponse;
    fromJSON(object: any): GetBondEventsResponse;
    toJSON(message: GetBondEventsResponse): unknown;
    create(base?: DeepPartial<GetBondEventsResponse>): GetBondEventsResponse;
    fromPartial(object: DeepPartial<GetBondEventsResponse>): GetBondEventsResponse;
};
export declare const GetBondEventsResponse_BondEvent: {
    encode(message: GetBondEventsResponse_BondEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBondEventsResponse_BondEvent;
    fromJSON(object: any): GetBondEventsResponse_BondEvent;
    toJSON(message: GetBondEventsResponse_BondEvent): unknown;
    create(base?: DeepPartial<GetBondEventsResponse_BondEvent>): GetBondEventsResponse_BondEvent;
    fromPartial(object: DeepPartial<GetBondEventsResponse_BondEvent>): GetBondEventsResponse_BondEvent;
};
export declare const Coupon: {
    encode(message: Coupon, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Coupon;
    fromJSON(object: any): Coupon;
    toJSON(message: Coupon): unknown;
    create(base?: DeepPartial<Coupon>): Coupon;
    fromPartial(object: DeepPartial<Coupon>): Coupon;
};
export declare const CurrencyResponse: {
    encode(message: CurrencyResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CurrencyResponse;
    fromJSON(object: any): CurrencyResponse;
    toJSON(message: CurrencyResponse): unknown;
    create(base?: DeepPartial<CurrencyResponse>): CurrencyResponse;
    fromPartial(object: DeepPartial<CurrencyResponse>): CurrencyResponse;
};
export declare const CurrenciesResponse: {
    encode(message: CurrenciesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CurrenciesResponse;
    fromJSON(object: any): CurrenciesResponse;
    toJSON(message: CurrenciesResponse): unknown;
    create(base?: DeepPartial<CurrenciesResponse>): CurrenciesResponse;
    fromPartial(object: DeepPartial<CurrenciesResponse>): CurrenciesResponse;
};
export declare const EtfResponse: {
    encode(message: EtfResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EtfResponse;
    fromJSON(object: any): EtfResponse;
    toJSON(message: EtfResponse): unknown;
    create(base?: DeepPartial<EtfResponse>): EtfResponse;
    fromPartial(object: DeepPartial<EtfResponse>): EtfResponse;
};
export declare const EtfsResponse: {
    encode(message: EtfsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EtfsResponse;
    fromJSON(object: any): EtfsResponse;
    toJSON(message: EtfsResponse): unknown;
    create(base?: DeepPartial<EtfsResponse>): EtfsResponse;
    fromPartial(object: DeepPartial<EtfsResponse>): EtfsResponse;
};
export declare const FutureResponse: {
    encode(message: FutureResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FutureResponse;
    fromJSON(object: any): FutureResponse;
    toJSON(message: FutureResponse): unknown;
    create(base?: DeepPartial<FutureResponse>): FutureResponse;
    fromPartial(object: DeepPartial<FutureResponse>): FutureResponse;
};
export declare const FuturesResponse: {
    encode(message: FuturesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FuturesResponse;
    fromJSON(object: any): FuturesResponse;
    toJSON(message: FuturesResponse): unknown;
    create(base?: DeepPartial<FuturesResponse>): FuturesResponse;
    fromPartial(object: DeepPartial<FuturesResponse>): FuturesResponse;
};
export declare const OptionResponse: {
    encode(message: OptionResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OptionResponse;
    fromJSON(object: any): OptionResponse;
    toJSON(message: OptionResponse): unknown;
    create(base?: DeepPartial<OptionResponse>): OptionResponse;
    fromPartial(object: DeepPartial<OptionResponse>): OptionResponse;
};
export declare const OptionsResponse: {
    encode(message: OptionsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OptionsResponse;
    fromJSON(object: any): OptionsResponse;
    toJSON(message: OptionsResponse): unknown;
    create(base?: DeepPartial<OptionsResponse>): OptionsResponse;
    fromPartial(object: DeepPartial<OptionsResponse>): OptionsResponse;
};
export declare const Option: {
    encode(message: Option, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Option;
    fromJSON(object: any): Option;
    toJSON(message: Option): unknown;
    create(base?: DeepPartial<Option>): Option;
    fromPartial(object: DeepPartial<Option>): Option;
};
export declare const ShareResponse: {
    encode(message: ShareResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ShareResponse;
    fromJSON(object: any): ShareResponse;
    toJSON(message: ShareResponse): unknown;
    create(base?: DeepPartial<ShareResponse>): ShareResponse;
    fromPartial(object: DeepPartial<ShareResponse>): ShareResponse;
};
export declare const SharesResponse: {
    encode(message: SharesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SharesResponse;
    fromJSON(object: any): SharesResponse;
    toJSON(message: SharesResponse): unknown;
    create(base?: DeepPartial<SharesResponse>): SharesResponse;
    fromPartial(object: DeepPartial<SharesResponse>): SharesResponse;
};
export declare const Bond: {
    encode(message: Bond, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Bond;
    fromJSON(object: any): Bond;
    toJSON(message: Bond): unknown;
    create(base?: DeepPartial<Bond>): Bond;
    fromPartial(object: DeepPartial<Bond>): Bond;
};
export declare const Currency: {
    encode(message: Currency, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Currency;
    fromJSON(object: any): Currency;
    toJSON(message: Currency): unknown;
    create(base?: DeepPartial<Currency>): Currency;
    fromPartial(object: DeepPartial<Currency>): Currency;
};
export declare const Etf: {
    encode(message: Etf, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Etf;
    fromJSON(object: any): Etf;
    toJSON(message: Etf): unknown;
    create(base?: DeepPartial<Etf>): Etf;
    fromPartial(object: DeepPartial<Etf>): Etf;
};
export declare const Future: {
    encode(message: Future, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Future;
    fromJSON(object: any): Future;
    toJSON(message: Future): unknown;
    create(base?: DeepPartial<Future>): Future;
    fromPartial(object: DeepPartial<Future>): Future;
};
export declare const Share: {
    encode(message: Share, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Share;
    fromJSON(object: any): Share;
    toJSON(message: Share): unknown;
    create(base?: DeepPartial<Share>): Share;
    fromPartial(object: DeepPartial<Share>): Share;
};
export declare const GetAccruedInterestsRequest: {
    encode(message: GetAccruedInterestsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAccruedInterestsRequest;
    fromJSON(object: any): GetAccruedInterestsRequest;
    toJSON(message: GetAccruedInterestsRequest): unknown;
    create(base?: DeepPartial<GetAccruedInterestsRequest>): GetAccruedInterestsRequest;
    fromPartial(object: DeepPartial<GetAccruedInterestsRequest>): GetAccruedInterestsRequest;
};
export declare const GetAccruedInterestsResponse: {
    encode(message: GetAccruedInterestsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAccruedInterestsResponse;
    fromJSON(object: any): GetAccruedInterestsResponse;
    toJSON(message: GetAccruedInterestsResponse): unknown;
    create(base?: DeepPartial<GetAccruedInterestsResponse>): GetAccruedInterestsResponse;
    fromPartial(object: DeepPartial<GetAccruedInterestsResponse>): GetAccruedInterestsResponse;
};
export declare const AccruedInterest: {
    encode(message: AccruedInterest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AccruedInterest;
    fromJSON(object: any): AccruedInterest;
    toJSON(message: AccruedInterest): unknown;
    create(base?: DeepPartial<AccruedInterest>): AccruedInterest;
    fromPartial(object: DeepPartial<AccruedInterest>): AccruedInterest;
};
export declare const GetFuturesMarginRequest: {
    encode(message: GetFuturesMarginRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetFuturesMarginRequest;
    fromJSON(object: any): GetFuturesMarginRequest;
    toJSON(message: GetFuturesMarginRequest): unknown;
    create(base?: DeepPartial<GetFuturesMarginRequest>): GetFuturesMarginRequest;
    fromPartial(object: DeepPartial<GetFuturesMarginRequest>): GetFuturesMarginRequest;
};
export declare const GetFuturesMarginResponse: {
    encode(message: GetFuturesMarginResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetFuturesMarginResponse;
    fromJSON(object: any): GetFuturesMarginResponse;
    toJSON(message: GetFuturesMarginResponse): unknown;
    create(base?: DeepPartial<GetFuturesMarginResponse>): GetFuturesMarginResponse;
    fromPartial(object: DeepPartial<GetFuturesMarginResponse>): GetFuturesMarginResponse;
};
export declare const InstrumentResponse: {
    encode(message: InstrumentResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentResponse;
    fromJSON(object: any): InstrumentResponse;
    toJSON(message: InstrumentResponse): unknown;
    create(base?: DeepPartial<InstrumentResponse>): InstrumentResponse;
    fromPartial(object: DeepPartial<InstrumentResponse>): InstrumentResponse;
};
export declare const Instrument: {
    encode(message: Instrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Instrument;
    fromJSON(object: any): Instrument;
    toJSON(message: Instrument): unknown;
    create(base?: DeepPartial<Instrument>): Instrument;
    fromPartial(object: DeepPartial<Instrument>): Instrument;
};
export declare const GetDividendsRequest: {
    encode(message: GetDividendsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsRequest;
    fromJSON(object: any): GetDividendsRequest;
    toJSON(message: GetDividendsRequest): unknown;
    create(base?: DeepPartial<GetDividendsRequest>): GetDividendsRequest;
    fromPartial(object: DeepPartial<GetDividendsRequest>): GetDividendsRequest;
};
export declare const GetDividendsResponse: {
    encode(message: GetDividendsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsResponse;
    fromJSON(object: any): GetDividendsResponse;
    toJSON(message: GetDividendsResponse): unknown;
    create(base?: DeepPartial<GetDividendsResponse>): GetDividendsResponse;
    fromPartial(object: DeepPartial<GetDividendsResponse>): GetDividendsResponse;
};
export declare const Dividend: {
    encode(message: Dividend, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Dividend;
    fromJSON(object: any): Dividend;
    toJSON(message: Dividend): unknown;
    create(base?: DeepPartial<Dividend>): Dividend;
    fromPartial(object: DeepPartial<Dividend>): Dividend;
};
export declare const AssetRequest: {
    encode(message: AssetRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetRequest;
    fromJSON(object: any): AssetRequest;
    toJSON(message: AssetRequest): unknown;
    create(base?: DeepPartial<AssetRequest>): AssetRequest;
    fromPartial(object: DeepPartial<AssetRequest>): AssetRequest;
};
export declare const AssetResponse: {
    encode(message: AssetResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetResponse;
    fromJSON(object: any): AssetResponse;
    toJSON(message: AssetResponse): unknown;
    create(base?: DeepPartial<AssetResponse>): AssetResponse;
    fromPartial(object: DeepPartial<AssetResponse>): AssetResponse;
};
export declare const AssetsRequest: {
    encode(message: AssetsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetsRequest;
    fromJSON(object: any): AssetsRequest;
    toJSON(message: AssetsRequest): unknown;
    create(base?: DeepPartial<AssetsRequest>): AssetsRequest;
    fromPartial(object: DeepPartial<AssetsRequest>): AssetsRequest;
};
export declare const AssetsResponse: {
    encode(message: AssetsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetsResponse;
    fromJSON(object: any): AssetsResponse;
    toJSON(message: AssetsResponse): unknown;
    create(base?: DeepPartial<AssetsResponse>): AssetsResponse;
    fromPartial(object: DeepPartial<AssetsResponse>): AssetsResponse;
};
export declare const AssetFull: {
    encode(message: AssetFull, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetFull;
    fromJSON(object: any): AssetFull;
    toJSON(message: AssetFull): unknown;
    create(base?: DeepPartial<AssetFull>): AssetFull;
    fromPartial(object: DeepPartial<AssetFull>): AssetFull;
};
export declare const Asset: {
    encode(message: Asset, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Asset;
    fromJSON(object: any): Asset;
    toJSON(message: Asset): unknown;
    create(base?: DeepPartial<Asset>): Asset;
    fromPartial(object: DeepPartial<Asset>): Asset;
};
export declare const AssetCurrency: {
    encode(message: AssetCurrency, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetCurrency;
    fromJSON(object: any): AssetCurrency;
    toJSON(message: AssetCurrency): unknown;
    create(base?: DeepPartial<AssetCurrency>): AssetCurrency;
    fromPartial(object: DeepPartial<AssetCurrency>): AssetCurrency;
};
export declare const AssetSecurity: {
    encode(message: AssetSecurity, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetSecurity;
    fromJSON(object: any): AssetSecurity;
    toJSON(message: AssetSecurity): unknown;
    create(base?: DeepPartial<AssetSecurity>): AssetSecurity;
    fromPartial(object: DeepPartial<AssetSecurity>): AssetSecurity;
};
export declare const AssetShare: {
    encode(message: AssetShare, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetShare;
    fromJSON(object: any): AssetShare;
    toJSON(message: AssetShare): unknown;
    create(base?: DeepPartial<AssetShare>): AssetShare;
    fromPartial(object: DeepPartial<AssetShare>): AssetShare;
};
export declare const AssetBond: {
    encode(message: AssetBond, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetBond;
    fromJSON(object: any): AssetBond;
    toJSON(message: AssetBond): unknown;
    create(base?: DeepPartial<AssetBond>): AssetBond;
    fromPartial(object: DeepPartial<AssetBond>): AssetBond;
};
export declare const AssetStructuredProduct: {
    encode(message: AssetStructuredProduct, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetStructuredProduct;
    fromJSON(object: any): AssetStructuredProduct;
    toJSON(message: AssetStructuredProduct): unknown;
    create(base?: DeepPartial<AssetStructuredProduct>): AssetStructuredProduct;
    fromPartial(object: DeepPartial<AssetStructuredProduct>): AssetStructuredProduct;
};
export declare const AssetEtf: {
    encode(message: AssetEtf, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetEtf;
    fromJSON(object: any): AssetEtf;
    toJSON(message: AssetEtf): unknown;
    create(base?: DeepPartial<AssetEtf>): AssetEtf;
    fromPartial(object: DeepPartial<AssetEtf>): AssetEtf;
};
export declare const AssetClearingCertificate: {
    encode(message: AssetClearingCertificate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetClearingCertificate;
    fromJSON(object: any): AssetClearingCertificate;
    toJSON(message: AssetClearingCertificate): unknown;
    create(base?: DeepPartial<AssetClearingCertificate>): AssetClearingCertificate;
    fromPartial(object: DeepPartial<AssetClearingCertificate>): AssetClearingCertificate;
};
export declare const Brand: {
    encode(message: Brand, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Brand;
    fromJSON(object: any): Brand;
    toJSON(message: Brand): unknown;
    create(base?: DeepPartial<Brand>): Brand;
    fromPartial(object: DeepPartial<Brand>): Brand;
};
export declare const AssetInstrument: {
    encode(message: AssetInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetInstrument;
    fromJSON(object: any): AssetInstrument;
    toJSON(message: AssetInstrument): unknown;
    create(base?: DeepPartial<AssetInstrument>): AssetInstrument;
    fromPartial(object: DeepPartial<AssetInstrument>): AssetInstrument;
};
export declare const InstrumentLink: {
    encode(message: InstrumentLink, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentLink;
    fromJSON(object: any): InstrumentLink;
    toJSON(message: InstrumentLink): unknown;
    create(base?: DeepPartial<InstrumentLink>): InstrumentLink;
    fromPartial(object: DeepPartial<InstrumentLink>): InstrumentLink;
};
export declare const GetFavoritesRequest: {
    encode(_: GetFavoritesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetFavoritesRequest;
    fromJSON(_: any): GetFavoritesRequest;
    toJSON(_: GetFavoritesRequest): unknown;
    create(base?: DeepPartial<GetFavoritesRequest>): GetFavoritesRequest;
    fromPartial(_: DeepPartial<GetFavoritesRequest>): GetFavoritesRequest;
};
export declare const GetFavoritesResponse: {
    encode(message: GetFavoritesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetFavoritesResponse;
    fromJSON(object: any): GetFavoritesResponse;
    toJSON(message: GetFavoritesResponse): unknown;
    create(base?: DeepPartial<GetFavoritesResponse>): GetFavoritesResponse;
    fromPartial(object: DeepPartial<GetFavoritesResponse>): GetFavoritesResponse;
};
export declare const FavoriteInstrument: {
    encode(message: FavoriteInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FavoriteInstrument;
    fromJSON(object: any): FavoriteInstrument;
    toJSON(message: FavoriteInstrument): unknown;
    create(base?: DeepPartial<FavoriteInstrument>): FavoriteInstrument;
    fromPartial(object: DeepPartial<FavoriteInstrument>): FavoriteInstrument;
};
export declare const EditFavoritesRequest: {
    encode(message: EditFavoritesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EditFavoritesRequest;
    fromJSON(object: any): EditFavoritesRequest;
    toJSON(message: EditFavoritesRequest): unknown;
    create(base?: DeepPartial<EditFavoritesRequest>): EditFavoritesRequest;
    fromPartial(object: DeepPartial<EditFavoritesRequest>): EditFavoritesRequest;
};
export declare const EditFavoritesRequestInstrument: {
    encode(message: EditFavoritesRequestInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EditFavoritesRequestInstrument;
    fromJSON(object: any): EditFavoritesRequestInstrument;
    toJSON(message: EditFavoritesRequestInstrument): unknown;
    create(base?: DeepPartial<EditFavoritesRequestInstrument>): EditFavoritesRequestInstrument;
    fromPartial(object: DeepPartial<EditFavoritesRequestInstrument>): EditFavoritesRequestInstrument;
};
export declare const EditFavoritesResponse: {
    encode(message: EditFavoritesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EditFavoritesResponse;
    fromJSON(object: any): EditFavoritesResponse;
    toJSON(message: EditFavoritesResponse): unknown;
    create(base?: DeepPartial<EditFavoritesResponse>): EditFavoritesResponse;
    fromPartial(object: DeepPartial<EditFavoritesResponse>): EditFavoritesResponse;
};
export declare const GetCountriesRequest: {
    encode(_: GetCountriesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetCountriesRequest;
    fromJSON(_: any): GetCountriesRequest;
    toJSON(_: GetCountriesRequest): unknown;
    create(base?: DeepPartial<GetCountriesRequest>): GetCountriesRequest;
    fromPartial(_: DeepPartial<GetCountriesRequest>): GetCountriesRequest;
};
export declare const GetCountriesResponse: {
    encode(message: GetCountriesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetCountriesResponse;
    fromJSON(object: any): GetCountriesResponse;
    toJSON(message: GetCountriesResponse): unknown;
    create(base?: DeepPartial<GetCountriesResponse>): GetCountriesResponse;
    fromPartial(object: DeepPartial<GetCountriesResponse>): GetCountriesResponse;
};
export declare const IndicativesRequest: {
    encode(_: IndicativesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IndicativesRequest;
    fromJSON(_: any): IndicativesRequest;
    toJSON(_: IndicativesRequest): unknown;
    create(base?: DeepPartial<IndicativesRequest>): IndicativesRequest;
    fromPartial(_: DeepPartial<IndicativesRequest>): IndicativesRequest;
};
export declare const IndicativesResponse: {
    encode(message: IndicativesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IndicativesResponse;
    fromJSON(object: any): IndicativesResponse;
    toJSON(message: IndicativesResponse): unknown;
    create(base?: DeepPartial<IndicativesResponse>): IndicativesResponse;
    fromPartial(object: DeepPartial<IndicativesResponse>): IndicativesResponse;
};
export declare const IndicativeResponse: {
    encode(message: IndicativeResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IndicativeResponse;
    fromJSON(object: any): IndicativeResponse;
    toJSON(message: IndicativeResponse): unknown;
    create(base?: DeepPartial<IndicativeResponse>): IndicativeResponse;
    fromPartial(object: DeepPartial<IndicativeResponse>): IndicativeResponse;
};
export declare const CountryResponse: {
    encode(message: CountryResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CountryResponse;
    fromJSON(object: any): CountryResponse;
    toJSON(message: CountryResponse): unknown;
    create(base?: DeepPartial<CountryResponse>): CountryResponse;
    fromPartial(object: DeepPartial<CountryResponse>): CountryResponse;
};
export declare const FindInstrumentRequest: {
    encode(message: FindInstrumentRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FindInstrumentRequest;
    fromJSON(object: any): FindInstrumentRequest;
    toJSON(message: FindInstrumentRequest): unknown;
    create(base?: DeepPartial<FindInstrumentRequest>): FindInstrumentRequest;
    fromPartial(object: DeepPartial<FindInstrumentRequest>): FindInstrumentRequest;
};
export declare const FindInstrumentResponse: {
    encode(message: FindInstrumentResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FindInstrumentResponse;
    fromJSON(object: any): FindInstrumentResponse;
    toJSON(message: FindInstrumentResponse): unknown;
    create(base?: DeepPartial<FindInstrumentResponse>): FindInstrumentResponse;
    fromPartial(object: DeepPartial<FindInstrumentResponse>): FindInstrumentResponse;
};
export declare const InstrumentShort: {
    encode(message: InstrumentShort, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentShort;
    fromJSON(object: any): InstrumentShort;
    toJSON(message: InstrumentShort): unknown;
    create(base?: DeepPartial<InstrumentShort>): InstrumentShort;
    fromPartial(object: DeepPartial<InstrumentShort>): InstrumentShort;
};
export declare const GetBrandsRequest: {
    encode(message: GetBrandsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBrandsRequest;
    fromJSON(object: any): GetBrandsRequest;
    toJSON(message: GetBrandsRequest): unknown;
    create(base?: DeepPartial<GetBrandsRequest>): GetBrandsRequest;
    fromPartial(object: DeepPartial<GetBrandsRequest>): GetBrandsRequest;
};
export declare const GetBrandRequest: {
    encode(message: GetBrandRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBrandRequest;
    fromJSON(object: any): GetBrandRequest;
    toJSON(message: GetBrandRequest): unknown;
    create(base?: DeepPartial<GetBrandRequest>): GetBrandRequest;
    fromPartial(object: DeepPartial<GetBrandRequest>): GetBrandRequest;
};
export declare const GetBrandsResponse: {
    encode(message: GetBrandsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBrandsResponse;
    fromJSON(object: any): GetBrandsResponse;
    toJSON(message: GetBrandsResponse): unknown;
    create(base?: DeepPartial<GetBrandsResponse>): GetBrandsResponse;
    fromPartial(object: DeepPartial<GetBrandsResponse>): GetBrandsResponse;
};
export declare const GetAssetFundamentalsRequest: {
    encode(message: GetAssetFundamentalsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetFundamentalsRequest;
    fromJSON(object: any): GetAssetFundamentalsRequest;
    toJSON(message: GetAssetFundamentalsRequest): unknown;
    create(base?: DeepPartial<GetAssetFundamentalsRequest>): GetAssetFundamentalsRequest;
    fromPartial(object: DeepPartial<GetAssetFundamentalsRequest>): GetAssetFundamentalsRequest;
};
export declare const GetAssetFundamentalsResponse: {
    encode(message: GetAssetFundamentalsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetFundamentalsResponse;
    fromJSON(object: any): GetAssetFundamentalsResponse;
    toJSON(message: GetAssetFundamentalsResponse): unknown;
    create(base?: DeepPartial<GetAssetFundamentalsResponse>): GetAssetFundamentalsResponse;
    fromPartial(object: DeepPartial<GetAssetFundamentalsResponse>): GetAssetFundamentalsResponse;
};
export declare const GetAssetFundamentalsResponse_StatisticResponse: {
    encode(message: GetAssetFundamentalsResponse_StatisticResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetFundamentalsResponse_StatisticResponse;
    fromJSON(object: any): GetAssetFundamentalsResponse_StatisticResponse;
    toJSON(message: GetAssetFundamentalsResponse_StatisticResponse): unknown;
    create(base?: DeepPartial<GetAssetFundamentalsResponse_StatisticResponse>): GetAssetFundamentalsResponse_StatisticResponse;
    fromPartial(object: DeepPartial<GetAssetFundamentalsResponse_StatisticResponse>): GetAssetFundamentalsResponse_StatisticResponse;
};
export declare const GetAssetReportsRequest: {
    encode(message: GetAssetReportsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetReportsRequest;
    fromJSON(object: any): GetAssetReportsRequest;
    toJSON(message: GetAssetReportsRequest): unknown;
    create(base?: DeepPartial<GetAssetReportsRequest>): GetAssetReportsRequest;
    fromPartial(object: DeepPartial<GetAssetReportsRequest>): GetAssetReportsRequest;
};
export declare const GetAssetReportsResponse: {
    encode(message: GetAssetReportsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetReportsResponse;
    fromJSON(object: any): GetAssetReportsResponse;
    toJSON(message: GetAssetReportsResponse): unknown;
    create(base?: DeepPartial<GetAssetReportsResponse>): GetAssetReportsResponse;
    fromPartial(object: DeepPartial<GetAssetReportsResponse>): GetAssetReportsResponse;
};
export declare const GetAssetReportsResponse_GetAssetReportsEvent: {
    encode(message: GetAssetReportsResponse_GetAssetReportsEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetReportsResponse_GetAssetReportsEvent;
    fromJSON(object: any): GetAssetReportsResponse_GetAssetReportsEvent;
    toJSON(message: GetAssetReportsResponse_GetAssetReportsEvent): unknown;
    create(base?: DeepPartial<GetAssetReportsResponse_GetAssetReportsEvent>): GetAssetReportsResponse_GetAssetReportsEvent;
    fromPartial(object: DeepPartial<GetAssetReportsResponse_GetAssetReportsEvent>): GetAssetReportsResponse_GetAssetReportsEvent;
};
export declare const GetConsensusForecastsRequest: {
    encode(message: GetConsensusForecastsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetConsensusForecastsRequest;
    fromJSON(object: any): GetConsensusForecastsRequest;
    toJSON(message: GetConsensusForecastsRequest): unknown;
    create(base?: DeepPartial<GetConsensusForecastsRequest>): GetConsensusForecastsRequest;
    fromPartial(object: DeepPartial<GetConsensusForecastsRequest>): GetConsensusForecastsRequest;
};
export declare const GetConsensusForecastsResponse: {
    encode(message: GetConsensusForecastsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetConsensusForecastsResponse;
    fromJSON(object: any): GetConsensusForecastsResponse;
    toJSON(message: GetConsensusForecastsResponse): unknown;
    create(base?: DeepPartial<GetConsensusForecastsResponse>): GetConsensusForecastsResponse;
    fromPartial(object: DeepPartial<GetConsensusForecastsResponse>): GetConsensusForecastsResponse;
};
export declare const GetConsensusForecastsResponse_ConsensusForecastsItem: {
    encode(message: GetConsensusForecastsResponse_ConsensusForecastsItem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetConsensusForecastsResponse_ConsensusForecastsItem;
    fromJSON(object: any): GetConsensusForecastsResponse_ConsensusForecastsItem;
    toJSON(message: GetConsensusForecastsResponse_ConsensusForecastsItem): unknown;
    create(base?: DeepPartial<GetConsensusForecastsResponse_ConsensusForecastsItem>): GetConsensusForecastsResponse_ConsensusForecastsItem;
    fromPartial(object: DeepPartial<GetConsensusForecastsResponse_ConsensusForecastsItem>): GetConsensusForecastsResponse_ConsensusForecastsItem;
};
export declare const GetForecastRequest: {
    encode(message: GetForecastRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetForecastRequest;
    fromJSON(object: any): GetForecastRequest;
    toJSON(message: GetForecastRequest): unknown;
    create(base?: DeepPartial<GetForecastRequest>): GetForecastRequest;
    fromPartial(object: DeepPartial<GetForecastRequest>): GetForecastRequest;
};
export declare const GetForecastResponse: {
    encode(message: GetForecastResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetForecastResponse;
    fromJSON(object: any): GetForecastResponse;
    toJSON(message: GetForecastResponse): unknown;
    create(base?: DeepPartial<GetForecastResponse>): GetForecastResponse;
    fromPartial(object: DeepPartial<GetForecastResponse>): GetForecastResponse;
};
export declare const GetForecastResponse_TargetItem: {
    encode(message: GetForecastResponse_TargetItem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetForecastResponse_TargetItem;
    fromJSON(object: any): GetForecastResponse_TargetItem;
    toJSON(message: GetForecastResponse_TargetItem): unknown;
    create(base?: DeepPartial<GetForecastResponse_TargetItem>): GetForecastResponse_TargetItem;
    fromPartial(object: DeepPartial<GetForecastResponse_TargetItem>): GetForecastResponse_TargetItem;
};
export declare const GetForecastResponse_ConsensusItem: {
    encode(message: GetForecastResponse_ConsensusItem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetForecastResponse_ConsensusItem;
    fromJSON(object: any): GetForecastResponse_ConsensusItem;
    toJSON(message: GetForecastResponse_ConsensusItem): unknown;
    create(base?: DeepPartial<GetForecastResponse_ConsensusItem>): GetForecastResponse_ConsensusItem;
    fromPartial(object: DeepPartial<GetForecastResponse_ConsensusItem>): GetForecastResponse_ConsensusItem;
};
export declare const TradingInterval: {
    encode(message: TradingInterval, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingInterval;
    fromJSON(object: any): TradingInterval;
    toJSON(message: TradingInterval): unknown;
    create(base?: DeepPartial<TradingInterval>): TradingInterval;
    fromPartial(object: DeepPartial<TradingInterval>): TradingInterval;
};
export declare const TradingInterval_TimeInterval: {
    encode(message: TradingInterval_TimeInterval, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingInterval_TimeInterval;
    fromJSON(object: any): TradingInterval_TimeInterval;
    toJSON(message: TradingInterval_TimeInterval): unknown;
    create(base?: DeepPartial<TradingInterval_TimeInterval>): TradingInterval_TimeInterval;
    fromPartial(object: DeepPartial<TradingInterval_TimeInterval>): TradingInterval_TimeInterval;
};
/**
 * Методы сервиса предназначены для получения:</br>1. Информации об инструментах.</br>2.
 * Расписания торговых сессий.</br>3. Календаря выплат купонов по облигациям.</br>4.
 * Размера гарантийного обеспечения по фьючерсам.</br>5. Дивидендов по ценной бумаге.
 */
export type InstrumentsServiceDefinition = typeof InstrumentsServiceDefinition;
export declare const InstrumentsServiceDefinition: {
    readonly name: "InstrumentsService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.InstrumentsService";
    readonly methods: {
        /** Получить расписания торгов торговых площадок. */
        readonly tradingSchedules: {
            readonly name: "TradingSchedules";
            readonly requestType: {
                encode(message: TradingSchedulesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): TradingSchedulesRequest;
                fromJSON(object: any): TradingSchedulesRequest;
                toJSON(message: TradingSchedulesRequest): unknown;
                create(base?: DeepPartial<TradingSchedulesRequest>): TradingSchedulesRequest;
                fromPartial(object: DeepPartial<TradingSchedulesRequest>): TradingSchedulesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: TradingSchedulesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): TradingSchedulesResponse;
                fromJSON(object: any): TradingSchedulesResponse;
                toJSON(message: TradingSchedulesResponse): unknown;
                create(base?: DeepPartial<TradingSchedulesResponse>): TradingSchedulesResponse;
                fromPartial(object: DeepPartial<TradingSchedulesResponse>): TradingSchedulesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить облигации по её идентификатору. */
        readonly bondBy: {
            readonly name: "BondBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: BondResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): BondResponse;
                fromJSON(object: any): BondResponse;
                toJSON(message: BondResponse): unknown;
                create(base?: DeepPartial<BondResponse>): BondResponse;
                fromPartial(object: DeepPartial<BondResponse>): BondResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список облигаций. */
        readonly bonds: {
            readonly name: "Bonds";
            readonly requestType: {
                encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
                fromJSON(object: any): InstrumentsRequest;
                toJSON(message: InstrumentsRequest): unknown;
                create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
                fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: BondsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): BondsResponse;
                fromJSON(object: any): BondsResponse;
                toJSON(message: BondsResponse): unknown;
                create(base?: DeepPartial<BondsResponse>): BondsResponse;
                fromPartial(object: DeepPartial<BondsResponse>): BondsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить график выплат купонов по облигации. */
        readonly getBondCoupons: {
            readonly name: "GetBondCoupons";
            readonly requestType: {
                encode(message: GetBondCouponsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBondCouponsRequest;
                fromJSON(object: any): GetBondCouponsRequest;
                toJSON(message: GetBondCouponsRequest): unknown;
                create(base?: DeepPartial<GetBondCouponsRequest>): GetBondCouponsRequest;
                fromPartial(object: DeepPartial<GetBondCouponsRequest>): GetBondCouponsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetBondCouponsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBondCouponsResponse;
                fromJSON(object: any): GetBondCouponsResponse;
                toJSON(message: GetBondCouponsResponse): unknown;
                create(base?: DeepPartial<GetBondCouponsResponse>): GetBondCouponsResponse;
                fromPartial(object: DeepPartial<GetBondCouponsResponse>): GetBondCouponsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить события по облигации */
        readonly getBondEvents: {
            readonly name: "GetBondEvents";
            readonly requestType: {
                encode(message: GetBondEventsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBondEventsRequest;
                fromJSON(object: any): GetBondEventsRequest;
                toJSON(message: GetBondEventsRequest): unknown;
                create(base?: DeepPartial<GetBondEventsRequest>): GetBondEventsRequest;
                fromPartial(object: DeepPartial<GetBondEventsRequest>): GetBondEventsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetBondEventsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBondEventsResponse;
                fromJSON(object: any): GetBondEventsResponse;
                toJSON(message: GetBondEventsResponse): unknown;
                create(base?: DeepPartial<GetBondEventsResponse>): GetBondEventsResponse;
                fromPartial(object: DeepPartial<GetBondEventsResponse>): GetBondEventsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить валюту по её идентификатору. */
        readonly currencyBy: {
            readonly name: "CurrencyBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: CurrencyResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CurrencyResponse;
                fromJSON(object: any): CurrencyResponse;
                toJSON(message: CurrencyResponse): unknown;
                create(base?: DeepPartial<CurrencyResponse>): CurrencyResponse;
                fromPartial(object: DeepPartial<CurrencyResponse>): CurrencyResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список валют. */
        readonly currencies: {
            readonly name: "Currencies";
            readonly requestType: {
                encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
                fromJSON(object: any): InstrumentsRequest;
                toJSON(message: InstrumentsRequest): unknown;
                create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
                fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: CurrenciesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CurrenciesResponse;
                fromJSON(object: any): CurrenciesResponse;
                toJSON(message: CurrenciesResponse): unknown;
                create(base?: DeepPartial<CurrenciesResponse>): CurrenciesResponse;
                fromPartial(object: DeepPartial<CurrenciesResponse>): CurrenciesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить инвестиционный фонд по его идентификатору. */
        readonly etfBy: {
            readonly name: "EtfBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: EtfResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): EtfResponse;
                fromJSON(object: any): EtfResponse;
                toJSON(message: EtfResponse): unknown;
                create(base?: DeepPartial<EtfResponse>): EtfResponse;
                fromPartial(object: DeepPartial<EtfResponse>): EtfResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список инвестиционных фондов. */
        readonly etfs: {
            readonly name: "Etfs";
            readonly requestType: {
                encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
                fromJSON(object: any): InstrumentsRequest;
                toJSON(message: InstrumentsRequest): unknown;
                create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
                fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: EtfsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): EtfsResponse;
                fromJSON(object: any): EtfsResponse;
                toJSON(message: EtfsResponse): unknown;
                create(base?: DeepPartial<EtfsResponse>): EtfsResponse;
                fromPartial(object: DeepPartial<EtfsResponse>): EtfsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить фьючерс по его идентификатору. */
        readonly futureBy: {
            readonly name: "FutureBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: FutureResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): FutureResponse;
                fromJSON(object: any): FutureResponse;
                toJSON(message: FutureResponse): unknown;
                create(base?: DeepPartial<FutureResponse>): FutureResponse;
                fromPartial(object: DeepPartial<FutureResponse>): FutureResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список фьючерсов. */
        readonly futures: {
            readonly name: "Futures";
            readonly requestType: {
                encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
                fromJSON(object: any): InstrumentsRequest;
                toJSON(message: InstrumentsRequest): unknown;
                create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
                fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: FuturesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): FuturesResponse;
                fromJSON(object: any): FuturesResponse;
                toJSON(message: FuturesResponse): unknown;
                create(base?: DeepPartial<FuturesResponse>): FuturesResponse;
                fromPartial(object: DeepPartial<FuturesResponse>): FuturesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить опцион по его идентификатору. */
        readonly optionBy: {
            readonly name: "OptionBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OptionResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OptionResponse;
                fromJSON(object: any): OptionResponse;
                toJSON(message: OptionResponse): unknown;
                create(base?: DeepPartial<OptionResponse>): OptionResponse;
                fromPartial(object: DeepPartial<OptionResponse>): OptionResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /**
         * Deprecated Получить списка опционов.
         *
         * @deprecated
         */
        readonly options: {
            readonly name: "Options";
            readonly requestType: {
                encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
                fromJSON(object: any): InstrumentsRequest;
                toJSON(message: InstrumentsRequest): unknown;
                create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
                fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OptionsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OptionsResponse;
                fromJSON(object: any): OptionsResponse;
                toJSON(message: OptionsResponse): unknown;
                create(base?: DeepPartial<OptionsResponse>): OptionsResponse;
                fromPartial(object: DeepPartial<OptionsResponse>): OptionsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список опционов. */
        readonly optionsBy: {
            readonly name: "OptionsBy";
            readonly requestType: {
                encode(message: FilterOptionsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): FilterOptionsRequest;
                fromJSON(object: any): FilterOptionsRequest;
                toJSON(message: FilterOptionsRequest): unknown;
                create(base?: DeepPartial<FilterOptionsRequest>): FilterOptionsRequest;
                fromPartial(object: DeepPartial<FilterOptionsRequest>): FilterOptionsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OptionsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OptionsResponse;
                fromJSON(object: any): OptionsResponse;
                toJSON(message: OptionsResponse): unknown;
                create(base?: DeepPartial<OptionsResponse>): OptionsResponse;
                fromPartial(object: DeepPartial<OptionsResponse>): OptionsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить акцию по её идентификатору. */
        readonly shareBy: {
            readonly name: "ShareBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: ShareResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): ShareResponse;
                fromJSON(object: any): ShareResponse;
                toJSON(message: ShareResponse): unknown;
                create(base?: DeepPartial<ShareResponse>): ShareResponse;
                fromPartial(object: DeepPartial<ShareResponse>): ShareResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список акций. */
        readonly shares: {
            readonly name: "Shares";
            readonly requestType: {
                encode(message: InstrumentsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentsRequest;
                fromJSON(object: any): InstrumentsRequest;
                toJSON(message: InstrumentsRequest): unknown;
                create(base?: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
                fromPartial(object: DeepPartial<InstrumentsRequest>): InstrumentsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: SharesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): SharesResponse;
                fromJSON(object: any): SharesResponse;
                toJSON(message: SharesResponse): unknown;
                create(base?: DeepPartial<SharesResponse>): SharesResponse;
                fromPartial(object: DeepPartial<SharesResponse>): SharesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить индикативные инструменты — индексы, товары и другие. */
        readonly indicatives: {
            readonly name: "Indicatives";
            readonly requestType: {
                encode(_: IndicativesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): IndicativesRequest;
                fromJSON(_: any): IndicativesRequest;
                toJSON(_: IndicativesRequest): unknown;
                create(base?: DeepPartial<IndicativesRequest>): IndicativesRequest;
                fromPartial(_: DeepPartial<IndicativesRequest>): IndicativesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: IndicativesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): IndicativesResponse;
                fromJSON(object: any): IndicativesResponse;
                toJSON(message: IndicativesResponse): unknown;
                create(base?: DeepPartial<IndicativesResponse>): IndicativesResponse;
                fromPartial(object: DeepPartial<IndicativesResponse>): IndicativesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить накопленный купонный доход по облигации. */
        readonly getAccruedInterests: {
            readonly name: "GetAccruedInterests";
            readonly requestType: {
                encode(message: GetAccruedInterestsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAccruedInterestsRequest;
                fromJSON(object: any): GetAccruedInterestsRequest;
                toJSON(message: GetAccruedInterestsRequest): unknown;
                create(base?: DeepPartial<GetAccruedInterestsRequest>): GetAccruedInterestsRequest;
                fromPartial(object: DeepPartial<GetAccruedInterestsRequest>): GetAccruedInterestsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetAccruedInterestsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAccruedInterestsResponse;
                fromJSON(object: any): GetAccruedInterestsResponse;
                toJSON(message: GetAccruedInterestsResponse): unknown;
                create(base?: DeepPartial<GetAccruedInterestsResponse>): GetAccruedInterestsResponse;
                fromPartial(object: DeepPartial<GetAccruedInterestsResponse>): GetAccruedInterestsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить размера гарантийного обеспечения по фьючерсам. */
        readonly getFuturesMargin: {
            readonly name: "GetFuturesMargin";
            readonly requestType: {
                encode(message: GetFuturesMarginRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetFuturesMarginRequest;
                fromJSON(object: any): GetFuturesMarginRequest;
                toJSON(message: GetFuturesMarginRequest): unknown;
                create(base?: DeepPartial<GetFuturesMarginRequest>): GetFuturesMarginRequest;
                fromPartial(object: DeepPartial<GetFuturesMarginRequest>): GetFuturesMarginRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetFuturesMarginResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetFuturesMarginResponse;
                fromJSON(object: any): GetFuturesMarginResponse;
                toJSON(message: GetFuturesMarginResponse): unknown;
                create(base?: DeepPartial<GetFuturesMarginResponse>): GetFuturesMarginResponse;
                fromPartial(object: DeepPartial<GetFuturesMarginResponse>): GetFuturesMarginResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить основную информацию об инструменте. */
        readonly getInstrumentBy: {
            readonly name: "GetInstrumentBy";
            readonly requestType: {
                encode(message: InstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentRequest;
                fromJSON(object: any): InstrumentRequest;
                toJSON(message: InstrumentRequest): unknown;
                create(base?: DeepPartial<InstrumentRequest>): InstrumentRequest;
                fromPartial(object: DeepPartial<InstrumentRequest>): InstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: InstrumentResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentResponse;
                fromJSON(object: any): InstrumentResponse;
                toJSON(message: InstrumentResponse): unknown;
                create(base?: DeepPartial<InstrumentResponse>): InstrumentResponse;
                fromPartial(object: DeepPartial<InstrumentResponse>): InstrumentResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить события выплаты дивидендов по инструменту. */
        readonly getDividends: {
            readonly name: "GetDividends";
            readonly requestType: {
                encode(message: GetDividendsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsRequest;
                fromJSON(object: any): GetDividendsRequest;
                toJSON(message: GetDividendsRequest): unknown;
                create(base?: DeepPartial<GetDividendsRequest>): GetDividendsRequest;
                fromPartial(object: DeepPartial<GetDividendsRequest>): GetDividendsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetDividendsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsResponse;
                fromJSON(object: any): GetDividendsResponse;
                toJSON(message: GetDividendsResponse): unknown;
                create(base?: DeepPartial<GetDividendsResponse>): GetDividendsResponse;
                fromPartial(object: DeepPartial<GetDividendsResponse>): GetDividendsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить актив по его идентификатору. */
        readonly getAssetBy: {
            readonly name: "GetAssetBy";
            readonly requestType: {
                encode(message: AssetRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): AssetRequest;
                fromJSON(object: any): AssetRequest;
                toJSON(message: AssetRequest): unknown;
                create(base?: DeepPartial<AssetRequest>): AssetRequest;
                fromPartial(object: DeepPartial<AssetRequest>): AssetRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: AssetResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): AssetResponse;
                fromJSON(object: any): AssetResponse;
                toJSON(message: AssetResponse): unknown;
                create(base?: DeepPartial<AssetResponse>): AssetResponse;
                fromPartial(object: DeepPartial<AssetResponse>): AssetResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список активов. Метод работает для всех инструментов, кроме срочных — опционов и фьючерсов. */
        readonly getAssets: {
            readonly name: "GetAssets";
            readonly requestType: {
                encode(message: AssetsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): AssetsRequest;
                fromJSON(object: any): AssetsRequest;
                toJSON(message: AssetsRequest): unknown;
                create(base?: DeepPartial<AssetsRequest>): AssetsRequest;
                fromPartial(object: DeepPartial<AssetsRequest>): AssetsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: AssetsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): AssetsResponse;
                fromJSON(object: any): AssetsResponse;
                toJSON(message: AssetsResponse): unknown;
                create(base?: DeepPartial<AssetsResponse>): AssetsResponse;
                fromPartial(object: DeepPartial<AssetsResponse>): AssetsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список избранных инструментов. */
        readonly getFavorites: {
            readonly name: "GetFavorites";
            readonly requestType: {
                encode(_: GetFavoritesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetFavoritesRequest;
                fromJSON(_: any): GetFavoritesRequest;
                toJSON(_: GetFavoritesRequest): unknown;
                create(base?: DeepPartial<GetFavoritesRequest>): GetFavoritesRequest;
                fromPartial(_: DeepPartial<GetFavoritesRequest>): GetFavoritesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetFavoritesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetFavoritesResponse;
                fromJSON(object: any): GetFavoritesResponse;
                toJSON(message: GetFavoritesResponse): unknown;
                create(base?: DeepPartial<GetFavoritesResponse>): GetFavoritesResponse;
                fromPartial(object: DeepPartial<GetFavoritesResponse>): GetFavoritesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Отредактировать список избранных инструментов. */
        readonly editFavorites: {
            readonly name: "EditFavorites";
            readonly requestType: {
                encode(message: EditFavoritesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): EditFavoritesRequest;
                fromJSON(object: any): EditFavoritesRequest;
                toJSON(message: EditFavoritesRequest): unknown;
                create(base?: DeepPartial<EditFavoritesRequest>): EditFavoritesRequest;
                fromPartial(object: DeepPartial<EditFavoritesRequest>): EditFavoritesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: EditFavoritesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): EditFavoritesResponse;
                fromJSON(object: any): EditFavoritesResponse;
                toJSON(message: EditFavoritesResponse): unknown;
                create(base?: DeepPartial<EditFavoritesResponse>): EditFavoritesResponse;
                fromPartial(object: DeepPartial<EditFavoritesResponse>): EditFavoritesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список стран. */
        readonly getCountries: {
            readonly name: "GetCountries";
            readonly requestType: {
                encode(_: GetCountriesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetCountriesRequest;
                fromJSON(_: any): GetCountriesRequest;
                toJSON(_: GetCountriesRequest): unknown;
                create(base?: DeepPartial<GetCountriesRequest>): GetCountriesRequest;
                fromPartial(_: DeepPartial<GetCountriesRequest>): GetCountriesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetCountriesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetCountriesResponse;
                fromJSON(object: any): GetCountriesResponse;
                toJSON(message: GetCountriesResponse): unknown;
                create(base?: DeepPartial<GetCountriesResponse>): GetCountriesResponse;
                fromPartial(object: DeepPartial<GetCountriesResponse>): GetCountriesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Найти инструмент. */
        readonly findInstrument: {
            readonly name: "FindInstrument";
            readonly requestType: {
                encode(message: FindInstrumentRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): FindInstrumentRequest;
                fromJSON(object: any): FindInstrumentRequest;
                toJSON(message: FindInstrumentRequest): unknown;
                create(base?: DeepPartial<FindInstrumentRequest>): FindInstrumentRequest;
                fromPartial(object: DeepPartial<FindInstrumentRequest>): FindInstrumentRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: FindInstrumentResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): FindInstrumentResponse;
                fromJSON(object: any): FindInstrumentResponse;
                toJSON(message: FindInstrumentResponse): unknown;
                create(base?: DeepPartial<FindInstrumentResponse>): FindInstrumentResponse;
                fromPartial(object: DeepPartial<FindInstrumentResponse>): FindInstrumentResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список брендов. */
        readonly getBrands: {
            readonly name: "GetBrands";
            readonly requestType: {
                encode(message: GetBrandsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBrandsRequest;
                fromJSON(object: any): GetBrandsRequest;
                toJSON(message: GetBrandsRequest): unknown;
                create(base?: DeepPartial<GetBrandsRequest>): GetBrandsRequest;
                fromPartial(object: DeepPartial<GetBrandsRequest>): GetBrandsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetBrandsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBrandsResponse;
                fromJSON(object: any): GetBrandsResponse;
                toJSON(message: GetBrandsResponse): unknown;
                create(base?: DeepPartial<GetBrandsResponse>): GetBrandsResponse;
                fromPartial(object: DeepPartial<GetBrandsResponse>): GetBrandsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить бренд по его идентификатору. */
        readonly getBrandBy: {
            readonly name: "GetBrandBy";
            readonly requestType: {
                encode(message: GetBrandRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetBrandRequest;
                fromJSON(object: any): GetBrandRequest;
                toJSON(message: GetBrandRequest): unknown;
                create(base?: DeepPartial<GetBrandRequest>): GetBrandRequest;
                fromPartial(object: DeepPartial<GetBrandRequest>): GetBrandRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: Brand, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): Brand;
                fromJSON(object: any): Brand;
                toJSON(message: Brand): unknown;
                create(base?: DeepPartial<Brand>): Brand;
                fromPartial(object: DeepPartial<Brand>): Brand;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить фундаментальные показатели по активу. */
        readonly getAssetFundamentals: {
            readonly name: "GetAssetFundamentals";
            readonly requestType: {
                encode(message: GetAssetFundamentalsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetFundamentalsRequest;
                fromJSON(object: any): GetAssetFundamentalsRequest;
                toJSON(message: GetAssetFundamentalsRequest): unknown;
                create(base?: DeepPartial<GetAssetFundamentalsRequest>): GetAssetFundamentalsRequest;
                fromPartial(object: DeepPartial<GetAssetFundamentalsRequest>): GetAssetFundamentalsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetAssetFundamentalsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetFundamentalsResponse;
                fromJSON(object: any): GetAssetFundamentalsResponse;
                toJSON(message: GetAssetFundamentalsResponse): unknown;
                create(base?: DeepPartial<GetAssetFundamentalsResponse>): GetAssetFundamentalsResponse;
                fromPartial(object: DeepPartial<GetAssetFundamentalsResponse>): GetAssetFundamentalsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить расписания выхода отчётностей эмитентов. */
        readonly getAssetReports: {
            readonly name: "GetAssetReports";
            readonly requestType: {
                encode(message: GetAssetReportsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetReportsRequest;
                fromJSON(object: any): GetAssetReportsRequest;
                toJSON(message: GetAssetReportsRequest): unknown;
                create(base?: DeepPartial<GetAssetReportsRequest>): GetAssetReportsRequest;
                fromPartial(object: DeepPartial<GetAssetReportsRequest>): GetAssetReportsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetAssetReportsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetReportsResponse;
                fromJSON(object: any): GetAssetReportsResponse;
                toJSON(message: GetAssetReportsResponse): unknown;
                create(base?: DeepPartial<GetAssetReportsResponse>): GetAssetReportsResponse;
                fromPartial(object: DeepPartial<GetAssetReportsResponse>): GetAssetReportsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить мнения аналитиков по инструменту. */
        readonly getConsensusForecasts: {
            readonly name: "GetConsensusForecasts";
            readonly requestType: {
                encode(message: GetConsensusForecastsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetConsensusForecastsRequest;
                fromJSON(object: any): GetConsensusForecastsRequest;
                toJSON(message: GetConsensusForecastsRequest): unknown;
                create(base?: DeepPartial<GetConsensusForecastsRequest>): GetConsensusForecastsRequest;
                fromPartial(object: DeepPartial<GetConsensusForecastsRequest>): GetConsensusForecastsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetConsensusForecastsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetConsensusForecastsResponse;
                fromJSON(object: any): GetConsensusForecastsResponse;
                toJSON(message: GetConsensusForecastsResponse): unknown;
                create(base?: DeepPartial<GetConsensusForecastsResponse>): GetConsensusForecastsResponse;
                fromPartial(object: DeepPartial<GetConsensusForecastsResponse>): GetConsensusForecastsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить прогнозов инвестдомов по инструменту. */
        readonly getForecastBy: {
            readonly name: "GetForecastBy";
            readonly requestType: {
                encode(message: GetForecastRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetForecastRequest;
                fromJSON(object: any): GetForecastRequest;
                toJSON(message: GetForecastRequest): unknown;
                create(base?: DeepPartial<GetForecastRequest>): GetForecastRequest;
                fromPartial(object: DeepPartial<GetForecastRequest>): GetForecastRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetForecastResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetForecastResponse;
                fromJSON(object: any): GetForecastResponse;
                toJSON(message: GetForecastResponse): unknown;
                create(base?: DeepPartial<GetForecastResponse>): GetForecastResponse;
                fromPartial(object: DeepPartial<GetForecastResponse>): GetForecastResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface InstrumentsServiceImplementation<CallContextExt = {}> {
    /** Получить расписания торгов торговых площадок. */
    tradingSchedules(request: TradingSchedulesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<TradingSchedulesResponse>>;
    /** Получить облигации по её идентификатору. */
    bondBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<BondResponse>>;
    /** Получить список облигаций. */
    bonds(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<BondsResponse>>;
    /** Получить график выплат купонов по облигации. */
    getBondCoupons(request: GetBondCouponsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetBondCouponsResponse>>;
    /** Получить события по облигации */
    getBondEvents(request: GetBondEventsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetBondEventsResponse>>;
    /** Получить валюту по её идентификатору. */
    currencyBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CurrencyResponse>>;
    /** Получить список валют. */
    currencies(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CurrenciesResponse>>;
    /** Получить инвестиционный фонд по его идентификатору. */
    etfBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<EtfResponse>>;
    /** Получить список инвестиционных фондов. */
    etfs(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<EtfsResponse>>;
    /** Получить фьючерс по его идентификатору. */
    futureBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<FutureResponse>>;
    /** Получить список фьючерсов. */
    futures(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<FuturesResponse>>;
    /** Получить опцион по его идентификатору. */
    optionBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OptionResponse>>;
    /**
     * Deprecated Получить списка опционов.
     *
     * @deprecated
     */
    options(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OptionsResponse>>;
    /** Получить список опционов. */
    optionsBy(request: FilterOptionsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OptionsResponse>>;
    /** Получить акцию по её идентификатору. */
    shareBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<ShareResponse>>;
    /** Получить список акций. */
    shares(request: InstrumentsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<SharesResponse>>;
    /** Получить индикативные инструменты — индексы, товары и другие. */
    indicatives(request: IndicativesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<IndicativesResponse>>;
    /** Получить накопленный купонный доход по облигации. */
    getAccruedInterests(request: GetAccruedInterestsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAccruedInterestsResponse>>;
    /** Получить размера гарантийного обеспечения по фьючерсам. */
    getFuturesMargin(request: GetFuturesMarginRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetFuturesMarginResponse>>;
    /** Получить основную информацию об инструменте. */
    getInstrumentBy(request: InstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<InstrumentResponse>>;
    /** Получить события выплаты дивидендов по инструменту. */
    getDividends(request: GetDividendsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetDividendsResponse>>;
    /** Получить актив по его идентификатору. */
    getAssetBy(request: AssetRequest, context: CallContext & CallContextExt): Promise<DeepPartial<AssetResponse>>;
    /** Получить список активов. Метод работает для всех инструментов, кроме срочных — опционов и фьючерсов. */
    getAssets(request: AssetsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<AssetsResponse>>;
    /** Получить список избранных инструментов. */
    getFavorites(request: GetFavoritesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetFavoritesResponse>>;
    /** Отредактировать список избранных инструментов. */
    editFavorites(request: EditFavoritesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<EditFavoritesResponse>>;
    /** Получить список стран. */
    getCountries(request: GetCountriesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetCountriesResponse>>;
    /** Найти инструмент. */
    findInstrument(request: FindInstrumentRequest, context: CallContext & CallContextExt): Promise<DeepPartial<FindInstrumentResponse>>;
    /** Получить список брендов. */
    getBrands(request: GetBrandsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetBrandsResponse>>;
    /** Получить бренд по его идентификатору. */
    getBrandBy(request: GetBrandRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Brand>>;
    /** Получить фундаментальные показатели по активу. */
    getAssetFundamentals(request: GetAssetFundamentalsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAssetFundamentalsResponse>>;
    /** Получить расписания выхода отчётностей эмитентов. */
    getAssetReports(request: GetAssetReportsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAssetReportsResponse>>;
    /** Получить мнения аналитиков по инструменту. */
    getConsensusForecasts(request: GetConsensusForecastsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetConsensusForecastsResponse>>;
    /** Получить прогнозов инвестдомов по инструменту. */
    getForecastBy(request: GetForecastRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetForecastResponse>>;
}
export interface InstrumentsServiceClient<CallOptionsExt = {}> {
    /** Получить расписания торгов торговых площадок. */
    tradingSchedules(request: DeepPartial<TradingSchedulesRequest>, options?: CallOptions & CallOptionsExt): Promise<TradingSchedulesResponse>;
    /** Получить облигации по её идентификатору. */
    bondBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<BondResponse>;
    /** Получить список облигаций. */
    bonds(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<BondsResponse>;
    /** Получить график выплат купонов по облигации. */
    getBondCoupons(request: DeepPartial<GetBondCouponsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetBondCouponsResponse>;
    /** Получить события по облигации */
    getBondEvents(request: DeepPartial<GetBondEventsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetBondEventsResponse>;
    /** Получить валюту по её идентификатору. */
    currencyBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<CurrencyResponse>;
    /** Получить список валют. */
    currencies(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<CurrenciesResponse>;
    /** Получить инвестиционный фонд по его идентификатору. */
    etfBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<EtfResponse>;
    /** Получить список инвестиционных фондов. */
    etfs(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<EtfsResponse>;
    /** Получить фьючерс по его идентификатору. */
    futureBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<FutureResponse>;
    /** Получить список фьючерсов. */
    futures(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<FuturesResponse>;
    /** Получить опцион по его идентификатору. */
    optionBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<OptionResponse>;
    /**
     * Deprecated Получить списка опционов.
     *
     * @deprecated
     */
    options(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<OptionsResponse>;
    /** Получить список опционов. */
    optionsBy(request: DeepPartial<FilterOptionsRequest>, options?: CallOptions & CallOptionsExt): Promise<OptionsResponse>;
    /** Получить акцию по её идентификатору. */
    shareBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<ShareResponse>;
    /** Получить список акций. */
    shares(request: DeepPartial<InstrumentsRequest>, options?: CallOptions & CallOptionsExt): Promise<SharesResponse>;
    /** Получить индикативные инструменты — индексы, товары и другие. */
    indicatives(request: DeepPartial<IndicativesRequest>, options?: CallOptions & CallOptionsExt): Promise<IndicativesResponse>;
    /** Получить накопленный купонный доход по облигации. */
    getAccruedInterests(request: DeepPartial<GetAccruedInterestsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAccruedInterestsResponse>;
    /** Получить размера гарантийного обеспечения по фьючерсам. */
    getFuturesMargin(request: DeepPartial<GetFuturesMarginRequest>, options?: CallOptions & CallOptionsExt): Promise<GetFuturesMarginResponse>;
    /** Получить основную информацию об инструменте. */
    getInstrumentBy(request: DeepPartial<InstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<InstrumentResponse>;
    /** Получить события выплаты дивидендов по инструменту. */
    getDividends(request: DeepPartial<GetDividendsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetDividendsResponse>;
    /** Получить актив по его идентификатору. */
    getAssetBy(request: DeepPartial<AssetRequest>, options?: CallOptions & CallOptionsExt): Promise<AssetResponse>;
    /** Получить список активов. Метод работает для всех инструментов, кроме срочных — опционов и фьючерсов. */
    getAssets(request: DeepPartial<AssetsRequest>, options?: CallOptions & CallOptionsExt): Promise<AssetsResponse>;
    /** Получить список избранных инструментов. */
    getFavorites(request: DeepPartial<GetFavoritesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetFavoritesResponse>;
    /** Отредактировать список избранных инструментов. */
    editFavorites(request: DeepPartial<EditFavoritesRequest>, options?: CallOptions & CallOptionsExt): Promise<EditFavoritesResponse>;
    /** Получить список стран. */
    getCountries(request: DeepPartial<GetCountriesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetCountriesResponse>;
    /** Найти инструмент. */
    findInstrument(request: DeepPartial<FindInstrumentRequest>, options?: CallOptions & CallOptionsExt): Promise<FindInstrumentResponse>;
    /** Получить список брендов. */
    getBrands(request: DeepPartial<GetBrandsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetBrandsResponse>;
    /** Получить бренд по его идентификатору. */
    getBrandBy(request: DeepPartial<GetBrandRequest>, options?: CallOptions & CallOptionsExt): Promise<Brand>;
    /** Получить фундаментальные показатели по активу. */
    getAssetFundamentals(request: DeepPartial<GetAssetFundamentalsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAssetFundamentalsResponse>;
    /** Получить расписания выхода отчётностей эмитентов. */
    getAssetReports(request: DeepPartial<GetAssetReportsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAssetReportsResponse>;
    /** Получить мнения аналитиков по инструменту. */
    getConsensusForecasts(request: DeepPartial<GetConsensusForecastsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetConsensusForecastsResponse>;
    /** Получить прогнозов инвестдомов по инструменту. */
    getForecastBy(request: DeepPartial<GetForecastRequest>, options?: CallOptions & CallOptionsExt): Promise<GetForecastResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
