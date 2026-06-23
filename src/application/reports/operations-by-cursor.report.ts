/** Метаданные страницы в отчете команды `operations get-operations-by-cursor`. */
export interface OperationsByCursorReportPage {
  hasNext: boolean;
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
  date: string;
  type: string;
  description: string;
  state: string;
  figi: string;
  instrumentUid: string;
  instrumentType: string;
  instrumentKind: string;
  positionUid: string;
  payment: string;
  price: string;
  commission: string;
  yield: string;
  yieldRelative: string;
  accruedInt: string;
  quantity: number;
  quantityRest: number;
  quantityDone: number;
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
