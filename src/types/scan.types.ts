export interface ScanOptions {
  target: string;
  port?: number | undefined;
  ssl?: boolean | undefined;
  nossl?: boolean | undefined;
  nolookup?: boolean | undefined;
  timeout?: number | undefined;
  vhost?: string | undefined;
  outputFormat?: 'json' | 'text' | undefined;
  dryRun?: boolean | undefined;
}

export interface ScanResult {
  scanId: string;
  status: ScanStatus;
  target: string;
  startTime: Date;
  endTime?: Date;
  findings?: NiktoFinding[];
  error?: string;
}

export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface NiktoFinding {
  id: string;
  osvdbId?: string;
  method: string;
  uri: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  reference?: string;
}

export interface ActiveScan {
  scanId: string;
  options: ScanOptions;
  status: ScanStatus;
  startTime: Date;
  pid?: number;
  output: string[];
  error?: string;
}
