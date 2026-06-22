import {
  ChannelCredentials,
  createChannel
} from 'nice-grpc';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';

// Создает канал с TLS или insecure credentials в зависимости от настроек SDK.
export function createSdkChannel(options: TinkoffInvestOptions) {
  const credentials = options.useSsl
    ? ChannelCredentials.createSsl()
    : ChannelCredentials.createInsecure();

  return createChannel(options.endpoint, credentials);
}
