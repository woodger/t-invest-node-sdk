import assert from 'node:assert';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { loadProtoGenerationPaths } from './compile-proto';

describe('loadProtoGenerationPaths', () => {
  test('resolves configured paths from the project root', () => {
    const projectRoot = createProjectFixture({
      local: {
        rawContractsPath: 'vendor/proto',
        generatedPath: 'generated/contracts'
      }
    });

    try {
      assert.deepEqual(loadProtoGenerationPaths(projectRoot), {
        contractsDir: path.join(projectRoot, 'vendor', 'proto'),
        generatedDir: path.join(projectRoot, 'generated', 'contracts')
      });
    }
    finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  test('rejects missing generation path fields', () => {
    const projectRoot = createProjectFixture({
      local: {
        rawContractsPath: 'contracts'
      }
    });

    try {
      assert.throws(
        () => loadProtoGenerationPaths(projectRoot),
        /local\.generatedPath/
      );
    }
    finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  test('reports invalid manifest JSON', () => {
    const projectRoot = createProjectFixture('{');

    try {
      assert.throws(
        () => loadProtoGenerationPaths(projectRoot),
        /Invalid JSON in proto upstream manifest/
      );
    }
    finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});

function createProjectFixture(manifest: unknown): string {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 't-invest-node-sdk-'));
  const contractsDir = path.join(projectRoot, 'contracts');

  mkdirSync(contractsDir);
  writeFileSync(
    path.join(contractsDir, 'upstream.json'),
    typeof manifest === 'string' ? manifest : JSON.stringify(manifest)
  );

  return projectRoot;
}
