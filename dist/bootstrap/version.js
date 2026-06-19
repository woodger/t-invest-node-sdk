"use strict";
/**
 * Version-модуль обслуживает presentation-контракт для вывода версии пакета и runtime.
 *
 * Здесь допустимы:
 * - распознавание version-флагов;
 * - сборка стабильного текстового ответа для CLI;
 * - чтение package metadata без запуска SDK runtime.
 *
 * Здесь не должно быть bootstrap-инициализации, gRPC wiring или логики SDK-команд.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appVersion = void 0;
exports.isVersionRequested = isVersionRequested;
exports.renderVersionInfo = renderVersionInfo;
const package_json_1 = __importDefault(require("../../package.json"));
exports.appVersion = package_json_1.default.version;
function isVersionRequested(argv) {
    return argv.version === true || argv.v === true;
}
function renderVersionInfo() {
    return [
        `${package_json_1.default.name} ${package_json_1.default.version}`,
        `node ${process.version}`,
        `platform ${process.platform}/${process.arch}`
    ].join('\n');
}
