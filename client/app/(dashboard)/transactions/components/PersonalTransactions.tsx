"use client"

import { Loader2, ArrowLeftRight } from "lucide-react"
import Script from "next/script"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { usePersonalTransactions } from "../hooks/usePersonalTransactions"
import { getViewCopy, formatCurrency } from "../utils"
import { DuesCard } from "./DuesCard"
import { TransactionCard } from "./TransactionCard"

export function PersonalTransactions() {
  const {
    currentUser,
    personalTransactions,
    duesData,
    loading,
    activeView,
    totalAmount,
    payAmount,
    setPayAmount,
    isPaying,
    payDialogOpen,
    setPayDialogOpen,
    initializeRazorpayPayment,
  } = usePersonalTransactions()

  const copy = getViewCopy(activeView)

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
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <SectionHeader title={copy.title} subtitle={copy.subtitle} />

      {currentUser?.type === "student" && duesData && duesData.totalCourseFee > 0 && (
        <DuesCard
          duesData={duesData}
          currentUser={currentUser}
          payAmount={payAmount}
          setPayAmount={setPayAmount}
          isPaying={isPaying}
          payDialogOpen={payDialogOpen}
          setPayDialogOpen={setPayDialogOpen}
          onPay={initializeRazorpayPayment}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm overflow-hidden bg-brand-orange/5 border-l-4 border-l-brand-orange">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-orange/70">Transactions</p>
            <p className="mt-2 text-3xl font-black text-foreground">{personalTransactions.length}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Only your own {activeView === "fees" ? "fee payments" : "salary receipts"} are shown here.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm overflow-hidden bg-brand-purple/5 border-l-4 border-l-brand-purple">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-purple/70">Total Amount</p>
            <p className="mt-2 text-3xl font-black text-foreground">{formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Combined amount for all successful records.
            </p>
          </CardContent>
        </Card>
      </div>

      {personalTransactions.length > 0 ? (
        <div className="space-y-4">
          {personalTransactions.map((transaction) => (
            <TransactionCard
              key={String(transaction.id)}
              transaction={transaction}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-border/50 bg-muted/10 rounded-[2rem] py-20">
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
            <ArrowLeftRight className="size-12 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">{copy.empty}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transactions will appear here once records are added to your account.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
