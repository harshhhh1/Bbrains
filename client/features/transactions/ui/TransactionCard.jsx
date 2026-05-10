"use client";

import {
  Calendar,
  Hash,
  Tag,
  FileDown,
  ReceiptText,
  BadgeIndianRupee,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  formatCategory,
  downloadReceipt,
} from "@/features/transactions/model/utils";

export function TransactionCard({ transaction, currentUser }) {
  return (
    <Card className="group relative border-border/40 hover:border-brand-purple/30 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div
            className={cn(
              "p-3 rounded-xl shrink-0",
              transaction.status === "failed"
                ? "bg-red-100 text-red-600"
                : transaction.category === "fee"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600",
            )}
          >
            {transaction.status === "failed" ? (
              <XCircle className="size-6" />
            ) : transaction.category === "fee" ? (
              <ReceiptText className="size-6" />
            ) : (
              <BadgeIndianRupee className="size-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base">
                {formatCategory(transaction.category)}
              </span>
              <Badge
                variant={
                  transaction.status?.toLowerCase() === "success"
                    ? "outline"
                    : "destructive"
                }
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider shrink-0",
                  transaction.status?.toLowerCase() === "success"
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "bg-red-50 text-red-600 border-red-200",
                )}
              >
                {transaction.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="size-3" />{" "}
                {formatDate(transaction.transactionDate)}
              </span>
              <span className="flex items-center gap-1 font-medium uppercase">
                <Tag className="size-3" /> {transaction.paymentMode || "N/A"}
              </span>
              <span className="flex items-center gap-1 font-medium font-mono truncate max-w-[200px]">
                <Hash className="size-3" />{" "}
                {transaction.referenceId || "No reference"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end w-full sm:w-auto gap-3 shrink-0">
          <div className="flex justify-between sm:flex-col sm:text-right w-full sm:w-auto items-center sm:items-end">
            <p className="text-2xl font-black text-foreground">
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {transaction.type === "debit" ? "Sent" : "Received"}
            </p>
          </div>

          {transaction.category === "fee" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto rounded-xl text-[10px] font-black uppercase tracking-widest border-2 h-9"
              onClick={() => downloadReceipt(transaction, currentUser)}
              disabled={transaction.status === "failed"}
            >
              <FileDown className="mr-2 size-3.5" />
              {transaction.status === "failed" ? "No Receipt" : "Download"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
