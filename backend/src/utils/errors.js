'use strict';

// Clase base — todos los errores del sistema extienden de aquí
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode || 'INTERNAL_ERROR';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — Datos inválidos en el request
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// 401 — Sin autenticación o token inválido
class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado. Proporciona un token válido.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 403 — Autenticado pero sin permisos
class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para este recurso.') {
    super(message, 403, 'FORBIDDEN');
  }
}

// 404 — Recurso no encontrado
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado.`, 404, 'NOT_FOUND');
  }
}

// 409 — Conflicto (ej: email ya existe)
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
