/**
 * Модуль filesystem infrastructure публикует presence leases активных SDK instances.
 *
 * Здесь допустимы:
 * - построение host-local scope без сохранения исходных credentials;
 * - heartbeat, expiry и подсчет lease-файлов;
 * - ограниченное кеширование наблюдаемого числа участников.
 *
 * Здесь не должно быть очереди RPC, выдачи permits или интерпретации quota buckets.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  clearInterval,
  setInterval
} from 'node:timers';
import {
  lstatSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  utimesSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import {
  SdkError,
  SdkErrorCode
} from '../../application/errors/sdk-error';

export interface HostLocalQuotaLeaseScope {
  readonly endpoint: string;
  readonly token: string;
}

export interface HostLocalQuotaLeasePolicy {
  readonly rootDirectory: string;
  readonly heartbeatIntervalMs: number;
  readonly leaseDurationMs: number;
  readonly participantRefreshIntervalMs: number;
}

export class HostLocalQuotaLease {
  private readonly scopeDirectory: string;
  private readonly leasePath: string;
  private readonly heartbeat: ReturnType<typeof setInterval>;
  private lastHeartbeatAt: number;
  private participantCount = 1;
  private participantCountExpiresAt = 0;
  private closed = false;

  constructor(
    scope: HostLocalQuotaLeaseScope,
    private readonly policy: HostLocalQuotaLeasePolicy
  ) {
    assertLeasePolicy(policy);

    this.scopeDirectory = path.join(
      policy.rootDirectory,
      fingerprintScope(scope)
    );

    this.leasePath = path.join(this.scopeDirectory, `${randomUUID()}.lease`);
    this.lastHeartbeatAt = Date.now();

    try {
      this.ensureScopeDirectory();
      this.createLease();
    }
    catch (cause) {
      throw quotaSharingError(cause);
    }

    this.heartbeat = setInterval(() => {
      this.updateHeartbeat();
    }, policy.heartbeatIntervalMs);
    this.heartbeat.unref();
  }

  getParticipantCount(): number {
    const now = Date.now();

    try {
      if (now - this.lastHeartbeatAt >= this.policy.heartbeatIntervalMs) {
        this.refreshLease(now);
      }

      if (now < this.participantCountExpiresAt) {
        return this.participantCount;
      }

      this.participantCount = this.scanParticipants(now);
      this.participantCountExpiresAt = now
        + this.policy.participantRefreshIntervalMs;

      return this.participantCount;
    }
    catch (cause) {
      throw quotaSharingError(cause);
    }
  }

  close(): void {
    if (this.closed) {
      return;
    }

    this.closed = true;
    clearInterval(this.heartbeat);

    try {
      unlinkSync(this.leasePath);
    }
    catch {
      // Expiry остается безопасным cleanup, если owned lease нельзя удалить.
      return;
    }
  }

  private createLease(): void {
    writeFileSync(this.leasePath, '', {
      flag: 'wx',
      mode: 0o600
    });
  }

  private ensureScopeDirectory(): void {
    mkdirSync(this.scopeDirectory, {
      recursive: true,
      mode: 0o700
    });
  }

  private refreshLease(now: number): void {
    const heartbeatTime = new Date(now);

    try {
      utimesSync(this.leasePath, heartbeatTime, heartbeatTime);
    }
    catch (error) {
      if (!hasErrorCode(error, 'ENOENT')) {
        throw error;
      }

      this.ensureScopeDirectory();
      writeFileSync(this.leasePath, '', {
        flag: 'w',
        mode: 0o600
      });
    }

    this.lastHeartbeatAt = now;
  }

  private updateHeartbeat(): void {
    if (this.closed) {
      return;
    }

    try {
      this.refreshLease(Date.now());
    }
    catch {
      // Lease expiry сохраняет safety; следующий heartbeat или вызов повторит запись.
      return;
    }
  }

  private scanParticipants(now: number): number {
    let participants = 0;

    for (const name of readdirSync(this.scopeDirectory)) {
      if (!name.endsWith('.lease')) {
        continue;
      }

      const candidatePath = path.join(this.scopeDirectory, name);
      let modifiedAt: number;

      try {
        const stat = lstatSync(candidatePath);

        if (!stat.isFile()) {
          continue;
        }

        modifiedAt = stat.mtimeMs;
      }
      catch (error) {
        if (hasErrorCode(error, 'ENOENT')) {
          continue;
        }

        throw error;
      }

      if (now - modifiedAt <= this.policy.leaseDurationMs) {
        participants += 1;

        continue;
      }

      this.removeExpiredLease(candidatePath, modifiedAt);
    }

    return Math.max(participants, 1);
  }

  private removeExpiredLease(candidatePath: string, observedModifiedAt: number): void {
    try {
      const currentStat = lstatSync(candidatePath);

      if (currentStat.isFile() && currentStat.mtimeMs === observedModifiedAt) {
        unlinkSync(candidatePath);
      }
    }
    catch {
      // Cleanup выполняется opportunistically; race принадлежит heartbeat или remove.
      return;
    }
  }
}

function fingerprintScope(scope: HostLocalQuotaLeaseScope): string {
  const endpoint = scope.endpoint.trim().toLowerCase();

  return createHash('sha256')
    .update(JSON.stringify([endpoint, scope.token]))
    .digest('hex');
}

function assertLeasePolicy(policy: HostLocalQuotaLeasePolicy): void {
  const hasValidHeartbeat = Number.isFinite(policy.heartbeatIntervalMs)
    && policy.heartbeatIntervalMs > 0;
  const hasValidDuration = Number.isFinite(policy.leaseDurationMs)
    && policy.leaseDurationMs > policy.heartbeatIntervalMs;
  const hasValidRefreshInterval = Number.isFinite(
    policy.participantRefreshIntervalMs
  ) && policy.participantRefreshIntervalMs >= 0;

  if (hasValidHeartbeat && hasValidDuration && hasValidRefreshInterval) {
    return;
  }

  throw quotaSharingError(new Error('Invalid host-local quota lease policy'));
}

function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === code;
}

function quotaSharingError(cause: unknown): SdkError<SdkErrorCode.Internal> {
  return new SdkError(
    SdkErrorCode.Internal,
    'Host-local quota sharing is unavailable',
    {
      source: 'sdk',
      cause
    }
  );
}
