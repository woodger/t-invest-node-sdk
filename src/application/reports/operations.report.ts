/** Одна операция в отчете команды `operations get-operations`. */
export interface OperationsReportOperation {
  id: string;
  parentOperationId: string;
  date: string;
  type: string;
  operationType: string;
  state: string;
  currency: string;
  payment: string;
  price: string;
  quantity: number;
  quantityRest: number;
  figi: string;
  instrumentUid: string;
  positionUid: string;
  assetUid: string;
  instrumentType: string;
  tradesCount: number;
}

/** Отчет команды `operations get-operations` на application/output boundary. */
export type OperationsReport = OperationsReportOperation[];
