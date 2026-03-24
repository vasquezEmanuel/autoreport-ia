'use strict';

import { describe, it, expect } from 'vitest';
import request from 'supertest';

const app = require('../../app');

describe('GET /api/v1/health', () => {
  it('debe retornar status 200', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
  });

  it('debe retornar status ok en el body', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.body.status).toBe('ok');
  });

  it('debe retornar version, environment y timestamp', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.body).toMatchObject({
      status: 'ok',
      version: expect.any(String),
      environment: 'test',
      timestamp: expect.any(String),
    });
  });

  it('debe retornar timestamp en formato ISO válido', async () => {
    const response = await request(app).get('/api/v1/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});

describe('Ruta no encontrada', () => {
  it('debe retornar 404 para rutas inexistentes', async () => {
    const response = await request(app).get('/api/v1/ruta-que-no-existe');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: true,
      code: 'ROUTE_NOT_FOUND',
    });
  });
});
