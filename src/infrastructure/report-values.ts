/**
 * Scalar value adapters for stable CLI report contracts.
 *
 * The module converts provider scalar DTO values into the string values used by
 * application reports. It must not know command names, report shapes, renderers
 * or stdout/stderr delivery.
 */

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

  return String(value.units + value.nano / 1e9);
}

export function formatReportMoney(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const amount = formatReportDecimal(value);

  return value.currency === '' ? amount : `${amount} ${value.currency}`;
}

export function formatReportQuotation(value: Quotation | undefined): string {
  return formatReportDecimal(value);
}
