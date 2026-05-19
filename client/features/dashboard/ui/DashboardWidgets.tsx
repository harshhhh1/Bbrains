"use client";

import React, { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { Trophy, ReceiptText, Sparkles, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ItemMedia, ItemTitle, ItemDescription } from "@/components/ui/item";
import { dashboardApi, type FeeSummary } from "@/services/api/client";
import { type DashboardData } from "@/lib/types/api";
import { formatCurrency as dashboardFormatCurrency } from "@/features/dashboard/model/utils";

/**
 * Current Date Widget
 */
export function CurrentDate() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-7 w-48 animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <div className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg self-start">
      {new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </div>
  );
}

/**
 * Fee Status Card
 */
interface FeeStatusCardProps {
  feeSummary?: FeeSummary | null;
}

function formatFeeCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

export function FeeStatusCard({ feeSummary }: FeeStatusCardProps) {
  const currency = feeSummary?.currency || "INR";
  const paidAmount = Number(feeSummary?.paidAmount || 0);
  const remainingAmount = feeSummary?.remainingAmount;
  const totalFee = Number(feeSummary?.totalFee || 0);
  const isConfigured = Boolean(feeSummary?.configured);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-brand-orange" />
            Fees
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            {currency}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Fees Paid
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatFeeCurrency(paidAmount, currency)}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
            Fees Remaining
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {remainingAmount == null
              ? "Not set"
              : formatFeeCurrency(remainingAmount, currency)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {isConfigured
            ? `Class fee total: ${formatFeeCurrency(totalFee, currency)}`
            : "Class fee is not configured yet."}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Level & XP Widget
 */
interface LevelWidgetProps {
  level: number;
  xp: number;
  nextLevelXp?: number | null;
  currentLevelXp?: number | null;
}

export function LevelWidget({ level: initialLevel, xp: initialXp, nextLevelXp, currentLevelXp }: LevelWidgetProps) {
  const [realtimeLevel, setRealtimeLevel] = useState<number | null>(null);
  const [realtimeXp, setRealtimeXp] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRealtimeData = async () => {
      try {
        const response = await dashboardApi.getUser();
        if (mounted && response.success && response.data?.xp) {
          setRealtimeLevel(response.data.xp.level || 1);
          setRealtimeXp(response.data.xp.xp || 0);
        }
      } catch (error) {
        console.error("Failed to fetch realtime level data", error);
      }
    };

    const intervalId = setInterval(fetchRealtimeData, 30000);
    const handleFocus = () => fetchRealtimeData();
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const safeLevel = realtimeLevel !== null ? realtimeLevel : (Number.isFinite(initialLevel) && initialLevel > 0 ? initialLevel : 1);
  const safeXp = realtimeXp !== null ? realtimeXp : (Number.isFinite(initialXp) && initialXp > 0 ? initialXp : 0);
  
  const fallbackCurrentLevelXp = Math.max(0, (safeLevel - 1) * 1000);
  const fallbackNextLevelXp = safeLevel * 1000;
  
  const isLevelMatching = safeLevel === initialLevel;

  const resolvedCurrentLevelXp =
    isLevelMatching && typeof currentLevelXp === "number" && Number.isFinite(currentLevelXp)
      ? currentLevelXp
      : fallbackCurrentLevelXp;
  const resolvedNextLevelXp =
    isLevelMatching && typeof nextLevelXp === "number" && Number.isFinite(nextLevelXp)
      ? nextLevelXp
      : fallbackNextLevelXp;

  const hasNextLevel = resolvedNextLevelXp > resolvedCurrentLevelXp;
  const progressStartXp = safeXp >= resolvedCurrentLevelXp ? resolvedCurrentLevelXp : 0;
  const xpNeeded = hasNextLevel ? Math.max(resolvedNextLevelXp - progressStartXp, 0) : 0;
  const xpInLevel = Math.max(safeXp - progressStartXp, 0);
  const xpRemaining = hasNextLevel ? Math.max(resolvedNextLevelXp - safeXp, 0) : 0;
  const progress = hasNextLevel && xpNeeded > 0
    ? Math.min(100, Math.max(0, Math.round((xpInLevel / xpNeeded) * 100)))
    : 100;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">Level Progress</h2>
        <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
          <Trophy className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">Lvl {safeLevel}</span>
          <span className="text-sm text-muted-foreground">
            {hasNextLevel ? `${xpRemaining} XP left` : "MAX XP"}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-brand-orange h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        {hasNextLevel && (
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {xpRemaining} XP to Level {safeLevel + 1}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * General Stats Cards
 */
interface StatsCardsProps {
  stats: DashboardData["stats"];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="overflow-hidden shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center py-6 px-4">
          <ItemMedia variant="icon" className="size-10 rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5 shrink-0" />
          </ItemMedia>
          <div className="flex flex-1 flex-col overflow-hidden px-4">
            <ItemTitle className="text-base font-bold text-foreground">Daily Points</ItemTitle>
            <ItemDescription className="text-xs font-semibold text-muted-foreground">
              {stats.streak > 0
                ? `🔥 ${stats.streak}-day streak! Keep it up!`
                : "Start your streak today!"}
            </ItemDescription>
          </div>
          <Button
            size="lg"
            className="rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all shrink-0"
          >
            Claim
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center py-6 px-4">
          <ItemMedia variant="icon" className="size-10 rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-5 shrink-0" />
          </ItemMedia>
          <div className="flex flex-1 flex-col overflow-hidden px-4">
            <ItemTitle className="text-base font-bold text-foreground">Wallet Balance</ItemTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {dashboardFormatCurrency(Number(stats.walletBalance))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">XP & Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">Level {stats.level}</div>
          <p className="text-xs text-muted-foreground">
            {stats.xp.toLocaleString()} XP earned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.totalCourses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.leaderboardRank
              ? `Rank #${stats.leaderboardRank} on leaderboard`
              : "Not ranked yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
