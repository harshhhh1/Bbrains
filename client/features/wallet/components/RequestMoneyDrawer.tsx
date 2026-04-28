"use client";

import React, { useState, useCallback, useRef } from "react";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2, X, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import { dashboardApi, walletApi } from "@/services/api/client";
import { getInitials } from "../utils";
import type { SearchUser } from "../data";
import type { ValidationErrors } from "@/lib/validation";

interface RequestMoneyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RequestMoneyDrawer({
  open,
  onOpenChange,
  onSuccess
}: RequestMoneyDrawerProps) {
  const [requestTo, setRequestTo] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (!value.trim()) { setShowDropdown(false); return; }
    setShowDropdown(true);
    setSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await dashboardApi.searchUsers(value);
        if (response.success && response.data) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          setSearchResults(
            data.map((u: any) => ({
              id: u.id,
              name: u.displayName || u.username,
              avatarUrl: u.avatar || "",
            }))
          );
        }
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSendRequest = async () => {
    if (!requestTo) { setErrors({ recipient: "Select a source" }); return; }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) { setErrors({ amount: "Invalid amount" }); return; }
    if (!reason.trim()) { toast.error("Provision a reason for request"); return; }

    try {
      setSubmitting(true);
      const res = await walletApi.createRequest(requestTo, amt, reason);
      if (res.success) {
        toast.success("Solicitation Dispatched");
        onOpenChange(false);
        onSuccess();
        // Reset form
        setRequestTo(""); setAmount(""); setReason(""); setSelectedUser(null); setSearchQuery("");
      } else {
        toast.error(res.message || "Failed to dispatch request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                   <ArrowDownLeft className="h-6 w-6 text-primary" />
                   Request B-Coins
                </DrawerTitle>
                <DrawerDescription className="font-medium">Request B-Coins from another user.</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/40 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-8 overflow-y-auto p-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Request From</Label>
              {selectedUser ? (
                <div className="flex items-center gap-4 bg-primary/5 rounded-2xl p-4 border border-primary/20 shadow-sm animate-in zoom-in-95 duration-300">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={selectedUser.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{getInitials(selectedUser.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                     <p className="font-bold text-foreground truncate">{selectedUser.name}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Target Agent</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="rounded-full hover:bg-rose-500/10 hover:text-rose-600">
                     <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search for users..."
                    className="pl-11 h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {showDropdown && (searchResults.length > 0 || searching) && (
                    <div className="absolute z-50 w-full mt-2 bg-card border border-border/60 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                       {searching ? <div className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing...</div> :
                         searchResults.map(u => (
                           <button key={u.id} className="flex items-center gap-3 w-full p-3 hover:bg-muted/50 rounded-xl transition-colors text-left" onClick={() => { setSelectedUser(u); setRequestTo(u.id); setShowDropdown(false); }}>
                             <Avatar className="h-8 w-8"><AvatarImage src={u.avatarUrl} /><AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">{getInitials(u.name)}</AvatarFallback></Avatar>
                             <span className="text-sm font-bold">{u.name}</span>
                           </button>
                         ))
                       }
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Request Amount</Label>
               <div className="relative">
                  <img src="/bcoin.svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-30" alt="" />
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-16 pl-14 text-2xl font-black tabular-nums bg-muted/20 border-border/40 rounded-2xl focus:ring-2 focus:ring-primary/20" 
                    value={amount} 
                    onChange={(e) => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: undefined })); }}
                  />
               </div>
            </div>

            <div className="space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Reason</Label>
               <textarea 
                className="w-full h-32 p-4 rounded-xl bg-muted/20 border border-border/40 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" 
                placeholder="Briefly state the context for this request..." 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
               />
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-8 bg-muted/5">
             <Button size="lg" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20" onClick={handleSendRequest} disabled={!requestTo || !amount || !reason}>
                Send Request
             </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
