"use client";

import type { Dispatch, SetStateAction } from "react";
import { AlertCircle, BadgeCheck, Loader2, Mail, Phone, Save, ShieldCheck, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency, getInitials } from "@/features/settings/model/settings";
import type { ProfileFormState, SavingState, SettingsUser } from "@/features/settings/types/settings";
import { FieldBlock, MetricCard, SectionCard } from "@/features/settings/ui/settings-ui";

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
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <SectionCard
        icon={<User className="h-5 w-5" />}
        title="Profile details"
        description="Keep your profile complete and easy to recognize across Bbrains."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FieldBlock label="Username" hint="Used in mentions and quick search.">
            <div className="relative">
              <Input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                className={cn(
                  "h-12 pr-10",
                  usernameError ? "border-destructive focus-visible:ring-destructive/20" : "",
                  form.username.length >= 3 && form.username !== user?.username
                    ? "border-emerald-500/50 focus-visible:ring-emerald-500/20"
                    : ""
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUsername ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : usernameError ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : form.username.length >= 3 && form.username !== user?.username ? (
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                ) : null}
              </div>
            </div>
            {usernameError ? (
              <p className="px-1 text-[12px] font-medium text-destructive transition-all">{usernameError}</p>
            ) : null}
          </FieldBlock>

          <FieldBlock label="Email" hint="Primary account identity.">
            <Input value={user?.email || ""} disabled className="h-12 bg-muted/60" />
          </FieldBlock>

          <FieldBlock label="First name">
            <Input 
              value={form.firstName} 
              disabled={user?.type !== "superadmin"} 
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              className={cn("h-12", user?.type !== "superadmin" ? "bg-muted/60" : "")} 
            />
          </FieldBlock>

          <FieldBlock label="Last name">
            <Input 
              value={form.lastName} 
              disabled={user?.type !== "superadmin"} 
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              className={cn("h-12", user?.type !== "superadmin" ? "bg-muted/60" : "")} 
            />
          </FieldBlock>

          <FieldBlock label="Phone number">
            <Input 
              value={form.phone} 
              disabled={user?.type !== "superadmin"} 
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className={cn("h-12", user?.type !== "superadmin" ? "bg-muted/60" : "")} 
              placeholder="+91 98765 43210" 
            />
          </FieldBlock>

          <FieldBlock label="Gender">
            {user?.type === "superadmin" ? (
              <select
                value={form.sex}
                onChange={(event) => setForm((current) => ({ ...current, sex: event.target.value }))}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <Input
                value={form.sex?.charAt(0).toUpperCase() + form.sex?.slice(1)}
                disabled
                className="h-12 bg-muted/60"
              />
            )}
          </FieldBlock>

          <div className="md:col-span-2">
            <FieldBlock label="Bio" hint="Short profile summary visible in account surfaces.">
              <Textarea
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                rows={5}
                placeholder="Tell classmates and staff a little about you."
                className="resize-none"
              />
            </FieldBlock>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => void onSave()}
            disabled={(saving !== null && saving !== "profile") || !canSaveProfile}
            className="h-11 w-full rounded-xl px-6 font-semibold sm:w-auto"
          >
            {saving === "profile" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save profile changes
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          icon={<BadgeCheck className="h-5 w-5" />}
          title="Profile preview"
          description="Quick view of how your account details currently read."
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-[1.25rem] border border-border/60 bg-background/75 p-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20 rounded-[1.5rem] border border-border">
                <AvatarImage src={form.avatar || undefined} className="object-cover" />
                <AvatarFallback
                  name={user?.username}
                  className="rounded-[1.35rem] bg-primary text-xl font-bold text-primary-foreground"
                >
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xl font-bold tracking-tight text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground">@{form.username || user?.username}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{roleLabel}</Badge>
                  <Badge variant="outline">{gradeLabel}</Badge>
                  <Badge variant="outline">{isPinSet ? "Wallet PIN active" : "Wallet PIN missing"}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="Level" value={`Lv ${level}`} note="Current account level" />
              <MetricCard label="Grade" value={gradeLabel} note="Assigned class level" />
              <MetricCard label="Achievements" value={String(achievementCount)} note="Unlocked milestones" />
              <MetricCard label="Wallet" value={formatCurrency(walletBalance)} note="Current balance" />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Mail className="h-5 w-5" />}
          title="Account summary"
          description="Read-only account context helpful while updating profile details."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Email address</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Phone</p>
                <p className="text-sm text-muted-foreground">{form.phone || "Not provided yet"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Security state</p>
                <p className="text-sm text-muted-foreground">
                  {isPinSet ? "Wallet PIN already enabled." : "Add wallet PIN for payment safety."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
              <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Current grade</p>
                <p className="text-sm text-muted-foreground">{gradeLabel}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
