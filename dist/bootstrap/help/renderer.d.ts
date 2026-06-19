/**
 * Модуль help-рендеринга превращает декларативный registry в стабильный CLI-текст.
 *
 * Здесь допустимы:
 * - форматирование секций help-вывода;
 * - сборка общего и command-specific help текста;
 * - изоляция presentation-формата от registry и entrypoint слоя.
 *
 * Здесь не должно быть знания о command parser-ах или SDK runtime wiring.
 */
import { type CommandHelpName } from './commands';
export declare function renderCliHelp(): string;
export declare function renderCommandHelp(commandName: CommandHelpName): string;
