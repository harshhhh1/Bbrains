import { getStreak, claimDailyPoints } from './streak.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const mapStreakToResponse = (streak) => {
    if (!streak) return null;
    const now = new Date();
    const lastClaim = streak.lastClaimedAt ? new Date(streak.lastClaimedAt) : null;
    const diffHours = lastClaim ? (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60) : 100;
    const canClaim = diffHours >= 24;

    return {
        id: streak.id,
        userId: streak.userId,
        currentStreak: Number(streak.currentStreak || 0),
        lastClaimedAt: streak.lastClaimedAt,
        canClaim,
        hoursUntilNextClaim: canClaim ? 0 : Math.max(0, 24 - diffHours)
    };
};

export const getUserStreak = async (req, res) => {
    try {
        const streak = await getStreak(req.user.id);
        return sendSuccess(res, mapStreakToResponse(streak));
    } catch (error) {
        console.error('Get streak error:', error);
        return sendError(res, error.message);
    }
};

export const claimPoints = async (req, res) => {
    try {
        const streak = await claimDailyPoints(req.user.id);
        const XP_REWARDS = [50, 50, 75, 75, 100, 100, 200];
        const COIN_REWARDS = [10, 10, 15, 15, 20, 20, 50];
        const dayIndex = ((streak.currentStreak || 1) - 1) % 7;
        const xp = XP_REWARDS[dayIndex];
        const coins = COIN_REWARDS[dayIndex];

        return sendSuccess(res, {
            xp,
            coins,
            streak: {
                ...mapStreakToResponse(streak),
                canClaim: false
            }
        }, 'Successfully claimed daily rewards!');
    } catch (error) {
        console.error('Claim streak error:', error);
        return sendError(res, error.message);
    }
};
