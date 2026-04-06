import express from 'express';
import { createAnnouncement, getAllAnnouncements, deleteAnnouncement, acknowledgeAnnouncement, getAcknowledgedUsers } from './announcement.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllAnnouncements);
router.post('/', checkPermission('create_announcement'), createAnnouncement);
router.delete('/:id', checkPermission('manage_announcement'), deleteAnnouncement);
router.post('/:id/acknowledge', acknowledgeAnnouncement);
router.get('/:id/acknowledged', getAcknowledgedUsers);

export default router;
