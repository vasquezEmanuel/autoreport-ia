'use strict';

const { ValidationError } = require('../utils/errors');

const validate = (schemas) => {
  return (req, _res, next) => {
    const errors = [];

    ['body', 'params', 'query'].forEach((part) => {
      if (!schemas[part]) return;

      const result = schemas[part].safeParse(req[part]);

      if (!result.success) {
        result.error.errors.forEach((err) => {
          errors.push({
            field: err.path.join('.'),
            message: err.message,
          });
        });
      } else {
        req[part] = result.data;
      }
    });

    if (errors.length > 0) {
      throw new ValidationError('Datos de entrada inválidos.', errors);
    }

    next();
  };
};

module.exports = { validate };
