/**
 * Модуль help-фасада обслуживает верхнеуровневый CLI-контракт справки.
 *
 * Здесь допустимы:
 * - распознавание help-флагов;
 * - выбор между общим help и command-specific help;
 * - реэкспорт renderer-функций для entrypoint/bootstrap.
 *
 * Здесь не должно быть разбора command arguments или зависимости от application/infrastructure слоя.
 */
import type { CliArgs } from '../cli-contract';
export { isCommandHelpName } from './commands';
export { renderCliHelp, renderCommandHelp } from './renderer';
export declare function isHelpRequested(argv: CliArgs): boolean;
export declare function renderHelp(argv: CliArgs): string;
