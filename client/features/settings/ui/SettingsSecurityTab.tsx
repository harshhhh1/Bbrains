"use client";

import { AlertCircle, BadgeCheck, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { SavingState } from "@/features/settings/types/settings";
import { FieldBlock, MetricCard, SectionCard } from "@/features/settings/ui/settings-ui";

type SettingsSecurityTabProps = {
  displayName: string;
  username: string;
  isPinSet: boolean;
  saving: SavingState;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  onSave: () => Promise<void>;
};

export function SettingsSecurityTab({
  displayName,
  username,
  isPinSet,
  saving,
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  onSave,
}: SettingsSecurityTabProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
      <SectionCard
        icon={<KeyRound className="h-5 w-5" />}
        title="Password and login access"
        description="Rotate your password regularly to keep account access protected."
      >
        <div className="mb-5 flex items-start gap-3 rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm leading-6">
            Use a new password you do not reuse anywhere else. Current password stays required before saving.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FieldBlock label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="h-12"
              placeholder="Enter current password"
            />
          </FieldBlock>

          <FieldBlock label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-12"
              placeholder="Enter new password"
            />
          </FieldBlock>

          <div className="md:col-span-2">
            <FieldBlock label="Confirm new password">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12"
                placeholder="Repeat new password"
              />
            </FieldBlock>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => void onSave()}
            disabled={saving !== null && saving !== "password"}
            className="h-11 w-full rounded-xl px-6 sm:w-auto"
          >
            {saving === "password" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Update password
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Security overview"
        description="Quick account checks before you leave this page."
      >
        <div className="space-y-4">
          <div className="rounded-[1.25rem] border border-border/60 bg-background/75 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Account identity
            </p>
            <p className="mt-3 text-base font-semibold text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Password" value="Manual update" note="Current password required" />
            <MetricCard label="Wallet PIN" value={isPinSet ? "Enabled" : "Missing"} note="Used for wallet actions" />
          </div>

          <Separator />

          <div className="space-y-3">
            {[
              "Keep password unique.",
              "Set wallet PIN before payments.",
              "Review profile details after avatar change.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1rem] border border-border/50 bg-background/60 p-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
