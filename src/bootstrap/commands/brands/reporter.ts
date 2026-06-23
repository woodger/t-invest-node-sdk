/**
 * Модуль CLI-репортинга команды `instruments get-brands`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { BrandsReport, BrandsReportBrand } from '../../../application/reports';
import type { Brand } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const brandsFormats = ['json', 'table'] as const;

export type BrandsFormat = typeof brandsFormats[number];

export function createBrandReport(brand: Brand): BrandsReportBrand {
  return {
    uid: brand.uid,
    name: brand.name,
    description: brand.description,
    info: brand.info,
    company: brand.company,
    sector: brand.sector,
    countryOfRisk: brand.countryOfRisk,
    countryOfRiskName: brand.countryOfRiskName
  };
}

export function createBrandsReport(brands: Brand[]): BrandsReport {
  return brands.map(createBrandReport);
}

export function formatBrandsReport(report: BrandsReport, format: BrandsFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['uid', 'name', 'company', 'sector', 'countryOfRisk', 'countryOfRiskName'],
    ...report.map((brand) => [
      brand.uid,
      brand.name,
      brand.company,
      brand.sector,
      brand.countryOfRisk,
      brand.countryOfRiskName
    ])
  ]);
}

export function formatBrands(brands: Brand[], format: BrandsFormat): string {
  return formatBrandsReport(createBrandsReport(brands), format);
}
