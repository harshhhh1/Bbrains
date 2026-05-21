"use client";

import { AlertCircle, KeyRound, Loader2, LogOut, ShieldCheck, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Grid, Stack } from "@/components/layout/page-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/features/settings/model/settings";
import type { SavingState } from "@/features/settings/types/settings";
import { MetricCard, PinSlots, SectionCard } from "@/features/settings/ui/settings-ui";
import { authApi, setAuthToken } from "@/services/api/client";

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
  onPasswordSave: () => Promise<void>;
  // Wallet PIN props
  oldPin: string;
  newPin: string;
  canSubmitPin: boolean;
  walletBalance: number;
  setOldPin: (value: string) => void;
  setNewPin: (value: string) => void;
  onPinSave: () => Promise<void>;
};

/* ─── Field label + input ─── */
function SecField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          {label}
        </p>
        {hint && <p className="text-xs text-muted-foreground/50">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

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
  onPasswordSave,
  oldPin,
  newPin,
  canSubmitPin,
  walletBalance,
  setOldPin,
  setNewPin,
  onPinSave,
}: SettingsSecurityTabProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setAuthToken(null);
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <Grid className="lg:grid-cols-[1.1fr_0.9fr]" gap="lg">
      {/* ─── LEFT: Password + Wallet PIN ─── */}
      <Stack gap="lg">
        {/* Password section */}
        <SectionCard
          icon={<KeyRound className="size-5" />}
          title="Password"
          description="Rotate your password regularly"
        >
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-600 dark:text-amber-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-5">
              Use a password you do not reuse anywhere else. Current password is required.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SecField label="Current password">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Enter current password"
              />
            </SecField>
            <SecField label="New password">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Enter new password"
              />
            </SecField>
            <div className="sm:col-span-2">
              <SecField label="Confirm new password">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="Repeat new password"
                />
              </SecField>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => void onPasswordSave()}
              disabled={saving !== null && saving !== "password"}
              className="h-10 rounded-full px-6 font-semibold"
            >
              {saving === "password" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </SectionCard>

        {/* Wallet PIN section */}
        <SectionCard
          icon={<Wallet className="size-5" />}
          title="Wallet PIN"
          description={isPinSet ? "Update your 6-digit PIN" : "Create a 6-digit PIN for payments"}
        >
          <div className="grid gap-5">
            {isPinSet ? (
              <SecField label="Current PIN" hint="Required before replacing wallet PIN">
                <PinSlots value={oldPin} onChange={setOldPin} />
              </SecField>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-4 text-xs text-muted-foreground/70">
                No wallet PIN found yet. Create one now to protect transfers and payments.
              </div>
            )}

            <div className="grid gap-5">
              <SecField label={isPinSet ? "New PIN" : "Create PIN"}>
                <PinSlots value={newPin} onChange={setNewPin} tone="primary" />
              </SecField>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => void onPinSave()}
              disabled={(saving !== null && saving !== "pin") || !canSubmitPin}
              className="h-10 rounded-full px-6 font-semibold"
            >
              {saving === "pin" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {isPinSet ? "Update PIN" : "Create PIN"}
                </>
              )}
            </Button>
          </div>
        </SectionCard>
      </Stack>

      {/* ─── RIGHT: Security overview + Logout ─── */}
      <Stack gap="lg">
        {/* Security overview card */}
        <SectionCard
          icon={<ShieldCheck className="size-5" />}
          title="Security Overview"
          description="Account status at a glance"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-muted/20 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>
            </div>

            <Grid columns={2} gap="sm">
              <MetricCard label="Wallet PIN" value={isPinSet ? "Active" : "Missing"} note="Wallet actions" />
              <MetricCard label="Balance" value={formatCurrency(walletBalance)} note="Available funds" />
            </Grid>

            <Separator className="my-2" />

            <div className="space-y-2">
              {[
                "Keep your password unique across services",
                "Set wallet PIN before making payments",
                "Review profile details periodically",
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-2.5 rounded-xl bg-muted/10 p-3"
                >
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <p className="text-xs leading-5 text-muted-foreground/70">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Logout button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="h-12 w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </Stack>
    </Grid>
  );
}
