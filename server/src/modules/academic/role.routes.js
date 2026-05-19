import express from 'express';
import { 
    createRole, getRoles, updateRole, deleteRole, 
    assignRole, removeRole, listUsers, listUserRoles,
    getPermissions, updatePermissions, updateMembers
} from './role.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

// Role CRUD
router.post('/', verifyToken, checkPermission('manage_roles'), createRole);
router.get('/', verifyToken, checkPermission('manage_roles', 'assign_roles'), getRoles);
router.get('/permissions', verifyToken, checkPermission('manage_roles'), getPermissions);
router.put('/:id/permissions', verifyToken, checkPermission('manage_roles'), updatePermissions);
router.put('/:id/members', verifyToken, checkPermission('assign_roles'), updateMembers);
router.put('/:id', verifyToken, checkPermission('manage_roles'), updateRole);
router.delete('/:id', verifyToken, checkPermission('manage_roles'), deleteRole);

// User role management (except viewing own)
router.get('/users', verifyToken, checkPermission('manage_roles', 'assign_roles'), listUsers);
router.post('/users/:userId/assign', verifyToken, checkPermission('assign_roles'), assignRole);
router.delete('/users/:userId/:roleId', verifyToken, checkPermission('assign_roles'), removeRole);
router.get('/users/:userId', verifyToken, listUserRoles);

export default router;
