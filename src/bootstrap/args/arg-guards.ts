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

export class ArgGuards {
  static requireStringArg(argv: CliArgs, name: string): string {
    const value = argv[name];

    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Expected required argument '--${name}'`);
    }

    return value;
  }

  static optionalStringArg(
    argv: CliArgs,
    name: string,
    fallback: string
  ): string {
    const value = argv[name];

    if (value === undefined) {
      return fallback;
    }

    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Expected '--${name}' as string`);
    }

    return value;
  }

  static optionalStringArgValue(argv: CliArgs, name: string): string | undefined {
    const value = argv[name];

    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Expected '--${name}' as string`);
    }

    return value;
  }

  static optionalBooleanFlagArg(argv: CliArgs, name: string): boolean | undefined {
    const value = argv[name];

    if (value === undefined || value === false) {
      return undefined;
    }

    if (value !== true) {
      throw new Error(`Expected '--${name}' as boolean flag`);
    }

    return true;
  }

  static optionalEnumArgValue<T extends string>(
    argv: CliArgs,
    name: string,
    values: readonly T[]
  ): T | undefined {
    const value = ArgGuards.optionalStringArgValue(argv, name);

    if (value === undefined) {
      return undefined;
    }

    if (!(values as readonly string[]).includes(value)) {
      throw new Error(`Expected '--${name}' as one of: ${values.join(', ')}`);
    }

    return value as T;
  }

  static parseDateArg(argv: CliArgs, name: string): Date {
    const date = new Date(ArgGuards.requireStringArg(argv, name));

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Expected '--${name}' as date-time`);
    }

    return date;
  }

  static requireCommaSeparatedStringListArg(argv: CliArgs, name: string): string[] {
    const rawValue = ArgGuards.requireStringArg(argv, name);
    const values = rawValue.split(',').map((value) => value.trim());

    if (values.some((value) => value === '')) {
      throw new Error(`Expected '--${name}' as comma-separated list`);
    }

    return values;
  }

  static assertKnownArgs(argv: CliArgs, knownArgs: ReadonlySet<string>): void {
    for (const name of Object.keys(argv)) {
      if (name === '_' || knownArgs.has(name)) {
        continue;
      }

      throw new Error(`Unexpected argument '--${name}'`);
    }
  }

  static assertNoExtraPositionals(argv: CliArgs, commandName: string): void {
    const [, ...extra] = argv._;

    if (extra.length > 0) {
      throw new Error(`Unexpected positional argument for '${commandName}': ${extra[0]}`);
    }
  }
}
