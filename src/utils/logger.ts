import winston from 'winston';
import { config } from '../config/index';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export function createLogger(service: string): winston.Logger {
  return winston.createLogger({
    level: config.logLevel,
    format: logFormat,
    defaultMeta: { service },
    transports: [
      // Send all logs to stderr to avoid polluting stdout used by MCP JSON-RPC
      new winston.transports.Stream({
        stream: process.stderr,
      }),
    ],
  });
}

export const logger = createLogger('nikto-mcp');
