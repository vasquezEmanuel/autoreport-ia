'use strict';

const reportRepository = require('../repositories/report.repository');
const configuratorRepository = require('../repositories/configurator.repository');
const uploadRepository = require('../repositories/upload.repository');
const configuratorService = require('./configurator.service');
const aiService = require('./ai.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const reportService = {
  // GET /api/reports/stats
  getStats: async ({ userId }) => {
    const [total, thisMonth, configuratorsCount, inProgress] = await Promise.all([
      reportRepository.countByUserId(userId),
      reportRepository.countByUserIdThisMonth(userId),
      configuratorRepository.findAllByUserId(userId).then((r) => r.length),
      reportRepository.countInProgressByUserId(userId),
    ]);

    return { totalReports: total, thisMonth, configurators: configuratorsCount, inProgress };
  },

  // GET /api/reports
  findAll: async ({ userId, page, pageSize }) => {
    return reportRepository.findAllByUserId(userId, { page, pageSize });
  },

  // GET /api/reports/:id
  findById: async ({ id, userId }) => {
    const report = await reportRepository.findById(id);

    if (!report) throw new NotFoundError('Reporte');
    if (report.userId !== userId) throw new ForbiddenError();

    return report;
  },

  // POST /api/reports — Crea el reporte y dispara el procesamiento en background
  create: async ({
    userId,
    name,
    configuratorId,
    pdfUploadId,
    excelUploadId,
    pdfFields,
    excelColumns,
  }) => {
    // Si viene configuratorId, cargar los campos del configurador guardado
    let finalPdfFields = pdfFields || [];
    let finalExcelColumns = excelColumns || [];

    if (configuratorId) {
      const configurator = await configuratorRepository.findById(configuratorId);
      if (configurator && configurator.userId === userId) {
        finalPdfFields = configurator.pdfFields;
        finalExcelColumns = configurator.excelColumns;
      }
    }

    if (finalPdfFields.length === 0 && finalExcelColumns.length === 0) {
      throw new ValidationError('Debes definir al menos un campo a extraer.');
    }

    // Crear el reporte en BD con status PROCESSING
    const report = await reportRepository.create({
      userId,
      name,
      configuratorId,
      pdfUploadId,
      excelUploadId,
    });

    // Disparar el procesamiento en background (sin await)
    reportService._processInBackground({
      reportId: report.id,
      userId,
      pdfUploadId,
      excelUploadId,
      pdfFields: finalPdfFields,
      excelColumns: finalExcelColumns,
    });

    return report;
  },

  // Procesamiento asíncrono en background
  _processInBackground: async ({
    reportId,
    pdfUploadId,
    excelUploadId,
    pdfFields,
    excelColumns,
  }) => {
    try {
      // Cargar archivos
      const [pdfUpload, excelUpload] = await Promise.all([
        pdfUploadId ? uploadRepository.findById(pdfUploadId) : null,
        excelUploadId ? uploadRepository.findById(excelUploadId) : null,
      ]);

      // Procesar con IA
      const extractedFields = await aiService.processReport({
        pdfUpload,
        excelUpload,
        pdfFields,
        excelColumns,
      });

      // Actualizar el reporte con los datos extraídos
      await reportRepository.updateStatus(reportId, 'REVIEWING', {
        extractedFields,
      });
    } catch (error) {
      await reportRepository.updateStatus(reportId, 'ERROR', {
        errorMessage: error.message,
      });
    }
  },

  // PATCH /api/reports/:id/fields
  updateField: async ({ id, userId, fieldName, value }) => {
    const report = await reportRepository.findById(id);

    if (!report) throw new NotFoundError('Reporte');
    if (report.userId !== userId) throw new ForbiddenError();

    const fields = (report.extractedFields || []).map((f) =>
      f.fieldName === fieldName ? { ...f, value, status: 'OK', editedByUser: true } : f
    );

    await reportRepository.updateExtractedFields(id, fields);
    return fields;
  },

  // POST /api/reports/:id/generate
  generate: async ({ id, userId }) => {
    const report = await reportRepository.findById(id);

    if (!report) throw new NotFoundError('Reporte');
    if (report.userId !== userId) throw new ForbiddenError();

    // Por ahora retornamos una URL simulada
    // En Sprint 3 aquí generaremos el PDF real con PDFKit
    const outputUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/reports/${id}/download`;

    await reportRepository.updateOutputUrl(id, outputUrl);

    return { outputUrl };
  },

  // DELETE /api/reports/:id
  delete: async ({ id, userId }) => {
    const report = await reportRepository.findById(id);

    if (!report) throw new NotFoundError('Reporte');
    if (report.userId !== userId) throw new ForbiddenError();

    await reportRepository.delete(id);
  },
};

module.exports = reportService;
