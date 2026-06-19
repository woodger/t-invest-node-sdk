/**
 * Модуль реестра команд связывает имя CLI-команды с ее handler.
 *
 * Здесь допустимы:
 * - декларативное описание доступных CLI-команд;
 * - валидация имени команды из argv;
 * - возврат handler metadata для bootstrap CLI;
 *
 * Здесь не должно быть исполнения команд, разбора argv или форматирования help/version output.
 */
import { help } from './commands/help/cli';
import { version } from './commands/version/cli';
import type { CliCommand } from './cli-contract';
export type ResolvedCommand = {
    requiresContext: boolean;
    handler: CliCommand;
};
declare const commandRegistry: {
    readonly help: {
        readonly requiresContext: false;
        readonly handler: typeof help;
    };
    readonly version: {
        readonly requiresContext: false;
        readonly handler: typeof version;
    };
};
export type CommandName = keyof typeof commandRegistry;
export declare function isCommandName(value: unknown): value is CommandName;
export declare function resolveCommand(rawAction: unknown): ResolvedCommand;
export {};
