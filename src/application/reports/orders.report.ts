/** Одна стадия исполнения заявки в отчете команды `orders`. */
export interface OrdersReportStage {
  price: string;
  quantity: number;
  tradeId: string;
}

/** Одна активная заявка в отчете команды `orders`. */
export interface OrdersReportOrder {
  orderId: string;
  orderRequestId: string;
  figi: string;
  instrumentUid: string;
  status: string;
  direction: string;
  orderType: string;
  lotsRequested: number;
  lotsExecuted: number;
  initialOrderPrice: string;
  executedOrderPrice: string;
  totalOrderAmount: string;
  averagePositionPrice: string;
  initialCommission: string;
  executedCommission: string;
  serviceCommission: string;
  currency: string;
  orderDate: string;
  stages: OrdersReportStage[];
}

/** Отчет команды `orders` на application/output boundary. */
export type OrdersReport = OrdersReportOrder[];
