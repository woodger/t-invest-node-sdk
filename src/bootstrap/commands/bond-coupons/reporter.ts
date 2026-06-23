/**
 * Модуль CLI-репортинга команды `instruments get-bond-coupons`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { BondCouponsReport, BondCouponsReportCoupon } from '../../../application/reports';
import type { MoneyValue } from '../../../generated/common';
import {
  couponTypeToJSON,
  type Coupon
} from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const bondCouponsFormats = ['json', 'table'] as const;

export type BondCouponsFormat = typeof bondCouponsFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function formatMoney(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const amount = formatDecimal(value);

  return value.currency === '' ? amount : `${amount} ${value.currency}`;
}

function toReportCoupon(coupon: Coupon): BondCouponsReportCoupon {
  return {
    figi: coupon.figi,
    couponDate: formatDate(coupon.couponDate),
    couponNumber: coupon.couponNumber,
    fixDate: formatDate(coupon.fixDate),
    payOneBond: formatMoney(coupon.payOneBond),
    couponType: couponTypeToJSON(coupon.couponType),
    couponStartDate: formatDate(coupon.couponStartDate),
    couponEndDate: formatDate(coupon.couponEndDate),
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
      coupon.payOneBond,
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
