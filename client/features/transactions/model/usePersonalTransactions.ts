"use client"

import { useMemo, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api, dashboardApi, transactionApi, type Transaction, type User, type DuesData } from "@/services/api/client"
import { resolvePersonalTransactionKind, type PersonalTransactionKind } from "@/features/transactions/model/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
}

export function usePersonalTransactions() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [duesData, setDuesData] = useState<DuesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [payAmount, setPayAmount] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const activeView: PersonalTransactionKind | null = resolvePersonalTransactionKind(currentUser)

  const refreshTransactions = useCallback(async (view: PersonalTransactionKind) => {
    const res = await transactionApi.getMyTransactions({
      limit: 200,
      category: view === "fees" ? "fee" : "salary",
      type: view === "fees" ? "debit" : "credit",
    })
    if (res.success) setTransactions(res.data || [])
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const userRes = await dashboardApi.getUser()
        if (!mounted) return
        if (!userRes.success || !userRes.data) {
          toast.error(userRes.message || "Failed to load your profile")
          return
        }
        const nextUser = userRes.data
        setCurrentUser(nextUser)

        const nextView = resolvePersonalTransactionKind(nextUser)
        if (!nextView) { router.replace("/dashboard"); return }

        const txRes = await transactionApi.getMyTransactions({
          limit: 200,
          category: nextView === "fees" ? "fee" : "salary",
          type: nextView === "fees" ? "debit" : "credit",
        })
        if (!mounted) return
        if (txRes.success) setTransactions(txRes.data || [])
        else toast.error(txRes.message || "Failed to load your transactions")

        if (nextUser.type === "student") {
          const duesRes = await transactionApi.getDues()
          if (duesRes.success) setDuesData(duesRes.data || null)
        }
      } catch (e) {
        console.error(e)
        if (mounted) toast.error("Failed to load your transactions")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  const personalTransactions = useMemo(() => {
    if (activeView === "fees") return transactions.filter(t => t.category === "fee" && t.type === "debit")
    if (activeView === "salary") return transactions.filter(t => t.category === "salary" && t.type === "credit")
    return []
  }, [activeView, transactions])

  const totalAmount = personalTransactions.reduce((sum, t) => {
    if (t.status === "failed") return sum
    return sum + Number(t.amount || 0)
  }, 0)

  const recordPaymentFailure = useCallback(async (response: any, amount: number) => {
    try {
      const res = await api.post("/razorpay/record-failure", {
        amount,
        studentId: currentUser?.id,
        errorDescription: response.error?.description || "Payment failed",
        errorCode: response.error?.code || null,
        paymentId: response.error?.metadata?.payment_id || null,
      })
      if (res.success && activeView) await refreshTransactions(activeView)
    } catch (e) {
      console.error("Error recording payment failure:", e)
    }
  }, [currentUser?.id, activeView, refreshTransactions])

  const verifyPayment = useCallback(async (paymentResponse: any, amount: number) => {
    try {
      setIsPaying(true)
      const res = await fetch(`${API_BASE}/razorpay/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          feeDetails: { studentId: currentUser?.id, amount, description: "Course Fee Payment" },
        }),
        credentials: "include",
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || "Payment verification failed")
      toast.success("Fee payment successful!")
      setPayDialogOpen(false)
      setPayAmount("")
      window.location.reload()
    } catch (e) {
      console.error("Error verifying payment:", e)
      toast.error("Payment verification failed: " + (e as Error).message)
    } finally {
      setIsPaying(false)
    }
  }, [currentUser?.id])

  const initializeRazorpayPayment = useCallback(async () => {
    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK is loading, please try again in a moment")
      return
    }
    const amount = Number(payAmount)
    if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid amount"); return }
    if (duesData && amount > duesData.dues) {
      toast.error(`Amount exceeds remaining dues`)
      return
    }
    try {
      setIsPaying(true)
      const res = await fetch(`${API_BASE}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          amount, currency: "INR",
          receipt: `fee_${currentUser?.id}_${Date.now()}`,
          notes: {
            studentId: currentUser?.id,
            studentName: `${currentUser?.userDetails?.firstName} ${currentUser?.userDetails?.lastName}`,
            feeDescription: "Course Fee Payment",
          },
        }),
        credentials: "include",
      })
      const data = await res.json()
      if (!data.success || !data.data) throw new Error(data.message || "Failed to create payment order")

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.data.amount,
        currency: data.data.currency,
        name: "Bbrains Fee Payment",
        description: "Course Fee Payment",
        order_id: data.data.orderId,
        handler: async (response: any) => { await verifyPayment(response, amount) },
        prefill: {
          name: `${currentUser?.userDetails?.firstName} ${currentUser?.userDetails?.lastName}`,
          email: currentUser?.email || "",
          contact: currentUser?.userDetails?.phone || "",
        },
        theme: { color: "#7c3aed" },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", async (response: any) => {
        console.error("Payment failed:", response)
        const errorMsg = response.error?.description || response.error?.reason || "Unknown error"
        toast.error(`Payment failed: ${errorMsg}`)
        await recordPaymentFailure(response, amount)
        rzp.close()
      })
      rzp.open()
    } catch (e) {
      console.error("Error initializing Razorpay payment:", e)
      toast.error("Failed to initialize payment: " + (e as Error).message)
    } finally {
      setIsPaying(false)
    }
  }, [payAmount, duesData, currentUser, verifyPayment, recordPaymentFailure])

  return {
    currentUser,
    transactions,
    personalTransactions,
    duesData,
    loading,
    activeView,
    totalAmount,
    payAmount,
    setPayAmount,
    isPaying,
    payDialogOpen,
    setPayDialogOpen,
    initializeRazorpayPayment,
  }
}
