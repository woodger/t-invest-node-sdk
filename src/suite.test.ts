import fs from 'node:fs';
import path from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';

/**
 * Рекурсивно собирает все файлы с расширением `.test.js`
 */
function collectTestFiles(dir: string): string[] {
  let files: string[] = [];

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(
        collectTestFiles(fullPath)
      );
    }
    else if (/\.test\.js$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Путь к папке с собранными файлами
const distDir = path.resolve(__dirname);

// Собираем все тестовые файлы
const testFiles = collectTestFiles(distDir).filter((file) => file !== __filename);

if (!testFiles.length) {
  console.warn("⚠️  No test files found in dist/");
  process.exit(1);
}

// Запускаем node:test
run({
  files: testFiles,
  concurrency: 1
})
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(spec)
  .pipe(process.stdout);
