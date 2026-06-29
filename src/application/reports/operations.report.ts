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
  /** Идентификатор операции. */
  id: string;
  /** Идентификатор родительской операции. */
  parentOperationId: string;
  /** Дата операции в ISO-формате или пустая строка. */
  date: string;
  /** Тип операции из provider contract. */
  type: string;
  /** Тип операции в формате generated enum JSON name. */
  operationType: string;
  /** Статус операции в формате generated enum JSON name. */
  state: string;
  /** Валюта операции. */
  currency: string;
  /** Платеж по операции или `null`, если provider не вернул значение. */
  payment: ReportMoney | null;
  /** Цена операции или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Количество инструментов в операции. */
  quantity: number;
  /** Остаток количества по операции. */
  quantityRest: number;
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** UID актива. */
  assetUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Количество сделок в операции. */
  tradesCount: number;
}

/** Отчет команды `operations get-operations` на application/output boundary. */
export type OperationsReport = OperationsReportOperation[];
