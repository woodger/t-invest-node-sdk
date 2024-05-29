import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { ErrorDetail, MoneyValue, Ping, PriceType, Quotation, ResponseMetadata, ResultSubscriptionStatus } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Направление операции. */
export declare enum OrderDirection {
    /** ORDER_DIRECTION_UNSPECIFIED - Значение не указано */
    ORDER_DIRECTION_UNSPECIFIED = 0,
    /** ORDER_DIRECTION_BUY - Покупка */
    ORDER_DIRECTION_BUY = 1,
    /** ORDER_DIRECTION_SELL - Продажа */
    ORDER_DIRECTION_SELL = 2,
    UNRECOGNIZED = -1
}
export declare function orderDirectionFromJSON(object: any): OrderDirection;
export declare function orderDirectionToJSON(object: OrderDirection): string;
/** Тип заявки. */
export declare enum OrderType {
    /** ORDER_TYPE_UNSPECIFIED - Значение не указано */
    ORDER_TYPE_UNSPECIFIED = 0,
    /** ORDER_TYPE_LIMIT - Лимитная */
    ORDER_TYPE_LIMIT = 1,
    /** ORDER_TYPE_MARKET - Рыночная */
    ORDER_TYPE_MARKET = 2,
    /** ORDER_TYPE_BESTPRICE - Лучшая цена */
    ORDER_TYPE_BESTPRICE = 3,
    UNRECOGNIZED = -1
}
export declare function orderTypeFromJSON(object: any): OrderType;
export declare function orderTypeToJSON(object: OrderType): string;
/** Текущий статус заявки (поручения) */
export declare enum OrderExecutionReportStatus {
    EXECUTION_REPORT_STATUS_UNSPECIFIED = 0,
    /** EXECUTION_REPORT_STATUS_FILL - Исполнена */
    EXECUTION_REPORT_STATUS_FILL = 1,
    /** EXECUTION_REPORT_STATUS_REJECTED - Отклонена */
    EXECUTION_REPORT_STATUS_REJECTED = 2,
    /** EXECUTION_REPORT_STATUS_CANCELLED - Отменена пользователем */
    EXECUTION_REPORT_STATUS_CANCELLED = 3,
    /** EXECUTION_REPORT_STATUS_NEW - Новая */
    EXECUTION_REPORT_STATUS_NEW = 4,
    /** EXECUTION_REPORT_STATUS_PARTIALLYFILL - Частично исполнена */
    EXECUTION_REPORT_STATUS_PARTIALLYFILL = 5,
    UNRECOGNIZED = -1
}
export declare function orderExecutionReportStatusFromJSON(object: any): OrderExecutionReportStatus;
export declare function orderExecutionReportStatusToJSON(object: OrderExecutionReportStatus): string;
/** Алгоритм исполнения заявки */
export declare enum TimeInForceType {
    /** TIME_IN_FORCE_UNSPECIFIED - Значение не определено см. TIME_IN_FORCE_DAY */
    TIME_IN_FORCE_UNSPECIFIED = 0,
    /** TIME_IN_FORCE_DAY - Заявка действует до конца торгового дня. Значение по умолчанию */
    TIME_IN_FORCE_DAY = 1,
    /** TIME_IN_FORCE_FILL_AND_KILL - Если в момент выставления возможно исполнение заявки(в т.ч. частичное), заявка будет исполнена или отменена сразу после выставления */
    TIME_IN_FORCE_FILL_AND_KILL = 2,
    /** TIME_IN_FORCE_FILL_OR_KILL - Если в момент выставления возможно полное исполнение заявки, заявка будет исполнена или отменена сразу после выставления, недоступно для срочного рынка и торговли по выходным */
    TIME_IN_FORCE_FILL_OR_KILL = 3,
    UNRECOGNIZED = -1
}
export declare function timeInForceTypeFromJSON(object: any): TimeInForceType;
export declare function timeInForceTypeToJSON(object: TimeInForceType): string;
/** Запрос установки соединения. */
export interface TradesStreamRequest {
    /** Идентификаторы счетов. */
    accounts: string[];
}
/** Информация о торговых поручениях. */
export interface TradesStreamResponse {
    /** Информация об исполнении торгового поручения. */
    orderTrades?: OrderTrades | undefined;
    /** Проверка активности стрима. */
    ping?: Ping | undefined;
}
/** Информация об исполнении торгового поручения. */
export interface OrderTrades {
    /** Идентификатор торгового поручения. */
    orderId: string;
    /** Дата и время создания сообщения в часовом поясе UTC. */
    createdAt: Date | undefined;
    /** Направление сделки. */
    direction: OrderDirection;
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Массив сделок. */
    trades: OrderTrade[];
    /** Идентификатор счёта. */
    accountId: string;
    /** UID идентификатор инструмента. */
    instrumentUid: string;
}
/** Информация о сделке. */
export interface OrderTrade {
    /** Дата и время совершения сделки в часовом поясе UTC. */
    dateTime: Date | undefined;
    /** Цена за 1 инструмент, по которой совершена сделка. */
    price: Quotation | undefined;
    /** Количество штук в сделке. */
    quantity: number;
    /** Идентификатор сделки. */
    tradeId: string;
}
/** Запрос выставления торгового поручения. */
export interface PostOrderRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Количество лотов. */
    quantity: number;
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. Игнорируется для рыночных поручений. */
    price?: Quotation | undefined;
    /** Направление операции. */
    direction: OrderDirection;
    /** Номер счёта. */
    accountId: string;
    /** Тип заявки. */
    orderType: OrderType;
    /** Идентификатор запроса выставления поручения для целей идемпотентности в формате UID. Максимальная длина 36 символов. */
    orderId: string;
    /** Идентификатор инструмента, принимает значения Figi или Instrument_uid. */
    instrumentId: string;
    /** Алгоритм исполнения поручения, применяется только к лимитной заявке. */
    timeInForce: TimeInForceType;
    /** Тип цены. */
    priceType: PriceType;
}
/** Информация о выставлении поручения. */
export interface PostOrderResponse {
    /** Биржевой идентификатор заявки. */
    orderId: string;
    /** Текущий статус заявки. */
    executionReportStatus: OrderExecutionReportStatus;
    /** Запрошено лотов. */
    lotsRequested: number;
    /** Исполнено лотов. */
    lotsExecuted: number;
    /** Начальная цена заявки. Произведение количества запрошенных лотов на цену. */
    initialOrderPrice: MoneyValue | undefined;
    /** Исполненная средняя цена одного инструмента в заявке. */
    executedOrderPrice: MoneyValue | undefined;
    /** Итоговая стоимость заявки, включающая все комиссии. */
    totalOrderAmount: MoneyValue | undefined;
    /** Начальная комиссия. Комиссия рассчитанная при выставлении заявки. */
    initialCommission: MoneyValue | undefined;
    /** Фактическая комиссия по итогам исполнения заявки. */
    executedCommission: MoneyValue | undefined;
    /** Значение НКД (накопленного купонного дохода) на дату. Подробнее: [НКД при выставлении торговых поручений](https://russianinvestments.github.io/investAPI/head-orders#coupon) */
    aciValue: MoneyValue | undefined;
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Направление сделки. */
    direction: OrderDirection;
    /** Начальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    initialSecurityPrice: MoneyValue | undefined;
    /** Тип заявки. */
    orderType: OrderType;
    /** Дополнительные данные об исполнении заявки. */
    message: string;
    /** Начальная цена заявки в пунктах (для фьючерсов). */
    initialOrderPricePt: Quotation | undefined;
    /** UID идентификатор инструмента. */
    instrumentUid: string;
    /** Идентификатор ключа идемпотентности, переданный клиентом, в формате UID. Максимальная длина 36 символов. */
    orderRequestId: string;
    /** Метадата */
    responseMetadata: ResponseMetadata | undefined;
}
/** Запрос отмены торгового поручения. */
export interface CancelOrderRequest {
    /** Номер счёта. */
    accountId: string;
    /** Идентификатор заявки. */
    orderId: string;
}
/** Результат отмены торгового поручения. */
export interface CancelOrderResponse {
    /** Дата и время отмены заявки в часовом поясе UTC. */
    time: Date | undefined;
    /** Метадата */
    responseMetadata: ResponseMetadata | undefined;
}
/** Запрос получения статуса торгового поручения. */
export interface GetOrderStateRequest {
    /** Номер счёта. */
    accountId: string;
    /** Идентификатор заявки. */
    orderId: string;
    /** Тип цены. */
    priceType: PriceType;
}
/** Запрос получения списка активных торговых поручений. */
export interface GetOrdersRequest {
    /** Номер счёта. */
    accountId: string;
}
/** Список активных торговых поручений. */
export interface GetOrdersResponse {
    /** Массив активных заявок. */
    orders: OrderState[];
}
/** Информация о торговом поручении. */
export interface OrderState {
    /** Биржевой идентификатор заявки. */
    orderId: string;
    /** Текущий статус заявки. */
    executionReportStatus: OrderExecutionReportStatus;
    /** Запрошено лотов. */
    lotsRequested: number;
    /** Исполнено лотов. */
    lotsExecuted: number;
    /** Начальная цена заявки. Произведение количества запрошенных лотов на цену. */
    initialOrderPrice: MoneyValue | undefined;
    /** Исполненная цена заявки. Произведение средней цены покупки на количество лотов. */
    executedOrderPrice: MoneyValue | undefined;
    /** Итоговая стоимость заявки, включающая все комиссии. */
    totalOrderAmount: MoneyValue | undefined;
    /** Средняя цена позиции по сделке. */
    averagePositionPrice: MoneyValue | undefined;
    /** Начальная комиссия. Комиссия, рассчитанная на момент подачи заявки. */
    initialCommission: MoneyValue | undefined;
    /** Фактическая комиссия по итогам исполнения заявки. */
    executedCommission: MoneyValue | undefined;
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Направление заявки. */
    direction: OrderDirection;
    /** Начальная цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    initialSecurityPrice: MoneyValue | undefined;
    /** Стадии выполнения заявки. */
    stages: OrderStage[];
    /** Сервисная комиссия. */
    serviceCommission: MoneyValue | undefined;
    /** Валюта заявки. */
    currency: string;
    /** Тип заявки. */
    orderType: OrderType;
    /** Дата и время выставления заявки в часовом поясе UTC. */
    orderDate: Date | undefined;
    /** UID идентификатор инструмента. */
    instrumentUid: string;
    /** Идентификатор ключа идемпотентности, переданный клиентом, в формате UID. Максимальная длина 36 символов. */
    orderRequestId: string;
}
/** Сделки в рамках торгового поручения. */
export interface OrderStage {
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price: MoneyValue | undefined;
    /** Количество лотов. */
    quantity: number;
    /** Идентификатор сделки. */
    tradeId: string;
    /** Время исполнения сделки */
    executionTime: Date | undefined;
}
/** Запрос изменения выставленной заявки. */
export interface ReplaceOrderRequest {
    /** Номер счета. */
    accountId: string;
    /** Идентификатор заявки на бирже. */
    orderId: string;
    /** Новый идентификатор запроса выставления поручения для целей идемпотентности. Максимальная длина 36 символов. Перезатирает старый ключ. */
    idempotencyKey: string;
    /** Количество лотов. */
    quantity: number;
    /** Цена за 1 инструмент. */
    price?: Quotation | undefined;
    /** Тип цены. */
    priceType?: PriceType | undefined;
}
/** Запрос на расчет количества доступных для покупки/продажи лотов. Если не указывать цену инструмента, то расчет произведется по текущум ценам в стакане: по лучшему предложению для покупки и по лучшему спросу для продажи. */
export interface GetMaxLotsRequest {
    /** Номер счета */
    accountId: string;
    /** Идентификатор инструмента, принимает значения Figi или instrument_uid */
    instrumentId: string;
    /** Цена инструмента */
    price?: Quotation | undefined;
}
/** Результат количество доступных для покупки/продажи лотов */
export interface GetMaxLotsResponse {
    /** Валюта инструмента */
    currency: string;
    /** Лимиты для покупок на собственные деньги */
    buyLimits: GetMaxLotsResponse_BuyLimitsView | undefined;
    /** Лимиты для покупок с учетом маржинального кредитования */
    buyMarginLimits: GetMaxLotsResponse_BuyLimitsView | undefined;
    /** Лимиты для продаж по собственной позиции */
    sellLimits: GetMaxLotsResponse_SellLimitsView | undefined;
    /** Лимиты для продаж с учетом маржинального кредитования */
    sellMarginLimits: GetMaxLotsResponse_SellLimitsView | undefined;
}
export interface GetMaxLotsResponse_BuyLimitsView {
    /** Количество доступной валюты для покупки */
    buyMoneyAmount: Quotation | undefined;
    /** Максимальное доступное количество лотов для покупки */
    buyMaxLots: number;
    /** Максимальное доступное количество лотов для покупки для заявки по рыночной цене на текущий момент */
    buyMaxMarketLots: number;
}
export interface GetMaxLotsResponse_SellLimitsView {
    /** Максимальное доступное количество лотов для продажи */
    sellMaxLots: number;
}
/** Запрос получения предварительной стоимости заявки */
export interface GetOrderPriceRequest {
    /** Номер счета */
    accountId: string;
    /** Идентификатор инструмента, принимает значения Figi или instrument_uid */
    instrumentId: string;
    /** Цена инструмента */
    price: Quotation | undefined;
    /** Направление заявки */
    direction: OrderDirection;
    /** Количество лотов */
    quantity: number;
}
/** Предварительная стоимость заявки */
export interface GetOrderPriceResponse {
    /** Итоговая стоимость заявки */
    totalOrderAmount: MoneyValue | undefined;
    /** Стоимость заявки без комиссий, НКД, ГО (для фьючерсов — стоимость контрактов) */
    initialOrderAmount: MoneyValue | undefined;
    /** Запрошено лотов */
    lotsRequested: number;
    /** Общая комиссия */
    executedCommission: MoneyValue | undefined;
    /** Общая комиссия в рублях */
    executedCommissionRub: MoneyValue | undefined;
    /** Сервисная комиссия */
    serviceCommission: MoneyValue | undefined;
    /** Комиссия за проведение сделки */
    dealCommission: MoneyValue | undefined;
    /** Дополнительная информация по облигациям */
    extraBond?: GetOrderPriceResponse_ExtraBond | undefined;
    /** Дополнительная информация по фьючерсам */
    extraFuture?: GetOrderPriceResponse_ExtraFuture | undefined;
}
export interface GetOrderPriceResponse_ExtraBond {
    /** Значение НКД (накопленного купонного дохода) на дату */
    aciValue: MoneyValue | undefined;
    /** Курс конвертации для замещающих облигаций */
    nominalConversionRate: Quotation | undefined;
}
export interface GetOrderPriceResponse_ExtraFuture {
    /** Гарантийное обеспечение для фьючерса */
    initialMargin: MoneyValue | undefined;
}
/** Запрос установки стрим-соединения торговых поручений */
export interface OrderStateStreamRequest {
    /** Идентификаторы счетов. */
    accounts: string[];
    /** Задержка пинг сообщений milliseconds 1000-120000, default 120000 */
    pingDelayMillis?: number | undefined;
}
/** Информация по заявкам */
export interface OrderStateStreamResponse {
    /** Информация об исполнении торгового поручения. */
    orderState?: OrderStateStreamResponse_OrderState | undefined;
    /** Проверка активности стрима. */
    ping?: Ping | undefined;
    /** Ответ на запрос на подписку. */
    subscription?: OrderStateStreamResponse_SubscriptionResponse | undefined;
}
/** Маркер */
export declare enum OrderStateStreamResponse_MarkerType {
    /** MARKER_UNKNOWN - не определено */
    MARKER_UNKNOWN = 0,
    /** MARKER_BROKER - сделки брокера */
    MARKER_BROKER = 1,
    /** MARKER_CHAT - исполнение поручение, полученного от клиента через каналы связи */
    MARKER_CHAT = 2,
    /** MARKER_PAPER - исполнение поручение, полученного от клиента в бумажной форме */
    MARKER_PAPER = 3,
    /** MARKER_MARGIN - принудительное закрытие позиций */
    MARKER_MARGIN = 4,
    /** MARKER_TKBNM - сделки по управлению ликвидностью */
    MARKER_TKBNM = 5,
    /** MARKER_SHORT - сделки РЕПО по привлечению у клиентов бумаг */
    MARKER_SHORT = 6,
    /** MARKER_SPECMM - перенос временно непокрытых позиций */
    MARKER_SPECMM = 7,
    MARKER_PO = 8,
    UNRECOGNIZED = -1
}
export declare function orderStateStreamResponse_MarkerTypeFromJSON(object: any): OrderStateStreamResponse_MarkerType;
export declare function orderStateStreamResponse_MarkerTypeToJSON(object: OrderStateStreamResponse_MarkerType): string;
/** Дополнительная информация по статусу заявки */
export declare enum OrderStateStreamResponse_StatusCauseInfo {
    /** CAUSE_UNSPECIFIED - Не определено */
    CAUSE_UNSPECIFIED = 0,
    /** CAUSE_CANCELLED_BY_CLIENT - Отменено клиентом */
    CAUSE_CANCELLED_BY_CLIENT = 15,
    /** CAUSE_CANCELLED_BY_EXCHANGE - Отменено биржей */
    CAUSE_CANCELLED_BY_EXCHANGE = 1,
    /** CAUSE_CANCELLED_NOT_ENOUGH_POSITION - Заявка не выставлена из-за нехватки средств */
    CAUSE_CANCELLED_NOT_ENOUGH_POSITION = 2,
    /** CAUSE_CANCELLED_BY_CLIENT_BLOCK - Отменено из-за блокировки клиента */
    CAUSE_CANCELLED_BY_CLIENT_BLOCK = 3,
    /** CAUSE_REJECTED_BY_BROKER - Отклонено брокером */
    CAUSE_REJECTED_BY_BROKER = 4,
    /** CAUSE_REJECTED_BY_EXCHANGE - Отклонено биржей */
    CAUSE_REJECTED_BY_EXCHANGE = 5,
    /** CAUSE_CANCELLED_BY_BROKER - Отменено брокером */
    CAUSE_CANCELLED_BY_BROKER = 6,
    UNRECOGNIZED = -1
}
export declare function orderStateStreamResponse_StatusCauseInfoFromJSON(object: any): OrderStateStreamResponse_StatusCauseInfo;
export declare function orderStateStreamResponse_StatusCauseInfoToJSON(object: OrderStateStreamResponse_StatusCauseInfo): string;
export interface OrderStateStreamResponse_SubscriptionResponse {
    /** Уникальный идентификатор запроса, подробнее: [tracking_id](https://russianinvestments.github.io/investAPI/grpc#tracking-id). */
    trackingId: string;
    /** Статус подписки. */
    status: ResultSubscriptionStatus;
    /** Идентификатор открытого соединения */
    streamId: string;
    /** Идентификаторы счетов. */
    accounts: string[];
    error?: ErrorDetail | undefined;
}
/** Заявка */
export interface OrderStateStreamResponse_OrderState {
    /** Биржевой идентификатор заявки */
    orderId: string;
    /** Идентификатор ключа идемпотентности, переданный клиентом, в формате UID. Максимальная длина 36 символов. */
    orderRequestId?: string | undefined;
    /** Код клиента на бирже */
    clientCode: string;
    /** Дата создания заявки */
    createdAt: Date | undefined;
    /** Статус заявки */
    executionReportStatus: OrderExecutionReportStatus;
    /** Дополнительная информация по статусу */
    statusInfo?: OrderStateStreamResponse_StatusCauseInfo | undefined;
    /** Тикер инструмента */
    ticker: string;
    /** Класс-код (секция торгов) */
    classCode: string;
    /** Лотность инструмента заявки */
    lotSize: number;
    /** Направление заявки */
    direction: OrderDirection;
    /** Алгоритм исполнения поручения */
    timeInForce: TimeInForceType;
    /** Тип заявки */
    orderType: OrderType;
    /** Номер счета */
    accountId: string;
    /** Начальная цена заявки */
    initialOrderPrice: MoneyValue | undefined;
    /** Цена выставления заявки */
    orderPrice: MoneyValue | undefined;
    /** Предрассчитанная стоимость полной заявки */
    amount?: MoneyValue | undefined;
    /** Исполненная средняя цена одного инструмента в заявке */
    executedOrderPrice: MoneyValue | undefined;
    /** Валюта исполнения */
    currency: string;
    /** Запрошено лотов */
    lotsRequested: number;
    /** Исполнено лотов */
    lotsExecuted: number;
    /** Число неисполненных лотов по заявке */
    lotsLeft: number;
    /** Отмененные лоты */
    lotsCancelled: number;
    /** Спецсимвол */
    marker?: OrderStateStreamResponse_MarkerType | undefined;
    /** Список сделок */
    trades: OrderTrade[];
    /** Время исполнения заявки */
    completionTime: Date | undefined;
    /** Код биржи */
    exchange: string;
    /** UID идентификатор инструмента */
    instrumentUid: string;
}
export declare const TradesStreamRequest: {
    encode(message: TradesStreamRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradesStreamRequest;
    fromJSON(object: any): TradesStreamRequest;
    toJSON(message: TradesStreamRequest): unknown;
    create(base?: DeepPartial<TradesStreamRequest>): TradesStreamRequest;
    fromPartial(object: DeepPartial<TradesStreamRequest>): TradesStreamRequest;
};
export declare const TradesStreamResponse: {
    encode(message: TradesStreamResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TradesStreamResponse;
    fromJSON(object: any): TradesStreamResponse;
    toJSON(message: TradesStreamResponse): unknown;
    create(base?: DeepPartial<TradesStreamResponse>): TradesStreamResponse;
    fromPartial(object: DeepPartial<TradesStreamResponse>): TradesStreamResponse;
};
export declare const OrderTrades: {
    encode(message: OrderTrades, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderTrades;
    fromJSON(object: any): OrderTrades;
    toJSON(message: OrderTrades): unknown;
    create(base?: DeepPartial<OrderTrades>): OrderTrades;
    fromPartial(object: DeepPartial<OrderTrades>): OrderTrades;
};
export declare const OrderTrade: {
    encode(message: OrderTrade, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderTrade;
    fromJSON(object: any): OrderTrade;
    toJSON(message: OrderTrade): unknown;
    create(base?: DeepPartial<OrderTrade>): OrderTrade;
    fromPartial(object: DeepPartial<OrderTrade>): OrderTrade;
};
export declare const PostOrderRequest: {
    encode(message: PostOrderRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderRequest;
    fromJSON(object: any): PostOrderRequest;
    toJSON(message: PostOrderRequest): unknown;
    create(base?: DeepPartial<PostOrderRequest>): PostOrderRequest;
    fromPartial(object: DeepPartial<PostOrderRequest>): PostOrderRequest;
};
export declare const PostOrderResponse: {
    encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderResponse;
    fromJSON(object: any): PostOrderResponse;
    toJSON(message: PostOrderResponse): unknown;
    create(base?: DeepPartial<PostOrderResponse>): PostOrderResponse;
    fromPartial(object: DeepPartial<PostOrderResponse>): PostOrderResponse;
};
export declare const CancelOrderRequest: {
    encode(message: CancelOrderRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CancelOrderRequest;
    fromJSON(object: any): CancelOrderRequest;
    toJSON(message: CancelOrderRequest): unknown;
    create(base?: DeepPartial<CancelOrderRequest>): CancelOrderRequest;
    fromPartial(object: DeepPartial<CancelOrderRequest>): CancelOrderRequest;
};
export declare const CancelOrderResponse: {
    encode(message: CancelOrderResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CancelOrderResponse;
    fromJSON(object: any): CancelOrderResponse;
    toJSON(message: CancelOrderResponse): unknown;
    create(base?: DeepPartial<CancelOrderResponse>): CancelOrderResponse;
    fromPartial(object: DeepPartial<CancelOrderResponse>): CancelOrderResponse;
};
export declare const GetOrderStateRequest: {
    encode(message: GetOrderStateRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderStateRequest;
    fromJSON(object: any): GetOrderStateRequest;
    toJSON(message: GetOrderStateRequest): unknown;
    create(base?: DeepPartial<GetOrderStateRequest>): GetOrderStateRequest;
    fromPartial(object: DeepPartial<GetOrderStateRequest>): GetOrderStateRequest;
};
export declare const GetOrdersRequest: {
    encode(message: GetOrdersRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrdersRequest;
    fromJSON(object: any): GetOrdersRequest;
    toJSON(message: GetOrdersRequest): unknown;
    create(base?: DeepPartial<GetOrdersRequest>): GetOrdersRequest;
    fromPartial(object: DeepPartial<GetOrdersRequest>): GetOrdersRequest;
};
export declare const GetOrdersResponse: {
    encode(message: GetOrdersResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrdersResponse;
    fromJSON(object: any): GetOrdersResponse;
    toJSON(message: GetOrdersResponse): unknown;
    create(base?: DeepPartial<GetOrdersResponse>): GetOrdersResponse;
    fromPartial(object: DeepPartial<GetOrdersResponse>): GetOrdersResponse;
};
export declare const OrderState: {
    encode(message: OrderState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderState;
    fromJSON(object: any): OrderState;
    toJSON(message: OrderState): unknown;
    create(base?: DeepPartial<OrderState>): OrderState;
    fromPartial(object: DeepPartial<OrderState>): OrderState;
};
export declare const OrderStage: {
    encode(message: OrderStage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderStage;
    fromJSON(object: any): OrderStage;
    toJSON(message: OrderStage): unknown;
    create(base?: DeepPartial<OrderStage>): OrderStage;
    fromPartial(object: DeepPartial<OrderStage>): OrderStage;
};
export declare const ReplaceOrderRequest: {
    encode(message: ReplaceOrderRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ReplaceOrderRequest;
    fromJSON(object: any): ReplaceOrderRequest;
    toJSON(message: ReplaceOrderRequest): unknown;
    create(base?: DeepPartial<ReplaceOrderRequest>): ReplaceOrderRequest;
    fromPartial(object: DeepPartial<ReplaceOrderRequest>): ReplaceOrderRequest;
};
export declare const GetMaxLotsRequest: {
    encode(message: GetMaxLotsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsRequest;
    fromJSON(object: any): GetMaxLotsRequest;
    toJSON(message: GetMaxLotsRequest): unknown;
    create(base?: DeepPartial<GetMaxLotsRequest>): GetMaxLotsRequest;
    fromPartial(object: DeepPartial<GetMaxLotsRequest>): GetMaxLotsRequest;
};
export declare const GetMaxLotsResponse: {
    encode(message: GetMaxLotsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsResponse;
    fromJSON(object: any): GetMaxLotsResponse;
    toJSON(message: GetMaxLotsResponse): unknown;
    create(base?: DeepPartial<GetMaxLotsResponse>): GetMaxLotsResponse;
    fromPartial(object: DeepPartial<GetMaxLotsResponse>): GetMaxLotsResponse;
};
export declare const GetMaxLotsResponse_BuyLimitsView: {
    encode(message: GetMaxLotsResponse_BuyLimitsView, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsResponse_BuyLimitsView;
    fromJSON(object: any): GetMaxLotsResponse_BuyLimitsView;
    toJSON(message: GetMaxLotsResponse_BuyLimitsView): unknown;
    create(base?: DeepPartial<GetMaxLotsResponse_BuyLimitsView>): GetMaxLotsResponse_BuyLimitsView;
    fromPartial(object: DeepPartial<GetMaxLotsResponse_BuyLimitsView>): GetMaxLotsResponse_BuyLimitsView;
};
export declare const GetMaxLotsResponse_SellLimitsView: {
    encode(message: GetMaxLotsResponse_SellLimitsView, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsResponse_SellLimitsView;
    fromJSON(object: any): GetMaxLotsResponse_SellLimitsView;
    toJSON(message: GetMaxLotsResponse_SellLimitsView): unknown;
    create(base?: DeepPartial<GetMaxLotsResponse_SellLimitsView>): GetMaxLotsResponse_SellLimitsView;
    fromPartial(object: DeepPartial<GetMaxLotsResponse_SellLimitsView>): GetMaxLotsResponse_SellLimitsView;
};
export declare const GetOrderPriceRequest: {
    encode(message: GetOrderPriceRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderPriceRequest;
    fromJSON(object: any): GetOrderPriceRequest;
    toJSON(message: GetOrderPriceRequest): unknown;
    create(base?: DeepPartial<GetOrderPriceRequest>): GetOrderPriceRequest;
    fromPartial(object: DeepPartial<GetOrderPriceRequest>): GetOrderPriceRequest;
};
export declare const GetOrderPriceResponse: {
    encode(message: GetOrderPriceResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderPriceResponse;
    fromJSON(object: any): GetOrderPriceResponse;
    toJSON(message: GetOrderPriceResponse): unknown;
    create(base?: DeepPartial<GetOrderPriceResponse>): GetOrderPriceResponse;
    fromPartial(object: DeepPartial<GetOrderPriceResponse>): GetOrderPriceResponse;
};
export declare const GetOrderPriceResponse_ExtraBond: {
    encode(message: GetOrderPriceResponse_ExtraBond, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderPriceResponse_ExtraBond;
    fromJSON(object: any): GetOrderPriceResponse_ExtraBond;
    toJSON(message: GetOrderPriceResponse_ExtraBond): unknown;
    create(base?: DeepPartial<GetOrderPriceResponse_ExtraBond>): GetOrderPriceResponse_ExtraBond;
    fromPartial(object: DeepPartial<GetOrderPriceResponse_ExtraBond>): GetOrderPriceResponse_ExtraBond;
};
export declare const GetOrderPriceResponse_ExtraFuture: {
    encode(message: GetOrderPriceResponse_ExtraFuture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderPriceResponse_ExtraFuture;
    fromJSON(object: any): GetOrderPriceResponse_ExtraFuture;
    toJSON(message: GetOrderPriceResponse_ExtraFuture): unknown;
    create(base?: DeepPartial<GetOrderPriceResponse_ExtraFuture>): GetOrderPriceResponse_ExtraFuture;
    fromPartial(object: DeepPartial<GetOrderPriceResponse_ExtraFuture>): GetOrderPriceResponse_ExtraFuture;
};
export declare const OrderStateStreamRequest: {
    encode(message: OrderStateStreamRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderStateStreamRequest;
    fromJSON(object: any): OrderStateStreamRequest;
    toJSON(message: OrderStateStreamRequest): unknown;
    create(base?: DeepPartial<OrderStateStreamRequest>): OrderStateStreamRequest;
    fromPartial(object: DeepPartial<OrderStateStreamRequest>): OrderStateStreamRequest;
};
export declare const OrderStateStreamResponse: {
    encode(message: OrderStateStreamResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderStateStreamResponse;
    fromJSON(object: any): OrderStateStreamResponse;
    toJSON(message: OrderStateStreamResponse): unknown;
    create(base?: DeepPartial<OrderStateStreamResponse>): OrderStateStreamResponse;
    fromPartial(object: DeepPartial<OrderStateStreamResponse>): OrderStateStreamResponse;
};
export declare const OrderStateStreamResponse_SubscriptionResponse: {
    encode(message: OrderStateStreamResponse_SubscriptionResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderStateStreamResponse_SubscriptionResponse;
    fromJSON(object: any): OrderStateStreamResponse_SubscriptionResponse;
    toJSON(message: OrderStateStreamResponse_SubscriptionResponse): unknown;
    create(base?: DeepPartial<OrderStateStreamResponse_SubscriptionResponse>): OrderStateStreamResponse_SubscriptionResponse;
    fromPartial(object: DeepPartial<OrderStateStreamResponse_SubscriptionResponse>): OrderStateStreamResponse_SubscriptionResponse;
};
export declare const OrderStateStreamResponse_OrderState: {
    encode(message: OrderStateStreamResponse_OrderState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderStateStreamResponse_OrderState;
    fromJSON(object: any): OrderStateStreamResponse_OrderState;
    toJSON(message: OrderStateStreamResponse_OrderState): unknown;
    create(base?: DeepPartial<OrderStateStreamResponse_OrderState>): OrderStateStreamResponse_OrderState;
    fromPartial(object: DeepPartial<OrderStateStreamResponse_OrderState>): OrderStateStreamResponse_OrderState;
};
export type OrdersStreamServiceDefinition = typeof OrdersStreamServiceDefinition;
export declare const OrdersStreamServiceDefinition: {
    readonly name: "OrdersStreamService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.OrdersStreamService";
    readonly methods: {
        /** Stream сделок пользователя */
        readonly tradesStream: {
            readonly name: "TradesStream";
            readonly requestType: {
                encode(message: TradesStreamRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): TradesStreamRequest;
                fromJSON(object: any): TradesStreamRequest;
                toJSON(message: TradesStreamRequest): unknown;
                create(base?: DeepPartial<TradesStreamRequest>): TradesStreamRequest;
                fromPartial(object: DeepPartial<TradesStreamRequest>): TradesStreamRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: TradesStreamResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): TradesStreamResponse;
                fromJSON(object: any): TradesStreamResponse;
                toJSON(message: TradesStreamResponse): unknown;
                create(base?: DeepPartial<TradesStreamResponse>): TradesStreamResponse;
                fromPartial(object: DeepPartial<TradesStreamResponse>): TradesStreamResponse;
            };
            readonly responseStream: true;
            readonly options: {};
        };
        /** Stream поручений пользователя. Перед работой прочитайте [статью](https://russianinvestments.github.io/investAPI/orders_state_stream/). */
        readonly orderStateStream: {
            readonly name: "OrderStateStream";
            readonly requestType: {
                encode(message: OrderStateStreamRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OrderStateStreamRequest;
                fromJSON(object: any): OrderStateStreamRequest;
                toJSON(message: OrderStateStreamRequest): unknown;
                create(base?: DeepPartial<OrderStateStreamRequest>): OrderStateStreamRequest;
                fromPartial(object: DeepPartial<OrderStateStreamRequest>): OrderStateStreamRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OrderStateStreamResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OrderStateStreamResponse;
                fromJSON(object: any): OrderStateStreamResponse;
                toJSON(message: OrderStateStreamResponse): unknown;
                create(base?: DeepPartial<OrderStateStreamResponse>): OrderStateStreamResponse;
                fromPartial(object: DeepPartial<OrderStateStreamResponse>): OrderStateStreamResponse;
            };
            readonly responseStream: true;
            readonly options: {};
        };
    };
};
export interface OrdersStreamServiceImplementation<CallContextExt = {}> {
    /** Stream сделок пользователя */
    tradesStream(request: TradesStreamRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<TradesStreamResponse>>;
    /** Stream поручений пользователя. Перед работой прочитайте [статью](https://russianinvestments.github.io/investAPI/orders_state_stream/). */
    orderStateStream(request: OrderStateStreamRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<OrderStateStreamResponse>>;
}
export interface OrdersStreamServiceClient<CallOptionsExt = {}> {
    /** Stream сделок пользователя */
    tradesStream(request: DeepPartial<TradesStreamRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<TradesStreamResponse>;
    /** Stream поручений пользователя. Перед работой прочитайте [статью](https://russianinvestments.github.io/investAPI/orders_state_stream/). */
    orderStateStream(request: DeepPartial<OrderStateStreamRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<OrderStateStreamResponse>;
}
/**
 * Сервис предназначен для работы с торговыми поручениями:</br> **1**.
 * выставление;</br> **2**. отмена;</br> **3**. получение статуса;</br> **4**.
 * расчёт полной стоимости;</br> **5**. получение списка заявок.
 */
export type OrdersServiceDefinition = typeof OrdersServiceDefinition;
export declare const OrdersServiceDefinition: {
    readonly name: "OrdersService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.OrdersService";
    readonly methods: {
        /** Метод выставления заявки. */
        readonly postOrder: {
            readonly name: "PostOrder";
            readonly requestType: {
                encode(message: PostOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderRequest;
                fromJSON(object: any): PostOrderRequest;
                toJSON(message: PostOrderRequest): unknown;
                create(base?: DeepPartial<PostOrderRequest>): PostOrderRequest;
                fromPartial(object: DeepPartial<PostOrderRequest>): PostOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderResponse;
                fromJSON(object: any): PostOrderResponse;
                toJSON(message: PostOrderResponse): unknown;
                create(base?: DeepPartial<PostOrderResponse>): PostOrderResponse;
                fromPartial(object: DeepPartial<PostOrderResponse>): PostOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод отмены биржевой заявки. */
        readonly cancelOrder: {
            readonly name: "CancelOrder";
            readonly requestType: {
                encode(message: CancelOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CancelOrderRequest;
                fromJSON(object: any): CancelOrderRequest;
                toJSON(message: CancelOrderRequest): unknown;
                create(base?: DeepPartial<CancelOrderRequest>): CancelOrderRequest;
                fromPartial(object: DeepPartial<CancelOrderRequest>): CancelOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: CancelOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CancelOrderResponse;
                fromJSON(object: any): CancelOrderResponse;
                toJSON(message: CancelOrderResponse): unknown;
                create(base?: DeepPartial<CancelOrderResponse>): CancelOrderResponse;
                fromPartial(object: DeepPartial<CancelOrderResponse>): CancelOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения статуса торгового поручения. */
        readonly getOrderState: {
            readonly name: "GetOrderState";
            readonly requestType: {
                encode(message: GetOrderStateRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderStateRequest;
                fromJSON(object: any): GetOrderStateRequest;
                toJSON(message: GetOrderStateRequest): unknown;
                create(base?: DeepPartial<GetOrderStateRequest>): GetOrderStateRequest;
                fromPartial(object: DeepPartial<GetOrderStateRequest>): GetOrderStateRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OrderState, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OrderState;
                fromJSON(object: any): OrderState;
                toJSON(message: OrderState): unknown;
                create(base?: DeepPartial<OrderState>): OrderState;
                fromPartial(object: DeepPartial<OrderState>): OrderState;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка активных заявок по счёту. */
        readonly getOrders: {
            readonly name: "GetOrders";
            readonly requestType: {
                encode(message: GetOrdersRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrdersRequest;
                fromJSON(object: any): GetOrdersRequest;
                toJSON(message: GetOrdersRequest): unknown;
                create(base?: DeepPartial<GetOrdersRequest>): GetOrdersRequest;
                fromPartial(object: DeepPartial<GetOrdersRequest>): GetOrdersRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOrdersResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrdersResponse;
                fromJSON(object: any): GetOrdersResponse;
                toJSON(message: GetOrdersResponse): unknown;
                create(base?: DeepPartial<GetOrdersResponse>): GetOrdersResponse;
                fromPartial(object: DeepPartial<GetOrdersResponse>): GetOrdersResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод изменения выставленной заявки. */
        readonly replaceOrder: {
            readonly name: "ReplaceOrder";
            readonly requestType: {
                encode(message: ReplaceOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): ReplaceOrderRequest;
                fromJSON(object: any): ReplaceOrderRequest;
                toJSON(message: ReplaceOrderRequest): unknown;
                create(base?: DeepPartial<ReplaceOrderRequest>): ReplaceOrderRequest;
                fromPartial(object: DeepPartial<ReplaceOrderRequest>): ReplaceOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderResponse;
                fromJSON(object: any): PostOrderResponse;
                toJSON(message: PostOrderResponse): unknown;
                create(base?: DeepPartial<PostOrderResponse>): PostOrderResponse;
                fromPartial(object: DeepPartial<PostOrderResponse>): PostOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** расчет количества доступных для покупки/продажи лотов */
        readonly getMaxLots: {
            readonly name: "GetMaxLots";
            readonly requestType: {
                encode(message: GetMaxLotsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsRequest;
                fromJSON(object: any): GetMaxLotsRequest;
                toJSON(message: GetMaxLotsRequest): unknown;
                create(base?: DeepPartial<GetMaxLotsRequest>): GetMaxLotsRequest;
                fromPartial(object: DeepPartial<GetMaxLotsRequest>): GetMaxLotsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetMaxLotsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsResponse;
                fromJSON(object: any): GetMaxLotsResponse;
                toJSON(message: GetMaxLotsResponse): unknown;
                create(base?: DeepPartial<GetMaxLotsResponse>): GetMaxLotsResponse;
                fromPartial(object: DeepPartial<GetMaxLotsResponse>): GetMaxLotsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения предварительной стоимости для лимитной заявки */
        readonly getOrderPrice: {
            readonly name: "GetOrderPrice";
            readonly requestType: {
                encode(message: GetOrderPriceRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderPriceRequest;
                fromJSON(object: any): GetOrderPriceRequest;
                toJSON(message: GetOrderPriceRequest): unknown;
                create(base?: DeepPartial<GetOrderPriceRequest>): GetOrderPriceRequest;
                fromPartial(object: DeepPartial<GetOrderPriceRequest>): GetOrderPriceRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOrderPriceResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderPriceResponse;
                fromJSON(object: any): GetOrderPriceResponse;
                toJSON(message: GetOrderPriceResponse): unknown;
                create(base?: DeepPartial<GetOrderPriceResponse>): GetOrderPriceResponse;
                fromPartial(object: DeepPartial<GetOrderPriceResponse>): GetOrderPriceResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface OrdersServiceImplementation<CallContextExt = {}> {
    /** Метод выставления заявки. */
    postOrder(request: PostOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostOrderResponse>>;
    /** Метод отмены биржевой заявки. */
    cancelOrder(request: CancelOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CancelOrderResponse>>;
    /** Метод получения статуса торгового поручения. */
    getOrderState(request: GetOrderStateRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OrderState>>;
    /** Метод получения списка активных заявок по счёту. */
    getOrders(request: GetOrdersRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOrdersResponse>>;
    /** Метод изменения выставленной заявки. */
    replaceOrder(request: ReplaceOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostOrderResponse>>;
    /** расчет количества доступных для покупки/продажи лотов */
    getMaxLots(request: GetMaxLotsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetMaxLotsResponse>>;
    /** Метод получения предварительной стоимости для лимитной заявки */
    getOrderPrice(request: GetOrderPriceRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOrderPriceResponse>>;
}
export interface OrdersServiceClient<CallOptionsExt = {}> {
    /** Метод выставления заявки. */
    postOrder(request: DeepPartial<PostOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostOrderResponse>;
    /** Метод отмены биржевой заявки. */
    cancelOrder(request: DeepPartial<CancelOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<CancelOrderResponse>;
    /** Метод получения статуса торгового поручения. */
    getOrderState(request: DeepPartial<GetOrderStateRequest>, options?: CallOptions & CallOptionsExt): Promise<OrderState>;
    /** Метод получения списка активных заявок по счёту. */
    getOrders(request: DeepPartial<GetOrdersRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOrdersResponse>;
    /** Метод изменения выставленной заявки. */
    replaceOrder(request: DeepPartial<ReplaceOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostOrderResponse>;
    /** расчет количества доступных для покупки/продажи лотов */
    getMaxLots(request: DeepPartial<GetMaxLotsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetMaxLotsResponse>;
    /** Метод получения предварительной стоимости для лимитной заявки */
    getOrderPrice(request: DeepPartial<GetOrderPriceRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOrderPriceResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export type ServerStreamingMethodResult<Response> = {
    [Symbol.asyncIterator](): AsyncIterator<Response, void>;
};
export {};
