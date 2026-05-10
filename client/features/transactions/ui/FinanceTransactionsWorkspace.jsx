"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ReceiptText,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { transactionApi, userApi } from "@/services/api/client";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { CrudModal } from "@/features/admin/ui/CrudModal";
import { RoleBadge } from "@/features/admin/ui/RoleBadge";
import { ManualTransactionForm } from "@/features/transactions/ui/ManualTransactionForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function dedupeUsers(users) {
  return Array.from(new Map(users.map((user) => [user.id, user])).values());
}

function hasManagerRole(user) {
  return Boolean(
    user?.roles?.some((entry) =>
      entry?.role?.name?.toLowerCase().includes("manager"),
    ),
  );
}

function getCompactUser(user) {
  if (!user) return "Not linked";
  const fullName = [user.userDetails?.firstName, user.userDetails?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName ? `${fullName} (@${user.username})` : `@${user.username}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatCategory(value) {
  if (!value) return "Other";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function loadUsersForMode(mode) {
  if (mode === "admin") {
    return Promise.all([
      userApi.getStudents(),
      userApi.getTeachers(),
      userApi.getStaff(),
      userApi.getManagers(),
    ]);
  }

  return Promise.all([
    userApi.getStudents(),
    userApi.getTeachers(),
    userApi.getStaff(),
  ]);
}

export function FinanceTransactionsWorkspace({ mode }) {
  const [users, setUsers] = useState([]);
  const [recordedTransactions, setRecordedTransactions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRecorded, setLoadingRecorded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "salary",
    targetUserId: "",
    amount: "",
    paymentMode: "upi",
    referenceId: "",
    note: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  // Pagination & Search
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return recordedTransactions;
    const query = search.toLowerCase();
    return recordedTransactions.filter(
      (t) =>
        t.note?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.paymentMode?.toLowerCase().includes(query) ||
        t.referenceId?.toLowerCase().includes(query) ||
        getCompactUser(t.relatedUser).toLowerCase().includes(query) ||
        getCompactUser(t.recordedByUser).toLowerCase().includes(query),
    );
  }, [recordedTransactions, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize),
  );
  const pagedTransactions = filteredTransactions.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const loadRecordedTransactions = async () => {
    try {
      setLoadingRecorded(true);
      const response = await transactionApi.getRecordedTransactions({
        limit: 100,
      });
      if (response.success) {
        setRecordedTransactions(response.data || []);
      } else {
        toast.error(response.message || "Failed to load recorded transactions");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load recorded transactions");
    } finally {
      setLoadingRecorded(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadParticipants() {
      try {
        setLoadingUsers(true);
        const responses = await loadUsersForMode(mode);
        const loadedUsers = responses.flatMap((response) =>
          response.success ? response.data || [] : [],
        );
        if (mounted) {
          setUsers(dedupeUsers(loadedUsers));
        }

        const failed = responses.find((response) => !response.success);
        if (failed) {
          toast.error(
            failed.message || "Some transaction users could not be loaded",
          );
        }
      } catch (error) {
        console.error(error);
        if (mounted) toast.error("Failed to load transaction users");
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    }

    loadParticipants();
    loadRecordedTransactions();

    return () => {
      mounted = false;
    };
  }, [mode]);

  const salaryRecipients = useMemo(() => {
    return users.filter((user) => {
      if (user.type !== "teacher" && user.type !== "staff") return false;
      if (mode === "manager" && hasManagerRole(user)) return false;
      return true;
    });
  }, [mode, users]);

  const studentOptions = useMemo(() => {
    return users.filter((user) => user.type === "student");
  }, [users]);

  const currentTargetOptions =
    form.category === "salary" ? salaryRecipients : studentOptions;

  useEffect(() => {
    if (!currentTargetOptions.some((user) => user.id === form.targetUserId)) {
      setForm((current) => ({
        ...current,
        targetUserId: currentTargetOptions[0]?.id || "",
      }));
    }
  }, [currentTargetOptions, form.targetUserId]);

  const handleCreateTransaction = async () => {
    if (
      !form.targetUserId ||
      !form.amount ||
      Number(form.amount) <= 0 ||
      !form.paymentDate
    ) {
      toast.error("Please fill in the required transaction details");
      return;
    }

    try {
      setSubmitting(true);
      const response = await transactionApi.createManualTransaction({
        category: form.category,
        targetUserId: form.targetUserId,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        referenceId: form.referenceId.trim() || undefined,
        note: form.note.trim() || undefined,
        paymentDate: form.paymentDate,
      });

      if (response.success) {
        toast.success("Transaction recorded successfully");
        setModalOpen(false);
        setForm({
          category: "salary",
          targetUserId: "",
          amount: "",
          paymentMode: "upi",
          referenceId: "",
          note: "",
          paymentDate: new Date().toISOString().split("T")[0],
        });
        await loadRecordedTransactions();
      } else {
        toast.error(response.message || "Failed to record transaction");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to record transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const recordedTotal = recordedTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <SectionHeader
        title={
          mode === "admin" ? "Finance Transactions" : "Manager Transactions"
        }
        subtitle={
          mode === "admin"
            ? "Record staff salaries and student fee receipts, then review every finance transaction recorded by admins and managers."
            : "Record teacher/staff salaries and fee receipts from students, then review what you have entered."
        }
        action={{
          label: "Record Transaction",
          icon: <ReceiptText className="size-3.5" />,
          onClick: () => setModalOpen(true),
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] border border-border/60 bg-card p-4 sm:p-6 shadow-sm overflow-hidden group relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Records Evaluated
          </p>
          <p className="mt-1 text-2xl sm:text-4xl font-black text-foreground tabular-nums tracking-tighter">
            {recordedTransactions.length}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground/60 leading-relaxed">
            Primary financial events logged in this cycle.
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-x-4 -translate-y-4 group-hover:bg-primary/10 transition-colors" />
        </div>
        <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-4 sm:p-6 shadow-sm overflow-hidden group relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
            Aggregate Value
          </p>
          <p className="mt-1 text-2xl sm:text-4xl font-black text-primary tabular-nums tracking-tighter">
            {formatCurrency(recordedTotal)}
          </p>
          <p className="mt-2 text-xs font-bold text-primary/40 leading-relaxed uppercase tracking-widest">
            Combined institutional volume.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">
            Verified Ledger
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            Historical records of verified institutional finance events.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search ledger..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-11 rounded-xl bg-card border-border/40 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
      </div>

      {loadingRecorded ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Syncing Ledger...
          </p>
        </div>
      ) : pagedTransactions.length === 0 ? (
        <div className="py-24 rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center text-center">
          <ReceiptText className="size-16 mb-4 text-muted-foreground/20" />
          <h3 className="text-lg font-bold">No Records Found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            No transactions match your current search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pagedTransactions.map((tx) => (
            <div
              key={tx.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/40 bg-card rounded-[2rem]"
            >
              <div className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-center p-6 gap-6">
                  {/* Left: Category & Date */}
                  <div className="flex items-center gap-4 lg:w-48 shrink-0">
                    <div className="flex flex-col items-center justify-center size-14 rounded-2xl bg-muted/30 border border-border/40 shrink-0">
                      <span className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">
                        {new Date(tx.transactionDate).toLocaleDateString(
                          "en-IN",
                          { month: "short" },
                        )}
                      </span>
                      <span className="text-xl font-black text-foreground leading-none">
                        {new Date(tx.transactionDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit" },
                        )}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <RoleBadge value={tx.category || "other"} />
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {new Date(tx.transactionDate).getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Counterparties */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 flex-grow">
                    <div className="text-center sm:text-left min-w-0">
                      <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">
                        Recorded By
                      </p>
                      <p className="font-bold text-xs truncate max-w-[180px]">
                        {getCompactUser(tx.recordedByUser)}
                      </p>
                      <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest mt-0.5">
                        {tx.recordedByUser?.type || "System"}
                      </p>
                    </div>

                    <ArrowRight className="hidden sm:block size-4 text-muted-foreground/20 shrink-0" />

                    <div className="text-center sm:text-left min-w-0">
                      <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">
                        Counterparty
                      </p>
                      <p className="font-bold text-xs truncate max-w-[180px]">
                        {getCompactUser(tx.relatedUser)}
                      </p>
                      <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mt-0.5">
                        {tx.relatedUser?.type || "External"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount & Mode */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 lg:w-64 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40">
                    <div className="text-left lg:text-right">
                      <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">
                        Method
                      </p>
                      <p className="text-[10px] font-black uppercase text-foreground/70 tracking-widest">
                        {tx.paymentMode
                          ? formatCategory(tx.paymentMode)
                          : "Manual Entry"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-primary/40 tracking-[0.2em] mb-1">
                        Net Amount
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums tracking-tighter">
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Note footer if exists */}
                {tx.note && (
                  <div className="px-6 py-3 bg-muted/10 border-t border-border/20">
                    <p className="text-[10px] font-medium text-muted-foreground/70 leading-relaxed italic truncate">
                      &quot;{tx.note}&quot;
                      {tx.referenceId && (
                        <span className="ml-2 font-black not-italic opacity-40 uppercase tracking-tighter">
                          — REF: {tx.referenceId}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Showing {pagedTransactions.length} of {filteredTransactions.length}{" "}
            records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-xl border-border/40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center justify-center px-4 h-10 rounded-xl bg-muted/40 border border-border/40 text-[10px] font-black">
              PAGE {page} OF {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-xl border-border/40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <CrudModal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={
          form.category === "salary"
            ? "Record Salary Payment"
            : "Record Fee Receipt"
        }
        onSubmit={handleCreateTransaction}
        submitting={submitting}
        submitLabel="Authorize Record"
      >
        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 animate-spin text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Syncing Directory...
            </p>
          </div>
        ) : (
          <ManualTransactionForm
            form={form}
            onChange={(updates) => setForm((curr) => ({ ...curr, ...updates }))}
            currentTargetOptions={currentTargetOptions}
            mode={mode}
          />
        )}
      </CrudModal>
    </div>
  );
}
