import express from 'express';
import { createRole, getRoles, updateRole, deleteRole, assignRole, removeRole, listUsers, listUserRoles } from './role.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Role CRUD (admin only)
router.post('/', verifyToken, authorize('admin', 'superadmin'), createRole);
router.get('/', verifyToken, authorize('admin', 'superadmin'), getRoles);
router.put('/:id', verifyToken, authorize('admin', 'superadmin'), updateRole);
router.delete('/:id', verifyToken, authorize('admin', 'superadmin'), deleteRole);

// User role management (admin only, except viewing own)
router.get('/users', verifyToken, authorize('admin', 'superadmin'), listUsers);
router.post('/users/:userId/assign', verifyToken, authorize('admin', 'superadmin'), assignRole);
router.delete('/users/:userId/:roleId', verifyToken, authorize('admin', 'superadmin'), removeRole);
router.get('/users/:userId', verifyToken, listUserRoles);

export default router;
