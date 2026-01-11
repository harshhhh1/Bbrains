import express from 'express';
const router = express.Router();

import * as badgeController from '../controllers/badge.controller.js';

// Define your badge routes here
router.get('/', badgeController.getBadges);
router.post('/', badgeController.createBadge);

export default router;