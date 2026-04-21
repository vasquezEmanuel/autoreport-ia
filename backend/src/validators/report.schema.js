const { z } = require('zod');

const pdfFieldSchema = z.object({
  name: z.string().min(1),
  instruction: z.string().min(1),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'CURRENCY']).default('TEXT'),
  minConfidence: z.number().min(0).max(100).default(80),
  required: z.boolean().default(true),
});

const excelColumnSchema = z.object({
  label: z.string().min(1),
  column: z.string().min(1),
  sheet: z.string().default('Hoja1'),
  startRow: z.number().min(1).default(2),
  active: z.boolean().default(true),
});

const createReportSchema = z
  .object({
    name: z.string().min(1, 'El nombre del reporte es requerido').max(300),
    configuratorId: z.string().uuid().optional(),
    pdfUploadId: z.string().uuid().optional(),
    excelUploadId: z.string().uuid().optional(),
    pdfFields: z.array(pdfFieldSchema).default([]),
    excelColumns: z.array(excelColumnSchema).default([]),
  })
  .refine((data) => data.pdfUploadId || data.excelUploadId, {
    message: 'Debe proporcionar al menos un archivo (PDF o Excel)',
  });

const patchFieldSchema = z.object({
  fieldName: z.string().min(1, 'El nombre del campo es requerido'),
  value: z.string(),
});

module.exports = {
  createReportSchema,
  patchFieldSchema,
};
