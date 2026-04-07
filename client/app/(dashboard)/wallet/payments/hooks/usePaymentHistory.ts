import { useState, useEffect, useMemo } from "react";
import { transactionApi, Transaction } from "@/services/api/client";
import { Payment } from "../types";
import { mockMarketOrders } from "../utils/mockData";

export function usePaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const txnRes = await transactionApi.getMyTransactions();

      let walletPayments: Payment[] = [];
      if (txnRes.success && txnRes.data) {
        const txns = Array.isArray(txnRes.data) ? txnRes.data : [];
        walletPayments = txns.map((t: Transaction) => ({
          id: String(t.id),
          type: "wallet" as const,
          amount: t.type === "credit" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount)),
          status: (t.status === "success" ? "completed" : t.status === "pending" ? "pending" : "failed") as any,
          description: t.note || "Wallet Transaction",
          createdAt: t.transactionDate,
        }));
      }

      const marketPayments: Payment[] = mockMarketOrders.map((order) => ({
        id: order.id,
        type: "market",
        amount: -order.total,
        status: order.status,
        description: order.items?.map(i => i.name).join(", ") || "Market Order",
        createdAt: order.date,
        details: order,
      }));

      setPayments([...walletPayments, ...marketPayments]);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const matchesSearch =
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || p.type === typeFilter;
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, searchQuery, typeFilter, statusFilter]);

  const totalSpent = useMemo(() => {
    return payments
      .filter((p) => p.status === "completed" && p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);
  }, [payments]);

  const totalReceived = useMemo(() => {
    return payments
      .filter((p) => p.status === "completed" && p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
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
  };
}
