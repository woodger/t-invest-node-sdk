/**
 * Модуль CLI-репортинга команды `instruments currencies`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { CurrenciesReport } from '../../../application/reports';
import type { Currency } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import {
  createCurrencyReportInstrument,
  currencyFormats,
  renderCurrencyRows,
  type CurrencyFormat
} from '../currency/reporter';

export const currenciesFormats = currencyFormats;

export type CurrenciesFormat = CurrencyFormat;

export function createCurrenciesReport(instruments: Currency[]): CurrenciesReport {
  return instruments.map(createCurrencyReportInstrument);
}

export function formatCurrenciesReport(
  report: CurrenciesReport,
  format: CurrenciesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderCurrencyRows(report);
}

export function formatCurrencies(instruments: Currency[], format: CurrenciesFormat): string {
  return formatCurrenciesReport(createCurrenciesReport(instruments), format);
}
