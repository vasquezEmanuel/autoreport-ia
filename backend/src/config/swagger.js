'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoReport IA — API',
      version: '1.0.0',
      description: 'API REST para el sistema de generación automática de reportes con IA',
      contact: {
        name: 'Equipo AutoReport',
        email: 'steven.alipio@udea.edu.co',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Servidor actual',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en POST /api/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Descripción del error' },
            code: { type: 'string', example: 'ERROR_CODE' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        Upload: {
          type: 'object',
          properties: {
            uploadId: { type: 'string', format: 'uuid' },
            fileName: { type: 'string' },
            fileType: { type: 'string', enum: ['PDF', 'EXCEL'] },
          },
        },
        Configurator: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            pdfFields: { type: 'array', items: { type: 'object' } },
            excelColumns: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            status: {
              type: 'string',
              enum: [
                'PENDING',
                'UPLOADING',
                'PROCESSING',
                'REVIEWING',
                'GENERATING',
                'COMPLETED',
                'ERROR',
              ],
            },
            outputUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  // Rutas donde Swagger buscará los comentarios JSDoc con @swagger
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
