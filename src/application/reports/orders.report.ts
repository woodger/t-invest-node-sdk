/** Одна стадия исполнения заявки в отчете команды `orders get-orders`. */
export interface OrdersReportStage {
  /** Цена исполнения стадии в денежном строковом формате отчета. */
  price: string;
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
  /** Начальная цена заявки в денежном строковом формате отчета. */
  initialOrderPrice: string;
  /** Исполненная цена заявки в денежном строковом формате отчета. */
  executedOrderPrice: string;
  /** Полная сумма заявки в денежном строковом формате отчета. */
  totalOrderAmount: string;
  /** Средняя цена позиции в денежном строковом формате отчета. */
  averagePositionPrice: string;
  /** Начальная комиссия в денежном строковом формате отчета. */
  initialCommission: string;
  /** Исполненная комиссия в денежном строковом формате отчета. */
  executedCommission: string;
  /** Сервисная комиссия в денежном строковом формате отчета. */
  serviceCommission: string;
  /** Валюта заявки. */
  currency: string;
  /** Дата заявки в ISO-формате или пустая строка. */
  orderDate: string;
  /** Стадии исполнения заявки. */
  stages: OrdersReportStage[];
}

/** Отчет команды `orders get-orders` на application/output boundary. */
export type OrdersReport = OrdersReportOrder[];
