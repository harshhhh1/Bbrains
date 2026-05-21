"use client";

import type { Dispatch, SetStateAction } from "react";
import { AlertCircle, BadgeCheck, Loader2, Pencil, Save, Trophy, User } from "lucide-react";
import { Grid, Stack } from "@/components/layout/page-primitives";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/features/settings/model/settings";
import type { ProfileFormState, SavingState, SettingsUser } from "@/features/settings/types/settings";
import { MetricCard, SectionCard } from "@/features/settings/ui/settings-ui";
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
    <Grid className="lg:grid-cols-[1.1fr_0.9fr]" gap="lg">
      {/* ─── LEFT: Profile card ─── */}
      <SectionCard
        icon={<User className="size-5" />}
        title="Profile Details"
        description="Update your personal information"
      >
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
      </SectionCard>

      {/* ─── RIGHT: Achievements ─── */}
      <Stack gap="lg">
        {/* Stats row */}
        <Grid className="grid-cols-3" gap="sm">
          <MetricCard label="Level" value={`Lv ${level}`} note={roleLabel} />
          <MetricCard label="Badges" value={String(achievementCount)} note={gradeLabel} />
          <MetricCard label="Wallet" value={formatCurrency(walletBalance)} note={isPinSet ? "PIN active" : "PIN missing"} />
        </Grid>

        {/* Achievements grid */}
        <SectionCard
          icon={<Trophy className="size-5" />}
          title="Achievements"
          description={`${achievements.length} badges earned`}
        >
          {achievements.length === 0 ? (
            <EmptyState
              icon={<Trophy className="size-10" />}
              title="No achievements yet"
              description="Keep exploring to unlock your first badge!"
              className="rounded-2xl py-12"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((item) => (
                <AchievementBadge key={item.achievement.id} item={item} />
              ))}
            </div>
          )}
        </SectionCard>
      </Stack>
    </Grid>
  );
}
