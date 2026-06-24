/** Сводка портфеля в отчете команды `operations get-portfolio`. */
export interface PortfolioReportSummary {
  /** Идентификатор счета. */
  accountId: string;
  /** Полная стоимость портфеля в денежном строковом формате отчета. */
  totalAmountPortfolio: string;
  /** Стоимость акций в денежном строковом формате отчета. */
  totalAmountShares: string;
  /** Стоимость облигаций в денежном строковом формате отчета. */
  totalAmountBonds: string;
  /** Стоимость ETF в денежном строковом формате отчета. */
  totalAmountEtf: string;
  /** Стоимость валют в денежном строковом формате отчета. */
  totalAmountCurrencies: string;
  /** Стоимость фьючерсов в денежном строковом формате отчета. */
  totalAmountFutures: string;
  /** Стоимость опционов в денежном строковом формате отчета. */
  totalAmountOptions: string;
  /** Стоимость структурных продуктов в денежном строковом формате отчета. */
  totalAmountSp: string;
  /** Ожидаемая доходность в строковом формате quotation. */
  expectedYield: string;
}

/** Одна позиция портфеля в отчете команды `operations get-portfolio`. */
export interface PortfolioReportPosition {
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Количество инструмента в строковом формате quotation. */
  quantity: string;
  /** Средняя цена позиции в денежном строковом формате отчета. */
  averagePositionPrice: string;
  /** Текущая цена в денежном строковом формате отчета. */
  currentPrice: string;
  /** Ожидаемая доходность в строковом формате quotation. */
  expectedYield: string;
  /** Признак заблокированной позиции. */
  blocked: boolean;
}

/** Отчет команды `operations get-portfolio` на application/output boundary. */
export interface PortfolioReport {
  /** Сводка портфеля. */
  summary: PortfolioReportSummary;
  /** Позиции портфеля. */
  positions: PortfolioReportPosition[];
}
