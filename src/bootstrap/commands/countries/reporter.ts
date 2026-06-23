/**
 * Модуль CLI-репортинга команды `instruments get-countries`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { CountriesReport, CountriesReportCountry } from '../../../application/reports';
import type { CountryResponse } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const countriesFormats = ['json', 'table'] as const;

export type CountriesFormat = typeof countriesFormats[number];

function toReportCountry(country: CountryResponse): CountriesReportCountry {
  return {
    alfaTwo: country.alfaTwo,
    alfaThree: country.alfaThree,
    name: country.name,
    nameBrief: country.nameBrief
  };
}

export function createCountriesReport(countries: CountryResponse[]): CountriesReport {
  return countries.map(toReportCountry);
}

export function formatCountriesReport(
  report: CountriesReport,
  format: CountriesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['alfaTwo', 'alfaThree', 'name', 'nameBrief'],
    ...report.map((country) => [
      country.alfaTwo,
      country.alfaThree,
      country.name,
      country.nameBrief
    ])
  ]);
}

export function formatCountries(countries: CountryResponse[], format: CountriesFormat): string {
  return formatCountriesReport(createCountriesReport(countries), format);
}
