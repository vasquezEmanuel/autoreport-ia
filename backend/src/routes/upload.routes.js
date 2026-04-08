'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();
router.use(authenticate);

router.post('/', (_req, res) => res.status(501).json({ message: 'Sprint 1' }));

module.exports = router;
