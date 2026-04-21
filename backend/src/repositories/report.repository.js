'use strict';

const prisma = require('../config/database');

const reportRepository = {
  create: async ({ userId, name, configuratorId, pdfUploadId, excelUploadId }) => {
    return prisma.report.create({
      data: {
        userId,
        name,
        configuratorId: configuratorId || null,
        pdfUploadId: pdfUploadId || null,
        excelUploadId: excelUploadId || null,
        status: 'PROCESSING',
      },
    });
  },

  findById: async (id) => {
    return prisma.report.findUnique({
      where: { id },
      include: {
        configurator: true,
        pdfUpload: true,
        excelUpload: true,
      },
    });
  },

  findAllByUserId: async (userId, { page = 1, pageSize = 10 } = {}) => {
    const skip = (page - 1) * pageSize;
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { configurator: true },
      }),
      prisma.report.count({ where: { userId } }),
    ]);
    return { reports, total };
  },

  updateStatus: async (id, status, extra = {}) => {
    return prisma.report.update({
      where: { id },
      data: { status, ...extra },
    });
  },

  updateExtractedFields: async (id, extractedFields) => {
    return prisma.report.update({
      where: { id },
      data: { extractedFields },
    });
  },

  updateOutputUrl: async (id, outputUrl) => {
    return prisma.report.update({
      where: { id },
      data: {
        outputUrl,
        status: 'COMPLETED',
        generatedAt: new Date(),
      },
    });
  },

  delete: async (id) => {
    return prisma.report.delete({ where: { id } });
  },

  countByUserId: async (userId) => {
    return prisma.report.count({ where: { userId } });
  },

  countByUserIdThisMonth: async (userId) => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return prisma.report.count({
      where: {
        userId,
        createdAt: { gte: start },
      },
    });
  },

  countInProgressByUserId: async (userId) => {
    return prisma.report.count({
      where: {
        userId,
        status: { in: ['PROCESSING', 'GENERATING'] },
      },
    });
  },
};

module.exports = reportRepository;
