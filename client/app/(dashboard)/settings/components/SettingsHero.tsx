"use client";

import type { ChangeEvent } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "../lib/settings";
import { MetricCard } from "./settings-ui";
import type { ProfileFormState, SavingState, SettingsUser } from "../types/settings";

type SettingsHeroProps = {
  user: SettingsUser | null;
  form: ProfileFormState;
  saving: SavingState;
  roleLabel: string;
  displayName: string;
  completion: number;
  walletBalanceLabel: string;
  isPinSet: boolean;
  gradeLabel: string;
  onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function SettingsHero({
  user,
  form,
  saving,
  roleLabel,
  displayName,
  completion,
  walletBalanceLabel,
  isPinSet,
  gradeLabel,
  onAvatarUpload,
}: SettingsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_right,rgba(16,185,129,0.12),transparent_30%)]" />
      <div className="relative flex flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-5 md:flex-row md:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-[1.75rem] border-4 border-background shadow-lg md:h-28 md:w-28">
                <AvatarImage src={form.avatar || undefined} className="object-cover" />
                <AvatarFallback
                  name={user?.username}
                  className="rounded-[1.55rem] bg-primary text-2xl font-bold text-primary-foreground"
                >
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="settings-avatar-upload"
                className="absolute -bottom-2 -right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-sm transition-transform hover:scale-105"
              >
                {saving === "avatar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input
                  id="settings-avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarUpload}
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-none bg-primary/10 px-3 py-1 text-primary">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Unified settings
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {roleLabel}
                </Badge>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Settings</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Manage profile identity, contact details, password, wallet PIN, and workspace appearance from one page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{displayName}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>@{form.username || user?.username}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Completion" value={`${completion}%`} note="Profile readiness" />
            <MetricCard label="Wallet" value={walletBalanceLabel} note={isPinSet ? "PIN protected" : "PIN missing"} />
            <MetricCard label="Grade" value={gradeLabel} note="Current class level" />
          </div>
        </div>
      </div>
    </section>
  );
}
