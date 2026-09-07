import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { InstrumentType } from '../../../generated/common';
import {
  AssetType,
  type AssetFull,
  type AssetResponse
} from '../../../generated/instruments';
import { createAssetReport, formatAssetReport } from './reporter';

function asset(overrides: Partial<AssetFull> = {}): AssetFull {
  return {
    uid: 'asset-uid',
    type: AssetType.ASSET_TYPE_SECURITY,
    name: 'T-Bank Share Asset',
    nameBrief: 'T-Bank',
    description: 'Issuer common share asset',
    deletedAt: undefined,
    requiredTests: ['qualified-investor'],
    currency: undefined,
    security: {
      isin: 'RU000A107UL4',
      type: 'share',
      instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE
    },
    gosRegCode: '1-01-00000-A',
    cfi: 'ESXXXX',
    codeNsd: 'TCSG',
    status: 'active',
    brand: {
      uid: 'brand-uid',
      name: 'T-Bank',
      description: 'Banking services',
      info: 'Issuer brand',
      company: 'T-Bank PJSC',
      sector: 'Financials',
      countryOfRisk: 'RU',
      countryOfRiskName: 'Russia'
    },
    updatedAt: new Date('2026-06-20T10:00:00.000Z'),
    brCode: 'share-code',
    brCodeName: 'Share',
    instruments: [
      {
        uid: 'instrument-uid',
        figi: 'BBG00QPYJ5H0',
        instrumentType: 'share',
        ticker: 'TCSG',
        classCode: 'TQBR',
        links: [
          {
            type: 'primary',
            instrumentUid: 'linked-instrument-uid'
          }
        ],
        instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
        positionUid: 'position-uid'
      }
    ],
    ...overrides
  } as AssetFull;
}

function response(overrides: Partial<AssetResponse> = {}): AssetResponse {
  return {
    asset: asset(),
    ...overrides
  } as AssetResponse;
}

describe('asset reporter', () => {
  describe('createAssetReport', () => {
    test('maps generated asset fields to stable report values', () => {
      const report = createAssetReport(response());

      assert.deepEqual(report, {
        uid: 'asset-uid',
        type: 'ASSET_TYPE_SECURITY',
        name: 'T-Bank Share Asset',
        instruments: [
          {
            uid: 'instrument-uid',
            figi: 'BBG00QPYJ5H0',
            instrumentType: 'share',
            instrumentKind: 'INSTRUMENT_TYPE_SHARE',
            ticker: 'TCSG',
            classCode: 'TQBR',
            positionUid: 'position-uid',
            links: [
              {
                type: 'primary',
                instrumentUid: 'linked-instrument-uid'
              }
            ]
          }
        ],
        nameBrief: 'T-Bank',
        description: 'Issuer common share asset',
        deletedAt: '',
        requiredTests: ['qualified-investor'],
        currencyBaseCurrency: '',
        securityIsin: 'RU000A107UL4',
        securityType: 'share',
        securityInstrumentKind: 'INSTRUMENT_TYPE_SHARE',
        gosRegCode: '1-01-00000-A',
        cfi: 'ESXXXX',
        codeNsd: 'TCSG',
        status: 'active',
        brand: {
          uid: 'brand-uid',
          name: 'T-Bank',
          description: 'Banking services',
          info: 'Issuer brand',
          company: 'T-Bank PJSC',
          sector: 'Financials',
          countryOfRisk: 'RU',
          countryOfRiskName: 'Russia'
        },
        updatedAt: '2026-06-20T10:00:00.000Z',
        brCode: 'share-code',
        brCodeName: 'Share'
      });
    });

    test('maps currency asset fields', () => {
      const report = createAssetReport(response({
        asset: asset({
          type: AssetType.ASSET_TYPE_CURRENCY,
          currency: { baseCurrency: 'usd' },
          security: undefined,
          brand: undefined
        })
      }));

      assert.equal(report?.type, 'ASSET_TYPE_CURRENCY');
      assert.equal(report?.currencyBaseCurrency, 'usd');
      assert.equal(report?.securityInstrumentKind, '');
      assert.equal(report?.brand, null);
    });

    test('returns null when response has no asset', () => {
      assert.equal(createAssetReport(response({ asset: undefined })), null);
    });
  });

  describe('formatAssetReport', () => {
    test('formats report as table', () => {
      const output = formatAssetReport(createAssetReport(response()), 'table');

      assert.match(output, /^uid\s+type\s+name\s+instrumentsCount/m);
      assert.match(output, /asset-uid\s+ASSET_TYPE_SECURITY\s+T-Bank Share Asset\s+1/);
      assert.match(output, /instrument-uid\s+TCSG\s+TQBR\s+INSTRUMENT_TYPE_SHARE/);
      assert.doesNotMatch(output, /Banking services/);
    });

    test('formats report as json', () => {
      const report = createAssetReport(response());
      const output = formatAssetReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });

    test('formats missing asset as json null and table header', () => {
      assert.equal(formatAssetReport(null, 'json'), 'null\n');
      assert.match(formatAssetReport(null, 'table'), /^uid\s+type\s+name/);
    });
  });
});
