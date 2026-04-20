'use strict';

const configuratorRepository = require('../repositories/configurator.repository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const configuratorService = {
  // GET /api/configurators
  findAll: async ({ userId }) => {
    return configuratorRepository.findAllByUserId(userId);
  },

  // GET /api/configurators/:id
  findById: async ({ id, userId }) => {
    const configurator = await configuratorRepository.findById(id);

    if (!configurator) {
      throw new NotFoundError('Configurador');
    }

    if (configurator.userId !== userId) {
      throw new ForbiddenError('No tienes acceso a este configurador.');
    }

    return configurator;
  },

  // POST /api/configurators
  create: async ({ userId, name, pdfFields, excelColumns }) => {
    return configuratorRepository.create({
      userId,
      name,
      pdfFields,
      excelColumns,
    });
  },

  // PUT /api/configurators/:id
  update: async ({ id, userId, name, pdfFields, excelColumns }) => {
    const configurator = await configuratorRepository.findById(id);

    if (!configurator) {
      throw new NotFoundError('Configurador');
    }

    if (configurator.userId !== userId) {
      throw new ForbiddenError('No tienes acceso a este configurador.');
    }

    return configuratorRepository.update(id, { name, pdfFields, excelColumns });
  },

  // DELETE /api/configurators/:id
  delete: async ({ id, userId }) => {
    const configurator = await configuratorRepository.findById(id);

    if (!configurator) {
      throw new NotFoundError('Configurador');
    }

    if (configurator.userId !== userId) {
      throw new ForbiddenError('No tienes acceso a este configurador.');
    }

    await configuratorRepository.delete(id);
  },
};

module.exports = configuratorService;
