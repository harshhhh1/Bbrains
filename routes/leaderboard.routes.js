const express = require('express');
const router = express.Router();

const leaderboardController = require('../controllers/leaderboard.controller');

// Define your leaderboard routes here
router.get('/:category/:timePeriod', leaderboardController.getLeaderboard);

module.exports = router;