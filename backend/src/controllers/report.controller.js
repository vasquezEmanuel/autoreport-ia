'use strict';

const reportService = require('../services/report.service');
const { success, created, noContent } = require('../utils/response');

const reportController = {
  // GET /api/reports/stats
  getStats: async (req, res) => {
    const { userId } = req.user;
    const stats = await reportService.getStats({ userId });
    return success(res, stats);
  },

  // GET /api/reports
  findAll: async (req, res) => {
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const { reports, total } = await reportService.findAll({ userId, page, pageSize });
    return res.json({
      data: reports,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  },

  // GET /api/reports/:id
  findById: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const report = await reportService.findById({ id, userId });
    return success(res, report);
  },

  // POST /api/reports
  create: async (req, res) => {
    const { userId } = req.user;
    const { name, configuratorId, pdfUploadId, excelUploadId, pdfFields, excelColumns } = req.body;
    const report = await reportService.create({
      userId,
      name,
      configuratorId,
      pdfUploadId,
      excelUploadId,
      pdfFields,
      excelColumns,
    });
    return created(res, report, 'Reporte creado. Procesando con IA...');
  },

  // PATCH /api/reports/:id/fields
  updateField: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const { fieldName, value } = req.body;
    const fields = await reportService.updateField({ id, userId, fieldName, value });
    return success(res, fields);
  },

  // POST /api/reports/:id/generate
  generate: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const result = await reportService.generate({ id, userId });
    return success(res, result);
  },

  // GET /api/reports/:id/download
  download: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const report = await reportService.findById({ id, userId });

    if (!report.outputUrl) {
      return res.status(400).json({
        error: true,
        message: 'El reporte aún no ha sido generado.',
        code: 'REPORT_NOT_GENERATED',
      });
    }

    // Buscar el archivo PDF en disco
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = process.env.REPORTS_DIR || path.join(__dirname, '../../reports');

    // Buscar el PDF del reporte
    const files = fs.readdirSync(REPORTS_DIR);
    const pdfFile = files.find((f) => f.startsWith(`report_${id}`));

    if (!pdfFile) {
      return res.status(404).json({
        error: true,
        message: 'Archivo PDF no encontrado.',
        code: 'PDF_NOT_FOUND',
      });
    }

    const pdfPath = path.join(REPORTS_DIR, pdfFile);

    // Servir el PDF como stream de descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_${report.name.replace(/\s+/g, '_')}.pdf"`
    );

    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  },

  // DELETE /api/reports/:id
  delete: async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    await reportService.delete({ id, userId });
    return noContent(res);
  },
};

module.exports = reportController;
