"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { dashboardApi, feeApi, transactionApi } from "@/services/api/client";

export function useStudentTransactions() {
  const [student, setStudent] = useState<any>(null);
  const [feeDetails, setFeeDetails] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [verifiedTransaction, setVerifiedTransaction] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [failedPaymentError, setFailedPaymentError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        const { totalFee, totalPaid, remainingAmount, student: studentData } = feeResponse.data;

        // Calculate academic year and course name from the first enrollment
        const firstEnrollment = studentData?.enrollments?.[0];
        let academicYear = "N/A";
        let courseName = "Unassigned";

        if (firstEnrollment?.course) {
          const course = firstEnrollment.course;
          courseName = course.name;
          const startYear = new Date(course.createdAt).getFullYear();
          let durationYears = 0;
          if (course.durationUnit === "years") {
            durationYears = course.durationValue;
          } else if (course.durationUnit === "months") {
            durationYears = Math.ceil(course.durationValue / 12);
          }
          academicYear = `${startYear} - ${startYear + (durationYears || 0)}`;
        }

        const actualFeeDetails = {
          studentId: studentData.id,
          studentName: `${studentData.userDetails?.firstName} ${studentData.userDetails?.lastName}`,
          totalFee: Number(totalFee || 0),
          totalPaid: Number(totalPaid || 0),
          amount: Number(remainingAmount || 0),
          courseName,
          academicYear,
          description: "College Tuition Fee",
          dueDate: "2026-06-30",
        };
        setFeeDetails(actualFeeDetails);
        setAmount(actualFeeDetails.amount);
      }

      const txRes = await transactionApi.getMyTransactions({
        limit: 50,
        category: "fee",
        type: "debit",
      });
      if (txRes.success) {
        setTransactions(txRes.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse: any, selectedAmount: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          feeDetails: {
            studentId: feeDetails.studentId,
            amount: selectedAmount,
            description: feeDetails.description,
          },
        }),
      });

      const verifyData = await res.json();
      if (verifyData.success) {
        toast.success("Payment successful!");
        setPaymentId(paymentResponse.razorpay_payment_id);
        setVerifiedTransaction(verifyData.data);
        await loadData();
      } else {
        throw new Error(verifyData.message);
      }
    } catch (error: any) {
      toast.error("Verification failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpayPayment = async () => {
    if (!feeDetails || amount <= 0) return;

    try {
      setIsPaying(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`
        },
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
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const options = {
        key: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim(),
        amount: data.data.amount,
        currency: data.data.currency,
        name: "College Fee Payment",
        description: feeDetails.description,
        order_id: data.data.orderId,
        handler: (res: any) => verifyPayment(res, amount),
        prefill: {
          name: feeDetails.studentName,
          email: student.email || "",
          contact: student.userDetails?.phone || "",
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        setFailedPaymentError(response.error?.description || "Payment failed");
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/razorpay/record-failure`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            },
            body: JSON.stringify({
              amount,
              studentId: feeDetails.studentId,
              errorDescription: response.error?.description,
              errorCode: response.error?.code,
              paymentId: response.error?.metadata?.payment_id,
            }),
          });
        } catch (logError) {
          console.error("Failed to log payment failure:", logError);
        }

        toast.error(`Payment failed: ${response.error?.description || "Unknown error"}`);
        rzp.close();
      });
      rzp.open();
    } catch (error: any) {
      toast.error("Payment failed to initialize: " + error.message);
    } finally {
      setIsPaying(false);
    }
  };

  return {
    student,
    feeDetails,
    transactions,
    loading,
    paymentId,
    setPaymentId,
    amount,
    setAmount,
    verifiedTransaction,
    setVerifiedTransaction,
    isPaying,
    failedPaymentError,
    setFailedPaymentError,
    initializeRazorpayPayment,
    loadData
  };
}
