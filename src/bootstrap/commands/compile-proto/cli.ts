/**
 * Модуль utility CLI-команды `dev compile-proto`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование генерации в bootstrap proto compiler;
 *
 * Здесь не должно быть SDK wiring, generated API request logic или post-processing generated sources.
 */

import { command } from '../../cli/contract';
import { compileProtoContracts } from '../../proto/compile-proto';

export const compileProtoCommand = command.define({
  path: ['dev', 'compile-proto'],
  options: {},
  handle() {
    compileProtoContracts();

    return undefined;
  }
});
