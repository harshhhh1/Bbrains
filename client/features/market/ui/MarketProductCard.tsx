"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Star, 
  Loader2, 
  Plus, 
  Minus, 
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import type { Product } from "@/services/api/client";
import { resolveApiFileUrl } from "@/lib/file-url";
import { cn } from "@/lib/utils";

interface MarketProductCardProps {
  product: Product;
  inCart: number;
  onAddToCart: (productId: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onBuyNow: (product: Product) => void;
  isProcessing: boolean;
}

export function MarketProductCard({
  product,
  inCart,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
  isProcessing
}: MarketProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Card className="group relative overflow-hidden rounded-[2.5rem] border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-auto md:h-64">
          {/* Visual Header - Image */}
          <Link href={`/market/${product.id}`} className="relative w-full md:w-80 h-64 overflow-hidden shrink-0">
            {product.image ? (
              <Image
                src={resolveApiFileUrl(product.image)}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/30">
                <Package className="w-12 h-12 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-4 left-4">
                <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 backdrop-blur-md bg-background/80 shadow-sm border-none">
                  {product.productType || 'physical'}
                </Badge>
            </div>
          </Link>

          {/* Content Area */}
          <div className="flex-1 p-8 flex flex-col justify-between min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-3 min-w-0">
                <Link href={`/market/${product.id}`} className="group/title inline-block">
                  <h3 className="font-black text-3xl text-foreground group-hover/title:text-primary transition-colors tracking-tight truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-base text-muted-foreground line-clamp-2 font-medium leading-relaxed opacity-80 max-w-2xl">
                  {product.description || "High-quality academic resources for your success."}
                </p>
                
                <div className="flex items-center gap-4 pt-2">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                      <img src="/bcoin.svg" className="h-4 w-4" alt="" />
                      <span className="text-lg font-black text-primary tracking-tighter">{product.price} B-Coins</span>
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 border border-border/40">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-black text-foreground">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                      <span className="text-[10px] font-bold text-muted-foreground/40">Rating</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className={cn(
                  "px-4 py-2 rounded-2xl flex items-center gap-3 border transition-colors",
                  isOutOfStock ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" :
                  isLowStock ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                  "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
                )}>
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    {isOutOfStock ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {isOutOfStock ? "Out of Stock" : "Verified"}
                  </span>
                  <div className="w-px h-3 bg-current opacity-20" />
                  <span className="text-[10px] font-black">{isOutOfStock ? "0 Left" : isLowStock ? `${product.stock} Units` : "In Stock"}</span>
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-border/40">
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                   <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {product.creator?.userDetails?.avatar ? (
                        <img src={product.creator.userDetails.avatar} alt="" className="size-full object-cover" />
                      ) : (
                        <Package className="w-3 h-3 text-primary/40" />
                      )}
                   </div>
                   <span className="opacity-60">Sold by</span>
                   <span className="text-foreground/80">
                      {product.creator?.userDetails?.displayName || 
                       (product.creator?.userDetails?.firstName ? `${product.creator.userDetails.firstName} ${product.creator.userDetails.lastName || ''}`.trim() : 
                        product.creator?.username) || 
                       'Official Protocol'}
                   </span>
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {!isOutOfStock ? (
                  <>
                    {inCart > 0 ? (
                      <div className="flex items-center bg-muted/50 rounded-2xl border border-border/40 p-1 h-14 w-40">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl hover:bg-background" 
                          onClick={() => onRemoveFromCart(product.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <span className="flex-1 text-center text-xl font-black text-foreground tabular-nums">{inCart}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl hover:bg-background" 
                          onClick={() => onAddToCart(product.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onAddToCart(product.id)}
                        disabled={isProcessing}
                        className="h-14 px-8 rounded-2xl bg-secondary hover:bg-muted text-foreground border border-border/60 font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 flex items-center gap-3"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-5 h-5 text-primary" />}
                        Add to Cart
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => onBuyNow(product)}
                      className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-95 group/buy flex items-center gap-3"
                    >
                      Buy Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </>
                ) : (
                  <Button disabled className="h-14 px-8 rounded-2xl bg-muted/50 text-muted-foreground font-black uppercase tracking-widest text-[11px] border border-border/40 cursor-not-allowed">
                    Currently Unavailable
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
