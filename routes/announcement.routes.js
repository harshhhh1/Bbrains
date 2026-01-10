const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcement.controller');

// Define your announcement routes here
router.get('/', announcementController.getAnnouncements);
router.post('/', announcementController.createAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;