import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  CouponType,
  type Coupon,
  type GetBondCouponsRequest,
  type GetBondCouponsResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createBondCouponsCommand,
  parseBondCouponsFormat,
  createBondCouponsRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

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

function response(overrides: Partial<GetBondCouponsResponse> = {}): GetBondCouponsResponse {
  return {
    events: [coupon()],
    ...overrides
  } as GetBondCouponsResponse;
}

describe('bond-coupons command', () => {
  describe('createBondCouponsRequest', () => {
    test('returns generated getBondCoupons request', () => {
      const request = createBondCouponsRequest({
        'instrument-id': 'BOND-FIGI',
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T00:00:00Z'
      });

      assert.deepEqual(request, {
        figi: 'BOND-FIGI',
        instrumentId: 'BOND-FIGI',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => createBondCouponsRequest({
          figi: 'BOND-FIGI',
          from: '2026-02-01T00:00:00Z',
          to: '2026-01-01T00:00:00Z'
        }),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseBondCouponsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBondCouponsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBondCouponsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createBondCouponsCommand', () => {
    test('calls getBondCoupons and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetBondCouponsRequest | undefined;
      let getBondCouponsCalls = 0;
      let closeCalls = 0;
      const command = createBondCouponsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getBondCoupons(request) {
              receivedRequest = request;
              getBondCouponsCalls += 1;

              return response();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await commandFacade.run(
        command,
        [
          'instrument',
          'bond',
          'coupons',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BOND-FIGI',
          '--from=2026-01-01T00:00:00Z',
          '--to=2026-01-31T00:00:00Z',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getBondCouponsCalls, 1);
      assert.deepEqual(receivedRequest, {
        figi: 'BOND-FIGI',
        instrumentId: 'BOND-FIGI',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].couponType, 'COUPON_TYPE_CONSTANT');
    });

    test('closes sdk when getBondCoupons rejects', async () => {
      let closeCalls = 0;
      const command = createBondCouponsCommand(() => ({
        instruments: {
          async getBondCoupons() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'instrument',
            'bond',
            'coupons',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=BOND-FIGI',
            '--from=2026-01-01T00:00:00Z',
            '--to=2026-01-31T00:00:00Z'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
