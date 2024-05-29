import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { MoneyValue, PriceType, Quotation, ResponseMetadata } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Направление сделки стоп-заявки. */
export declare enum StopOrderDirection {
    /** STOP_ORDER_DIRECTION_UNSPECIFIED - Значение не указано */
    STOP_ORDER_DIRECTION_UNSPECIFIED = 0,
    /** STOP_ORDER_DIRECTION_BUY - Покупка */
    STOP_ORDER_DIRECTION_BUY = 1,
    /** STOP_ORDER_DIRECTION_SELL - Продажа */
    STOP_ORDER_DIRECTION_SELL = 2,
    UNRECOGNIZED = -1
}
export declare function stopOrderDirectionFromJSON(object: any): StopOrderDirection;
export declare function stopOrderDirectionToJSON(object: StopOrderDirection): string;
/** Тип экспирации стоп-заявке. */
export declare enum StopOrderExpirationType {
    /** STOP_ORDER_EXPIRATION_TYPE_UNSPECIFIED - Значение не указано */
    STOP_ORDER_EXPIRATION_TYPE_UNSPECIFIED = 0,
    /** STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL - Действительно до отмены */
    STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL = 1,
    /** STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE - Действительно до даты снятия */
    STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE = 2,
    UNRECOGNIZED = -1
}
export declare function stopOrderExpirationTypeFromJSON(object: any): StopOrderExpirationType;
export declare function stopOrderExpirationTypeToJSON(object: StopOrderExpirationType): string;
/** Тип стоп-заявки. */
export declare enum StopOrderType {
    /** STOP_ORDER_TYPE_UNSPECIFIED - Значение не указано */
    STOP_ORDER_TYPE_UNSPECIFIED = 0,
    /** STOP_ORDER_TYPE_TAKE_PROFIT - Take-profit заявка */
    STOP_ORDER_TYPE_TAKE_PROFIT = 1,
    /** STOP_ORDER_TYPE_STOP_LOSS - Stop-loss заявка */
    STOP_ORDER_TYPE_STOP_LOSS = 2,
    /** STOP_ORDER_TYPE_STOP_LIMIT - Stop-limit заявка */
    STOP_ORDER_TYPE_STOP_LIMIT = 3,
    UNRECOGNIZED = -1
}
export declare function stopOrderTypeFromJSON(object: any): StopOrderType;
export declare function stopOrderTypeToJSON(object: StopOrderType): string;
/** Статус стоп-заяки. */
export declare enum StopOrderStatusOption {
    /** STOP_ORDER_STATUS_UNSPECIFIED - Значение не указано */
    STOP_ORDER_STATUS_UNSPECIFIED = 0,
    /** STOP_ORDER_STATUS_ALL - Все заявки */
    STOP_ORDER_STATUS_ALL = 1,
    /** STOP_ORDER_STATUS_ACTIVE - Активные заявки */
    STOP_ORDER_STATUS_ACTIVE = 2,
    /** STOP_ORDER_STATUS_EXECUTED - Исполненные заявки */
    STOP_ORDER_STATUS_EXECUTED = 3,
    /** STOP_ORDER_STATUS_CANCELED - Отмененные заявки */
    STOP_ORDER_STATUS_CANCELED = 4,
    /** STOP_ORDER_STATUS_EXPIRED - Истекшие заявки */
    STOP_ORDER_STATUS_EXPIRED = 5,
    UNRECOGNIZED = -1
}
export declare function stopOrderStatusOptionFromJSON(object: any): StopOrderStatusOption;
export declare function stopOrderStatusOptionToJSON(object: StopOrderStatusOption): string;
/** Тип выставляемой заявки. */
export declare enum ExchangeOrderType {
    /** EXCHANGE_ORDER_TYPE_UNSPECIFIED - Значение не указано */
    EXCHANGE_ORDER_TYPE_UNSPECIFIED = 0,
    /** EXCHANGE_ORDER_TYPE_MARKET - Заявка по рыночной цене */
    EXCHANGE_ORDER_TYPE_MARKET = 1,
    /** EXCHANGE_ORDER_TYPE_LIMIT - Лимитная заявка */
    EXCHANGE_ORDER_TYPE_LIMIT = 2,
    UNRECOGNIZED = -1
}
export declare function exchangeOrderTypeFromJSON(object: any): ExchangeOrderType;
export declare function exchangeOrderTypeToJSON(object: ExchangeOrderType): string;
/** Тип TakeProfit заявки. */
export declare enum TakeProfitType {
    /** TAKE_PROFIT_TYPE_UNSPECIFIED - Значение не указано */
    TAKE_PROFIT_TYPE_UNSPECIFIED = 0,
    /** TAKE_PROFIT_TYPE_REGULAR - Обычная заявка (значение по умолчанию) */
    TAKE_PROFIT_TYPE_REGULAR = 1,
    /** TAKE_PROFIT_TYPE_TRAILING - Трейлинг-стоп */
    TAKE_PROFIT_TYPE_TRAILING = 2,
    UNRECOGNIZED = -1
}
export declare function takeProfitTypeFromJSON(object: any): TakeProfitType;
export declare function takeProfitTypeToJSON(object: TakeProfitType): string;
/** Тип параметров значений Трейлинг-стопа */
export declare enum TrailingValueType {
    /** TRAILING_VALUE_UNSPECIFIED - Значение не указано */
    TRAILING_VALUE_UNSPECIFIED = 0,
    /** TRAILING_VALUE_ABSOLUTE - Абсолютное значение в единицах цены */
    TRAILING_VALUE_ABSOLUTE = 1,
    /** TRAILING_VALUE_RELATIVE - Относительное значение в процентах */
    TRAILING_VALUE_RELATIVE = 2,
    UNRECOGNIZED = -1
}
export declare function trailingValueTypeFromJSON(object: any): TrailingValueType;
export declare function trailingValueTypeToJSON(object: TrailingValueType): string;
/** Статус Трейлинг-стопа */
export declare enum TrailingStopStatus {
    /** TRAILING_STOP_UNSPECIFIED - Значение не указано */
    TRAILING_STOP_UNSPECIFIED = 0,
    /** TRAILING_STOP_ACTIVE - Активный */
    TRAILING_STOP_ACTIVE = 1,
    /** TRAILING_STOP_ACTIVATED - Активированный */
    TRAILING_STOP_ACTIVATED = 2,
    UNRECOGNIZED = -1
}
export declare function trailingStopStatusFromJSON(object: any): TrailingStopStatus;
export declare function trailingStopStatusToJSON(object: TrailingStopStatus): string;
/** Запрос выставления стоп-заявки. */
export interface PostStopOrderRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi?: string | undefined;
    /** Количество лотов */
    quantity: number;
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price?: Quotation | undefined;
    /** Стоп-цена заявки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    stopPrice?: Quotation | undefined;
    /** Направление операции */
    direction: StopOrderDirection;
    /** Номер счёта */
    accountId: string;
    /** Тип экспирации заявки */
    expirationType: StopOrderExpirationType;
    /** Тип заявки */
    stopOrderType: StopOrderType;
    /** Дата и время окончания действия стоп-заявки в часовом поясе UTC. **Для ExpirationType = GoodTillDate заполнение обязательно, для GoodTillCancel игнорируется**. */
    expireDate?: Date | undefined;
    /** Идентификатор инструмента, принимает значения Figi или instrument_uid. */
    instrumentId: string;
    /** Тип дочерней биржевой заявки для тейкпрофита */
    exchangeOrderType: ExchangeOrderType;
    /** Подтип стоп-заявки TakeProfit */
    takeProfitType: TakeProfitType;
    /** Массив с параметрами трейлинг-стопа */
    trailingData: PostStopOrderRequest_TrailingData | undefined;
    /** Тип цены */
    priceType: PriceType;
    /** Идентификатор запроса выставления поручения для целей идемпотентности в формате UID. Максимальная длина 36 символов. */
    orderId: string;
}
export interface PostStopOrderRequest_TrailingData {
    /** Отступ */
    indent: Quotation | undefined;
    /** Тип величины отступа */
    indentType: TrailingValueType;
    /** Размер защитного спреда */
    spread: Quotation | undefined;
    /** Тип величины защитного спреда */
    spreadType: TrailingValueType;
}
/** Результат выставления стоп-заявки. */
export interface PostStopOrderResponse {
    /** Уникальный идентификатор стоп-заявки */
    stopOrderId: string;
    /** Идентификатор ключа идемпотентности, переданный клиентом, в формате UID. Максимальная длина 36 символов. */
    orderRequestId: string;
    /** Метадата */
    responseMetadata: ResponseMetadata | undefined;
}
/** Запрос получения списка активных стоп-заявок. */
export interface GetStopOrdersRequest {
    /** Идентификатор счёта клиента */
    accountId: string;
    /** Статус заявок */
    status: StopOrderStatusOption;
    /** Левая граница */
    from: Date | undefined;
    /** Правая граница */
    to: Date | undefined;
}
/** Список активных стоп-заявок. */
export interface GetStopOrdersResponse {
    /** Массив стоп-заявок по счёту */
    stopOrders: StopOrder[];
}
/** Запрос отмены выставленной стоп-заявки. */
export interface CancelStopOrderRequest {
    /** Идентификатор счёта клиента */
    accountId: string;
    /** Уникальный идентификатор стоп-заявки */
    stopOrderId: string;
}
/** Результат отмены выставленной стоп-заявки. */
export interface CancelStopOrderResponse {
    /** Время отмены заявки в часовом поясе UTC */
    time: Date | undefined;
}
/** Информация о стоп-заявке. */
export interface StopOrder {
    /** Идентификатор-идентификатор стоп-заявки */
    stopOrderId: string;
    /** Запрошено лотов */
    lotsRequested: number;
    /** Figi-идентификатор инструмента */
    figi: string;
    /** Направление операции */
    direction: StopOrderDirection;
    /** Валюта стоп-заявки */
    currency: string;
    /** Тип стоп-заявки */
    orderType: StopOrderType;
    /** Дата и время выставления заявки в часовом поясе UTC */
    createDate: Date | undefined;
    /** Дата и время конвертации стоп-заявки в биржевую в часовом поясе UTC */
    activationDateTime: Date | undefined;
    /** Дата и время снятия заявки в часовом поясе UTC */
    expirationTime: Date | undefined;
    /** Цена заявки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price: MoneyValue | undefined;
    /** Цена активации стоп-заявки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    stopPrice: MoneyValue | undefined;
    /** instrument_uid идентификатор инструмента */
    instrumentUid: string;
    /** Подтип стоп-заявки TakeProfit */
    takeProfitType: TakeProfitType;
    /** Параметры трейлинг-стопа */
    trailingData: StopOrder_TrailingData | undefined;
    /** Статус заявки */
    status: StopOrderStatusOption;
    /** Тип дочерней биржевой заявки для тейкпрофита */
    exchangeOrderType: ExchangeOrderType;
}
export interface StopOrder_TrailingData {
    /** Отступ */
    indent: Quotation | undefined;
    /** Тип величины отступа */
    indentType: TrailingValueType;
    /** Размер защитного спреда */
    spread: Quotation | undefined;
    /** Тип величины защитного спреда */
    spreadType: TrailingValueType;
    /** Статус трейлинг-стопа */
    status: TrailingStopStatus;
    /** Цена исполнения */
    price: Quotation | undefined;
    /** Локальный экстремум */
    extr: Quotation | undefined;
}
export declare const PostStopOrderRequest: {
    encode(message: PostStopOrderRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PostStopOrderRequest;
    fromJSON(object: any): PostStopOrderRequest;
    toJSON(message: PostStopOrderRequest): unknown;
    create(base?: DeepPartial<PostStopOrderRequest>): PostStopOrderRequest;
    fromPartial(object: DeepPartial<PostStopOrderRequest>): PostStopOrderRequest;
};
export declare const PostStopOrderRequest_TrailingData: {
    encode(message: PostStopOrderRequest_TrailingData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PostStopOrderRequest_TrailingData;
    fromJSON(object: any): PostStopOrderRequest_TrailingData;
    toJSON(message: PostStopOrderRequest_TrailingData): unknown;
    create(base?: DeepPartial<PostStopOrderRequest_TrailingData>): PostStopOrderRequest_TrailingData;
    fromPartial(object: DeepPartial<PostStopOrderRequest_TrailingData>): PostStopOrderRequest_TrailingData;
};
export declare const PostStopOrderResponse: {
    encode(message: PostStopOrderResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PostStopOrderResponse;
    fromJSON(object: any): PostStopOrderResponse;
    toJSON(message: PostStopOrderResponse): unknown;
    create(base?: DeepPartial<PostStopOrderResponse>): PostStopOrderResponse;
    fromPartial(object: DeepPartial<PostStopOrderResponse>): PostStopOrderResponse;
};
export declare const GetStopOrdersRequest: {
    encode(message: GetStopOrdersRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetStopOrdersRequest;
    fromJSON(object: any): GetStopOrdersRequest;
    toJSON(message: GetStopOrdersRequest): unknown;
    create(base?: DeepPartial<GetStopOrdersRequest>): GetStopOrdersRequest;
    fromPartial(object: DeepPartial<GetStopOrdersRequest>): GetStopOrdersRequest;
};
export declare const GetStopOrdersResponse: {
    encode(message: GetStopOrdersResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetStopOrdersResponse;
    fromJSON(object: any): GetStopOrdersResponse;
    toJSON(message: GetStopOrdersResponse): unknown;
    create(base?: DeepPartial<GetStopOrdersResponse>): GetStopOrdersResponse;
    fromPartial(object: DeepPartial<GetStopOrdersResponse>): GetStopOrdersResponse;
};
export declare const CancelStopOrderRequest: {
    encode(message: CancelStopOrderRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CancelStopOrderRequest;
    fromJSON(object: any): CancelStopOrderRequest;
    toJSON(message: CancelStopOrderRequest): unknown;
    create(base?: DeepPartial<CancelStopOrderRequest>): CancelStopOrderRequest;
    fromPartial(object: DeepPartial<CancelStopOrderRequest>): CancelStopOrderRequest;
};
export declare const CancelStopOrderResponse: {
    encode(message: CancelStopOrderResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CancelStopOrderResponse;
    fromJSON(object: any): CancelStopOrderResponse;
    toJSON(message: CancelStopOrderResponse): unknown;
    create(base?: DeepPartial<CancelStopOrderResponse>): CancelStopOrderResponse;
    fromPartial(object: DeepPartial<CancelStopOrderResponse>): CancelStopOrderResponse;
};
export declare const StopOrder: {
    encode(message: StopOrder, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StopOrder;
    fromJSON(object: any): StopOrder;
    toJSON(message: StopOrder): unknown;
    create(base?: DeepPartial<StopOrder>): StopOrder;
    fromPartial(object: DeepPartial<StopOrder>): StopOrder;
};
export declare const StopOrder_TrailingData: {
    encode(message: StopOrder_TrailingData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StopOrder_TrailingData;
    fromJSON(object: any): StopOrder_TrailingData;
    toJSON(message: StopOrder_TrailingData): unknown;
    create(base?: DeepPartial<StopOrder_TrailingData>): StopOrder_TrailingData;
    fromPartial(object: DeepPartial<StopOrder_TrailingData>): StopOrder_TrailingData;
};
/**
 * Сервис предназначен для работы со стоп-заявками:</br> **1**.
 * выставление;</br> **2**. отмена;</br> **3**. получение списка стоп-заявок.
 */
export type StopOrdersServiceDefinition = typeof StopOrdersServiceDefinition;
export declare const StopOrdersServiceDefinition: {
    readonly name: "StopOrdersService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.StopOrdersService";
    readonly methods: {
        /** Метод выставления стоп-заявки. */
        readonly postStopOrder: {
            readonly name: "PostStopOrder";
            readonly requestType: {
                encode(message: PostStopOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostStopOrderRequest;
                fromJSON(object: any): PostStopOrderRequest;
                toJSON(message: PostStopOrderRequest): unknown;
                create(base?: DeepPartial<PostStopOrderRequest>): PostStopOrderRequest;
                fromPartial(object: DeepPartial<PostStopOrderRequest>): PostStopOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostStopOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostStopOrderResponse;
                fromJSON(object: any): PostStopOrderResponse;
                toJSON(message: PostStopOrderResponse): unknown;
                create(base?: DeepPartial<PostStopOrderResponse>): PostStopOrderResponse;
                fromPartial(object: DeepPartial<PostStopOrderResponse>): PostStopOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка активных стоп заявок по счёту. */
        readonly getStopOrders: {
            readonly name: "GetStopOrders";
            readonly requestType: {
                encode(message: GetStopOrdersRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetStopOrdersRequest;
                fromJSON(object: any): GetStopOrdersRequest;
                toJSON(message: GetStopOrdersRequest): unknown;
                create(base?: DeepPartial<GetStopOrdersRequest>): GetStopOrdersRequest;
                fromPartial(object: DeepPartial<GetStopOrdersRequest>): GetStopOrdersRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetStopOrdersResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetStopOrdersResponse;
                fromJSON(object: any): GetStopOrdersResponse;
                toJSON(message: GetStopOrdersResponse): unknown;
                create(base?: DeepPartial<GetStopOrdersResponse>): GetStopOrdersResponse;
                fromPartial(object: DeepPartial<GetStopOrdersResponse>): GetStopOrdersResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод отмены стоп-заявки. */
        readonly cancelStopOrder: {
            readonly name: "CancelStopOrder";
            readonly requestType: {
                encode(message: CancelStopOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CancelStopOrderRequest;
                fromJSON(object: any): CancelStopOrderRequest;
                toJSON(message: CancelStopOrderRequest): unknown;
                create(base?: DeepPartial<CancelStopOrderRequest>): CancelStopOrderRequest;
                fromPartial(object: DeepPartial<CancelStopOrderRequest>): CancelStopOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: CancelStopOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CancelStopOrderResponse;
                fromJSON(object: any): CancelStopOrderResponse;
                toJSON(message: CancelStopOrderResponse): unknown;
                create(base?: DeepPartial<CancelStopOrderResponse>): CancelStopOrderResponse;
                fromPartial(object: DeepPartial<CancelStopOrderResponse>): CancelStopOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface StopOrdersServiceImplementation<CallContextExt = {}> {
    /** Метод выставления стоп-заявки. */
    postStopOrder(request: PostStopOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostStopOrderResponse>>;
    /** Метод получения списка активных стоп заявок по счёту. */
    getStopOrders(request: GetStopOrdersRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetStopOrdersResponse>>;
    /** Метод отмены стоп-заявки. */
    cancelStopOrder(request: CancelStopOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CancelStopOrderResponse>>;
}
export interface StopOrdersServiceClient<CallOptionsExt = {}> {
    /** Метод выставления стоп-заявки. */
    postStopOrder(request: DeepPartial<PostStopOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostStopOrderResponse>;
    /** Метод получения списка активных стоп заявок по счёту. */
    getStopOrders(request: DeepPartial<GetStopOrdersRequest>, options?: CallOptions & CallOptionsExt): Promise<GetStopOrdersResponse>;
    /** Метод отмены стоп-заявки. */
    cancelStopOrder(request: DeepPartial<CancelStopOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<CancelStopOrderResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
