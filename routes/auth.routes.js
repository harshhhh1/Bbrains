const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

// Define your auth routes here
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;