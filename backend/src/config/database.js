'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// config/database.js — Instancia singleton del PrismaClient
//
// CONCEPTO — Singleton:
// PrismaClient mantiene un pool de conexiones a la BD.
// Si creamos múltiples instancias (una por request), agotamos las conexiones.
// El Singleton garantiza que existe UNA sola instancia en toda la app.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Redirigir los logs de Prisma a Winston
prisma.$on('warn', (e) => logger.warn('Prisma warning', { message: e.message }));
prisma.$on('error', (e) => logger.error('Prisma error', { message: e.message }));

module.exports = prisma;
