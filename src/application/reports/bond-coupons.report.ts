/** Один купон в отчете команды `instruments get-bond-coupons`. */
export interface BondCouponsReportCoupon {
  /** FIGI облигации. */
  figi: string;
  /** Дата выплаты купона в ISO-формате или пустая строка. */
  couponDate: string;
  /** Номер купона. */
  couponNumber: number;
  /** Дата фиксации реестра в ISO-формате или пустая строка. */
  fixDate: string;
  /** Выплата на одну облигацию в денежном строковом формате отчета. */
  payOneBond: string;
  /** Тип купона в формате generated enum JSON name. */
  couponType: string;
  /** Начало купонного периода в ISO-формате или пустая строка. */
  couponStartDate: string;
  /** Окончание купонного периода в ISO-формате или пустая строка. */
  couponEndDate: string;
  /** Длительность купонного периода в днях. */
  couponPeriod: number;
}

/** Отчет команды `instruments get-bond-coupons` на application/output boundary. */
export type BondCouponsReport = BondCouponsReportCoupon[];
