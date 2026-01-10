const express = require('express');
const router = express.Router();

const gamificationController = require('../controllers/gamification.controller');

// Define your gamification routes here
router.get('/stats/:userId', gamificationController.getUserStats);
router.put('/stats/:userId', gamificationController.updateUserStats);
router.get('/levels', gamificationController.getLevels);

module.exports = router;