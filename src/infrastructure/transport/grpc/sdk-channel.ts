/**
 * Модуль создаёт gRPC-канал SDK.
 *
 * Здесь допустимы:
 * - выбор TLS или незашифрованного подключения по параметрам SDK;
 * - передача ограничения размера входящего сообщения в настройки канала;
 * - создание канала `nice-grpc`.
 *
 * Здесь не должно быть кеширования клиентов сервисов или разбора опций CLI.
 */

import { ChannelCredentials, createChannel } from 'nice-grpc';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { loadBundledTlsRootCertificates } from './tls-root-certificates';

export function createSdkChannel(
  options: TInvestOptions,
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
