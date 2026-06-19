"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCommandHelp = exports.renderCliHelp = exports.isCommandHelpName = void 0;
exports.isHelpRequested = isHelpRequested;
exports.renderHelp = renderHelp;
const commands_1 = require("./commands");
const renderer_1 = require("./renderer");
var commands_2 = require("./commands");
Object.defineProperty(exports, "isCommandHelpName", { enumerable: true, get: function () { return commands_2.isCommandHelpName; } });
var renderer_2 = require("./renderer");
Object.defineProperty(exports, "renderCliHelp", { enumerable: true, get: function () { return renderer_2.renderCliHelp; } });
Object.defineProperty(exports, "renderCommandHelp", { enumerable: true, get: function () { return renderer_2.renderCommandHelp; } });
function isHelpRequested(argv) {
    return argv.help === true || argv.h === true;
}
function renderHelp(argv) {
    const [commandName] = argv._;
    if (!(0, commands_1.isCommandHelpName)(commandName)) {
        return (0, renderer_1.renderCliHelp)();
    }
    return (0, renderer_1.renderCommandHelp)(commandName);
}
