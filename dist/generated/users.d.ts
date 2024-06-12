import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { MoneyValue, Quotation } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Тип счёта. */
export declare enum AccountType {
    /** ACCOUNT_TYPE_UNSPECIFIED - Тип аккаунта не определён. */
    ACCOUNT_TYPE_UNSPECIFIED = 0,
    /** ACCOUNT_TYPE_TINKOFF - Брокерский счёт Тинькофф. */
    ACCOUNT_TYPE_TINKOFF = 1,
    /** ACCOUNT_TYPE_TINKOFF_IIS - ИИС. */
    ACCOUNT_TYPE_TINKOFF_IIS = 2,
    /** ACCOUNT_TYPE_INVEST_BOX - Инвесткопилка. */
    ACCOUNT_TYPE_INVEST_BOX = 3,
    /** ACCOUNT_TYPE_INVEST_FUND - Фонд денежного рынка. */
    ACCOUNT_TYPE_INVEST_FUND = 4,
    UNRECOGNIZED = -1
}
export declare function accountTypeFromJSON(object: any): AccountType;
export declare function accountTypeToJSON(object: AccountType): string;
/** Статус счёта. */
export declare enum AccountStatus {
    /** ACCOUNT_STATUS_UNSPECIFIED - Статус счёта не определён. */
    ACCOUNT_STATUS_UNSPECIFIED = 0,
    /** ACCOUNT_STATUS_NEW - Новый, в процессе открытия. */
    ACCOUNT_STATUS_NEW = 1,
    /** ACCOUNT_STATUS_OPEN - Открытый и активный счёт. */
    ACCOUNT_STATUS_OPEN = 2,
    /** ACCOUNT_STATUS_CLOSED - Закрытый счёт. */
    ACCOUNT_STATUS_CLOSED = 3,
    UNRECOGNIZED = -1
}
export declare function accountStatusFromJSON(object: any): AccountStatus;
export declare function accountStatusToJSON(object: AccountStatus): string;
/** Уровень доступа к счёту. */
export declare enum AccessLevel {
    /** ACCOUNT_ACCESS_LEVEL_UNSPECIFIED - Уровень доступа не определён. */
    ACCOUNT_ACCESS_LEVEL_UNSPECIFIED = 0,
    /** ACCOUNT_ACCESS_LEVEL_FULL_ACCESS - Полный доступ к счёту. */
    ACCOUNT_ACCESS_LEVEL_FULL_ACCESS = 1,
    /** ACCOUNT_ACCESS_LEVEL_READ_ONLY - Доступ с уровнем прав «только чтение». */
    ACCOUNT_ACCESS_LEVEL_READ_ONLY = 2,
    /** ACCOUNT_ACCESS_LEVEL_NO_ACCESS - Доступа нет. */
    ACCOUNT_ACCESS_LEVEL_NO_ACCESS = 3,
    UNRECOGNIZED = -1
}
export declare function accessLevelFromJSON(object: any): AccessLevel;
export declare function accessLevelToJSON(object: AccessLevel): string;
/** Запрос получения счетов пользователя. */
export interface GetAccountsRequest {
}
/** Список счетов пользователя. */
export interface GetAccountsResponse {
    /** Массив счетов клиента. */
    accounts: Account[];
}
/** Информация о счёте. */
export interface Account {
    /** Идентификатор счёта. */
    id: string;
    /** Тип счёта. */
    type: AccountType;
    /** Название счёта. */
    name: string;
    /** Статус счёта. */
    status: AccountStatus;
    /** Дата открытия счёта в часовом поясе UTC. */
    openedDate: Date | undefined;
    /** Дата закрытия счёта в часовом поясе UTC. */
    closedDate: Date | undefined;
    /** Уровень доступа к текущему счёту (определяется токеном). */
    accessLevel: AccessLevel;
}
/** Запрос маржинальных показателей по счёту. */
export interface GetMarginAttributesRequest {
    /** Идентификатор счёта пользователя. */
    accountId: string;
}
/** Маржинальные показатели по счёту. */
export interface GetMarginAttributesResponse {
    /** Ликвидная стоимость портфеля. [Подробнее про ликвидный портфель](https://help.tinkoff.ru/margin-trade/short/liquid-portfolio/). */
    liquidPortfolio: MoneyValue | undefined;
    /** Начальная маржа — начальное обеспечение для совершения новой сделки. [Подробнее про начальную и минимальную маржу](https://help.tinkoff.ru/margin-trade/short/initial-and-maintenance-margin/). */
    startingMargin: MoneyValue | undefined;
    /** Минимальная маржа — это минимальное обеспечение для поддержания позиции, которую вы уже открыли. [Подробнее про начальную и минимальную маржу](https://help.tinkoff.ru/margin-trade/short/initial-and-maintenance-margin/). */
    minimalMargin: MoneyValue | undefined;
    /** Уровень достаточности средств. Соотношение стоимости ликвидного портфеля к начальной марже. */
    fundsSufficiencyLevel: Quotation | undefined;
    /** Объем недостающих средств. Разница между стартовой маржой и ликвидной стоимости портфеля. */
    amountOfMissingFunds: MoneyValue | undefined;
    /** Скорректированная маржа. Начальная маржа, в которой плановые позиции рассчитываются с учётом активных заявок на покупку позиций лонг или продажу позиций шорт. */
    correctedMargin: MoneyValue | undefined;
}
/** Запрос текущих лимитов пользователя. */
export interface GetUserTariffRequest {
}
/** Текущие лимиты пользователя. */
export interface GetUserTariffResponse {
    /** Массив лимитов пользователя по unary-запросам. */
    unaryLimits: UnaryLimit[];
    /** Массив лимитов пользователей для stream-соединений. */
    streamLimits: StreamLimit[];
}
/** Лимит unary-методов. */
export interface UnaryLimit {
    /** Количество unary-запросов в минуту. */
    limitPerMinute: number;
    /** Названия методов. */
    methods: string[];
}
/** Лимит stream-соединений. */
export interface StreamLimit {
    /** Максимальное количество stream-соединений. */
    limit: number;
    /** Названия stream-методов. */
    streams: string[];
    /** Текущее количество открытых stream-соединений. */
    open: number;
}
/** Запрос информации о пользователе. */
export interface GetInfoRequest {
}
/** Информация о пользователе. */
export interface GetInfoResponse {
    /** Признак премиум клиента. */
    premStatus: boolean;
    /** Признак квалифицированного инвестора. */
    qualStatus: boolean;
    /** Набор требующих тестирования инструментов и возможностей, с которыми может работать пользователь. [Подробнее](https://russianinvestments.github.io/investAPI/faq_users/). */
    qualifiedForWorkWith: string[];
    /** Наименование тарифа пользователя. */
    tariff: string;
}
export declare const GetAccountsRequest: {
    encode(_: GetAccountsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAccountsRequest;
    fromJSON(_: any): GetAccountsRequest;
    toJSON(_: GetAccountsRequest): unknown;
    create(base?: DeepPartial<GetAccountsRequest>): GetAccountsRequest;
    fromPartial(_: DeepPartial<GetAccountsRequest>): GetAccountsRequest;
};
export declare const GetAccountsResponse: {
    encode(message: GetAccountsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetAccountsResponse;
    fromJSON(object: any): GetAccountsResponse;
    toJSON(message: GetAccountsResponse): unknown;
    create(base?: DeepPartial<GetAccountsResponse>): GetAccountsResponse;
    fromPartial(object: DeepPartial<GetAccountsResponse>): GetAccountsResponse;
};
export declare const Account: {
    encode(message: Account, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Account;
    fromJSON(object: any): Account;
    toJSON(message: Account): unknown;
    create(base?: DeepPartial<Account>): Account;
    fromPartial(object: DeepPartial<Account>): Account;
};
export declare const GetMarginAttributesRequest: {
    encode(message: GetMarginAttributesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMarginAttributesRequest;
    fromJSON(object: any): GetMarginAttributesRequest;
    toJSON(message: GetMarginAttributesRequest): unknown;
    create(base?: DeepPartial<GetMarginAttributesRequest>): GetMarginAttributesRequest;
    fromPartial(object: DeepPartial<GetMarginAttributesRequest>): GetMarginAttributesRequest;
};
export declare const GetMarginAttributesResponse: {
    encode(message: GetMarginAttributesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetMarginAttributesResponse;
    fromJSON(object: any): GetMarginAttributesResponse;
    toJSON(message: GetMarginAttributesResponse): unknown;
    create(base?: DeepPartial<GetMarginAttributesResponse>): GetMarginAttributesResponse;
    fromPartial(object: DeepPartial<GetMarginAttributesResponse>): GetMarginAttributesResponse;
};
export declare const GetUserTariffRequest: {
    encode(_: GetUserTariffRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetUserTariffRequest;
    fromJSON(_: any): GetUserTariffRequest;
    toJSON(_: GetUserTariffRequest): unknown;
    create(base?: DeepPartial<GetUserTariffRequest>): GetUserTariffRequest;
    fromPartial(_: DeepPartial<GetUserTariffRequest>): GetUserTariffRequest;
};
export declare const GetUserTariffResponse: {
    encode(message: GetUserTariffResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetUserTariffResponse;
    fromJSON(object: any): GetUserTariffResponse;
    toJSON(message: GetUserTariffResponse): unknown;
    create(base?: DeepPartial<GetUserTariffResponse>): GetUserTariffResponse;
    fromPartial(object: DeepPartial<GetUserTariffResponse>): GetUserTariffResponse;
};
export declare const UnaryLimit: {
    encode(message: UnaryLimit, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UnaryLimit;
    fromJSON(object: any): UnaryLimit;
    toJSON(message: UnaryLimit): unknown;
    create(base?: DeepPartial<UnaryLimit>): UnaryLimit;
    fromPartial(object: DeepPartial<UnaryLimit>): UnaryLimit;
};
export declare const StreamLimit: {
    encode(message: StreamLimit, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StreamLimit;
    fromJSON(object: any): StreamLimit;
    toJSON(message: StreamLimit): unknown;
    create(base?: DeepPartial<StreamLimit>): StreamLimit;
    fromPartial(object: DeepPartial<StreamLimit>): StreamLimit;
};
export declare const GetInfoRequest: {
    encode(_: GetInfoRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetInfoRequest;
    fromJSON(_: any): GetInfoRequest;
    toJSON(_: GetInfoRequest): unknown;
    create(base?: DeepPartial<GetInfoRequest>): GetInfoRequest;
    fromPartial(_: DeepPartial<GetInfoRequest>): GetInfoRequest;
};
export declare const GetInfoResponse: {
    encode(message: GetInfoResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetInfoResponse;
    fromJSON(object: any): GetInfoResponse;
    toJSON(message: GetInfoResponse): unknown;
    create(base?: DeepPartial<GetInfoResponse>): GetInfoResponse;
    fromPartial(object: DeepPartial<GetInfoResponse>): GetInfoResponse;
};
/**
 * С помощью сервиса можно получить: </br> 1.
 * список счетов пользователя; </br> 2. маржинальные показатели по счёту.
 */
export type UsersServiceDefinition = typeof UsersServiceDefinition;
export declare const UsersServiceDefinition: {
    readonly name: "UsersService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.UsersService";
    readonly methods: {
        /** Получить счета пользователя. */
        readonly getAccounts: {
            readonly name: "GetAccounts";
            readonly requestType: {
                encode(_: GetAccountsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAccountsRequest;
                fromJSON(_: any): GetAccountsRequest;
                toJSON(_: GetAccountsRequest): unknown;
                create(base?: DeepPartial<GetAccountsRequest>): GetAccountsRequest;
                fromPartial(_: DeepPartial<GetAccountsRequest>): GetAccountsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetAccountsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetAccountsResponse;
                fromJSON(object: any): GetAccountsResponse;
                toJSON(message: GetAccountsResponse): unknown;
                create(base?: DeepPartial<GetAccountsResponse>): GetAccountsResponse;
                fromPartial(object: DeepPartial<GetAccountsResponse>): GetAccountsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Рассчитать маржинальные показатели по счёту. */
        readonly getMarginAttributes: {
            readonly name: "GetMarginAttributes";
            readonly requestType: {
                encode(message: GetMarginAttributesRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetMarginAttributesRequest;
                fromJSON(object: any): GetMarginAttributesRequest;
                toJSON(message: GetMarginAttributesRequest): unknown;
                create(base?: DeepPartial<GetMarginAttributesRequest>): GetMarginAttributesRequest;
                fromPartial(object: DeepPartial<GetMarginAttributesRequest>): GetMarginAttributesRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetMarginAttributesResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetMarginAttributesResponse;
                fromJSON(object: any): GetMarginAttributesResponse;
                toJSON(message: GetMarginAttributesResponse): unknown;
                create(base?: DeepPartial<GetMarginAttributesResponse>): GetMarginAttributesResponse;
                fromPartial(object: DeepPartial<GetMarginAttributesResponse>): GetMarginAttributesResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Запросить тариф пользователя. */
        readonly getUserTariff: {
            readonly name: "GetUserTariff";
            readonly requestType: {
                encode(_: GetUserTariffRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetUserTariffRequest;
                fromJSON(_: any): GetUserTariffRequest;
                toJSON(_: GetUserTariffRequest): unknown;
                create(base?: DeepPartial<GetUserTariffRequest>): GetUserTariffRequest;
                fromPartial(_: DeepPartial<GetUserTariffRequest>): GetUserTariffRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetUserTariffResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetUserTariffResponse;
                fromJSON(object: any): GetUserTariffResponse;
                toJSON(message: GetUserTariffResponse): unknown;
                create(base?: DeepPartial<GetUserTariffResponse>): GetUserTariffResponse;
                fromPartial(object: DeepPartial<GetUserTariffResponse>): GetUserTariffResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Получить информацию о пользователе. */
        readonly getInfo: {
            readonly name: "GetInfo";
            readonly requestType: {
                encode(_: GetInfoRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetInfoRequest;
                fromJSON(_: any): GetInfoRequest;
                toJSON(_: GetInfoRequest): unknown;
                create(base?: DeepPartial<GetInfoRequest>): GetInfoRequest;
                fromPartial(_: DeepPartial<GetInfoRequest>): GetInfoRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetInfoResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetInfoResponse;
                fromJSON(object: any): GetInfoResponse;
                toJSON(message: GetInfoResponse): unknown;
                create(base?: DeepPartial<GetInfoResponse>): GetInfoResponse;
                fromPartial(object: DeepPartial<GetInfoResponse>): GetInfoResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface UsersServiceImplementation<CallContextExt = {}> {
    /** Получить счета пользователя. */
    getAccounts(request: GetAccountsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetAccountsResponse>>;
    /** Рассчитать маржинальные показатели по счёту. */
    getMarginAttributes(request: GetMarginAttributesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetMarginAttributesResponse>>;
    /** Запросить тариф пользователя. */
    getUserTariff(request: GetUserTariffRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetUserTariffResponse>>;
    /** Получить информацию о пользователе. */
    getInfo(request: GetInfoRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetInfoResponse>>;
}
export interface UsersServiceClient<CallOptionsExt = {}> {
    /** Получить счета пользователя. */
    getAccounts(request: DeepPartial<GetAccountsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetAccountsResponse>;
    /** Рассчитать маржинальные показатели по счёту. */
    getMarginAttributes(request: DeepPartial<GetMarginAttributesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetMarginAttributesResponse>;
    /** Запросить тариф пользователя. */
    getUserTariff(request: DeepPartial<GetUserTariffRequest>, options?: CallOptions & CallOptionsExt): Promise<GetUserTariffResponse>;
    /** Получить информацию о пользователе. */
    getInfo(request: DeepPartial<GetInfoRequest>, options?: CallOptions & CallOptionsExt): Promise<GetInfoResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
