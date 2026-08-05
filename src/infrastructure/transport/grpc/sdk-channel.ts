/**
 * Модуль gRPC channel adapter создает transport channel для SDK runtime.
 *
 * Здесь допустимы:
 * - выбор TLS или insecure credentials по SDK options;
 * - mapping package-owned transport policy в gRPC channel options;
 * - создание low-level nice-grpc channel;
 *
 * Здесь не должно быть service client caching или CLI option parsing.
 */

import {
  ChannelCredentials,
  createChannel
} from 'nice-grpc';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { loadBundledTlsRootCertificates } from './tls-root-certificates';

export function createSdkChannel(
  options: TinkoffInvestOptions,
  maxReceiveMessageLength: number
) {
  const credentials = options.useSsl
    ? ChannelCredentials.createSsl(
        options.tls?.rootCertificates ?? loadBundledTlsRootCertificates()
      )
    : ChannelCredentials.createInsecure();

  return createChannel(options.endpoint, credentials, {
    'grpc.max_receive_message_length': maxReceiveMessageLength
  });
}
