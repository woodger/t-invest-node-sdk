"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandHelp = void 0;
exports.isCommandHelpName = isCommandHelpName;
exports.commandHelp = {
    help: {
        description: 'Show top-level or command-specific help',
        usage: [
            'tinkoff-invest-node-sdk help',
            'tinkoff-invest-node-sdk help <command>',
            'tinkoff-invest-node-sdk <command> --help'
        ],
        examples: [
            'tinkoff-invest-node-sdk help',
            'tinkoff-invest-node-sdk help version'
        ],
        notes: [
            'Unknown command help falls back to the top-level help page.'
        ]
    },
    version: {
        description: 'Show package and runtime version info',
        usage: [
            'tinkoff-invest-node-sdk version',
            'tinkoff-invest-node-sdk --version'
        ],
        examples: [
            'tinkoff-invest-node-sdk version'
        ]
    }
};
function isCommandHelpName(value) {
    return typeof value === 'string' && value in exports.commandHelp;
}
