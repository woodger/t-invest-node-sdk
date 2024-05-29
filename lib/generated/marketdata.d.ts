import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { Ping, Quotation, SecurityTradingStatus } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Тип операции со списком подписок. */
export declare enum SubscriptionAction {
    /** SUBSCRIPTION_ACTION_UNSPECIFIED - Статус подписки не определён. */
    SUBSCRIPTION_ACTION_UNSPECIFIED = 0,
    /** SUBSCRIPTION_ACTION_SUBSCRIBE - Подписаться. */
    SUBSCRIPTION_ACTION_SUBSCRIBE = 1,
    /** SUBSCRIPTION_ACTION_UNSUBSCRIBE - Отписаться. */
    SUBSCRIPTION_ACTION_UNSUBSCRIBE = 2,
    UNRECOGNIZED = -1
}
export declare function subscriptionActionFromJSON(object: any): SubscriptionAction;
export declare function subscriptionActionToJSON(object: SubscriptionAction): string;
/** Интервал свечи. */
export declare enum SubscriptionInterval {
    /** SUBSCRIPTION_INTERVAL_UNSPECIFIED - Интервал свечи не определён. */
    SUBSCRIPTION_INTERVAL_UNSPECIFIED = 0,
    /** SUBSCRIPTION_INTERVAL_ONE_MINUTE - Минутные свечи. */
    SUBSCRIPTION_INTERVAL_ONE_MINUTE = 1,
    /** SUBSCRIPTION_INTERVAL_FIVE_MINUTES - Пятиминутные свечи. */
    SUBSCRIPTION_INTERVAL_FIVE_MINUTES = 2,
    /** SUBSCRIPTION_INTERVAL_FIFTEEN_MINUTES - Пятнадцатиминутные свечи */
    SUBSCRIPTION_INTERVAL_FIFTEEN_MINUTES = 3,
    /** SUBSCRIPTION_INTERVAL_ONE_HOUR - Часовые свечи */
    SUBSCRIPTION_INTERVAL_ONE_HOUR = 4,
    /** SUBSCRIPTION_INTERVAL_ONE_DAY - Дневные свечи */
    SUBSCRIPTION_INTERVAL_ONE_DAY = 5,
    /** SUBSCRIPTION_INTERVAL_2_MIN - Двухминутные свечи */
    SUBSCRIPTION_INTERVAL_2_MIN = 6,
    /** SUBSCRIPTION_INTERVAL_3_MIN - Трехминутные свечи */
    SUBSCRIPTION_INTERVAL_3_MIN = 7,
    /** SUBSCRIPTION_INTERVAL_10_MIN - Десятиминутные свечи */
    SUBSCRIPTION_INTERVAL_10_MIN = 8,
    /** SUBSCRIPTION_INTERVAL_30_MIN - Тридцатиминутные свечи */
    SUBSCRIPTION_INTERVAL_30_MIN = 9,
    /** SUBSCRIPTION_INTERVAL_2_HOUR - Двухчасовые свечи */
    SUBSCRIPTION_INTERVAL_2_HOUR = 10,
    /** SUBSCRIPTION_INTERVAL_4_HOUR - Четырехчасовые свечи */
    SUBSCRIPTION_INTERVAL_4_HOUR = 11,
    /** SUBSCRIPTION_INTERVAL_WEEK - Недельные свечи */
    SUBSCRIPTION_INTERVAL_WEEK = 12,
    /** SUBSCRIPTION_INTERVAL_MONTH - Месячные свечи */
    SUBSCRIPTION_INTERVAL_MONTH = 13,
    UNRECOGNIZED = -1
}
export declare function subscriptionIntervalFromJSON(object: any): SubscriptionInterval;
export declare function subscriptionIntervalToJSON(object: SubscriptionInterval): string;
/** Результат подписки. */
export declare enum SubscriptionStatus {
    /** SUBSCRIPTION_STATUS_UNSPECIFIED - Статус подписки не определён. */
    SUBSCRIPTION_STATUS_UNSPECIFIED = 0,
    /** SUBSCRIPTION_STATUS_SUCCESS - Успешно. */
    SUBSCRIPTION_STATUS_SUCCESS = 1,
    /** SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND - Инструмент не найден. */
    SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND = 2,
    /** SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID - Некорректный статус подписки, список возможных значений: [SubscriptionAction](https://russianinvestments.github.io/investAPI/marketdata#subscriptionaction). */
    SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID = 3,
    /** SUBSCRIPTION_STATUS_DEPTH_IS_INVALID - Некорректная глубина стакана, доступные значения: 1, 10, 20, 30, 40, 50. */
    SUBSCRIPTION_STATUS_DEPTH_IS_INVALID = 4,
    /** SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID - Некорректный интервал свечей, список возможных значений: [SubscriptionInterval](https://russianinvestments.github.io/investAPI/marketdata#subscriptioninterval). */
    SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID = 5,
    /** SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED - Превышен лимит на общее количество подписок в рамках стрима, подробнее: [Лимитная политика](https://russianinvestments.github.io/investAPI/limits/). */
    SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED = 6,
    /** SUBSCRIPTION_STATUS_INTERNAL_ERROR - Внутренняя ошибка сервиса. */
    SUBSCRIPTION_STATUS_INTERNAL_ERROR = 7,
    /** SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS - Превышен лимит на количество запросов на подписки в течение установленного отрезка времени */
    SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS = 8,
    /** SUBSCRIPTION_STATUS_SUBSCRIPTION_NOT_FOUND - Активная подписка не найдена. Ошибка может возникнуть только при отписке от не существующей отписки */
    SUBSCRIPTION_STATUS_SUBSCRIPTION_NOT_FOUND = 9,
    UNRECOGNIZED = -1
}
export declare function subscriptionStatusFromJSON(object: any): SubscriptionStatus;
export declare function subscriptionStatusToJSON(object: SubscriptionStatus): string;
/** Источники сделок */
export declare enum TradeSourceType {
    /** TRADE_SOURCE_UNSPECIFIED - Тип сделки не определён. */
    TRADE_SOURCE_UNSPECIFIED = 0,
    /** TRADE_SOURCE_EXCHANGE - биржевые сделки */
    TRADE_SOURCE_EXCHANGE = 1,
    /** TRADE_SOURCE_DEALER - сделки дилера */
    TRADE_SOURCE_DEALER = 2,
    /** TRADE_SOURCE_ALL - все сделки */
    TRADE_SOURCE_ALL = 3,
    UNRECOGNIZED = -1
}
export declare function tradeSourceTypeFromJSON(object: any): TradeSourceType;
export declare function tradeSourceTypeToJSON(object: TradeSourceType): string;
/** Направление сделки. */
export declare enum TradeDirection {
    /** TRADE_DIRECTION_UNSPECIFIED - Направление сделки не определено. */
    TRADE_DIRECTION_UNSPECIFIED = 0,
    /** TRADE_DIRECTION_BUY - Покупка. */
    TRADE_DIRECTION_BUY = 1,
    /** TRADE_DIRECTION_SELL - Продажа. */
    TRADE_DIRECTION_SELL = 2,
    UNRECOGNIZED = -1
}
export declare function tradeDirectionFromJSON(object: any): TradeDirection;
export declare function tradeDirectionToJSON(object: TradeDirection): string;
/** Интервал свечей. */
export declare enum CandleInterval {
    /** CANDLE_INTERVAL_UNSPECIFIED - Интервал не определён. */
    CANDLE_INTERVAL_UNSPECIFIED = 0,
    /** CANDLE_INTERVAL_1_MIN - от 1 минуты до 1 дня. */
    CANDLE_INTERVAL_1_MIN = 1,
    /** CANDLE_INTERVAL_5_MIN - от 5 минут до 1 дня. */
    CANDLE_INTERVAL_5_MIN = 2,
    /** CANDLE_INTERVAL_15_MIN - от 15 минут до 1 дня. */
    CANDLE_INTERVAL_15_MIN = 3,
    /** CANDLE_INTERVAL_HOUR - от 1 часа до 1 недели. */
    CANDLE_INTERVAL_HOUR = 4,
    /** CANDLE_INTERVAL_DAY - от 1 дня до 1 года. */
    CANDLE_INTERVAL_DAY = 5,
    /** CANDLE_INTERVAL_2_MIN - от 2 минут до 1 дня. */
    CANDLE_INTERVAL_2_MIN = 6,
    /** CANDLE_INTERVAL_3_MIN - от 3 минут до 1 дня. */
    CANDLE_INTERVAL_3_MIN = 7,
    /** CANDLE_INTERVAL_10_MIN - от 10 минут до 1 дня. */
    CANDLE_INTERVAL_10_MIN = 8,
    /** CANDLE_INTERVAL_30_MIN - от 30 минут до 2 дней. */
    CANDLE_INTERVAL_30_MIN = 9,
    /** CANDLE_INTERVAL_2_HOUR - от 2 часов до 1 месяца. */
    CANDLE_INTERVAL_2_HOUR = 10,
    /** CANDLE_INTERVAL_4_HOUR - от 4 часов до 1 месяца. */
    CANDLE_INTERVAL_4_HOUR = 11,
    /** CANDLE_INTERVAL_WEEK - от 1 недели до 2 лет. */
    CANDLE_INTERVAL_WEEK = 12,
    /** CANDLE_INTERVAL_MONTH - от 1 месяца до 10 лет. */
    CANDLE_INTERVAL_MONTH = 13,
    UNRECOGNIZED = -1
}
export declare function candleIntervalFromJSON(object: any): CandleInterval;
export declare function candleIntervalToJSON(object: CandleInterval): string;
export declare enum CandleSource {
    /** CANDLE_SOURCE_UNSPECIFIED - Источник свечей не определён. */
    CANDLE_SOURCE_UNSPECIFIED = 0,
    /** CANDLE_SOURCE_EXCHANGE - Биржевые свечи. */
    CANDLE_SOURCE_EXCHANGE = 1,
    /** CANDLE_SOURCE_DEALER_WEEKEND - Свечи  дилера в результате торговли по выходным. */
    CANDLE_SOURCE_DEALER_WEEKEND = 2,
    UNRECOGNIZED = -1
}
export declare function candleSourceFromJSON(object: any): CandleSource;
export declare function candleSourceToJSON(object: CandleSource): string;
export declare enum OrderBookType {
    /** ORDERBOOK_TYPE_UNSPECIFIED - не определен */
    ORDERBOOK_TYPE_UNSPECIFIED = 0,
    /** ORDERBOOK_TYPE_EXCHANGE - Биржевой стакан */
    ORDERBOOK_TYPE_EXCHANGE = 1,
    /** ORDERBOOK_TYPE_DEALER - Стакан дилера */
    ORDERBOOK_TYPE_DEALER = 2,
    UNRECOGNIZED = -1
}
export declare function orderBookTypeFromJSON(object: any): OrderBookType;
export declare function orderBookTypeToJSON(object: OrderBookType): string;
/** Запрос подписки или отписки на определённые биржевые данные. */
export interface MarketDataRequest {
    /** Запрос подписки на свечи. */
    subscribeCandlesRequest?: SubscribeCandlesRequest | undefined;
    /** Запрос подписки на стаканы. */
    subscribeOrderBookRequest?: SubscribeOrderBookRequest | undefined;
    /** Запрос подписки на ленту обезличенных сделок. */
    subscribeTradesRequest?: SubscribeTradesRequest | undefined;
    /** Запрос подписки на торговые статусы инструментов. */
    subscribeInfoRequest?: SubscribeInfoRequest | undefined;
    /** Запрос подписки на цены последних сделок. */
    subscribeLastPriceRequest?: SubscribeLastPriceRequest | undefined;
    /** Запрос своих подписок. */
    getMySubscriptions?: GetMySubscriptions | undefined;
}
export interface MarketDataServerSideStreamRequest {
    /** Запрос подписки на свечи. */
    subscribeCandlesRequest: SubscribeCandlesRequest | undefined;
    /** Запрос подписки на стаканы. */
    subscribeOrderBookRequest: SubscribeOrderBookRequest | undefined;
    /** Запрос подписки на ленту обезличенных сделок. */
    subscribeTradesRequest: SubscribeTradesRequest | undefined;
    /** Запрос подписки на торговые статусы инструментов. */
    subscribeInfoRequest: SubscribeInfoRequest | undefined;
    /** Запрос подписки на цены последних сделок. */
    subscribeLastPriceRequest: SubscribeLastPriceRequest | undefined;
}
/** Пакет биржевой информации по подписке. */
export interface MarketDataResponse {
    /** Результат подписки на свечи. */
    subscribeCandlesResponse?: SubscribeCandlesResponse | undefined;
    /** Результат подписки на стаканы. */
    subscribeOrderBookResponse?: SubscribeOrderBookResponse | undefined;
    /** Результат подписки на поток обезличенных сделок. */
    subscribeTradesResponse?: SubscribeTradesResponse | undefined;
    /** Результат подписки на торговые статусы инструментов. */
    subscribeInfoResponse?: SubscribeInfoResponse | undefined;
    /** Свеча. */
    candle?: Candle | undefined;
    /** Сделки. */
    trade?: Trade | undefined;
    /** Стакан. */
    orderbook?: OrderBook | undefined;
    /** Торговый статус. */
    tradingStatus?: TradingStatus | undefined;
    /** Проверка активности стрима. */
    ping?: Ping | undefined;
    /** Результат подписки на цены последние сделок по инструментам. */
    subscribeLastPriceResponse?: SubscribeLastPriceResponse | undefined;
    /** Цена последней сделки. */
    lastPrice?: LastPrice | undefined;
}
/** subscribeCandles | Изменения статуса подписки на свечи. */
export interface SubscribeCandlesRequest {
    /** Изменение статуса подписки. */
    subscriptionAction: SubscriptionAction;
    /** Массив инструментов для подписки на свечи. */
    instruments: CandleInstrument[];
    /** Флаг ожидания закрытия временного интервала для отправки свечи. */
    waitingClose: boolean;
}
/** Запрос изменения статус подписки на свечи. */
export interface CandleInstrument {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Интервал свечей. (Двухчасовые и четырехчасовые свечи в стриме отсчитываются с 0:00 по UTC) */
    interval: SubscriptionInterval;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string;
}
/** Результат изменения статус подписки на свечи. */
export interface SubscribeCandlesResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://russianinvestments.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Массив статусов подписки на свечи. */
    candlesSubscriptions: CandleSubscription[];
}
/** Статус подписки на свечи. */
export interface CandleSubscription {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Интервал свечей. */
    interval: SubscriptionInterval;
    /** Статус подписки. */
    subscriptionStatus: SubscriptionStatus;
    /** Uid инструмента */
    instrumentUid: string;
    /** Флаг ожидания закрытия временного интервала для отправки свечи */
    waitingClose: boolean;
    /** Идентификатор открытого соединения */
    streamId: string;
    /** Идентификатор подписки в формате UUID */
    subscriptionId: string;
}
/** Запрос на изменение статуса подписки на стаканы. */
export interface SubscribeOrderBookRequest {
    /** Изменение статуса подписки. */
    subscriptionAction: SubscriptionAction;
    /** Массив инструментов для подписки на стаканы. */
    instruments: OrderBookInstrument[];
}
/** Запрос подписки на стаканы. */
export interface OrderBookInstrument {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Глубина стакана. */
    depth: number;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string;
    /** Тип стакана */
    orderBookType: OrderBookType;
}
/** Результат изменения статуса подписки на стаканы. */
export interface SubscribeOrderBookResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://russianinvestments.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Массив статусов подписки на стаканы. */
    orderBookSubscriptions: OrderBookSubscription[];
}
/** Статус подписки. */
export interface OrderBookSubscription {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Глубина стакана. */
    depth: number;
    /** Статус подписки. */
    subscriptionStatus: SubscriptionStatus;
    /** Uid инструмента */
    instrumentUid: string;
    /** Идентификатор открытого соединения */
    streamId: string;
    /** Идентификатор подписки в формате UUID */
    subscriptionId: string;
    /** Тип стакана */
    orderBookType: OrderBookType;
}
/** Изменение статуса подписки на поток обезличенных сделок. */
export interface SubscribeTradesRequest {
    /** Изменение статуса подписки. */
    subscriptionAction: SubscriptionAction;
    /** Массив инструментов для подписки на поток обезличенных сделок. */
    instruments: TradeInstrument[];
    /** Источник сделок */
    tradeType: TradeSourceType;
}
/** Запрос подписки на поток обезличенных сделок. */
export interface TradeInstrument {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string;
}
/** Результат изменения статуса подписки на поток обезличенных сделок. */
export interface SubscribeTradesResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://russianinvestments.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Массив статусов подписки на поток сделок. */
    tradeSubscriptions: TradeSubscription[];
    /** Источник сделок */
    tradeType: TradeSourceType;
}
/** Статус подписки. */
export interface TradeSubscription {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Статус подписки. */
    subscriptionStatus: SubscriptionStatus;
    /** Uid инструмента */
    instrumentUid: string;
    /** Идентификатор открытого соединения */
    streamId: string;
    /** Идентификатор подписки в формате UUID */
    subscriptionId: string;
}
/** Изменение статуса подписки на торговый статус инструмента. */
export interface SubscribeInfoRequest {
    /** Изменение статуса подписки. */
    subscriptionAction: SubscriptionAction;
    /** Массив инструментов для подписки на торговый статус. */
    instruments: InfoInstrument[];
}
/** Запрос подписки на торговый статус. */
export interface InfoInstrument {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string;
}
/** Результат изменения статуса подписки на торговый статус. */
export interface SubscribeInfoResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://russianinvestments.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Массив статусов подписки на торговый статус. */
    infoSubscriptions: InfoSubscription[];
}
/** Статус подписки. */
export interface InfoSubscription {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Статус подписки. */
    subscriptionStatus: SubscriptionStatus;
    /** Uid инструмента */
    instrumentUid: string;
    /** Идентификатор открытого соединения */
    streamId: string;
    /** Идентификатор подписки в формате UUID */
    subscriptionId: string;
}
/** Изменение статуса подписки на цену последней сделки по инструменту. */
export interface SubscribeLastPriceRequest {
    /** Изменение статуса подписки. */
    subscriptionAction: SubscriptionAction;
    /** Массив инструментов для подписки на цену последней сделки. */
    instruments: LastPriceInstrument[];
}
/** Запрос подписки на последнюю цену. */
export interface LastPriceInstrument {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string;
}
/** Результат изменения статуса подписки на цену последней сделки. */
export interface SubscribeLastPriceResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://russianinvestments.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Массив статусов подписки на цену последней сделки. */
    lastPriceSubscriptions: LastPriceSubscription[];
}
/** Статус подписки на цену последней сделки. */
export interface LastPriceSubscription {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Статус подписки. */
    subscriptionStatus: SubscriptionStatus;
    /** Uid инструмента */
    instrumentUid: string;
    /** Идентификатор открытого соединения */
    streamId: string;
    /** Идентификатор подписки в формате UUID */
    subscriptionId: string;
}
/** Пакет свечей в рамках стрима. */
export interface Candle {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Интервал свечи. */
    interval: SubscriptionInterval;
    /** Цена открытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    open: Quotation | undefined;
    /** Максимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    high: Quotation | undefined;
    /** Минимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    low: Quotation | undefined;
    /** Цена закрытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    close: Quotation | undefined;
    /** Объём сделок в лотах. */
    volume: number;
    /** Время начала интервала свечи в часовом поясе UTC. */
    time: Date | undefined;
    /** Время последней сделки, вошедшей в свечу в часовом поясе UTC. */
    lastTradeTs: Date | undefined;
    /** Uid инструмента */
    instrumentUid: string;
}
/** Пакет стаканов в рамках стрима. */
export interface OrderBook {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Глубина стакана. */
    depth: number;
    /** Флаг консистентности стакана. **false** значит не все заявки попали в стакан по причинам сетевых задержек или нарушения порядка доставки. */
    isConsistent: boolean;
    /** Массив предложений. */
    bids: Order[];
    /** Массив спроса. */
    asks: Order[];
    /** Время формирования стакана в часовом поясе UTC по времени биржи. */
    time: Date | undefined;
    /** Верхний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    limitUp: Quotation | undefined;
    /** Нижний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    limitDown: Quotation | undefined;
    /** Uid инструмента */
    instrumentUid: string;
    /** Тип стакана */
    orderBookType: OrderBookType;
}
/** Массив предложений/спроса. */
export interface Order {
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    price: Quotation | undefined;
    /** Количество в лотах. */
    quantity: number;
}
/** Информация о сделке. */
export interface Trade {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Направление сделки. */
    direction: TradeDirection;
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    price: Quotation | undefined;
    /** Количество лотов. */
    quantity: number;
    /** Время сделки в часовом поясе UTC по времени биржи. */
    time: Date | undefined;
    /** Uid инструмента */
    instrumentUid: string;
    /** Источник сделки */
    tradeSource: TradeSourceType;
}
/** Пакет изменения торгового статуса. */
export interface TradingStatus {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Статус торговли инструментом. */
    tradingStatus: SecurityTradingStatus;
    /** Время изменения торгового статуса в часовом поясе UTC. */
    time: Date | undefined;
    /** Признак доступности выставления лимитной заявки по инструменту. */
    limitOrderAvailableFlag: boolean;
    /** Признак доступности выставления рыночной заявки по инструменту. */
    marketOrderAvailableFlag: boolean;
    /** Uid инструмента */
    instrumentUid: string;
}
/** Запрос исторических свечей. */
export interface GetCandlesRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Начало запрашиваемого периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. */
    to: Date | undefined;
    /** Интервал запрошенных свечей. */
    interval: CandleInterval;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId?: string | undefined;
    /** Тип источника свечи */
    candleSourceType?: GetCandlesRequest_CandleSource | undefined;
}
export declare enum GetCandlesRequest_CandleSource {
    /** CANDLE_SOURCE_UNSPECIFIED - Все свечи. */
    CANDLE_SOURCE_UNSPECIFIED = 0,
    /** CANDLE_SOURCE_EXCHANGE - Биржевые свечи. */
    CANDLE_SOURCE_EXCHANGE = 1,
    UNRECOGNIZED = -1
}
export declare function getCandlesRequest_CandleSourceFromJSON(object: any): GetCandlesRequest_CandleSource;
export declare function getCandlesRequest_CandleSourceToJSON(object: GetCandlesRequest_CandleSource): string;
/** Список свечей. */
export interface GetCandlesResponse {
    /** Массив свечей. */
    candles: HistoricCandle[];
}
/** Информация о свече. */
export interface HistoricCandle {
    /** Цена открытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    open: Quotation | undefined;
    /** Максимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    high: Quotation | undefined;
    /** Минимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    low: Quotation | undefined;
    /** Цена закрытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    close: Quotation | undefined;
    /** Объём торгов в лотах. */
    volume: number;
    /** Время свечи в часовом поясе UTC. */
    time: Date | undefined;
    /** Признак завершённости свечи. **false** значит, свеча за текущие интервал ещё сформирована не полностью. */
    isComplete: boolean;
    /** Тип источника свечи */
    candleSource: CandleSource;
}
/** Запрос получения цен последних сделок. */
export interface GetLastPricesRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string[];
    /** Массив идентификаторов инструмента, принимает значения figi или instrument_uid. */
    instrumentId: string[];
}
/** Список цен последних сделок. */
export interface GetLastPricesResponse {
    /** Массив цен последних сделок. */
    lastPrices: LastPrice[];
}
/** Информация о цене последней сделки. */
export interface LastPrice {
    /** Figi инструмента. */
    figi: string;
    /** Цена последней сделки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    price: Quotation | undefined;
    /** Время получения последней цены в часовом поясе UTC по времени биржи. */
    time: Date | undefined;
    /** Uid инструмента */
    instrumentUid: string;
}
/** Запрос стакана. */
export interface GetOrderBookRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Глубина стакана. */
    depth: number;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId?: string | undefined;
}
/** Информация о стакане. */
export interface GetOrderBookResponse {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Глубина стакана. */
    depth: number;
    /** Множество пар значений на покупку. */
    bids: Order[];
    /** Множество пар значений на продажу. */
    asks: Order[];
    /** Цена последней сделки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    lastPrice: Quotation | undefined;
    /** Цена закрытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    closePrice: Quotation | undefined;
    /** Верхний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    limitUp: Quotation | undefined;
    /** Нижний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://russianinvestments.github.io/investAPI/faq_marketdata/) */
    limitDown: Quotation | undefined;
    /** Время получения цены последней сделки. */
    lastPriceTs: Date | undefined;
    /** Время получения цены закрытия. */
    closePriceTs: Date | undefined;
    /** Время формирования стакана на бирже. */
    orderbookTs: Date | undefined;
    /** Uid инструмента. */
    instrumentUid: string;
}
/** Запрос получения торгового статуса. */
export interface GetTradingStatusRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId?: string | undefined;
}
/** Запрос получения торгового статуса. */
export interface GetTradingStatusesRequest {
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string[];
}
/** Информация о торговом статусе. */
export interface GetTradingStatusesResponse {
    /** Массив информации о торговых статусах */
    tradingStatuses: GetTradingStatusResponse[];
}
/** Информация о торговом статусе. */
export interface GetTradingStatusResponse {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Статус торговли инструментом. */
    tradingStatus: SecurityTradingStatus;
    /** Признак доступности выставления лимитной заявки по инструменту. */
    limitOrderAvailableFlag: boolean;
    /** Признак доступности выставления рыночной заявки по инструменту. */
    marketOrderAvailableFlag: boolean;
    /** Признак доступности торгов через API. */
    apiTradeAvailableFlag: boolean;
    /** Uid инструмента. */
    instrumentUid: string;
    /** Признак доступности завяки по лучшей цене */
    bestpriceOrderAvailableFlag: boolean;
    /** Признак доступности только заявки по лучшей цене */
    onlyBestPrice: boolean;
}
/** Запрос обезличенных сделок за последний час. */
export interface GetLastTradesRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Начало запрашиваемого периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. */
    to: Date | undefined;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId?: string | undefined;
}
/** Обезличенных сделок за последний час. */
export interface GetLastTradesResponse {
    /** Массив сделок. */
    trades: Trade[];
}
/** Запрос активных подписок. Запрос вернет по одному сообщению на каждый тип активных подписок (SubscribeLastPriceResponse, SubscribeInfoResponse, SubscribeTradesResponse, SubscribeOrderBookResponse, SubscribeCandlesResponse) */
export interface GetMySubscriptions {
}
/** Запрос цен закрытия торговой сессии по инструментам. */
export interface GetClosePricesRequest {
    /** Массив по инструментам. */
    instruments: InstrumentClosePriceRequest[];
}
/** Запрос цен закрытия торговой сессии по инструменту. */
export interface InstrumentClosePriceRequest {
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId: string;
}
/** Цены закрытия торговой сессии по инструментам. */
export interface GetClosePricesResponse {
    /** Массив по инструментам. */
    closePrices: InstrumentClosePriceResponse[];
}
/** Цена закрытия торговой сессии по инструменту. */
export interface InstrumentClosePriceResponse {
    /** Figi инструмента. */
    figi: string;
    /** Uid инструмента. */
    instrumentUid: string;
    /** Цена закрытия торговой сессии. */
    price: Quotation | undefined;
    /** Цена последней сделки с вечерней сессии */
    eveningSessionPrice: Quotation | undefined;
    /** Дата совершения торгов. */
    time: Date | undefined;
}
export interface GetTechAnalysisRequest {
    /** Тип технического индикатора. */
    indicatorType: GetTechAnalysisRequest_IndicatorType;
    /** Uid инструмента. */
    instrumentUid: string;
    /** Начало запрашиваемого периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. */
    to: Date | undefined;
    /** Интервал, за который рассчитывается индикатор. */
    interval: GetTechAnalysisRequest_IndicatorInterval;
    /** Тип цены, используемый при расчёте индикатора. */
    typeOfPrice: GetTechAnalysisRequest_TypeOfPrice;
    /** Торговый период, за который рассчитывается индикатор. */
    length: number;
    /** Параметры отклонения. */
    deviation: GetTechAnalysisRequest_Deviation | undefined;
    /** Параметры сглаживания. */
    smoothing: GetTechAnalysisRequest_Smoothing | undefined;
}
/** Интервал свечи. */
export declare enum GetTechAnalysisRequest_IndicatorInterval {
    /** INDICATOR_INTERVAL_UNSPECIFIED - Интервал не определён. */
    INDICATOR_INTERVAL_UNSPECIFIED = 0,
    /** INDICATOR_INTERVAL_ONE_MINUTE - 1 минута. */
    INDICATOR_INTERVAL_ONE_MINUTE = 1,
    /** INDICATOR_INTERVAL_FIVE_MINUTES - 5 минут. */
    INDICATOR_INTERVAL_FIVE_MINUTES = 2,
    /** INDICATOR_INTERVAL_FIFTEEN_MINUTES - 15 минут. */
    INDICATOR_INTERVAL_FIFTEEN_MINUTES = 3,
    /** INDICATOR_INTERVAL_ONE_HOUR - 1 час. */
    INDICATOR_INTERVAL_ONE_HOUR = 4,
    /** INDICATOR_INTERVAL_ONE_DAY - 1 день. */
    INDICATOR_INTERVAL_ONE_DAY = 5,
    /** INDICATOR_INTERVAL_2_MIN - 2 минуты. */
    INDICATOR_INTERVAL_2_MIN = 6,
    /** INDICATOR_INTERVAL_3_MIN - 3 минуты. */
    INDICATOR_INTERVAL_3_MIN = 7,
    /** INDICATOR_INTERVAL_10_MIN - 10 минут. */
    INDICATOR_INTERVAL_10_MIN = 8,
    /** INDICATOR_INTERVAL_30_MIN - 30 минут. */
    INDICATOR_INTERVAL_30_MIN = 9,
    /** INDICATOR_INTERVAL_2_HOUR - 2 часа. */
    INDICATOR_INTERVAL_2_HOUR = 10,
    /** INDICATOR_INTERVAL_4_HOUR - 4 часа. */
    INDICATOR_INTERVAL_4_HOUR = 11,
    /** INDICATOR_INTERVAL_WEEK - Неделя */
    INDICATOR_INTERVAL_WEEK = 12,
    /** INDICATOR_INTERVAL_MONTH - Месяц */
    INDICATOR_INTERVAL_MONTH = 13,
    UNRECOGNIZED = -1
}
export declare function getTechAnalysisRequest_IndicatorIntervalFromJSON(object: any): GetTechAnalysisRequest_IndicatorInterval;
export declare function getTechAnalysisRequest_IndicatorIntervalToJSON(object: GetTechAnalysisRequest_IndicatorInterval): string;
export declare enum GetTechAnalysisRequest_TypeOfPrice {
    /** TYPE_OF_PRICE_UNSPECIFIED - Не указано. */
    TYPE_OF_PRICE_UNSPECIFIED = 0,
    /** TYPE_OF_PRICE_CLOSE - Цена закрытия. */
    TYPE_OF_PRICE_CLOSE = 1,
    /** TYPE_OF_PRICE_OPEN - Цена открытия. */
    TYPE_OF_PRICE_OPEN = 2,
    /** TYPE_OF_PRICE_HIGH - Максимальное значение за выбранный интервал. */
    TYPE_OF_PRICE_HIGH = 3,
    /** TYPE_OF_PRICE_LOW - Минимальное значение за выбранный интервал. */
    TYPE_OF_PRICE_LOW = 4,
    /** TYPE_OF_PRICE_AVG - Среднее значение по показателям [ (close + open + high + low) / 4 ]. */
    TYPE_OF_PRICE_AVG = 5,
    UNRECOGNIZED = -1
}
export declare function getTechAnalysisRequest_TypeOfPriceFromJSON(object: any): GetTechAnalysisRequest_TypeOfPrice;
export declare function getTechAnalysisRequest_TypeOfPriceToJSON(object: GetTechAnalysisRequest_TypeOfPrice): string;
export declare enum GetTechAnalysisRequest_IndicatorType {
    /** INDICATOR_TYPE_UNSPECIFIED - Не определен. */
    INDICATOR_TYPE_UNSPECIFIED = 0,
    /** INDICATOR_TYPE_BB - Bollinger Bands (Линия Боллинжера). */
    INDICATOR_TYPE_BB = 1,
    /** INDICATOR_TYPE_EMA - Exponential Moving Average (EMA, Экспоненциальная скользящая средняя). */
    INDICATOR_TYPE_EMA = 2,
    /** INDICATOR_TYPE_RSI - Relative Strength Index (Индекс относительной силы). */
    INDICATOR_TYPE_RSI = 3,
    /** INDICATOR_TYPE_MACD - Moving Average Convergence/Divergence (Схождение/Расхождение скользящих средних). */
    INDICATOR_TYPE_MACD = 4,
    /** INDICATOR_TYPE_SMA - Simple Moving Average (Простое скользящее среднее). */
    INDICATOR_TYPE_SMA = 5,
    UNRECOGNIZED = -1
}
export declare function getTechAnalysisRequest_IndicatorTypeFromJSON(object: any): GetTechAnalysisRequest_IndicatorType;
export declare function getTechAnalysisRequest_IndicatorTypeToJSON(object: GetTechAnalysisRequest_IndicatorType): string;
export interface GetTechAnalysisRequest_Smoothing {
    /** Короткий период сглаживания для первой экспоненциальной скользящей средней (EMA). */
    fastLength: number;
    /** Длинный период сглаживания для второй экспоненциальной скользящей средней (EMA). */
    slowLength: number;
    /** Период сглаживания для третьей экспоненциальной скользящей средней (EMA) */
    signalSmoothing: number;
}
export interface GetTechAnalysisRequest_Deviation {
    /** Кол-во стандартных отклонений, на которые отступает верхняя и нижняя граница */
    deviationMultiplier: Quotation | undefined;
}
export interface GetTechAnalysisResponse {
    /** Массив значений результатов тех. анализа */
    technicalIndicators: GetTechAnalysisResponse_TechAnalysisItem[];
}
export interface GetTechAnalysisResponse_TechAnalysisItem {
    /** Временная метка по UTC, для которой были рассчитаны значения индикатора. */
    timestamp: Date | undefined;
    /** Значение простого скользящего среднего (средней линии). */
    middleBand?: Quotation | undefined;
    /** Значение верхней линии Боллинджера. */
    upperBand?: Quotation | undefined;
    /** Значение нижней линии Боллинджера. */
    lowerBand?: Quotation | undefined;
    /** Значение сигнальной линии. */
    signal?: Quotation | undefined;
    /** Значение линии MACD. */
    macd?: Quotation | undefined;
}
export declare const MarketDataRequest: {
    encode(message: MarketDataRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataRequest;
    fromJSON(object: any): MarketDataRequest;
    toJSON(message: MarketDataRequest): unknown;
    create(base?: DeepPartial<MarketDataRequest>): MarketDataRequest;
    fromPartial(object: DeepPartial<MarketDataRequest>): MarketDataRequest;
};
export declare const MarketDataServerSideStreamRequest: {
    encode(message: MarketDataServerSideStreamRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataServerSideStreamRequest;
    fromJSON(object: any): MarketDataServerSideStreamRequest;
    toJSON(message: MarketDataServerSideStreamRequest): unknown;
    create(base?: DeepPartial<MarketDataServerSideStreamRequest>): MarketDataServerSideStreamRequest;
    fromPartial(object: DeepPartial<MarketDataServerSideStreamRequest>): MarketDataServerSideStreamRequest;
};
export declare const MarketDataResponse: {
    encode(message: MarketDataResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataResponse;
    fromJSON(object: any): MarketDataResponse;
    toJSON(message: MarketDataResponse): unknown;
    create(base?: DeepPartial<MarketDataResponse>): MarketDataResponse;
    fromPartial(object: DeepPartial<MarketDataResponse>): MarketDataResponse;
};
export declare const SubscribeCandlesRequest: {
    encode(message: SubscribeCandlesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeCandlesRequest;
    fromJSON(object: any): SubscribeCandlesRequest;
    toJSON(message: SubscribeCandlesRequest): unknown;
    create(base?: DeepPartial<SubscribeCandlesRequest>): SubscribeCandlesRequest;
    fromPartial(object: DeepPartial<SubscribeCandlesRequest>): SubscribeCandlesRequest;
};
export declare const CandleInstrument: {
    encode(message: CandleInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CandleInstrument;
    fromJSON(object: any): CandleInstrument;
    toJSON(message: CandleInstrument): unknown;
    create(base?: DeepPartial<CandleInstrument>): CandleInstrument;
    fromPartial(object: DeepPartial<CandleInstrument>): CandleInstrument;
};
export declare const SubscribeCandlesResponse: {
    encode(message: SubscribeCandlesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeCandlesResponse;
    fromJSON(object: any): SubscribeCandlesResponse;
    toJSON(message: SubscribeCandlesResponse): unknown;
    create(base?: DeepPartial<SubscribeCandlesResponse>): SubscribeCandlesResponse;
    fromPartial(object: DeepPartial<SubscribeCandlesResponse>): SubscribeCandlesResponse;
};
export declare const CandleSubscription: {
    encode(message: CandleSubscription, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CandleSubscription;
    fromJSON(object: any): CandleSubscription;
    toJSON(message: CandleSubscription): unknown;
    create(base?: DeepPartial<CandleSubscription>): CandleSubscription;
    fromPartial(object: DeepPartial<CandleSubscription>): CandleSubscription;
};
export declare const SubscribeOrderBookRequest: {
    encode(message: SubscribeOrderBookRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeOrderBookRequest;
    fromJSON(object: any): SubscribeOrderBookRequest;
    toJSON(message: SubscribeOrderBookRequest): unknown;
    create(base?: DeepPartial<SubscribeOrderBookRequest>): SubscribeOrderBookRequest;
    fromPartial(object: DeepPartial<SubscribeOrderBookRequest>): SubscribeOrderBookRequest;
};
export declare const OrderBookInstrument: {
    encode(message: OrderBookInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderBookInstrument;
    fromJSON(object: any): OrderBookInstrument;
    toJSON(message: OrderBookInstrument): unknown;
    create(base?: DeepPartial<OrderBookInstrument>): OrderBookInstrument;
    fromPartial(object: DeepPartial<OrderBookInstrument>): OrderBookInstrument;
};
export declare const SubscribeOrderBookResponse: {
    encode(message: SubscribeOrderBookResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeOrderBookResponse;
    fromJSON(object: any): SubscribeOrderBookResponse;
    toJSON(message: SubscribeOrderBookResponse): unknown;
    create(base?: DeepPartial<SubscribeOrderBookResponse>): SubscribeOrderBookResponse;
    fromPartial(object: DeepPartial<SubscribeOrderBookResponse>): SubscribeOrderBookResponse;
};
export declare const OrderBookSubscription: {
    encode(message: OrderBookSubscription, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderBookSubscription;
    fromJSON(object: any): OrderBookSubscription;
    toJSON(message: OrderBookSubscription): unknown;
    create(base?: DeepPartial<OrderBookSubscription>): OrderBookSubscription;
    fromPartial(object: DeepPartial<OrderBookSubscription>): OrderBookSubscription;
};
export declare const SubscribeTradesRequest: {
    encode(message: SubscribeTradesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeTradesRequest;
    fromJSON(object: any): SubscribeTradesRequest;
    toJSON(message: SubscribeTradesRequest): unknown;
    create(base?: DeepPartial<SubscribeTradesRequest>): SubscribeTradesRequest;
    fromPartial(object: DeepPartial<SubscribeTradesRequest>): SubscribeTradesRequest;
};
export declare const TradeInstrument: {
    encode(message: TradeInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradeInstrument;
    fromJSON(object: any): TradeInstrument;
    toJSON(message: TradeInstrument): unknown;
    create(base?: DeepPartial<TradeInstrument>): TradeInstrument;
    fromPartial(object: DeepPartial<TradeInstrument>): TradeInstrument;
};
export declare const SubscribeTradesResponse: {
    encode(message: SubscribeTradesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeTradesResponse;
    fromJSON(object: any): SubscribeTradesResponse;
    toJSON(message: SubscribeTradesResponse): unknown;
    create(base?: DeepPartial<SubscribeTradesResponse>): SubscribeTradesResponse;
    fromPartial(object: DeepPartial<SubscribeTradesResponse>): SubscribeTradesResponse;
};
export declare const TradeSubscription: {
    encode(message: TradeSubscription, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradeSubscription;
    fromJSON(object: any): TradeSubscription;
    toJSON(message: TradeSubscription): unknown;
    create(base?: DeepPartial<TradeSubscription>): TradeSubscription;
    fromPartial(object: DeepPartial<TradeSubscription>): TradeSubscription;
};
export declare const SubscribeInfoRequest: {
    encode(message: SubscribeInfoRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeInfoRequest;
    fromJSON(object: any): SubscribeInfoRequest;
    toJSON(message: SubscribeInfoRequest): unknown;
    create(base?: DeepPartial<SubscribeInfoRequest>): SubscribeInfoRequest;
    fromPartial(object: DeepPartial<SubscribeInfoRequest>): SubscribeInfoRequest;
};
export declare const InfoInstrument: {
    encode(message: InfoInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InfoInstrument;
    fromJSON(object: any): InfoInstrument;
    toJSON(message: InfoInstrument): unknown;
    create(base?: DeepPartial<InfoInstrument>): InfoInstrument;
    fromPartial(object: DeepPartial<InfoInstrument>): InfoInstrument;
};
export declare const SubscribeInfoResponse: {
    encode(message: SubscribeInfoResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeInfoResponse;
    fromJSON(object: any): SubscribeInfoResponse;
    toJSON(message: SubscribeInfoResponse): unknown;
    create(base?: DeepPartial<SubscribeInfoResponse>): SubscribeInfoResponse;
    fromPartial(object: DeepPartial<SubscribeInfoResponse>): SubscribeInfoResponse;
};
export declare const InfoSubscription: {
    encode(message: InfoSubscription, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InfoSubscription;
    fromJSON(object: any): InfoSubscription;
    toJSON(message: InfoSubscription): unknown;
    create(base?: DeepPartial<InfoSubscription>): InfoSubscription;
    fromPartial(object: DeepPartial<InfoSubscription>): InfoSubscription;
};
export declare const SubscribeLastPriceRequest: {
    encode(message: SubscribeLastPriceRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeLastPriceRequest;
    fromJSON(object: any): SubscribeLastPriceRequest;
    toJSON(message: SubscribeLastPriceRequest): unknown;
    create(base?: DeepPartial<SubscribeLastPriceRequest>): SubscribeLastPriceRequest;
    fromPartial(object: DeepPartial<SubscribeLastPriceRequest>): SubscribeLastPriceRequest;
};
export declare const LastPriceInstrument: {
    encode(message: LastPriceInstrument, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LastPriceInstrument;
    fromJSON(object: any): LastPriceInstrument;
    toJSON(message: LastPriceInstrument): unknown;
    create(base?: DeepPartial<LastPriceInstrument>): LastPriceInstrument;
    fromPartial(object: DeepPartial<LastPriceInstrument>): LastPriceInstrument;
};
export declare const SubscribeLastPriceResponse: {
    encode(message: SubscribeLastPriceResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeLastPriceResponse;
    fromJSON(object: any): SubscribeLastPriceResponse;
    toJSON(message: SubscribeLastPriceResponse): unknown;
    create(base?: DeepPartial<SubscribeLastPriceResponse>): SubscribeLastPriceResponse;
    fromPartial(object: DeepPartial<SubscribeLastPriceResponse>): SubscribeLastPriceResponse;
};
export declare const LastPriceSubscription: {
    encode(message: LastPriceSubscription, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LastPriceSubscription;
    fromJSON(object: any): LastPriceSubscription;
    toJSON(message: LastPriceSubscription): unknown;
    create(base?: DeepPartial<LastPriceSubscription>): LastPriceSubscription;
    fromPartial(object: DeepPartial<LastPriceSubscription>): LastPriceSubscription;
};
export declare const Candle: {
    encode(message: Candle, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Candle;
    fromJSON(object: any): Candle;
    toJSON(message: Candle): unknown;
    create(base?: DeepPartial<Candle>): Candle;
    fromPartial(object: DeepPartial<Candle>): Candle;
};
export declare const OrderBook: {
    encode(message: OrderBook, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderBook;
    fromJSON(object: any): OrderBook;
    toJSON(message: OrderBook): unknown;
    create(base?: DeepPartial<OrderBook>): OrderBook;
    fromPartial(object: DeepPartial<OrderBook>): OrderBook;
};
export declare const Order: {
    encode(message: Order, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Order;
    fromJSON(object: any): Order;
    toJSON(message: Order): unknown;
    create(base?: DeepPartial<Order>): Order;
    fromPartial(object: DeepPartial<Order>): Order;
};
export declare const Trade: {
    encode(message: Trade, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Trade;
    fromJSON(object: any): Trade;
    toJSON(message: Trade): unknown;
    create(base?: DeepPartial<Trade>): Trade;
    fromPartial(object: DeepPartial<Trade>): Trade;
};
export declare const TradingStatus: {
    encode(message: TradingStatus, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradingStatus;
    fromJSON(object: any): TradingStatus;
    toJSON(message: TradingStatus): unknown;
    create(base?: DeepPartial<TradingStatus>): TradingStatus;
    fromPartial(object: DeepPartial<TradingStatus>): TradingStatus;
};
export declare const GetCandlesRequest: {
    encode(message: GetCandlesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetCandlesRequest;
    fromJSON(object: any): GetCandlesRequest;
    toJSON(message: GetCandlesRequest): unknown;
    create(base?: DeepPartial<GetCandlesRequest>): GetCandlesRequest;
    fromPartial(object: DeepPartial<GetCandlesRequest>): GetCandlesRequest;
};
export declare const GetCandlesResponse: {
    encode(message: GetCandlesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetCandlesResponse;
    fromJSON(object: any): GetCandlesResponse;
    toJSON(message: GetCandlesResponse): unknown;
    create(base?: DeepPartial<GetCandlesResponse>): GetCandlesResponse;
    fromPartial(object: DeepPartial<GetCandlesResponse>): GetCandlesResponse;
};
export declare const HistoricCandle: {
    encode(message: HistoricCandle, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HistoricCandle;
    fromJSON(object: any): HistoricCandle;
    toJSON(message: HistoricCandle): unknown;
    create(base?: DeepPartial<HistoricCandle>): HistoricCandle;
    fromPartial(object: DeepPartial<HistoricCandle>): HistoricCandle;
};
export declare const GetLastPricesRequest: {
    encode(message: GetLastPricesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetLastPricesRequest;
    fromJSON(object: any): GetLastPricesRequest;
    toJSON(message: GetLastPricesRequest): unknown;
    create(base?: DeepPartial<GetLastPricesRequest>): GetLastPricesRequest;
    fromPartial(object: DeepPartial<GetLastPricesRequest>): GetLastPricesRequest;
};
export declare const GetLastPricesResponse: {
    encode(message: GetLastPricesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetLastPricesResponse;
    fromJSON(object: any): GetLastPricesResponse;
    toJSON(message: GetLastPricesResponse): unknown;
    create(base?: DeepPartial<GetLastPricesResponse>): GetLastPricesResponse;
    fromPartial(object: DeepPartial<GetLastPricesResponse>): GetLastPricesResponse;
};
export declare const LastPrice: {
    encode(message: LastPrice, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LastPrice;
    fromJSON(object: any): LastPrice;
    toJSON(message: LastPrice): unknown;
    create(base?: DeepPartial<LastPrice>): LastPrice;
    fromPartial(object: DeepPartial<LastPrice>): LastPrice;
};
export declare const GetOrderBookRequest: {
    encode(message: GetOrderBookRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderBookRequest;
    fromJSON(object: any): GetOrderBookRequest;
    toJSON(message: GetOrderBookRequest): unknown;
    create(base?: DeepPartial<GetOrderBookRequest>): GetOrderBookRequest;
    fromPartial(object: DeepPartial<GetOrderBookRequest>): GetOrderBookRequest;
};
export declare const GetOrderBookResponse: {
    encode(message: GetOrderBookResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderBookResponse;
    fromJSON(object: any): GetOrderBookResponse;
    toJSON(message: GetOrderBookResponse): unknown;
    create(base?: DeepPartial<GetOrderBookResponse>): GetOrderBookResponse;
    fromPartial(object: DeepPartial<GetOrderBookResponse>): GetOrderBookResponse;
};
export declare const GetTradingStatusRequest: {
    encode(message: GetTradingStatusRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusRequest;
    fromJSON(object: any): GetTradingStatusRequest;
    toJSON(message: GetTradingStatusRequest): unknown;
    create(base?: DeepPartial<GetTradingStatusRequest>): GetTradingStatusRequest;
    fromPartial(object: DeepPartial<GetTradingStatusRequest>): GetTradingStatusRequest;
};
export declare const GetTradingStatusesRequest: {
    encode(message: GetTradingStatusesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusesRequest;
    fromJSON(object: any): GetTradingStatusesRequest;
    toJSON(message: GetTradingStatusesRequest): unknown;
    create(base?: DeepPartial<GetTradingStatusesRequest>): GetTradingStatusesRequest;
    fromPartial(object: DeepPartial<GetTradingStatusesRequest>): GetTradingStatusesRequest;
};
export declare const GetTradingStatusesResponse: {
    encode(message: GetTradingStatusesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusesResponse;
    fromJSON(object: any): GetTradingStatusesResponse;
    toJSON(message: GetTradingStatusesResponse): unknown;
    create(base?: DeepPartial<GetTradingStatusesResponse>): GetTradingStatusesResponse;
    fromPartial(object: DeepPartial<GetTradingStatusesResponse>): GetTradingStatusesResponse;
};
export declare const GetTradingStatusResponse: {
    encode(message: GetTradingStatusResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusResponse;
    fromJSON(object: any): GetTradingStatusResponse;
    toJSON(message: GetTradingStatusResponse): unknown;
    create(base?: DeepPartial<GetTradingStatusResponse>): GetTradingStatusResponse;
    fromPartial(object: DeepPartial<GetTradingStatusResponse>): GetTradingStatusResponse;
};
export declare const GetLastTradesRequest: {
    encode(message: GetLastTradesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetLastTradesRequest;
    fromJSON(object: any): GetLastTradesRequest;
    toJSON(message: GetLastTradesRequest): unknown;
    create(base?: DeepPartial<GetLastTradesRequest>): GetLastTradesRequest;
    fromPartial(object: DeepPartial<GetLastTradesRequest>): GetLastTradesRequest;
};
export declare const GetLastTradesResponse: {
    encode(message: GetLastTradesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetLastTradesResponse;
    fromJSON(object: any): GetLastTradesResponse;
    toJSON(message: GetLastTradesResponse): unknown;
    create(base?: DeepPartial<GetLastTradesResponse>): GetLastTradesResponse;
    fromPartial(object: DeepPartial<GetLastTradesResponse>): GetLastTradesResponse;
};
export declare const GetMySubscriptions: {
    encode(_: GetMySubscriptions, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMySubscriptions;
    fromJSON(_: any): GetMySubscriptions;
    toJSON(_: GetMySubscriptions): unknown;
    create(base?: DeepPartial<GetMySubscriptions>): GetMySubscriptions;
    fromPartial(_: DeepPartial<GetMySubscriptions>): GetMySubscriptions;
};
export declare const GetClosePricesRequest: {
    encode(message: GetClosePricesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetClosePricesRequest;
    fromJSON(object: any): GetClosePricesRequest;
    toJSON(message: GetClosePricesRequest): unknown;
    create(base?: DeepPartial<GetClosePricesRequest>): GetClosePricesRequest;
    fromPartial(object: DeepPartial<GetClosePricesRequest>): GetClosePricesRequest;
};
export declare const InstrumentClosePriceRequest: {
    encode(message: InstrumentClosePriceRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentClosePriceRequest;
    fromJSON(object: any): InstrumentClosePriceRequest;
    toJSON(message: InstrumentClosePriceRequest): unknown;
    create(base?: DeepPartial<InstrumentClosePriceRequest>): InstrumentClosePriceRequest;
    fromPartial(object: DeepPartial<InstrumentClosePriceRequest>): InstrumentClosePriceRequest;
};
export declare const GetClosePricesResponse: {
    encode(message: GetClosePricesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetClosePricesResponse;
    fromJSON(object: any): GetClosePricesResponse;
    toJSON(message: GetClosePricesResponse): unknown;
    create(base?: DeepPartial<GetClosePricesResponse>): GetClosePricesResponse;
    fromPartial(object: DeepPartial<GetClosePricesResponse>): GetClosePricesResponse;
};
export declare const InstrumentClosePriceResponse: {
    encode(message: InstrumentClosePriceResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InstrumentClosePriceResponse;
    fromJSON(object: any): InstrumentClosePriceResponse;
    toJSON(message: InstrumentClosePriceResponse): unknown;
    create(base?: DeepPartial<InstrumentClosePriceResponse>): InstrumentClosePriceResponse;
    fromPartial(object: DeepPartial<InstrumentClosePriceResponse>): InstrumentClosePriceResponse;
};
export declare const GetTechAnalysisRequest: {
    encode(message: GetTechAnalysisRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisRequest;
    fromJSON(object: any): GetTechAnalysisRequest;
    toJSON(message: GetTechAnalysisRequest): unknown;
    create(base?: DeepPartial<GetTechAnalysisRequest>): GetTechAnalysisRequest;
    fromPartial(object: DeepPartial<GetTechAnalysisRequest>): GetTechAnalysisRequest;
};
export declare const GetTechAnalysisRequest_Smoothing: {
    encode(message: GetTechAnalysisRequest_Smoothing, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisRequest_Smoothing;
    fromJSON(object: any): GetTechAnalysisRequest_Smoothing;
    toJSON(message: GetTechAnalysisRequest_Smoothing): unknown;
    create(base?: DeepPartial<GetTechAnalysisRequest_Smoothing>): GetTechAnalysisRequest_Smoothing;
    fromPartial(object: DeepPartial<GetTechAnalysisRequest_Smoothing>): GetTechAnalysisRequest_Smoothing;
};
export declare const GetTechAnalysisRequest_Deviation: {
    encode(message: GetTechAnalysisRequest_Deviation, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisRequest_Deviation;
    fromJSON(object: any): GetTechAnalysisRequest_Deviation;
    toJSON(message: GetTechAnalysisRequest_Deviation): unknown;
    create(base?: DeepPartial<GetTechAnalysisRequest_Deviation>): GetTechAnalysisRequest_Deviation;
    fromPartial(object: DeepPartial<GetTechAnalysisRequest_Deviation>): GetTechAnalysisRequest_Deviation;
};
export declare const GetTechAnalysisResponse: {
    encode(message: GetTechAnalysisResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisResponse;
    fromJSON(object: any): GetTechAnalysisResponse;
    toJSON(message: GetTechAnalysisResponse): unknown;
    create(base?: DeepPartial<GetTechAnalysisResponse>): GetTechAnalysisResponse;
    fromPartial(object: DeepPartial<GetTechAnalysisResponse>): GetTechAnalysisResponse;
};
export declare const GetTechAnalysisResponse_TechAnalysisItem: {
    encode(message: GetTechAnalysisResponse_TechAnalysisItem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisResponse_TechAnalysisItem;
    fromJSON(object: any): GetTechAnalysisResponse_TechAnalysisItem;
    toJSON(message: GetTechAnalysisResponse_TechAnalysisItem): unknown;
    create(base?: DeepPartial<GetTechAnalysisResponse_TechAnalysisItem>): GetTechAnalysisResponse_TechAnalysisItem;
    fromPartial(object: DeepPartial<GetTechAnalysisResponse_TechAnalysisItem>): GetTechAnalysisResponse_TechAnalysisItem;
};
/** Сервис получения биржевой информации:</br> **1**. свечи;</br> **2**. стаканы;</br> **3**. торговые статусы;</br> **4**. лента сделок. */
export type MarketDataServiceDefinition = typeof MarketDataServiceDefinition;
export declare const MarketDataServiceDefinition: {
    readonly name: "MarketDataService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.MarketDataService";
    readonly methods: {
        /** Метод запроса исторических свечей по инструменту. */
        readonly getCandles: {
            readonly name: "GetCandles";
            readonly requestType: {
                encode(message: GetCandlesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetCandlesRequest;
                fromJSON(object: any): GetCandlesRequest;
                toJSON(message: GetCandlesRequest): unknown;
                create(base?: DeepPartial<GetCandlesRequest>): GetCandlesRequest;
                fromPartial(object: DeepPartial<GetCandlesRequest>): GetCandlesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetCandlesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetCandlesResponse;
                fromJSON(object: any): GetCandlesResponse;
                toJSON(message: GetCandlesResponse): unknown;
                create(base?: DeepPartial<GetCandlesResponse>): GetCandlesResponse;
                fromPartial(object: DeepPartial<GetCandlesResponse>): GetCandlesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса цен последних сделок по инструментам. */
        readonly getLastPrices: {
            readonly name: "GetLastPrices";
            readonly requestType: {
                encode(message: GetLastPricesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetLastPricesRequest;
                fromJSON(object: any): GetLastPricesRequest;
                toJSON(message: GetLastPricesRequest): unknown;
                create(base?: DeepPartial<GetLastPricesRequest>): GetLastPricesRequest;
                fromPartial(object: DeepPartial<GetLastPricesRequest>): GetLastPricesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetLastPricesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetLastPricesResponse;
                fromJSON(object: any): GetLastPricesResponse;
                toJSON(message: GetLastPricesResponse): unknown;
                create(base?: DeepPartial<GetLastPricesResponse>): GetLastPricesResponse;
                fromPartial(object: DeepPartial<GetLastPricesResponse>): GetLastPricesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения стакана по инструменту. */
        readonly getOrderBook: {
            readonly name: "GetOrderBook";
            readonly requestType: {
                encode(message: GetOrderBookRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderBookRequest;
                fromJSON(object: any): GetOrderBookRequest;
                toJSON(message: GetOrderBookRequest): unknown;
                create(base?: DeepPartial<GetOrderBookRequest>): GetOrderBookRequest;
                fromPartial(object: DeepPartial<GetOrderBookRequest>): GetOrderBookRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOrderBookResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderBookResponse;
                fromJSON(object: any): GetOrderBookResponse;
                toJSON(message: GetOrderBookResponse): unknown;
                create(base?: DeepPartial<GetOrderBookResponse>): GetOrderBookResponse;
                fromPartial(object: DeepPartial<GetOrderBookResponse>): GetOrderBookResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса статуса торгов по инструментам. */
        readonly getTradingStatus: {
            readonly name: "GetTradingStatus";
            readonly requestType: {
                encode(message: GetTradingStatusRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusRequest;
                fromJSON(object: any): GetTradingStatusRequest;
                toJSON(message: GetTradingStatusRequest): unknown;
                create(base?: DeepPartial<GetTradingStatusRequest>): GetTradingStatusRequest;
                fromPartial(object: DeepPartial<GetTradingStatusRequest>): GetTradingStatusRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetTradingStatusResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusResponse;
                fromJSON(object: any): GetTradingStatusResponse;
                toJSON(message: GetTradingStatusResponse): unknown;
                create(base?: DeepPartial<GetTradingStatusResponse>): GetTradingStatusResponse;
                fromPartial(object: DeepPartial<GetTradingStatusResponse>): GetTradingStatusResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса статуса торгов по инструментам. */
        readonly getTradingStatuses: {
            readonly name: "GetTradingStatuses";
            readonly requestType: {
                encode(message: GetTradingStatusesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusesRequest;
                fromJSON(object: any): GetTradingStatusesRequest;
                toJSON(message: GetTradingStatusesRequest): unknown;
                create(base?: DeepPartial<GetTradingStatusesRequest>): GetTradingStatusesRequest;
                fromPartial(object: DeepPartial<GetTradingStatusesRequest>): GetTradingStatusesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetTradingStatusesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetTradingStatusesResponse;
                fromJSON(object: any): GetTradingStatusesResponse;
                toJSON(message: GetTradingStatusesResponse): unknown;
                create(base?: DeepPartial<GetTradingStatusesResponse>): GetTradingStatusesResponse;
                fromPartial(object: DeepPartial<GetTradingStatusesResponse>): GetTradingStatusesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса обезличенных сделок за последний час. */
        readonly getLastTrades: {
            readonly name: "GetLastTrades";
            readonly requestType: {
                encode(message: GetLastTradesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetLastTradesRequest;
                fromJSON(object: any): GetLastTradesRequest;
                toJSON(message: GetLastTradesRequest): unknown;
                create(base?: DeepPartial<GetLastTradesRequest>): GetLastTradesRequest;
                fromPartial(object: DeepPartial<GetLastTradesRequest>): GetLastTradesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetLastTradesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetLastTradesResponse;
                fromJSON(object: any): GetLastTradesResponse;
                toJSON(message: GetLastTradesResponse): unknown;
                create(base?: DeepPartial<GetLastTradesResponse>): GetLastTradesResponse;
                fromPartial(object: DeepPartial<GetLastTradesResponse>): GetLastTradesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса цен закрытия торговой сессии по инструментам. */
        readonly getClosePrices: {
            readonly name: "GetClosePrices";
            readonly requestType: {
                encode(message: GetClosePricesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetClosePricesRequest;
                fromJSON(object: any): GetClosePricesRequest;
                toJSON(message: GetClosePricesRequest): unknown;
                create(base?: DeepPartial<GetClosePricesRequest>): GetClosePricesRequest;
                fromPartial(object: DeepPartial<GetClosePricesRequest>): GetClosePricesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetClosePricesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetClosePricesResponse;
                fromJSON(object: any): GetClosePricesResponse;
                toJSON(message: GetClosePricesResponse): unknown;
                create(base?: DeepPartial<GetClosePricesResponse>): GetClosePricesResponse;
                fromPartial(object: DeepPartial<GetClosePricesResponse>): GetClosePricesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения технических индикаторов по инструменту */
        readonly getTechAnalysis: {
            readonly name: "GetTechAnalysis";
            readonly requestType: {
                encode(message: GetTechAnalysisRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisRequest;
                fromJSON(object: any): GetTechAnalysisRequest;
                toJSON(message: GetTechAnalysisRequest): unknown;
                create(base?: DeepPartial<GetTechAnalysisRequest>): GetTechAnalysisRequest;
                fromPartial(object: DeepPartial<GetTechAnalysisRequest>): GetTechAnalysisRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetTechAnalysisResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetTechAnalysisResponse;
                fromJSON(object: any): GetTechAnalysisResponse;
                toJSON(message: GetTechAnalysisResponse): unknown;
                create(base?: DeepPartial<GetTechAnalysisResponse>): GetTechAnalysisResponse;
                fromPartial(object: DeepPartial<GetTechAnalysisResponse>): GetTechAnalysisResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface MarketDataServiceImplementation<CallContextExt = {}> {
    /** Метод запроса исторических свечей по инструменту. */
    getCandles(request: GetCandlesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetCandlesResponse>>;
    /** Метод запроса цен последних сделок по инструментам. */
    getLastPrices(request: GetLastPricesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetLastPricesResponse>>;
    /** Метод получения стакана по инструменту. */
    getOrderBook(request: GetOrderBookRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOrderBookResponse>>;
    /** Метод запроса статуса торгов по инструментам. */
    getTradingStatus(request: GetTradingStatusRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetTradingStatusResponse>>;
    /** Метод запроса статуса торгов по инструментам. */
    getTradingStatuses(request: GetTradingStatusesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetTradingStatusesResponse>>;
    /** Метод запроса обезличенных сделок за последний час. */
    getLastTrades(request: GetLastTradesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetLastTradesResponse>>;
    /** Метод запроса цен закрытия торговой сессии по инструментам. */
    getClosePrices(request: GetClosePricesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetClosePricesResponse>>;
    /** Метод получения технических индикаторов по инструменту */
    getTechAnalysis(request: GetTechAnalysisRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetTechAnalysisResponse>>;
}
export interface MarketDataServiceClient<CallOptionsExt = {}> {
    /** Метод запроса исторических свечей по инструменту. */
    getCandles(request: DeepPartial<GetCandlesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetCandlesResponse>;
    /** Метод запроса цен последних сделок по инструментам. */
    getLastPrices(request: DeepPartial<GetLastPricesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetLastPricesResponse>;
    /** Метод получения стакана по инструменту. */
    getOrderBook(request: DeepPartial<GetOrderBookRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOrderBookResponse>;
    /** Метод запроса статуса торгов по инструментам. */
    getTradingStatus(request: DeepPartial<GetTradingStatusRequest>, options?: CallOptions & CallOptionsExt): Promise<GetTradingStatusResponse>;
    /** Метод запроса статуса торгов по инструментам. */
    getTradingStatuses(request: DeepPartial<GetTradingStatusesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetTradingStatusesResponse>;
    /** Метод запроса обезличенных сделок за последний час. */
    getLastTrades(request: DeepPartial<GetLastTradesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetLastTradesResponse>;
    /** Метод запроса цен закрытия торговой сессии по инструментам. */
    getClosePrices(request: DeepPartial<GetClosePricesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetClosePricesResponse>;
    /** Метод получения технических индикаторов по инструменту */
    getTechAnalysis(request: DeepPartial<GetTechAnalysisRequest>, options?: CallOptions & CallOptionsExt): Promise<GetTechAnalysisResponse>;
}
export type MarketDataStreamServiceDefinition = typeof MarketDataStreamServiceDefinition;
export declare const MarketDataStreamServiceDefinition: {
    readonly name: "MarketDataStreamService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.MarketDataStreamService";
    readonly methods: {
        /** Bi-directional стрим предоставления биржевой информации. */
        readonly marketDataStream: {
            readonly name: "MarketDataStream";
            readonly requestType: {
                encode(message: MarketDataRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataRequest;
                fromJSON(object: any): MarketDataRequest;
                toJSON(message: MarketDataRequest): unknown;
                create(base?: DeepPartial<MarketDataRequest>): MarketDataRequest;
                fromPartial(object: DeepPartial<MarketDataRequest>): MarketDataRequest;
            };
            readonly requestStream: true;
            readonly responseType: {
                encode(message: MarketDataResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataResponse;
                fromJSON(object: any): MarketDataResponse;
                toJSON(message: MarketDataResponse): unknown;
                create(base?: DeepPartial<MarketDataResponse>): MarketDataResponse;
                fromPartial(object: DeepPartial<MarketDataResponse>): MarketDataResponse;
            };
            readonly responseStream: true;
            readonly options: {};
        };
        /** Server-side стрим предоставления биржевой информации. */
        readonly marketDataServerSideStream: {
            readonly name: "MarketDataServerSideStream";
            readonly requestType: {
                encode(message: MarketDataServerSideStreamRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataServerSideStreamRequest;
                fromJSON(object: any): MarketDataServerSideStreamRequest;
                toJSON(message: MarketDataServerSideStreamRequest): unknown;
                create(base?: DeepPartial<MarketDataServerSideStreamRequest>): MarketDataServerSideStreamRequest;
                fromPartial(object: DeepPartial<MarketDataServerSideStreamRequest>): MarketDataServerSideStreamRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: MarketDataResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): MarketDataResponse;
                fromJSON(object: any): MarketDataResponse;
                toJSON(message: MarketDataResponse): unknown;
                create(base?: DeepPartial<MarketDataResponse>): MarketDataResponse;
                fromPartial(object: DeepPartial<MarketDataResponse>): MarketDataResponse;
            };
            readonly responseStream: true;
            readonly options: {};
        };
    };
};
export interface MarketDataStreamServiceImplementation<CallContextExt = {}> {
    /** Bi-directional стрим предоставления биржевой информации. */
    marketDataStream(request: AsyncIterable<MarketDataRequest>, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<MarketDataResponse>>;
    /** Server-side стрим предоставления биржевой информации. */
    marketDataServerSideStream(request: MarketDataServerSideStreamRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<MarketDataResponse>>;
}
export interface MarketDataStreamServiceClient<CallOptionsExt = {}> {
    /** Bi-directional стрим предоставления биржевой информации. */
    marketDataStream(request: AsyncIterable<DeepPartial<MarketDataRequest>>, options?: CallOptions & CallOptionsExt): AsyncIterable<MarketDataResponse>;
    /** Server-side стрим предоставления биржевой информации. */
    marketDataServerSideStream(request: DeepPartial<MarketDataServerSideStreamRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<MarketDataResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export type ServerStreamingMethodResult<Response> = {
    [Symbol.asyncIterator](): AsyncIterator<Response, void>;
};
export {};
