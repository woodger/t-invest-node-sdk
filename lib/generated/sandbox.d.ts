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
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetAccountsRequest;
                fromJSON(_: any): GetAccountsRequest;
                toJSON(_: GetAccountsRequest): unknown;
                create(base?: {} | undefined): GetAccountsRequest;
                fromPartial(_: {}): GetAccountsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetAccountsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetAccountsResponse;
                fromJSON(object: any): GetAccountsResponse;
                toJSON(message: GetAccountsResponse): unknown;
                create(base?: {
                    accounts?: {
                        id?: string | undefined;
                        type?: import("./users").AccountType | undefined;
                        name?: string | undefined;
                        status?: import("./users").AccountStatus | undefined;
                        openedDate?: Date | undefined;
                        closedDate?: Date | undefined;
                        accessLevel?: import("./users").AccessLevel | undefined;
                    }[] | undefined;
                } | undefined): GetAccountsResponse;
                fromPartial(object: {
                    accounts?: {
                        id?: string | undefined;
                        type?: import("./users").AccountType | undefined;
                        name?: string | undefined;
                        status?: import("./users").AccountStatus | undefined;
                        openedDate?: Date | undefined;
                        closedDate?: Date | undefined;
                        accessLevel?: import("./users").AccessLevel | undefined;
                    }[] | undefined;
                }): GetAccountsResponse;
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
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PostOrderRequest;
                fromJSON(object: any): PostOrderRequest;
                toJSON(message: PostOrderRequest): unknown;
                create(base?: {
                    figi?: string | undefined;
                    quantity?: number | undefined;
                    price?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    accountId?: string | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    orderId?: string | undefined;
                    instrumentId?: string | undefined;
                    timeInForce?: import("./orders").TimeInForceType | undefined;
                    priceType?: import("./common").PriceType | undefined;
                } | undefined): PostOrderRequest;
                fromPartial(object: {
                    figi?: string | undefined;
                    quantity?: number | undefined;
                    price?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    accountId?: string | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    orderId?: string | undefined;
                    instrumentId?: string | undefined;
                    timeInForce?: import("./orders").TimeInForceType | undefined;
                    priceType?: import("./common").PriceType | undefined;
                }): PostOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PostOrderResponse;
                fromJSON(object: any): PostOrderResponse;
                toJSON(message: PostOrderResponse): unknown;
                create(base?: {
                    orderId?: string | undefined;
                    executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                    lotsRequested?: number | undefined;
                    lotsExecuted?: number | undefined;
                    initialOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalOrderAmount?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    initialCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    aciValue?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    figi?: string | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    initialSecurityPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    message?: string | undefined;
                    initialOrderPricePt?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    instrumentUid?: string | undefined;
                    orderRequestId?: string | undefined;
                    responseMetadata?: {
                        trackingId?: string | undefined;
                        serverTime?: Date | undefined;
                    } | undefined;
                } | undefined): PostOrderResponse;
                fromPartial(object: {
                    orderId?: string | undefined;
                    executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                    lotsRequested?: number | undefined;
                    lotsExecuted?: number | undefined;
                    initialOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalOrderAmount?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    initialCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    aciValue?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    figi?: string | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    initialSecurityPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    message?: string | undefined;
                    initialOrderPricePt?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    instrumentUid?: string | undefined;
                    orderRequestId?: string | undefined;
                    responseMetadata?: {
                        trackingId?: string | undefined;
                        serverTime?: Date | undefined;
                    } | undefined;
                }): PostOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Изменить выставленную заявку. */
        readonly replaceSandboxOrder: {
            readonly name: "ReplaceSandboxOrder";
            readonly requestType: {
                encode(message: ReplaceOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): ReplaceOrderRequest;
                fromJSON(object: any): ReplaceOrderRequest;
                toJSON(message: ReplaceOrderRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    orderId?: string | undefined;
                    idempotencyKey?: string | undefined;
                    quantity?: number | undefined;
                    price?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    priceType?: import("./common").PriceType | undefined;
                } | undefined): ReplaceOrderRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    orderId?: string | undefined;
                    idempotencyKey?: string | undefined;
                    quantity?: number | undefined;
                    price?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    priceType?: import("./common").PriceType | undefined;
                }): ReplaceOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PostOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PostOrderResponse;
                fromJSON(object: any): PostOrderResponse;
                toJSON(message: PostOrderResponse): unknown;
                create(base?: {
                    orderId?: string | undefined;
                    executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                    lotsRequested?: number | undefined;
                    lotsExecuted?: number | undefined;
                    initialOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalOrderAmount?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    initialCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    aciValue?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    figi?: string | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    initialSecurityPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    message?: string | undefined;
                    initialOrderPricePt?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    instrumentUid?: string | undefined;
                    orderRequestId?: string | undefined;
                    responseMetadata?: {
                        trackingId?: string | undefined;
                        serverTime?: Date | undefined;
                    } | undefined;
                } | undefined): PostOrderResponse;
                fromPartial(object: {
                    orderId?: string | undefined;
                    executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                    lotsRequested?: number | undefined;
                    lotsExecuted?: number | undefined;
                    initialOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalOrderAmount?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    initialCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    aciValue?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    figi?: string | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    initialSecurityPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    message?: string | undefined;
                    initialOrderPricePt?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    instrumentUid?: string | undefined;
                    orderRequestId?: string | undefined;
                    responseMetadata?: {
                        trackingId?: string | undefined;
                        serverTime?: Date | undefined;
                    } | undefined;
                }): PostOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить список активных заявок по счёту. */
        readonly getSandboxOrders: {
            readonly name: "GetSandboxOrders";
            readonly requestType: {
                encode(message: GetOrdersRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetOrdersRequest;
                fromJSON(object: any): GetOrdersRequest;
                toJSON(message: GetOrdersRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                } | undefined): GetOrdersRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                }): GetOrdersRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOrdersResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetOrdersResponse;
                fromJSON(object: any): GetOrdersResponse;
                toJSON(message: GetOrdersResponse): unknown;
                create(base?: {
                    orders?: {
                        orderId?: string | undefined;
                        executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                        lotsRequested?: number | undefined;
                        lotsExecuted?: number | undefined;
                        initialOrderPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        executedOrderPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        totalOrderAmount?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        initialCommission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        executedCommission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        figi?: string | undefined;
                        direction?: import("./orders").OrderDirection | undefined;
                        initialSecurityPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        stages?: {
                            price?: {
                                currency?: string | undefined;
                                units?: number | undefined;
                                nano?: number | undefined;
                            } | undefined;
                            quantity?: number | undefined;
                            tradeId?: string | undefined;
                            executionTime?: Date | undefined;
                        }[] | undefined;
                        serviceCommission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        currency?: string | undefined;
                        orderType?: import("./orders").OrderType | undefined;
                        orderDate?: Date | undefined;
                        instrumentUid?: string | undefined;
                        orderRequestId?: string | undefined;
                    }[] | undefined;
                } | undefined): GetOrdersResponse;
                fromPartial(object: {
                    orders?: {
                        orderId?: string | undefined;
                        executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                        lotsRequested?: number | undefined;
                        lotsExecuted?: number | undefined;
                        initialOrderPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        executedOrderPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        totalOrderAmount?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        initialCommission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        executedCommission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        figi?: string | undefined;
                        direction?: import("./orders").OrderDirection | undefined;
                        initialSecurityPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        stages?: {
                            price?: {
                                currency?: string | undefined;
                                units?: number | undefined;
                                nano?: number | undefined;
                            } | undefined;
                            quantity?: number | undefined;
                            tradeId?: string | undefined;
                            executionTime?: Date | undefined;
                        }[] | undefined;
                        serviceCommission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        currency?: string | undefined;
                        orderType?: import("./orders").OrderType | undefined;
                        orderDate?: Date | undefined;
                        instrumentUid?: string | undefined;
                        orderRequestId?: string | undefined;
                    }[] | undefined;
                }): GetOrdersResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Отменить торговое поручение. */
        readonly cancelSandboxOrder: {
            readonly name: "CancelSandboxOrder";
            readonly requestType: {
                encode(message: CancelOrderRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): CancelOrderRequest;
                fromJSON(object: any): CancelOrderRequest;
                toJSON(message: CancelOrderRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    orderId?: string | undefined;
                } | undefined): CancelOrderRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    orderId?: string | undefined;
                }): CancelOrderRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: CancelOrderResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): CancelOrderResponse;
                fromJSON(object: any): CancelOrderResponse;
                toJSON(message: CancelOrderResponse): unknown;
                create(base?: {
                    time?: Date | undefined;
                    responseMetadata?: {
                        trackingId?: string | undefined;
                        serverTime?: Date | undefined;
                    } | undefined;
                } | undefined): CancelOrderResponse;
                fromPartial(object: {
                    time?: Date | undefined;
                    responseMetadata?: {
                        trackingId?: string | undefined;
                        serverTime?: Date | undefined;
                    } | undefined;
                }): CancelOrderResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Поулчить статус заявки в песочнице. Заявки хранятся в таблице 7 дней. */
        readonly getSandboxOrderState: {
            readonly name: "GetSandboxOrderState";
            readonly requestType: {
                encode(message: GetOrderStateRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetOrderStateRequest;
                fromJSON(object: any): GetOrderStateRequest;
                toJSON(message: GetOrderStateRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    orderId?: string | undefined;
                    priceType?: import("./common").PriceType | undefined;
                } | undefined): GetOrderStateRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    orderId?: string | undefined;
                    priceType?: import("./common").PriceType | undefined;
                }): GetOrderStateRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OrderState, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): OrderState;
                fromJSON(object: any): OrderState;
                toJSON(message: OrderState): unknown;
                create(base?: {
                    orderId?: string | undefined;
                    executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                    lotsRequested?: number | undefined;
                    lotsExecuted?: number | undefined;
                    initialOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalOrderAmount?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    averagePositionPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    initialCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    figi?: string | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    initialSecurityPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    stages?: {
                        price?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        quantity?: number | undefined;
                        tradeId?: string | undefined;
                        executionTime?: Date | undefined;
                    }[] | undefined;
                    serviceCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    currency?: string | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    orderDate?: Date | undefined;
                    instrumentUid?: string | undefined;
                    orderRequestId?: string | undefined;
                } | undefined): OrderState;
                fromPartial(object: {
                    orderId?: string | undefined;
                    executionReportStatus?: import("./orders").OrderExecutionReportStatus | undefined;
                    lotsRequested?: number | undefined;
                    lotsExecuted?: number | undefined;
                    initialOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedOrderPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalOrderAmount?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    averagePositionPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    initialCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    executedCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    figi?: string | undefined;
                    direction?: import("./orders").OrderDirection | undefined;
                    initialSecurityPrice?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    stages?: {
                        price?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        quantity?: number | undefined;
                        tradeId?: string | undefined;
                        executionTime?: Date | undefined;
                    }[] | undefined;
                    serviceCommission?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    currency?: string | undefined;
                    orderType?: import("./orders").OrderType | undefined;
                    orderDate?: Date | undefined;
                    instrumentUid?: string | undefined;
                    orderRequestId?: string | undefined;
                }): OrderState;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить позиции по виртуальному счёту. */
        readonly getSandboxPositions: {
            readonly name: "GetSandboxPositions";
            readonly requestType: {
                encode(message: PositionsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PositionsRequest;
                fromJSON(object: any): PositionsRequest;
                toJSON(message: PositionsRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                } | undefined): PositionsRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                }): PositionsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PositionsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PositionsResponse;
                fromJSON(object: any): PositionsResponse;
                toJSON(message: PositionsResponse): unknown;
                create(base?: {
                    money?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    blocked?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    securities?: {
                        figi?: string | undefined;
                        blocked?: number | undefined;
                        balance?: number | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        exchangeBlocked?: boolean | undefined;
                        instrumentType?: string | undefined;
                    }[] | undefined;
                    limitsLoadingInProgress?: boolean | undefined;
                    futures?: {
                        figi?: string | undefined;
                        blocked?: number | undefined;
                        balance?: number | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                    }[] | undefined;
                    options?: {
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        blocked?: number | undefined;
                        balance?: number | undefined;
                    }[] | undefined;
                } | undefined): PositionsResponse;
                fromPartial(object: {
                    money?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    blocked?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    securities?: {
                        figi?: string | undefined;
                        blocked?: number | undefined;
                        balance?: number | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        exchangeBlocked?: boolean | undefined;
                        instrumentType?: string | undefined;
                    }[] | undefined;
                    limitsLoadingInProgress?: boolean | undefined;
                    futures?: {
                        figi?: string | undefined;
                        blocked?: number | undefined;
                        balance?: number | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                    }[] | undefined;
                    options?: {
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        blocked?: number | undefined;
                        balance?: number | undefined;
                    }[] | undefined;
                }): PositionsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить операции по номеру счёта. */
        readonly getSandboxOperations: {
            readonly name: "GetSandboxOperations";
            readonly requestType: {
                encode(message: OperationsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): OperationsRequest;
                fromJSON(object: any): OperationsRequest;
                toJSON(message: OperationsRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    from?: Date | undefined;
                    to?: Date | undefined;
                    state?: import("./operations").OperationState | undefined;
                    figi?: string | undefined;
                } | undefined): OperationsRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    from?: Date | undefined;
                    to?: Date | undefined;
                    state?: import("./operations").OperationState | undefined;
                    figi?: string | undefined;
                }): OperationsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OperationsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): OperationsResponse;
                fromJSON(object: any): OperationsResponse;
                toJSON(message: OperationsResponse): unknown;
                create(base?: {
                    operations?: {
                        id?: string | undefined;
                        parentOperationId?: string | undefined;
                        currency?: string | undefined;
                        payment?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        price?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        state?: import("./operations").OperationState | undefined;
                        quantity?: number | undefined;
                        quantityRest?: number | undefined;
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        date?: Date | undefined;
                        type?: string | undefined;
                        operationType?: import("./operations").OperationType | undefined;
                        trades?: {
                            tradeId?: string | undefined;
                            dateTime?: Date | undefined;
                            quantity?: number | undefined;
                            price?: {
                                currency?: string | undefined;
                                units?: number | undefined;
                                nano?: number | undefined;
                            } | undefined;
                        }[] | undefined;
                        assetUid?: string | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                    }[] | undefined;
                } | undefined): OperationsResponse;
                fromPartial(object: {
                    operations?: {
                        id?: string | undefined;
                        parentOperationId?: string | undefined;
                        currency?: string | undefined;
                        payment?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        price?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        state?: import("./operations").OperationState | undefined;
                        quantity?: number | undefined;
                        quantityRest?: number | undefined;
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        date?: Date | undefined;
                        type?: string | undefined;
                        operationType?: import("./operations").OperationType | undefined;
                        trades?: {
                            tradeId?: string | undefined;
                            dateTime?: Date | undefined;
                            quantity?: number | undefined;
                            price?: {
                                currency?: string | undefined;
                                units?: number | undefined;
                                nano?: number | undefined;
                            } | undefined;
                        }[] | undefined;
                        assetUid?: string | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                    }[] | undefined;
                }): OperationsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить операции по номеру счёта с пагинацией. */
        readonly getSandboxOperationsByCursor: {
            readonly name: "GetSandboxOperationsByCursor";
            readonly requestType: {
                encode(message: GetOperationsByCursorRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetOperationsByCursorRequest;
                fromJSON(object: any): GetOperationsByCursorRequest;
                toJSON(message: GetOperationsByCursorRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    instrumentId?: string | undefined;
                    from?: Date | undefined;
                    to?: Date | undefined;
                    cursor?: string | undefined;
                    limit?: number | undefined;
                    operationTypes?: import("./operations").OperationType[] | undefined;
                    state?: import("./operations").OperationState | undefined;
                    withoutCommissions?: boolean | undefined;
                    withoutTrades?: boolean | undefined;
                    withoutOvernights?: boolean | undefined;
                } | undefined): GetOperationsByCursorRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    instrumentId?: string | undefined;
                    from?: Date | undefined;
                    to?: Date | undefined;
                    cursor?: string | undefined;
                    limit?: number | undefined;
                    operationTypes?: import("./operations").OperationType[] | undefined;
                    state?: import("./operations").OperationState | undefined;
                    withoutCommissions?: boolean | undefined;
                    withoutTrades?: boolean | undefined;
                    withoutOvernights?: boolean | undefined;
                }): GetOperationsByCursorRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOperationsByCursorResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetOperationsByCursorResponse;
                fromJSON(object: any): GetOperationsByCursorResponse;
                toJSON(message: GetOperationsByCursorResponse): unknown;
                create(base?: {
                    hasNext?: boolean | undefined;
                    nextCursor?: string | undefined;
                    items?: {
                        cursor?: string | undefined;
                        brokerAccountId?: string | undefined;
                        id?: string | undefined;
                        parentOperationId?: string | undefined;
                        name?: string | undefined;
                        date?: Date | undefined;
                        type?: import("./operations").OperationType | undefined;
                        description?: string | undefined;
                        state?: import("./operations").OperationState | undefined;
                        instrumentUid?: string | undefined;
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        instrumentKind?: import("./common").InstrumentType | undefined;
                        positionUid?: string | undefined;
                        payment?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        price?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        commission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        yield?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        yieldRelative?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        accruedInt?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        quantity?: number | undefined;
                        quantityRest?: number | undefined;
                        quantityDone?: number | undefined;
                        cancelDateTime?: Date | undefined;
                        cancelReason?: string | undefined;
                        tradesInfo?: {
                            trades?: {
                                num?: string | undefined;
                                date?: Date | undefined;
                                quantity?: number | undefined;
                                price?: {
                                    currency?: string | undefined;
                                    units?: number | undefined;
                                    nano?: number | undefined;
                                } | undefined;
                                yield?: {
                                    currency?: string | undefined;
                                    units?: number | undefined;
                                    nano?: number | undefined;
                                } | undefined;
                                yieldRelative?: {
                                    units?: number | undefined;
                                    nano?: number | undefined;
                                } | undefined;
                            }[] | undefined;
                        } | undefined;
                        assetUid?: string | undefined;
                    }[] | undefined;
                } | undefined): GetOperationsByCursorResponse;
                fromPartial(object: {
                    hasNext?: boolean | undefined;
                    nextCursor?: string | undefined;
                    items?: {
                        cursor?: string | undefined;
                        brokerAccountId?: string | undefined;
                        id?: string | undefined;
                        parentOperationId?: string | undefined;
                        name?: string | undefined;
                        date?: Date | undefined;
                        type?: import("./operations").OperationType | undefined;
                        description?: string | undefined;
                        state?: import("./operations").OperationState | undefined;
                        instrumentUid?: string | undefined;
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        instrumentKind?: import("./common").InstrumentType | undefined;
                        positionUid?: string | undefined;
                        payment?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        price?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        commission?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        yield?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        yieldRelative?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        accruedInt?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        quantity?: number | undefined;
                        quantityRest?: number | undefined;
                        quantityDone?: number | undefined;
                        cancelDateTime?: Date | undefined;
                        cancelReason?: string | undefined;
                        tradesInfo?: {
                            trades?: {
                                num?: string | undefined;
                                date?: Date | undefined;
                                quantity?: number | undefined;
                                price?: {
                                    currency?: string | undefined;
                                    units?: number | undefined;
                                    nano?: number | undefined;
                                } | undefined;
                                yield?: {
                                    currency?: string | undefined;
                                    units?: number | undefined;
                                    nano?: number | undefined;
                                } | undefined;
                                yieldRelative?: {
                                    units?: number | undefined;
                                    nano?: number | undefined;
                                } | undefined;
                            }[] | undefined;
                        } | undefined;
                        assetUid?: string | undefined;
                    }[] | undefined;
                }): GetOperationsByCursorResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить портфель. */
        readonly getSandboxPortfolio: {
            readonly name: "GetSandboxPortfolio";
            readonly requestType: {
                encode(message: PortfolioRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PortfolioRequest;
                fromJSON(object: any): PortfolioRequest;
                toJSON(message: PortfolioRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    currency?: import("./operations").PortfolioRequest_CurrencyRequest | undefined;
                } | undefined): PortfolioRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    currency?: import("./operations").PortfolioRequest_CurrencyRequest | undefined;
                }): PortfolioRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PortfolioResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): PortfolioResponse;
                fromJSON(object: any): PortfolioResponse;
                toJSON(message: PortfolioResponse): unknown;
                create(base?: {
                    totalAmountShares?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountBonds?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountEtf?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountCurrencies?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountFutures?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    expectedYield?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    positions?: {
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        quantity?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYield?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        currentNkd?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPricePt?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        currentPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPriceFifo?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        quantityLots?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        blocked?: boolean | undefined;
                        blockedLots?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        varMargin?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYieldFifo?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                    }[] | undefined;
                    accountId?: string | undefined;
                    totalAmountOptions?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountSp?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountPortfolio?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    virtualPositions?: {
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        quantity?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYield?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYieldFifo?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expireDate?: Date | undefined;
                        currentPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPriceFifo?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                    }[] | undefined;
                } | undefined): PortfolioResponse;
                fromPartial(object: {
                    totalAmountShares?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountBonds?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountEtf?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountCurrencies?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountFutures?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    expectedYield?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    positions?: {
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        quantity?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYield?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        currentNkd?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPricePt?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        currentPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPriceFifo?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        quantityLots?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        blocked?: boolean | undefined;
                        blockedLots?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        varMargin?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYieldFifo?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                    }[] | undefined;
                    accountId?: string | undefined;
                    totalAmountOptions?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountSp?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    totalAmountPortfolio?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                    virtualPositions?: {
                        positionUid?: string | undefined;
                        instrumentUid?: string | undefined;
                        figi?: string | undefined;
                        instrumentType?: string | undefined;
                        quantity?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYield?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expectedYieldFifo?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        expireDate?: Date | undefined;
                        currentPrice?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        averagePositionPriceFifo?: {
                            currency?: string | undefined;
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                    }[] | undefined;
                }): PortfolioResponse;
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
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): WithdrawLimitsRequest;
                fromJSON(object: any): WithdrawLimitsRequest;
                toJSON(message: WithdrawLimitsRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                } | undefined): WithdrawLimitsRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                }): WithdrawLimitsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: WithdrawLimitsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): WithdrawLimitsResponse;
                fromJSON(object: any): WithdrawLimitsResponse;
                toJSON(message: WithdrawLimitsResponse): unknown;
                create(base?: {
                    money?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    blocked?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    blockedGuarantee?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                } | undefined): WithdrawLimitsResponse;
                fromPartial(object: {
                    money?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    blocked?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                    blockedGuarantee?: {
                        currency?: string | undefined;
                        units?: number | undefined;
                        nano?: number | undefined;
                    }[] | undefined;
                }): WithdrawLimitsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Расчёт количества доступных для покупки/продажи лотов в песочнице. */
        readonly getSandboxMaxLots: {
            readonly name: "GetSandboxMaxLots";
            readonly requestType: {
                encode(message: GetMaxLotsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetMaxLotsRequest;
                fromJSON(object: any): GetMaxLotsRequest;
                toJSON(message: GetMaxLotsRequest): unknown;
                create(base?: {
                    accountId?: string | undefined;
                    instrumentId?: string | undefined;
                    price?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                } | undefined): GetMaxLotsRequest;
                fromPartial(object: {
                    accountId?: string | undefined;
                    instrumentId?: string | undefined;
                    price?: {
                        units?: number | undefined;
                        nano?: number | undefined;
                    } | undefined;
                }): GetMaxLotsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetMaxLotsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: Uint8Array | _m0.Reader, length?: number | undefined): GetMaxLotsResponse;
                fromJSON(object: any): GetMaxLotsResponse;
                toJSON(message: GetMaxLotsResponse): unknown;
                create(base?: {
                    currency?: string | undefined;
                    buyLimits?: {
                        buyMoneyAmount?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        buyMaxLots?: number | undefined;
                        buyMaxMarketLots?: number | undefined;
                    } | undefined;
                    buyMarginLimits?: {
                        buyMoneyAmount?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        buyMaxLots?: number | undefined;
                        buyMaxMarketLots?: number | undefined;
                    } | undefined;
                    sellLimits?: {
                        sellMaxLots?: number | undefined;
                    } | undefined;
                    sellMarginLimits?: {
                        sellMaxLots?: number | undefined;
                    } | undefined;
                } | undefined): GetMaxLotsResponse;
                fromPartial(object: {
                    currency?: string | undefined;
                    buyLimits?: {
                        buyMoneyAmount?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        buyMaxLots?: number | undefined;
                        buyMaxMarketLots?: number | undefined;
                    } | undefined;
                    buyMarginLimits?: {
                        buyMoneyAmount?: {
                            units?: number | undefined;
                            nano?: number | undefined;
                        } | undefined;
                        buyMaxLots?: number | undefined;
                        buyMaxMarketLots?: number | undefined;
                    } | undefined;
                    sellLimits?: {
                        sellMaxLots?: number | undefined;
                    } | undefined;
                    sellMarginLimits?: {
                        sellMaxLots?: number | undefined;
                    } | undefined;
                }): GetMaxLotsResponse;
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
