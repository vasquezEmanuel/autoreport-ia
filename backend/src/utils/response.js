'use strict';

// Respuesta exitosa estándar → { data, message }
const success = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({ data, message });
};

// Respuesta de creación → 201
const created = (res, data, message = 'Creado exitosamente') => {
  return success(res, data, message, 201);
};

// Sin contenido → 204
const noContent = (res) => {
  return res.status(204).send();
};

// Operación iniciada (proceso async) → 202
const accepted = (res, data, message = 'Operación iniciada') => {
  return success(res, data, message, 202);
};

module.exports = { success, created, noContent, accepted };
