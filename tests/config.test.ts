import { config } from '../src/config/index';

// Read package.json to get the expected version
const packageJson = require('../package.json');

describe('Configuration', () => {
  it('should load default configuration', () => {
    expect(config).toBeDefined();
    expect(config.version).toBe(packageJson.version);
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
