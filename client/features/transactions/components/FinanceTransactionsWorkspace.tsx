"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Loader2, ReceiptText, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { transactionApi, userApi, type ManualTransactionInput, type Transaction, type User } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudModal } from "@/features/admin/components/CrudModal"
import { DataTable } from "@/features/admin/components/DataTable"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import { ManualTransactionForm } from "./ManualTransactionForm"

type WorkspaceMode = "admin" | "manager"

function dedupeUsers(users: User[]) {
  return Array.from(new Map(users.map((user) => [user.id, user])).values())
}

function hasManagerRole(user: Pick<User, "roles"> | null | undefined) {
  return Boolean(
    user?.roles?.some((entry) =>
      entry?.role?.name?.toLowerCase().includes("manager")
    )
  )
}

function getCompactUser(user: Transaction["user"] | Transaction["relatedUser"] | Transaction["recordedByUser"]) {
  if (!user) return "Not linked"
  const fullName = [user.userDetails?.firstName, user.userDetails?.lastName].filter(Boolean).join(" ").trim()
  return fullName ? `${fullName} (@${user.username})` : `@${user.username}`
}

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function formatDate(value: string) {
  if (!value) return "Not set"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not set"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatCategory(value?: string | null) {
  if (!value) return "Other"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function loadUsersForMode(mode: WorkspaceMode) {
  if (mode === "admin") {
    return Promise.all([
      userApi.getStudents(),
      userApi.getTeachers(),
      userApi.getStaff(),
      userApi.getManagers(),
    ])
  }

  return Promise.all([
    userApi.getStudents(),
    userApi.getTeachers(),
    userApi.getStaff(),
  ])
}

interface FinanceTransactionsWorkspaceProps {
  mode: WorkspaceMode
}

export function FinanceTransactionsWorkspace({ mode }: FinanceTransactionsWorkspaceProps) {
  const [users, setUsers] = useState<User[]>([])
  const [recordedTransactions, setRecordedTransactions] = useState<Transaction[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRecorded, setLoadingRecorded] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<{
    category: ManualTransactionInput["category"]
    targetUserId: string
    amount: string
    paymentMode: ManualTransactionInput["paymentMode"]
    referenceId: string
    note: string
    paymentDate: string
  }>({
    category: "salary",
    targetUserId: "",
    amount: "",
    paymentMode: "upi",
    referenceId: "",
    note: "",
    paymentDate: new Date().toISOString().split("T")[0],
  })

  const loadRecordedTransactions = async () => {
    try {
      setLoadingRecorded(true)
      const response = await transactionApi.getRecordedTransactions({ limit: 100 })
      if (response.success) {
        setRecordedTransactions(response.data || [])
      } else {
        toast.error(response.message || "Failed to load recorded transactions")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load recorded transactions")
    } finally {
      setLoadingRecorded(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadParticipants() {
      try {
        setLoadingUsers(true)
        const responses = await loadUsersForMode(mode)
        const loadedUsers = responses.flatMap((response) => (response.success ? response.data || [] : []))
        if (mounted) {
          setUsers(dedupeUsers(loadedUsers))
        }

        const failed = responses.find((response) => !response.success)
        if (failed) {
          toast.error(failed.message || "Some transaction users could not be loaded")
        }
      } catch (error) {
        console.error(error)
        if (mounted) toast.error("Failed to load transaction users")
      } finally {
        if (mounted) setLoadingUsers(false)
      }
    }

    loadParticipants()
    loadRecordedTransactions()

    return () => {
      mounted = false
    }
  }, [mode])

  const salaryRecipients = useMemo(() => {
    return users.filter((user) => {
      if (user.type !== "teacher" && user.type !== "staff") return false
      if (mode === "manager" && hasManagerRole(user)) return false
      return true
    })
  }, [mode, users])

  const studentOptions = useMemo(() => {
    return users.filter((user) => user.type === "student")
  }, [users])

  const currentTargetOptions = form.category === "salary" ? salaryRecipients : studentOptions

  useEffect(() => {
    if (!currentTargetOptions.some((user) => user.id === form.targetUserId)) {
      setForm((current) => ({ ...current, targetUserId: currentTargetOptions[0]?.id || "" }))
    }
  }, [currentTargetOptions, form.targetUserId])

  const handleCreateTransaction = async () => {
    if (!form.targetUserId || !form.amount || Number(form.amount) <= 0 || !form.paymentDate) {
      toast.error("Please fill in the required transaction details")
      return
    }

    try {
      setSubmitting(true)
      const response = await transactionApi.createManualTransaction({
        category: form.category,
        targetUserId: form.targetUserId,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        referenceId: form.referenceId.trim() || undefined,
        note: form.note.trim() || undefined,
        paymentDate: form.paymentDate,
      })

      if (response.success) {
        toast.success("Transaction recorded successfully")
        setModalOpen(false)
        setForm({
          category: "salary",
          targetUserId: "",
          amount: "",
          paymentMode: "upi",
          referenceId: "",
          note: "",
          paymentDate: new Date().toISOString().split("T")[0],
        })
        await loadRecordedTransactions()
      } else {
        toast.error(response.message || "Failed to record transaction")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to record transaction")
    } finally {
      setSubmitting(false)
    }
  }

  const recordedTotal = recordedTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeader
        title={mode === "admin" ? "Finance Transactions" : "Manager Transactions"}
        subtitle={
          mode === "admin"
            ? "Record staff salaries and student fee receipts, then review every finance transaction recorded by admins and managers."
            : "Record teacher/staff salaries and fee receipts from students, then review what you have entered."
        }
        action={{ label: "Record Transaction", icon: <ReceiptText className="size-3.5" />, onClick: () => setModalOpen(true) }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm overflow-hidden group relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Records Evaluated</p>
          <p className="mt-1 text-4xl font-black text-foreground tabular-nums tracking-tighter">{recordedTransactions.length}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground/60 leading-relaxed">Primary financial events logged in this cycle.</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-x-4 -translate-y-4 group-hover:bg-primary/10 transition-colors" />
        </div>
        <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6 shadow-sm overflow-hidden group relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Aggregate Value</p>
          <p className="mt-1 text-4xl font-black text-primary tabular-nums tracking-tighter">{formatCurrency(recordedTotal)}</p>
          <p className="mt-2 text-xs font-bold text-primary/40 leading-relaxed uppercase tracking-widest">Combined institutional volume.</p>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <WalletCards className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground">Verified Ledger</h3>
            <p className="text-sm font-medium text-muted-foreground">Historical records of verified institutional finance events.</p>
          </div>
        </div>
        <DataTable<Transaction>
          data={recordedTransactions}
          loading={loadingRecorded}
          searchKeys={["note", "category", "paymentMode", "referenceId"]}
          columns={[
            {
              key: "category",
              label: "Category",
              render: (row) => <RoleBadge value={row.category || "other"} />,
            },
            {
              key: "recordedById",
              label: "Recorded By",
              render: (row) => (
                <div>
                  <p className="font-bold text-foreground text-xs">{getCompactUser(row.recordedByUser)}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{row.recordedByUser?.type || "System"}</p>
                </div>
              ),
            },
            {
              key: "relatedUserId",
              label: "Counterparty",
              render: (row) => (
                <div>
                  <p className="font-bold text-foreground text-xs">{getCompactUser(row.relatedUser)}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{row.relatedUser?.type || "External"}</p>
                </div>
              ),
            },
            {
              key: "paymentMode",
              label: "Mode",
              render: (row) => <span className="text-[10px] font-black uppercase text-foreground/70 tracking-widest">{row.paymentMode ? formatCategory(row.paymentMode) : "N/A"}</span>,
            },
            {
              key: "amount",
              label: "Amount",
              render: (row) => <span className="font-black text-foreground text-sm tabular-nums">{formatCurrency(row.amount)}</span>,
            },
            {
              key: "transactionDate",
              label: "Settlement Day",
              render: (row) => <span className="text-xs font-bold text-muted-foreground">{formatDate(row.transactionDate)}</span>,
            },
          ]}
          emptyText="No financial records found in registry."
        />
      </div>

      <CrudModal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={form.category === "salary" ? "Record Salary Payment" : "Record Fee Receipt"}
        onSubmit={handleCreateTransaction}
        submitting={submitting}
        submitLabel="Authorize Record"
      >
        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 animate-spin text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Directory...</p>
          </div>
        ) : (
          <ManualTransactionForm
            form={form}
            onChange={(updates) => setForm(curr => ({ ...curr, ...updates }))}
            currentTargetOptions={currentTargetOptions}
            mode={mode}
          />
        )}
      </CrudModal>
    </div>
  )
}
