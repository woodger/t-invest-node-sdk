import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import type { CommandRawOptions } from '../../command-options';
import {
  createBrandCommand,
  parseBrandFormat,
  createBrandRequest
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

describe('brand command', () => {
  describe('createBrandRequest', () => {
    test('returns generated getBrandBy request', () => {
      const request = createBrandRequest({ id: 'brand-uid' });

      assert.deepEqual(request, {
        id: 'brand-uid'
      });
    });
  });

  describe('parseBrandFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBrandFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBrandFormat(rawOptions({ format: 'xml' })),
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

      const output = await runCommand(
        command,
        [
          'instruments',
          'get-brand-by',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=brand-uid',
          '--format=json'
        ],
        undefined
      );

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
        () => runCommand(
          command,
          [
            'instruments',
            'get-brand-by',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=brand-uid'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
