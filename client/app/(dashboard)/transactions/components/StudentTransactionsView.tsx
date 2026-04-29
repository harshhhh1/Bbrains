"use client";

import Script from "next/script";
import { Loader2 } from "lucide-react";
import { useStudentTransactions } from "../hooks/useStudentTransactions";
import { FeeSummaryCard } from "./FeeSummaryCard";
import { PaymentSuccessState } from "./PaymentSuccessState";
import { PaymentFailedState } from "./PaymentFailedState";
import { FeePaymentForm } from "./FeePaymentForm";
import { TransactionHistoryList } from "./TransactionHistoryList";
import { SectionHeader } from "@/features/admin/components/SectionHeader";

export function StudentTransactionsView() {
  const {
    student,
    feeDetails,
    transactions,
    loading,
    paymentId,
    setPaymentId,
    amount,
    setAmount,
    verifiedTransaction,
    setVerifiedTransaction,
    isPaying,
    failedPaymentError,
    setFailedPaymentError,
    initializeRazorpayPayment
  } = useStudentTransactions();

  if (loading && !student) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="size-10 animate-spin text-primary/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 w-full max-w-full overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <SectionHeader title="Student Finance" subtitle="Manage your academic tuition fees and view payment history." />

      {paymentId ? (
        <PaymentSuccessState
          paymentId={paymentId}
          transaction={verifiedTransaction}
          student={student}
          onReset={() => { setPaymentId(null); setVerifiedTransaction(null); }}
        />
      ) : failedPaymentError ? (
        <PaymentFailedState
          error={failedPaymentError}
          onRetry={() => setFailedPaymentError(null)}
        />
      ) : (
        <div className="space-y-8">
          {feeDetails ? (
            <FeeSummaryCard
              student={student}
              feeDetails={feeDetails}
              paymentId={paymentId}
            />
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40">
              <p className="text-muted-foreground font-bold">Records unavailable</p>
            </div>
          )}

          <FeePaymentForm 
            feeDetails={feeDetails}
            amount={amount}
            isPaying={isPaying}
            onAmountChange={setAmount}
            onPayNow={initializeRazorpayPayment}
          />
        </div>
      )}

      <TransactionHistoryList 
        transactions={transactions} 
        student={student} 
      />
    </div>
  );
}
