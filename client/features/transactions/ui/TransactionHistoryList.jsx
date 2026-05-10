"use client";

import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TransactionCard } from "@/features/transactions/ui/TransactionCard";

export function TransactionHistoryList({ transactions, student }) {
  const feeTransactions = transactions.filter((t) => t.category === "fee");

  return (
    <div className="pt-8 space-y-4">
      <h3 className="text-xl font-black tracking-tight">Recent Transactions</h3>
      {feeTransactions.length > 0 ? (
        <div className="space-y-4">
          {feeTransactions.map((transaction) => (
            <TransactionCard
              key={String(transaction.id)}
              transaction={transaction}
              currentUser={student}
            />
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-border/50 bg-muted/10 rounded-[2rem] py-16">
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
            <ArrowLeftRight className="size-12 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">
              No Transactions
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transactions will appear here once records are added to your
              account.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
