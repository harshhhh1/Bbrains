import express from 'express'
const router = express.Router();

import * as gamificationController from '../controllers/gamification.controller.js';

// Define your gamification routes here
router.get('/stats/:userId', gamificationController.getUserStats);
router.put('/stats/:userId', gamificationController.updateUserStats);
router.get('/levels', gamificationController.getLevels);

export default router;