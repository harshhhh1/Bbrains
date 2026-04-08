"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dashboardApi, feeApi } from "@/services/api/client";

export default function FeesPage() {
  const [student, setStudent] = useState<any>(null);
  const [feeDetails, setFeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);

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

      const userData = userResponse.data;
      setStudent(userData);
      
      // Fetch actual fee details from backend
      const feeResponse = await feeApi.getSummary();
      
      if (!feeResponse.success || !feeResponse.data) {
        toast.error(feeResponse.message || "Failed to load fee details");
        return;
      }
      
      const feeData = feeResponse.data;
      
      const actualFeeDetails = {
        studentId: userData.id,
        studentName: `${userData.userDetails?.firstName} ${userData.userDetails?.lastName}`,
        amount: feeData.remainingAmount || 0,
        description: "College Tuition Fee",
        dueDate: "2026-06-30",
      };
      
      setFeeDetails(actualFeeDetails);
      setAmount(actualFeeDetails.amount);
    } catch (error) {
      console.error("Error loading student data:", error);
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpayPayment = async () => {
    if (!feeDetails || amount <= 0) {
      toast.error("Invalid fee details");
      return;
    }

    try {
      // Create Razorpay order via our backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `fee_${feeDetails.studentId}_${Date.now()}`,
          notes: {
            studentId: feeDetails.studentId,
            studentName: feeDetails.studentName,
            feeDescription: feeDetails.description,
            dueDate: feeDetails.dueDate,
          },
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to create payment order");
      }

      // Store order ID for verification
      setRazorpayOrderId(data.data.orderId);
      
      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.data.amount,
        currency: data.data.currency,
        name: "College Fee Payment",
        description: feeDetails.description,
        order_id: data.data.orderId,
        handler: async function (response: any) {
          await verifyPayment(response);
        },
        prefill: {
          name: feeDetails.studentName,
          email: student.email || "",
          contact: student.userDetails?.phone || "",
        },
        theme: {
          color: "#0f172a", // Default dark theme color matching UI
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error("Error initializing Razorpay payment:", error);
      toast.error("Failed to initialize payment: " + (error as Error).message);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      setLoading(true);
      // Verify payment with our backend
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      // Payment successful
      toast.success("Fee payment successful!");
      setPaymentId(paymentResponse.razorpay_payment_id);
      
      // Refresh student data to show updated fee status
      loadStudentData();
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Payment verification failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">College Fee Payment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and pay your college fees securely online
          </p>
        </div>
      </div>

      {feeDetails ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Fee Details</CardTitle>
            <CardDescription>
              Information about your outstanding college fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="student-name">Student Name</Label>
                <Input
                  id="student-name"
                  defaultValue={`${student.userDetails?.firstName} ${student.userDetails?.lastName}`}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  defaultValue={student.id}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="fee-description">Fee Description</Label>
                <Input
                  id="fee-description"
                  defaultValue={feeDetails.description}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  defaultValue={feeDetails.dueDate}
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="amount">Amount Due</Label>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    INR
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    defaultValue={feeDetails.amount.toString()}
                    readOnly
                    className="text-3xl font-bold"
                  />
                </div>
                {paymentId && (
                  <p className="mt-2 text-sm text-success">
                    Payment ID: {paymentId}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground py-8">Loading fee details...</p>
      )}

      {feeDetails && !paymentId ? (
        <div className="space-y-4">
          <Button 
            onClick={initializeRazorpayPayment}
            className="w-full"
            disabled={loading || amount <= 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : amount <= 0 ? (
              <>
                <span>No Dues Remaining</span>
              </>
            ) : (
              <>
                <span>Pay Now</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              // In a real app, this might open payment history or download receipt
              toast.info("Payment history feature coming soon");
            }}
          >
            View Payment History
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-success font-semibold">
            Fee payment completed successfully!
          </p>
          {paymentId && (
            <p className="mt-2 text-sm text-muted-foreground">
              Transaction ID: {paymentId}
            </p>
          )}
          <Button 
            variant="outline"
            onClick={() => {
              // Reset for another payment (in real app, you might navigate away)
              setPaymentId(null);
              toast.info("Ready for another payment");
            }}
          >
            Make Another Payment
          </Button>
        </div>
      )}
    </div>
  );
}