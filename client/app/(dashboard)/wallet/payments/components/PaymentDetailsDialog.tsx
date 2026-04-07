"use client";

import React from "react";
import {
  Calendar, TrendingUp, TrendingDown, Receipt, ShoppingBag,
  Wallet, Building2, Share2, Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Payment } from "../types";
import { formatDate, getStatusColor } from "../utils";

interface PaymentDetailsDialogProps {
  selectedPayment: Payment | null;
  setSelectedPayment: (payment: Payment | null) => void;
}

export function PaymentDetailsDialog({
  selectedPayment,
  setSelectedPayment,
}: PaymentDetailsDialogProps) {
  if (!selectedPayment) return null;

  return (
    <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            ID: {selectedPayment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center py-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              selectedPayment.status === "completed"
                ? "bg-brand-mint/10"
                : selectedPayment.status === "pending"
                  ? "bg-brand-yellow/10"
                  : "bg-destructive/10"
            }`}>
              {selectedPayment.status === "completed" ? (
                <TrendingUp className="w-10 h-10 text-brand-mint" />
              ) : selectedPayment.status === "pending" ? (
                <Calendar className="w-10 h-10 text-brand-yellow" />
              ) : (
                <TrendingDown className="w-10 h-10 text-destructive" />
              )}
            </div>
          </div>

          <div className="text-center mb-4">
            <p className={`text-3xl font-bold ${
              selectedPayment.amount > 0 ? "text-brand-mint" : "text-destructive"
            }`}>
              {selectedPayment.amount > 0 ? "+" : ""}{selectedPayment.amount} B-Coins
            </p>
            <div className="mt-2">
              <Badge className={getStatusColor(selectedPayment.status)}>
                {selectedPayment.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                ID
              </span>
              <span className="font-medium text-foreground font-mono text-sm">{selectedPayment.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </span>
              <span className="font-medium text-foreground">
                {formatDate(selectedPayment.createdAt)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                {selectedPayment.type === "wallet" ? <Wallet className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                Type
              </span>
              <span className="font-medium text-foreground capitalize">
                {selectedPayment.type}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium text-foreground mb-2">Description</p>
            <p className="text-sm text-muted-foreground">{selectedPayment.description}</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1 font-bold" onClick={() => {}}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="default" className="flex-1 font-bold bg-brand-orange text-white hover:bg-brand-orange/90" onClick={() => {}}>
              <Download className="w-4 h-4 mr-2" /> Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
