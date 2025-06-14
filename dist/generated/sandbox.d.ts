import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { MoneyValue } from "./common";
import { GetOperationsByCursorRequest, GetOperationsByCursorResponse, OperationsRequest, OperationsResponse, PortfolioRequest, PortfolioResponse, PositionsRequest, PositionsResponse, WithdrawLimitsRequest, WithdrawLimitsResponse } from "./operations";
import { CancelOrderRequest, CancelOrderResponse, GetMaxLotsRequest, GetMaxLotsResponse, GetOrdersRequest, GetOrdersResponse, GetOrderStateRequest, OrderState, PostOrderRequest, PostOrderResponse, ReplaceOrderRequest } from "./orders";
import { GetAccountsRequest, GetAccountsResponse } from "./users";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Запрос открытия счёта в песочнице. */
export interface OpenSandboxAccountRequest {
    /** Название счёта */
    name?: string | undefined;
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
export declare const OpenSandboxAccountRequest: {
    encode(message: OpenSandboxAccountRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OpenSandboxAccountRequest;
    fromJSON(object: any): OpenSandboxAccountRequest;
    toJSON(message: OpenSandboxAccountRequest): unknown;
    create(base?: DeepPartial<OpenSandboxAccountRequest>): OpenSandboxAccountRequest;
    fromPartial(object: DeepPartial<OpenSandboxAccountRequest>): OpenSandboxAccountRequest;
};
export declare const OpenSandboxAccountResponse: {
    encode(message: OpenSandboxAccountResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OpenSandboxAccountResponse;
    fromJSON(object: any): OpenSandboxAccountResponse;
    toJSON(message: OpenSandboxAccountResponse): unknown;
    create(base?: DeepPartial<OpenSandboxAccountResponse>): OpenSandboxAccountResponse;
    fromPartial(object: DeepPartial<OpenSandboxAccountResponse>): OpenSandboxAccountResponse;
};
export declare const CloseSandboxAccountRequest: {
    encode(message: CloseSandboxAccountRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CloseSandboxAccountRequest;
    fromJSON(object: any): CloseSandboxAccountRequest;
    toJSON(message: CloseSandboxAccountRequest): unknown;
    create(base?: DeepPartial<CloseSandboxAccountRequest>): CloseSandboxAccountRequest;
    fromPartial(object: DeepPartial<CloseSandboxAccountRequest>): CloseSandboxAccountRequest;
};
export declare const CloseSandboxAccountResponse: {
    encode(_: CloseSandboxAccountResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CloseSandboxAccountResponse;
    fromJSON(_: any): CloseSandboxAccountResponse;
    toJSON(_: CloseSandboxAccountResponse): unknown;
    create(base?: DeepPartial<CloseSandboxAccountResponse>): CloseSandboxAccountResponse;
    fromPartial(_: DeepPartial<CloseSandboxAccountResponse>): CloseSandboxAccountResponse;
};
export declare const SandboxPayInRequest: {
    encode(message: SandboxPayInRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SandboxPayInRequest;
    fromJSON(object: any): SandboxPayInRequest;
    toJSON(message: SandboxPayInRequest): unknown;
    create(base?: DeepPartial<SandboxPayInRequest>): SandboxPayInRequest;
    fromPartial(object: DeepPartial<SandboxPayInRequest>): SandboxPayInRequest;
};
export declare const SandboxPayInResponse: {
    encode(message: SandboxPayInResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SandboxPayInResponse;
    fromJSON(object: any): SandboxPayInResponse;
    toJSON(message: SandboxPayInResponse): unknown;
    create(base?: DeepPartial<SandboxPayInResponse>): SandboxPayInResponse;
    fromPartial(object: DeepPartial<SandboxPayInResponse>): SandboxPayInResponse;
};
/** Методы для работы с песочницей Tinkoff Invest API */
export type SandboxServiceDefinition = typeof SandboxServiceDefinition;
export declare const SandboxServiceDefinition: {
    readonly name: "SandboxService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.SandboxService";
    readonly methods: {
        /** Зарегистрировать счёт. */
        readonly openSandboxAccount: {
            readonly name: "OpenSandboxAccount";
            readonly requestType: {
                encode(message: OpenSandboxAccountRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OpenSandboxAccountRequest;
                fromJSON(object: any): OpenSandboxAccountRequest;
                toJSON(message: OpenSandboxAccountRequest): unknown;
                create(base?: DeepPartial<OpenSandboxAccountRequest>): OpenSandboxAccountRequest;
                fromPartial(object: DeepPartial<OpenSandboxAccountRequest>): OpenSandboxAccountRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OpenSandboxAccountResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OpenSandboxAccountResponse;
                fromJSON(object: any): OpenSandboxAccountResponse;
                toJSON(message: OpenSandboxAccountResponse): unknown;
                create(base?: DeepPartial<OpenSandboxAccountResponse>): OpenSandboxAccountResponse;
                fromPartial(object: DeepPartial<OpenSandboxAccountResponse>): OpenSandboxAccountResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить счета. */
        readonly getSandboxAccounts: {
            readonly name: "GetSandboxAccounts";
            readonly requestType: {
                encode(_: GetAccountsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAccountsRequest;
                fromJSON(_: any): GetAccountsRequest;
                toJSON(_: GetAccountsRequest): unknown;
                create(base?: import("./users").DeepPartial<GetAccountsRequest>): GetAccountsRequest;
                fromPartial(_: import("./users").DeepPartial<GetAccountsRequest>): GetAccountsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetAccountsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAccountsResponse;
                fromJSON(object: any): GetAccountsResponse;
                toJSON(message: GetAccountsResponse): unknown;
                create(base?: import("./users").DeepPartial<GetAccountsResponse>): GetAccountsResponse;
                fromPartial(object: import("./users").DeepPartial<GetAccountsResponse>): GetAccountsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Закрыть счёт. */
        readonly closeSandboxAccount: {
            readonly name: "CloseSandboxAccount";
            readonly requestType: {
                encode(message: CloseSandboxAccountRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CloseSandboxAccountRequest;
                fromJSON(object: any): CloseSandboxAccountRequest;
                toJSON(message: CloseSandboxAccountRequest): unknown;
                create(base?: DeepPartial<CloseSandboxAccountRequest>): CloseSandboxAccountRequest;
                fromPartial(object: DeepPartial<CloseSandboxAccountRequest>): CloseSandboxAccountRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(_: CloseSandboxAccountResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CloseSandboxAccountResponse;
                fromJSON(_: any): CloseSandboxAccountResponse;
                toJSON(_: CloseSandboxAccountResponse): unknown;
                create(base?: DeepPartial<CloseSandboxAccountResponse>): CloseSandboxAccountResponse;
                fromPartial(_: DeepPartial<CloseSandboxAccountResponse>): CloseSandboxAccountResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Выставить торговое поручение. */
        readonly postSandboxOrder: {
            readonly name: "PostSandboxOrder";
            readonly requestType: {
                encode(message: PostOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderRequest;
                fromJSON(object: any): PostOrderRequest;
                toJSON(message: PostOrderRequest): unknown;
                create(base?: import("./orders").DeepPartial<PostOrderRequest>): PostOrderRequest;
                fromPartial(object: import("./orders").DeepPartial<PostOrderRequest>): PostOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderResponse;
                fromJSON(object: any): PostOrderResponse;
                toJSON(message: PostOrderResponse): unknown;
                create(base?: import("./orders").DeepPartial<PostOrderResponse>): PostOrderResponse;
                fromPartial(object: import("./orders").DeepPartial<PostOrderResponse>): PostOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Изменить выставленную заявку. */
        readonly replaceSandboxOrder: {
            readonly name: "ReplaceSandboxOrder";
            readonly requestType: {
                encode(message: ReplaceOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): ReplaceOrderRequest;
                fromJSON(object: any): ReplaceOrderRequest;
                toJSON(message: ReplaceOrderRequest): unknown;
                create(base?: import("./orders").DeepPartial<ReplaceOrderRequest>): ReplaceOrderRequest;
                fromPartial(object: import("./orders").DeepPartial<ReplaceOrderRequest>): ReplaceOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PostOrderResponse;
                fromJSON(object: any): PostOrderResponse;
                toJSON(message: PostOrderResponse): unknown;
                create(base?: import("./orders").DeepPartial<PostOrderResponse>): PostOrderResponse;
                fromPartial(object: import("./orders").DeepPartial<PostOrderResponse>): PostOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список активных заявок по счёту. */
        readonly getSandboxOrders: {
            readonly name: "GetSandboxOrders";
            readonly requestType: {
                encode(message: GetOrdersRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrdersRequest;
                fromJSON(object: any): GetOrdersRequest;
                toJSON(message: GetOrdersRequest): unknown;
                create(base?: import("./orders").DeepPartial<GetOrdersRequest>): GetOrdersRequest;
                fromPartial(object: import("./orders").DeepPartial<GetOrdersRequest>): GetOrdersRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOrdersResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrdersResponse;
                fromJSON(object: any): GetOrdersResponse;
                toJSON(message: GetOrdersResponse): unknown;
                create(base?: import("./orders").DeepPartial<GetOrdersResponse>): GetOrdersResponse;
                fromPartial(object: import("./orders").DeepPartial<GetOrdersResponse>): GetOrdersResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Отменить торговое поручение. */
        readonly cancelSandboxOrder: {
            readonly name: "CancelSandboxOrder";
            readonly requestType: {
                encode(message: CancelOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CancelOrderRequest;
                fromJSON(object: any): CancelOrderRequest;
                toJSON(message: CancelOrderRequest): unknown;
                create(base?: import("./orders").DeepPartial<CancelOrderRequest>): CancelOrderRequest;
                fromPartial(object: import("./orders").DeepPartial<CancelOrderRequest>): CancelOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: CancelOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): CancelOrderResponse;
                fromJSON(object: any): CancelOrderResponse;
                toJSON(message: CancelOrderResponse): unknown;
                create(base?: import("./orders").DeepPartial<CancelOrderResponse>): CancelOrderResponse;
                fromPartial(object: import("./orders").DeepPartial<CancelOrderResponse>): CancelOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Поулчить статус заявки в песочнице. Заявки хранятся в таблице 7 дней. */
        readonly getSandboxOrderState: {
            readonly name: "GetSandboxOrderState";
            readonly requestType: {
                encode(message: GetOrderStateRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOrderStateRequest;
                fromJSON(object: any): GetOrderStateRequest;
                toJSON(message: GetOrderStateRequest): unknown;
                create(base?: import("./orders").DeepPartial<GetOrderStateRequest>): GetOrderStateRequest;
                fromPartial(object: import("./orders").DeepPartial<GetOrderStateRequest>): GetOrderStateRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OrderState, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OrderState;
                fromJSON(object: any): OrderState;
                toJSON(message: OrderState): unknown;
                create(base?: import("./orders").DeepPartial<OrderState>): OrderState;
                fromPartial(object: import("./orders").DeepPartial<OrderState>): OrderState;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить позиции по виртуальному счёту. */
        readonly getSandboxPositions: {
            readonly name: "GetSandboxPositions";
            readonly requestType: {
                encode(message: PositionsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PositionsRequest;
                fromJSON(object: any): PositionsRequest;
                toJSON(message: PositionsRequest): unknown;
                create(base?: import("./operations").DeepPartial<PositionsRequest>): PositionsRequest;
                fromPartial(object: import("./operations").DeepPartial<PositionsRequest>): PositionsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PositionsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PositionsResponse;
                fromJSON(object: any): PositionsResponse;
                toJSON(message: PositionsResponse): unknown;
                create(base?: import("./operations").DeepPartial<PositionsResponse>): PositionsResponse;
                fromPartial(object: import("./operations").DeepPartial<PositionsResponse>): PositionsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить операции по номеру счёта. */
        readonly getSandboxOperations: {
            readonly name: "GetSandboxOperations";
            readonly requestType: {
                encode(message: OperationsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OperationsRequest;
                fromJSON(object: any): OperationsRequest;
                toJSON(message: OperationsRequest): unknown;
                create(base?: import("./operations").DeepPartial<OperationsRequest>): OperationsRequest;
                fromPartial(object: import("./operations").DeepPartial<OperationsRequest>): OperationsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OperationsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OperationsResponse;
                fromJSON(object: any): OperationsResponse;
                toJSON(message: OperationsResponse): unknown;
                create(base?: import("./operations").DeepPartial<OperationsResponse>): OperationsResponse;
                fromPartial(object: import("./operations").DeepPartial<OperationsResponse>): OperationsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить операции по номеру счёта с пагинацией. */
        readonly getSandboxOperationsByCursor: {
            readonly name: "GetSandboxOperationsByCursor";
            readonly requestType: {
                encode(message: GetOperationsByCursorRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOperationsByCursorRequest;
                fromJSON(object: any): GetOperationsByCursorRequest;
                toJSON(message: GetOperationsByCursorRequest): unknown;
                create(base?: import("./operations").DeepPartial<GetOperationsByCursorRequest>): GetOperationsByCursorRequest;
                fromPartial(object: import("./operations").DeepPartial<GetOperationsByCursorRequest>): GetOperationsByCursorRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOperationsByCursorResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOperationsByCursorResponse;
                fromJSON(object: any): GetOperationsByCursorResponse;
                toJSON(message: GetOperationsByCursorResponse): unknown;
                create(base?: import("./operations").DeepPartial<GetOperationsByCursorResponse>): GetOperationsByCursorResponse;
                fromPartial(object: import("./operations").DeepPartial<GetOperationsByCursorResponse>): GetOperationsByCursorResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить портфель. */
        readonly getSandboxPortfolio: {
            readonly name: "GetSandboxPortfolio";
            readonly requestType: {
                encode(message: PortfolioRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioRequest;
                fromJSON(object: any): PortfolioRequest;
                toJSON(message: PortfolioRequest): unknown;
                create(base?: import("./operations").DeepPartial<PortfolioRequest>): PortfolioRequest;
                fromPartial(object: import("./operations").DeepPartial<PortfolioRequest>): PortfolioRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PortfolioResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioResponse;
                fromJSON(object: any): PortfolioResponse;
                toJSON(message: PortfolioResponse): unknown;
                create(base?: import("./operations").DeepPartial<PortfolioResponse>): PortfolioResponse;
                fromPartial(object: import("./operations").DeepPartial<PortfolioResponse>): PortfolioResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Пополнить счёт. */
        readonly sandboxPayIn: {
            readonly name: "SandboxPayIn";
            readonly requestType: {
                encode(message: SandboxPayInRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): SandboxPayInRequest;
                fromJSON(object: any): SandboxPayInRequest;
                toJSON(message: SandboxPayInRequest): unknown;
                create(base?: DeepPartial<SandboxPayInRequest>): SandboxPayInRequest;
                fromPartial(object: DeepPartial<SandboxPayInRequest>): SandboxPayInRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: SandboxPayInResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): SandboxPayInResponse;
                fromJSON(object: any): SandboxPayInResponse;
                toJSON(message: SandboxPayInResponse): unknown;
                create(base?: DeepPartial<SandboxPayInResponse>): SandboxPayInResponse;
                fromPartial(object: DeepPartial<SandboxPayInResponse>): SandboxPayInResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить доступный остаток для вывода средств. */
        readonly getSandboxWithdrawLimits: {
            readonly name: "GetSandboxWithdrawLimits";
            readonly requestType: {
                encode(message: WithdrawLimitsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): WithdrawLimitsRequest;
                fromJSON(object: any): WithdrawLimitsRequest;
                toJSON(message: WithdrawLimitsRequest): unknown;
                create(base?: import("./operations").DeepPartial<WithdrawLimitsRequest>): WithdrawLimitsRequest;
                fromPartial(object: import("./operations").DeepPartial<WithdrawLimitsRequest>): WithdrawLimitsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: WithdrawLimitsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): WithdrawLimitsResponse;
                fromJSON(object: any): WithdrawLimitsResponse;
                toJSON(message: WithdrawLimitsResponse): unknown;
                create(base?: import("./operations").DeepPartial<WithdrawLimitsResponse>): WithdrawLimitsResponse;
                fromPartial(object: import("./operations").DeepPartial<WithdrawLimitsResponse>): WithdrawLimitsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Расчёт количества доступных для покупки/продажи лотов в песочнице. */
        readonly getSandboxMaxLots: {
            readonly name: "GetSandboxMaxLots";
            readonly requestType: {
                encode(message: GetMaxLotsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsRequest;
                fromJSON(object: any): GetMaxLotsRequest;
                toJSON(message: GetMaxLotsRequest): unknown;
                create(base?: import("./orders").DeepPartial<GetMaxLotsRequest>): GetMaxLotsRequest;
                fromPartial(object: import("./orders").DeepPartial<GetMaxLotsRequest>): GetMaxLotsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetMaxLotsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetMaxLotsResponse;
                fromJSON(object: any): GetMaxLotsResponse;
                toJSON(message: GetMaxLotsResponse): unknown;
                create(base?: import("./orders").DeepPartial<GetMaxLotsResponse>): GetMaxLotsResponse;
                fromPartial(object: import("./orders").DeepPartial<GetMaxLotsResponse>): GetMaxLotsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface SandboxServiceImplementation<CallContextExt = {}> {
    /** Зарегистрировать счёт. */
    openSandboxAccount(request: OpenSandboxAccountRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OpenSandboxAccountResponse>>;
    /** Получить счета. */
    getSandboxAccounts(request: GetAccountsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAccountsResponse>>;
    /** Закрыть счёт. */
    closeSandboxAccount(request: CloseSandboxAccountRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CloseSandboxAccountResponse>>;
    /** Выставить торговое поручение. */
    postSandboxOrder(request: PostOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostOrderResponse>>;
    /** Изменить выставленную заявку. */
    replaceSandboxOrder(request: ReplaceOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PostOrderResponse>>;
    /** Получить список активных заявок по счёту. */
    getSandboxOrders(request: GetOrdersRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOrdersResponse>>;
    /** Отменить торговое поручение. */
    cancelSandboxOrder(request: CancelOrderRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CancelOrderResponse>>;
    /** Поулчить статус заявки в песочнице. Заявки хранятся в таблице 7 дней. */
    getSandboxOrderState(request: GetOrderStateRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OrderState>>;
    /** Получить позиции по виртуальному счёту. */
    getSandboxPositions(request: PositionsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PositionsResponse>>;
    /** Получить операции по номеру счёта. */
    getSandboxOperations(request: OperationsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OperationsResponse>>;
    /** Получить операции по номеру счёта с пагинацией. */
    getSandboxOperationsByCursor(request: GetOperationsByCursorRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOperationsByCursorResponse>>;
    /** Получить портфель. */
    getSandboxPortfolio(request: PortfolioRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PortfolioResponse>>;
    /** Пополнить счёт. */
    sandboxPayIn(request: SandboxPayInRequest, context: CallContext & CallContextExt): Promise<DeepPartial<SandboxPayInResponse>>;
    /** Получить доступный остаток для вывода средств. */
    getSandboxWithdrawLimits(request: WithdrawLimitsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<WithdrawLimitsResponse>>;
    /** Расчёт количества доступных для покупки/продажи лотов в песочнице. */
    getSandboxMaxLots(request: GetMaxLotsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetMaxLotsResponse>>;
}
export interface SandboxServiceClient<CallOptionsExt = {}> {
    /** Зарегистрировать счёт. */
    openSandboxAccount(request: DeepPartial<OpenSandboxAccountRequest>, options?: CallOptions & CallOptionsExt): Promise<OpenSandboxAccountResponse>;
    /** Получить счета. */
    getSandboxAccounts(request: DeepPartial<GetAccountsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAccountsResponse>;
    /** Закрыть счёт. */
    closeSandboxAccount(request: DeepPartial<CloseSandboxAccountRequest>, options?: CallOptions & CallOptionsExt): Promise<CloseSandboxAccountResponse>;
    /** Выставить торговое поручение. */
    postSandboxOrder(request: DeepPartial<PostOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostOrderResponse>;
    /** Изменить выставленную заявку. */
    replaceSandboxOrder(request: DeepPartial<ReplaceOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<PostOrderResponse>;
    /** Получить список активных заявок по счёту. */
    getSandboxOrders(request: DeepPartial<GetOrdersRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOrdersResponse>;
    /** Отменить торговое поручение. */
    cancelSandboxOrder(request: DeepPartial<CancelOrderRequest>, options?: CallOptions & CallOptionsExt): Promise<CancelOrderResponse>;
    /** Поулчить статус заявки в песочнице. Заявки хранятся в таблице 7 дней. */
    getSandboxOrderState(request: DeepPartial<GetOrderStateRequest>, options?: CallOptions & CallOptionsExt): Promise<OrderState>;
    /** Получить позиции по виртуальному счёту. */
    getSandboxPositions(request: DeepPartial<PositionsRequest>, options?: CallOptions & CallOptionsExt): Promise<PositionsResponse>;
    /** Получить операции по номеру счёта. */
    getSandboxOperations(request: DeepPartial<OperationsRequest>, options?: CallOptions & CallOptionsExt): Promise<OperationsResponse>;
    /** Получить операции по номеру счёта с пагинацией. */
    getSandboxOperationsByCursor(request: DeepPartial<GetOperationsByCursorRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOperationsByCursorResponse>;
    /** Получить портфель. */
    getSandboxPortfolio(request: DeepPartial<PortfolioRequest>, options?: CallOptions & CallOptionsExt): Promise<PortfolioResponse>;
    /** Пополнить счёт. */
    sandboxPayIn(request: DeepPartial<SandboxPayInRequest>, options?: CallOptions & CallOptionsExt): Promise<SandboxPayInResponse>;
    /** Получить доступный остаток для вывода средств. */
    getSandboxWithdrawLimits(request: DeepPartial<WithdrawLimitsRequest>, options?: CallOptions & CallOptionsExt): Promise<WithdrawLimitsResponse>;
    /** Расчёт количества доступных для покупки/продажи лотов в песочнице. */
    getSandboxMaxLots(request: DeepPartial<GetMaxLotsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetMaxLotsResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
