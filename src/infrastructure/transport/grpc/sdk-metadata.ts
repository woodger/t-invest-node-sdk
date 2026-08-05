/**
 * Модуль gRPC metadata adapter преобразует SDK options в request metadata.
 *
 * Здесь допустимы:
 * - Bearer authorization metadata;
 * - optional x-app-name metadata;
 *
 * Здесь не должно быть token discovery или CLI environment fallback.
 */

import { Metadata } from 'nice-grpc';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';

export function createSdkMetadata(options: TInvestOptions) {
  const init: Record<string, string> = {
    Authorization: `Bearer ${options.token}`
  };

  if (options.appName) {
    init['x-app-name'] = options.appName;
  }

  return new Metadata(init);
}
