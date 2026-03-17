'use strict';

// Variables de entorno para el entorno de test.
// Estas sobreescriben cualquier .env cuando corren los tests.
// Así los tests son reproducibles en cualquier máquina, incluyendo CI.
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters_long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ANTHROPIC_API_KEY = 'test_key_will_be_mocked';
process.env.UPLOAD_DIR = './uploads';
process.env.REPORTS_DIR = './reports';
