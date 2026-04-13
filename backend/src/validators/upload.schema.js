'use strict';

const { z } = require('zod');

// Schema para validar el campo 'type' que viene en el FormData
// junto con el archivo subido
const uploadSchema = z.object({
  type: z.enum(['PDF', 'EXCEL'], {
    required_error: 'El tipo de archivo es requerido',
    invalid_type_error: 'El tipo debe ser PDF o EXCEL',
  }),
});

module.exports = { uploadSchema };
