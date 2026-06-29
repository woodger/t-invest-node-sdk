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
  /** Выплата на одну облигацию или `null`, если provider не вернул значение. */
  payOneBond: ReportMoney | null;
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
