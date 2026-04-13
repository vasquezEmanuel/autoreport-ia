'use strict';

const { z } = require('zod');

// Schema para POST /api/auth/register
const registerSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim(),

  email: z
    .string({ required_error: 'El email es requerido' })
    .email('El email no tiene un formato válido')
    .max(255, 'El email no puede superar 255 caracteres')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres'),
});

// Schema para POST /api/auth/login
const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('El email no tiene un formato válido')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida'),
});

// Schema para POST /api/auth/refresh
const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'El refresh token es requerido' })
    .min(1, 'El refresh token es requerido'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
