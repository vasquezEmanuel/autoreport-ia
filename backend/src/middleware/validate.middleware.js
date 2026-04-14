'use strict';

const { ValidationError } = require('../utils/errors');

const validate = (schemas) => {
  return (req, res, next) => {
    try {
      const errors = [];

      ['body', 'params', 'query'].forEach((part) => {
        if (!schemas[part]) return;

        const result = schemas[part].safeParse(req[part]);

        if (!result.success) {
          // Zod 4 cambió la estructura — manejar ambas versiones
          const issues = result.error?.issues || result.error?.errors || [];
          issues.forEach((err) => {
            errors.push({
              field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
              message: err.message,
            });
          });
        } else {
          req[part] = result.data;
        }
      });

      if (errors.length > 0) {
        return next(new ValidationError('Datos de entrada inválidos.', errors));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { validate };
