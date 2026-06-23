import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createCountriesCommand,
  parseCountriesFormat
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments get-countries'],
    ...args
  };
}

function response(overrides: Partial<GetCountriesResponse> = {}): GetCountriesResponse {
  return {
    countries: [
      {
        alfaTwo: 'RU',
        alfaThree: 'RUS',
        name: 'Russian Federation',
        nameBrief: 'Russia'
      }
    ],
    ...overrides
  };
}

describe('countries command', () => {
  describe('parseCountriesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseCountriesFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseCountriesFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createCountriesCommand', () => {
    test('calls getCountries and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetCountriesRequest | undefined;
      let getCountriesCalls = 0;
      let closeCalls = 0;
      const command = createCountriesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getCountries(request) {
              receivedRequest = request;
              getCountriesCalls += 1;

              return response();
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
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getCountriesCalls, 1);
      assert.deepEqual(receivedRequest, {});
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].alfaTwo, 'RU');
    });

    test('closes sdk when getCountries rejects', async () => {
      let closeCalls = 0;
      const command = createCountriesCommand(() => ({
        instruments: {
          async getCountries() {
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
          endpoint: 'localhost:50051'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
