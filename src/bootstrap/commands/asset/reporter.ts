/**
 * Модуль CLI-репортинга команды `instrument get-asset-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import {
  type AssetReport,
  type AssetReportBrand,
  type AssetReportInstrument,
  type AssetReportSummary
} from '../../../application/reports';
import { instrumentTypeToJSON } from '../../../generated/common';
import type {
  Asset,
  AssetFull,
  AssetInstrument,
  AssetResponse,
  Brand
} from '../../../generated/instruments';
import { assetTypeToJSON } from '../../../generated/instruments';
import {
  formatReportDate
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const assetFormats = ['json', 'table'] as const;

export type AssetFormat = typeof assetFormats[number];

function createAssetReportBrand(brand: Brand | undefined): AssetReportBrand | null {
  if (brand === undefined) {
    return null;
  }

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

export function createAssetReportInstrument(instrument: AssetInstrument): AssetReportInstrument {
  return {
    uid: instrument.uid,
    figi: instrument.figi,
    instrumentType: instrument.instrumentType,
    instrumentKind: instrumentTypeToJSON(instrument.instrumentKind),
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    positionUid: instrument.positionUid,
    links: instrument.links.map((link) => ({
      type: link.type,
      instrumentUid: link.instrumentUid
    }))
  };
}

export function createAssetReportSummary(asset: Asset): AssetReportSummary {
  return {
    uid: asset.uid,
    type: assetTypeToJSON(asset.type),
    name: asset.name,
    instruments: asset.instruments.map(createAssetReportInstrument)
  };
}

export function createAssetReport(response: AssetResponse): AssetReport {
  if (response.asset === undefined) {
    return null;
  }

  const asset: AssetFull = response.asset;
  const summary = createAssetReportSummary(asset);

  return {
    ...summary,
    nameBrief: asset.nameBrief,
    description: asset.description,
    deletedAt: formatReportDate(asset.deletedAt),
    requiredTests: [...asset.requiredTests],
    currencyBaseCurrency: asset.currency?.baseCurrency ?? '',
    securityIsin: asset.security?.isin ?? '',
    securityType: asset.security?.type ?? '',
    securityInstrumentKind: asset.security === undefined
      ? ''
      : instrumentTypeToJSON(asset.security.instrumentKind),
    gosRegCode: asset.gosRegCode,
    cfi: asset.cfi,
    codeNsd: asset.codeNsd,
    status: asset.status,
    brand: createAssetReportBrand(asset.brand),
    updatedAt: formatReportDate(asset.updatedAt),
    brCode: asset.brCode,
    brCodeName: asset.brCodeName
  };
}

export function renderAssetRows(report: AssetReportSummary[]): string {
  return renderTextTable([
    [
      'uid',
      'type',
      'name',
      'instrumentsCount',
      'firstInstrumentUid',
      'firstTicker',
      'firstClassCode',
      'firstInstrumentKind'
    ],
    ...report.map((asset) => {
      const firstInstrument = asset.instruments[0];

      return [
        asset.uid,
        asset.type,
        asset.name,
        String(asset.instruments.length),
        firstInstrument?.uid ?? '',
        firstInstrument?.ticker ?? '',
        firstInstrument?.classCode ?? '',
        firstInstrument?.instrumentKind ?? ''
      ];
    })
  ]);
}

export function formatAssetReport(report: AssetReport, format: AssetFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderAssetRows(report === null ? [] : [report]);
}

export function formatAsset(response: AssetResponse, format: AssetFormat): string {
  return formatAssetReport(createAssetReport(response), format);
}
