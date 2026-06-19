"use strict";
/**
 * Модуль help-рендеринга превращает декларативный registry в стабильный CLI-текст.
 *
 * Здесь допустимы:
 * - форматирование секций help-вывода;
 * - сборка общего и command-specific help текста;
 * - изоляция presentation-формата от registry и entrypoint слоя.
 *
 * Здесь не должно быть знания о command parser-ах или SDK runtime wiring.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCliHelp = renderCliHelp;
exports.renderCommandHelp = renderCommandHelp;
const package_json_1 = __importDefault(require("../../../package.json"));
const commands_1 = require("./commands");
function renderSection(title, rows) {
    if (rows === undefined || rows.length === 0) {
        return [];
    }
    return [
        '',
        `${title}:`,
        ...rows.map((row) => `  ${row}`)
    ];
}
function renderCliHelp() {
    return [
        `${package_json_1.default.name} ${package_json_1.default.version}`,
        package_json_1.default.description,
        '',
        'Usage:',
        '  tinkoff-invest-node-sdk <command> [options]',
        '  tinkoff-invest-node-sdk --help',
        '  tinkoff-invest-node-sdk --version',
        '',
        'Global options:',
        '  --help, -h       Show this help and exit',
        '  --version, -v    Show package and runtime version info',
        '',
        'Commands:',
        ...Object.entries(commands_1.commandHelp).map(([name, command]) => `  ${name.padEnd(10)} ${command.description}`),
        '',
        'Command details:',
        '  tinkoff-invest-node-sdk <command> --help',
        ''
    ].join('\n');
}
function renderCommandHelp(commandName) {
    const command = commands_1.commandHelp[commandName];
    return [
        `${package_json_1.default.name} ${package_json_1.default.version}`,
        `${commandName} - ${command.description}`,
        ...renderSection('Usage', command.usage),
        ...renderSection('Examples', command.examples),
        ...renderSection('Notes', command.notes),
        ''
    ].join('\n');
}
