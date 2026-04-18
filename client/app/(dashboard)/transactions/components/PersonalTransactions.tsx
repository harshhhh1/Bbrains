"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftRight, BadgeIndianRupee, Loader2, ReceiptText, Calendar, Hash, Tag, FileDown } from "lucide-react"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { dashboardApi, transactionApi, type Transaction, type User } from "@/services/api/client"
import { cn } from "@/lib/utils"

type PersonalTransactionKind = "fees" | "salary"

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

function hasManagerRole(user: Pick<User, "roles"> | null | undefined) {
  return Boolean(
    user?.roles?.some((entry) =>
      entry?.role?.name?.toLowerCase().includes("manager")
    )
  )
}

function resolvePersonalTransactionKind(user: User | null): PersonalTransactionKind | null {
  if (!user) return null
  if (user.type === "student") return "fees"
  if (user.type === "teacher" || user.type === "staff" || hasManagerRole(user)) return "salary"
  return null
}

function getViewCopy(view: PersonalTransactionKind | null) {
  if (view === "fees") {
    return {
      title: "Fees Paid",
      subtitle: "Your own fee payment history with payment details, references, and recording information.",
      empty: "No fee payment transactions found.",
    }
  }

  if (view === "salary") {
    return {
      title: "Salary Received",
      subtitle: "Your own salary receipt history with payment details, references, and recording information.",
      empty: "No salary receipt transactions found.",
    }
  }

  return {
    title: "My Transactions",
    subtitle: "Only your own personal fee or salary transactions are shown here.",
    empty: "No personal fee or salary transactions found.",
  }
}

export function PersonalTransactions() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const activeView = resolvePersonalTransactionKind(currentUser)
  const copy = getViewCopy(activeView)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const userResponse = await dashboardApi.getUser()

        if (!mounted) return

        if (!userResponse.success || !userResponse.data) {
          toast.error(userResponse.message || "Failed to load your profile")
          return
        }

        const nextUser = userResponse.data
        setCurrentUser(nextUser)

        const nextView = resolvePersonalTransactionKind(nextUser)
        if (!nextView) {
          router.replace("/dashboard")
          return
        }

        const response = await transactionApi.getMyTransactions({
          limit: 200,
          status: "success",
          category: nextView === "fees" ? "fee" : "salary",
          type: nextView === "fees" ? "debit" : "credit",
        })
        if (!mounted) return

        if (response.success) {
          setTransactions(response.data || [])
        } else {
          toast.error(response.message || "Failed to load your transactions")
        }
      } catch (error) {
        console.error(error)
        if (mounted) toast.error("Failed to load your transactions")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  const personalTransactions = useMemo(() => {
    if (activeView === "fees") {
      return transactions.filter(t => t.category === "fee" && t.type === "debit")
    }

    if (activeView === "salary") {
      return transactions.filter(t => t.category === "salary" && t.type === "credit")
    }

    return []
  }, [activeView, transactions])

  const totalAmount = personalTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-10 animate-spin text-brand-purple" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading transactions...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm overflow-hidden bg-brand-orange/5 border-l-4 border-l-brand-orange">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-orange/70">Transactions</p>
            <p className="mt-2 text-3xl font-black text-foreground">{personalTransactions.length}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Only your own {activeView === "fees" ? "fee payments" : "salary receipts"} are shown here.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm overflow-hidden bg-brand-purple/5 border-l-4 border-l-brand-purple">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-purple/70">Total Amount</p>
            <p className="mt-2 text-3xl font-black text-foreground">{formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Combined amount for all successful records.</p>
          </CardContent>
        </Card>
      </div>

      {personalTransactions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalTransactions.map((transaction) => (
            <Card key={String(transaction.id)} className="group relative border-border/40 hover:border-brand-purple/30 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-xl", transaction.category === 'fee' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600")}>
                                {transaction.category === "fee" ? <ReceiptText className="size-4" /> : <BadgeIndianRupee className="size-4" />}
                            </div>
                            <span className="font-bold text-sm">{formatCategory(transaction.category)}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{transaction.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-4">
                    <div>
                        <p className="text-2xl font-black text-foreground">{formatCurrency(transaction.amount)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{transaction.type === 'debit' ? 'Sent' : 'Received'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 pt-2">
                        <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                <Calendar className="size-3" /> Date
                            </span>
                            <span className="text-xs font-bold">{formatDate(transaction.transactionDate)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                <Tag className="size-3" /> Mode
                            </span>
                            <span className="text-xs font-bold uppercase">{transaction.paymentMode || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                <Hash className="size-3" /> Reference
                            </span>
                            <span className="text-xs font-medium truncate font-mono text-muted-foreground">{transaction.referenceId || 'No reference'}</span>
                        </div>
                    </div>

                    {transaction.category === 'fee' && (
                        <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-2 h-9">
                                <FileDown className="mr-2 size-3.5" /> Download Receipt
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-border/50 bg-muted/10 rounded-[2rem] py-20">
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
            <ArrowLeftRight className="size-12 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">{copy.empty}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Transactions will appear here once records are added to your account.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
