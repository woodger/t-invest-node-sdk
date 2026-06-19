"use strict";
/**
 * Модуль guards CLI-аргументов инкапсулирует переиспользуемый парсинг и
 * валидацию primitive CLI-флагов.
 *
 * Здесь допустимы:
 * - чтение argv и проверка syntactic contract;
 * - нормализация presentation-level значений;
 * - проверка enum/range-ограничений для primitive CLI-значений;
 * - проверка whitelist-а известных аргументов.
 *
 * Здесь не должно быть знания о конкретных API-командах, SDK calls или gRPC wiring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgGuards = void 0;
class ArgGuards {
    static requireStringArg(argv, name) {
        const value = argv[name];
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error(`Expected required argument '--${name}'`);
        }
        return value;
    }
    static optionalStringArg(argv, name, fallback) {
        const value = argv[name];
        if (value === undefined) {
            return fallback;
        }
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error(`Expected '--${name}' as string`);
        }
        return value;
    }
    static optionalStringArgValue(argv, name) {
        const value = argv[name];
        if (value === undefined) {
            return undefined;
        }
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error(`Expected '--${name}' as string`);
        }
        return value;
    }
    static optionalBooleanFlagArg(argv, name) {
        const value = argv[name];
        if (value === undefined || value === false) {
            return undefined;
        }
        if (value !== true) {
            throw new Error(`Expected '--${name}' as boolean flag`);
        }
        return true;
    }
    static optionalEnumArgValue(argv, name, values) {
        const value = ArgGuards.optionalStringArgValue(argv, name);
        if (value === undefined) {
            return undefined;
        }
        if (!values.includes(value)) {
            throw new Error(`Expected '--${name}' as one of: ${values.join(', ')}`);
        }
        return value;
    }
    static parseDateArg(argv, name) {
        const date = new Date(ArgGuards.requireStringArg(argv, name));
        if (Number.isNaN(date.getTime())) {
            throw new Error(`Expected '--${name}' as date-time`);
        }
        return date;
    }
    static assertKnownArgs(argv, knownArgs) {
        for (const name of Object.keys(argv)) {
            if (name === '_' || knownArgs.has(name)) {
                continue;
            }
            throw new Error(`Unexpected argument '--${name}'`);
        }
    }
}
exports.ArgGuards = ArgGuards;
