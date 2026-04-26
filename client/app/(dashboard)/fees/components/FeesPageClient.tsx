/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { dashboardApi, feeApi } from "@/services/api/client";
import { DashboardContent } from "@/components/dashboard-content";
import { FeeSummaryCard } from "../_components/FeeSummaryCard";
import { PaymentSuccessState } from "../_components/PaymentSuccessState";

export default function FeesPage() {
  const [student, setStudent] = useState<any>(null);
  const [feeDetails, setFeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const userResponse = await dashboardApi.getUser();
      if (!userResponse.success || !userResponse.data) {
        toast.error(userResponse.message || "Failed to load profile");
        return;
      }

      setStudent(userResponse.data);
      const feeResponse = await feeApi.getSummary();
      
      if (feeResponse.success && feeResponse.data) {
        const actualFeeDetails = {
          studentId: userResponse.data.id,
          studentName: `${userResponse.data.userDetails?.firstName} ${userResponse.data.userDetails?.lastName}`,
          amount: feeResponse.data.remainingAmount || 0,
          description: "College Tuition Fee",
          dueDate: "2026-06-30",
        };
        setFeeDetails(actualFeeDetails);
        setAmount(actualFeeDetails.amount);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpayPayment = async () => {
    if (!feeDetails || amount <= 0) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `fee_${feeDetails.studentId}_${Date.now()}`,
          notes: {
            studentId: feeDetails.studentId,
            studentName: feeDetails.studentName,
            feeDescription: feeDetails.description,
          },
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.data.amount,
        currency: data.data.currency,
        name: "College Fee Payment",
        description: feeDetails.description,
        order_id: data.data.orderId,
        handler: (res: any) => verifyPayment(res),
        prefill: {
          name: feeDetails.studentName,
          email: student.email || "",
          contact: student.userDetails?.phone || "",
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error("Payment failed to initialize");
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          feeDetails: {
            studentId: feeDetails.studentId,
            amount,
            description: feeDetails.description,
          },
        }),
        credentials: "include",
      });

      const verifyData = await res.json();
      if (verifyData.success) {
        toast.success("Payment successful!");
        setPaymentId(paymentResponse.razorpay_payment_id);
        setTransaction(verifyData.data);
        await loadStudentData();
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !student) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="size-10 animate-spin text-primary/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Ledger...</p>
      </div>
    );
  }

  return (
    <DashboardContent className="mx-auto w-full max-w-5xl p-6 md:p-12 space-y-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <header>
        <h1 className="text-4xl font-black tracking-tight">Institutional Finance</h1>
        <p className="mt-2 text-muted-foreground text-lg font-medium">Manage and settle your academic tuition fees.</p>
      </header>

      {paymentId ? (
        <PaymentSuccessState
          paymentId={paymentId}
          transaction={transaction}
          student={student}
          onReset={() => { setPaymentId(null); setTransaction(null); }}
        />
      ) : (
        <div className="space-y-8">
          {feeDetails ? (
            <FeeSummaryCard 
              student={student} 
              feeDetails={feeDetails} 
              paymentId={paymentId} 
            />
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40">
              <p className="text-muted-foreground font-bold">Records unavailable</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              onClick={initializeRazorpayPayment}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              disabled={loading || amount <= 0}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize Settlement"}
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="h-14 rounded-2xl font-bold gap-2 px-8"
              onClick={() => toast.info("History accessible via Transactions module")}
            >
              <History className="h-4 w-4" />
              Audit Log
            </Button>
          </div>
        </div>
      )}
    </DashboardContent>
  );
}
