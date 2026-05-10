"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, ScanLine } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { dashboardApi } from "@/services/api/client";
import { getInitials } from "@/features/wallet/model/utils";

export function SendMoneyDrawer({
  open,
  onOpenChange,
  onNext,
  initialRecipientId,
  balance,
}) {
  const [sendTo, setSendTo] = useState(initialRecipientId || "");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInlineScan, setShowInlineScan] = useState(false);
  const [isInlineScanning, setIsInlineScanning] = useState(false);
  const [errors, setErrors] = useState({});

  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialRecipientId) setSendTo(initialRecipientId);
  }, [initialRecipientId]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setSearchResults([]);
    if (!value.trim()) {
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
    setSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await dashboardApi.searchUsers(value);
        if (response.success && response.data) {
          const data = Array.isArray(response.data)
            ? response.data
            : [response.data];
          setSearchResults(
            data.map((u) => ({
              id: u.id,
              name: u.displayName || u.username,
              avatarUrl: u.avatar || "",
            })),
          );
        }
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleNext = () => {
    if (!sendTo) {
      setErrors({ recipient: "Select a recipient" });
      return;
    }
    const amt = Number(sendAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrors({ amount: "Enter a valid amount" });
      return;
    }
    if (amt > balance) {
      setErrors({ amount: `Insufficient funds (${balance} available)` });
      return;
    }
    onNext({ recipientId: sendTo, amount: amt, note: sendNote });
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-2xl font-black tracking-tight">
                  Dispatch Assets
                </DrawerTitle>
                <DrawerDescription className="font-medium">
                  Transfer B-Coins to another verified agent.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted/40 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-8 overflow-y-auto p-8">
            {showInlineScan ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-primary">
                    Optical Scan Active
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInlineScan(false)}
                    className="rounded-xl h-8 font-bold"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="w-full h-64 overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-black flex items-center justify-center shadow-inner">
                  <Scanner
                    onScan={(result) => {
                      if (result?.[0]?.rawValue && !isInlineScanning) {
                        setIsInlineScanning(true);
                        try {
                          const data = JSON.parse(result[0].rawValue);
                          if (data.walletId) {
                            setSendTo(data.walletId);
                            setShowInlineScan(false);
                            toast.success("Target Identified");
                          }
                        } catch {
                          setIsInlineScanning(false);
                        }
                      }
                    }}
                    components={{ finder: true }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Target Recipient
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                      onClick={() => setShowInlineScan(true)}
                    >
                      <ScanLine className="w-3.5 h-3.5" /> Optical Scan
                    </Button>
                  </div>
                  {selectedUser ? (
                    <div className="flex items-center gap-4 bg-primary/5 rounded-2xl p-4 border border-primary/20 shadow-sm animate-in zoom-in-95 duration-300">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarImage src={selectedUser.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                          {getInitials(selectedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {selectedUser.name}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                          Verified Identity
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedUser(null)}
                        className="rounded-full hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="search for users..."
                        className="pl-11 h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />

                      {showDropdown &&
                        (searchResults.length > 0 || searching) && (
                          <div className="absolute z-50 w-full mt-2 bg-card border border-border/60 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                            {searching ? (
                              <div className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                                Syncing...
                              </div>
                            ) : (
                              searchResults.map((u) => (
                                <button
                                  key={u.id}
                                  className="flex items-center gap-3 w-full p-3 hover:bg-muted/50 rounded-xl transition-colors text-left"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setSendTo(u.id);
                                    setShowDropdown(false);
                                  }}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={u.avatarUrl} />
                                    <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                      {getInitials(u.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-bold">
                                    {u.name}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                    </div>
                  )}
                  {errors.recipient && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-wider">
                      {errors.recipient}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Asset Volume
                  </Label>
                  <div className="relative">
                    <img
                      src="/bcoin.svg"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-30"
                      alt=""
                    />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-16 pl-14 text-2xl font-black tabular-nums bg-muted/20 border-border/40 rounded-2xl focus:ring-2 focus:ring-primary/20"
                      value={sendAmount}
                      onChange={(e) => {
                        setSendAmount(e.target.value);
                        setErrors((p) => ({ ...p, amount: undefined }));
                      }}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-wider">
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Optional Note
                  </Label>
                  <Input
                    placeholder="Sending you Bcoins for..."
                    className="h-12 bg-muted/20 border-border/40 rounded-xl font-medium"
                    value={sendNote}
                    onChange={(e) => setSendNote(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="border-t border-border/60 p-8 bg-muted/5">
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              onClick={handleNext}
              disabled={!sendTo || !sendAmount}
            >
              Send Coins
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
