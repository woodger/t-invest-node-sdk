import type { ReportMoney } from './money.report';

export interface OpenSandboxAccountReport {
  accountId: string;
}

export interface CloseSandboxAccountReport {
  accountId: string;
  status: 'closed';
}

export interface SandboxPayInReport {
  balance: ReportMoney | null;
}
