const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', controller.register);

// POST /api/auth/login
router.post('/login', controller.login);

module.exports = router;
