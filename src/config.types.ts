import type { UnaryLimits } from './application/services/unary-throttle.service';

export type { UnaryLimits };

export interface TinkoffInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
}
