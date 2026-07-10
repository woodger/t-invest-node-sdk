import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { InstrumentType } from '../../../generated/common';
import {
  AssetType,
  type Asset
} from '../../../generated/instruments';
import { createAssetsReport, formatAssetsReport } from './reporter';

function asset(overrides: Partial<Asset> = {}): Asset {
  return {
    uid: 'asset-uid',
    type: AssetType.ASSET_TYPE_SECURITY,
    name: 'T-Bank Share Asset',
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
  } as Asset;
}

describe('assets reporter', () => {
  describe('createAssetsReport', () => {
    test('maps generated assets to stable report values', () => {
      const report = createAssetsReport([asset()]);

      assert.deepEqual(report, [
        {
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
          ]
        }
      ]);
    });
  });

  describe('formatAssetsReport', () => {
    test('formats report as table', () => {
      const output = formatAssetsReport(createAssetsReport([asset()]), 'table');

      assert.match(output, /^uid\s+type\s+name\s+instrumentsCount/m);
      assert.match(output, /asset-uid\s+ASSET_TYPE_SECURITY\s+T-Bank Share Asset\s+1/);
      assert.match(output, /instrument-uid\s+TCSG\s+TQBR\s+INSTRUMENT_TYPE_SHARE/);
      assert.doesNotMatch(output, /linked-instrument-uid/);
    });

    test('formats report as json', () => {
      const output = formatAssetsReport(createAssetsReport([asset()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].uid, 'asset-uid');
      assert.equal(parsed[0].instruments[0].ticker, 'TCSG');
      assert.equal(parsed[0].instruments[0].links[0].instrumentUid, 'linked-instrument-uid');
    });
  });
});
