import { getLeaderboard, getMyPosition } from './leaderboard.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const VALID_CATEGORIES = ['weekly', 'monthly', 'allTime', 'course'];
const VALID_SORT = ['xp', 'points'];

const sanitizeCategory = (cat) => VALID_CATEGORIES.includes(cat) ? cat : 'allTime';
const sanitizeSort = (sort) => VALID_SORT.includes(sort) ? sort : 'xp';

// GET /leaderboard
export const getLeaderboardHandler = async (req, res) => {
    try {
        const category = sanitizeCategory(req.query.category);
        const sortBy = sanitizeSort(req.query.sortBy);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        const collegeId = req.user.collegeId;
        const leaderboard = await getLeaderboard(category, sortBy, limit, offset, collegeId);
        return sendSuccess(res, leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        return sendError(res, 'Failed to fetch leaderboard', 500);
    }
};

// GET /leaderboard/me
export const getMyLeaderboardPosition = async (req, res) => {
    try {
        const category = sanitizeCategory(req.query.category);
        const sortBy = sanitizeSort(req.query.sortBy);
        const collegeId = req.user.collegeId;
        const position = await getMyPosition(req.user.id, category, sortBy, collegeId);
        return sendSuccess(res, position || { rank: null, message: 'Not on leaderboard yet' });
    } catch (error) {
        console.error('My position error:', error);
        return sendError(res, 'Failed to fetch position', 500);
    }
};
