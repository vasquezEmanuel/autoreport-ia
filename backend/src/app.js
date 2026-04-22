'use strict';

require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const configuratorRoutes = require('./routes/configurator.routes');
const uploadRoutes = require('./routes/upload.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// ─── SERIALIZAR BigInt ────────────────────────────────────────────────────────
// JSON.stringify no soporta BigInt por defecto.
// El campo fileSizeBytes en uploads es BigInt — lo convertimos a string.
JSON.stringify = (
  (original) => (value, replacer, space) =>
    original(
      value,
      (key, val) => {
        if (typeof val === 'bigint') return val.toString();
        return typeof replacer === 'function' ? replacer(key, val) : val;
      },
      space
    )
)(JSON.stringify);

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── DOCUMENTACIÓN ────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── RUTAS ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/configurators', configuratorRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada.',
    code: 'ROUTE_NOT_FOUND',
  });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
