import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createChildLogger(context: Record<string, string>) {
  return logger.child(context);
}
