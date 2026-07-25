/**
 * Version-модуль обслуживает presentation-контракт для вывода версии пакета.
 *
 * Здесь допустимы:
 * - распознавание version-флагов;
 * - сборка стабильного текстового ответа для CLI;
 * - чтение package metadata без запуска SDK runtime.
 *
 * Здесь не должно быть bootstrap-инициализации, gRPC wiring или логики SDK-команд.
 */

import packageJson from '../../../package.json';

export const appVersion = packageJson.version;

type VersionOptions = {
  version?: unknown;
};

export function isVersionRequested(options: VersionOptions): boolean {
  return options.version === true;
}

export function renderVersionInfo(): string {
  return `${packageJson.name} ${packageJson.version}\n`;
}
