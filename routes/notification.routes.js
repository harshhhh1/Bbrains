const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');

// Define your notification routes here
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;