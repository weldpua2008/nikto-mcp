import { z } from 'zod';

const configSchema = z.object({
  version: z.string(),
  niktoBinary: z.string(),
  niktoMode: z.enum(['local', 'docker']),
  dockerImage: z.string(),
  dockerNetworkMode: z.string(),
  maxConcurrentScans: z.number().positive(),
  defaultTimeout: z.number().positive(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  port: z.number().positive().optional(),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  return {
    version: '0.1.0',
    niktoBinary: process.env['NIKTO_BINARY'] ?? 'nikto',
    niktoMode: (process.env['NIKTO_MODE'] as Config['niktoMode']) ?? 'local',
    dockerImage: process.env['NIKTO_DOCKER_IMAGE'] ?? 'ghcr.io/sullo/nikto:latest',
    dockerNetworkMode: process.env['NIKTO_DOCKER_NETWORK'] ?? 'host',
    maxConcurrentScans: parseInt(process.env['MAX_CONCURRENT_SCANS'] ?? '3', 10),
    defaultTimeout: parseInt(process.env['SCAN_TIMEOUT'] ?? '3600', 10),
    logLevel: (process.env['LOG_LEVEL'] as Config['logLevel']) ?? 'info',
    port: process.env['MCP_PORT'] ? parseInt(process.env['MCP_PORT'], 10) : undefined,
  };
}

export let config: Config = loadConfig();

// Function to reload configuration (useful for testing)
export function reloadConfig(): Config {
  config = loadConfig();
  return config;
}

// Validate configuration at startup
try {
  configSchema.parse(config);
} catch (error) {
  console.error('Invalid configuration:', error);
  process.exit(1);
}
