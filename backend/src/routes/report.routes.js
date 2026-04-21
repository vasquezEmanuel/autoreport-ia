'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReportSchema, patchFieldSchema } = require('../validators/report.schema');
const reportController = require('../controllers/report.controller');

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/reports/stats:
 *   get:
 *     summary: Estadísticas del dashboard
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReports:
 *                       type: integer
 *                     thisMonth:
 *                       type: integer
 *                     configurators:
 *                       type: integer
 *                     inProgress:
 *                       type: integer
 */
router.get('/stats', reportController.getStats);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Listar reportes del usuario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de reportes
 */
router.get('/', reportController.findAll);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Obtener reporte por ID
 *     tags: [Reports]
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
 *         description: Reporte encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/:id', reportController.findById);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Crear nuevo reporte y procesar con IA
 *     tags: [Reports]
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
 *               configuratorId:
 *                 type: string
 *               pdfUploadId:
 *                 type: string
 *               excelUploadId:
 *                 type: string
 *               pdfFields:
 *                 type: array
 *               excelColumns:
 *                 type: array
 *     responses:
 *       201:
 *         description: Reporte creado y procesando
 */
router.post('/', validate({ body: createReportSchema }), reportController.create);

/**
 * @swagger
 * /api/reports/{id}/fields:
 *   patch:
 *     summary: Editar un campo extraído del reporte
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fieldName, value]
 *             properties:
 *               fieldName:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campo actualizado
 */
router.patch('/:id/fields', validate({ body: patchFieldSchema }), reportController.updateField);

/**
 * @swagger
 * /api/reports/{id}/generate:
 *   post:
 *     summary: Generar PDF final del reporte
 *     tags: [Reports]
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
 *         description: PDF generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     outputUrl:
 *                       type: string
 */
router.post('/:id/generate', reportController.generate);

/**
 * @swagger
 * /api/reports/{id}/download:
 *   get:
 *     summary: Descargar reporte generado
 *     tags: [Reports]
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
 *         description: Datos del reporte
 */
router.get('/:id/download', reportController.download);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Eliminar reporte
 *     tags: [Reports]
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
router.delete('/:id', reportController.delete);

module.exports = router;
