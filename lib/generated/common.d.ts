import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Тип инструмента. */
export declare enum InstrumentType {
    INSTRUMENT_TYPE_UNSPECIFIED = 0,
    /** INSTRUMENT_TYPE_BOND - Облигация. */
    INSTRUMENT_TYPE_BOND = 1,
    /** INSTRUMENT_TYPE_SHARE - Акция. */
    INSTRUMENT_TYPE_SHARE = 2,
    /** INSTRUMENT_TYPE_CURRENCY - Валюта. */
    INSTRUMENT_TYPE_CURRENCY = 3,
    /** INSTRUMENT_TYPE_ETF - Exchange-traded fund. Фонд. */
    INSTRUMENT_TYPE_ETF = 4,
    /** INSTRUMENT_TYPE_FUTURES - Фьючерс. */
    INSTRUMENT_TYPE_FUTURES = 5,
    /** INSTRUMENT_TYPE_SP - Структурная нота. */
    INSTRUMENT_TYPE_SP = 6,
    /** INSTRUMENT_TYPE_OPTION - Опцион. */
    INSTRUMENT_TYPE_OPTION = 7,
    /** INSTRUMENT_TYPE_CLEARING_CERTIFICATE - Clearing certificate. */
    INSTRUMENT_TYPE_CLEARING_CERTIFICATE = 8,
    /** INSTRUMENT_TYPE_INDEX - Индекс. */
    INSTRUMENT_TYPE_INDEX = 9,
    /** INSTRUMENT_TYPE_COMMODITY - Товар. */
    INSTRUMENT_TYPE_COMMODITY = 10,
    UNRECOGNIZED = -1
}
export declare function instrumentTypeFromJSON(object: any): InstrumentType;
export declare function instrumentTypeToJSON(object: InstrumentType): string;
/** Режим торгов инструмента */
export declare enum SecurityTradingStatus {
    /** SECURITY_TRADING_STATUS_UNSPECIFIED - Торговый статус не определён. */
    SECURITY_TRADING_STATUS_UNSPECIFIED = 0,
    /** SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING - Недоступен для торгов. */
    SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING = 1,
    /** SECURITY_TRADING_STATUS_OPENING_PERIOD - Период открытия торгов. */
    SECURITY_TRADING_STATUS_OPENING_PERIOD = 2,
    /** SECURITY_TRADING_STATUS_CLOSING_PERIOD - Период закрытия торгов. */
    SECURITY_TRADING_STATUS_CLOSING_PERIOD = 3,
    /** SECURITY_TRADING_STATUS_BREAK_IN_TRADING - Перерыв в торговле. */
    SECURITY_TRADING_STATUS_BREAK_IN_TRADING = 4,
    /** SECURITY_TRADING_STATUS_NORMAL_TRADING - Нормальная торговля. */
    SECURITY_TRADING_STATUS_NORMAL_TRADING = 5,
    /** SECURITY_TRADING_STATUS_CLOSING_AUCTION - Аукцион закрытия. */
    SECURITY_TRADING_STATUS_CLOSING_AUCTION = 6,
    /** SECURITY_TRADING_STATUS_DARK_POOL_AUCTION - Аукцион крупных пакетов. */
    SECURITY_TRADING_STATUS_DARK_POOL_AUCTION = 7,
    /** SECURITY_TRADING_STATUS_DISCRETE_AUCTION - Дискретный аукцион. */
    SECURITY_TRADING_STATUS_DISCRETE_AUCTION = 8,
    /** SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD - Аукцион открытия. */
    SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD = 9,
    /** SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE - Период торгов по цене аукциона закрытия. */
    SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE = 10,
    /** SECURITY_TRADING_STATUS_SESSION_ASSIGNED - Сессия назначена. */
    SECURITY_TRADING_STATUS_SESSION_ASSIGNED = 11,
    /** SECURITY_TRADING_STATUS_SESSION_CLOSE - Сессия закрыта. */
    SECURITY_TRADING_STATUS_SESSION_CLOSE = 12,
    /** SECURITY_TRADING_STATUS_SESSION_OPEN - Сессия открыта. */
    SECURITY_TRADING_STATUS_SESSION_OPEN = 13,
    /** SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING - Доступна торговля в режиме внутренней ликвидности брокера. */
    SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING = 14,
    /** SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING - Перерыв торговли в режиме внутренней ликвидности брокера. */
    SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING = 15,
    /** SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING - Недоступна торговля в режиме внутренней ликвидности брокера. */
    SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING = 16,
    UNRECOGNIZED = -1
}
export declare function securityTradingStatusFromJSON(object: any): SecurityTradingStatus;
export declare function securityTradingStatusToJSON(object: SecurityTradingStatus): string;
/** Тип цены. */
export declare enum PriceType {
    /** PRICE_TYPE_UNSPECIFIED - Значение не определено. */
    PRICE_TYPE_UNSPECIFIED = 0,
    /** PRICE_TYPE_POINT - Цена в пунктах (только для фьючерсов и облигаций). */
    PRICE_TYPE_POINT = 1,
    /** PRICE_TYPE_CURRENCY - Цена в валюте расчётов по инструменту. */
    PRICE_TYPE_CURRENCY = 2,
    UNRECOGNIZED = -1
}
export declare function priceTypeFromJSON(object: any): PriceType;
export declare function priceTypeToJSON(object: PriceType): string;
export declare enum ResultSubscriptionStatus {
    /** RESULT_SUBSCRIPTION_STATUS_UNSPECIFIED - Статус подписки не определен. */
    RESULT_SUBSCRIPTION_STATUS_UNSPECIFIED = 0,
    /** RESULT_SUBSCRIPTION_STATUS_OK - Подписка успешно установлена. */
    RESULT_SUBSCRIPTION_STATUS_OK = 1,
    /** RESULT_SUBSCRIPTION_STATUS_ERROR - Ошибка подписки */
    RESULT_SUBSCRIPTION_STATUS_ERROR = 13,
    UNRECOGNIZED = -1
}
export declare function resultSubscriptionStatusFromJSON(object: any): ResultSubscriptionStatus;
export declare function resultSubscriptionStatusToJSON(object: ResultSubscriptionStatus): string;
/** Денежная сумма в определённой валюте. */
export interface MoneyValue {
    /** Строковый ISO-код валюты. */
    currency: string;
    /** Целая часть суммы, может быть отрицательным числом. */
    units: number;
    /** Дробная часть суммы, может быть отрицательным числом. */
    nano: number;
}
/** Котировка — денежная сумма без указания валюты. */
export interface Quotation {
    /** Целая часть суммы, может быть отрицательным числом. */
    units: number;
    /** Дробная часть суммы, может быть отрицательным числом. */
    nano: number;
}
/** Проверка активности стрима. */
export interface Ping {
    /** Время проверки. */
    time: Date | undefined;
    /** Идентификатор соединения. */
    streamId: string;
}
export interface Page {
    /** Максимальное число возвращаемых записей. */
    limit: number;
    /** Порядковый номер страницы, начиная с 0. */
    pageNumber: number;
}
export interface PageResponse {
    /** Максимальное число возвращаемых записей. */
    limit: number;
    /** Порядковый номер страницы, начиная с 0. */
    pageNumber: number;
    /** Общее количество записей. */
    totalCount: number;
}
export interface ResponseMetadata {
    /** Идентификатор трекинга. */
    trackingId: string;
    /** Серверное время. */
    serverTime: Date | undefined;
}
export interface BrandData {
    /** Логотип инструмента. Имя файла для получения логотипа. */
    logoName: string;
    /** Цвет бренда. */
    logoBaseColor: string;
    /** Цвет текста для цвета логотипа бренда. */
    textColor: string;
}
export interface ErrorDetail {
    /** Код ошибки. */
    code: string;
    /** Описание ошибки. */
    message: string;
}
export declare const MoneyValue: {
    encode(message: MoneyValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MoneyValue;
    fromJSON(object: any): MoneyValue;
    toJSON(message: MoneyValue): unknown;
    create(base?: DeepPartial<MoneyValue>): MoneyValue;
    fromPartial(object: DeepPartial<MoneyValue>): MoneyValue;
};
export declare const Quotation: {
    encode(message: Quotation, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Quotation;
    fromJSON(object: any): Quotation;
    toJSON(message: Quotation): unknown;
    create(base?: DeepPartial<Quotation>): Quotation;
    fromPartial(object: DeepPartial<Quotation>): Quotation;
};
export declare const Ping: {
    encode(message: Ping, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Ping;
    fromJSON(object: any): Ping;
    toJSON(message: Ping): unknown;
    create(base?: DeepPartial<Ping>): Ping;
    fromPartial(object: DeepPartial<Ping>): Ping;
};
export declare const Page: {
    encode(message: Page, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Page;
    fromJSON(object: any): Page;
    toJSON(message: Page): unknown;
    create(base?: DeepPartial<Page>): Page;
    fromPartial(object: DeepPartial<Page>): Page;
};
export declare const PageResponse: {
    encode(message: PageResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PageResponse;
    fromJSON(object: any): PageResponse;
    toJSON(message: PageResponse): unknown;
    create(base?: DeepPartial<PageResponse>): PageResponse;
    fromPartial(object: DeepPartial<PageResponse>): PageResponse;
};
export declare const ResponseMetadata: {
    encode(message: ResponseMetadata, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ResponseMetadata;
    fromJSON(object: any): ResponseMetadata;
    toJSON(message: ResponseMetadata): unknown;
    create(base?: DeepPartial<ResponseMetadata>): ResponseMetadata;
    fromPartial(object: DeepPartial<ResponseMetadata>): ResponseMetadata;
};
export declare const BrandData: {
    encode(message: BrandData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BrandData;
    fromJSON(object: any): BrandData;
    toJSON(message: BrandData): unknown;
    create(base?: DeepPartial<BrandData>): BrandData;
    fromPartial(object: DeepPartial<BrandData>): BrandData;
};
export declare const ErrorDetail: {
    encode(message: ErrorDetail, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ErrorDetail;
    fromJSON(object: any): ErrorDetail;
    toJSON(message: ErrorDetail): unknown;
    create(base?: DeepPartial<ErrorDetail>): ErrorDetail;
    fromPartial(object: DeepPartial<ErrorDetail>): ErrorDetail;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
