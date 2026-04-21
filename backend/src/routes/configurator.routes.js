'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createConfiguratorSchema,
  updateConfiguratorSchema,
} = require('../validators/configurator.schema');
const configuratorController = require('../controllers/configurator.controller');

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/configurators:
 *   get:
 *     summary: Listar configuradores del usuario
 *     tags: [Configurators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de configuradores
 */
router.get('/', configuratorController.findAll);

/**
 * @swagger
 * /api/configurators/{id}:
 *   get:
 *     summary: Obtener un configurador por ID
 *     tags: [Configurators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configurador encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/:id', configuratorController.findById);

/**
 * @swagger
 * /api/configurators:
 *   post:
 *     summary: Crear nuevo configurador
 *     tags: [Configurators]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               pdfFields:
 *                 type: array
 *               excelColumns:
 *                 type: array
 *     responses:
 *       201:
 *         description: Configurador creado
 */
router.post('/', validate({ body: createConfiguratorSchema }), configuratorController.create);

/**
 * @swagger
 * /api/configurators/{id}:
 *   put:
 *     summary: Actualizar configurador
 *     tags: [Configurators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configurador actualizado
 */
router.put('/:id', validate({ body: updateConfiguratorSchema }), configuratorController.update);

/**
 * @swagger
 * /api/configurators/{id}:
 *   delete:
 *     summary: Eliminar configurador
 *     tags: [Configurators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Eliminado
 */
router.delete('/:id', configuratorController.delete);

module.exports = router;
