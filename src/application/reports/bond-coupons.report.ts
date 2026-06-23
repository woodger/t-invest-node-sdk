/** Один купон в отчете команды `instruments get-bond-coupons`. */
export interface BondCouponsReportCoupon {
  figi: string;
  couponDate: string;
  couponNumber: number;
  fixDate: string;
  payOneBond: string;
  couponType: string;
  couponStartDate: string;
  couponEndDate: string;
  couponPeriod: number;
}

/** Отчет команды `instruments get-bond-coupons` на application/output boundary. */
export type BondCouponsReport = BondCouponsReportCoupon[];
