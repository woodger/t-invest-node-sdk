import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { describe, test } from 'node:test';
import {
  isSdkError,
  SdkErrorCode
} from '../../application/errors/sdk-error';
import {
  HostLocalQuotaLease,
  type HostLocalQuotaLeasePolicy,
  type HostLocalQuotaLeaseScope
} from './host-local-quota-lease';

const sharedScope: HostLocalQuotaLeaseScope = {
  endpoint: 'invest-public-api.tinkoff.ru:443',
  token: 'test-token'
};

describe('HostLocalQuotaLease', () => {
  test('counts active instances only inside the same endpoint and token scope', () => {
    const rootDirectory = createTemporaryDirectory();
    const policy = createLeasePolicy(rootDirectory);
    const first = new HostLocalQuotaLease(sharedScope, policy);
    const second = new HostLocalQuotaLease(sharedScope, policy);
    const otherToken = new HostLocalQuotaLease({
      ...sharedScope,
      token: 'other-token'
    }, policy);
    const otherEndpoint = new HostLocalQuotaLease({
      ...sharedScope,
      endpoint: 'sandbox-invest-public-api.tinkoff.ru:443'
    }, policy);

    try {
      assert.equal(first.getParticipantCount(), 2);
      assert.equal(second.getParticipantCount(), 2);
      assert.equal(otherToken.getParticipantCount(), 1);
      assert.equal(otherEndpoint.getParticipantCount(), 1);

      second.close();

      assert.equal(first.getParticipantCount(), 1);
      assert.doesNotThrow(() => second.close());
    }
    finally {
      first.close();
      second.close();
      otherToken.close();
      otherEndpoint.close();
      rmSync(rootDirectory, { recursive: true, force: true });
    }
  });

  test('persists only a scope fingerprint and an empty presence lease', () => {
    const rootDirectory = createTemporaryDirectory();
    const lease = new HostLocalQuotaLease(
      sharedScope,
      createLeasePolicy(rootDirectory)
    );

    try {
      const scopeNames = readdirSync(rootDirectory);
      const scopeName = scopeNames[0];

      assert.equal(scopeNames.length, 1);
      assert.match(scopeName ?? '', /^[a-f\d]{64}$/);

      if (scopeName === undefined) {
        assert.fail('Expected a quota-sharing scope directory');
      }

      const scopeDirectory = path.join(rootDirectory, scopeName);
      const leaseNames = readdirSync(scopeDirectory);
      const leaseName = leaseNames[0];

      assert.equal(leaseNames.length, 1);
      assert.match(leaseName ?? '', /^[\da-f-]{36}\.lease$/);

      if (leaseName === undefined) {
        assert.fail('Expected a quota-sharing lease file');
      }

      assert.equal(
        readFileSync(path.join(scopeDirectory, leaseName), 'utf8'),
        ''
      );
    }
    finally {
      lease.close();
      rmSync(rootDirectory, { recursive: true, force: true });
    }
  });

  test('observes another process and expires its lease after abrupt exit', async () => {
    const rootDirectory = createTemporaryDirectory();
    const policy = createLeasePolicy(rootDirectory, {
      heartbeatIntervalMs: 40,
      leaseDurationMs: 200
    });
    const parentLease = new HostLocalQuotaLease(sharedScope, policy);
    const child = spawnLeaseProcess(sharedScope, policy);

    try {
      const message = await Promise.race([
        once(child, 'message').then(([value]) => value),
        once(child, 'exit').then(([code, signal]) => {
          throw new Error(`Lease child exited before ready: ${code ?? signal}`);
        })
      ]);

      assert.deepEqual(message, {
        participantCount: 2
      });
      assert.equal(parentLease.getParticipantCount(), 2);

      const exited = once(child, 'exit');

      child.kill();
      await exited;
      await wait(policy.leaseDurationMs + 50);

      assert.equal(parentLease.getParticipantCount(), 1);
    }
    finally {
      child.kill();
      parentLease.close();
      rmSync(rootDirectory, { recursive: true, force: true });
    }
  });

  test('fails with an SDK error when the lease namespace is unavailable', () => {
    const rootDirectory = createTemporaryDirectory();
    const occupiedPath = path.join(rootDirectory, 'occupied');

    writeFileSync(occupiedPath, 'not a directory');

    try {
      assert.throws(
        () => new HostLocalQuotaLease(sharedScope, {
          ...createLeasePolicy(rootDirectory),
          rootDirectory: occupiedPath
        }),
        (error: unknown) => isSdkError(error, SdkErrorCode.Internal)
          && error.source === 'sdk'
          && error.message === 'Host-local quota sharing is unavailable'
      );
    }
    finally {
      rmSync(rootDirectory, { recursive: true, force: true });
    }
  });
});

function createTemporaryDirectory(): string {
  return mkdtempSync(path.join(tmpdir(), 't-invest-quota-lease-test-'));
}

function createLeasePolicy(
  rootDirectory: string,
  overrides: Partial<HostLocalQuotaLeasePolicy> = {}
): HostLocalQuotaLeasePolicy {
  return {
    rootDirectory,
    heartbeatIntervalMs: 100,
    leaseDurationMs: 1_000,
    participantRefreshIntervalMs: 0,
    ...overrides
  };
}

function spawnLeaseProcess(
  scope: HostLocalQuotaLeaseScope,
  policy: HostLocalQuotaLeasePolicy
) {
  const modulePath = path.join(__dirname, 'host-local-quota-lease.js');
  const program = `
    const { HostLocalQuotaLease } = require(process.env.LEASE_MODULE_PATH);
    const input = JSON.parse(process.env.LEASE_INPUT);
    const lease = new HostLocalQuotaLease(input.scope, input.policy);

    process.send({ participantCount: lease.getParticipantCount() });
    process.on('message', () => {});
  `;

  return spawn(process.execPath, ['-e', program], {
    env: {
      ...process.env,
      LEASE_MODULE_PATH: modulePath,
      LEASE_INPUT: JSON.stringify({ scope, policy })
    },
    stdio: [
      'ignore',
      'ignore',
      'inherit',
      'ipc'
    ]
  });
}
