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

import packageJson from '../../package.json';
import type { CliArgs } from './cli-contract';

export const appVersion = packageJson.version;

export function isVersionRequested(argv: CliArgs): boolean {
  return argv.version === true || argv.v === true;
}

export function renderVersionInfo(): string {
  return [
    `${packageJson.name} ${packageJson.version}`,
    `node ${process.version}`,
    `platform ${process.platform}/${process.arch}`,
    ''
  ].join('\n');
}
