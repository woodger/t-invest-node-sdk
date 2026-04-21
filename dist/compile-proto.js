"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const pwd_fs_1 = require("pwd-fs");
/**
 * Создание TS-сервисов из proto-файлов.
 * См.: https://github.com/stephenh/ts-proto
 */
// Скрипт ожидает запуск из корня репозитория и строит все пути относительно него.
const contractsDir = node_path_1.default.join(pwd_fs_1.pfs.pwd, 'contracts');
const generatedDir = node_path_1.default.join(pwd_fs_1.pfs.pwd, 'src', 'generated');
const pluginPath = node_path_1.default.join(pwd_fs_1.pfs.pwd, 'node_modules', '.bin', 'protoc-gen-ts_proto');
if (!pwd_fs_1.pfs.test(contractsDir, { sync: true })) {
    throw new Error(`Missing contracts directory at ${contractsDir}`);
}
if (!pwd_fs_1.pfs.test(pluginPath, { sync: true })) {
    throw new Error(`Missing ts-proto plugin at ${pluginPath}`);
}
const protoFiles = pwd_fs_1.pfs.readdir(contractsDir, { sync: true })
    .filter((fileName) => fileName.endsWith('.proto'))
    .sort()
    .map((fileName) => node_path_1.default.join(contractsDir, fileName));
if (!protoFiles.length) {
    throw new Error(`No proto files found in ${contractsDir}`);
}
try {
    // Вызов protoc повторяет параметры legacy shell-скрипта без изменения поведения.
    (0, node_child_process_1.execFileSync)('protoc', [
        `--plugin=protoc-gen-ts_proto=${pluginPath}`,
        `--proto_path=${contractsDir}`,
        `--ts_proto_out=${generatedDir}`,
        '--ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false',
        '--ts_proto_opt=env=node',
        '--ts_proto_opt=esModuleInterop=true',
        ...protoFiles,
    ], {
        cwd: pwd_fs_1.pfs.pwd,
        stdio: 'inherit',
    });
}
catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error('`protoc` is not installed or is not available in PATH', { cause: error });
    }
    throw error;
}
