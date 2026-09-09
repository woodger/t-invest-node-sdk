/**
 * Модуль CLI-команды `stream run` запускает configured stream session.
 *
 * Здесь допустимы:
 * - чтение stream config и применение runtime overrides;
 * - передача validated config и runtime policy в stream session;
 *
 * Здесь не должно быть JSONL event formatting rules или transport adapter logic.
 */

import {
  readFile } from 'node:fs/promises';
import type { InferOptions, InferProvidedOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import {
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  parseStreamRunConfig,
  type StreamRunRuntime
} from './config';
import { streamRunFormats } from './reporter';
import {
  runStreamRunSession,
  type StreamRunClock,
  type StreamRunElapsedClock,
  type StreamRunSdkFactory
} from './stream-session';

type StreamRunConfigReader = (path: string) => Promise<string>;

type StreamRunDependencies = {
  createSdk?: StreamRunSdkFactory;
  readConfig?: StreamRunConfigReader;
  now?: StreamRunClock;
  elapsedNow?: StreamRunElapsedClock;
};

const streamRunCommandPath = ['stream', 'run'] as const;
const defaultStreamRunSdkFactory: StreamRunSdkFactory = (options) => new TInvestNodeSDK(options);
const defaultStreamRunConfigReader: StreamRunConfigReader = (path) => readFile(path, 'utf8');

const streamRunOptionsSchema = withSdkOptions({
  config: {
    type: 'string',
    required: true
  },
  'max-events': {
    ...positiveSafeIntegerOption
  },
  'duration-ms': {
    ...positiveSafeIntegerOption
  },
  'idle-timeout-ms': {
    ...positiveSafeIntegerOption
  },
  'include-pings': {
    type: 'boolean'
  },
  raw: {
    type: 'boolean'
  },
  format: {
    type: 'string',
    choices: streamRunFormats,
    default: 'jsonl'
  }
} as const);

type StreamRunOptions = InferOptions<typeof streamRunOptionsSchema>;
type StreamRunProvidedOptions = InferProvidedOptions<typeof streamRunOptionsSchema>;

export function createStreamRunCommand(
  dependencies: StreamRunDependencies = {}
) {
  const createSdk = dependencies.createSdk ?? defaultStreamRunSdkFactory;
  const readConfig = dependencies.readConfig ?? defaultStreamRunConfigReader;
  const now = dependencies.now ?? (() => new Date());
  const elapsedNow = dependencies.elapsedNow ?? (() => performance.now());

  return command.define({
    path: streamRunCommandPath,
    options: streamRunOptionsSchema,
    async handle({ options, provided }) {
      return createStreamRunOutput(options, provided, {
        createSdk,
        readConfig,
        now,
        elapsedNow
      });
    }
  });
}

export const streamRunCommand = createStreamRunCommand();

async function createStreamRunOutput(
  options: StreamRunOptions,
  provided: StreamRunProvidedOptions,
  dependencies: Required<StreamRunDependencies>
): Promise<AsyncIterable<string>> {
  const config = parseStreamRunConfig(await dependencies.readConfig(options.config));
  const runtime = resolveStreamRunRuntime(config.runtime, options, provided);
  const sdkOptions = resolveSdkOptionsFromCommandOptions(options);

  return runStreamRunSession(config, runtime, sdkOptions, {
    createSdk: dependencies.createSdk,
    now: dependencies.now,
    elapsedNow: dependencies.elapsedNow
  });
}

function resolveStreamRunRuntime(
  runtime: StreamRunRuntime,
  options: StreamRunOptions,
  provided: StreamRunProvidedOptions
): StreamRunRuntime {
  return {
    ...runtime,
    format: options.format,
    maxEvents: options['max-events'] ?? runtime.maxEvents,
    durationMs: options['duration-ms'] ?? runtime.durationMs,
    idleTimeoutMs: options['idle-timeout-ms'] ?? runtime.idleTimeoutMs,
    includePings: provided['include-pings']
      ? options['include-pings'] === true
      : runtime.includePings,
    raw: provided.raw
      ? options.raw === true
      : runtime.raw
  };
}
