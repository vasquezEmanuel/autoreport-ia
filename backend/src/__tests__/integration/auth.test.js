'use strict';

const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/database');

// Limpiar BD de test antes de cada test
beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

// Cerrar conexión al terminar
afterAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// Datos de prueba
const testUser = {
  name: 'Emanuel Vasquez',
  email: 'emanuel@test.com',
  password: 'password123',
};

describe('POST /api/auth/register', () => {
  it('debe registrar un usuario correctamente', async () => {
    const response = await request(app).post('/api/auth/register').send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.user.name).toBe(testUser.name);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.tokens.refreshToken).toBeDefined();
    // Verificar que passwordHash NO se retorna al cliente
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it('debe fallar si el email ya está registrado', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const response = await request(app).post('/api/auth/register').send(testUser);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(true);
    expect(response.body.code).toBe('CONFLICT');
  });

  it('debe fallar si el email es inválido', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'esto-no-es-un-email' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe fallar si la contraseña tiene menos de 8 caracteres', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe fallar si faltan campos requeridos', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'emanuel@test.com' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('debe hacer login correctamente', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.tokens.refreshToken).toBeDefined();
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  it('debe fallar con contraseña incorrecta', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('debe fallar con email no registrado', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: testUser.password });

    expect(response.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('debe retornar el perfil del usuario autenticado', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser);

    const { accessToken } = registerRes.body.data.tokens;

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data.name).toBe(testUser.name);
  });

  it('debe fallar sin token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('debe renovar el access token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser);

    const { refreshToken } = registerRes.body.data.tokens;

    const response = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data.tokens.accessToken).toBeDefined();
  });

  it('debe fallar con refresh token inválido', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'token_invalido' });

    expect(response.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('debe cerrar sesión correctamente', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser);

    const { accessToken, refreshToken } = registerRes.body.data.tokens;

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(response.status).toBe(200);
  });
});
