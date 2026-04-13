'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.schema');
const authController = require('../controllers/auth.controller');

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Steven Alipio
 *               email:
 *                 type: string
 *                 format: email
 *                 example: steven@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: miPassword123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       409:
 *         description: El email ya está registrado
 */
router.post('/register', validate({ body: registerSchema }), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: steven@example.com
 *               password:
 *                 type: string
 *                 example: miPassword123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validate({ body: loginSchema }), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado
 *       401:
 *         description: Refresh token inválido
 */
router.post('/refresh', validate({ body: refreshSchema }), authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
