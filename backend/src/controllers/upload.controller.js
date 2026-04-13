'use strict';

const uploadService = require('../services/upload.service');
const { created } = require('../utils/response');

const uploadController = {
  // POST /api/uploads
  upload: async (req, res) => {
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
