"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
