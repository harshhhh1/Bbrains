"use client";

import type { Dispatch, SetStateAction } from "react";
import { AlertCircle, BadgeCheck, Loader2, Pencil, Save, Trophy, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency, getInitials } from "@/features/settings/model/settings";
import type { ProfileFormState, SavingState, SettingsUser } from "@/features/settings/types/settings";
import type { UserAchievement } from "@/services/api/client";

type SettingsProfileTabProps = {
  form: ProfileFormState;
  setForm: Dispatch<SetStateAction<ProfileFormState>>;
  user: SettingsUser | null;
  saving: SavingState;
  usernameError: string | null;
  isCheckingUsername: boolean;
  canSaveProfile: boolean;
  displayName: string;
  roleLabel: string;
  gradeLabel: string;
  isPinSet: boolean;
  level: number;
  achievementCount: number;
  walletBalance: number;
  onSave: () => Promise<void>;
};

/* ─── Editable field row ─── */
function EditableRow({
  label,
  children,
  editable = true,
}: {
  label: string;
  children: React.ReactNode;
  editable?: boolean;
}) {
  return (
    <div className="group relative grid grid-cols-[130px_1fr] items-start gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-muted/30">
      <p className="pt-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </p>
      <div className="flex items-start gap-2">
        <div className="flex-1">{children}</div>
        {editable && (
          <Pencil className="mt-3 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </div>
  );
}

/* ─── Mini achievement badge ─── */
function AchievementBadge({ item }: { item: UserAchievement }) {
  const date = new Date(item.unlockedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group/badge flex flex-col items-center gap-2 rounded-2xl border border-border/40 bg-muted/20 p-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover/badge:scale-110">
        {item.achievement.icon ? (
          <img
            src={item.achievement.icon}
            alt={item.achievement.name}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <Trophy className="h-6 w-6" />
        )}
      </div>
      <p className="line-clamp-1 text-xs font-semibold text-foreground">{item.achievement.name}</p>
      <div className="flex items-center gap-2 text-[10px] font-medium">
        <span className="text-emerald-500">+{item.achievement.rewardXP} XP</span>
        <span className="text-amber-500">+{item.achievement.rewardCoins} 🪙</span>
      </div>
      <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">{date}</p>
    </div>
  );
}

/* ─── Main component ─── */
export function SettingsProfileTab({
  form,
  setForm,
  user,
  saving,
  usernameError,
  isCheckingUsername,
  canSaveProfile,
  displayName,
  roleLabel,
  gradeLabel,
  isPinSet,
  level,
  achievementCount,
  walletBalance,
  onSave,
}: SettingsProfileTabProps) {
  const achievements = (user?.userAchievements as UserAchievement[] | undefined) || [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* ─── LEFT: Profile card ─── */}
      <div className="rounded-3xl border border-border/40 bg-card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Profile Details</h2>
            <p className="text-xs text-muted-foreground/70">Update your personal information</p>
          </div>
        </div>

        <div className="divide-y divide-border/30">
          <EditableRow label="Username">
            <div className="relative">
              <Input
                value={form.username}
                onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
                className={cn(
                  "h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0",
                  usernameError && "text-destructive"
                )}
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                {isCheckingUsername ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : usernameError ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : form.username.length >= 3 && form.username !== user?.username ? (
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                ) : null}
              </div>
            </div>
            {usernameError && (
              <p className="mt-0.5 text-[11px] font-medium text-destructive">{usernameError}</p>
            )}
          </EditableRow>

          <EditableRow label="Email" editable={false}>
            <Input
              value={user?.email || ""}
              disabled
              className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0 disabled:opacity-60"
            />
          </EditableRow>

          <EditableRow label="Display Name" editable={true}>
            <Input
              value={form.displayName}
              onChange={(e) => setForm((c) => ({ ...c, displayName: e.target.value }))}
              placeholder="Your public name"
              className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </EditableRow>

          <EditableRow label="Phone" editable={user?.type === "superadmin"}>
            <Input
              value={form.phone}
              disabled={user?.type !== "superadmin"}
              onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
              placeholder="Not provided"
              className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0 disabled:opacity-60"
            />
          </EditableRow>

          <EditableRow label="Gender" editable={user?.type === "superadmin"}>
            {user?.type === "superadmin" ? (
              <select
                value={form.sex}
                onChange={(e) => setForm((c) => ({ ...c, sex: e.target.value }))}
                className="h-10 w-full bg-transparent text-sm text-foreground outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <Input
                value={form.sex?.charAt(0).toUpperCase() + form.sex?.slice(1)}
                disabled
                className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0 disabled:opacity-60"
              />
            )}
          </EditableRow>

          <EditableRow label="Bio">
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((c) => ({ ...c, bio: e.target.value }))}
              rows={3}
              placeholder="Tell us about yourself..."
              className="resize-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </EditableRow>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => void onSave()}
            disabled={(saving !== null && saving !== "profile") || !canSaveProfile}
            className="h-10 rounded-full px-6 font-semibold"
          >
            {saving === "profile" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── RIGHT: Achievements ─── */}
      <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/40 bg-card p-4 text-center">
            <p className="text-2xl font-black tracking-tight text-foreground">Lv {level}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Level</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 text-center">
            <p className="text-2xl font-black tracking-tight text-foreground">{achievementCount}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Badges</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 text-center">
            <p className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(walletBalance)}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Wallet</p>
          </div>
        </div>

        {/* Achievements grid */}
        <div className="rounded-3xl border border-border/40 bg-card p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div>
                <h2 className="text-lg font-bold tracking-tight">Achievements</h2>
                <p className="text-xs text-muted-foreground/70">{achievements.length} badges earned</p>
              </div>
            </div>
          </div>

          {achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/10 py-12 text-center">
              <Trophy className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground/60">No achievements yet</p>
              <p className="mt-1 text-xs text-muted-foreground/40">
                Keep exploring to unlock your first badge!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((item) => (
                <AchievementBadge key={item.achievement.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
