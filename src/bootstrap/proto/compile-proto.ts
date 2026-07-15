/**
 * Модуль proto compiler запускает генерацию TypeScript contracts из локальных proto-файлов.
 *
 * Здесь допустимы:
 * - чтение локальных generation paths из proto upstream manifest;
 * - поиск vendored proto-файлов в contracts directory;
 * - вызов системного `protoc` с текущими ts-proto options;
 * - проверка обязательных tool/runtime prerequisites перед генерацией;
 *
 * Здесь не должно быть post-processing generated sources или SDK runtime wiring.
 */

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pfs } from 'pwd-fs';

const compilerCommand = 'protoc';
const pluginPath = path.join(pfs.pwd, 'node_modules', '.bin', 'protoc-gen-ts_proto');

type ProtoGenerationPaths = {
  contractsDir: string;
  generatedDir: string;
};

export function compileProtoContracts(): void {
  const paths = loadProtoGenerationPaths();

  assertProtoCompilerReady(paths.contractsDir);

  const protoFiles = collectProtoFiles(paths.contractsDir);

  if (!protoFiles.length) {
    throw new Error(`No proto files found in ${paths.contractsDir}`);
  }

  runProtoCompiler(protoFiles, paths);
}

export function loadProtoGenerationPaths(
  projectRoot: string = pfs.pwd
): ProtoGenerationPaths {
  const manifestPath = path.join(projectRoot, 'contracts', 'upstream.json');
  let manifestSource: string;

  try {
    manifestSource = pfs.read(manifestPath, {
      sync: true,
      encoding: 'utf8'
    });
  }
  catch (error) {
    throw new Error(`Unable to read proto upstream manifest at ${manifestPath}`, { cause: error });
  }

  let manifest: unknown;

  try {
    manifest = JSON.parse(manifestSource);
  }
  catch (error) {
    throw new Error(`Invalid JSON in proto upstream manifest at ${manifestPath}`, { cause: error });
  }

  if (!isRecord(manifest) || !isRecord(manifest['local'])) {
    throw new Error(`Expected 'local' object in proto upstream manifest at ${manifestPath}`);
  }

  return {
    contractsDir: path.resolve(
      projectRoot,
      requireManifestPath(manifest['local'], 'rawContractsPath', manifestPath)
    ),
    generatedDir: path.resolve(
      projectRoot,
      requireManifestPath(manifest['local'], 'generatedPath', manifestPath)
    )
  };
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

function assertProtoCompilerReady(contractsDir: string): void {
  if (!pfs.test(contractsDir, { sync: true })) {
    throw new Error(`Missing contracts directory at ${contractsDir}`);
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

function runProtoCompiler(
  protoFiles: readonly string[],
  paths: ProtoGenerationPaths
): void {
  try {
    execFileSync(compilerCommand, [
      `--plugin=protoc-gen-ts_proto=${pluginPath}`,
      `--proto_path=${paths.contractsDir}`,
      `--ts_proto_out=${paths.generatedDir}`,
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

function requireManifestPath(
  local: Record<string, unknown>,
  name: 'rawContractsPath' | 'generatedPath',
  manifestPath: string
): string {
  const value = local[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Expected 'local.${name}' as non-empty string in ${manifestPath}`);
  }

  return value.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function handleMissingProtoCompiler(error: unknown): never {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    throw new Error('System protoc compiler is not installed or is not available in PATH', { cause: error });
  }

  throw error;
}
