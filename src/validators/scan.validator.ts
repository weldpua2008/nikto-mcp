import { z } from 'zod';
import type { ScanOptions } from '../types/scan.types';
import { config } from '../config/index';

// Helper functions for type coercion
const coerceToNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }
    const num = Number(trimmed);
    if (!isNaN(num)) {
      return num;
    }
  }
  return value as number; // Let Zod handle the validation error
};

const coerceToBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true' || trimmed === '1') {
      return true;
    }
    if (trimmed === 'false' || trimmed === '0') {
      return false;
    }
    if (trimmed === '') {
      return undefined;
    }
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  return value as boolean; // Let Zod handle the validation error
};

const scanOptionsSchema = z
  .object({
    target: z
      .string()
      .min(1, 'Target is required')
      .refine((value) => {
        // Basic validation for URL, IP, hostname, or hostname:port
        const urlPattern = /^https?:\/\/.+/;
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        const hostnamePattern =
          /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;

        // Check for hostname:port format
        const parts = value.split(':');
        if (parts.length === 2 && parts[0] && parts[1]) {
          const hostname = parts[0];
          const portStr = parts[1];
          const port = parseInt(portStr, 10);

          if (
            (hostnamePattern.test(hostname) || ipPattern.test(hostname)) &&
            !isNaN(port) &&
            port > 0 &&
            port <= 65535
          ) {
            return true;
          }
        }

        return urlPattern.test(value) || ipPattern.test(value) || hostnamePattern.test(value);
      }, 'Invalid target: must be a valid URL, IP address, or hostname'),
    port: z.preprocess(coerceToNumber, z.number().int().min(1).max(65535).optional().default(80)),
    ssl: z.preprocess(coerceToBoolean, z.boolean().optional().default(false)),
    nossl: z.preprocess(coerceToBoolean, z.boolean().optional().default(false)),
    nolookup: z.preprocess(coerceToBoolean, z.boolean().optional().default(false)),
    timeout: z.preprocess(
      coerceToNumber,
      z.number().positive().optional().default(config.defaultTimeout),
    ),
    vhost: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) {
          return true;
        }
        // Validate hostname format for vhost
        const hostnamePattern =
          /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
        return hostnamePattern.test(value);
      }, 'Invalid vhost: must be a valid hostname'),
    outputFormat: z.enum(['json', 'text']).optional().default('json'),
    dryRun: z.preprocess(coerceToBoolean, z.boolean().optional().default(false)),
  })
  .refine((data) => !(data.ssl && data.nossl), {
    message: 'Cannot specify both ssl and nossl options',
    path: ['ssl', 'nossl'],
  });

export function validateScanOptions(options: unknown): ScanOptions {
  try {
    return scanOptionsSchema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      throw new Error(`Validation error: ${message}`);
    }
    throw error;
  }
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters for shell commands
  return input
    .replace(/[;&|`$<>\\]/g, '')
    .replace(/\n|\r/g, '')
    .trim();
}
