const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

// Define your user routes here
router.get('/', userController.getUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router;