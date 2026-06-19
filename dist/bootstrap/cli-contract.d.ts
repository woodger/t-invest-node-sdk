/**
 * Модуль CLI-контрактов описывает общий handler signature для bootstrap-команд.
 *
 * Здесь допустимы:
 * - lightweight argv contract;
 * - общий sync handler contract для command registry;
 * - типы без runtime-зависимостей на SDK graph.
 *
 * Здесь не должно быть разбора argv, вывода в stdout/stderr или привязки к конкретным командам.
 */
export type CliArgs = {
    _: string[];
    help?: boolean;
    h?: boolean;
    version?: boolean;
    v?: boolean;
};
export type CliCommand = (argv: CliArgs) => string | undefined;
