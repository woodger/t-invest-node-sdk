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

/** Позиция ценной бумаги в отчете команды `operations get-positions`. */
export interface PositionsReportSecurity {
  figi: string;
  instrumentUid: string;
  positionUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  balance: number;
  blocked: number;
  exchangeBlocked: boolean;
}

/** Позиция фьючерса в отчете команды `operations get-positions`. */
export interface PositionsReportFuture {
  figi: string;
  instrumentUid: string;
  positionUid: string;
  balance: number;
  blocked: number;
}

/** Позиция опциона в отчете команды `operations get-positions`. */
export interface PositionsReportOption {
  instrumentUid: string;
  positionUid: string;
  balance: number;
  blocked: number;
}

/** Отчет команды `operations get-positions` на application/output boundary. */
export interface PositionsReport {
  limitsLoadingInProgress: boolean;
  money: ReportMoney[];
  blocked: ReportMoney[];
  securities: PositionsReportSecurity[];
  futures: PositionsReportFuture[];
  options: PositionsReportOption[];
}
