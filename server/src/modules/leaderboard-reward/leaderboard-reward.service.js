import prisma from '../../utils/prisma.js';
import { awardXpToUser } from '../xp/xp.service.js';
import { awardCoinsToUser } from '../wallet/wallet.service.js';
import { createNotification } from '../notification/notification.service.js';

const CONFIG_KEYS = {
  weekly: 'leaderboard_weekly_rewards',
  monthly: 'leaderboard_monthly_rewards'
};

const DEFAULT_WEEKLY_REWARDS = [
  { rank: 1, xp: 500, coins: 300 },
  { rank: 2, xp: 300, coins: 200 },
  { rank: 3, xp: 200, coins: 100 }
];

const DEFAULT_MONTHLY_REWARDS = [
  { rank: 1, xp: 2000, coins: 1500 },
  { rank: 2, xp: 1200, coins: 900 },
  { rank: 3, xp: 800, coins: 500 }
];

async function getRewardConfig(category) {
  const configKey = CONFIG_KEYS[category];
  if (!configKey) throw new Error(`Invalid category: ${category}`);

  const config = await prisma.systemConfig.findUnique({
    where: { key: configKey }
  });

  if (!config) {
    return category === 'weekly' ? DEFAULT_WEEKLY_REWARDS : DEFAULT_MONTHLY_REWARDS;
  }

  try {
    return JSON.parse(config.value);
  } catch {
    return category === 'weekly' ? DEFAULT_WEEKLY_REWARDS : DEFAULT_MONTHLY_REWARDS;
  }
}

async function getTopLeaderboardUsers(collegeId, category, limit = 3) {
  const now = new Date();
  let periodStart;

  if (category === 'weekly') {
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    periodStart = new Date(now);
    periodStart.setDate(now.getDate() - diff);
    periodStart.setHours(0, 0, 0, 0);
  } else if (category === 'monthly') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    periodStart = new Date(2020, 0, 1);
  }

  const whereClause = {
    category: category,
    periodStart: {
      gte: periodStart
    }
  };

  if (collegeId) {
    whereClause.user = { collegeId: parseInt(collegeId) };
  }

  const leaderboardData = await prisma.leaderboard.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          userDetails: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
              avatar: true
            }
          }
        }
      }
    },
    orderBy: [
      { score: 'desc' },
      { user: { username: 'asc' } }
    ],
    take: limit * 3
  });

  if (leaderboardData.length === 0) {
    return [];
  }

  const topUsers = [];
  let currentRank = 1;
  let previousScore = null;

  for (const entry of leaderboardData) {
    if (previousScore !== null && entry.score < previousScore) {
      currentRank = topUsers.length + 1;
    }

    if (currentRank <= limit) {
      topUsers.push({
        userId: entry.userId,
        username: entry.user?.username,
        firstName: entry.user?.userDetails?.firstName,
        lastName: entry.user?.userDetails?.lastName,
        displayName: entry.user?.userDetails?.displayName,
        avatar: entry.user?.userDetails?.avatar,
        score: Number(entry.score),
        rank: currentRank
      });
    }

    previousScore = entry.score;

    if (topUsers.length >= limit) {
      let nextIndex = leaderboardData.indexOf(entry) + 1;
      while (nextIndex < leaderboardData.length) {
        const nextEntry = leaderboardData[nextIndex];
        if (nextEntry.score < previousScore) {
          break;
        }
        if (topUsers.length < limit * 2) {
          topUsers.push({
            userId: nextEntry.userId,
            username: nextEntry.user?.username,
            firstName: nextEntry.user?.userDetails?.firstName,
            lastName: nextEntry.user?.userDetails?.lastName,
            displayName: nextEntry.user?.userDetails?.displayName,
            avatar: nextEntry.user?.userDetails?.avatar,
            score: Number(nextEntry.score),
            rank: currentRank
          });
          previousScore = nextEntry.score;
        }
        nextIndex++;
      }
      break;
    }
  }

  return topUsers.slice(0, limit);
}

async function distributeRewards(category) {
  const collegeIds = await prisma.college.findMany({ select: { id: true } });
  const results = [];

  for (const college of collegeIds) {
    try {
      const topUsers = await getTopLeaderboardUsers(college.id, category, 3);
      
      if (topUsers.length === 0) {
        results.push({ collegeId: college.id, status: 'no_users', rewarded: 0 });
        continue;
      }

      const rewards = await getRewardConfig(category);
      let rewarded = 0;

      for (const user of topUsers) {
        const reward = rewards.find(r => r.rank === user.rank);
        
        if (!reward) {
          continue;
        }

        try {
          if (reward.xp > 0) {
            await awardXpToUser(user.userId, reward.xp);
          }

          if (reward.coins > 0) {
            await awardCoinsToUser(user.userId, reward.coins, `Leaderboard ${category} reward - Rank #${user.rank}`);
          }

          const rankEmoji = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉';
          await createNotification(
            user.userId,
            `${rankEmoji} Leaderboard Reward!`,
            `You ranked #${user.rank} on the ${category} leaderboard and earned ${reward.xp} XP + ${reward.coins} coins!`,
            'achievement'
          );

          rewarded++;
          console.log(`Awarded ${reward.xp} XP + ${reward.coins} coins to ${user.username} (Rank #${user.rank})`);
        } catch (error) {
          console.error(`Failed to award reward to user ${user.userId}:`, error);
        }
      }

      results.push({ collegeId: college.id, status: 'success', rewarded });
    } catch (error) {
      console.error(`Failed to distribute ${category} rewards for college ${college.id}:`, error);
      results.push({ collegeId: college.id, status: 'error', error: String(error) });
    }
  }

  return results;
}

export async function distributeWeeklyRewards() {
  console.log('Starting weekly leaderboard reward distribution...');
  const startTime = Date.now();
  
  try {
    const results = await distributeRewards('weekly');
    const duration = Date.now() - startTime;
    console.log(`Weekly rewards distribution completed in ${duration}ms. Results:`, JSON.stringify(results, null, 2));
    return { success: true, results };
  } catch (error) {
    console.error('Weekly rewards distribution failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function distributeMonthlyRewards() {
  console.log('Starting monthly leaderboard reward distribution...');
  const startTime = Date.now();
  
  try {
    const results = await distributeRewards('monthly');
    const duration = Date.now() - startTime;
    console.log(`Monthly rewards distribution completed in ${duration}ms. Results:`, JSON.stringify(results, null, 2));
    return { success: true, results };
  } catch (error) {
    console.error('Monthly rewards distribution failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function getRewardPreview(collegeId, category) {
  const topUsers = await getTopLeaderboardUsers(collegeId, category, 3);
  const rewards = await getRewardConfig(category);

  return {
    category,
    rewards,
    topUsers,
    periodEndsAt: getPeriodEndDate(category)
  };
}

function getPeriodEndDate(category) {
  const now = new Date();
  
  if (category === 'weekly') {
    const daysUntilSunday = 7 - now.getDay();
    const periodEnd = new Date(now);
    periodEnd.setDate(now.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
    periodEnd.setHours(23, 59, 59, 999);
    return periodEnd.toISOString();
  } else {
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    return lastDayOfMonth.toISOString();
  }
}