/**
 * Scalar value adapters for stable CLI report contracts.
 *
 * The module converts provider scalar DTO values into reusable application
 * report values and presentation strings. It must not know command names,
 * command report shapes, renderers or stdout/stderr delivery.
 */

import type { ReportMoney } from '../application/reports/money.report';
import type { MoneyValue, Quotation } from '../generated/common';

type DecimalValue = {
  units: number;
  nano: number;
};

export function formatReportDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

export function formatReportDecimal(value: DecimalValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const nanosPerUnit = 1_000_000_000n;
  const totalNanos = BigInt(value.units) * nanosPerUnit + BigInt(value.nano);
  const sign = totalNanos < 0n ? '-' : '';
  const absoluteNanos = totalNanos < 0n ? -totalNanos : totalNanos;
  const units = absoluteNanos / nanosPerUnit;
  const nanos = absoluteNanos % nanosPerUnit;

  if (nanos === 0n) {
    return `${sign}${units}`;
  }

  const fraction = nanos.toString().padStart(9, '0').replace(/0+$/, '');

  return `${sign}${units}.${fraction}`;
}

export function toReportMoney(value: MoneyValue): ReportMoney;
export function toReportMoney(value: MoneyValue | undefined): ReportMoney | null;
export function toReportMoney(value: MoneyValue | undefined): ReportMoney | null {
  if (value === undefined) {
    return null;
  }

  return {
    currency: value.currency,
    amount: formatReportDecimal(value)
  };
}

export function formatReportMoneyText(value: ReportMoney | null | undefined): string {
  if (value == null) {
    return '';
  }

  return value.currency === '' ? value.amount : `${value.amount} ${value.currency}`;
}

export function formatReportQuotation(value: Quotation | undefined): string {
  return formatReportDecimal(value);
}
