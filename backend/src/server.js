'use strict';

require('dotenv').config();

const app = require('./app');
const prisma = require('./config/database');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  logger.error('Faltan variables de entorno requeridas', { missing });
  process.exit(1);
}

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Conectado a PostgreSQL');

    const server = app.listen(PORT, () => {
      logger.info('Servidor corriendo', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        health: `http://localhost:${PORT}/api/v1/health`,
      });
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} recibido. Cerrando servidor...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Servidor y BD cerrados correctamente.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forzando cierre...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Error al arrancar el servidor', { message: error.message });
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
