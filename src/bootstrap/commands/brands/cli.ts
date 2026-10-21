/**
 * Модуль CLI-команды `instrument brand list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  GetBrandsRequest,
  GetBrandsResponse
} from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { brandsFormats, formatBrands } from './reporter';

type BrandsSdk = {
  instruments: {
    getBrands(request: GetBrandsRequest): Promise<GetBrandsResponse>;
  };
  close(): void;
};

type BrandsSdkFactory = (options: TInvestOptions) => BrandsSdk;

export function createBrandsCommand(
  createSdk: BrandsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'brand', 'list'] as const,
    options: withSdkOptions({
      format: {
        type: 'string',
        choices: brandsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getBrands({ paging: undefined });

        return formatBrands(response.brands, format);
      });
    }
  });
}

export const brandsCommand = createBrandsCommand();
