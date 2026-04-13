'use strict';

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../app');
const prisma = require('../../config/database');

const testUser = {
  name: 'Emanuel Vasquez',
  email: 'emanuel.upload@test.com',
  password: 'password123',
};

let accessToken;

// Crear archivo PDF de prueba
const testPdfPath = path.join(__dirname, 'test.pdf');
const testExcelPath = path.join(__dirname, 'test.xlsx');

beforeAll(async () => {
  // Crear archivos de prueba mínimos
  fs.writeFileSync(testPdfPath, '%PDF-1.4 test pdf content');
  fs.writeFileSync(testExcelPath, 'test excel content');
});

beforeEach(async () => {
  await prisma.upload.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Registrar y obtener token
  const res = await request(app).post('/api/auth/register').send(testUser);

  accessToken = res.body.data.tokens.accessToken;
});

afterAll(async () => {
  await prisma.upload.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();

  // Eliminar archivos de prueba
  if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
  if (fs.existsSync(testExcelPath)) fs.unlinkSync(testExcelPath);
});

describe('POST /api/uploads', () => {
  it('debe subir un archivo PDF correctamente', async () => {
    const response = await request(app)
      .post('/api/uploads')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('type', 'PDF')
      .attach('file', testPdfPath, {
        contentType: 'application/pdf',
        filename: 'test.pdf',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.uploadId).toBeDefined();
    expect(response.body.data.fileName).toBe('test.pdf');
    expect(response.body.data.fileType).toBe('PDF');
  });

  it('debe fallar sin autenticación', async () => {
    const response = await request(app)
      .post('/api/uploads')
      .field('type', 'PDF')
      .attach('file', testPdfPath, { contentType: 'application/pdf' });

    expect(response.status).toBe(401);
  });

  it('debe fallar si el tipo no es válido', async () => {
    const response = await request(app)
      .post('/api/uploads')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('type', 'WORD')
      .attach('file', testPdfPath, { contentType: 'application/pdf' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
