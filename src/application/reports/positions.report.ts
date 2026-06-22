/** Денежная позиция в отчете команды `positions`. */
export interface PositionsReportMoney {
  currency: string;
  amount: string;
}

/** Позиция ценной бумаги в отчете команды `positions`. */
export interface PositionsReportSecurity {
  figi: string;
  instrumentUid: string;
  positionUid: string;
  instrumentType: string;
  balance: number;
  blocked: number;
  exchangeBlocked: boolean;
}

/** Позиция фьючерса в отчете команды `positions`. */
export interface PositionsReportFuture {
  figi: string;
  instrumentUid: string;
  positionUid: string;
  balance: number;
  blocked: number;
}

/** Позиция опциона в отчете команды `positions`. */
export interface PositionsReportOption {
  instrumentUid: string;
  positionUid: string;
  balance: number;
  blocked: number;
}

/** Отчет команды `positions` на application/output boundary. */
export interface PositionsReport {
  limitsLoadingInProgress: boolean;
  money: PositionsReportMoney[];
  blocked: PositionsReportMoney[];
  securities: PositionsReportSecurity[];
  futures: PositionsReportFuture[];
  options: PositionsReportOption[];
}
