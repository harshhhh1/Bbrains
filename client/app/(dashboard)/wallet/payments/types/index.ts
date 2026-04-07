import { Transaction } from "@/services/api/client";

export interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface PaymentDetails {
  id: string;
  date: string;
  status: "completed" | "pending" | "cancelled" | "failed";
  total: number;
  items?: PaymentItem[];
  paymentMethod?: string;
  transactionId?: string;
}

export interface Payment {
  id: string;
  type: "wallet" | "market";
  amount: number;
  status: "completed" | "pending" | "cancelled" | "failed";
  description: string;
  createdAt: string;
  details?: PaymentDetails;
}
