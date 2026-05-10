"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { walletApi } from "@/services/api/client";
import { SendMoneyDrawer } from "@/features/wallet/ui/SendMoneyDrawer";
import { ReceiveMoneyDrawer } from "@/features/wallet/ui/ReceiveMoneyDrawer";
import { ScanPayDrawer } from "@/features/wallet/ui/ScanPayDrawer";
import { RequestMoneyDrawer } from "@/features/wallet/ui/RequestMoneyDrawer";
import { PendingRequestsDrawer } from "@/features/wallet/ui/PendingRequestsDrawer";
import { TransactionReceiptDrawer } from "@/features/wallet/ui/TransactionReceiptDrawer";

export function WalletDialogs({
  wallet,
  showSendDialog,
  setShowSendDialog,
  showQrDialog,
  setShowQrDialog,
  showScanDialog,
  setShowScanDialog,
  showRequestDialog,
  setShowRequestDialog,
  showRequestsDialog,
  setShowRequestsDialog,
  pendingRequests,
  setPendingRequests,
  prefilledWalletId,
  onScanSuccess,
  onTransferSuccess,
}) {
  // Local orchestration state
  const [transferData, setTransferData] = useState(null);
  const [pin, setPin] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Request acceptance state
  const [pendingAcceptRequest, setPendingAcceptRequest] = useState(null);
  const [requestPin, setRequestPin] = useState("");
  const [showRequestPinDialog, setShowRequestPinDialog] = useState(false);
  const [respondingRequestId, setRespondingRequestId] = useState(null);

  const handleSendNext = (data) => {
    setTransferData(data);
    setShowSendDialog(false);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async () => {
    if (!transferData || pin.length < 4) return;
    try {
      setIsProcessing(true);
      const res = await walletApi.transfer(
        transferData.recipientId,
        transferData.amount,
        pin,
        transferData.note,
      );
      if (res.success) {
        setShowPinDialog(false);
        setShowReceiptDialog(true);
        onTransferSuccess();
      } else {
        toast.error(res.message || "Settlement failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      setRespondingRequestId(id);
      const res = await walletApi.respondToRequest(id, false, "");
      if (res.success) {
        toast.success("Solicitation Voided");
        setPendingRequests((p) => p.filter((r) => r.id !== id));
      }
    } finally {
      setRespondingRequestId(null);
    }
  };

  const handleAcceptRequest = (request) => {
    setPendingAcceptRequest(request);
    setShowRequestsDialog(false);
    setShowRequestPinDialog(true);
  };

  const handleRequestPinSubmit = async () => {
    if (!pendingAcceptRequest || requestPin.length < 4) return;
    try {
      setIsProcessing(true);
      const res = await walletApi.respondToRequest(
        pendingAcceptRequest.id,
        true,
        requestPin,
      );
      if (res.success) {
        toast.success("Solicitation Authorized");
        setShowRequestPinDialog(false);
        setPendingRequests((p) =>
          p.filter((r) => r.id !== pendingAcceptRequest.id),
        );
        onTransferSuccess();
      } else {
        toast.error(res.message || "Authorization failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <SendMoneyDrawer
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onNext={handleSendNext}
        balance={Number(wallet?.balance || 0)}
        initialRecipientId={prefilledWalletId}
      />

      <ReceiveMoneyDrawer
        open={showQrDialog}
        onOpenChange={setShowQrDialog}
        wallet={wallet}
      />

      <ScanPayDrawer
        open={showScanDialog}
        onOpenChange={setShowScanDialog}
        onScanSuccess={onScanSuccess}
      />

      <RequestMoneyDrawer
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        onSuccess={onTransferSuccess}
      />

      <PendingRequestsDrawer
        open={showRequestsDialog}
        onOpenChange={setShowRequestsDialog}
        requests={pendingRequests}
        onReject={handleRejectRequest}
        onAccept={handleAcceptRequest}
        respondingId={respondingRequestId}
      />

      {/* Primary PIN Entry */}
      <Drawer open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[60vh] before:inset-0 before:rounded-none before:border-border before:bg-background sm:p-0 sm:before:rounded-t-[2.5rem]">
          <DrawerHeader className="border-b border-border/60 p-8 text-center items-center">
            <DrawerTitle className="text-2xl font-black">
              Verify Authorization
            </DrawerTitle>
            <DrawerDescription className="font-medium">
              Enter your secure PIN to authorize transfer of{" "}
              {transferData?.amount} B-Coins.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-10 flex flex-col items-center">
            <Input
              type="password"
              placeholder="••••••"
              className="h-20 text-4xl text-center font-black tracking-[0.5em] bg-muted/20 border-border/40 rounded-3xl w-full max-w-sm"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>
          <DrawerFooter className="border-t border-border/60 p-8">
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              onClick={handlePinSubmit}
              disabled={pin.length < 4 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Authorize Settlement"
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Solicitation PIN Entry */}
      <Drawer
        open={showRequestPinDialog}
        onOpenChange={setShowRequestPinDialog}
      >
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[60vh] before:inset-0 before:rounded-none before:border-border before:bg-background sm:p-0 sm:before:rounded-t-[2.5rem]">
          <DrawerHeader className="border-b border-border/60 p-8 text-center items-center">
            <DrawerTitle className="text-2xl font-black">
              Authorize Solicitation
            </DrawerTitle>
            <DrawerDescription className="font-medium">
              Verify credentials to fulfill request for{" "}
              {pendingAcceptRequest?.amount} B-Coins.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-10 flex flex-col items-center">
            <Input
              type="password"
              placeholder="••••••"
              className="h-20 text-4xl text-center font-black tracking-[0.5em] bg-muted/20 border-border/40 rounded-3xl w-full max-w-sm"
              value={requestPin}
              onChange={(e) =>
                setRequestPin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>
          <DrawerFooter className="border-t border-border/60 p-8">
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              onClick={handleRequestPinSubmit}
              disabled={requestPin.length < 4 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify & Fulfill"
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <TransactionReceiptDrawer
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        data={{
          recipientId: transferData?.recipientId || "",
          amount: transferData?.amount || 0,
          note: transferData?.note,
        }}
      />
    </>
  );
}
