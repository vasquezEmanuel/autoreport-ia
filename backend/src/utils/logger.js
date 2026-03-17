'use strict';

const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// ── Formato legible para desarrollo ──────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${ts} [${level}] ${message}${metaStr}${stackStr}`;
  })
);

// ── Formato JSON para producción ──────────────────────
const prodFormat = combine(timestamp(), errors({ stack: true }), winston.format.json());

const logger = winston.createLogger({
  // En tests silenciamos los logs para no ensuciar el output de Vitest
  silent: isTest,
  level: isDevelopment ? 'debug' : 'warn',
  format: isDevelopment ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});

module.exports = logger;
