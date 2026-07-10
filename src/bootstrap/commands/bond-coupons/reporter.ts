/**
 * Модуль CLI-репортинга команды `instrument bond coupons`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { BondCouponsReport, BondCouponsReportCoupon } from '../../../application/reports';
import { couponTypeToJSON, type Coupon } from '../../../generated/instruments';
import {
  formatReportDate,
  formatReportMoneyText,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const bondCouponsFormats = ['json', 'table'] as const;

export type BondCouponsFormat = typeof bondCouponsFormats[number];

function toReportCoupon(coupon: Coupon): BondCouponsReportCoupon {
  return {
    figi: coupon.figi,
    couponDate: formatReportDate(coupon.couponDate),
    couponNumber: coupon.couponNumber,
    fixDate: formatReportDate(coupon.fixDate),
    payOneBond: toReportMoney(coupon.payOneBond),
    couponType: couponTypeToJSON(coupon.couponType),
    couponStartDate: formatReportDate(coupon.couponStartDate),
    couponEndDate: formatReportDate(coupon.couponEndDate),
    couponPeriod: coupon.couponPeriod
  };
}

export function createBondCouponsReport(coupons: Coupon[]): BondCouponsReport {
  return coupons.map(toReportCoupon);
}

export function formatBondCouponsReport(
  report: BondCouponsReport,
  format: BondCouponsFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'figi',
      'couponDate',
      'couponNumber',
      'fixDate',
      'payOneBond',
      'couponType',
      'couponStartDate',
      'couponEndDate',
      'couponPeriod'
    ],
    ...report.map((coupon) => [
      coupon.figi,
      coupon.couponDate,
      String(coupon.couponNumber),
      coupon.fixDate,
      formatReportMoneyText(coupon.payOneBond),
      coupon.couponType,
      coupon.couponStartDate,
      coupon.couponEndDate,
      String(coupon.couponPeriod)
    ])
  ]);
}

export function formatBondCoupons(coupons: Coupon[], format: BondCouponsFormat): string {
  return formatBondCouponsReport(createBondCouponsReport(coupons), format);
}
