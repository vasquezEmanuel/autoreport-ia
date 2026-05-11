'use strict';

const rateLimit = require('express-rate-limit');

// Límite general para todos los endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Límite estricto para auth (evitar fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

// Límite para generación de reportes (operación costosa)
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Límite de reportes alcanzado. Intenta de nuevo en 1 hora.',
    code: 'REPORT_RATE_LIMIT_EXCEEDED',
  },
});

module.exports = { generalLimiter, authLimiter, reportLimiter };
