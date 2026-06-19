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
import type { TinkoffInvestOptions } from '../../application/dto/tinkoff-invest-options';
import type { CliArgs } from '../cli-contract';
export declare const sdkOptionArgNames: Set<string>;
export declare function resolveSdkOptions(argv: CliArgs, env?: NodeJS.ProcessEnv): TinkoffInvestOptions;
