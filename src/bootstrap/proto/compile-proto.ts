/**
 * Модуль proto compiler запускает генерацию TypeScript contracts из локальных proto-файлов.
 *
 * Здесь допустимы:
 * - поиск upstream proto-файлов в contracts directory;
 * - вызов системного `protoc` с текущими ts-proto options;
 * - проверка обязательных tool/runtime prerequisites перед генерацией;
 *
 * Здесь не должно быть post-processing generated sources или SDK runtime wiring.
 */

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pfs } from 'pwd-fs';

const contractsDir = path.join(pfs.pwd, 'contracts');
const upstreamContractsDir = path.join(contractsDir, 't_tech', 'invest', 'grpc');
const generatedDir = path.join(pfs.pwd, 'src', 'generated');
const compilerCommand = 'protoc';
const pluginPath = path.join(pfs.pwd, 'node_modules', '.bin', 'protoc-gen-ts_proto');

export function compileProtoContracts(): void {
  assertProtoCompilerReady();

  const protoFiles = collectProtoFiles(upstreamContractsDir);

  if (!protoFiles.length) {
    throw new Error(`No proto files found in ${upstreamContractsDir}`);
  }

  runProtoCompiler(protoFiles);
}

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

function assertProtoCompilerReady(): void {
  if (!pfs.test(contractsDir, { sync: true })) {
    throw new Error(`Missing contracts directory at ${contractsDir}`);
  }

  if (!pfs.test(upstreamContractsDir, { sync: true })) {
    throw new Error(`Missing upstream contracts directory at ${upstreamContractsDir}`);
  }

  if (!pfs.test(pluginPath, { sync: true })) {
    throw new Error(`Missing ts-proto plugin at ${pluginPath}`);
  }

  try {
    execFileSync(compilerCommand, ['--version'], {
      cwd: pfs.pwd,
      stdio: 'ignore',
    });
  }
  catch (error) {
    handleMissingProtoCompiler(error);
  }
}

function runProtoCompiler(protoFiles: readonly string[]): void {
  try {
    execFileSync(compilerCommand, [
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
    handleMissingProtoCompiler(error);
  }
}

function handleMissingProtoCompiler(error: unknown): never {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    throw new Error('System protoc compiler is not installed or is not available in PATH', { cause: error });
  }

  throw error;
}
