const express = require('express');
const router = express.Router();

const badgeController = require('../controllers/badge.controller');

// Define your badge routes here
router.get('/', badgeController.getBadges);
router.post('/', badgeController.createBadge);

module.exports = router;