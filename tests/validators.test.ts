import { validateScanOptions, sanitizeInput } from '../src/validators/scan.validator';

describe('Validators', () => {
  describe('validateScanOptions', () => {
    it('should validate valid scan options', () => {
      const options = {
        target: 'https://example.com',
        port: 443,
        ssl: true,
        timeout: 1800,
        outputFormat: 'json' as const,
      };

      const result = validateScanOptions(options);
      expect(result).toEqual({
        ...options,
        nossl: false,
        nolookup: false,
        dryRun: false,
      });
    });

    it('should apply default values', () => {
      const options = {
        target: 'example.com',
      };

      const result = validateScanOptions(options);
      expect(result.port).toBe(80);
      expect(result.ssl).toBe(false);
      expect(result.timeout).toBe(3600);
      expect(result.outputFormat).toBe('json');
    });

    it('should validate IP addresses', () => {
      const options = {
        target: '192.168.1.1',
      };

      const result = validateScanOptions(options);
      expect(result.target).toBe('192.168.1.1');
    });

    it('should reject invalid targets', () => {
      expect(() => validateScanOptions({ target: '' })).toThrow('Validation error');
      expect(() => validateScanOptions({ target: 'invalid..target' })).toThrow('Validation error');
    });

    it('should reject invalid ports', () => {
      expect(() =>
        validateScanOptions({
          target: 'example.com',
          port: 0,
        }),
      ).toThrow('Validation error');

      expect(() =>
        validateScanOptions({
          target: 'example.com',
          port: 70000,
        }),
      ).toThrow('Validation error');
    });

    it('should reject conflicting ssl and nossl options', () => {
      expect(() =>
        validateScanOptions({
          target: 'example.com',
          ssl: true,
          nossl: true,
        }),
      ).toThrow('Cannot specify both ssl and nossl options');
    });

    it('should validate new options with defaults', () => {
      const options = {
        target: 'example.com',
        nolookup: true,
        vhost: 'test.example.com',
      };

      const result = validateScanOptions(options);
      expect(result.nolookup).toBe(true);
      expect(result.vhost).toBe('test.example.com');
      expect(result.nossl).toBe(false);
      expect(result.dryRun).toBe(false);
    });

    it('should reject invalid vhost', () => {
      expect(() =>
        validateScanOptions({
          target: 'example.com',
          vhost: 'invalid..hostname',
        }),
      ).toThrow('Invalid vhost: must be a valid hostname');
    });

    it('should validate dry run mode', () => {
      const options = {
        target: 'example.com',
        dryRun: true,
      };

      const result = validateScanOptions(options);
      expect(result.dryRun).toBe(true);
    });

    it('should coerce string numbers to numbers', () => {
      const options = {
        target: 'example.com',
        port: '443',
        timeout: '1800',
      };

      const result = validateScanOptions(options);
      expect(result.port).toBe(443);
      expect(result.timeout).toBe(1800);
      expect(typeof result.port).toBe('number');
      expect(typeof result.timeout).toBe('number');
    });

    it('should coerce string booleans to booleans', () => {
      const options = {
        target: 'example.com',
        ssl: 'true',
        nossl: 'false',
        nolookup: '1',
        dryRun: '0',
      };

      const result = validateScanOptions(options);
      expect(result.ssl).toBe(true);
      expect(result.nossl).toBe(false);
      expect(result.nolookup).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(typeof result.ssl).toBe('boolean');
      expect(typeof result.nossl).toBe('boolean');
      expect(typeof result.nolookup).toBe('boolean');
      expect(typeof result.dryRun).toBe('boolean');
    });

    it('should handle case-insensitive boolean strings', () => {
      const options = {
        target: 'example.com',
        ssl: 'TRUE',
        nossl: 'False',
        nolookup: 'true',
        dryRun: 'FALSE',
      };

      const result = validateScanOptions(options);
      expect(result.ssl).toBe(true);
      expect(result.nossl).toBe(false);
      expect(result.nolookup).toBe(true);
      expect(result.dryRun).toBe(false);
    });

    it('should handle numeric boolean values', () => {
      const options = {
        target: 'example.com',
        ssl: 1,
        nossl: 0,
        nolookup: 1,
        dryRun: 0,
      };

      const result = validateScanOptions(options);
      expect(result.ssl).toBe(true);
      expect(result.nossl).toBe(false);
      expect(result.nolookup).toBe(true);
      expect(result.dryRun).toBe(false);
    });

    it('should reject invalid string numbers', () => {
      expect(() =>
        validateScanOptions({
          target: 'example.com',
          port: 'invalid',
        }),
      ).toThrow('Validation error');

      expect(() =>
        validateScanOptions({
          target: 'example.com',
          timeout: 'not-a-number',
        }),
      ).toThrow('Validation error');
    });

    it('should reject invalid boolean strings', () => {
      expect(() =>
        validateScanOptions({
          target: 'example.com',
          ssl: 'maybe',
        }),
      ).toThrow('Validation error');

      expect(() =>
        validateScanOptions({
          target: 'example.com',
          dryRun: 'yes',
        }),
      ).toThrow('Validation error');
    });

    it('should handle empty strings appropriately', () => {
      const options = {
        target: 'example.com',
        port: '',
        ssl: '',
        timeout: '',
      };

      const result = validateScanOptions(options);
      // Empty strings should result in default values
      expect(result.port).toBe(80); // default
      expect(result.ssl).toBe(false); // default
      expect(result.timeout).toBe(3600); // default from config
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('test; rm -rf /')).toBe('test rm -rf /');
      expect(sanitizeInput('test | cat /etc/passwd')).toBe('test  cat /etc/passwd');
      expect(sanitizeInput('test && echo hello')).toBe('test  echo hello');
    });

    it('should remove newlines', () => {
      expect(sanitizeInput('test\nline')).toBe('testline');
      expect(sanitizeInput('test\r\nline')).toBe('testline');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });
  });
});
