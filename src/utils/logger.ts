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
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ],
  });
}

export const logger = createLogger('nikto-mcp');
