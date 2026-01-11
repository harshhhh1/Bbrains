import express from 'express'
const router = express.Router();

import * as userController from '../controllers/user.controller.js';

// Define your user routes here
router.get('/', userController.getUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

export default router;