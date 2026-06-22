import { Metadata } from 'nice-grpc';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';

// Подготавливает metadata, которая будет отправляться со всеми unary-вызовами.
export function createSdkMetadata(options: TinkoffInvestOptions) {
  const init: Record<string, string> = {
    Authorization: `Bearer ${options.token}`
  };

  if (options.appName) {
    init['x-app-name'] = options.appName;
  }

  return new Metadata(init);
}
