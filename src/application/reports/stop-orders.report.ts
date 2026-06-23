/** Одна активная стоп-заявка в отчете команды `stoporders get-stop-orders`. */
export interface StopOrdersReportOrder {
  stopOrderId: string;
  lotsRequested: number;
  figi: string;
  instrumentUid: string;
  direction: string;
  currency: string;
  orderType: string;
  createDate: string;
  activationDateTime: string;
  expirationTime: string;
  price: string;
  stopPrice: string;
}

/** Отчет команды `stoporders get-stop-orders` на application/output boundary. */
export type StopOrdersReport = StopOrdersReportOrder[];
