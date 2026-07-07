/**
 * Модуль CLI-репортинга команды `instrument get-brand-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { BrandReport } from '../../../application/reports';
import type { Brand } from '../../../generated/instruments';
import { renderJson, renderTextTable } from 'icore';
import {
  brandsFormats,
  createBrandReport,
  type BrandsFormat
} from '../brands/reporter';

export const brandFormats = brandsFormats;

export type BrandFormat = BrandsFormat;

export function createSingleBrandReport(brand: Brand): BrandReport {
  return createBrandReport(brand);
}

export function formatBrandReport(report: BrandReport, format: BrandFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['uid', 'name', 'company', 'sector', 'countryOfRisk', 'countryOfRiskName'],
    [
      report.uid,
      report.name,
      report.company,
      report.sector,
      report.countryOfRisk,
      report.countryOfRiskName
    ]
  ]);
}

export function formatBrand(brand: Brand, format: BrandFormat): string {
  return formatBrandReport(createSingleBrandReport(brand), format);
}
