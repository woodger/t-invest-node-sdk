/** Один день торговой площадки в отчете команды `instruments trading-schedules`. */
export interface TradingSchedulesReportDay {
  exchange: string;
  date: string;
  isTradingDay: boolean;
  startTime: string;
  endTime: string;
  openingAuctionStartTime: string;
  openingAuctionEndTime: string;
  closingAuctionStartTime: string;
  closingAuctionEndTime: string;
  eveningOpeningAuctionStartTime: string;
  eveningStartTime: string;
  eveningEndTime: string;
  clearingStartTime: string;
  clearingEndTime: string;
  premarketStartTime: string;
  premarketEndTime: string;
}

/** Отчет команды `instruments trading-schedules` на application/output boundary. */
export type TradingSchedulesReport = TradingSchedulesReportDay[];
