'use strict';

require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

const app = express();

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────

// Seguridad: agrega headers HTTP de protección
app.use(helmet());

// CORS: permite peticiones del frontend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging de requests (silencioso en tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// Parseo del body JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── RUTAS ────────────────────────────────────────────────────────────────────

// Health check — primer endpoint del sistema
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── RUTA NO ENCONTRADA ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada.',
    code: 'ROUTE_NOT_FOUND',
  });
});

// ─── ERROR HANDLER GLOBAL (siempre al final) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
