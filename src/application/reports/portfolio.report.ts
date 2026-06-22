/** Сводка портфеля в отчете команды `portfolio`. */
export interface PortfolioReportSummary {
  accountId: string;
  totalAmountPortfolio: string;
  totalAmountShares: string;
  totalAmountBonds: string;
  totalAmountEtf: string;
  totalAmountCurrencies: string;
  totalAmountFutures: string;
  totalAmountOptions: string;
  totalAmountSp: string;
  expectedYield: string;
}

/** Одна позиция портфеля в отчете команды `portfolio`. */
export interface PortfolioReportPosition {
  figi: string;
  instrumentUid: string;
  positionUid: string;
  instrumentType: string;
  quantity: string;
  averagePositionPrice: string;
  currentPrice: string;
  expectedYield: string;
  blocked: boolean;
}

/** Отчет команды `portfolio` на application/output boundary. */
export interface PortfolioReport {
  summary: PortfolioReportSummary;
  positions: PortfolioReportPosition[];
}
