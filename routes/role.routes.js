import express from 'express'
const router = express.Router();

import * as roleController from '../controllers/role.controller.js';

// Define your role routes here
router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.delete('/:roleId', roleController.deleteRole);

export default router;