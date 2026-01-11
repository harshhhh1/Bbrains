import express from 'express'
const router = express.Router();

import * as notificationController from '../controllers/notification.controller.js';

// Define your notification routes here
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

export default router;