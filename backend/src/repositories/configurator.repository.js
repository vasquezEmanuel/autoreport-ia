'use strict';

const prisma = require('../config/database');

const configuratorRepository = {
  findAllByUserId: async (userId) => {
    return prisma.configurator.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id) => {
    return prisma.configurator.findUnique({
      where: { id },
    });
  },

  create: async ({ userId, name, pdfFields, excelColumns }) => {
    return prisma.configurator.create({
      data: { userId, name, pdfFields, excelColumns },
    });
  },

  update: async (id, { name, pdfFields, excelColumns }) => {
    return prisma.configurator.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(pdfFields !== undefined && { pdfFields }),
        ...(excelColumns !== undefined && { excelColumns }),
      },
    });
  },

  delete: async (id) => {
    return prisma.configurator.delete({
      where: { id },
    });
  },
};

module.exports = configuratorRepository;
