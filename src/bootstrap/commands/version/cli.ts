import { defineCommand } from 'icore';
import { renderVersionInfo } from '../../version';

export const versionCommand = defineCommand({
  path: ['version'],
  options: {},
  allowExtraPositionals: true,
  handle() {
    return renderVersionInfo();
  }
});

export function version(): string {
  return renderVersionInfo();
}
