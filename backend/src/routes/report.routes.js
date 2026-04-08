'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');

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
 */
router.get('/stats', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 2' });
});

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
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de reportes
 */
router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 2' });
});

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Obtener un reporte por ID
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
 *         description: Reporte no encontrado
 */
router.get('/:id', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 2' });
});

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Crear nuevo reporte
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
 *     responses:
 *       201:
 *         description: Reporte creado
 */
router.post('/', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 2' });
});

/**
 * @swagger
 * /api/reports/{id}/fields:
 *   patch:
 *     summary: Actualizar campos extraídos del reporte
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
 *         description: Campos actualizados
 */
router.patch('/:id/fields', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 2' });
});

/**
 * @swagger
 * /api/reports/{id}/generate:
 *   post:
 *     summary: Generar el PDF final del reporte
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
 *         description: Reporte generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 outputUrl:
 *                   type: string
 */
router.post('/:id/generate', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 3' });
});

/**
 * @swagger
 * /api/reports/{id}/download:
 *   get:
 *     summary: Descargar el PDF del reporte
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
 *         description: Archivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/download', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 3' });
});

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte
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
 *         description: Reporte eliminado
 */
router.delete('/:id', (_req, res) => {
  res.status(501).json({ message: 'Not implemented — Sprint 2' });
});

module.exports = router;
