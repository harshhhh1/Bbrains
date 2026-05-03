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
    <Card className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full">
      {/* Visual Header - Image */}
      <Link href={`/market/${product.id}`} className="relative aspect-[16/10] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 backdrop-blur-md bg-background/80 shadow-sm border-none">
              {product.productType || 'physical'}
            </Badge>
        </div>
      </Link>

      <CardContent className="flex-1 p-6 space-y-6">
        {/* Title & Desc */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
             <Link href={`/market/${product.id}`} className="group/title">
                <h3 className="font-black text-xl text-foreground group-hover/title:text-primary transition-colors line-clamp-1 tracking-tight">
                  {product.name}
                </h3>
             </Link>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-relaxed opacity-80">
            {product.description || "Verified school item provided for academic excellence."}
          </p>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">Item Value</span>
              <div className="flex items-center gap-1.5">
                 <img src="/bcoin.svg" className="h-4 w-4" alt="" />
                 <span className="text-lg font-black text-primary tracking-tighter">{product.price}</span>
              </div>
           </div>
           
           <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">Agent Feedback</span>
              <div className="flex items-center gap-1.5">
                 <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                 <span className="text-sm font-black text-foreground">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                 <span className="text-[10px] font-bold text-muted-foreground/40">({product.reviewCount || 0})</span>
              </div>
           </div>
        </div>

        {/* Stock Banner */}
        <div className={cn(
          "px-4 py-2 rounded-xl flex items-center justify-between border transition-colors",
          isOutOfStock ? "bg-red-500/5 border-red-500/20 text-red-500" :
          isLowStock ? "bg-amber-500/5 border-amber-500/20 text-amber-600" :
          "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
        )}>
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            {isOutOfStock ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {isOutOfStock ? "Depleted" : "Authenticated"}
          </span>
          <span className="text-[10px] font-black">{isOutOfStock ? "0 Left" : isLowStock ? `${product.stock} Units` : "In Stock"}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-3">
        {!isOutOfStock ? (
          <div className="flex items-center gap-3 w-full">
            {inCart > 0 ? (
              <div className="flex items-center bg-muted/50 rounded-2xl border border-border/40 p-1 flex-1 h-12">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl hover:bg-background" 
                  onClick={() => onRemoveFromCart(product.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <span className="flex-1 text-center text-lg font-black text-foreground tabular-nums">{inCart}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl hover:bg-background" 
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
                className="flex-1 h-12 rounded-2xl bg-secondary hover:bg-muted text-foreground border border-border/60 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2 text-primary" />}
                Add to Cart
              </Button>
            )}
            
            <Button
              onClick={() => onBuyNow(product)}
              className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95 group/buy"
            >
              Buy Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ) : (
          <Button disabled className="w-full h-12 rounded-2xl bg-muted/50 text-muted-foreground font-black uppercase tracking-widest text-[10px] border border-border/40 cursor-not-allowed">
            Protocol Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
