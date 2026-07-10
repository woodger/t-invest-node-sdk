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

/** Метаданные страницы в отчете команды `operations get-operations-by-cursor`. */
export interface OperationsByCursorReportPage {
  hasNext: boolean;
  /** Cursor следующей страницы или пустая строка. */
  nextCursor: string;
  itemsCount: number;
}

/** Одна операция в отчете команды `operations get-operations-by-cursor`. */
export interface OperationsByCursorReportItem {
  cursor: string;
  brokerAccountId: string;
  id: string;
  parentOperationId: string;
  name: string;
  /** Дата операции в ISO-формате или пустая строка. */
  date: string;
  /** Тип операции в формате generated enum JSON name. */
  type: string;
  description: string;
  /** Статус операции в формате generated enum JSON name. */
  state: string;
  figi: string;
  instrumentUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  positionUid: string;
  /** Платеж по операции или `null`, если provider не вернул значение. */
  payment: ReportMoney | null;
  /** Цена операции или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Комиссия или `null`, если provider не вернул значение. */
  commission: ReportMoney | null;
  /** Доходность или `null`, если provider не вернул значение. */
  yield: ReportMoney | null;
  /** Относительная доходность в строковом формате quotation. */
  yieldRelative: string;
  /** НКД или `null`, если provider не вернул значение. */
  accruedInt: ReportMoney | null;
  /** Количество инструментов в операции. */
  quantity: number;
  quantityRest: number;
  quantityDone: number;
  /** Дата отмены операции в ISO-формате или пустая строка. */
  cancelDateTime: string;
  cancelReason: string;
  assetUid: string;
  tradesCount: number;
}

/** Отчет команды `operations get-operations-by-cursor` на application/output boundary. */
export interface OperationsByCursorReport {
  page: OperationsByCursorReportPage;
  items: OperationsByCursorReportItem[];
}
