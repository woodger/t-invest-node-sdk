// Публичная точка входа SDK: runtime API, локальный конфиг и реэкспорты generated types.
export { TinkoffInvestNodeSDK } from './bootstrap/tinkoff-invest-node-sdk';
export type { TinkoffInvestOptions } from './application/dto/tinkoff-invest-options';
export { defaultConfig } from './config';
export type { TinkoffInvestNodeSDKConfig, UnaryLimits } from './config.types';
export * from './generated-exports';
