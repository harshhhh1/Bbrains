const express = require('express');
const router = express.Router();

const roleController = require('../controllers/role.controller');

// Define your role routes here
router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.delete('/:roleId', roleController.deleteRole);

module.exports = router;