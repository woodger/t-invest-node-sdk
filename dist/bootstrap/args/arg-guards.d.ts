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
import type { CliArgs } from '../cli-contract';
export declare class ArgGuards {
    static requireStringArg(argv: CliArgs, name: string): string;
    static optionalStringArg(argv: CliArgs, name: string, fallback: string): string;
    static optionalStringArgValue(argv: CliArgs, name: string): string | undefined;
    static optionalBooleanFlagArg(argv: CliArgs, name: string): boolean | undefined;
    static optionalEnumArgValue<T extends string>(argv: CliArgs, name: string, values: readonly T[]): T | undefined;
    static parseDateArg(argv: CliArgs, name: string): Date;
    static assertKnownArgs(argv: CliArgs, knownArgs: ReadonlySet<string>): void;
}
