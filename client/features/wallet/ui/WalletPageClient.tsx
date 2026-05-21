"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowUpRight, ArrowDownLeft, QrCode, Inbox } from "lucide-react";
import { BaseCard } from "@/components/ui/base-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, PageContainer, PageHeader, Stack } from "@/components/layout/page-primitives";

// API and Types
import { walletApi, transactionApi, dashboardApi, Transaction, WalletData, User, MoneyRequest } from "@/services/api/client";

// Modular Components
import { WalletHero } from "@/features/wallet/ui/WalletHero";
import { SpendingsChart } from "@/features/wallet/ui/SpendingsChart";
import { TransactionHistory } from "@/features/wallet/ui/TransactionHistory";
import { WalletDialogs } from "@/features/wallet/ui/Dialogs"; // Ensure you move your dialogs here!

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<MoneyRequest[]>([]);

  // Dialog States
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [scannedWalletId, setScannedWalletId] = useState("");

  const fetchData = async () => {
    try {
      const [walletRes, txnRes, userRes, requestsRes] = await Promise.all([
        walletApi.getWallet(),
        transactionApi.getMyTransactions({ limit: 100 }),
        dashboardApi.getUser(),
        walletApi.getIncomingRequests(),
      ]);

      if (walletRes.success && walletRes.data) setWallet(walletRes.data);
      if (userRes.success && userRes.data) setUser(userRes.data);
      if (txnRes.success && txnRes.data) {
        const txnData = (txnRes.data as { data?: Transaction[] })?.data || txnRes.data;
        const allTxns = Array.isArray(txnData) ? txnData : [];
        setTransactions(allTxns.filter((t: Transaction) => t.paymentMode === 'wallet'));
      }
      if (requestsRes.success && requestsRes.data) {
        setPendingRequests(requestsRes.data.filter((r) => r.status === 'pending'));
      }
    } catch (err) {
      setError("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScanSuccess = (walletId: string) => {
    setScannedWalletId(walletId);
    setShowScanDialog(false);
    setShowSendDialog(true);
  };

  // Calculations
  const walletBalance = Number(wallet?.balance ?? 0);
  const xpValue = typeof user?.xp === 'object' && user.xp !== null ? Number(user.xp.xp || 0) : Number(user?.xp || 0);
  const levelValue = typeof user?.xp === 'object' && user.xp !== null ? Number(user.xp.level || Math.floor(xpValue / 1000) + 1) : Math.floor(xpValue / 1000) + 1;
  const nextLevel = { levelNumber: levelValue + 1, requiredXp: levelValue * 1000 };
  const progressPercent = Math.min(Math.floor(((xpValue % 1000) / 1000) * 100), 100);

  return (
    <PageContainer>
      <PageHeader title="Wallet" />

        <WalletHero 
          walletBalance={walletBalance} 
          xp={xpValue} 
          level={levelValue} 
          nextLevel={nextLevel} 
          progressPercent={progressPercent} 
        />

        {error && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Stack gap="lg">
          {/* Quick Actions Card */}
          <BaseCard title="Quick Actions" contentClassName="p-6 pt-0">
              <Grid className="grid-cols-2 sm:grid-cols-4" gap="sm">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowSendDialog(true)}>
                  <ArrowUpRight className="w-6 h-6 text-destructive" />
                  <span className="text-sm">Send Money</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowRequestDialog(true)}>
                  <ArrowDownLeft className="w-6 h-6 text-primary" />
                  <span className="text-sm">Request</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 relative" onClick={() => setShowRequestsDialog(true)}>
                  <Inbox className="w-6 h-6 text-primary" />
                  <span className="text-sm">Requests</span>
                  {pendingRequests.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] bg-destructive border-destructive text-destructive-foreground justify-center">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowQrDialog(true)}>
                  <QrCode className="w-6 h-6 text-primary" />
                  <span className="text-sm">Show QR</span>
                </Button>
              </Grid>
          </BaseCard>

          <SpendingsChart transactions={transactions} />

          <TransactionHistory 
            transactions={transactions} 
            loading={loading} 
            error={error} 
          />
        </Stack>

        {/* Global Dialogs isolated into a separate component for cleanliness */}
        <WalletDialogs
          wallet={wallet}
          showSendDialog={showSendDialog}
          setShowSendDialog={setShowSendDialog}
          showQrDialog={showQrDialog}
          setShowQrDialog={setShowQrDialog}
          showScanDialog={showScanDialog}
          setShowScanDialog={setShowScanDialog}
          showRequestDialog={showRequestDialog}
          setShowRequestDialog={setShowRequestDialog}
          showRequestsDialog={showRequestsDialog}
          setShowRequestsDialog={setShowRequestsDialog}
          pendingRequests={pendingRequests}
          setPendingRequests={setPendingRequests}
          prefilledWalletId={scannedWalletId}
          onScanSuccess={handleScanSuccess}
          onTransferSuccess={fetchData}
        />
    </PageContainer>
  );
}
