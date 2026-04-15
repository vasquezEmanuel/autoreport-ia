'use strict';

const prisma = require('../config/database');

const uploadRepository = {
  // Guardar registro del archivo subido en la BD
  create: async ({ userId, fileName, storedPath, fileType, fileSizeBytes }) => {
    return prisma.upload.create({
      data: {
        userId,
        fileName,
        storedPath,
        fileType,
        fileSizeBytes,
      },
    });
  },

  // Buscar un upload por ID — verificar que pertenece al usuario
  findById: async (id) => {
    return prisma.upload.findUnique({
      where: { id },
    });
  },

  // Buscar uploads de un usuario
  findByUserId: async (userId) => {
    return prisma.upload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },
};

module.exports = uploadRepository;
