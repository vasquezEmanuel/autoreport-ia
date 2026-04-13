'use strict';

const prisma = require('../config/database');

const refreshTokenRepository = {
  // Crear un refresh token nuevo al hacer login
  create: async ({ userId, token, expiresAt }) => {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  },

  // Buscar un refresh token — usado en POST /api/auth/refresh
  findByToken: async (token) => {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  // Eliminar un refresh token específico — usado en logout
  deleteByToken: async (token) => {
    return prisma.refreshToken.delete({
      where: { token },
    });
  },

  // Eliminar todos los refresh tokens de un usuario
  // Útil para "cerrar todas las sesiones"
  deleteAllByUserId: async (userId) => {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },
};

module.exports = refreshTokenRepository;
