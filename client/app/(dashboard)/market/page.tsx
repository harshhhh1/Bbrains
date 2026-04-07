"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingCart,
  Store,
  Loader2,
  Minus,
  Plus
} from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";

import { useMarket } from "./hooks/useMarket";
import { PinDialog, MarketProductCard } from "./components";

export default function MarketPage() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    cart,
    showCart,
    setShowCart,
    showBuyConfirm,
    setShowBuyConfirm,
    showPinDialog,
    setShowPinDialog,
    buyProduct,
    setBuyProduct,
    isProcessing,
    quantity,
    setQuantity,
    updateCartItem,
    handleBuyClick,
    handleConfirmPurchase,
    executePurchase,
    filteredProducts
  } = useMarket();

  return (
    <DashboardContent className="mx-auto max-w-6xl px-4 py-8 animate-in fade-in duration-500">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white flex items-center gap-3">
            <Store className="w-12 h-12 text-brand-orange" />
            Marketplace
          </h1>
          <p className="text-white/60 font-medium text-lg">Spend your XP on digital and physical rewards.</p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto shrink-0 items-center">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
            />
          </div>
          <Link href="/market/library" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 hover:text-brand-orange transition-colors">
              My Library
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-orange animate-spin" />
          <p className="text-white/50 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
          <Store className="w-16 h-16 text-white/20 mb-6" />
          <h3 className="text-2xl font-black text-white mb-2">No items found</h3>
          <p className="text-white/50 font-medium text-center max-w-md">Try adjusting your search terms or check back later for new inventory.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 relative z-10">
          {filteredProducts.map((product, idx) => (
            <MarketProductCard
              key={product.id}
              product={product}
              idx={idx}
              handleBuyClick={handleBuyClick}
            />
          ))}
        </div>
      )}

      {/* Buy Confirmation Dialog */}
      <Dialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
        <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
          <DialogHeader className="space-y-3 mb-6">
            <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7 text-brand-orange" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white text-center">Confirm Purchase</DialogTitle>
            <DialogDescription className="text-base font-medium text-white/50 text-center">
              You are about to purchase <span className="font-bold text-white">{buyProduct?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          {buyProduct?.productType === 'physical' && (
            <div className="flex items-center justify-between py-4 border-y border-white/10 mb-6">
              <span className="font-bold text-white/60">Quantity</span>
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-white/10 text-white hover:text-white"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => q - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-black text-xl">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-white/10 text-white hover:text-white"
                  disabled={quantity >= (buyProduct.stock || 1)}
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8 px-4 py-6 bg-white/5 rounded-2xl">
            <span className="font-bold text-white/60">Total Cost</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black tracking-tighter text-white leading-none">{(buyProduct?.price || 0) * quantity}</span>
              <span className="font-bold text-brand-orange">XP</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBuyConfirm(false)} className="w-full h-14 rounded-2xl border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20">
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onConfirm={executePurchase}
        isProcessing={isProcessing}
        description={`Authorizing purchase of ${buyProduct?.name} for ${(buyProduct?.price || 0) * quantity} XP.`}
      />
    </DashboardContent>
  );
}
