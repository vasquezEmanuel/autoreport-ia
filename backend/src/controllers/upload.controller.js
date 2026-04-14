'use strict';

const uploadService = require('../services/upload.service');
const { created } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const uploadController = {
  upload: async (req, res) => {
    // Verificar que Multer procesó el archivo correctamente
    if (!req.file) {
      throw new ValidationError('No se recibió ningún archivo.');
    }

    const { type } = req.body;
    const { userId } = req.user;

    const result = await uploadService.saveFile({
      file: req.file,
      type,
      userId,
    });

    return created(res, result, 'Archivo subido exitosamente.');
  },
};

module.exports = uploadController;
