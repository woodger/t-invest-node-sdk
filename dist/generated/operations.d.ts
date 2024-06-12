import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { InstrumentType, MoneyValue, Ping, Quotation } from "./common";
export declare const protobufPackage = "tinkoff.public.invest.api.contract.v1";
/** Статус запрашиваемых операций. */
export declare enum OperationState {
    /** OPERATION_STATE_UNSPECIFIED - Статус операции не определён */
    OPERATION_STATE_UNSPECIFIED = 0,
    /** OPERATION_STATE_EXECUTED - Исполнена частично или полностью. */
    OPERATION_STATE_EXECUTED = 1,
    /** OPERATION_STATE_CANCELED - Отменена. */
    OPERATION_STATE_CANCELED = 2,
    /** OPERATION_STATE_PROGRESS - Исполняется. */
    OPERATION_STATE_PROGRESS = 3,
    UNRECOGNIZED = -1
}
export declare function operationStateFromJSON(object: any): OperationState;
export declare function operationStateToJSON(object: OperationState): string;
/** Тип операции. */
export declare enum OperationType {
    /** OPERATION_TYPE_UNSPECIFIED - Тип операции не определён. */
    OPERATION_TYPE_UNSPECIFIED = 0,
    /** OPERATION_TYPE_INPUT - Пополнение брокерского счёта. */
    OPERATION_TYPE_INPUT = 1,
    /** OPERATION_TYPE_BOND_TAX - Удержание НДФЛ по купонам. */
    OPERATION_TYPE_BOND_TAX = 2,
    /** OPERATION_TYPE_OUTPUT_SECURITIES - Вывод ЦБ. */
    OPERATION_TYPE_OUTPUT_SECURITIES = 3,
    /** OPERATION_TYPE_OVERNIGHT - Доход по сделке РЕПО овернайт. */
    OPERATION_TYPE_OVERNIGHT = 4,
    /** OPERATION_TYPE_TAX - Удержание налога. */
    OPERATION_TYPE_TAX = 5,
    /** OPERATION_TYPE_BOND_REPAYMENT_FULL - Полное погашение облигаций. */
    OPERATION_TYPE_BOND_REPAYMENT_FULL = 6,
    /** OPERATION_TYPE_SELL_CARD - Продажа ЦБ с карты. */
    OPERATION_TYPE_SELL_CARD = 7,
    /** OPERATION_TYPE_DIVIDEND_TAX - Удержание налога по дивидендам. */
    OPERATION_TYPE_DIVIDEND_TAX = 8,
    /** OPERATION_TYPE_OUTPUT - Вывод денежных средств. */
    OPERATION_TYPE_OUTPUT = 9,
    /** OPERATION_TYPE_BOND_REPAYMENT - Частичное погашение облигаций. */
    OPERATION_TYPE_BOND_REPAYMENT = 10,
    /** OPERATION_TYPE_TAX_CORRECTION - Корректировка налога. */
    OPERATION_TYPE_TAX_CORRECTION = 11,
    /** OPERATION_TYPE_SERVICE_FEE - Удержание комиссии за обслуживание брокерского счёта. */
    OPERATION_TYPE_SERVICE_FEE = 12,
    /** OPERATION_TYPE_BENEFIT_TAX - Удержание налога за материальную выгоду. */
    OPERATION_TYPE_BENEFIT_TAX = 13,
    /** OPERATION_TYPE_MARGIN_FEE - Удержание комиссии за непокрытую позицию. */
    OPERATION_TYPE_MARGIN_FEE = 14,
    /** OPERATION_TYPE_BUY - Покупка ЦБ. */
    OPERATION_TYPE_BUY = 15,
    /** OPERATION_TYPE_BUY_CARD - Покупка ЦБ с карты. */
    OPERATION_TYPE_BUY_CARD = 16,
    /** OPERATION_TYPE_INPUT_SECURITIES - Перевод ценных бумаг из другого депозитария. */
    OPERATION_TYPE_INPUT_SECURITIES = 17,
    /** OPERATION_TYPE_SELL_MARGIN - Продажа в результате Margin-call. */
    OPERATION_TYPE_SELL_MARGIN = 18,
    /** OPERATION_TYPE_BROKER_FEE - Удержание комиссии за операцию. */
    OPERATION_TYPE_BROKER_FEE = 19,
    /** OPERATION_TYPE_BUY_MARGIN - Покупка в результате Margin-call. */
    OPERATION_TYPE_BUY_MARGIN = 20,
    /** OPERATION_TYPE_DIVIDEND - Выплата дивидендов. */
    OPERATION_TYPE_DIVIDEND = 21,
    /** OPERATION_TYPE_SELL - Продажа ЦБ. */
    OPERATION_TYPE_SELL = 22,
    /** OPERATION_TYPE_COUPON - Выплата купонов. */
    OPERATION_TYPE_COUPON = 23,
    /** OPERATION_TYPE_SUCCESS_FEE - Удержание комиссии SuccessFee. */
    OPERATION_TYPE_SUCCESS_FEE = 24,
    /** OPERATION_TYPE_DIVIDEND_TRANSFER - Передача дивидендного дохода. */
    OPERATION_TYPE_DIVIDEND_TRANSFER = 25,
    /** OPERATION_TYPE_ACCRUING_VARMARGIN - Зачисление вариационной маржи. */
    OPERATION_TYPE_ACCRUING_VARMARGIN = 26,
    /** OPERATION_TYPE_WRITING_OFF_VARMARGIN - Списание вариационной маржи. */
    OPERATION_TYPE_WRITING_OFF_VARMARGIN = 27,
    /** OPERATION_TYPE_DELIVERY_BUY - Покупка в рамках экспирации фьючерсного контракта. */
    OPERATION_TYPE_DELIVERY_BUY = 28,
    /** OPERATION_TYPE_DELIVERY_SELL - Продажа в рамках экспирации фьючерсного контракта. */
    OPERATION_TYPE_DELIVERY_SELL = 29,
    /** OPERATION_TYPE_TRACK_MFEE - Комиссия за управление по счёту автоследования. */
    OPERATION_TYPE_TRACK_MFEE = 30,
    /** OPERATION_TYPE_TRACK_PFEE - Комиссия за результат по счёту автоследования. */
    OPERATION_TYPE_TRACK_PFEE = 31,
    /** OPERATION_TYPE_TAX_PROGRESSIVE - Удержание налога по ставке 15%. */
    OPERATION_TYPE_TAX_PROGRESSIVE = 32,
    /** OPERATION_TYPE_BOND_TAX_PROGRESSIVE - Удержание налога по купонам по ставке 15%. */
    OPERATION_TYPE_BOND_TAX_PROGRESSIVE = 33,
    /** OPERATION_TYPE_DIVIDEND_TAX_PROGRESSIVE - Удержание налога по дивидендам по ставке 15%. */
    OPERATION_TYPE_DIVIDEND_TAX_PROGRESSIVE = 34,
    /** OPERATION_TYPE_BENEFIT_TAX_PROGRESSIVE - Удержание налога за материальную выгоду по ставке 15%. */
    OPERATION_TYPE_BENEFIT_TAX_PROGRESSIVE = 35,
    /** OPERATION_TYPE_TAX_CORRECTION_PROGRESSIVE - Корректировка налога по ставке 15%. */
    OPERATION_TYPE_TAX_CORRECTION_PROGRESSIVE = 36,
    /** OPERATION_TYPE_TAX_REPO_PROGRESSIVE - Удержание налога за возмещение по сделкам РЕПО по ставке 15%. */
    OPERATION_TYPE_TAX_REPO_PROGRESSIVE = 37,
    /** OPERATION_TYPE_TAX_REPO - Удержание налога за возмещение по сделкам РЕПО. */
    OPERATION_TYPE_TAX_REPO = 38,
    /** OPERATION_TYPE_TAX_REPO_HOLD - Удержание налога по сделкам РЕПО. */
    OPERATION_TYPE_TAX_REPO_HOLD = 39,
    /** OPERATION_TYPE_TAX_REPO_REFUND - Возврат налога по сделкам РЕПО. */
    OPERATION_TYPE_TAX_REPO_REFUND = 40,
    /** OPERATION_TYPE_TAX_REPO_HOLD_PROGRESSIVE - Удержание налога по сделкам РЕПО по ставке 15%. */
    OPERATION_TYPE_TAX_REPO_HOLD_PROGRESSIVE = 41,
    /** OPERATION_TYPE_TAX_REPO_REFUND_PROGRESSIVE - Возврат налога по сделкам РЕПО по ставке 15%. */
    OPERATION_TYPE_TAX_REPO_REFUND_PROGRESSIVE = 42,
    /** OPERATION_TYPE_DIV_EXT - Выплата дивидендов на карту. */
    OPERATION_TYPE_DIV_EXT = 43,
    /** OPERATION_TYPE_TAX_CORRECTION_COUPON - Корректировка налога по купонам. */
    OPERATION_TYPE_TAX_CORRECTION_COUPON = 44,
    /** OPERATION_TYPE_CASH_FEE - Комиссия за валютный остаток. */
    OPERATION_TYPE_CASH_FEE = 45,
    /** OPERATION_TYPE_OUT_FEE - Комиссия за вывод валюты с брокерского счета. */
    OPERATION_TYPE_OUT_FEE = 46,
    /** OPERATION_TYPE_OUT_STAMP_DUTY - Гербовый сбор. */
    OPERATION_TYPE_OUT_STAMP_DUTY = 47,
    /** OPERATION_TYPE_OUTPUT_SWIFT - SWIFT-перевод */
    OPERATION_TYPE_OUTPUT_SWIFT = 50,
    /** OPERATION_TYPE_INPUT_SWIFT - SWIFT-перевод */
    OPERATION_TYPE_INPUT_SWIFT = 51,
    /** OPERATION_TYPE_OUTPUT_ACQUIRING - Перевод на карту */
    OPERATION_TYPE_OUTPUT_ACQUIRING = 53,
    /** OPERATION_TYPE_INPUT_ACQUIRING - Перевод с карты */
    OPERATION_TYPE_INPUT_ACQUIRING = 54,
    /** OPERATION_TYPE_OUTPUT_PENALTY - Комиссия за вывод средств */
    OPERATION_TYPE_OUTPUT_PENALTY = 55,
    /** OPERATION_TYPE_ADVICE_FEE - Списание оплаты за сервис Советов */
    OPERATION_TYPE_ADVICE_FEE = 56,
    /** OPERATION_TYPE_TRANS_IIS_BS - Перевод ценных бумаг с ИИС на Брокерский счет */
    OPERATION_TYPE_TRANS_IIS_BS = 57,
    /** OPERATION_TYPE_TRANS_BS_BS - Перевод ценных бумаг с одного брокерского счета на другой */
    OPERATION_TYPE_TRANS_BS_BS = 58,
    /** OPERATION_TYPE_OUT_MULTI - Вывод денежных средств со счета */
    OPERATION_TYPE_OUT_MULTI = 59,
    /** OPERATION_TYPE_INP_MULTI - Пополнение денежных средств со счета */
    OPERATION_TYPE_INP_MULTI = 60,
    /** OPERATION_TYPE_OVER_PLACEMENT - Размещение биржевого овернайта */
    OPERATION_TYPE_OVER_PLACEMENT = 61,
    /** OPERATION_TYPE_OVER_COM - Списание комиссии */
    OPERATION_TYPE_OVER_COM = 62,
    /** OPERATION_TYPE_OVER_INCOME - Доход от оверанайта */
    OPERATION_TYPE_OVER_INCOME = 63,
    /** OPERATION_TYPE_OPTION_EXPIRATION - Экспирация опциона */
    OPERATION_TYPE_OPTION_EXPIRATION = 64,
    /** OPERATION_TYPE_FUTURE_EXPIRATION - Экспирация фьючерса */
    OPERATION_TYPE_FUTURE_EXPIRATION = 65,
    UNRECOGNIZED = -1
}
export declare function operationTypeFromJSON(object: any): OperationType;
export declare function operationTypeToJSON(object: OperationType): string;
/** Результат подписки. */
export declare enum PortfolioSubscriptionStatus {
    /** PORTFOLIO_SUBSCRIPTION_STATUS_UNSPECIFIED - Тип не определён. */
    PORTFOLIO_SUBSCRIPTION_STATUS_UNSPECIFIED = 0,
    /** PORTFOLIO_SUBSCRIPTION_STATUS_SUCCESS - Успешно. */
    PORTFOLIO_SUBSCRIPTION_STATUS_SUCCESS = 1,
    /** PORTFOLIO_SUBSCRIPTION_STATUS_ACCOUNT_NOT_FOUND - Счёт не найден или недостаточно прав. */
    PORTFOLIO_SUBSCRIPTION_STATUS_ACCOUNT_NOT_FOUND = 2,
    /** PORTFOLIO_SUBSCRIPTION_STATUS_INTERNAL_ERROR - Произошла ошибка. */
    PORTFOLIO_SUBSCRIPTION_STATUS_INTERNAL_ERROR = 3,
    UNRECOGNIZED = -1
}
export declare function portfolioSubscriptionStatusFromJSON(object: any): PortfolioSubscriptionStatus;
export declare function portfolioSubscriptionStatusToJSON(object: PortfolioSubscriptionStatus): string;
/** Результат подписки. */
export declare enum PositionsAccountSubscriptionStatus {
    /** POSITIONS_SUBSCRIPTION_STATUS_UNSPECIFIED - Тип не определён. */
    POSITIONS_SUBSCRIPTION_STATUS_UNSPECIFIED = 0,
    /** POSITIONS_SUBSCRIPTION_STATUS_SUCCESS - Успешно. */
    POSITIONS_SUBSCRIPTION_STATUS_SUCCESS = 1,
    /** POSITIONS_SUBSCRIPTION_STATUS_ACCOUNT_NOT_FOUND - Счёт не найден или недостаточно прав. */
    POSITIONS_SUBSCRIPTION_STATUS_ACCOUNT_NOT_FOUND = 2,
    /** POSITIONS_SUBSCRIPTION_STATUS_INTERNAL_ERROR - Произошла ошибка. */
    POSITIONS_SUBSCRIPTION_STATUS_INTERNAL_ERROR = 3,
    UNRECOGNIZED = -1
}
export declare function positionsAccountSubscriptionStatusFromJSON(object: any): PositionsAccountSubscriptionStatus;
export declare function positionsAccountSubscriptionStatusToJSON(object: PositionsAccountSubscriptionStatus): string;
/** Запрос получения списка операций по счёту. */
export interface OperationsRequest {
    /** Идентификатор счёта клиента. */
    accountId: string;
    /** Начало периода (по UTC). */
    from?: Date | undefined;
    /** Окончание периода (по UTC). */
    to?: Date | undefined;
    /** Статус запрашиваемых операций. */
    state?: OperationState | undefined;
    /** Figi-идентификатор инструмента для фильтрации. */
    figi?: string | undefined;
}
/** Список операций. */
export interface OperationsResponse {
    /** Массив операций. */
    operations: Operation[];
}
/** Данные по операции. */
export interface Operation {
    /** Идентификатор операции. */
    id: string;
    /** Идентификатор родительской операции. */
    parentOperationId: string;
    /** Валюта операции. */
    currency: string;
    /** Сумма операции. */
    payment: MoneyValue | undefined;
    /** Цена операции за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price: MoneyValue | undefined;
    /** Статус операции. */
    state: OperationState;
    /** Количество единиц инструмента. */
    quantity: number;
    /** Неисполненный остаток по сделке. */
    quantityRest: number;
    /** Figi-идентификатор инструмента, связанного с операцией. */
    figi: string;
    /** Тип инструмента. Возможные значения: </br>**bond** — облигация; </br>**share** — акция; </br>**currency** — валюта; </br>**etf** — фонд; </br>**futures** — фьючерс. */
    instrumentType: string;
    /** Дата и время операции в формате часовом поясе UTC. */
    date: Date | undefined;
    /** Текстовое описание типа операции. */
    type: string;
    /** Тип операции. */
    operationType: OperationType;
    /** Массив сделок. */
    trades: OperationTrade[];
    /** Идентификатор актива */
    assetUid: string;
    /** position_uid-идентификатора инструмента. */
    positionUid: string;
    /** Уникальный идентификатор инструмента. */
    instrumentUid: string;
}
/** Сделка по операции. */
export interface OperationTrade {
    /** Идентификатор сделки. */
    tradeId: string;
    /** Дата и время сделки в часовом поясе UTC. */
    dateTime: Date | undefined;
    /** Количество инструментов. */
    quantity: number;
    /** Цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    price: MoneyValue | undefined;
}
/** Запрос получения текущего портфеля по счёту. */
export interface PortfolioRequest {
    /** Идентификатор счёта пользователя. */
    accountId: string;
    /** Валюта, в которой требуется рассчитать портфель */
    currency?: PortfolioRequest_CurrencyRequest | undefined;
}
export declare enum PortfolioRequest_CurrencyRequest {
    /** RUB - Рубли */
    RUB = 0,
    /** USD - Доллары */
    USD = 1,
    /** EUR - Евро */
    EUR = 2,
    UNRECOGNIZED = -1
}
export declare function portfolioRequest_CurrencyRequestFromJSON(object: any): PortfolioRequest_CurrencyRequest;
export declare function portfolioRequest_CurrencyRequestToJSON(object: PortfolioRequest_CurrencyRequest): string;
/** Текущий портфель по счёту. */
export interface PortfolioResponse {
    /** Общая стоимость акций в портфеле. */
    totalAmountShares: MoneyValue | undefined;
    /** Общая стоимость облигаций в портфеле. */
    totalAmountBonds: MoneyValue | undefined;
    /** Общая стоимость фондов в портфеле. */
    totalAmountEtf: MoneyValue | undefined;
    /** Общая стоимость валют в портфеле. */
    totalAmountCurrencies: MoneyValue | undefined;
    /** Общая стоимость фьючерсов в портфеле. */
    totalAmountFutures: MoneyValue | undefined;
    /** Текущая относительная доходность портфеля, в %. */
    expectedYield: Quotation | undefined;
    /** Список позиций портфеля. */
    positions: PortfolioPosition[];
    /** Идентификатор счёта пользователя. */
    accountId: string;
    /** Общая стоимость опционов в портфеле. */
    totalAmountOptions: MoneyValue | undefined;
    /** Общая стоимость структурных нот в портфеле. */
    totalAmountSp: MoneyValue | undefined;
    /** Общая стоимость портфеля. */
    totalAmountPortfolio: MoneyValue | undefined;
    /** Массив виртуальных позиций портфеля. */
    virtualPositions: VirtualPortfolioPosition[];
}
/** Запрос позиций портфеля по счёту. */
export interface PositionsRequest {
    /** Идентификатор счёта пользователя. */
    accountId: string;
}
/** Список позиций по счёту. */
export interface PositionsResponse {
    /** Массив валютных позиций портфеля. */
    money: MoneyValue[];
    /** Массив заблокированных валютных позиций портфеля. */
    blocked: MoneyValue[];
    /** Список ценно-бумажных позиций портфеля. */
    securities: PositionsSecurities[];
    /** Признак идущей в данный момент выгрузки лимитов. */
    limitsLoadingInProgress: boolean;
    /** Список фьючерсов портфеля. */
    futures: PositionsFutures[];
    /** Список опционов портфеля. */
    options: PositionsOptions[];
}
/** Запрос доступного для вывода остатка. */
export interface WithdrawLimitsRequest {
    /** Идентификатор счёта пользователя. */
    accountId: string;
}
/** Доступный для вывода остаток. */
export interface WithdrawLimitsResponse {
    /** Массив валютных позиций портфеля. */
    money: MoneyValue[];
    /** Массив заблокированных валютных позиций портфеля. */
    blocked: MoneyValue[];
    /** Заблокировано под гарантийное обеспечение фьючерсов. */
    blockedGuarantee: MoneyValue[];
}
/** Позиции портфеля. */
export interface PortfolioPosition {
    /** Figi-идентификатора инструмента. */
    figi: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Количество инструмента в портфеле в штуках. */
    quantity: Quotation | undefined;
    /** Средневзвешенная цена позиции. **Возможна задержка до секунды для пересчёта**. */
    averagePositionPrice: MoneyValue | undefined;
    /** Текущая рассчитанная доходность позиции. */
    expectedYield: Quotation | undefined;
    /** Текущий НКД. */
    currentNkd: MoneyValue | undefined;
    /**
     * Deprecated Средняя цена позиции в пунктах (для фьючерсов). **Возможна задержка до секунды для пересчёта**.
     *
     * @deprecated
     */
    averagePositionPricePt: Quotation | undefined;
    /** Текущая цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    currentPrice: MoneyValue | undefined;
    /** Средняя цена позиции по методу FIFO. **Возможна задержка до секунды для пересчёта**. */
    averagePositionPriceFifo: MoneyValue | undefined;
    /**
     * Deprecated Количество лотов в портфеле.
     *
     * @deprecated
     */
    quantityLots: Quotation | undefined;
    /** Заблокировано на бирже. */
    blocked: boolean;
    /** Количество бумаг, заблокированных выставленными заявками. */
    blockedLots: Quotation | undefined;
    /** position_uid-идентификатора инструмента */
    positionUid: string;
    /** instrument_uid-идентификатора инструмента */
    instrumentUid: string;
    /** Вариационная маржа */
    varMargin: MoneyValue | undefined;
    /** Текущая рассчитанная доходность позиции. */
    expectedYieldFifo: Quotation | undefined;
}
export interface VirtualPortfolioPosition {
    /** position_uid-идентификатора инструмента */
    positionUid: string;
    /** instrument_uid-идентификатора инструмента */
    instrumentUid: string;
    /** Figi-идентификатора инструмента. */
    figi: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Количество инструмента в портфеле в штуках. */
    quantity: Quotation | undefined;
    /** Средневзвешенная цена позиции. **Возможна задержка до секунды для пересчёта**. */
    averagePositionPrice: MoneyValue | undefined;
    /** Текущая рассчитанная доходность позиции. */
    expectedYield: Quotation | undefined;
    /** Текущая рассчитанная доходность позиции. */
    expectedYieldFifo: Quotation | undefined;
    /** Дата до которой нужно продать виртуальные бумаги, после этой даты виртуальная позиция "сгорит" */
    expireDate: Date | undefined;
    /** Текущая цена за 1 инструмент. Для получения стоимости лота требуется умножить на лотность инструмента. */
    currentPrice: MoneyValue | undefined;
    /** Средняя цена позиции по методу FIFO. **Возможна задержка до секунды для пересчёта**. */
    averagePositionPriceFifo: MoneyValue | undefined;
}
/** Баланс позиции ценной бумаги. */
export interface PositionsSecurities {
    /** Figi-идентификатор бумаги. */
    figi: string;
    /** Количество бумаг заблокированных выставленными заявками. */
    blocked: number;
    /** Текущий незаблокированный баланс. */
    balance: number;
    /** Уникальный идентификатор позиции. */
    positionUid: string;
    /** Уникальный идентификатор  инструмента. */
    instrumentUid: string;
    /** Заблокировано на бирже. */
    exchangeBlocked: boolean;
    /** Тип инструмента. */
    instrumentType: string;
}
/** Баланс фьючерса. */
export interface PositionsFutures {
    /** Figi-идентификатор фьючерса. */
    figi: string;
    /** Количество бумаг заблокированных выставленными заявками. */
    blocked: number;
    /** Текущий незаблокированный баланс. */
    balance: number;
    /** Уникальный идентификатор позиции. */
    positionUid: string;
    /** Уникальный идентификатор  инструмента. */
    instrumentUid: string;
}
/** Баланс опциона. */
export interface PositionsOptions {
    /** Уникальный идентификатор позиции опциона. */
    positionUid: string;
    /** Уникальный идентификатор  инструмента. */
    instrumentUid: string;
    /** Количество бумаг заблокированных выставленными заявками. */
    blocked: number;
    /** Текущий незаблокированный баланс. */
    balance: number;
}
export interface BrokerReportRequest {
    generateBrokerReportRequest?: GenerateBrokerReportRequest | undefined;
    getBrokerReportRequest?: GetBrokerReportRequest | undefined;
}
export interface BrokerReportResponse {
    generateBrokerReportResponse?: GenerateBrokerReportResponse | undefined;
    getBrokerReportResponse?: GetBrokerReportResponse | undefined;
}
export interface GenerateBrokerReportRequest {
    /** Идентификатор счёта клиента. */
    accountId: string;
    /** Начало периода в часовом поясе UTC. */
    from: Date | undefined;
    /** Окончание периода в часовом поясе UTC. */
    to: Date | undefined;
}
export interface GenerateBrokerReportResponse {
    /** Идентификатор задачи формирования брокерского отчёта. */
    taskId: string;
}
export interface GetBrokerReportRequest {
    /** Идентификатор задачи формирования брокерского отчёта. */
    taskId: string;
    /** Номер страницы отчета (начинается с 1), значение по умолчанию: 0. */
    page?: number | undefined;
}
export interface GetBrokerReportResponse {
    brokerReport: BrokerReport[];
    /** Количество записей в отчете. */
    itemsCount: number;
    /** Количество страниц с данными отчета (начинается с 0). */
    pagesCount: number;
    /** Текущая страница (начинается с 0). */
    page: number;
}
export interface BrokerReport {
    /** Номер сделки. */
    tradeId: string;
    /** Номер поручения. */
    orderId: string;
    /** Figi-идентификатор инструмента. */
    figi: string;
    /** Признак исполнения. */
    executeSign: string;
    /** Дата и время заключения в часовом поясе UTC. */
    tradeDatetime: Date | undefined;
    /** Торговая площадка. */
    exchange: string;
    /** Режим торгов. */
    classCode: string;
    /** Вид сделки. */
    direction: string;
    /** Сокращённое наименование актива. */
    name: string;
    /** Код актива. */
    ticker: string;
    /** Цена за единицу. */
    price: MoneyValue | undefined;
    /** Количество. */
    quantity: number;
    /** Сумма (без НКД). */
    orderAmount: MoneyValue | undefined;
    /** НКД. */
    aciValue: Quotation | undefined;
    /** Сумма сделки. */
    totalOrderAmount: MoneyValue | undefined;
    /** Комиссия брокера. */
    brokerCommission: MoneyValue | undefined;
    /** Комиссия биржи. */
    exchangeCommission: MoneyValue | undefined;
    /** Комиссия клир. центра. */
    exchangeClearingCommission: MoneyValue | undefined;
    /** Ставка РЕПО (%). */
    repoRate: Quotation | undefined;
    /** Контрагент/Брокер. */
    party: string;
    /** Дата расчётов в часовом поясе UTC. */
    clearValueDate: Date | undefined;
    /** Дата поставки в часовом поясе UTC. */
    secValueDate: Date | undefined;
    /** Статус брокера. */
    brokerStatus: string;
    /** Тип дог. */
    separateAgreementType: string;
    /** Номер дог. */
    separateAgreementNumber: string;
    /** Дата дог. */
    separateAgreementDate: string;
    /** Тип расчёта по сделке. */
    deliveryType: string;
}
export interface GetDividendsForeignIssuerRequest {
    /** Объект запроса формирования отчёта. */
    generateDivForeignIssuerReport?: GenerateDividendsForeignIssuerReportRequest | undefined;
    /** Объект запроса сформированного отчёта. */
    getDivForeignIssuerReport?: GetDividendsForeignIssuerReportRequest | undefined;
}
export interface GetDividendsForeignIssuerResponse {
    /** Объект результата задачи запуска формирования отчёта. */
    generateDivForeignIssuerReportResponse?: GenerateDividendsForeignIssuerReportResponse | undefined;
    /** Отчёт "Справка о доходах за пределами РФ". */
    divForeignIssuerReport?: GetDividendsForeignIssuerReportResponse | undefined;
}
/** Объект запроса формирования отчёта "Справка о доходах за пределами РФ". */
export interface GenerateDividendsForeignIssuerReportRequest {
    /** Идентификатор счёта клиента. */
    accountId: string;
    /** Начало периода (по UTC). */
    from: Date | undefined;
    /** Окончание периода (по UTC), как правило, возможно сформировать отчет по дату, на несколько дней меньше текущей. Начало и окончание периода должны быть в рамках одного календарного года. */
    to: Date | undefined;
}
/** Объект запроса сформированного отчёта "Справка о доходах за пределами РФ". */
export interface GetDividendsForeignIssuerReportRequest {
    /** Идентификатор задачи формирования отчёта. */
    taskId: string;
    /** Номер страницы отчета (начинается с 0), значение по умолчанию: 0. */
    page?: number | undefined;
}
/** Объект результата задачи запуска формирования отчёта "Справка о доходах за пределами РФ". */
export interface GenerateDividendsForeignIssuerReportResponse {
    /** Идентификатор задачи формирования отчёта. */
    taskId: string;
}
export interface GetDividendsForeignIssuerReportResponse {
    dividendsForeignIssuerReport: DividendsForeignIssuerReport[];
    /** Количество записей в отчете. */
    itemsCount: number;
    /** Количество страниц с данными отчета (начинается с 0). */
    pagesCount: number;
    /** Текущая страница (начинается с 0). */
    page: number;
}
/** Отчёт "Справка о доходах за пределами РФ". */
export interface DividendsForeignIssuerReport {
    /** Дата фиксации реестра. */
    recordDate: Date | undefined;
    /** Дата выплаты. */
    paymentDate: Date | undefined;
    /** Наименование ценной бумаги. */
    securityName: string;
    /** ISIN-идентификатор ценной бумаги. */
    isin: string;
    /** Страна эмитента. Для депозитарных расписок указывается страна эмитента базового актива. */
    issuerCountry: string;
    /** Количество ценных бумаг. */
    quantity: number;
    /** Выплаты на одну бумагу */
    dividend: Quotation | undefined;
    /** Комиссия внешних платёжных агентов. */
    externalCommission: Quotation | undefined;
    /** Сумма до удержания налога. */
    dividendGross: Quotation | undefined;
    /** Сумма налога, удержанного агентом. */
    tax: Quotation | undefined;
    /** Итоговая сумма выплаты. */
    dividendAmount: Quotation | undefined;
    /** Валюта. */
    currency: string;
}
/** Запрос установки stream-соединения. */
export interface PortfolioStreamRequest {
    /** Массив идентификаторов счётов пользователя */
    accounts: string[];
}
/** Информация по позициям и доходностям портфелей. */
export interface PortfolioStreamResponse {
    /** Объект результата подписки. */
    subscriptions?: PortfolioSubscriptionResult | undefined;
    /** Объект стриминга портфеля. */
    portfolio?: PortfolioResponse | undefined;
    /** Проверка активности стрима. */
    ping?: Ping | undefined;
}
/** Объект результата подписки. */
export interface PortfolioSubscriptionResult {
    /** Массив счетов клиента. */
    accounts: AccountSubscriptionStatus[];
}
/** Счет клиента. */
export interface AccountSubscriptionStatus {
    /** Идентификатор счёта */
    accountId: string;
    /** Результат подписки. */
    subscriptionStatus: PortfolioSubscriptionStatus;
}
/** Запрос списка операций по счёту с пагинацией. */
export interface GetOperationsByCursorRequest {
    /** Идентификатор счёта клиента. Обязательный параметр для данного метода, остальные параметры опциональны. */
    accountId: string;
    /** Идентификатор инструмента (Figi инструмента или uid инструмента) */
    instrumentId?: string | undefined;
    /** Начало периода (по UTC). */
    from?: Date | undefined;
    /** Окончание периода (по UTC). */
    to?: Date | undefined;
    /** Идентификатор элемента, с которого начать формировать ответ. */
    cursor?: string | undefined;
    /** Лимит количества операций. По умолчанию устанавливается значение **100**, максимальное значение 1000. */
    limit?: number | undefined;
    /** Тип операции. Принимает значение из списка OperationType. */
    operationTypes: OperationType[];
    /** Статус запрашиваемых операций, возможные значения указаны в OperationState. */
    state?: OperationState | undefined;
    /** Флаг возвращать ли комиссии, по умолчанию false */
    withoutCommissions?: boolean | undefined;
    /** Флаг получения ответа без массива сделок. */
    withoutTrades?: boolean | undefined;
    /** Флаг не показывать overnight операций. */
    withoutOvernights?: boolean | undefined;
}
/** Список операций по счёту с пагинацией. */
export interface GetOperationsByCursorResponse {
    /** Признак, есть ли следующий элемент. */
    hasNext: boolean;
    /** Следующий курсор. */
    nextCursor: string;
    /** Список операций. */
    items: OperationItem[];
}
/** Данные об операции. */
export interface OperationItem {
    /** Курсор. */
    cursor: string;
    /** Номер счета клиента. */
    brokerAccountId: string;
    /** Идентификатор операции, может меняться с течением времени. */
    id: string;
    /** Идентификатор родительской операции, может измениться, если изменился id родительской операции. */
    parentOperationId: string;
    /** Название операции. */
    name: string;
    /** Дата поручения. */
    date: Date | undefined;
    /** Тип операции. */
    type: OperationType;
    /** Описание операции. */
    description: string;
    /** Статус поручения. */
    state: OperationState;
    /** Уникальный идентификатор инструмента. */
    instrumentUid: string;
    /** Figi. */
    figi: string;
    /** Тип инструмента. */
    instrumentType: string;
    /** Тип инструмента. */
    instrumentKind: InstrumentType;
    /** position_uid-идентификатора инструмента. */
    positionUid: string;
    /** Сумма операции. */
    payment: MoneyValue | undefined;
    /** Цена операции за 1 инструмент. */
    price: MoneyValue | undefined;
    /** Комиссия. */
    commission: MoneyValue | undefined;
    /** Доходность. */
    yield: MoneyValue | undefined;
    /** Относительная доходность. */
    yieldRelative: Quotation | undefined;
    /** Накопленный купонный доход. */
    accruedInt: MoneyValue | undefined;
    /** Количество единиц инструмента. */
    quantity: number;
    /** Неисполненный остаток по сделке. */
    quantityRest: number;
    /** Исполненный остаток. */
    quantityDone: number;
    /** Дата и время снятия заявки. */
    cancelDateTime: Date | undefined;
    /** Причина отмены операции. */
    cancelReason: string;
    /** Массив сделок. */
    tradesInfo: OperationItemTrades | undefined;
    /** Идентификатор актива */
    assetUid: string;
}
/** Массив с информацией о сделках. */
export interface OperationItemTrades {
    trades: OperationItemTrade[];
}
/** Сделка по операции. */
export interface OperationItemTrade {
    /** Номер сделки */
    num: string;
    /** Дата сделки */
    date: Date | undefined;
    /** Количество в единицах. */
    quantity: number;
    /** Цена. */
    price: MoneyValue | undefined;
    /** Доходность. */
    yield: MoneyValue | undefined;
    /** Относительная доходность. */
    yieldRelative: Quotation | undefined;
}
/** Запрос установки stream-соединения позиций. */
export interface PositionsStreamRequest {
    /** Массив идентификаторов счётов пользователя */
    accounts: string[];
}
/** Информация по изменению позиций портфеля. */
export interface PositionsStreamResponse {
    /** Объект результата подписки. */
    subscriptions?: PositionsSubscriptionResult | undefined;
    /** Объект стриминга позиций. */
    position?: PositionData | undefined;
    /** Проверка активности стрима. */
    ping?: Ping | undefined;
}
/** Объект результата подписки. */
export interface PositionsSubscriptionResult {
    /** Массив счетов клиента. */
    accounts: PositionsSubscriptionStatus[];
}
/** Счет клиента. */
export interface PositionsSubscriptionStatus {
    /** Идентификатор счёта */
    accountId: string;
    /** Результат подписки. */
    subscriptionStatus: PositionsAccountSubscriptionStatus;
}
/** Данные о позиции портфеля. */
export interface PositionData {
    /** Идентификатор счёта. */
    accountId: string;
    /** Массив валютных позиций портфеля. */
    money: PositionsMoney[];
    /** Список ценно-бумажных позиций портфеля. */
    securities: PositionsSecurities[];
    /** Список фьючерсов портфеля. */
    futures: PositionsFutures[];
    /** Список опционов портфеля. */
    options: PositionsOptions[];
    /** Дата и время операции в формате UTC. */
    date: Date | undefined;
}
/** Валютная позиция портфеля. */
export interface PositionsMoney {
    /** Доступное количество валютный позиций. */
    availableValue: MoneyValue | undefined;
    /** Заблокированное количество валютный позиций. */
    blockedValue: MoneyValue | undefined;
}
export declare const OperationsRequest: {
    encode(message: OperationsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationsRequest;
    fromJSON(object: any): OperationsRequest;
    toJSON(message: OperationsRequest): unknown;
    create(base?: DeepPartial<OperationsRequest>): OperationsRequest;
    fromPartial(object: DeepPartial<OperationsRequest>): OperationsRequest;
};
export declare const OperationsResponse: {
    encode(message: OperationsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationsResponse;
    fromJSON(object: any): OperationsResponse;
    toJSON(message: OperationsResponse): unknown;
    create(base?: DeepPartial<OperationsResponse>): OperationsResponse;
    fromPartial(object: DeepPartial<OperationsResponse>): OperationsResponse;
};
export declare const Operation: {
    encode(message: Operation, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Operation;
    fromJSON(object: any): Operation;
    toJSON(message: Operation): unknown;
    create(base?: DeepPartial<Operation>): Operation;
    fromPartial(object: DeepPartial<Operation>): Operation;
};
export declare const OperationTrade: {
    encode(message: OperationTrade, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationTrade;
    fromJSON(object: any): OperationTrade;
    toJSON(message: OperationTrade): unknown;
    create(base?: DeepPartial<OperationTrade>): OperationTrade;
    fromPartial(object: DeepPartial<OperationTrade>): OperationTrade;
};
export declare const PortfolioRequest: {
    encode(message: PortfolioRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioRequest;
    fromJSON(object: any): PortfolioRequest;
    toJSON(message: PortfolioRequest): unknown;
    create(base?: DeepPartial<PortfolioRequest>): PortfolioRequest;
    fromPartial(object: DeepPartial<PortfolioRequest>): PortfolioRequest;
};
export declare const PortfolioResponse: {
    encode(message: PortfolioResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioResponse;
    fromJSON(object: any): PortfolioResponse;
    toJSON(message: PortfolioResponse): unknown;
    create(base?: DeepPartial<PortfolioResponse>): PortfolioResponse;
    fromPartial(object: DeepPartial<PortfolioResponse>): PortfolioResponse;
};
export declare const PositionsRequest: {
    encode(message: PositionsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsRequest;
    fromJSON(object: any): PositionsRequest;
    toJSON(message: PositionsRequest): unknown;
    create(base?: DeepPartial<PositionsRequest>): PositionsRequest;
    fromPartial(object: DeepPartial<PositionsRequest>): PositionsRequest;
};
export declare const PositionsResponse: {
    encode(message: PositionsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsResponse;
    fromJSON(object: any): PositionsResponse;
    toJSON(message: PositionsResponse): unknown;
    create(base?: DeepPartial<PositionsResponse>): PositionsResponse;
    fromPartial(object: DeepPartial<PositionsResponse>): PositionsResponse;
};
export declare const WithdrawLimitsRequest: {
    encode(message: WithdrawLimitsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WithdrawLimitsRequest;
    fromJSON(object: any): WithdrawLimitsRequest;
    toJSON(message: WithdrawLimitsRequest): unknown;
    create(base?: DeepPartial<WithdrawLimitsRequest>): WithdrawLimitsRequest;
    fromPartial(object: DeepPartial<WithdrawLimitsRequest>): WithdrawLimitsRequest;
};
export declare const WithdrawLimitsResponse: {
    encode(message: WithdrawLimitsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WithdrawLimitsResponse;
    fromJSON(object: any): WithdrawLimitsResponse;
    toJSON(message: WithdrawLimitsResponse): unknown;
    create(base?: DeepPartial<WithdrawLimitsResponse>): WithdrawLimitsResponse;
    fromPartial(object: DeepPartial<WithdrawLimitsResponse>): WithdrawLimitsResponse;
};
export declare const PortfolioPosition: {
    encode(message: PortfolioPosition, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioPosition;
    fromJSON(object: any): PortfolioPosition;
    toJSON(message: PortfolioPosition): unknown;
    create(base?: DeepPartial<PortfolioPosition>): PortfolioPosition;
    fromPartial(object: DeepPartial<PortfolioPosition>): PortfolioPosition;
};
export declare const VirtualPortfolioPosition: {
    encode(message: VirtualPortfolioPosition, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VirtualPortfolioPosition;
    fromJSON(object: any): VirtualPortfolioPosition;
    toJSON(message: VirtualPortfolioPosition): unknown;
    create(base?: DeepPartial<VirtualPortfolioPosition>): VirtualPortfolioPosition;
    fromPartial(object: DeepPartial<VirtualPortfolioPosition>): VirtualPortfolioPosition;
};
export declare const PositionsSecurities: {
    encode(message: PositionsSecurities, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsSecurities;
    fromJSON(object: any): PositionsSecurities;
    toJSON(message: PositionsSecurities): unknown;
    create(base?: DeepPartial<PositionsSecurities>): PositionsSecurities;
    fromPartial(object: DeepPartial<PositionsSecurities>): PositionsSecurities;
};
export declare const PositionsFutures: {
    encode(message: PositionsFutures, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsFutures;
    fromJSON(object: any): PositionsFutures;
    toJSON(message: PositionsFutures): unknown;
    create(base?: DeepPartial<PositionsFutures>): PositionsFutures;
    fromPartial(object: DeepPartial<PositionsFutures>): PositionsFutures;
};
export declare const PositionsOptions: {
    encode(message: PositionsOptions, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsOptions;
    fromJSON(object: any): PositionsOptions;
    toJSON(message: PositionsOptions): unknown;
    create(base?: DeepPartial<PositionsOptions>): PositionsOptions;
    fromPartial(object: DeepPartial<PositionsOptions>): PositionsOptions;
};
export declare const BrokerReportRequest: {
    encode(message: BrokerReportRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BrokerReportRequest;
    fromJSON(object: any): BrokerReportRequest;
    toJSON(message: BrokerReportRequest): unknown;
    create(base?: DeepPartial<BrokerReportRequest>): BrokerReportRequest;
    fromPartial(object: DeepPartial<BrokerReportRequest>): BrokerReportRequest;
};
export declare const BrokerReportResponse: {
    encode(message: BrokerReportResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BrokerReportResponse;
    fromJSON(object: any): BrokerReportResponse;
    toJSON(message: BrokerReportResponse): unknown;
    create(base?: DeepPartial<BrokerReportResponse>): BrokerReportResponse;
    fromPartial(object: DeepPartial<BrokerReportResponse>): BrokerReportResponse;
};
export declare const GenerateBrokerReportRequest: {
    encode(message: GenerateBrokerReportRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenerateBrokerReportRequest;
    fromJSON(object: any): GenerateBrokerReportRequest;
    toJSON(message: GenerateBrokerReportRequest): unknown;
    create(base?: DeepPartial<GenerateBrokerReportRequest>): GenerateBrokerReportRequest;
    fromPartial(object: DeepPartial<GenerateBrokerReportRequest>): GenerateBrokerReportRequest;
};
export declare const GenerateBrokerReportResponse: {
    encode(message: GenerateBrokerReportResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenerateBrokerReportResponse;
    fromJSON(object: any): GenerateBrokerReportResponse;
    toJSON(message: GenerateBrokerReportResponse): unknown;
    create(base?: DeepPartial<GenerateBrokerReportResponse>): GenerateBrokerReportResponse;
    fromPartial(object: DeepPartial<GenerateBrokerReportResponse>): GenerateBrokerReportResponse;
};
export declare const GetBrokerReportRequest: {
    encode(message: GetBrokerReportRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBrokerReportRequest;
    fromJSON(object: any): GetBrokerReportRequest;
    toJSON(message: GetBrokerReportRequest): unknown;
    create(base?: DeepPartial<GetBrokerReportRequest>): GetBrokerReportRequest;
    fromPartial(object: DeepPartial<GetBrokerReportRequest>): GetBrokerReportRequest;
};
export declare const GetBrokerReportResponse: {
    encode(message: GetBrokerReportResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetBrokerReportResponse;
    fromJSON(object: any): GetBrokerReportResponse;
    toJSON(message: GetBrokerReportResponse): unknown;
    create(base?: DeepPartial<GetBrokerReportResponse>): GetBrokerReportResponse;
    fromPartial(object: DeepPartial<GetBrokerReportResponse>): GetBrokerReportResponse;
};
export declare const BrokerReport: {
    encode(message: BrokerReport, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BrokerReport;
    fromJSON(object: any): BrokerReport;
    toJSON(message: BrokerReport): unknown;
    create(base?: DeepPartial<BrokerReport>): BrokerReport;
    fromPartial(object: DeepPartial<BrokerReport>): BrokerReport;
};
export declare const GetDividendsForeignIssuerRequest: {
    encode(message: GetDividendsForeignIssuerRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsForeignIssuerRequest;
    fromJSON(object: any): GetDividendsForeignIssuerRequest;
    toJSON(message: GetDividendsForeignIssuerRequest): unknown;
    create(base?: DeepPartial<GetDividendsForeignIssuerRequest>): GetDividendsForeignIssuerRequest;
    fromPartial(object: DeepPartial<GetDividendsForeignIssuerRequest>): GetDividendsForeignIssuerRequest;
};
export declare const GetDividendsForeignIssuerResponse: {
    encode(message: GetDividendsForeignIssuerResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsForeignIssuerResponse;
    fromJSON(object: any): GetDividendsForeignIssuerResponse;
    toJSON(message: GetDividendsForeignIssuerResponse): unknown;
    create(base?: DeepPartial<GetDividendsForeignIssuerResponse>): GetDividendsForeignIssuerResponse;
    fromPartial(object: DeepPartial<GetDividendsForeignIssuerResponse>): GetDividendsForeignIssuerResponse;
};
export declare const GenerateDividendsForeignIssuerReportRequest: {
    encode(message: GenerateDividendsForeignIssuerReportRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenerateDividendsForeignIssuerReportRequest;
    fromJSON(object: any): GenerateDividendsForeignIssuerReportRequest;
    toJSON(message: GenerateDividendsForeignIssuerReportRequest): unknown;
    create(base?: DeepPartial<GenerateDividendsForeignIssuerReportRequest>): GenerateDividendsForeignIssuerReportRequest;
    fromPartial(object: DeepPartial<GenerateDividendsForeignIssuerReportRequest>): GenerateDividendsForeignIssuerReportRequest;
};
export declare const GetDividendsForeignIssuerReportRequest: {
    encode(message: GetDividendsForeignIssuerReportRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsForeignIssuerReportRequest;
    fromJSON(object: any): GetDividendsForeignIssuerReportRequest;
    toJSON(message: GetDividendsForeignIssuerReportRequest): unknown;
    create(base?: DeepPartial<GetDividendsForeignIssuerReportRequest>): GetDividendsForeignIssuerReportRequest;
    fromPartial(object: DeepPartial<GetDividendsForeignIssuerReportRequest>): GetDividendsForeignIssuerReportRequest;
};
export declare const GenerateDividendsForeignIssuerReportResponse: {
    encode(message: GenerateDividendsForeignIssuerReportResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenerateDividendsForeignIssuerReportResponse;
    fromJSON(object: any): GenerateDividendsForeignIssuerReportResponse;
    toJSON(message: GenerateDividendsForeignIssuerReportResponse): unknown;
    create(base?: DeepPartial<GenerateDividendsForeignIssuerReportResponse>): GenerateDividendsForeignIssuerReportResponse;
    fromPartial(object: DeepPartial<GenerateDividendsForeignIssuerReportResponse>): GenerateDividendsForeignIssuerReportResponse;
};
export declare const GetDividendsForeignIssuerReportResponse: {
    encode(message: GetDividendsForeignIssuerReportResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsForeignIssuerReportResponse;
    fromJSON(object: any): GetDividendsForeignIssuerReportResponse;
    toJSON(message: GetDividendsForeignIssuerReportResponse): unknown;
    create(base?: DeepPartial<GetDividendsForeignIssuerReportResponse>): GetDividendsForeignIssuerReportResponse;
    fromPartial(object: DeepPartial<GetDividendsForeignIssuerReportResponse>): GetDividendsForeignIssuerReportResponse;
};
export declare const DividendsForeignIssuerReport: {
    encode(message: DividendsForeignIssuerReport, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DividendsForeignIssuerReport;
    fromJSON(object: any): DividendsForeignIssuerReport;
    toJSON(message: DividendsForeignIssuerReport): unknown;
    create(base?: DeepPartial<DividendsForeignIssuerReport>): DividendsForeignIssuerReport;
    fromPartial(object: DeepPartial<DividendsForeignIssuerReport>): DividendsForeignIssuerReport;
};
export declare const PortfolioStreamRequest: {
    encode(message: PortfolioStreamRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioStreamRequest;
    fromJSON(object: any): PortfolioStreamRequest;
    toJSON(message: PortfolioStreamRequest): unknown;
    create(base?: DeepPartial<PortfolioStreamRequest>): PortfolioStreamRequest;
    fromPartial(object: DeepPartial<PortfolioStreamRequest>): PortfolioStreamRequest;
};
export declare const PortfolioStreamResponse: {
    encode(message: PortfolioStreamResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioStreamResponse;
    fromJSON(object: any): PortfolioStreamResponse;
    toJSON(message: PortfolioStreamResponse): unknown;
    create(base?: DeepPartial<PortfolioStreamResponse>): PortfolioStreamResponse;
    fromPartial(object: DeepPartial<PortfolioStreamResponse>): PortfolioStreamResponse;
};
export declare const PortfolioSubscriptionResult: {
    encode(message: PortfolioSubscriptionResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioSubscriptionResult;
    fromJSON(object: any): PortfolioSubscriptionResult;
    toJSON(message: PortfolioSubscriptionResult): unknown;
    create(base?: DeepPartial<PortfolioSubscriptionResult>): PortfolioSubscriptionResult;
    fromPartial(object: DeepPartial<PortfolioSubscriptionResult>): PortfolioSubscriptionResult;
};
export declare const AccountSubscriptionStatus: {
    encode(message: AccountSubscriptionStatus, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AccountSubscriptionStatus;
    fromJSON(object: any): AccountSubscriptionStatus;
    toJSON(message: AccountSubscriptionStatus): unknown;
    create(base?: DeepPartial<AccountSubscriptionStatus>): AccountSubscriptionStatus;
    fromPartial(object: DeepPartial<AccountSubscriptionStatus>): AccountSubscriptionStatus;
};
export declare const GetOperationsByCursorRequest: {
    encode(message: GetOperationsByCursorRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOperationsByCursorRequest;
    fromJSON(object: any): GetOperationsByCursorRequest;
    toJSON(message: GetOperationsByCursorRequest): unknown;
    create(base?: DeepPartial<GetOperationsByCursorRequest>): GetOperationsByCursorRequest;
    fromPartial(object: DeepPartial<GetOperationsByCursorRequest>): GetOperationsByCursorRequest;
};
export declare const GetOperationsByCursorResponse: {
    encode(message: GetOperationsByCursorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetOperationsByCursorResponse;
    fromJSON(object: any): GetOperationsByCursorResponse;
    toJSON(message: GetOperationsByCursorResponse): unknown;
    create(base?: DeepPartial<GetOperationsByCursorResponse>): GetOperationsByCursorResponse;
    fromPartial(object: DeepPartial<GetOperationsByCursorResponse>): GetOperationsByCursorResponse;
};
export declare const OperationItem: {
    encode(message: OperationItem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationItem;
    fromJSON(object: any): OperationItem;
    toJSON(message: OperationItem): unknown;
    create(base?: DeepPartial<OperationItem>): OperationItem;
    fromPartial(object: DeepPartial<OperationItem>): OperationItem;
};
export declare const OperationItemTrades: {
    encode(message: OperationItemTrades, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationItemTrades;
    fromJSON(object: any): OperationItemTrades;
    toJSON(message: OperationItemTrades): unknown;
    create(base?: DeepPartial<OperationItemTrades>): OperationItemTrades;
    fromPartial(object: DeepPartial<OperationItemTrades>): OperationItemTrades;
};
export declare const OperationItemTrade: {
    encode(message: OperationItemTrade, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationItemTrade;
    fromJSON(object: any): OperationItemTrade;
    toJSON(message: OperationItemTrade): unknown;
    create(base?: DeepPartial<OperationItemTrade>): OperationItemTrade;
    fromPartial(object: DeepPartial<OperationItemTrade>): OperationItemTrade;
};
export declare const PositionsStreamRequest: {
    encode(message: PositionsStreamRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsStreamRequest;
    fromJSON(object: any): PositionsStreamRequest;
    toJSON(message: PositionsStreamRequest): unknown;
    create(base?: DeepPartial<PositionsStreamRequest>): PositionsStreamRequest;
    fromPartial(object: DeepPartial<PositionsStreamRequest>): PositionsStreamRequest;
};
export declare const PositionsStreamResponse: {
    encode(message: PositionsStreamResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsStreamResponse;
    fromJSON(object: any): PositionsStreamResponse;
    toJSON(message: PositionsStreamResponse): unknown;
    create(base?: DeepPartial<PositionsStreamResponse>): PositionsStreamResponse;
    fromPartial(object: DeepPartial<PositionsStreamResponse>): PositionsStreamResponse;
};
export declare const PositionsSubscriptionResult: {
    encode(message: PositionsSubscriptionResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsSubscriptionResult;
    fromJSON(object: any): PositionsSubscriptionResult;
    toJSON(message: PositionsSubscriptionResult): unknown;
    create(base?: DeepPartial<PositionsSubscriptionResult>): PositionsSubscriptionResult;
    fromPartial(object: DeepPartial<PositionsSubscriptionResult>): PositionsSubscriptionResult;
};
export declare const PositionsSubscriptionStatus: {
    encode(message: PositionsSubscriptionStatus, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsSubscriptionStatus;
    fromJSON(object: any): PositionsSubscriptionStatus;
    toJSON(message: PositionsSubscriptionStatus): unknown;
    create(base?: DeepPartial<PositionsSubscriptionStatus>): PositionsSubscriptionStatus;
    fromPartial(object: DeepPartial<PositionsSubscriptionStatus>): PositionsSubscriptionStatus;
};
export declare const PositionData: {
    encode(message: PositionData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionData;
    fromJSON(object: any): PositionData;
    toJSON(message: PositionData): unknown;
    create(base?: DeepPartial<PositionData>): PositionData;
    fromPartial(object: DeepPartial<PositionData>): PositionData;
};
export declare const PositionsMoney: {
    encode(message: PositionsMoney, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionsMoney;
    fromJSON(object: any): PositionsMoney;
    toJSON(message: PositionsMoney): unknown;
    create(base?: DeepPartial<PositionsMoney>): PositionsMoney;
    fromPartial(object: DeepPartial<PositionsMoney>): PositionsMoney;
};
/**
 * Сервис предназначен для получения:</br> **1**.  списка операций по счёту;</br> **2**.
 * портфеля по счёту;</br> **3**. позиций ценных бумаг на счёте;</br> **4**.
 * доступного остатка для вывода средств;</br> **5**. получения различных отчётов.
 */
export type OperationsServiceDefinition = typeof OperationsServiceDefinition;
export declare const OperationsServiceDefinition: {
    readonly name: "OperationsService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.OperationsService";
    readonly methods: {
        /**
         * Метод получения списка операций по счёту.При работе с данным методом необходимо учитывать
         * [особенности взаимодействия](/investAPI/operations_problems) с данным методом.
         */
        readonly getOperations: {
            readonly name: "GetOperations";
            readonly requestType: {
                encode(message: OperationsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OperationsRequest;
                fromJSON(object: any): OperationsRequest;
                toJSON(message: OperationsRequest): unknown;
                create(base?: DeepPartial<OperationsRequest>): OperationsRequest;
                fromPartial(object: DeepPartial<OperationsRequest>): OperationsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: OperationsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): OperationsResponse;
                fromJSON(object: any): OperationsResponse;
                toJSON(message: OperationsResponse): unknown;
                create(base?: DeepPartial<OperationsResponse>): OperationsResponse;
                fromPartial(object: DeepPartial<OperationsResponse>): OperationsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения портфеля по счёту. */
        readonly getPortfolio: {
            readonly name: "GetPortfolio";
            readonly requestType: {
                encode(message: PortfolioRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioRequest;
                fromJSON(object: any): PortfolioRequest;
                toJSON(message: PortfolioRequest): unknown;
                create(base?: DeepPartial<PortfolioRequest>): PortfolioRequest;
                fromPartial(object: DeepPartial<PortfolioRequest>): PortfolioRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PortfolioResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioResponse;
                fromJSON(object: any): PortfolioResponse;
                toJSON(message: PortfolioResponse): unknown;
                create(base?: DeepPartial<PortfolioResponse>): PortfolioResponse;
                fromPartial(object: DeepPartial<PortfolioResponse>): PortfolioResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения списка позиций по счёту. */
        readonly getPositions: {
            readonly name: "GetPositions";
            readonly requestType: {
                encode(message: PositionsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PositionsRequest;
                fromJSON(object: any): PositionsRequest;
                toJSON(message: PositionsRequest): unknown;
                create(base?: DeepPartial<PositionsRequest>): PositionsRequest;
                fromPartial(object: DeepPartial<PositionsRequest>): PositionsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PositionsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PositionsResponse;
                fromJSON(object: any): PositionsResponse;
                toJSON(message: PositionsResponse): unknown;
                create(base?: DeepPartial<PositionsResponse>): PositionsResponse;
                fromPartial(object: DeepPartial<PositionsResponse>): PositionsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения доступного остатка для вывода средств. */
        readonly getWithdrawLimits: {
            readonly name: "GetWithdrawLimits";
            readonly requestType: {
                encode(message: WithdrawLimitsRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): WithdrawLimitsRequest;
                fromJSON(object: any): WithdrawLimitsRequest;
                toJSON(message: WithdrawLimitsRequest): unknown;
                create(base?: DeepPartial<WithdrawLimitsRequest>): WithdrawLimitsRequest;
                fromPartial(object: DeepPartial<WithdrawLimitsRequest>): WithdrawLimitsRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: WithdrawLimitsResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): WithdrawLimitsResponse;
                fromJSON(object: any): WithdrawLimitsResponse;
                toJSON(message: WithdrawLimitsResponse): unknown;
                create(base?: DeepPartial<WithdrawLimitsResponse>): WithdrawLimitsResponse;
                fromPartial(object: DeepPartial<WithdrawLimitsResponse>): WithdrawLimitsResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения брокерского отчёта. */
        readonly getBrokerReport: {
            readonly name: "GetBrokerReport";
            readonly requestType: {
                encode(message: BrokerReportRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): BrokerReportRequest;
                fromJSON(object: any): BrokerReportRequest;
                toJSON(message: BrokerReportRequest): unknown;
                create(base?: DeepPartial<BrokerReportRequest>): BrokerReportRequest;
                fromPartial(object: DeepPartial<BrokerReportRequest>): BrokerReportRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: BrokerReportResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): BrokerReportResponse;
                fromJSON(object: any): BrokerReportResponse;
                toJSON(message: BrokerReportResponse): unknown;
                create(base?: DeepPartial<BrokerReportResponse>): BrokerReportResponse;
                fromPartial(object: DeepPartial<BrokerReportResponse>): BrokerReportResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /** Метод получения отчёта "Справка о доходах за пределами РФ". */
        readonly getDividendsForeignIssuer: {
            readonly name: "GetDividendsForeignIssuer";
            readonly requestType: {
                encode(message: GetDividendsForeignIssuerRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsForeignIssuerRequest;
                fromJSON(object: any): GetDividendsForeignIssuerRequest;
                toJSON(message: GetDividendsForeignIssuerRequest): unknown;
                create(base?: DeepPartial<GetDividendsForeignIssuerRequest>): GetDividendsForeignIssuerRequest;
                fromPartial(object: DeepPartial<GetDividendsForeignIssuerRequest>): GetDividendsForeignIssuerRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetDividendsForeignIssuerResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetDividendsForeignIssuerResponse;
                fromJSON(object: any): GetDividendsForeignIssuerResponse;
                toJSON(message: GetDividendsForeignIssuerResponse): unknown;
                create(base?: DeepPartial<GetDividendsForeignIssuerResponse>): GetDividendsForeignIssuerResponse;
                fromPartial(object: DeepPartial<GetDividendsForeignIssuerResponse>): GetDividendsForeignIssuerResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
        /**
         * Метод получения списка операций по счёту с пагинацией. При работе с данным методом необходимо учитывать
         * [особенности взаимодействия](/investAPI/operations_problems) с данным методом.
         */
        readonly getOperationsByCursor: {
            readonly name: "GetOperationsByCursor";
            readonly requestType: {
                encode(message: GetOperationsByCursorRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOperationsByCursorRequest;
                fromJSON(object: any): GetOperationsByCursorRequest;
                toJSON(message: GetOperationsByCursorRequest): unknown;
                create(base?: DeepPartial<GetOperationsByCursorRequest>): GetOperationsByCursorRequest;
                fromPartial(object: DeepPartial<GetOperationsByCursorRequest>): GetOperationsByCursorRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: GetOperationsByCursorResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): GetOperationsByCursorResponse;
                fromJSON(object: any): GetOperationsByCursorResponse;
                toJSON(message: GetOperationsByCursorResponse): unknown;
                create(base?: DeepPartial<GetOperationsByCursorResponse>): GetOperationsByCursorResponse;
                fromPartial(object: DeepPartial<GetOperationsByCursorResponse>): GetOperationsByCursorResponse;
            };
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface OperationsServiceImplementation<CallContextExt = {}> {
    /**
     * Метод получения списка операций по счёту.При работе с данным методом необходимо учитывать
     * [особенности взаимодействия](/investAPI/operations_problems) с данным методом.
     */
    getOperations(request: OperationsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<OperationsResponse>>;
    /** Метод получения портфеля по счёту. */
    getPortfolio(request: PortfolioRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PortfolioResponse>>;
    /** Метод получения списка позиций по счёту. */
    getPositions(request: PositionsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PositionsResponse>>;
    /** Метод получения доступного остатка для вывода средств. */
    getWithdrawLimits(request: WithdrawLimitsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<WithdrawLimitsResponse>>;
    /** Метод получения брокерского отчёта. */
    getBrokerReport(request: BrokerReportRequest, context: CallContext & CallContextExt): Promise<DeepPartial<BrokerReportResponse>>;
    /** Метод получения отчёта "Справка о доходах за пределами РФ". */
    getDividendsForeignIssuer(request: GetDividendsForeignIssuerRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetDividendsForeignIssuerResponse>>;
    /**
     * Метод получения списка операций по счёту с пагинацией. При работе с данным методом необходимо учитывать
     * [особенности взаимодействия](/investAPI/operations_problems) с данным методом.
     */
    getOperationsByCursor(request: GetOperationsByCursorRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetOperationsByCursorResponse>>;
}
export interface OperationsServiceClient<CallOptionsExt = {}> {
    /**
     * Метод получения списка операций по счёту.При работе с данным методом необходимо учитывать
     * [особенности взаимодействия](/investAPI/operations_problems) с данным методом.
     */
    getOperations(request: DeepPartial<OperationsRequest>, options?: CallOptions & CallOptionsExt): Promise<OperationsResponse>;
    /** Метод получения портфеля по счёту. */
    getPortfolio(request: DeepPartial<PortfolioRequest>, options?: CallOptions & CallOptionsExt): Promise<PortfolioResponse>;
    /** Метод получения списка позиций по счёту. */
    getPositions(request: DeepPartial<PositionsRequest>, options?: CallOptions & CallOptionsExt): Promise<PositionsResponse>;
    /** Метод получения доступного остатка для вывода средств. */
    getWithdrawLimits(request: DeepPartial<WithdrawLimitsRequest>, options?: CallOptions & CallOptionsExt): Promise<WithdrawLimitsResponse>;
    /** Метод получения брокерского отчёта. */
    getBrokerReport(request: DeepPartial<BrokerReportRequest>, options?: CallOptions & CallOptionsExt): Promise<BrokerReportResponse>;
    /** Метод получения отчёта "Справка о доходах за пределами РФ". */
    getDividendsForeignIssuer(request: DeepPartial<GetDividendsForeignIssuerRequest>, options?: CallOptions & CallOptionsExt): Promise<GetDividendsForeignIssuerResponse>;
    /**
     * Метод получения списка операций по счёту с пагинацией. При работе с данным методом необходимо учитывать
     * [особенности взаимодействия](/investAPI/operations_problems) с данным методом.
     */
    getOperationsByCursor(request: DeepPartial<GetOperationsByCursorRequest>, options?: CallOptions & CallOptionsExt): Promise<GetOperationsByCursorResponse>;
}
export type OperationsStreamServiceDefinition = typeof OperationsStreamServiceDefinition;
export declare const OperationsStreamServiceDefinition: {
    readonly name: "OperationsStreamService";
    readonly fullName: "tinkoff.public.invest.api.contract.v1.OperationsStreamService";
    readonly methods: {
        /** Server-side stream обновлений портфеля */
        readonly portfolioStream: {
            readonly name: "PortfolioStream";
            readonly requestType: {
                encode(message: PortfolioStreamRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioStreamRequest;
                fromJSON(object: any): PortfolioStreamRequest;
                toJSON(message: PortfolioStreamRequest): unknown;
                create(base?: DeepPartial<PortfolioStreamRequest>): PortfolioStreamRequest;
                fromPartial(object: DeepPartial<PortfolioStreamRequest>): PortfolioStreamRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PortfolioStreamResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PortfolioStreamResponse;
                fromJSON(object: any): PortfolioStreamResponse;
                toJSON(message: PortfolioStreamResponse): unknown;
                create(base?: DeepPartial<PortfolioStreamResponse>): PortfolioStreamResponse;
                fromPartial(object: DeepPartial<PortfolioStreamResponse>): PortfolioStreamResponse;
            };
            readonly responseStream: true;
            readonly options: {};
        };
        /** Server-side stream обновлений информации по изменению позиций портфеля */
        readonly positionsStream: {
            readonly name: "PositionsStream";
            readonly requestType: {
                encode(message: PositionsStreamRequest, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PositionsStreamRequest;
                fromJSON(object: any): PositionsStreamRequest;
                toJSON(message: PositionsStreamRequest): unknown;
                create(base?: DeepPartial<PositionsStreamRequest>): PositionsStreamRequest;
                fromPartial(object: DeepPartial<PositionsStreamRequest>): PositionsStreamRequest;
            };
            readonly requestStream: false;
            readonly responseType: {
                encode(message: PositionsStreamResponse, writer?: _m0.Writer): _m0.Writer;
                decode(input: _m0.Reader | Uint8Array, length?: number): PositionsStreamResponse;
                fromJSON(object: any): PositionsStreamResponse;
                toJSON(message: PositionsStreamResponse): unknown;
                create(base?: DeepPartial<PositionsStreamResponse>): PositionsStreamResponse;
                fromPartial(object: DeepPartial<PositionsStreamResponse>): PositionsStreamResponse;
            };
            readonly responseStream: true;
            readonly options: {};
        };
    };
};
export interface OperationsStreamServiceImplementation<CallContextExt = {}> {
    /** Server-side stream обновлений портфеля */
    portfolioStream(request: PortfolioStreamRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<PortfolioStreamResponse>>;
    /** Server-side stream обновлений информации по изменению позиций портфеля */
    positionsStream(request: PositionsStreamRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<PositionsStreamResponse>>;
}
export interface OperationsStreamServiceClient<CallOptionsExt = {}> {
    /** Server-side stream обновлений портфеля */
    portfolioStream(request: DeepPartial<PortfolioStreamRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<PortfolioStreamResponse>;
    /** Server-side stream обновлений информации по изменению позиций портфеля */
    positionsStream(request: DeepPartial<PositionsStreamRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<PositionsStreamResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export type ServerStreamingMethodResult<Response> = {
    [Symbol.asyncIterator](): AsyncIterator<Response, void>;
};
export {};
