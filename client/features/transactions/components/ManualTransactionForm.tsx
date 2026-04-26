"use client";

import React from "react";
import { FormInput } from "@/features/admin/components/form/FormInput";
import { FormSelect } from "@/features/admin/components/form/FormSelect";
import type { ManualTransactionInput, User } from "@/services/api/client";

const paymentModeOptions = [
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "dd", label: "Demand Draft" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "neft", label: "NEFT" },
  { value: "rtgs", label: "RTGS" },
  { value: "imps", label: "IMPS" },
  { value: "other", label: "Other" },
];

const referenceLabelByMode: Record<string, string> = {
  cash: "Reference / proof",
  cheque: "Cheque number",
  upi: "UPI transaction ID",
  dd: "DD number",
  bank_transfer: "Bank reference ID",
  card: "Card reference ID",
  neft: "NEFT reference",
  rtgs: "RTGS reference",
  imps: "IMPS reference",
  other: "Reference / proof",
};

interface ManualTransactionFormProps {
  form: {
    category: ManualTransactionInput["category"];
    targetUserId: string;
    amount: string;
    paymentMode: ManualTransactionInput["paymentMode"];
    referenceId: string;
    note: string;
    paymentDate: string;
  };
  onChange: (updates: any) => void;
  currentTargetOptions: User[];
  mode: "admin" | "manager";
}

function getUserName(user: User | null | undefined) {
  if (!user) return "Unknown user";
  const firstName = user.userDetails?.firstName?.trim();
  const lastName = user.userDetails?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username;
}

export function ManualTransactionForm({
  form,
  onChange,
  currentTargetOptions,
  mode
}: ManualTransactionFormProps) {
  return (
    <div className="space-y-4">
      <FormSelect
        label="Transaction Category"
        value={form.category || ""}
        onChange={(value) => onChange({ category: value as any, targetUserId: "" })}
        options={[
          { value: "salary", label: "Salary Payment" },
          { value: "fee", label: "Fee Received" },
        ]}
      />
      <FormSelect
        label={form.category === "salary" ? "Recipient" : "Student"}
        value={form.targetUserId}
        onChange={(value) => onChange({ targetUserId: value })}
        options={[
          {
            value: "",
            label: currentTargetOptions.length > 0
              ? `Select ${form.category === "salary" ? "recipient" : "student"}`
              : "No users available",
          },
          ...currentTargetOptions.map((user) => ({
            value: user.id,
            label: `${getUserName(user)} (@${user.username})`,
          })),
        ]}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) => onChange({ amount: event.target.value })}
          placeholder="0.00"
          required
        />
        <FormInput
          label="Payment Day"
          type="date"
          value={form.paymentDate}
          onChange={(event) => onChange({ paymentDate: event.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelect
          label="Mode of Payment"
          value={form.paymentMode || ""}
          onChange={(value) => onChange({ paymentMode: value as any })}
          options={paymentModeOptions}
        />
        <FormInput
          label={referenceLabelByMode[form.paymentMode || ""] || "Reference / proof"}
          value={form.referenceId}
          onChange={(event) => onChange({ referenceId: event.target.value })}
          placeholder="Optional"
        />
      </div>
      <FormInput
        label="Internal Note"
        value={form.note}
        onChange={(event) => onChange({ note: event.target.value })}
        placeholder={
          form.category === "salary"
            ? "Optional note for the salary entry"
            : "Optional note for the fee receipt"
        }
      />
      <p className="text-[10px] font-medium text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40 leading-relaxed">
        {form.category === "salary"
          ? mode === "admin"
            ? "Saving this creates a debit for the admin ledger and a matching income entry for the selected staff member."
            : "Saving this creates a debit for the manager ledger and a matching income entry for the selected teacher or staff member."
          : "Saving this creates institution income for the admin finance ledger and a matching fee-paid entry for the selected student."}
      </p>
    </div>
  );
}
