/**
 * Модуль help-реестра хранит декларативное описание CLI-команд.
 *
 * Здесь допустимы:
 * - описание доступных bootstrap-команд;
 * - централизация usage и examples;
 * - экспорт presentation-only metadata для renderer-а.
 *
 * Здесь не должно быть исполнения команд или разбора argv.
 */
export declare const commandHelp: {
    readonly help: {
        readonly description: "Show top-level or command-specific help";
        readonly usage: ["tinkoff-invest-node-sdk help", "tinkoff-invest-node-sdk help <command>", "tinkoff-invest-node-sdk <command> --help"];
        readonly examples: ["tinkoff-invest-node-sdk help", "tinkoff-invest-node-sdk help version"];
        readonly notes: ["Unknown command help falls back to the top-level help page."];
    };
    readonly version: {
        readonly description: "Show package and runtime version info";
        readonly usage: ["tinkoff-invest-node-sdk version", "tinkoff-invest-node-sdk --version"];
        readonly examples: ["tinkoff-invest-node-sdk version"];
    };
};
export type CommandHelpName = keyof typeof commandHelp;
export declare function isCommandHelpName(value: unknown): value is CommandHelpName;
