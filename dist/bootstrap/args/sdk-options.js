"use strict";
/**
 * Модуль SDK options CLI-слоя нормализует общие auth/runtime параметры API-команд.
 *
 * Здесь допустимы:
 * - чтение `--token`, `--endpoint`, `--app-name`, `--insecure`;
 * - fallback на ENV для credentials/endpoint;
 * - возврат `TinkoffInvestOptions` для bootstrap command handlers.
 *
 * Здесь не должно быть создания `TinkoffInvestNodeSDK` или вызовов API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdkOptionArgNames = void 0;
exports.resolveSdkOptions = resolveSdkOptions;
const arg_guards_1 = require("./arg-guards");
exports.sdkOptionArgNames = new Set([
    'token',
    'endpoint',
    'app-name',
    'insecure'
]);
function stringFromEnv(env, name) {
    const value = env[name];
    if (value === undefined || value.trim() === '') {
        return undefined;
    }
    return value;
}
function requiredCliOrEnvValue(cliValue, env, envName, optionName) {
    const value = cliValue ?? stringFromEnv(env, envName);
    if (value === undefined) {
        throw new Error(`Expected '--${optionName}' or ${envName}`);
    }
    return value;
}
function resolveSdkOptions(argv, env = process.env) {
    const token = requiredCliOrEnvValue(arg_guards_1.ArgGuards.optionalStringArgValue(argv, 'token'), env, 'TINKOFF_TOKEN', 'token');
    const endpoint = requiredCliOrEnvValue(arg_guards_1.ArgGuards.optionalStringArgValue(argv, 'endpoint'), env, 'TINKOFF_ENDPOINT', 'endpoint');
    const appName = arg_guards_1.ArgGuards.optionalStringArgValue(argv, 'app-name');
    const insecure = arg_guards_1.ArgGuards.optionalBooleanFlagArg(argv, 'insecure');
    return {
        token,
        endpoint,
        ...(appName === undefined ? {} : { appName }),
        ...(insecure === true ? { useSsl: false } : {})
    };
}
