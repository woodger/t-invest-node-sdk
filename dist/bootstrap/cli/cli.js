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
        if (arg.startsWith('--')) {
            const option = arg.slice(2);
            const separatorIndex = option.indexOf('=');
            const name = separatorIndex === -1
                ? option
                : option.slice(0, separatorIndex);
            const value = separatorIndex === -1
                ? true
                : option.slice(separatorIndex + 1);
            if (name === '') {
                parsed._.push(arg);
            }
            else {
                parsed[name] = value;
            }
        }
        else if (arg === '-h') {
            parsed.h = true;
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
function renderCommandError(error) {
    if (error instanceof Error) {
        return `${error.message}\n`;
    }
    return `${String(error)}\n`;
}
async function runCli(argv = process.argv.slice(2), io = {
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
    let command;
    try {
        command = (0, command_registry_1.resolveCommand)(action);
    }
    catch {
        io.stderr.write(`Unknown command: ${action}\n\n`);
        io.stderr.write((0, help_1.renderCliHelp)());
        return 1;
    }
    try {
        const output = await command.handler(parsedArgv);
        if (output !== undefined) {
            io.stdout.write(output);
        }
        return 0;
    }
    catch (error) {
        io.stderr.write(renderCommandError(error));
    }
    return 1;
}
if (require.main === module) {
    void runCli()
        .then((exitCode) => {
        process.exitCode = exitCode;
    })
        .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
