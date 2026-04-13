'use strict';

const prisma = require('../config/database');

const userRepository = {
  // Buscar usuario por email — usado en login y register
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Buscar usuario por ID — usado en /me y middleware de auth
  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // passwordHash NO se incluye — nunca se retorna al cliente
      },
    });
  },

  // Crear nuevo usuario — usado en register
  create: async ({ name, email, passwordHash }) => {
    return prisma.user.create({
      data: { name, email, passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  },
};

module.exports = userRepository;
