import express from 'express';
import { createCollege, getColleges, getCollege, updateCollege, deleteCollege, togglePauseCollege } from './college.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.post('/', verifyToken, authorize('admin', 'superadmin'), createCollege);
router.get('/', verifyToken, getColleges);
router.get('/:id', verifyToken, getCollege);
router.put('/:id', verifyToken, authorize('admin', 'superadmin'), updateCollege);
router.post('/:id/toggle-pause', verifyToken, authorize('superadmin'), togglePauseCollege);
router.delete('/:id', verifyToken, authorize('admin', 'superadmin'), deleteCollege);

export default router;
