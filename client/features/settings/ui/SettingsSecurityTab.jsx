"use client";

import {
  AlertCircle,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/features/settings/model/settings";
import { PinSlots } from "@/features/settings/ui/settings-ui";
import { authApi, setAuthToken } from "@/services/api/client";

/* ─── Field label + input ─── */
function SecField({ label, hint, children }) {
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
}) {
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
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* ─── LEFT: Password + Wallet PIN ─── */}
      <div className="space-y-6">
        {/* Password section */}
        <div className="rounded-3xl border border-border/40 bg-card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Password</h2>
              <p className="text-xs text-muted-foreground/70">
                Rotate your password regularly
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-600 dark:text-amber-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-5">
              Use a password you don't reuse anywhere else. Current password is
              required.
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
        </div>

        {/* Wallet PIN section */}
        <div className="rounded-3xl border border-border/40 bg-card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Wallet PIN</h2>
              <p className="text-xs text-muted-foreground/70">
                {isPinSet
                  ? "Update your 6-digit PIN"
                  : "Create a 6-digit PIN for payments"}
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {isPinSet ? (
              <SecField
                label="Current PIN"
                hint="Required before replacing wallet PIN"
              >
                <PinSlots value={oldPin} onChange={setOldPin} />
              </SecField>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-4 text-xs text-muted-foreground/70">
                No wallet PIN found yet. Create one now to protect transfers and
                payments.
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
        </div>
      </div>

      {/* ─── RIGHT: Security overview + Logout ─── */}
      <div className="space-y-6">
        {/* Security overview card */}
        <div className="rounded-3xl border border-border/40 bg-card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Security Overview
              </h2>
              <p className="text-xs text-muted-foreground/70">
                Account status at a glance
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-muted/20 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/20 p-4 text-center">
                <p className="text-lg font-bold text-foreground">
                  {isPinSet ? "Active" : "Missing"}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Wallet PIN
                </p>
              </div>
              <div className="rounded-2xl bg-muted/20 p-4 text-center">
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(walletBalance)}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Balance
                </p>
              </div>
            </div>

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
                  <p className="text-xs leading-5 text-muted-foreground/70">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="h-12 w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
