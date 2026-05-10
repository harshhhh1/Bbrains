"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardContent } from "@/components/dashboard-content";
import {
  Search,
  CreditCard,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
  Building2,
  X,
} from "lucide-react";
import { transactionApi, type Transaction } from "@/services/api/client";

interface Payment {
  id: string;
  type: "wallet";
  amount: number;
  status: "completed" | "pending" | "cancelled" | "failed";
  description: string;
  createdAt: string;
  relatedUser?: any;
}

function mapTransactionStatus(status: Transaction["status"]): Payment["status"] {
  if (status === "success") return "completed";
  if (status === "pending") return "pending";
  return "failed";
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const txnRes = await transactionApi.getMyTransactions({ limit: 100 });
      
      let walletPayments: Payment[] = [];
      if (txnRes.success && txnRes.data) {
        const txns = (txnRes.data as any)?.data || (Array.isArray(txnRes.data) ? txnRes.data : []);
        
        // Filter: only show virtual wallet transactions (B-Coins)
        // Excludes direct external payments like Razorpay (card) or manual cash entries.
        walletPayments = txns
          .filter((t: Transaction) => t.paymentMode === "wallet")
          .map((t: Transaction) => {
            const isCredit = t.type === "credit";
            let desc = t.note || (isCredit ? "B-Coins Received" : "B-Coins Spent");
            
            if (t.relatedUser) {
              const name = t.relatedUser.userDetails?.firstName 
                ? `${t.relatedUser.userDetails.firstName} ${t.relatedUser.userDetails.lastName || ""}`.trim()
                : t.relatedUser.username;
              
              if (t.category === "transfer") {
                desc = isCredit ? `Received from ${name}` : `Sent to ${name}`;
              } else {
                // For fees or other types with related user
                desc = `${t.note || (isCredit ? "Received" : "Paid")} - ${name}`;
              }
              
              if (t.note && t.category === "transfer") desc = `${desc} (${t.note})`;
            }

            return {
              id: String(t.id),
              type: "wallet" as const,
              amount: isCredit ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount)),
              status: mapTransactionStatus(t.status),
              description: desc,
              createdAt: t.transactionDate,
              relatedUser: t.relatedUser,
            };
          });
      }

      setPayments(walletPayments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      console.error("Payment history error:", err);
      setError("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    if (searchQuery && !payment.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !payment.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && payment.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Cancelled</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalSpent = filteredPayments
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);
  
  const totalReceived = filteredPayments
    .filter(p => p.amount > 0)
    .reduce((sum, p) => sum + p.amount, 0);
  


  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <DashboardContent>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">B-Coins History</h1>
              <p className="text-sm text-muted-foreground">View your virtual wallet transactions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-xl font-bold text-green-600">{totalReceived} B-Coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ArrowDownLeft className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-destructive">{totalSpent} B-Coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-xl font-bold text-foreground">{filteredPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg">All Payments</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-full sm:w-50"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32.5 h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 w-full p-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payment history found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className={
                          payment.amount > 0 
                              ? "bg-green-500/10 text-green-600"
                              : "bg-destructive/10 text-destructive"
                        }>
                          {payment.amount > 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate max-w-50">
                          {payment.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(payment.createdAt)}
                          <span className="mx-1">•</span>
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            Wallet
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${payment.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                          {payment.amount > 0 ? "+" : "-"}{Math.abs(payment.amount)} B-Coins
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Drawer open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)} direction="right">
          <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
            <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
              <DrawerHeader className="border-b border-border/60 p-6 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <DrawerTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      Transaction Details
                    </DrawerTitle>
                    <DrawerDescription>
                      {selectedPayment && formatDate(selectedPayment.createdAt)}
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    selectedPayment?.status === "completed" 
                      ? "bg-green-500/10"
                      : selectedPayment?.status === "pending"
                        ? "bg-yellow-500/10"
                        : "bg-red-500/10"
                  }`}>
                    {selectedPayment?.status === "completed" ? (
                      <TrendingUp className="w-10 h-10 text-green-600" />
                    ) : selectedPayment?.status === "pending" ? (
                      <Calendar className="w-10 h-10 text-yellow-600" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <div className="text-center mt-4">
                    <p className={`text-3xl font-black ${
                      selectedPayment && selectedPayment.amount > 0 ? "text-green-600" : "text-destructive"
                    }`}>
                      {selectedPayment && selectedPayment.amount > 0 ? "+" : "-"}{selectedPayment && Math.abs(selectedPayment.amount)} B-Coins
                    </p>
                    <div className="mt-2">{selectedPayment && getStatusBadge(selectedPayment.status)}</div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-5 space-y-4 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Receipt className="w-3.5 h-3.5" />
                      Reference ID
                    </span>
                    <span className="font-bold text-foreground font-mono text-xs">{selectedPayment?.id}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Timestamp
                    </span>
                    <span className="font-bold text-sm text-foreground">{selectedPayment && formatShortDate(selectedPayment.createdAt)}</span>
                  </div>

                  {selectedPayment?.relatedUser && (
                    <div className="flex justify-between items-center pt-2 border-t border-border/40">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" />
                        {selectedPayment.amount > 0 ? "Sender" : "Recipient"}
                      </span>
                      <span className="font-bold text-sm text-foreground">
                        {selectedPayment.relatedUser.userDetails?.firstName 
                          ? `${selectedPayment.relatedUser.userDetails.firstName} ${selectedPayment.relatedUser.userDetails.lastName || ""}`
                          : selectedPayment.relatedUser.username}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5" />
                      Payment Method
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      B-Coins Wallet
                    </span>
                  </div>
                </div>
              </div>


            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </DashboardContent>
  );
}

