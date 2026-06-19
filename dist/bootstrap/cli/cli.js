#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCliArgs = parseCliArgs;
exports.runCli = runCli;
const command_registry_1 = require("../command-registry");
const help_1 = require("../help");
const version_1 = require("../version");
function parseCliArgs(argv) {
    const parsed = {
        _: []
    };
    for (const arg of argv) {
        if (arg === '--help') {
            parsed.help = true;
        }
        else if (arg === '-h') {
            parsed.h = true;
        }
        else if (arg === '--version') {
            parsed.version = true;
        }
        else if (arg === '-v') {
            parsed.v = true;
        }
        else {
            parsed._.push(arg);
        }
    }
    return parsed;
}
function runCli(argv = process.argv.slice(2), io = {
    stdout: process.stdout,
    stderr: process.stderr
}) {
    const parsedArgv = parseCliArgs(argv);
    if ((0, help_1.isHelpRequested)(parsedArgv)) {
        io.stdout.write((0, help_1.renderHelp)(parsedArgv));
        return 0;
    }
    if ((0, version_1.isVersionRequested)(parsedArgv)) {
        io.stdout.write((0, version_1.renderVersionInfo)());
        return 0;
    }
    const action = parsedArgv._[0] ?? 'help';
    try {
        const command = (0, command_registry_1.resolveCommand)(action);
        const output = command.handler(parsedArgv);
        if (output !== undefined) {
            io.stdout.write(output);
        }
        return 0;
    }
    catch {
        io.stderr.write(`Unknown command: ${action}\n\n`);
        io.stderr.write((0, help_1.renderCliHelp)());
    }
    return 1;
}
if (require.main === module) {
    process.exitCode = runCli();
}
