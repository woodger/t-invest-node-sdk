/** Денежная позиция в отчете команды `operations get-positions`. */
export interface PositionsReportMoney {
  /** Валюта денежной позиции. */
  currency: string;
  /** Сумма в строковом формате quotation. */
  amount: string;
}

/** Позиция ценной бумаги в отчете команды `operations get-positions`. */
export interface PositionsReportSecurity {
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Баланс позиции. */
  balance: number;
  /** Заблокированное количество. */
  blocked: number;
  /** Признак блокировки биржей. */
  exchangeBlocked: boolean;
}

/** Позиция фьючерса в отчете команды `operations get-positions`. */
export interface PositionsReportFuture {
  /** FIGI фьючерса. */
  figi: string;
  /** UID фьючерса. */
  instrumentUid: string;
  /** UID позиции фьючерса. */
  positionUid: string;
  /** Баланс позиции. */
  balance: number;
  /** Заблокированное количество. */
  blocked: number;
}

/** Позиция опциона в отчете команды `operations get-positions`. */
export interface PositionsReportOption {
  /** UID опциона. */
  instrumentUid: string;
  /** UID позиции опциона. */
  positionUid: string;
  /** Баланс позиции. */
  balance: number;
  /** Заблокированное количество. */
  blocked: number;
}

/** Отчет команды `operations get-positions` на application/output boundary. */
export interface PositionsReport {
  /** Признак загрузки лимитов. */
  limitsLoadingInProgress: boolean;
  /** Денежные позиции. */
  money: PositionsReportMoney[];
  /** Заблокированные денежные позиции. */
  blocked: PositionsReportMoney[];
  /** Позиции ценных бумаг. */
  securities: PositionsReportSecurity[];
  /** Позиции фьючерсов. */
  futures: PositionsReportFuture[];
  /** Позиции опционов. */
  options: PositionsReportOption[];
}
