import { spawn, type ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';
import { createLogger } from '../utils/logger';
import { config } from '../config/index';
import { sanitizeInput } from '../validators/scan.validator';
import type { ScanOptions, ScanResult, ActiveScan, NiktoFinding } from '../types/scan.types';
import { ScanStatus } from '../types/scan.types';

const logger = createLogger('NiktoService');

export class NiktoService {
  private activeScans: Map<string, ActiveScan> = new Map();

  constructor() {
    // Clean up any zombie processes on exit
    process.on('exit', () => {
      this.cleanup();
    });

    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  async startScan(options: ScanOptions): Promise<ScanResult> {
    const scanId = randomUUID();

    // Check concurrent scan limit
    const runningScans = Array.from(this.activeScans.values()).filter(
      (scan) => scan.status === ScanStatus.RUNNING,
    ).length;

    if (runningScans >= config.maxConcurrentScans) {
      throw new Error(`Maximum concurrent scans (${config.maxConcurrentScans}) reached`);
    }

    const activeScan: ActiveScan = {
      scanId,
      options,
      status: ScanStatus.PENDING,
      startTime: new Date(),
      output: [],
    };

    this.activeScans.set(scanId, activeScan);

    // Handle dry run mode
    if (options.dryRun) {
      let command: string;
      let args: string[];

      if (config.niktoMode === 'docker') {
        const niktoArgs = this.buildNiktoArgs(options, scanId);

        if (options.outputFormat === 'json') {
          const tmpDir = process.env['TMPDIR'] ?? process.cwd();
          const hostOutputFile = `${tmpDir}/nikto-scan-${scanId}.json`;

          command = 'sh';
          args = [
            '-c',
            `docker run --rm --network=${config.dockerNetworkMode} -v ${tmpDir}:/tmp ${config.dockerImage} ${niktoArgs.join(' ')} && cat ${hostOutputFile} && rm -f ${hostOutputFile}`,
          ];
        } else {
          command = 'docker';
          args = [
            'run',
            '--rm',
            `--network=${config.dockerNetworkMode}`,
            config.dockerImage,
            ...niktoArgs,
          ];
        }
      } else {
        command = config.niktoBinary;
        args = this.buildNiktoArgs(options, scanId);
      }

      const fullCommand = `${command} ${args.join(' ')}`;
      logger.debug(`Dry run for scan ${scanId}: ${fullCommand}`);
      activeScan.output.push(`DRY RUN (${config.niktoMode} mode): ${fullCommand}`);
      activeScan.status = ScanStatus.COMPLETED;

      return {
        scanId,
        status: ScanStatus.COMPLETED,
        target: options.target,
        startTime: activeScan.startTime,
        endTime: new Date(),
      };
    }

    try {
      const niktoProcess = this.spawnNiktoProcess(options, scanId);
      if (niktoProcess.pid) {
        activeScan.pid = niktoProcess.pid;
      }
      activeScan.status = ScanStatus.RUNNING;

      // Handle process completion
      niktoProcess.on('exit', (code) => {
        const scan = this.activeScans.get(scanId);
        if (scan) {
          scan.status = code === 0 ? ScanStatus.COMPLETED : ScanStatus.FAILED;
          logger.info(`Scan ${scanId} completed with code ${code}`);
        }
      });

      return {
        scanId,
        status: ScanStatus.RUNNING,
        target: options.target,
        startTime: activeScan.startTime,
      };
    } catch (error) {
      activeScan.status = ScanStatus.FAILED;
      throw error;
    }
  }

  private spawnNiktoProcess(options: ScanOptions, scanId: string): ChildProcess {
    let command: string;
    let args: string[];

    if (config.niktoMode === 'docker') {
      const niktoArgs = this.buildNiktoArgs(options, scanId);

      if (options.outputFormat === 'json') {
        // For JSON output in docker mode, use volume mounting and post-process
        const tmpDir = process.env['TMPDIR'] ?? process.cwd();
        const hostOutputFile = `${tmpDir}/nikto-scan-${scanId}.json`;

        command = 'sh';
        args = [
          '-c',
          `docker run --rm --network=${config.dockerNetworkMode} -v ${tmpDir}:/tmp ${config.dockerImage} ${niktoArgs.join(' ')} && cat ${hostOutputFile} && rm -f ${hostOutputFile}`,
        ];
      } else {
        command = 'docker';
        args = [
          'run',
          '--rm',
          `--network=${config.dockerNetworkMode}`,
          config.dockerImage,
          ...niktoArgs,
        ];
      }
    } else {
      command = config.niktoBinary;
      args = this.buildNiktoArgs(options, scanId);
    }

    logger.info(
      `Starting Nikto scan ${scanId} in ${config.niktoMode} mode with command: ${command} ${args.join(' ')}`,
    );

    const niktoProcess = spawn(command, args, {
      env: { ...process.env, LANG: 'C' }, // Ensure consistent output
      timeout: options.timeout ? options.timeout * 1000 : undefined,
    });

    const scan = this.activeScans.get(scanId);
    if (!scan) {
      throw new Error('Scan not found');
    }

    // Capture stdout
    niktoProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      scan.output.push(output);
      logger.debug(`Nikto output for ${scanId}:`, output);
    });

    // Capture stderr
    niktoProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      scan.output.push(`ERROR: ${error}`);
      logger.error(`Nikto error for ${scanId}:`, error);
    });

    // Handle errors
    niktoProcess.on('error', (error) => {
      scan.status = ScanStatus.FAILED;
      scan.error = error.message;
      logger.error(`Nikto process error for ${scanId}:`, error);
    });

    return niktoProcess;
  }

  private buildNiktoArgs(options: ScanOptions, scanId?: string): string[] {
    const args: string[] = [];

    // Target (required)
    args.push('-h', sanitizeInput(options.target));

    // Port - only add if target doesn't already contain a port in the URL
    if (options.port && !this.targetHasPort(options.target)) {
      args.push('-p', options.port.toString());
    }

    // SSL options (mutually exclusive)
    if (options.ssl) {
      args.push('-ssl');
    } else if (options.nossl) {
      args.push('-nossl');
    }

    // DNS lookup option
    if (options.nolookup) {
      args.push('-nolookup');
    }

    // Virtual host
    if (options.vhost) {
      args.push('-vhost', sanitizeInput(options.vhost));
    }

    // Timeout (use provided timeout or default from config)
    const timeoutValue = options.timeout ?? config.defaultTimeout;
    args.push('-timeout', timeoutValue.toString());

    // Output format handling
    if (options.outputFormat === 'json') {
      if (config.niktoMode === 'docker') {
        // In docker mode, use unique filename based on scanId
        const outputFile = scanId ? `/tmp/nikto-scan-${scanId}.json` : '/tmp/nikto-scan.json';
        args.push('-Format', 'json');
        args.push('-output', outputFile);
      } else {
        // In native mode, use unique filename based on scanId
        const outputFile = scanId ? `/tmp/nikto-output-${scanId}.json` : '/tmp/nikto-output.json';
        args.push('-Format', 'json');
        args.push('-output', outputFile);
      }
    }

    // Additional security options
    args.push('-nointeractive'); // Don't prompt for input

    // Log the full command for debugging
    const command = `${config.niktoBinary} ${args.join(' ')}`;
    logger.debug(`Built Nikto command: ${command}`);

    return args;
  }

  getScanStatus(scanId: string): ScanResult {
    const scan = this.activeScans.get(scanId);

    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    const result: ScanResult = {
      scanId,
      status: scan.status,
      target: scan.options.target,
      startTime: scan.startTime,
    };

    if (scan.status === ScanStatus.COMPLETED) {
      result.endTime = new Date();
      result.findings = this.parseNiktoOutput(scan.output.join(''), scan.options.outputFormat);
    }

    if (scan.error) {
      result.error = scan.error;
    }

    return result;
  }

  stopScan(scanId: string): void {
    const scan = this.activeScans.get(scanId);

    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    if (scan.status !== ScanStatus.RUNNING) {
      throw new Error(`Scan ${scanId} is not running`);
    }

    if (scan.pid) {
      try {
        process.kill(scan.pid, 'SIGTERM');
        scan.status = ScanStatus.CANCELLED;
        logger.info(`Scan ${scanId} cancelled`);
      } catch (error) {
        logger.error(`Failed to stop scan ${scanId}:`, error);
        throw new Error(
          `Failed to stop scan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  getActiveScans(): Array<{ scanId: string; status: ScanStatus; target: string }> {
    return Array.from(this.activeScans.values()).map((scan) => ({
      scanId: scan.scanId,
      status: scan.status,
      target: scan.options.target,
    }));
  }

  private parseNiktoOutput(output: string, format?: string): NiktoFinding[] {
    const findings: NiktoFinding[] = [];

    if (format === 'json') {
      try {
        // Parse JSON output - Nikto JSON format: [{"host":"...","vulnerabilities":[...]}]
        const jsonData = JSON.parse(output);

        if (Array.isArray(jsonData)) {
          for (const hostData of jsonData) {
            if (hostData.vulnerabilities && Array.isArray(hostData.vulnerabilities)) {
              for (const vuln of hostData.vulnerabilities) {
                const finding: NiktoFinding = {
                  id: vuln.id ?? randomUUID(),
                  method: vuln.method ?? 'GET',
                  uri: vuln.url ?? '/',
                  description: vuln.msg ?? 'Unknown vulnerability',
                  severity: this.determineSeverityFromVuln(vuln),
                };
                findings.push(finding);
              }
            }
          }
        }
        return findings;
      } catch (error) {
        logger.error('Failed to parse JSON output:', error);
      }
    }

    // Parse text output
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('+ ') && !line.includes('Target IP:')) {
        const finding: NiktoFinding = {
          id: randomUUID(),
          method: 'GET', // Default, would need parsing
          uri: '', // Would need parsing
          description: line.replace(/^\+ /, '').trim(),
          severity: this.determineSeverity(line),
        };
        findings.push(finding);
      }
    }

    return findings;
  }

  private determineSeverity(line: string): NiktoFinding['severity'] {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('vulnerability') || lowerLine.includes('exploit')) {
      return 'high';
    }
    if (lowerLine.includes('outdated') || lowerLine.includes('version')) {
      return 'medium';
    }
    if (lowerLine.includes('information') || lowerLine.includes('disclosure')) {
      return 'low';
    }

    return 'info';
  }

  private determineSeverityFromVuln(vuln: Record<string, unknown>): NiktoFinding['severity'] {
    const msg = ((vuln['msg'] as string) ?? '').toLowerCase();

    if (
      msg.includes('vulnerability') ||
      msg.includes('exploit') ||
      msg.includes('sql injection') ||
      msg.includes('xss')
    ) {
      return 'high';
    }
    if (msg.includes('outdated') || msg.includes('version') || msg.includes('deprecated')) {
      return 'medium';
    }
    if (
      msg.includes('information') ||
      msg.includes('disclosure') ||
      msg.includes('header missing')
    ) {
      return 'low';
    }

    return 'info';
  }

  private targetHasPort(target: string): boolean {
    try {
      // Check if target is a full URL with port
      if (target.startsWith('http://') || target.startsWith('https://')) {
        const url = new URL(target);
        return url.port !== '';
      }

      // Check if target is hostname:port format
      const parts = target.split(':');
      if (parts.length === 2 && parts[1]) {
        const port = parseInt(parts[1], 10);
        return !isNaN(port) && port > 0 && port <= 65535;
      }

      return false;
    } catch {
      // If URL parsing fails, assume no port
      return false;
    }
  }

  private cleanup(): void {
    // Kill all running scans
    for (const [scanId, scan] of this.activeScans.entries()) {
      if (scan.status === ScanStatus.RUNNING && scan.pid) {
        try {
          process.kill(scan.pid, 'SIGKILL');
          logger.info(`Killed scan ${scanId} during cleanup`);
        } catch (error) {
          logger.error(`Failed to kill scan ${scanId}:`, error);
        }
      }
    }
  }
}
