import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createBrandCommand,
  parseBrandFormat,
  parseBrandRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments get-brand-by'],
    ...args
  };
}

function brand(overrides: Partial<Brand> = {}): Brand {
  return {
    uid: 'brand-uid',
    name: 'T-Bank',
    description: 'Banking services',
    info: 'Issuer brand',
    company: 'T-Bank PJSC',
    sector: 'Financials',
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    ...overrides
  };
}

describe('brand command', () => {
  describe('parseBrandRequest', () => {
    test('returns generated getBrandBy request', () => {
      const request = parseBrandRequest(argv({ id: 'brand-uid' }));

      assert.deepEqual(request, {
        id: 'brand-uid'
      });
    });
  });

  describe('parseBrandFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBrandFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBrandFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createBrandCommand', () => {
    test('calls getBrandBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetBrandRequest | undefined;
      let getBrandByCalls = 0;
      let closeCalls = 0;
      const command = createBrandCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getBrandBy(request) {
              receivedRequest = request;
              getBrandByCalls += 1;

              return brand();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        id: 'brand-uid',
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getBrandByCalls, 1);
      assert.deepEqual(receivedRequest, {
        id: 'brand-uid'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).uid, 'brand-uid');
    });

    test('closes sdk when getBrandBy rejects', async () => {
      let closeCalls = 0;
      const command = createBrandCommand(() => ({
        instruments: {
          async getBrandBy() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => command(argv({
          token: 'token',
          endpoint: 'localhost:50051',
          id: 'brand-uid'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
