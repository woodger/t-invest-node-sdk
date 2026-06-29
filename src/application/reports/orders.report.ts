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

/** Одна стадия исполнения заявки в отчете команды `orders get-orders`. */
export interface OrdersReportStage {
  /** Цена исполнения стадии или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Количество лотов в стадии исполнения. */
  quantity: number;
  /** Идентификатор сделки стадии исполнения. */
  tradeId: string;
}

/** Одна активная заявка в отчете команды `orders get-orders`. */
export interface OrdersReportOrder {
  /** Идентификатор заявки. */
  orderId: string;
  /** Идентификатор запроса выставления заявки. */
  orderRequestId: string;
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Статус заявки в формате generated enum JSON name. */
  status: string;
  /** Направление заявки в формате generated enum JSON name. */
  direction: string;
  /** Тип заявки в формате generated enum JSON name. */
  orderType: string;
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
  /** Средняя цена позиции или `null`, если provider не вернул значение. */
  averagePositionPrice: ReportMoney | null;
  /** Начальная комиссия или `null`, если provider не вернул значение. */
  initialCommission: ReportMoney | null;
  /** Исполненная комиссия или `null`, если provider не вернул значение. */
  executedCommission: ReportMoney | null;
  /** Сервисная комиссия или `null`, если provider не вернул значение. */
  serviceCommission: ReportMoney | null;
  /** Валюта заявки. */
  currency: string;
  /** Дата заявки в ISO-формате или пустая строка. */
  orderDate: string;
  /** Стадии исполнения заявки. */
  stages: OrdersReportStage[];
}

/** Отчет команды `orders get-orders` на application/output boundary. */
export type OrdersReport = OrdersReportOrder[];
