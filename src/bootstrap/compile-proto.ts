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
const compilerPath = path.join(pfs.pwd, 'node_modules', '.bin', 'grpc_tools_node_protoc');
const pluginPath = path.join(pfs.pwd, 'node_modules', '.bin', 'protoc-gen-ts_proto');

function collectProtoFiles(dir: string): string[] {
  return pfs.readdir(dir, { sync: true })
    .sort()
    .flatMap((entryName) => {
      const entryPath = path.join(dir, entryName);

      if (pfs.stat(entryPath, { sync: true }).isDirectory()) {
        return collectProtoFiles(entryPath);
      }

      return entryName.endsWith('.proto') ? [entryPath] : [];
    });
}

if (!pfs.test(contractsDir, { sync: true })) {
  throw new Error(`Missing contracts directory at ${contractsDir}`);
}

if (!pfs.test(compilerPath, { sync: true })) {
  throw new Error(`Missing local protoc compiler at ${compilerPath}`);
}

if (!pfs.test(pluginPath, { sync: true })) {
  throw new Error(`Missing ts-proto plugin at ${pluginPath}`);
}

const protoFiles = collectProtoFiles(contractsDir);

if (!protoFiles.length) {
  throw new Error(`No proto files found in ${contractsDir}`);
}

try {
  // Вызов локального compiler повторяет параметры legacy shell-скрипта без изменения поведения.
  execFileSync(compilerPath, [
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
}
catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    throw new Error('Local protoc compiler is not installed or is not available', { cause: error });
  }

  throw error;
}
