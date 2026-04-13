'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadSchema } = require('../validators/upload.schema');
const uploadController = require('../controllers/upload.controller');
const { upload } = require('../config/storage');

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Subir un archivo PDF o Excel
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, type]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [PDF, EXCEL]
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadId:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileType:
 *                       type: string
 *       400:
 *         description: Archivo inválido
 */
router.post('/', upload.single('file'), validate({ body: uploadSchema }), uploadController.upload);

module.exports = router;
