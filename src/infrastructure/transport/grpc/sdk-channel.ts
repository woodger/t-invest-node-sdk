/**
 * Модуль gRPC channel adapter создает transport channel для SDK runtime.
 *
 * Здесь допустимы:
 * - выбор TLS или insecure credentials по SDK options;
 * - создание low-level nice-grpc channel;
 *
 * Здесь не должно быть service client caching или CLI option parsing.
 */

import {
  ChannelCredentials,
  createChannel
} from 'nice-grpc';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';

export function createSdkChannel(options: TinkoffInvestOptions) {
  const credentials = options.useSsl
    ? ChannelCredentials.createSsl()
    : ChannelCredentials.createInsecure();

  return createChannel(options.endpoint, credentials);
}
