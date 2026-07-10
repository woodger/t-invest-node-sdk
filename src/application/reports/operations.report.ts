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

/** Одна операция в отчете команды `operations get-operations`. */
export interface OperationsReportOperation {
  id: string;
  parentOperationId: string;
  /** Дата операции в ISO-формате или пустая строка. */
  date: string;
  /** Тип операции из provider contract. */
  type: string;
  /** Тип операции в формате generated enum JSON name. */
  operationType: string;
  /** Статус операции в формате generated enum JSON name. */
  state: string;
  currency: string;
  /** Платеж по операции или `null`, если provider не вернул значение. */
  payment: ReportMoney | null;
  /** Цена операции или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Количество инструментов в операции. */
  quantity: number;
  quantityRest: number;
  figi: string;
  instrumentUid: string;
  positionUid: string;
  assetUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  tradesCount: number;
}

/** Отчет команды `operations get-operations` на application/output boundary. */
export type OperationsReport = OperationsReportOperation[];
