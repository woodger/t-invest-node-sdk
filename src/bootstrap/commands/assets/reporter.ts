/**
 * Модуль CLI-репортинга команды `instruments get-assets`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { AssetsReport } from '../../../application/reports';
import type { Asset } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import {
  assetFormats,
  createAssetReportSummary,
  renderAssetRows,
  type AssetFormat
} from '../asset/reporter';

export const assetsFormats = assetFormats;

export type AssetsFormat = AssetFormat;

export function createAssetsReport(assets: Asset[]): AssetsReport {
  return assets.map(createAssetReportSummary);
}

export function formatAssetsReport(report: AssetsReport, format: AssetsFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderAssetRows(report);
}

export function formatAssets(assets: Asset[], format: AssetsFormat): string {
  return formatAssetsReport(createAssetsReport(assets), format);
}
