/**
 * Модуль CLI command facade закрепляет единую форму объявления bootstrap-команд.
 *
 * Здесь допустимы:
 * - создание локального фасада command mechanics из icore;
 * - экспорт фасада для command modules;
 *
 * Здесь не должно быть command-specific path, option schema или handler logic.
 */

import { createCommand } from 'icore';

export const command = createCommand();
