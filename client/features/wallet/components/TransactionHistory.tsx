"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, AlertCircle, TrendingUp, TrendingDown, Share2, Download, Calendar, MessageSquare, ArrowUpRight } from "lucide-react";
import { Transaction } from "@/services/api/client";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export function TransactionHistory({ transactions, loading, error }: TransactionHistoryProps) {
  const [txnSearch, setTxnSearch] = useState("");
  const [showTxnReceipt, setShowTxnReceipt] = useState<Transaction | null>(null);

  const formatTxnDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Unknown date";
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return `Today, ${format(date, "hh:mm a")}`;
      if (isYesterday(date)) return `Yesterday, ${format(date, "hh:mm a")}`;
      return format(date, "MMM dd, yyyy • hh:mm a");
    } catch (e) {
      return dateStr;
    }
  };

  const filteredTxns = transactions.filter((t) => {
    const desc = t.note || t.description || "";
    const amt = t.amount?.toString() || "";
    const username = t.relatedUser?.username || t.user?.username || "";
    if (txnSearch && 
        !desc.toLowerCase().includes(txnSearch.toLowerCase()) && 
        !amt.includes(txnSearch) &&
        !username.toLowerCase().includes(txnSearch.toLowerCase())
    ) return false;
    return true;
  });

  const isCredit = (type: string | undefined) => {
    const t = type?.toLowerCase() || "";
    return t === "credit" || t === "received" || t === "deposit";
  };

  return (
    <>
        <CardHeader className="px-0 pt-0 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold tracking-tight">Recent Activity</CardTitle>
            <div className="relative w-full max-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search activity..." 
                value={txnSearch} 
                onChange={(e) => setTxnSearch(e.target.value)} 
                className="pl-9 h-9 text-xs rounded-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-2">
          {loading ? (
            <div className="space-y-4 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-destructive bg-destructive/5 rounded-3xl border border-destructive/10 mt-4">
              <AlertCircle className="h-8 w-8 opacity-20" />
              <p className="font-medium">{error}</p>
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="py-20 text-sm text-muted-foreground text-center border-2 border-dashed border-muted/50 rounded-[32px] mt-4 flex flex-col items-center gap-3">
              <div className="p-4 bg-muted/30 rounded-full">
                <Search className="w-6 h-6 opacity-20" />
              </div>
              <p className="font-medium italic">No transactions found for this search</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredTxns.map((txn) => {
                const credit = isCredit(txn.type);
                const user = txn.relatedUser || txn.user;
                const username = user?.username || "System";
                const avatarUrl = (user as { avatar?: string })?.avatar;
                const note = txn.note || txn.description;

                return (
                  <div
                    key={txn.id}
                    onClick={() => setShowTxnReceipt(txn)}
                    className="group relative flex items-center justify-between p-4 px-2 transition-all cursor-pointer hover:bg-muted/30 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative">
                        <Avatar className="w-11 h-11 border-2 border-background shadow-sm ring-1 ring-border group-hover:ring-primary/30 transition-all">
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                          <AvatarFallback name={username} className="bg-gradient-to-br from-primary/5 to-primary/10 text-primary text-[10px] font-black tracking-tighter">
                            {username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center shadow-sm ${credit ? 'bg-green-500' : 'bg-destructive'}`}>
                          {credit ? (
                            <TrendingUp className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{username}</p>
                          <Badge 
                            variant="secondary" 
                            className="text-[9px] uppercase tracking-wider h-4 px-1.5 font-bold leading-none bg-muted/50 text-muted-foreground border-none"
                          >
                            {txn.type || "unknown"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-muted-foreground/70 tracking-tight">
                           <span>{txn.transactionDate ? formatTxnDate(txn.transactionDate) : "Unknown date"}</span>
                           {note && (
                             <>
                               <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
                               <span className="truncate italic max-w-[120px]">&quot;{note}&quot;</span>
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                       <p className={`font-black text-base tracking-tighter ${credit ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                        {credit ? "+" : "-"}{txn.amount ?? 0}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">B-COINS</p>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        {filteredTxns.length > 5 && (
          <div className="pt-2 px-2">
             <Link 
               href="/transactions" 
               className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-muted/30 hover:bg-muted/50 text-xs font-bold text-muted-foreground transition-all active:scale-95 group uppercase tracking-widest"
             >
               View Full History
               <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
             </Link>
          </div>
        )}


      {/* Embedded Transaction Receipt Dialog */}
      <Dialog open={!!showTxnReceipt} onOpenChange={() => setShowTxnReceipt(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Transaction Receipt</DialogTitle>
            <DialogDescription className="text-center text-[10px] opacity-50 truncate">
              ID: {showTxnReceipt?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isCredit(showTxnReceipt?.type) ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
              {isCredit(showTxnReceipt?.type) ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground capitalize">
                {isCredit(showTxnReceipt?.type) ? "Credit Received" : "Debit Transaction"}
              </h3>
              <p className="text-sm text-muted-foreground">{showTxnReceipt?.transactionDate ? formatTxnDate(showTxnReceipt.transactionDate) : ''}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm text-left border border-muted">
              <div className="flex justify-between items-center pb-2 border-b border-muted">
                <span className="text-muted-foreground">Amount</span>
                <span className={`font-bold text-lg ${isCredit(showTxnReceipt?.type) ? 'text-green-600' : 'text-destructive'}`}>
                  {isCredit(showTxnReceipt?.type) ? "+" : "-"}{showTxnReceipt?.amount ?? 0} B-Coins
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20">Success</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">{showTxnReceipt?.type || "unknown"}</Badge>
              </div>
              {(showTxnReceipt?.note || showTxnReceipt?.description) && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground block mb-1">Note</span>
                  <p className="text-foreground text-xs bg-background/50 p-2 rounded-md italic">
                    &quot;{showTxnReceipt.note || showTxnReceipt.description}&quot;
                  </p>
                </div>
              )}
              {(showTxnReceipt?.relatedUser || showTxnReceipt?.user) && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground block mb-1">Party Involved</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback name={showTxnReceipt.relatedUser?.username || showTxnReceipt.user?.username} className="text-[10px]">
                        {(showTxnReceipt.relatedUser?.username || showTxnReceipt.user?.username || "??").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-xs">
                      {showTxnReceipt.relatedUser?.username || showTxnReceipt.user?.username}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
              <Button variant="default" className="flex-1 h-10"><Download className="w-4 h-4 mr-2" /> Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

