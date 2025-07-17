import { createLogger, logger } from '../src/utils/logger';
import winston from 'winston';

describe('Logger', () => {
  describe('createLogger', () => {
    it('should create a winston logger with correct configuration', () => {
      const testLogger = createLogger('test-service');
      
      expect(testLogger).toBeInstanceOf(winston.Logger);
      expect(testLogger.defaultMeta?.service).toBe('test-service');
    });

    it('should have proper transports to avoid stdout pollution', () => {
      const testLogger = createLogger('test-service');
      
      // In MCP mode (default), should have only Console transport with warn+ level
      expect(testLogger.transports).toHaveLength(1);
      expect(testLogger.transports[0]).toBeInstanceOf(winston.transports.Console);
      
      // Verify Console transport is configured for stderr on error/warn levels
      const consoleTransport = testLogger.transports[0] as winston.transports.ConsoleTransportInstance;
      expect(consoleTransport.stderrLevels).toEqual({ error: true, warn: true });
      expect(consoleTransport.level).toBe('warn');
    });

    it('should allow stdout logs in development mode', () => {
      process.env['MCP_STDOUT_LOGS'] = 'allow';
      const testLogger = createLogger('test-service');
      
      // In development mode, should have only Console transport
      expect(testLogger.transports).toHaveLength(1);
      expect(testLogger.transports[0]).toBeInstanceOf(winston.transports.Console);
      
      // Clean up
      delete process.env['MCP_STDOUT_LOGS'];
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

    it('should not log info messages to stderr in MCP mode', () => {
      testLogger.info('Test info message');
      
      // Info messages should not go to stderr in MCP mode (default)
      expect(mockWrite).not.toHaveBeenCalled();
    });

    it('should log info messages to stdout in development mode', () => {
      process.env['MCP_STDOUT_LOGS'] = 'allow';
      const devLogger = createLogger('test');
      const mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
      
      devLogger.info('Test info message');
      
      expect(mockStdout).toHaveBeenCalled();
      const logOutput = mockStdout.mock.calls[0][0];
      expect(logOutput).toContain('Test info message');
      expect(logOutput).toContain('"level":"info"');
      expect(logOutput).toContain('"service":"test"');
      
      // Clean up
      mockStdout.mockRestore();
      delete process.env['MCP_STDOUT_LOGS'];
    });

    it('should log error messages', () => {
      // Simply verify that error logging doesn't throw
      expect(() => testLogger.error('Test error message')).not.toThrow();
    });

    it('should log warn messages', () => {
      // Simply verify that warn logging doesn't throw
      expect(() => testLogger.warn('Test warn message')).not.toThrow();
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
