"use client";

import React from "react";
import Image from "next/image";
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
import { ShoppingCart, X, Package, Minus, Plus, Loader2 } from "lucide-react";
import type { Product } from "@/services/api/client";
import { resolveApiFileUrl } from "@/lib/file-url";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: Record<number, number>;
  products: Product[];
  onAddToCart: (productId: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onCheckout: () => void;
  isProcessing: boolean;
  processingItems: Set<number>;
}

export function CartDrawer({
  open,
  onOpenChange,
  cart,
  products,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
  isProcessing,
  processingItems
}: CartDrawerProps) {
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find((p) => p.id === Number(id));
    return total + Number(product?.price || 0) * qty;
  }, 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-black tracking-tight">Acquisition Cart</DrawerTitle>
                  <DrawerDescription className="font-medium text-[10px] uppercase tracking-widest text-muted-foreground">{cartCount} unit{cartCount !== 1 ? 's' : ''} staged for transfer</DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {cartCount === 0 ? (
              <div className="py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-border/40">
                   <ShoppingCart className="w-10 h-10 text-muted-foreground/10" />
                </div>
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">No Records</p>
                   <p className="text-[10px] font-bold text-muted-foreground/30">No items in cart</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(cart).map(([id, qty]) => {
                  const product = products.find((p) => p.id === Number(id));
                  if (!product) return null;
                  return (
                    <div key={id} className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/60 shadow-sm group hover:border-primary/20 transition-all">
                      <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/40 transition-colors group-hover:border-primary/20">
                        {product.image ? (
                           <Image src={resolveApiFileUrl(product.image)} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                           <Package className="w-6 h-6 text-muted-foreground/20 m-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-foreground truncate text-sm tracking-tight">{product.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                           <img src="/bcoin.svg" className="h-4 w-4" alt="" />
                           <span className="font-black text-primary tabular-nums text-xs">{product.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border/40">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-background" 
                          onClick={() => onRemoveFromCart(Number(id))}
                          disabled={processingItems.has(Number(id))}
                        >
                          {processingItems.has(Number(id)) ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <Minus className="w-3 h-3" />}
                        </Button>
                        <span className="w-8 text-center text-sm font-black tabular-nums">{qty}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-background" 
                          onClick={() => onAddToCart(Number(id))}
                          disabled={processingItems.has(Number(id))}
                        >
                          {processingItems.has(Number(id)) ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <Plus className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartCount > 0 && (
            <div className="p-8 border-t border-border/60 bg-muted/20 space-y-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-end px-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Aggregate Value</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground tabular-nums tracking-tighter leading-none">{cartTotal}</span>
                  <span className="text-xs font-black text-primary uppercase tracking-widest">B-Coins</span>
                </div>
              </div>
              <Button
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                onClick={onCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
