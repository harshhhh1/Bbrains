"use client";

import React, { useEffect, useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  History, 
  X, 
  Loader2,
  TrendingDown,
  TrendingUp,
  Landmark
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { transactionApi, type User as ApiUser, type Transaction, type DuesData } from "@/services/api/client";
import { toast } from "sonner";

interface UserDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApiUser | null;
}

export function UserDetailsDrawer({ open, onOpenChange, user }: UserDetailsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dues, setDues] = useState<DuesData | null>(null);

  useEffect(() => {
    if (open && user) {
      loadUserData();
    }
  }, [open, user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [transRes, duesRes] = await Promise.all([
        transactionApi.getUserTransactions(user.id, { limit: 10 }),
        transactionApi.getUserDues(user.id)
      ]);

      if (transRes.success) setTransactions(transRes.data || []);
      if (duesRes.success) setDues(duesRes.data || null);
    } catch (error) {
      console.error("Failed to load user financial data", error);
      toast.error("Could not load payment history");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-bold">
                    {user?.userDetails?.firstName} {user?.userDetails?.lastName}
                  </DrawerTitle>
                  <DrawerDescription>
                    @{user?.username} • {user?.type}
                  </DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Quick Stats / Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</p>
                <p className="mt-1 truncate text-xs font-medium">{user?.email}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</p>
                <p className="mt-1 text-xs font-medium">{user?.userDetails?.phone || "—"}</p>
              </div>
            </div>

            {/* Fee Summary Card */}
            <Card className="border-primary/20 bg-primary/5 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                  <Landmark className="h-4 w-4" />
                  Fee Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex py-4 justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary/50" /></div>
                ) : dues ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Total Fees</p>
                        <p className="text-sm font-bold">{formatCurrency(dues.totalCourseFee)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Paid</p>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(dues.paidAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Balance</p>
                        <p className="text-sm font-bold text-red-600">{formatCurrency(dues.dues)}</p>
                      </div>
                    </div>
                    
                    {dues.courses && dues.courses.length > 0 && (
                      <div className="mt-2 rounded-lg bg-background/50 p-2 text-[11px]">
                        <p className="mb-1 font-bold text-muted-foreground uppercase">Enrolled Courses</p>
                        {dues.courses.map(c => (
                          <div key={c.id} className="flex justify-between py-0.5">
                            <span>{c.name}</span>
                            <span className="font-medium">{formatCurrency(c.fee)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No fee configuration found for this user.</p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground">
                <History className="h-4 w-4" />
                Payment History
              </h3>
              
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                  <CreditCard className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((t) => (
                    <div 
                      key={t.id} 
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {t.type === 'credit' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold capitalize">{t.category?.replace('_', ' ')}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(t.transactionDate)} • {t.paymentMode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${
                          t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{t.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border/60 bg-muted/10 p-6">
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Close Details
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
