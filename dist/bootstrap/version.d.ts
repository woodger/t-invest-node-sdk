/**
 * Version-модуль обслуживает presentation-контракт для вывода версии пакета и runtime.
 *
 * Здесь допустимы:
 * - распознавание version-флагов;
 * - сборка стабильного текстового ответа для CLI;
 * - чтение package metadata без запуска SDK runtime.
 *
 * Здесь не должно быть bootstrap-инициализации, gRPC wiring или логики SDK-команд.
 */
import type { CliArgs } from './cli-contract';
export declare const appVersion: string;
export declare function isVersionRequested(argv: CliArgs): boolean;
export declare function renderVersionInfo(): string;
