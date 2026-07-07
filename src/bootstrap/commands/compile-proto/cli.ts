/**
 * Модуль utility CLI-команды `compile-proto`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование генерации в bootstrap proto compiler;
 *
 * Здесь не должно быть SDK wiring, generated API request logic или post-processing generated sources.
 */

import { command } from '../command';
import { compileProtoContracts } from '../../proto/compile-proto';

export const compileProtoCommand = command.define({
  path: ['compile-proto'],
  options: {},
  handle() {
    compileProtoContracts();

    return undefined;
  }
});
