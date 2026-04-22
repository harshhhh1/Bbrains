"use client"

import { Calendar, Hash, Tag, FileDown, ReceiptText, BadgeIndianRupee, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Transaction, User } from "@/services/api/client"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate, formatCategory, downloadReceipt } from "../utils"

interface TransactionCardProps {
  transaction: Transaction
  currentUser: User | null
}

export function TransactionCard({ transaction, currentUser }: TransactionCardProps) {
  return (
    <Card className="group relative border-border/40 hover:border-brand-purple/30 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              transaction.status === "failed"
                ? "bg-red-100 text-red-600"
                : transaction.category === "fee"
                ? "bg-amber-100 text-amber-600"
                : "bg-emerald-100 text-emerald-600"
            )}>
              {transaction.status === "failed" ? (
                <XCircle className="size-4" />
              ) : transaction.category === "fee" ? (
                <ReceiptText className="size-4" />
              ) : (
                <BadgeIndianRupee className="size-4" />
              )}
            </div>
            <span className="font-bold text-sm">{formatCategory(transaction.category)}</span>
          </div>
          <Badge
            variant={transaction.status === "success" ? "outline" : "destructive"}
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              transaction.status === "success"
                ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                : "bg-red-50 text-red-600 border-red-200"
            )}
          >
            {transaction.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        <div>
          <p className="text-2xl font-black text-foreground">{formatCurrency(transaction.amount)}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {transaction.type === "debit" ? "Sent" : "Received"}
          </p>
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
            <span className="text-xs font-bold uppercase">{transaction.paymentMode || "N/A"}</span>
          </div>
          <div className="flex flex-col gap-0.5 col-span-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <Hash className="size-3" /> Reference
            </span>
            <span className="text-xs font-medium truncate font-mono text-muted-foreground">
              {transaction.referenceId || "No reference"}
            </span>
          </div>
        </div>

        {transaction.category === "fee" && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-2 h-9"
              onClick={() => downloadReceipt(transaction, currentUser)}
              disabled={transaction.status === "failed"}
            >
              <FileDown className="mr-2 size-3.5" />
              {transaction.status === "failed" ? "No Receipt (Failed)" : "Download Receipt"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
