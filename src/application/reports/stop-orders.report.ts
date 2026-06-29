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

/** Одна активная стоп-заявка в отчете команды `stoporders get-stop-orders`. */
export interface StopOrdersReportOrder {
  /** Идентификатор стоп-заявки. */
  stopOrderId: string;
  /** Запрошенное количество лотов. */
  lotsRequested: number;
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Направление стоп-заявки в формате generated enum JSON name. */
  direction: string;
  /** Валюта стоп-заявки. */
  currency: string;
  /** Тип стоп-заявки в формате generated enum JSON name. */
  orderType: string;
  /** Дата создания в ISO-формате или пустая строка. */
  createDate: string;
  /** Дата активации в ISO-формате или пустая строка. */
  activationDateTime: string;
  /** Дата истечения в ISO-формате или пустая строка. */
  expirationTime: string;
  /** Цена заявки или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Стоп-цена или `null`, если provider не вернул значение. */
  stopPrice: ReportMoney | null;
}

/** Отчет команды `stoporders get-stop-orders` на application/output boundary. */
export type StopOrdersReport = StopOrdersReportOrder[];
