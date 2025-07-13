import { NiktoService } from '../src/services/nikto.service';
import { ScanStatus } from '../src/types/scan.types';

// Mock the logger to avoid console output during tests
jest.mock('../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('NiktoService', () => {
  let niktoService: NiktoService;

  beforeEach(() => {
    niktoService = new NiktoService();
  });

  describe('startScan with dry run', () => {
    it('should generate correct command for basic scan', async () => {
      const options = {
        target: 'example.com',
        dryRun: true,
      };

      const result = await niktoService.startScan(options);
      
      expect(result.status).toBe(ScanStatus.COMPLETED);
      expect(result.target).toBe('example.com');
      
      // Verify the scan was stored
      const status = niktoService.getScanStatus(result.scanId);
      expect(status.status).toBe(ScanStatus.COMPLETED);
      
      // The output should contain the dry run command
      const scan = (niktoService as any).activeScans.get(result.scanId);
      expect(scan.output[0]).toContain('DRY RUN (local mode): nikto -h example.com');
      expect(scan.output[0]).toContain('-timeout 3600');
      expect(scan.output[0]).toContain('-nointeractive');
    });

    it('should generate correct command with all options', async () => {
      const options = {
        target: 'https://example.com',
        port: 8443,
        ssl: true,
        nolookup: true,
        vhost: 'test.example.com',
        timeout: 1800,
        outputFormat: 'json' as const,
        dryRun: true,
      };

      const result = await niktoService.startScan(options);
      
      const scan = (niktoService as any).activeScans.get(result.scanId);
      const command = scan.output[0];
      
      expect(command).toContain('-h https://example.com');
      expect(command).toContain('-p 8443');
      expect(command).toContain('-ssl');
      expect(command).toContain('-nolookup');
      expect(command).toContain('-vhost test.example.com');
      expect(command).toContain('-timeout 1800');
      expect(command).toContain('-Format json');
      expect(command).toContain('-nointeractive');
    });

    it('should generate correct command with nossl option', async () => {
      const options = {
        target: 'example.com',
        nossl: true,
        dryRun: true,
      };

      const result = await niktoService.startScan(options);
      
      const scan = (niktoService as any).activeScans.get(result.scanId);
      const command = scan.output[0];
      
      expect(command).toContain('-nossl');
      expect(command).not.toContain('-ssl');
    });

    it('should not include ssl or nossl when neither is specified', async () => {
      const options = {
        target: 'example.com',
        dryRun: true,
      };

      const result = await niktoService.startScan(options);
      
      const scan = (niktoService as any).activeScans.get(result.scanId);
      const command = scan.output[0];
      
      expect(command).not.toContain('-ssl');
      expect(command).not.toContain('-nossl');
    });
  });

  describe('getActiveScans', () => {
    it('should return list of active scans', async () => {
      const options1 = { target: 'example1.com', dryRun: true };
      const options2 = { target: 'example2.com', dryRun: true };

      await niktoService.startScan(options1);
      await niktoService.startScan(options2);

      const activeScans = niktoService.getActiveScans();
      
      expect(activeScans).toHaveLength(2);
      expect(activeScans[0].target).toBe('example1.com');
      expect(activeScans[1].target).toBe('example2.com');
      expect(activeScans[0].status).toBe(ScanStatus.COMPLETED);
      expect(activeScans[1].status).toBe(ScanStatus.COMPLETED);
    });
  });
});
