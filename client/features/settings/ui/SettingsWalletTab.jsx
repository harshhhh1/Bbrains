"use client";

import { Loader2, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/features/settings/model/settings";
import {
  FieldBlock,
  MetricCard,
  PinSlots,
  SectionCard,
} from "@/features/settings/ui/settings-ui";

export function SettingsWalletTab({
  saving,
  isPinSet,
  oldPin,
  newPin,
  confirmPin,
  walletBalance,
  canSubmitPin,
  setOldPin,
  setNewPin,
  setConfirmPin,
  onSave,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
      <SectionCard
        icon={<Wallet className="h-5 w-5" />}
        title="Wallet security PIN"
        description="Add or rotate your 6-digit wallet PIN before approving payments."
      >
        <div className="grid gap-6">
          {isPinSet ? (
            <FieldBlock
              label="Current PIN"
              hint="Required before replacing wallet PIN."
            >
              <PinSlots value={oldPin} onChange={setOldPin} />
            </FieldBlock>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              No wallet PIN found yet. Create one now so transfers and paid
              actions stay protected.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <FieldBlock label={isPinSet ? "New PIN" : "Create PIN"}>
              <PinSlots value={newPin} onChange={setNewPin} tone="primary" />
            </FieldBlock>

            <FieldBlock label="Confirm PIN">
              <PinSlots value={confirmPin} onChange={setConfirmPin} />
            </FieldBlock>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => void onSave()}
            disabled={(saving !== null && saving !== "pin") || !canSubmitPin}
            className="h-11 w-full rounded-xl px-6 sm:w-auto"
          >
            {saving === "pin" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {isPinSet ? "Update wallet PIN" : "Create wallet PIN"}
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Wallet snapshot"
        description="Current wallet status tied to your account security."
      >
        <div className="space-y-4">
          <div className="rounded-[1.25rem] bg-primary/10 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
              Available balance
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(walletBalance)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="PIN status"
              value={isPinSet ? "Active" : "Not set"}
              note="Needed for wallet actions"
            />
            <MetricCard
              label="Protection"
              value={isPinSet ? "Ready" : "Incomplete"}
              note="Add PIN for stronger control"
            />
          </div>

          <div className="rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Security note</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Wallet PIN protects transfers, checkout actions, and other payment
              approvals inside account flows.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
