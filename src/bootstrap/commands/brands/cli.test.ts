import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandsRequest, GetBrandsResponse } from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createBrandsCommand,
  parseBrandsFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
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

function response(overrides: Partial<GetBrandsResponse> = {}): GetBrandsResponse {
  return {
    brands: [brand()],
    ...overrides
  };
}

describe('brands command', () => {
  describe('parseBrandsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBrandsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBrandsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createBrandsCommand', () => {
    test('calls getBrands and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetBrandsRequest | undefined;
      let getBrandsCalls = 0;
      let closeCalls = 0;
      const command = createBrandsCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getBrands(request) {
              receivedRequest = request;
              getBrandsCalls += 1;

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
          'instruments',
          'get-brands',
          '--token=token',
          '--endpoint=localhost:50051',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getBrandsCalls, 1);
      assert.deepEqual(receivedRequest, {});
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].uid, 'brand-uid');
    });

    test('closes sdk when getBrands rejects', async () => {
      let closeCalls = 0;
      const command = createBrandsCommand(() => ({
        instruments: {
          async getBrands() {
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
            'instruments',
            'get-brands',
            '--token=token',
            '--endpoint=localhost:50051'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
