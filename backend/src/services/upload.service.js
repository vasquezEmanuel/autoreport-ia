'use strict';

const path = require('path');
const fs = require('fs');
const uploadRepository = require('../repositories/upload.repository');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

const ALLOWED_MIMES = {
  PDF: ['application/pdf'],
  EXCEL: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
};

const safeDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_err) {
    // Ignorar error si no se puede eliminar
  }
};

const uploadService = {
  saveFile: async ({ file, type, userId }) => {
    const allowedMimes = ALLOWED_MIMES[type];

    if (!allowedMimes) {
      safeDeleteFile(file.path);
      throw new ValidationError(`Tipo de archivo no válido: ${type}`);
    }

    if (!allowedMimes.includes(file.mimetype)) {
      safeDeleteFile(file.path);
      throw new ValidationError(
        `El archivo no corresponde al tipo ${type}. Tipo recibido: ${file.mimetype}`
      );
    }

    const upload = await uploadRepository.create({
      userId,
      fileName: file.originalname,
      storedPath: file.path,
      fileType: type,
      fileSizeBytes: BigInt(file.size),
    });

    return {
      uploadId: upload.id,
      fileName: upload.fileName,
      fileType: upload.fileType,
    };
  },

  getUpload: async ({ uploadId, userId }) => {
    const upload = await uploadRepository.findById(uploadId);

    if (!upload) {
      throw new NotFoundError('Upload');
    }

    if (upload.userId !== userId) {
      throw new ForbiddenError('No tienes acceso a este archivo.');
    }

    return upload;
  },
};

module.exports = uploadService;
