"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_test_1 = require("node:test");
const reporters_1 = require("node:test/reporters");
/**
 * Рекурсивно собирает все файлы с расширением `.test.js`
 */
function collectTestFiles(dir) {
    let files = [];
    for (const entry of node_fs_1.default.readdirSync(dir)) {
        const fullPath = node_path_1.default.join(dir, entry);
        const stat = node_fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            files = files.concat(collectTestFiles(fullPath));
        }
        else if (/\.test\.js$/.test(entry)) {
            files.push(fullPath);
        }
    }
    return files;
}
// Путь к папке с собранными файлами
const distDir = node_path_1.default.resolve(__dirname);
// Собираем все тестовые файлы
const testFiles = collectTestFiles(distDir).filter((file) => file !== __filename);
if (!testFiles.length) {
    console.warn("⚠️  No test files found in dist/");
    process.exit(1);
}
// Запускаем node:test
(0, node_test_1.run)({
    files: testFiles,
    concurrency: 1
})
    .on('test:fail', () => {
    process.exitCode = 1;
})
    .compose(reporters_1.spec)
    .pipe(process.stdout);
