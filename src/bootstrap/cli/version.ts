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

import packageJson from '../../../package.json';

export const appVersion = packageJson.version;

type VersionOptions = {
  version?: unknown;
  v?: unknown;
};

export function isVersionRequested(options: VersionOptions): boolean {
  return options.version === true || options.v === true;
}

export function renderVersionInfo(): string {
  return [
    `${packageJson.name} ${packageJson.version}`,
    `node ${process.version}`,
    `platform ${process.platform}/${process.arch}`,
    ''
  ].join('\n');
}
