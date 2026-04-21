const { z } = require('zod');

const pdfFieldSchema = z.object({
  name: z.string().min(1, 'El nombre del campo es requerido'),
  instruction: z.string().min(1, 'La instrucción es requerida'),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'CURRENCY']).default('TEXT'),
  minConfidence: z.number().min(0).max(100).default(80),
  required: z.boolean().default(true),
});

const excelColumnSchema = z.object({
  label: z.string().min(1, 'El nombre de la columna es requerido'),
  column: z.string().min(1, 'La columna es requerida'),
  sheet: z.string().default('Hoja1'),
  startRow: z.number().min(1).default(2),
  active: z.boolean().default(true),
});

const createConfiguratorSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  pdfFields: z.array(pdfFieldSchema).default([]),
  excelColumns: z.array(excelColumnSchema).default([]),
});

const updateConfiguratorSchema = createConfiguratorSchema.partial();

module.exports = {
  createConfiguratorSchema,
  updateConfiguratorSchema,
};
