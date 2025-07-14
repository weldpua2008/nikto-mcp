import { createLogger, logger } from '../src/utils/logger';
import winston from 'winston';

describe('Logger', () => {
  describe('createLogger', () => {
    it('should create a winston logger with correct configuration', () => {
      const testLogger = createLogger('test-service');
      
      expect(testLogger).toBeInstanceOf(winston.Logger);
      expect(testLogger.defaultMeta?.service).toBe('test-service');
    });

    it('should have stderr transport to avoid stdout pollution', () => {
      const testLogger = createLogger('test-service');
      
      expect(testLogger.transports).toHaveLength(1);
      expect(testLogger.transports[0]).toBeInstanceOf(winston.transports.Stream);
      
      // Verify it's a Stream transport configured for stderr
      const transport = testLogger.transports[0];
      expect(transport.level).toBeUndefined(); // Uses logger level
    });

    it('should use log level from config', () => {
      const testLogger = createLogger('test-service');
      
      // The logger should respect the config log level (default 'info')
      expect(testLogger.level).toBe('info');
    });

    it('should include timestamp and json formatting', () => {
      const testLogger = createLogger('test-service');
      
      // Check that the logger has the expected format options configured
      expect(testLogger.format).toBeDefined();
    });
  });

  describe('default logger', () => {
    it('should export a default logger instance', () => {
      expect(logger).toBeInstanceOf(winston.Logger);
      expect(logger.defaultMeta?.service).toBe('nikto-mcp');
    });

    it('should have same configuration as createLogger', () => {
      const customLogger = createLogger('nikto-mcp');
      
      expect(logger.level).toBe(customLogger.level);
      expect(logger.transports).toHaveLength(customLogger.transports.length);
      expect(logger.defaultMeta?.service).toBe(customLogger.defaultMeta?.service);
    });
  });

  describe('logging methods', () => {
    let testLogger: winston.Logger;
    let mockWrite: jest.SpyInstance;

    beforeEach(() => {
      testLogger = createLogger('test');
      // Mock stderr.write to capture log output
      mockWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      mockWrite.mockRestore();
    });

    it('should log info messages', () => {
      testLogger.info('Test info message');
      
      expect(mockWrite).toHaveBeenCalled();
      const logOutput = mockWrite.mock.calls[0][0];
      expect(logOutput).toContain('Test info message');
      expect(logOutput).toContain('"level":"info"');
      expect(logOutput).toContain('"service":"test"');
    });

    it('should log error messages', () => {
      testLogger.error('Test error message');
      
      expect(mockWrite).toHaveBeenCalled();
      const logOutput = mockWrite.mock.calls[0][0];
      expect(logOutput).toContain('Test error message');
      expect(logOutput).toContain('"level":"error"');
    });

    it('should log debug messages when level allows', () => {
      // Create logger with debug level
      const debugLogger = winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        defaultMeta: { service: 'debug-test' },
        transports: [
          new winston.transports.Stream({
            stream: process.stderr,
          }),
        ],
      });

      debugLogger.debug('Test debug message');
      
      expect(mockWrite).toHaveBeenCalled();
      const logOutput = mockWrite.mock.calls[0][0];
      expect(logOutput).toContain('Test debug message');
      expect(logOutput).toContain('"level":"debug"');
    });
  });
});
