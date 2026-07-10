import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { CouponType,
  type Coupon
} from '../../../generated/instruments';
import { createBondCouponsReport, formatBondCouponsReport } from './reporter';

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    figi: 'BOND-FIGI',
    couponDate: new Date('2026-02-01T00:00:00Z'),
    couponNumber: 3,
    fixDate: new Date('2026-01-20T00:00:00Z'),
    payOneBond: {
      currency: 'rub',
      units: 25,
      nano: 500_000_000
    },
    couponType: CouponType.COUPON_TYPE_CONSTANT,
    couponStartDate: new Date('2026-01-01T00:00:00Z'),
    couponEndDate: new Date('2026-02-01T00:00:00Z'),
    couponPeriod: 31,
    ...overrides
  } as Coupon;
}

describe('bond-coupons reporter', () => {
  describe('createBondCouponsReport', () => {
    test('maps generated coupons to stable report values', () => {
      const report = createBondCouponsReport([coupon()]);

      assert.deepEqual(report, [
        {
          figi: 'BOND-FIGI',
          couponDate: '2026-02-01T00:00:00.000Z',
          couponNumber: 3,
          fixDate: '2026-01-20T00:00:00.000Z',
          payOneBond: {
            currency: 'rub',
            amount: '25.5'
          },
          couponType: 'COUPON_TYPE_CONSTANT',
          couponStartDate: '2026-01-01T00:00:00.000Z',
          couponEndDate: '2026-02-01T00:00:00.000Z',
          couponPeriod: 31
        }
      ]);
    });

    test('maps missing optional values to nulls and empty strings', () => {
      const report = createBondCouponsReport([
        coupon({
          couponDate: undefined,
          fixDate: undefined,
          payOneBond: undefined,
          couponStartDate: undefined,
          couponEndDate: undefined
        })
      ]);

      assert.equal(report.at(0)?.couponDate, '');
      assert.equal(report.at(0)?.fixDate, '');
      assert.equal(report.at(0)?.payOneBond, null);
      assert.equal(report.at(0)?.couponStartDate, '');
      assert.equal(report.at(0)?.couponEndDate, '');
    });
  });

  describe('formatBondCouponsReport', () => {
    test('formats report as table', () => {
      const output = formatBondCouponsReport(createBondCouponsReport([coupon()]), 'table');

      assert.match(output, /^figi\s+couponDate\s+couponNumber\s+fixDate\s+payOneBond/m);
      assert.match(output, /BOND-FIGI\s+2026-02-01T00:00:00\.000Z\s+3/);
      assert.match(output, /25\.5 rub\s+COUPON_TYPE_CONSTANT/);
    });

    test('formats report as json', () => {
      const output = formatBondCouponsReport(createBondCouponsReport([coupon()]), 'json');
      const parsed = JSON.parse(output);

      assert.deepEqual(parsed[0].payOneBond, {
        currency: 'rub',
        amount: '25.5'
      });
      assert.equal(parsed[0].couponType, 'COUPON_TYPE_CONSTANT');
    });
  });
});
