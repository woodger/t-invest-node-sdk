/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { ReportMoney } from './money.report';

/** Сводка портфеля в отчете команды `operations get-portfolio`. */
export interface PortfolioReportSummary {
  accountId: string;
  /** Полная стоимость портфеля или `null`, если provider не вернул значение. */
  totalAmountPortfolio: ReportMoney | null;
  /** Стоимость акций или `null`, если provider не вернул значение. */
  totalAmountShares: ReportMoney | null;
  /** Стоимость облигаций или `null`, если provider не вернул значение. */
  totalAmountBonds: ReportMoney | null;
  /** Стоимость ETF или `null`, если provider не вернул значение. */
  totalAmountEtf: ReportMoney | null;
  /** Стоимость валют или `null`, если provider не вернул значение. */
  totalAmountCurrencies: ReportMoney | null;
  /** Стоимость фьючерсов или `null`, если provider не вернул значение. */
  totalAmountFutures: ReportMoney | null;
  /** Стоимость опционов или `null`, если provider не вернул значение. */
  totalAmountOptions: ReportMoney | null;
  /** Стоимость структурных продуктов или `null`, если provider не вернул значение. */
  totalAmountSp: ReportMoney | null;
  /** Ожидаемая доходность в строковом формате quotation. */
  expectedYield: string;
}

/** Одна позиция портфеля в отчете команды `operations get-portfolio`. */
export interface PortfolioReportPosition {
  figi: string;
  instrumentUid: string;
  positionUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Количество инструмента в строковом формате quotation. */
  quantity: string;
  /** Средняя цена позиции или `null`, если provider не вернул значение. */
  averagePositionPrice: ReportMoney | null;
  /** Текущая цена или `null`, если provider не вернул значение. */
  currentPrice: ReportMoney | null;
  /** Ожидаемая доходность в строковом формате quotation. */
  expectedYield: string;
  blocked: boolean;
}

/** Отчет команды `operations get-portfolio` на application/output boundary. */
export interface PortfolioReport {
  summary: PortfolioReportSummary;
  positions: PortfolioReportPosition[];
}
