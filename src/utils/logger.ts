import winston from 'winston';
import { config } from '../config/index';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

function getLogTransports(): winston.transport[] {
  // In MCP mode, we need to keep stdout clean for JSON-RPC protocol
  // Only errors and warnings should go to stderr, while info/debug should be discarded
  if (process.env['MCP_STDOUT_LOGS'] !== 'allow') {
    return [
      new winston.transports.Console({
        stderrLevels: ['error', 'warn'],
        consoleWarnLevels: [],
        level: 'warn', // Only log warn and error levels
      }),
    ];
  }

  // In development/testing mode, allow normal console output
  return [
    new winston.transports.Console({
      stderrLevels: ['error', 'warn'],
    }),
  ];
}

export function createLogger(service: string): winston.Logger {
  return winston.createLogger({
    level: config.logLevel,
    format: logFormat,
    defaultMeta: { service },
    transports: getLogTransports(),
  });
}

export const logger = createLogger('nikto-mcp');
