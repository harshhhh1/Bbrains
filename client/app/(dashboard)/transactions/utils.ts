import type { Transaction, User } from "@/services/api/client"

export type PersonalTransactionKind = "fees" | "salary"

export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

export function formatDate(value: string) {
  if (!value) return "Not set"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not set"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

export function formatCategory(value?: string | null) {
  if (!value) return "Other"
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function hasManagerRole(user: Pick<User, "roles"> | null | undefined) {
  return Boolean(user?.roles?.some((e) => e?.role?.name?.toLowerCase().includes("manager")))
}

export function resolvePersonalTransactionKind(user: User | null): PersonalTransactionKind | null {
  if (!user) return null
  if (user.type === "student") return "fees"
  if (user.type === "teacher" || user.type === "staff" || hasManagerRole(user)) return "salary"
  return null
}

export function getViewCopy(view: PersonalTransactionKind | null) {
  if (view === "fees") return {
    title: "Fees Paid",
    subtitle: "Your own fee payment history with payment details, references, and recording information.",
    empty: "No fee payment transactions found.",
  }
  if (view === "salary") return {
    title: "Salary Received",
    subtitle: "Your own salary receipt history with payment details, references, and recording information.",
    empty: "No salary receipt transactions found.",
  }
  return {
    title: "My Transactions",
    subtitle: "Only your own personal fee or salary transactions are shown here.",
    empty: "No personal fee or salary transactions found.",
  }
}

export function downloadReceipt(transaction: Transaction, user: User | null) {
  const fmt = (n: number | string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0))
  const fmtDateTime = (v?: string) =>
    v ? new Intl.DateTimeFormat("en-IN", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true 
    }).format(new Date(v)) : "—"
  const fmtCat = (v?: string | null) =>
    (v || "Other").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const studentName =
    [user?.userDetails?.firstName, user?.userDetails?.lastName].filter(Boolean).join(" ") || user?.username || "—"
  const isFailed = transaction.status === "failed"

  // Extract Razorpay Order ID if present in note
  const orderIdMatch = transaction.note?.match(/Order ID: (order_[a-zA-Z0-9]+)/);
  const razorpayOrderId = orderIdMatch ? orderIdMatch[1] : null;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<title>Receipt - ${transaction.referenceId || transaction.id}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#fff;color:#1a1a2e;padding:48px}
.receipt{max-width:560px;margin:0 auto;border:2px solid #e2e8f0;border-radius:16px;overflow:hidden}
.header{background:linear-gradient(135deg,#6C5CE7 0%,#a78bfa 100%);color:#fff;padding:28px 32px}
.header h1{font-size:22px;font-weight:900;letter-spacing:-0.5px}
.header p{font-size:12px;opacity:.85;margin-top:4px}
.badge{display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-top:12px}
.ok{background:rgba(255,255,255,.25);color:#fff}
.fail{background:rgba(239,68,68,.35);color:#fff}
.body{padding:28px 32px}
.amount{font-size:36px;font-weight:900;color:#6C5CE7;letter-spacing:-1px;margin-bottom:24px}
.amount span{font-size:14px;font-weight:600;color:#64748b;display:block;margin-bottom:4px;letter-spacing:0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field{display:flex;flex-direction:column;gap:4px}
.lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8}
.val{font-size:13px;font-weight:600;color:#1a1a2e;word-break:break-all}
.divider{border:none;border-top:1px solid #e2e8f0;margin:20px 0}
.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;font-size:10px;color:#94a3b8;text-align:center}
@media print{body{padding:0}.receipt{border:none;border-radius:0}}
</style></head><body>
<div class="receipt">
  <div class="header">
    <h1>${user?.college?.name || "Bbrains"} — Payment Receipt</h1>
    <p>Official record of transaction</p>
    <div class="badge ${isFailed ? "fail" : "ok"}">${isFailed ? "✕ Payment Failed" : "✓ Payment Successful"}</div>
  </div>
  <div class="body">
    <div class="amount"><span>Amount</span>${fmt(transaction.amount)}</div>
    <div class="grid">
      <div class="field"><span class="lbl">Student</span><span class="val">${studentName}</span></div>
      <div class="field"><span class="lbl">Date & Time</span><span class="val">${fmtDateTime(transaction.transactionDate as string)}</span></div>
      <div class="field"><span class="lbl">Category</span><span class="val">${fmtCat(transaction.category)}</span></div>
      <div class="field"><span class="lbl">Payment Method</span><span class="val">${(transaction.paymentMode || "—").toUpperCase()}</span></div>
    </div>
    <hr class="divider"/>
    <div class="grid">
      <div class="field"><span class="lbl">Transaction ID</span><span class="val">${transaction.id || "—"}</span></div>
      <div class="field"><span class="lbl">Payment ID (Razorpay)</span><span class="val">${transaction.referenceId || "—"}</span></div>
      ${razorpayOrderId ? `<div class="field"><span class="lbl">Order ID (Razorpay)</span><span class="val">${razorpayOrderId}</span></div>` : ""}
      ${transaction.note && !razorpayOrderId ? `<div class="field" style="grid-column:span 2"><span class="lbl">Note</span><span class="val">${transaction.note}</span></div>` : ""}
      ${transaction.description ? `<div class="field" style="grid-column:span 2"><span class="lbl">Description</span><span class="val">${transaction.description}</span></div>` : ""}
    </div>
  </div>
  <div class="footer">Generated on ${new Date().toLocaleString("en-IN")} · ${user?.college?.name || "Bbrains"} Education Platform</div>
</div></body></html>`

  const iframe = document.createElement("iframe")
  Object.assign(iframe.style, { position: "fixed", width: "0", height: "0", border: "0", top: "-9999px" })
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open(); doc.write(html); doc.close()
  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }, 400)
}
