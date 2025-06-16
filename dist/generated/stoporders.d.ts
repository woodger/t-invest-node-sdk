import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import type { CallContext, CallOptions } from "nice-grpc-common";
import { MoneyValue, Quotation } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Направление сделки стоп-заявки. */
export declare enum StopOrderDirection {
    /** STOP_ORDER_DIRECTION_UNSPECIFIED - Значение не указано. */
    STOP_ORDER_DIRECTION_UNSPECIFIED = 0,
    /** STOP_ORDER_DIRECTION_BUY - Покупка. */
    STOP_ORDER_DIRECTION_BUY = 1,
    /** STOP_ORDER_DIRECTION_SELL - Продажа. */
    STOP_ORDER_DIRECTION_SELL = 2,
    UNRECOGNIZED = -1
}
export declare function stopOrderDirectionFromJSON(object: any): StopOrderDirection;
export declare function stopOrderDirectionToJSON(object: StopOrderDirection): string;
/** Тип экспирации стоп-заявке. */
export declare enum StopOrderExpirationType {
    /** STOP_ORDER_EXPIRATION_TYPE_UNSPECIFIED - Значение не указано. */
    STOP_ORDER_EXPIRATION_TYPE_UNSPECIFIED = 0,
    /** STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL - Действительно до отмены. */
    STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL = 1,
    /** STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE - Действительно до даты снятия. */
    STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE = 2,
    UNRECOGNIZED = -1
}
export declare function stopOrderExpirationTypeFromJSON(object: any): StopOrderExpirationType;
export declare function stopOrderExpirationTypeToJSON(object: StopOrderExpirationType): string;
/** Тип стоп-заявки. */
export declare enum StopOrderType {
    /** STOP_ORDER_TYPE_UNSPECIFIED - Значение не указано. */
    STOP_ORDER_TYPE_UNSPECIFIED = 0,
    /** STOP_ORDER_TYPE_TAKE_PROFIT - Take-profit заявка. */
    STOP_ORDER_TYPE_TAKE_PROFIT = 1,
    /** STOP_ORDER_TYPE_STOP_LOSS - Stop-loss заявка. */
    STOP_ORDER_TYPE_STOP_LOSS = 2,
    /** STOP_ORDER_TYPE_STOP_LIMIT - Stop-limit заявка. */
    STOP_ORDER_TYPE_STOP_LIMIT = 3,
    UNRECOGNIZED = -1
}
export declare function stopOrderTypeFromJSON(object: any): StopOrderType;
export declare function stopOrderTypeToJSON(object: StopOrderType): string;
/** Запрос выставления стоп-заявки. */
export interface PostStopOrderRequest {
    /**
     * Deprecated Figi-идентификатор инструмента. Необходимо использовать instrument_id.
     *
     * @deprecated
     */
    figi: string;
    /** Количество лотов. */
    quantity: number;
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price: Quotation | undefined;
    /** Стоп-цена заявки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    stopPrice: Quotation | undefined;
    /** Направление операции. */
    direction: StopOrderDirection;
    /** Номер счёта. */
    accountId: string;
    /** Тип экспирации заявки. */
    expirationType: StopOrderExpirationType;
    /** Тип заявки. */
    stopOrderType: StopOrderType;
    /** Дата и время окончания действия стоп-заявки в часовом поясе UTC. **Для ExpirationType = GoodTillDate заполнение обязательно**. */
    expireDate: Date | undefined;
    /** Идентификатор инструмента, принимает значения Figi или instrument_uid. */
    instrumentId: string;
}
/** Результат выставления стоп-заявки. */
export interface PostStopOrderResponse {
    /** Уникальный идентификатор стоп-заявки. */
    stopOrderId: string;
}
/** Запрос получения списка активных стоп-заявок. */
export interface GetStopOrdersRequest {
    /** Идентификатор счёта клиента. */
    accountId: string;
}
/** Список активных стоп-заявок. */
export interface GetStopOrdersResponse {
    /** Массив стоп-заявок по счёту. */
    stopOrders: StopOrder[];
}
/** Запрос отмены выставленной стоп-заявки. */
export interface CancelStopOrderRequest {
    /** Идентификатор счёта клиента. */
    accountId: string;
    /** Уникальный идентификатор стоп-заявки. */
    stopOrderId: string;
}
/** Результат отмены выставленной стоп-заявки. */
export interface CancelStopOrderResponse {
    /** Время отмены заявки в часовом поясе UTC. */
    time: Date | undefined;
}
/** Информация о стоп-заявке. */
export interface StopOrder {
    /** Идентификатор-идентификатор стоп-заявки. */
    stopOrderId: string;
    /** Запрошено лотов. */
    lotsRequested: number;
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Направление операции. */
    direction: StopOrderDirection;
    /** Валюта стоп-заявки. */
    currency: string;
    /** Тип стоп-заявки. */
    orderType: StopOrderType;
    /** Дата и время выставления заявки в часовом поясе UTC. */
    createDate: Date | undefined;
    /** Дата и время конвертации стоп-заявки в биржевую в часовом поясе UTC. */
    activationDateTime: Date | undefined;
    /** Дата и время снятия заявки в часовом поясе UTC. */
    expirationTime: Date | undefined;
    /** Цена заявки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price: MoneyValue | undefined;
    /** Цена активации стоп-заявки за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    stopPrice: MoneyValue | undefined;
    /** instrument_uid идентификатор инструмента. */
    instrumentUid: string;
}
export declare const PostStopOrderRequest: MessageFns<PostStopOrderRequest>;
export declare const PostStopOrderResponse: MessageFns<PostStopOrderResponse>;
export declare const GetStopOrdersRequest: MessageFns<GetStopOrdersRequest>;
export declare const GetStopOrdersResponse: MessageFns<GetStopOrdersResponse>;
export declare const CancelStopOrderRequest: MessageFns<CancelStopOrderRequest>;
export declare const CancelStopOrderResponse: MessageFns<CancelStopOrderResponse>;
export declare const StopOrder: MessageFns<StopOrder>;
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
            readonly requestType: MessageFns<PostStopOrderRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<PostStopOrderResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка активных стоп заявок по счёту. */
        readonly getStopOrders: {
            readonly name: "GetStopOrders";
            readonly requestType: MessageFns<GetStopOrdersRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetStopOrdersResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод отмены стоп-заявки. */
        readonly cancelStopOrder: {
            readonly name: "CancelStopOrder";
            readonly requestType: MessageFns<CancelStopOrderRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CancelStopOrderResponse>;
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
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
