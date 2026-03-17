'use strict';

const { AppError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

// Este middleware captura TODOS los errores del sistema.
// Express lo reconoce como error handler porque tiene 4 parámetros: (err, req, res, next)
// Debe registrarse AL FINAL de todos los middlewares en app.js

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // ── Errores de JWT ────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: true,
      message: 'Tu sesión expiró. Inicia sesión nuevamente.',
      code: 'TOKEN_EXPIRED',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: true,
      message: 'Token inválido.',
      code: 'INVALID_TOKEN',
    });
  }

  // ── Errores de Prisma ─────────────────────────────────────────
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: true,
      message: 'Ya existe un registro con ese valor.',
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: true,
      message: 'Recurso no encontrado.',
      code: 'NOT_FOUND',
    });
  }

  // ── Errores operacionales propios ─────────────────────────────
  if (err instanceof AppError && err.isOperational) {
    const response = {
      error: true,
      message: err.message,
      code: err.errorCode,
    };

    if (err instanceof ValidationError && err.details) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // ── Error inesperado (bug) ────────────────────────────────────
  logger.error('Error no manejado', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  return res.status(500).json({
    error: true,
    message: 'Error interno del servidor.',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { debug: err.message }),
  });
};

module.exports = { errorHandler };
