import express from 'express'
const router = express.Router();

import * as leaderboardController from '../controllers/leaderboard.controller.js';

// Define your leaderboard routes here
router.get('/:category/:timePeriod', leaderboardController.getLeaderboard);

export default router;