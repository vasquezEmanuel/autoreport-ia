'use strict';

import { describe, it, expect } from 'vitest';

const {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} = require('../../utils/errors');

describe('AppError', () => {
  it('debe crear error con statusCode y errorCode correctos', () => {
    const error = new AppError('Test error', 400, 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('TEST_CODE');
    expect(error.isOperational).toBe(true);
  });

  it('debe ser instancia de Error', () => {
    const error = new AppError('Test', 500, 'CODE');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('debe tener statusCode 400', () => {
    const error = new ValidationError('Datos inválidos');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('VALIDATION_ERROR');
  });

  it('debe incluir detalles cuando se proporcionan', () => {
    const details = [{ field: 'email', message: 'Email inválido' }];
    const error = new ValidationError('Datos inválidos', details);
    expect(error.details).toEqual(details);
  });

  it('debe funcionar sin detalles', () => {
    const error = new ValidationError('Datos inválidos');
    expect(error.details).toBeNull();
  });
});

describe('UnauthorizedError', () => {
  it('debe tener statusCode 401', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe('UNAUTHORIZED');
  });

  it('debe usar mensaje por defecto', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBeTruthy();
  });
});

describe('NotFoundError', () => {
  it('debe tener statusCode 404', () => {
    const error = new NotFoundError('Usuario');
    expect(error.statusCode).toBe(404);
  });

  it('debe incluir el nombre del recurso en el mensaje', () => {
    const error = new NotFoundError('Template');
    expect(error.message).toContain('Template');
  });
});

describe('ConflictError', () => {
  it('debe tener statusCode 409', () => {
    const error = new ConflictError('El email ya existe');
    expect(error.statusCode).toBe(409);
    expect(error.errorCode).toBe('CONFLICT');
  });
});
