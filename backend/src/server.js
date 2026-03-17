'use strict';

// ─── CARGAR VARIABLES DE ENTORNO ─────────────────────────────────────────────
// dotenv lee el archivo .env y pone cada variable en process.env
// DEBE ser la primera línea antes de cualquier otro require
require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT, 10) || 3000;

// Verificar variables de entorno críticas antes de arrancar
const REQUIRED_ENV = ['JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  logger.error('Faltan variables de entorno requeridas', { missing });
  logger.error('Copia backend/.env.example a backend/.env y completa los valores.');
  process.exit(1);
}

const server = app.listen(PORT, () => {
  logger.info(`Servidor corriendo`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    health: `http://localhost:${PORT}/api/v1/health`,
  });
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    logger.info('Servidor cerrado correctamente.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forzando cierre...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
