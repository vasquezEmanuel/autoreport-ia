'use strict';

const uploadRepository = require('../repositories/upload.repository');
const storageService = require('./storage.service');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

const ALLOWED_MIMES = {
  PDF: ['application/pdf'],
  EXCEL: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
};

const uploadService = {
  saveFile: async ({ file, type, userId }) => {
    const allowedMimes = ALLOWED_MIMES[type];

    if (!allowedMimes) {
      throw new ValidationError(`Tipo de archivo no válido: ${type}`);
    }

    if (!allowedMimes.includes(file.mimetype)) {
      throw new ValidationError(
        `El archivo no corresponde al tipo ${type}. Tipo recibido: ${file.mimetype}`
      );
    }

    // Subir a Supabase Storage
    const { publicUrl } = await storageService.uploadFile({
      filePath: file.path,
      fileName: file.originalname,
      mimeType: file.mimetype,
      userId,
    });

    // Guardar en BD con la URL de Supabase como storedPath
    const upload = await uploadRepository.create({
      userId,
      fileName: file.originalname,
      storedPath: publicUrl, // ← URL de Supabase en vez de path local
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

    if (!upload) throw new NotFoundError('Upload');
    if (upload.userId !== userId) throw new ForbiddenError();

    return upload;
  },
};

module.exports = uploadService;
