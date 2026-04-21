'use strict';

const configuratorService = require('../services/configurator.service');
const { success, created, noContent } = require('../utils/response');

const configuratorController = {
  findAll: async (req, res) => {
    const { userId } = req.user;
    const configurators = await configuratorService.findAll({ userId });
    return success(res, configurators);
  },

  findById: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const configurator = await configuratorService.findById({ id, userId });
    return success(res, configurator);
  },

  create: async (req, res) => {
    const { userId } = req.user;
    const { name, pdfFields, excelColumns } = req.body;
    const configurator = await configuratorService.create({
      userId,
      name,
      pdfFields,
      excelColumns,
    });
    return created(res, configurator, 'Configurador creado exitosamente.');
  },

  update: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const { name, pdfFields, excelColumns } = req.body;
    const configurator = await configuratorService.update({
      id,
      userId,
      name,
      pdfFields,
      excelColumns,
    });
    return success(res, configurator, 'Configurador actualizado.');
  },

  delete: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    await configuratorService.delete({ id, userId });
    return noContent(res);
  },
};

module.exports = configuratorController;
