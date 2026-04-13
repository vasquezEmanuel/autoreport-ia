'use strict';

const path = require('path');
const fs = require('fs');
const uploadRepository = require('../repositories/upload.repository');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

// Tipos MIME permitidos por tipo de archivo
const ALLOWED_MIMES = {
  PDF: ['application/pdf'],
  EXCEL: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
};

const uploadService = {
  // POST /api/uploads
  saveFile: async ({ file, type, userId }) => {
    // Verificar que el tipo MIME del archivo coincide con el tipo declarado
    const allowedMimes = ALLOWED_MIMES[type];
    if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
      // Eliminar el archivo subido si el tipo no coincide
      fs.unlinkSync(file.path);
      throw new ValidationError(
        `El archivo no corresponde al tipo ${type}. Tipo recibido: ${file.mimetype}`
      );
    }

    // Guardar el registro en la BD
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

  // Obtener un upload verificando que pertenece al usuario
  getUpload: async ({ uploadId, userId }) => {
    const upload = await uploadRepository.findById(uploadId);

    if (!upload) {
      throw new NotFoundError('Upload');
    }

    // Verificar que el archivo pertenece al usuario que lo solicita
    if (upload.userId !== userId) {
      throw new ForbiddenError('No tienes acceso a este archivo.');
    }

    return upload;
  },
};

module.exports = uploadService;
