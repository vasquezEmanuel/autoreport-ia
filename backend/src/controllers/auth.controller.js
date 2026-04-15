'use strict';

const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    return created(res, result, 'Usuario registrado exitosamente.');
  },

  // POST /api/auth/login
  login: async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return success(res, result, 'Login exitoso.');
  },

  // POST /api/auth/refresh
  refresh: async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh({ refreshToken });
    return success(res, result, 'Token renovado exitosamente.');
  },

  // POST /api/auth/logout
  logout: async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout({ refreshToken });
    return success(res, null, 'Sesión cerrada exitosamente.');
  },

  // GET /api/auth/me
  me: async (req, res) => {
    const { userId } = req.user;
    const user = await authService.me({ userId });
    return success(res, user);
  },
};

module.exports = authController;
