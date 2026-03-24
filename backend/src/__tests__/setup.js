'use strict';

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters_long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ANTHROPIC_API_KEY = 'test_key_will_be_mocked';
process.env.UPLOAD_DIR = './uploads';
process.env.REPORTS_DIR = './reports';
process.env.DATABASE_URL =
  'postgresql://autoreport_user:test_password@localhost:5432/autoreport_test?schema=public';
