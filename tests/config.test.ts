import { config } from '../src/config/index';

describe('Configuration', () => {
  it('should load default configuration', () => {
    expect(config).toBeDefined();
    expect(config.version).toBe('0.1.0');
    expect(config.niktoBinary).toBeDefined();
    expect(config.maxConcurrentScans).toBeGreaterThan(0);
    expect(config.defaultTimeout).toBeGreaterThan(0);
    expect(config.logLevel).toBeDefined();
  });

  it('should have valid log level', () => {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    expect(validLevels).toContain(config.logLevel);
  });

  it('should have reasonable default values', () => {
    expect(config.maxConcurrentScans).toBeLessThanOrEqual(10);
    expect(config.defaultTimeout).toBeGreaterThanOrEqual(60);
  });
});
