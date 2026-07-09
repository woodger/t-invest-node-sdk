/**
 * Модуль CLI-репортинга команды `instrument asset list`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { AssetsReport } from '../../../application/reports';
import type { Asset } from '../../../generated/t_tech/invest/grpc/instruments';
import { renderJson } from 'icore';
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
