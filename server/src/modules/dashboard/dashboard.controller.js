import { claimDailyPoints } from '../../modules/streak/streak.service.js';
import { sendError } from '../../utils/response.js';
import {
    getAdminOverview,
    getManagerOverview,
    studentDashboard,
    teacherDashboard,
    adminDashboard
} from './handlers/index.js';

export const getDashboard = async (req, res) => {
    try {
        const user = req.user;

        switch (user.type) {
            case 'student':
                return await studentDashboard(user, res);
            case 'teacher':
                return await teacherDashboard(user, res);
            case 'admin':
                return await adminDashboard(user, res);
            default:
                return await studentDashboard(user, res);
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard' });
    }
};

export { getAdminOverview, getManagerOverview };

export const claimDaily = async (req, res) => {
    try {
        const streak = await claimDailyPoints(req.user.id);
        const XP_REWARDS = [50, 50, 75, 75, 100, 100, 200];
        const COIN_REWARDS = [10, 10, 15, 15, 20, 20, 50];
        const dayIndex = ((streak.currentStreak || 1) - 1) % 7;
        const xp = XP_REWARDS[dayIndex];
        const coins = COIN_REWARDS[dayIndex];

        const { sendSuccess } = await import('../../utils/response.js');
        return sendSuccess(res, {
            xp,
            coins,
            streak: {
                ...streak,
                canClaim: false
            }
        }, 'Successfully claimed daily rewards!');
    } catch (error) {
        console.error('Claim daily error:', error);
        return sendError(res, error.message || 'Failed to claim daily reward');
    }
};
