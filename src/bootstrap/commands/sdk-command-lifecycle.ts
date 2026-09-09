/**
 * Модуль владеет повторяемым lifecycle короткой SDK-команды.
 *
 * Здесь допустимы создание SDK из общих CLI options и гарантированное закрытие
 * ресурса после завершения handler-а.
 *
 * Здесь не должно быть request mapping, rendering или lifecycle stream-сессий.
 */

import type { TInvestOptions } from '../../application/dto/t-invest-options';
import {
  resolveSdkOptionsFromCommandOptions,
  type SdkCommandOptions
} from '../args/sdk-options';

interface ClosableSdk {
  close(): void;
}

export async function runSdkCommand<Sdk extends ClosableSdk, Result>(
  options: SdkCommandOptions,
  createSdk: (options: TInvestOptions) => Sdk,
  execute: (sdk: Sdk) => Promise<Result>
): Promise<Result> {
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    return await execute(sdk);
  }
  finally {
    sdk.close();
  }
}
