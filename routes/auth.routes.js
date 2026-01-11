import express from 'express';
const router = express.Router();

import * as authController from '../controllers/auth.controller.js';

// Define your auth routes here
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.post('/refresh-token', authController.refreshToken);

export default router;