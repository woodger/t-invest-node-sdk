import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pfs } from 'pwd-fs';

/**
 * Создание TS-сервисов из proto-файлов.
 * См.: https://github.com/stephenh/ts-proto
 */

// Скрипт ожидает запуск из корня репозитория и строит все пути относительно него.
const contractsDir = path.join(pfs.pwd, 'contracts');
const generatedDir = path.join(pfs.pwd, 'src', 'generated');
const pluginPath = path.join(pfs.pwd, 'node_modules', '.bin', 'protoc-gen-ts_proto');

if (!pfs.test(contractsDir, { sync: true })) {
  throw new Error(`Missing contracts directory at ${contractsDir}`);
}

if (!pfs.test(pluginPath, { sync: true })) {
  throw new Error(`Missing ts-proto plugin at ${pluginPath}`);
}

const protoFiles = pfs.readdir(contractsDir, { sync: true })
  .filter((fileName) => fileName.endsWith('.proto'))
  .sort()
  .map((fileName) => path.join(contractsDir, fileName));

if (protoFiles.length === 0) {
  throw new Error(`No proto files found in ${contractsDir}`);
}

try {
  // Вызов protoc повторяет параметры legacy shell-скрипта без изменения поведения.
  execFileSync('protoc', [
    `--plugin=protoc-gen-ts_proto=${pluginPath}`,
    `--proto_path=${contractsDir}`,
    `--ts_proto_out=${generatedDir}`,
    '--ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false',
    '--ts_proto_opt=env=node',
    '--ts_proto_opt=esModuleInterop=true',
    ...protoFiles,
  ], {
    cwd: pfs.pwd,
    stdio: 'inherit',
  });
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    throw new Error('`protoc` is not installed or is not available in PATH');
  }

  throw error;
}
