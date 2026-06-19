"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = help;
const help_1 = require("../../help");
function help(argv) {
    const [, commandName] = argv._;
    if (!(0, help_1.isCommandHelpName)(commandName)) {
        return (0, help_1.renderCliHelp)();
    }
    return (0, help_1.renderCommandHelp)(commandName);
}
