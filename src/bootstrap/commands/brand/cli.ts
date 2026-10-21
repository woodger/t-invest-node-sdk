/**
 * Модуль CLI-команды `instrument brand show`.
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
import type { Brand, GetBrandRequest } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { brandFormats, formatBrand } from './reporter';

type BrandSdk = {
  instruments: {
    getBrandBy(request: GetBrandRequest): Promise<Brand>;
  };
  close(): void;
};

type BrandSdkFactory = (options: TInvestOptions) => BrandSdk;

const brandOptionsSchema = withSdkOptions({
  id: {
    type: 'string',
    required: true
  },
  format: {
    type: 'string',
    choices: brandFormats,
    default: 'table'
  }
});

type BrandOptions = InferOptions<typeof brandOptionsSchema>;
type BrandRequestOptions = CommandRequestOptions<BrandOptions, 'id'>;

export function createBrandCommand(
  createSdk: BrandSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'brand', 'show'] as const,
    options: brandOptionsSchema,
    async handle({ options }) {
      const request = createBrandRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getBrandBy(request);

        return formatBrand(response, format);
      });
    }
  });
}

export const brandCommand = createBrandCommand();

export function createBrandRequest(
  options: BrandRequestOptions
): GetBrandRequest {
  return {
    id: options.id
  };
}
