"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCommandName = isCommandName;
exports.resolveCommand = resolveCommand;
const cli_1 = require("./commands/help/cli");
const cli_2 = require("./commands/version/cli");
const commandRegistry = {
    help: {
        requiresContext: false,
        handler: cli_1.help
    },
    version: {
        requiresContext: false,
        handler: cli_2.version
    }
};
function isCommandName(value) {
    return typeof value === 'string' && value in commandRegistry;
}
function resolveCommand(rawAction) {
    if (!isCommandName(rawAction)) {
        throw new Error(`'${String(rawAction)}' is not a program command`);
    }
    return commandRegistry[rawAction];
}
