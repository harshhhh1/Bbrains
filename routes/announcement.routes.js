import express from 'express';
const router = express.Router();

import * as announcementController from '../controllers/announcement.controller.js';

// Define your announcement routes here
router.get('/', announcementController.getAnnouncements);
    
router.post('/', announcementController.createAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

export default router;