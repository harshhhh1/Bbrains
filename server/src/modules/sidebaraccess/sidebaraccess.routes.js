import express from 'express';
import { getSidebarAccess, updateSidebarAccess } from './sidebaraccess.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/', verifyToken, getSidebarAccess);
router.post('/', verifyToken, authorize('admin', 'superadmin'), updateSidebarAccess);

export default router;
