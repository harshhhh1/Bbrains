"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { ArrowLeftRight, BadgeIndianRupee, Loader2, ReceiptText, Calendar, Hash, Tag, FileDown, Wallet, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { dashboardApi, transactionApi, type Transaction, type User, type DuesData } from "@/services/api/client"
import { cn } from "@/lib/utils"

type PersonalTransactionKind = "fees" | "salary"

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function formatDate(value: string) {
  if (!value) return "Not set"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not set"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatCategory(value?: string | null) {
  if (!value) return "Other"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function hasManagerRole(user: Pick<User, "roles"> | null | undefined) {
  return Boolean(
    user?.roles?.some((entry) =>
      entry?.role?.name?.toLowerCase().includes("manager")
    )
  )
}

function resolvePersonalTransactionKind(user: User | null): PersonalTransactionKind | null {
  if (!user) return null
  if (user.type === "student") return "fees"
  if (user.type === "teacher" || user.type === "staff" || hasManagerRole(user)) return "salary"
  return null
}

function getViewCopy(view: PersonalTransactionKind | null) {
  if (view === "fees") {
    return {
      title: "Fees Paid",
      subtitle: "Your own fee payment history with payment details, references, and recording information.",
      empty: "No fee payment transactions found.",
    }
  }

  if (view === "salary") {
    return {
      title: "Salary Received",
      subtitle: "Your own salary receipt history with payment details, references, and recording information.",
      empty: "No salary receipt transactions found.",
    }
  }

  return {
    title: "My Transactions",
    subtitle: "Only your own personal fee or salary transactions are shown here.",
    empty: "No personal fee or salary transactions found.",
  }
}

export function PersonalTransactions() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [duesData, setDuesData] = useState<DuesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [payAmount, setPayAmount] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const activeView = resolvePersonalTransactionKind(currentUser)
  const copy = getViewCopy(activeView)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const userResponse = await dashboardApi.getUser()

        if (!mounted) return

        if (!userResponse.success || !userResponse.data) {
          toast.error(userResponse.message || "Failed to load your profile")
          return
        }

        const nextUser = userResponse.data
        setCurrentUser(nextUser)

        const nextView = resolvePersonalTransactionKind(nextUser)
        if (!nextView) {
          router.replace("/dashboard")
          return
        }

        const response = await transactionApi.getMyTransactions({
          limit: 200,
          status: "success",
          category: nextView === "fees" ? "fee" : "salary",
          type: nextView === "fees" ? "debit" : "credit",
        })
        if (!mounted) return

        if (response.success) {
          setTransactions(response.data || [])
        } else {
          toast.error(response.message || "Failed to load your transactions")
        }

        // Fetch dues if student
        if (nextUser.type === "student") {
          const duesResponse = await transactionApi.getDues()
          if (duesResponse.success) {
            setDuesData(duesResponse.data || null)
          }
        }
      } catch (error) {
        console.error(error)
        if (mounted) toast.error("Failed to load your transactions")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  const personalTransactions = useMemo(() => {
    if (activeView === "fees") {
      return transactions.filter(t => t.category === "fee" && t.type === "debit")
    }

    if (activeView === "salary") {
      return transactions.filter(t => t.category === "salary" && t.type === "credit")
    }

    return []
  }, [activeView, transactions])

  const totalAmount = personalTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-10 animate-spin text-brand-purple" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading transactions...
        </p>
      </div>
    )
  }

  const initializeRazorpayPayment = async () => {
    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK is loading, please try again in a moment");
      return;
    }
    const amount = Number(payAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (duesData && amount > duesData.dues) {
      toast.error(`Amount exceeds remaining dues (${formatCurrency(duesData.dues)})`)
      return
    }

    try {
      setIsPaying(true)
      // Create Razorpay order via our backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `fee_${currentUser?.id}_${Date.now()}`,
          notes: {
            studentId: currentUser?.id,
            studentName: currentUser?.userDetails?.firstName + " " + currentUser?.userDetails?.lastName,
            feeDescription: "Course Fee Payment"
          },
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to create payment order");
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.data.amount,
        currency: data.data.currency,
        name: "Bbrains Fee Payment",
        description: "Course Fee Payment",
        order_id: data.data.orderId,
        handler: async function (response: any) {
          await verifyPayment(response, amount);
        },
        prefill: {
          name: currentUser?.userDetails?.firstName + " " + currentUser?.userDetails?.lastName,
          email: currentUser?.email || "",
          contact: currentUser?.userDetails?.phone || "",
        },
        theme: {
          color: "#7c3aed", // Brand purple
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", async function (response: any) {
        console.error("Payment failed full response:", response);
        const errorMsg = response.error ? (response.error.description || response.error.reason || "Unknown error") : "Payment failed";
        toast.error(`Payment failed: ${errorMsg}`);
        
        // Record failure in backend
        await recordPaymentFailure(response, amount);
      });

      rzp.open();
    } catch (error) {
      console.error("Error initializing Razorpay payment:", error);
      toast.error("Failed to initialize payment: " + (error as Error).message);
    } finally {
      setIsPaying(false)
    }
  }

  const verifyPayment = async (paymentResponse: any, amount: number) => {
    try {
      setIsPaying(true);
      // Verify payment with our backend
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          feeDetails: {
            studentId: currentUser?.id,
            amount,
            description: "Course Fee Payment",
          },
        }),
        credentials: "include",
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      // Payment successful
      toast.success("Fee payment successful!");
      setPayDialogOpen(false);
      setPayAmount("");
      
      // Refresh to show new transaction
      window.location.reload();
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Payment verification failed: " + (error as Error).message);
    } finally {
      setIsPaying(false);
    }
  };

  const recordPaymentFailure = async (response: any, amount: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/record-failure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          amount,
          studentId: currentUser?.id,
          errorDescription: response.error?.description,
          errorCode: response.error?.code,
          paymentId: response.error?.metadata?.payment_id
        }),
        credentials: "include",
      });
      
      // Refresh to show the failed attempt in history
      window.location.reload();
    } catch (error) {
      console.error("Error recording payment failure:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <SectionHeader title={copy.title} subtitle={copy.subtitle} />

      {currentUser?.type === "student" && duesData && duesData.totalCourseFee > 0 && (
        <Card className="border-none bg-gradient-to-br from-brand-purple/90 to-brand-purple shadow-xl text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="size-32 rotate-12" />
           </div>
           <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Course Dues Summary</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-black">{formatCurrency(duesData.dues)}</h2>
                      <span className="text-sm font-medium text-white/80">remaining out of {formatCurrency(duesData.totalCourseFee)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {duesData.courses.map(c => (
                        <Badge key={c.id} className="bg-white/20 hover:bg-white/30 border-none text-white text-[10px] font-bold">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                 </div>

                 <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                    <DialogTrigger asChild>
                       <Button className="bg-white text-brand-purple hover:bg-white/90 font-black uppercase tracking-widest px-8 h-12 rounded-2xl shadow-lg border-none">
                          Pay Dues <ArrowRight className="ml-2 size-4" />
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-none">
                       <DialogHeader>
                          <DialogTitle className="text-2xl font-black">Record Fee Payment</DialogTitle>
                          <DialogDescription className="font-medium text-muted-foreground">
                             Enter the amount you wish to pay towards your course fees.
                          </DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-6 py-6">
                          <div className="space-y-2">
                             <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest">Amount to Pay (INR)</Label>
                             <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                                <Input
                                   id="amount"
                                   type="number"
                                   placeholder="0.00"
                                   className="pl-8 h-14 rounded-2xl border-2 focus:border-brand-purple focus:ring-0 text-lg font-bold"
                                   value={payAmount}
                                   onChange={(e) => setPayAmount(e.target.value)}
                                />
                             </div>
                             <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 px-1">
                                <CheckCircle2 className="size-3 text-emerald-500" /> Maximum payable: {formatCurrency(duesData.dues)}
                             </p>
                          </div>
                       </div>
                       <DialogFooter>
                          <Button 
                             onClick={initializeRazorpayPayment} 
                             disabled={isPaying || !payAmount}
                             className="w-full h-14 rounded-2xl bg-brand-purple hover:bg-brand-purple/90 text-white font-black uppercase tracking-widest text-base shadow-xl"
                          >
                             {isPaying ? <Loader2 className="animate-spin mr-2" /> : null}
                             Pay with Razorpay
                          </Button>
                       </DialogFooter>
                    </DialogContent>
                 </Dialog>
              </div>
           </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm overflow-hidden bg-brand-orange/5 border-l-4 border-l-brand-orange">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-orange/70">Transactions</p>
            <p className="mt-2 text-3xl font-black text-foreground">{personalTransactions.length}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Only your own {activeView === "fees" ? "fee payments" : "salary receipts"} are shown here.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm overflow-hidden bg-brand-purple/5 border-l-4 border-l-brand-purple">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-purple/70">Total Amount</p>
            <p className="mt-2 text-3xl font-black text-foreground">{formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Combined amount for all successful records.</p>
          </CardContent>
        </Card>
      </div>

      {personalTransactions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalTransactions.map((transaction) => (
            <Card key={String(transaction.id)} className="group relative border-border/40 hover:border-brand-purple/30 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "p-2 rounded-xl", 
                                transaction.status === 'failed' ? "bg-red-100 text-red-600" :
                                transaction.category === 'fee' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                            )}>
                                {transaction.status === 'failed' ? <XCircle className="size-4" /> : 
                                 transaction.category === "fee" ? <ReceiptText className="size-4" /> : <BadgeIndianRupee className="size-4" />}
                            </div>
                            <span className="font-bold text-sm">{formatCategory(transaction.category)}</span>
                        </div>
                        <Badge 
                            variant={transaction.status === 'success' ? 'outline' : 'destructive'} 
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-wider", 
                                transaction.status === 'success' ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "bg-red-50 text-red-600 border-red-200"
                            )}
                        >
                            {transaction.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-4">
                    <div>
                        <p className="text-2xl font-black text-foreground">{formatCurrency(transaction.amount)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{transaction.type === 'debit' ? 'Sent' : 'Received'}</p>
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
                            <span className="text-xs font-bold uppercase">{transaction.paymentMode || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                <Hash className="size-3" /> Reference
                            </span>
                            <span className="text-xs font-medium truncate font-mono text-muted-foreground">{transaction.referenceId || 'No reference'}</span>
                        </div>
                    </div>

                    {transaction.category === 'fee' && (
                        <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-2 h-9">
                                <FileDown className="mr-2 size-3.5" /> Download Receipt
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-border/50 bg-muted/10 rounded-[2rem] py-20">
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
            <ArrowLeftRight className="size-12 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">{copy.empty}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Transactions will appear here once records are added to your account.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
