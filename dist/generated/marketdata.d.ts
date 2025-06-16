import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import type { CallContext, CallOptions } from "nice-grpc-common";
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
    /** SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID - Некорректный статус подписки, список возможных значений: [SubscriptionAction](https://tinkoff.github.io/investAPI/marketdata#subscriptionaction). */
    SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID = 3,
    /** SUBSCRIPTION_STATUS_DEPTH_IS_INVALID - Некорректная глубина стакана, доступные значения: 1, 10, 20, 30, 40, 50. */
    SUBSCRIPTION_STATUS_DEPTH_IS_INVALID = 4,
    /** SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID - Некорректный интервал свечей, список возможных значений: [SubscriptionInterval](https://tinkoff.github.io/investAPI/marketdata#subscriptioninterval). */
    SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID = 5,
    /** SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED - Превышен лимит на общее количество подписок в рамках стрима, подробнее: [Лимитная политика](https://tinkoff.github.io/investAPI/limits/). */
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
    /** Флаг ожидания закрытия временного интервала для отправки свечи, применяется только для минутных свечей. */
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
    /** Интервал свечей. */
    interval: SubscriptionInterval;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid */
    instrumentId: string;
}
/** Результат изменения статус подписки на свечи. */
export interface SubscribeCandlesResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://tinkoff.github.io/investAPI/grpc#tracking-id). */
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
}
/** Результат изменения статуса подписки на стаканы. */
export interface SubscribeOrderBookResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://tinkoff.github.io/investAPI/grpc#tracking-id). */
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
}
/** Изменение статуса подписки на поток обезличенных сделок. */
export interface SubscribeTradesRequest {
    /** Изменение статуса подписки. */
    subscriptionAction: SubscriptionAction;
    /** Массив инструментов для подписки на поток обезличенных сделок. */
    instruments: TradeInstrument[];
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
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://tinkoff.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Массив статусов подписки на поток сделок. */
    tradeSubscriptions: TradeSubscription[];
}
/** Статус подписки. */
export interface TradeSubscription {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Статус подписки. */
    subscriptionStatus: SubscriptionStatus;
    /** Uid инструмента */
    instrumentUid: string;
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
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://tinkoff.github.io/investAPI/grpc#tracking-id). */
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
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://tinkoff.github.io/investAPI/grpc#tracking-id). */
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
}
/** Пакет свечей в рамках стрима. */
export interface Candle {
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Интервал свечи. */
    interval: SubscriptionInterval;
    /** Цена открытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    open: Quotation | undefined;
    /** Максимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    high: Quotation | undefined;
    /** Минимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    low: Quotation | undefined;
    /** Цена закрытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
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
    /** Верхний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    limitUp: Quotation | undefined;
    /** Нижний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    limitDown: Quotation | undefined;
    /** Uid инструмента */
    instrumentUid: string;
}
/** Массив предложений/спроса. */
export interface Order {
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
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
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    price: Quotation | undefined;
    /** Количество лотов. */
    quantity: number;
    /** Время сделки в часовом поясе UTC по времени биржи. */
    time: Date | undefined;
    /** Uid инструмента */
    instrumentUid: string;
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
    figi: string;
    /** Начало запрашиваемого периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. */
    to: Date | undefined;
    /** Интервал запрошенных свечей. */
    interval: CandleInterval;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId: string;
}
/** Список свечей. */
export interface GetCandlesResponse {
    /** Массив свечей. */
    candles: HistoricCandle[];
}
/** Информация о свече. */
export interface HistoricCandle {
    /** Цена открытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    open: Quotation | undefined;
    /** Максимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    high: Quotation | undefined;
    /** Минимальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    low: Quotation | undefined;
    /** Цена закрытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    close: Quotation | undefined;
    /** Объём торгов в лотах. */
    volume: number;
    /** Время свечи в часовом поясе UTC. */
    time: Date | undefined;
    /** Признак завершённости свечи. **false** значит, свеча за текущие интервал ещё сформирована не полностью. */
    isComplete: boolean;
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
    /** Цена последней сделки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
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
    figi: string;
    /** Глубина стакана. */
    depth: number;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId: string;
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
    /** Цена последней сделки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    lastPrice: Quotation | undefined;
    /** Цена закрытия за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    closePrice: Quotation | undefined;
    /** Верхний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
    limitUp: Quotation | undefined;
    /** Нижний лимит цены за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Для перевод цен в валюту рекомендуем использовать [информацию со страницы](https://tinkoff.github.io/investAPI/faq_marketdata/) */
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
    figi: string;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId: string;
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
}
/** Запрос обезличенных сделок за последний час. */
export interface GetLastTradesRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Начало запрашиваемого периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание запрашиваемого периода в часовом поясе UTC. */
    to: Date | undefined;
    /** Идентификатор инструмента, принимает значение figi или instrument_uid. */
    instrumentId: string;
}
/** Обезличенных сделок за последний час. */
export interface GetLastTradesResponse {
    /** Массив сделок. */
    trades: Trade[];
}
/** Запрос активных подписок. */
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
    /** Дата совершения торгов. */
    time: Date | undefined;
}
export declare const MarketDataRequest: MessageFns<MarketDataRequest>;
export declare const MarketDataServerSideStreamRequest: MessageFns<MarketDataServerSideStreamRequest>;
export declare const MarketDataResponse: MessageFns<MarketDataResponse>;
export declare const SubscribeCandlesRequest: MessageFns<SubscribeCandlesRequest>;
export declare const CandleInstrument: MessageFns<CandleInstrument>;
export declare const SubscribeCandlesResponse: MessageFns<SubscribeCandlesResponse>;
export declare const CandleSubscription: MessageFns<CandleSubscription>;
export declare const SubscribeOrderBookRequest: MessageFns<SubscribeOrderBookRequest>;
export declare const OrderBookInstrument: MessageFns<OrderBookInstrument>;
export declare const SubscribeOrderBookResponse: MessageFns<SubscribeOrderBookResponse>;
export declare const OrderBookSubscription: MessageFns<OrderBookSubscription>;
export declare const SubscribeTradesRequest: MessageFns<SubscribeTradesRequest>;
export declare const TradeInstrument: MessageFns<TradeInstrument>;
export declare const SubscribeTradesResponse: MessageFns<SubscribeTradesResponse>;
export declare const TradeSubscription: MessageFns<TradeSubscription>;
export declare const SubscribeInfoRequest: MessageFns<SubscribeInfoRequest>;
export declare const InfoInstrument: MessageFns<InfoInstrument>;
export declare const SubscribeInfoResponse: MessageFns<SubscribeInfoResponse>;
export declare const InfoSubscription: MessageFns<InfoSubscription>;
export declare const SubscribeLastPriceRequest: MessageFns<SubscribeLastPriceRequest>;
export declare const LastPriceInstrument: MessageFns<LastPriceInstrument>;
export declare const SubscribeLastPriceResponse: MessageFns<SubscribeLastPriceResponse>;
export declare const LastPriceSubscription: MessageFns<LastPriceSubscription>;
export declare const Candle: MessageFns<Candle>;
export declare const OrderBook: MessageFns<OrderBook>;
export declare const Order: MessageFns<Order>;
export declare const Trade: MessageFns<Trade>;
export declare const TradingStatus: MessageFns<TradingStatus>;
export declare const GetCandlesRequest: MessageFns<GetCandlesRequest>;
export declare const GetCandlesResponse: MessageFns<GetCandlesResponse>;
export declare const HistoricCandle: MessageFns<HistoricCandle>;
export declare const GetLastPricesRequest: MessageFns<GetLastPricesRequest>;
export declare const GetLastPricesResponse: MessageFns<GetLastPricesResponse>;
export declare const LastPrice: MessageFns<LastPrice>;
export declare const GetOrderBookRequest: MessageFns<GetOrderBookRequest>;
export declare const GetOrderBookResponse: MessageFns<GetOrderBookResponse>;
export declare const GetTradingStatusRequest: MessageFns<GetTradingStatusRequest>;
export declare const GetTradingStatusesRequest: MessageFns<GetTradingStatusesRequest>;
export declare const GetTradingStatusesResponse: MessageFns<GetTradingStatusesResponse>;
export declare const GetTradingStatusResponse: MessageFns<GetTradingStatusResponse>;
export declare const GetLastTradesRequest: MessageFns<GetLastTradesRequest>;
export declare const GetLastTradesResponse: MessageFns<GetLastTradesResponse>;
export declare const GetMySubscriptions: MessageFns<GetMySubscriptions>;
export declare const GetClosePricesRequest: MessageFns<GetClosePricesRequest>;
export declare const InstrumentClosePriceRequest: MessageFns<InstrumentClosePriceRequest>;
export declare const GetClosePricesResponse: MessageFns<GetClosePricesResponse>;
export declare const InstrumentClosePriceResponse: MessageFns<InstrumentClosePriceResponse>;
/** Сервис получения биржевой информации:</br> **1**. свечи;</br> **2**. стаканы;</br> **3**. торговые статусы;</br> **4**. лента сделок. */
export type MarketDataServiceDefinition = typeof MarketDataServiceDefinition;
export declare const MarketDataServiceDefinition: {
    readonly name: "MarketDataService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.MarketDataService";
    readonly methods: {
        /** Метод запроса исторических свечей по инструменту. */
        readonly getCandles: {
            readonly name: "GetCandles";
            readonly requestType: MessageFns<GetCandlesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetCandlesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса цен последних сделок по инструментам. */
        readonly getLastPrices: {
            readonly name: "GetLastPrices";
            readonly requestType: MessageFns<GetLastPricesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetLastPricesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения стакана по инструменту. */
        readonly getOrderBook: {
            readonly name: "GetOrderBook";
            readonly requestType: MessageFns<GetOrderBookRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetOrderBookResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса статуса торгов по инструментам. */
        readonly getTradingStatus: {
            readonly name: "GetTradingStatus";
            readonly requestType: MessageFns<GetTradingStatusRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetTradingStatusResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса статуса торгов по инструментам. */
        readonly getTradingStatuses: {
            readonly name: "GetTradingStatuses";
            readonly requestType: MessageFns<GetTradingStatusesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetTradingStatusesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса обезличенных сделок за последний час. */
        readonly getLastTrades: {
            readonly name: "GetLastTrades";
            readonly requestType: MessageFns<GetLastTradesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetLastTradesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод запроса цен закрытия торговой сессии по инструментам. */
        readonly getClosePrices: {
            readonly name: "GetClosePrices";
            readonly requestType: MessageFns<GetClosePricesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetClosePricesResponse>;
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
}
export type MarketDataStreamServiceDefinition = typeof MarketDataStreamServiceDefinition;
export declare const MarketDataStreamServiceDefinition: {
    readonly name: "MarketDataStreamService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.MarketDataStreamService";
    readonly methods: {
        /** Bi-directional стрим предоставления биржевой информации. */
        readonly marketDataStream: {
            readonly name: "MarketDataStream";
            readonly requestType: MessageFns<MarketDataRequest>;
            readonly requestStream: true;
            readonly responseType: MessageFns<MarketDataResponse>;
            readonly responseStream: true;
            readonly options: {};
        };
        /** Server-side стрим предоставления биржевой информации. */
        readonly marketDataServerSideStream: {
            readonly name: "MarketDataServerSideStream";
            readonly requestType: MessageFns<MarketDataServerSideStreamRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<MarketDataResponse>;
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
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
