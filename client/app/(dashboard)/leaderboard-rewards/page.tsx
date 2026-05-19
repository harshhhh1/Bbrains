"use client";

import { useState } from "react";
import { api } from "@/services/api/base";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Shield } from "lucide-react";
import { useHasPermission } from "@/components/providers/permissions-provider";
import type { RewardTier } from "@/lib/types/api";

export default function LeaderboardRewardsAdminPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const canManageInstitution = useHasPermission("manage_institution");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [weeklyRewards, setWeeklyRewards] = useState<RewardTier[]>([
    { rank: 1, xp: 500, coins: 300 },
    { rank: 2, xp: 300, coins: 200 },
    { rank: 3, xp: 200, coins: 100 },
  ]);

  const [monthlyRewards, setMonthlyRewards] = useState<RewardTier[]>([
    { rank: 1, xp: 2000, coins: 1500 },
    { rank: 2, xp: 1200, coins: 900 },
    { rank: 3, xp: 800, coins: 500 },
  ]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const weeklyRes = await api.get<any>("/config/leaderboard_weekly_rewards");
      const monthlyRes = await api.get<any>("/config/leaderboard_monthly_rewards");

      if (weeklyRes.success && weeklyRes.data) {
        try {
          setWeeklyRewards(JSON.parse(weeklyRes.data.value));
        } catch {}
      }
      if (monthlyRes.success && monthlyRes.data) {
        try {
          setMonthlyRewards(JSON.parse(monthlyRes.data.value));
        } catch {}
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveRewards = async (category: "weekly" | "monthly") => {
    const rewards = category === "weekly" ? weeklyRewards : monthlyRewards;
    setSaving(true);
    try {
      const configKey = `leaderboard_${category}_rewards`;
      const response = await api.put("/config", {
        key: configKey,
        value: JSON.stringify(rewards),
        type: "json",
        description: `${category} leaderboard reward tiers (top 3)`,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${category.charAt(0).toUpperCase() + category.slice(1)} rewards updated successfully`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rewards",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateReward = (
    category: "weekly" | "monthly",
    rank: 1 | 2 | 3,
    field: "xp" | "coins",
    value: string
  ) => {
    const setter = category === "weekly" ? setWeeklyRewards : setMonthlyRewards;
    setter((prev) =>
      prev.map((r) =>
        r.rank === rank ? { ...r, [field]: parseInt(value) || 0 } : r
      )
    );
  };

  if (!canManageInstitution) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Shield className="size-10 opacity-40 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm">You do not have permission to manage leaderboard rewards.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leaderboard Rewards</h1>
        <p className="text-muted-foreground">
          Configure XP and coin rewards for top performers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Rewards</CardTitle>
            <CardDescription>
              Rewards distributed every Sunday at 23:59
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyRewards.map((reward) => (
                <div
                  key={reward.rank}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="w-20 text-center">
                    <span className="text-2xl">
                      {reward.rank === 1 ? "🥇" : reward.rank === 2 ? "🥈" : "🥉"}
                    </span>
                    <p className="text-sm font-medium">
                      {reward.rank === 1
                        ? "1st"
                        : reward.rank === 2
                        ? "2nd"
                        : "3rd"}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="w-16 text-xs">XP</Label>
                      <Input
                        type="number"
                        value={reward.xp}
                        onChange={(e) =>
                          updateReward("weekly", reward.rank, "xp", e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-16 text-xs">Coins</Label>
                      <Input
                        type="number"
                        value={reward.coins}
                        onChange={(e) =>
                          updateReward("weekly", reward.rank, "coins", e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => saveRewards("weekly")}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Weekly Rewards
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Rewards</CardTitle>
            <CardDescription>
              Rewards distributed on the 1st of each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRewards.map((reward) => (
                <div
                  key={reward.rank}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="w-20 text-center">
                    <span className="text-2xl">
                      {reward.rank === 1 ? "🥇" : reward.rank === 2 ? "🥈" : "🥉"}
                    </span>
                    <p className="text-sm font-medium">
                      {reward.rank === 1
                        ? "1st"
                        : reward.rank === 2
                        ? "2nd"
                        : "3rd"}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="w-16 text-xs">XP</Label>
                      <Input
                        type="number"
                        value={reward.xp}
                        onChange={(e) =>
                          updateReward("monthly", reward.rank, "xp", e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-16 text-xs">Coins</Label>
                      <Input
                        type="number"
                        value={reward.coins}
                        onChange={(e) =>
                          updateReward("monthly", reward.rank, "coins", e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => saveRewards("monthly")}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Monthly Rewards
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Rewards are automatically distributed via cron jobs at the end of each period</li>
            <li>Weekly rewards are distributed every Sunday at 23:59</li>
            <li>Monthly rewards are distributed on the 1st of each month at 00:00</li>
            <li>Top 3 performers in each college receive rewards</li>
            <li>Users tied at any rank both receive the same reward amount</li>
            <li>Admins can modify reward amounts using this page at any time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}