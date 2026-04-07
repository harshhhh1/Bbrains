"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardContent } from "@/components/dashboard-content";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Building2 } from "lucide-react";

import { usePaymentHistory } from "./hooks/usePaymentHistory";
import { PaymentFilters, PaymentList, PaymentDetailsDialog } from "./components";

export default function PaymentHistoryPage() {
  const {
    payments,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedPayment,
    setSelectedPayment,
    filteredPayments,
    totalSpent,
    totalReceived,
    formatCurrency,
  } = usePaymentHistory();

  return (
    <DashboardContent className="max-w-[1400px]">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
              Payment History
            </h1>
            <p className="text-muted-foreground font-medium mt-2">
              Track your B-Coins transactions and marketplace orders.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-brand-mint/5 overflow-hidden relative group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-brand-mint/10 rounded-full blur-3xl group-hover:bg-brand-mint/20 transition-all duration-500" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-brand-mint" /> Total Received
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-4xl font-black text-foreground">
                  +{formatCurrency(totalReceived)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-destructive/5 overflow-hidden relative group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl group-hover:bg-destructive/20 transition-all duration-500" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-destructive" /> Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-4xl font-black text-foreground">
                  -{formatCurrency(totalSpent)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden relative group md:col-span-1">
            <div className="absolute right-0 top-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all duration-500" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-semibold text-foreground">All Time</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-semibold text-foreground">{filteredPayments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">All Payments</CardTitle>
              <PaymentFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading transactions...</p>
              </div>
            ) : (
              <PaymentList
                filteredPayments={filteredPayments}
                setSelectedPayment={setSelectedPayment}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <PaymentDetailsDialog
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
      />
    </DashboardContent>
  );
}
