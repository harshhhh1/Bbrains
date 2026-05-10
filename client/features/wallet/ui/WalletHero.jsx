"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function WalletHero({
  walletBalance,
  xp,
  level,
  nextLevel,
  progressPercent,
}) {
  const formatPoints = (amount) => Number(amount ?? 0).toLocaleString();

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-border bg-gradient-to-br from-background via-card/50 to-muted/20 p-6 shadow-sm dark:from-slate-900/50 dark:via-slate-900/20 dark:to-slate-950/40">
      <div className="pointer-events-none absolute right-6 top-6 hidden opacity-20 md:block">
        <CreditCard className="w-14 h-14 text-foreground" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Student Wallet
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Your campus coins, XP, and reward progress
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This wallet tracks what a student earns through assignments,
            attendance, streaks, and performance, then turns those coins into
            store access and progress milestones.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900 dark:bg-primary/20 dark:border dark:border-primary/30 p-5 text-white shadow-lg flex flex-col justify-between transition-transform hover:scale-[1.02]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                  Available Coins
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <img
                    src="/bcoin.svg"
                    className="h-10 w-10 drop-shadow-lg"
                    alt=""
                  />
                  <p className="text-4xl font-bold">
                    {formatPoints(walletBalance)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Ready to spend in the reward store.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm flex flex-col justify-between backdrop-blur-sm transition-transform hover:scale-[1.02]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  XP Collected
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {formatPoints(xp)}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                Academic growth across tasks and milestones.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm flex flex-col justify-between backdrop-blur-sm transition-transform hover:scale-[1.02]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Current Level
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  Level {level}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                {nextLevel
                  ? `${Math.max(nextLevel.requiredXp - xp, 0)} XP to next level`
                  : "Top tier reached"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card/30 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Level progress
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-5">
            <Progress value={progressPercent} className="h-2.5 bg-muted" />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Level {level}</span>
            <span>{nextLevel ? `Level ${nextLevel.levelNumber}` : "Max"}</span>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Earn
              </p>
              <p className="mt-2 text-xs font-medium text-foreground/80">
                Assignments, attendance, quiz performance, and streak bonuses.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Spend
              </p>
              <p className="mt-2 text-xs font-medium text-foreground/80">
                Use coins in the store for perks, unlocks, and student rewards.
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <Link
                href="/market"
                className="flex-1 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
              >
                Open Store
              </Link>
              <Link
                href="/assignments"
                className="flex-1 rounded-full border border-border bg-background/50 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted active:scale-95"
              >
                Earn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
