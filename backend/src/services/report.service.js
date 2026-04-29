'use strict';

const reportRepository = require('../repositories/report.repository');
const configuratorRepository = require('../repositories/configurator.repository');
const uploadRepository = require('../repositories/upload.repository');
const aiService = require('./ai.service');
const exportService = require('./export.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const reportService = {
  // GET /api/reports/stats
  getStats: async ({ userId }) => {
    const [total, thisMonth, configuratorsList, inProgress] = await Promise.all([
      reportRepository.countByUserId(userId),
      reportRepository.countByUserIdThisMonth(userId),
      configuratorRepository.findAllByUserId(userId),
      reportRepository.countInProgressByUserId(userId),
    ]);

    return {
      totalReports: total,
      thisMonth,
      configurators: configuratorsList.length,
      inProgress,
    };
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

  // POST /api/reports
  create: async ({
    userId,
    name,
    configuratorId,
    pdfUploadId,
    excelUploadId,
    pdfFields,
    excelColumns,
  }) => {
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

    const report = await reportRepository.create({
      userId,
      name,
      configuratorId,
      pdfUploadId,
      excelUploadId,
    });

    // Procesar en background sin bloquear la respuesta
    reportService._processInBackground({
      reportId: report.id,
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
      const [pdfUpload, excelUpload] = await Promise.all([
        pdfUploadId ? uploadRepository.findById(pdfUploadId) : null,
        excelUploadId ? uploadRepository.findById(excelUploadId) : null,
      ]);

      // Extraer datos con Gemini
      const extractedFields = await aiService.processReport({
        pdfUpload,
        excelUpload,
        pdfFields,
        excelColumns,
      });

      // Generar resumen ejecutivo con Gemini
      const report = await reportRepository.findById(reportId);
      const aiSummary = await aiService.generateSummary(report.name, extractedFields);

      // Actualizar reporte con datos extraídos y resumen
      await reportRepository.updateStatus(reportId, 'REVIEWING', {
        extractedFields,
        aiSummary,
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

  // POST /api/reports/:id/generate — genera el PDF real
  generate: async ({ id, userId }) => {
    const report = await reportRepository.findById(id);
    if (!report) throw new NotFoundError('Reporte');
    if (report.userId !== userId) throw new ForbiddenError();

    if (report.status !== 'REVIEWING') {
      throw new ValidationError('El reporte debe estar en revisión antes de generar el PDF.');
    }

    // Actualizar status a GENERATING
    await reportRepository.updateStatus(id, 'GENERATING');

    // Generar el PDF con PDFKit
    const pdfPath = await exportService.generatePDF({
      report,
      extractedFields: report.extractedFields || [],
      aiSummary: report.aiSummary,
    });

    // Construir la URL de descarga
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const outputUrl = `${baseUrl}/api/reports/${id}/download`;

    // Guardar ruta del PDF y URL en BD
    await reportRepository.updateOutputUrl(id, outputUrl);

    // Guardar también la ruta física del archivo
    await reportRepository.updateStatus(id, 'COMPLETED', {
      outputUrl,
      pdfPath,
      generatedAt: new Date(),
    });

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
