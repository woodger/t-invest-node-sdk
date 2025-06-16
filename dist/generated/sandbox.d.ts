import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import type { CallContext, CallOptions } from "nice-grpc-common";
import { MoneyValue } from "./common";
import { GetOperationsByCursorRequest, GetOperationsByCursorResponse, OperationsRequest, OperationsResponse, PortfolioRequest, PortfolioResponse, PositionsRequest, PositionsResponse, WithdrawLimitsRequest, WithdrawLimitsResponse } from "./operations";
import { CancelOrderRequest, CancelOrderResponse, GetOrdersRequest, GetOrdersResponse, GetOrderStateRequest, OrderState, PostOrderRequest, PostOrderResponse, ReplaceOrderRequest } from "./orders";
import { GetAccountsRequest, GetAccountsResponse } from "./users";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Запрос открытия счёта в песочнице. */
export interface OpenSandboxAccountRequest {
}
/** Номер открытого счёта в песочнице. */
export interface OpenSandboxAccountResponse {
    /** Номер счёта */
    accountId: string;
}
/** Запрос закрытия счёта в песочнице. */
export interface CloseSandboxAccountRequest {
    /** Номер счёта */
    accountId: string;
}
/** Результат закрытия счёта в песочнице. */
export interface CloseSandboxAccountResponse {
}
/** Запрос пополнения счёта в песочнице. */
export interface SandboxPayInRequest {
    /** Номер счёта */
    accountId: string;
    /** Сумма пополнения счёта в рублях */
    amount: MoneyValue | undefined;
}
/** Результат пополнения счёта, текущий баланс. */
export interface SandboxPayInResponse {
    /** Текущий баланс счёта */
    balance: MoneyValue | undefined;
}
export declare const OpenSandboxAccountRequest: MessageFns<OpenSandboxAccountRequest>;
export declare const OpenSandboxAccountResponse: MessageFns<OpenSandboxAccountResponse>;
export declare const CloseSandboxAccountRequest: MessageFns<CloseSandboxAccountRequest>;
export declare const CloseSandboxAccountResponse: MessageFns<CloseSandboxAccountResponse>;
export declare const SandboxPayInRequest: MessageFns<SandboxPayInRequest>;
export declare const SandboxPayInResponse: MessageFns<SandboxPayInResponse>;
/** Сервис для работы с песочницей TINKOFF INVEST API */
export type SandboxServiceDefinition = typeof SandboxServiceDefinition;
export declare const SandboxServiceDefinition: {
    readonly name: "SandboxService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.SandboxService";
    readonly methods: {
        /** Метод регистрации счёта в песочнице. */
        readonly openSandboxAccount: {
            readonly name: "OpenSandboxAccount";
            readonly requestType: MessageFns<OpenSandboxAccountRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<OpenSandboxAccountResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения счетов в песочнице. */
        readonly getSandboxAccounts: {
            readonly name: "GetSandboxAccounts";
            readonly requestType: import("./users").MessageFns<GetAccountsRequest>;
            readonly requestStream: false;
            readonly responseType: import("./users").MessageFns<GetAccountsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод закрытия счёта в песочнице. */
        readonly closeSandboxAccount: {
            readonly name: "CloseSandboxAccount";
            readonly requestType: MessageFns<CloseSandboxAccountRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CloseSandboxAccountResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод выставления торгового поручения в песочнице. */
        readonly postSandboxOrder: {
            readonly name: "PostSandboxOrder";
            readonly requestType: import("./orders").MessageFns<PostOrderRequest>;
            readonly requestStream: false;
            readonly responseType: import("./orders").MessageFns<PostOrderResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод изменения выставленной заявки. */
        readonly replaceSandboxOrder: {
            readonly name: "ReplaceSandboxOrder";
            readonly requestType: import("./orders").MessageFns<ReplaceOrderRequest>;
            readonly requestStream: false;
            readonly responseType: import("./orders").MessageFns<PostOrderResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка активных заявок по счёту в песочнице. */
        readonly getSandboxOrders: {
            readonly name: "GetSandboxOrders";
            readonly requestType: import("./orders").MessageFns<GetOrdersRequest>;
            readonly requestStream: false;
            readonly responseType: import("./orders").MessageFns<GetOrdersResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод отмены торгового поручения в песочнице. */
        readonly cancelSandboxOrder: {
            readonly name: "CancelSandboxOrder";
            readonly requestType: import("./orders").MessageFns<CancelOrderRequest>;
            readonly requestStream: false;
            readonly responseType: import("./orders").MessageFns<CancelOrderResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения статуса заявки в песочнице. Заявки хранятся в таблице 7 дней. */
        readonly getSandboxOrderState: {
            readonly name: "GetSandboxOrderState";
            readonly requestType: import("./orders").MessageFns<GetOrderStateRequest>;
            readonly requestStream: false;
            readonly responseType: import("./orders").MessageFns<OrderState>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения позиций по виртуальному счёту песочницы. */
        readonly getSandboxPositions: {
            readonly name: "GetSandboxPositions";
            readonly requestType: import("./operations").MessageFns<PositionsRequest>;
            readonly requestStream: false;
            readonly responseType: import("./operations").MessageFns<PositionsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения операций в песочнице по номеру счёта. */
        readonly getSandboxOperations: {
            readonly name: "GetSandboxOperations";
            readonly requestType: import("./operations").MessageFns<OperationsRequest>;
            readonly requestStream: false;
            readonly responseType: import("./operations").MessageFns<OperationsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения операций в песочнице по номеру счета с пагинацией. */
        readonly getSandboxOperationsByCursor: {
            readonly name: "GetSandboxOperationsByCursor";
            readonly requestType: import("./operations").MessageFns<GetOperationsByCursorRequest>;
            readonly requestStream: false;
            readonly responseType: import("./operations").MessageFns<GetOperationsByCursorResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения портфолио в песочнице. */
        readonly getSandboxPortfolio: {
            readonly name: "GetSandboxPortfolio";
            readonly requestType: import("./operations").MessageFns<PortfolioRequest>;
            readonly requestStream: false;
            readonly responseType: import("./operations").MessageFns<PortfolioResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод пополнения счёта в песочнице. */
        readonly sandboxPayIn: {
            readonly name: "SandboxPayIn";
            readonly requestType: MessageFns<SandboxPayInRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<SandboxPayInResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения доступного остатка для вывода средств в песочнице. */
        readonly getSandboxWithdrawLimits: {
            readonly name: "GetSandboxWithdrawLimits";
            readonly requestType: import("./operations").MessageFns<WithdrawLimitsRequest>;
            readonly requestStream: false;
            readonly responseType: import("./operations").MessageFns<WithdrawLimitsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface SandboxServiceImplementation<CallContextExt = {}> {
    /** Метод регистрации счёта в песочнице. */
    openSandboxAccount(request: OpenSandboxAccountRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OpenSandboxAccountResponse>>;
    /** Метод получения счетов в песочнице. */
    getSandboxAccounts(request: GetAccountsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAccountsResponse>>;
    /** Метод закрытия счёта в песочнице. */
    closeSandboxAccount(request: CloseSandboxAccountRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CloseSandboxAccountResponse>>;
    /** Метод выставления торгового поручения в песочнице. */
    postSandboxOrder(request: PostOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostOrderResponse>>;
    /** Метод изменения выставленной заявки. */
    replaceSandboxOrder(request: ReplaceOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostOrderResponse>>;
    /** Метод получения списка активных заявок по счёту в песочнице. */
    getSandboxOrders(request: GetOrdersRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOrdersResponse>>;
    /** Метод отмены торгового поручения в песочнице. */
    cancelSandboxOrder(request: CancelOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CancelOrderResponse>>;
    /** Метод получения статуса заявки в песочнице. Заявки хранятся в таблице 7 дней. */
    getSandboxOrderState(request: GetOrderStateRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OrderState>>;
    /** Метод получения позиций по виртуальному счёту песочницы. */
    getSandboxPositions(request: PositionsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PositionsResponse>>;
    /** Метод получения операций в песочнице по номеру счёта. */
    getSandboxOperations(request: OperationsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OperationsResponse>>;
    /** Метод получения операций в песочнице по номеру счета с пагинацией. */
    getSandboxOperationsByCursor(request: GetOperationsByCursorRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOperationsByCursorResponse>>;
    /** Метод получения портфолио в песочнице. */
    getSandboxPortfolio(request: PortfolioRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PortfolioResponse>>;
    /** Метод пополнения счёта в песочнице. */
    sandboxPayIn(request: SandboxPayInRequest, context: CallContext & CallContextExt): Promise<DeepPartial<SandboxPayInResponse>>;
    /** Метод получения доступного остатка для вывода средств в песочнице. */
    getSandboxWithdrawLimits(request: WithdrawLimitsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<WithdrawLimitsResponse>>;
}
export interface SandboxServiceClient<CallOptionsExt = {}> {
    /** Метод регистрации счёта в песочнице. */
    openSandboxAccount(request: DeepPartial<OpenSandboxAccountRequest>, options?: CallOptions & CallOptionsExt): Promise<OpenSandboxAccountResponse>;
    /** Метод получения счетов в песочнице. */
    getSandboxAccounts(request: DeepPartial<GetAccountsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAccountsResponse>;
    /** Метод закрытия счёта в песочнице. */
    closeSandboxAccount(request: DeepPartial<CloseSandboxAccountRequest>, options?: CallOptions & CallOptionsExt): Promise<CloseSandboxAccountResponse>;
    /** Метод выставления торгового поручения в песочнице. */
    postSandboxOrder(request: DeepPartial<PostOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostOrderResponse>;
    /** Метод изменения выставленной заявки. */
    replaceSandboxOrder(request: DeepPartial<ReplaceOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostOrderResponse>;
    /** Метод получения списка активных заявок по счёту в песочнице. */
    getSandboxOrders(request: DeepPartial<GetOrdersRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOrdersResponse>;
    /** Метод отмены торгового поручения в песочнице. */
    cancelSandboxOrder(request: DeepPartial<CancelOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<CancelOrderResponse>;
    /** Метод получения статуса заявки в песочнице. Заявки хранятся в таблице 7 дней. */
    getSandboxOrderState(request: DeepPartial<GetOrderStateRequest>, options?: CallOptions & CallOptionsExt): Promise<OrderState>;
    /** Метод получения позиций по виртуальному счёту песочницы. */
    getSandboxPositions(request: DeepPartial<PositionsRequest>, options?: CallOptions & CallOptionsExt): Promise<PositionsResponse>;
    /** Метод получения операций в песочнице по номеру счёта. */
    getSandboxOperations(request: DeepPartial<OperationsRequest>, options?: CallOptions & CallOptionsExt): Promise<OperationsResponse>;
    /** Метод получения операций в песочнице по номеру счета с пагинацией. */
    getSandboxOperationsByCursor(request: DeepPartial<GetOperationsByCursorRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOperationsByCursorResponse>;
    /** Метод получения портфолио в песочнице. */
    getSandboxPortfolio(request: DeepPartial<PortfolioRequest>, options?: CallOptions & CallOptionsExt): Promise<PortfolioResponse>;
    /** Метод пополнения счёта в песочнице. */
    sandboxPayIn(request: DeepPartial<SandboxPayInRequest>, options?: CallOptions & CallOptionsExt): Promise<SandboxPayInResponse>;
    /** Метод получения доступного остатка для вывода средств в песочнице. */
    getSandboxWithdrawLimits(request: DeepPartial<WithdrawLimitsRequest>, options?: CallOptions & CallOptionsExt): Promise<WithdrawLimitsResponse>;
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
