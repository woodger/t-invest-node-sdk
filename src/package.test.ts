/**
 * Модуль тестов package metadata фиксирует npm-facing entrypoints.
 *
 * Проверки покрывают observable package contract: library entrypoint, type
 * declarations, CLI binary и локальный script, который запускает тот же файл.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import packageJson from '../package.json';

const cliBinaryName = 'tinkoff-invest-node-sdk';
const cliEntrypoint = 'dist/bootstrap/index.js';

describe('package metadata', () => {
  test('keeps public library entrypoints', () => {
    assert.equal(packageJson.main, 'dist/index.js');
    assert.equal(packageJson.types, 'dist/index.d.ts');
  });

  test('exposes the package CLI binary through npm bin metadata', () => {
    assert.deepEqual(packageJson.bin, {
      [cliBinaryName]: cliEntrypoint
    });
    assert.equal(packageJson.scripts.cli, `node ${cliEntrypoint}`);
  });

  test('keeps the executable CLI entrypoint shebang', () => {
    const source = readFileSync('src/bootstrap/index.ts', 'utf8');

    assert.equal(source.startsWith('#!/usr/bin/env node\n'), true);
  });
});
