import { PaymentDetails, Payment } from "../types";

export const mockMarketOrders: PaymentDetails[] = [
  {
    id: "ORD-001",
    date: "2026-03-07",
    status: "completed",
    total: 330,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-001",
    items: [
      { name: "Wireless Earbuds", quantity: 1, price: 250, image: "🎧" },
      { name: "Notebook Set (5 Pack)", quantity: 1, price: 80, image: "📓" },
    ],
  },
  {
    id: "ORD-002",
    date: "2026-03-05",
    status: "completed",
    total: 45,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-002",
    items: [{ name: "Water Bottle (1L)", quantity: 1, price: 45, image: "🍶" }],
  },
  {
    id: "ORD-003",
    date: "2026-03-04",
    status: "pending",
    total: 350,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-003",
    items: [{ name: "Campus Hoodie", quantity: 1, price: 350, image: "🧥" }],
  },
  {
    id: "ORD-004",
    date: "2026-02-28",
    status: "cancelled",
    total: 200,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-004",
    items: [{ name: "Graphing Calculator", quantity: 1, price: 200, image: "🔢" }],
  },
];

export const mockWalletPayments: Payment[] = [
  {
    id: "TXN-001",
    type: "wallet",
    amount: 500,
    status: "completed",
    description: "Wallet Top-up via Bank Transfer",
    createdAt: "2026-03-10T10:30:00Z",
  },
  {
    id: "TXN-002",
    type: "wallet",
    amount: -150,
    status: "completed",
    description: "Sent to @john_doe",
    createdAt: "2026-03-09T14:22:00Z",
  },
  {
    id: "TXN-003",
    type: "wallet",
    amount: 200,
    status: "completed",
    description: "Received from @jane_smith",
    createdAt: "2026-03-08T09:15:00Z",
  },
  {
    id: "TXN-004",
    type: "wallet",
    amount: -75,
    status: "completed",
    description: "Service Fee",
    createdAt: "2026-03-07T16:45:00Z",
  },
  {
    id: "TXN-005",
    type: "wallet",
    amount: 1000,
    status: "completed",
    description: "Wallet Top-up via Credit Card",
    createdAt: "2026-03-06T11:00:00Z",
  },
];
