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

/** Результат успешного вызова `orders post-order` или `orders replace-order`. */
export interface OrderMutationReport {
  /** Биржевой идентификатор заявки, который вернул provider. */
  orderId: string;
  /** Статус исполнения в формате generated enum JSON name. */
  status: string;
  /** Запрошенное количество лотов. */
  lotsRequested: number;
  /** Исполненное количество лотов. */
  lotsExecuted: number;
  /** Начальная цена заявки или `null`, если provider не вернул значение. */
  initialOrderPrice: ReportMoney | null;
  /** Исполненная цена заявки или `null`, если provider не вернул значение. */
  executedOrderPrice: ReportMoney | null;
  /** Полная сумма заявки или `null`, если provider не вернул значение. */
  totalOrderAmount: ReportMoney | null;
  /** Начальная комиссия или `null`, если provider не вернул значение. */
  initialCommission: ReportMoney | null;
  /** Исполненная комиссия или `null`, если provider не вернул значение. */
  executedCommission: ReportMoney | null;
  /** НКД или `null`, если provider не вернул значение. */
  aciValue: ReportMoney | null;
  /** FIGI инструмента, который вернул provider. */
  figi: string;
  /** Направление заявки в формате generated enum JSON name. */
  direction: string;
  /** Начальная цена инструмента или `null`, если provider не вернул значение. */
  initialSecurityPrice: ReportMoney | null;
  /** Тип заявки в формате generated enum JSON name. */
  orderType: string;
  /** Сообщение provider-а об исполнении. */
  message: string;
  /** Начальная цена заявки в пунктах как decimal string или пустая строка. */
  initialOrderPricePt: string;
  /** UID инструмента, который вернул provider. */
  instrumentUid: string;
}
