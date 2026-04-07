"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/api/client";
import { encodeImageUrl } from "../utils";

interface MarketProductCardProps {
  product: Product;
  idx: number;
  handleBuyClick: (product: Product) => void;
}

export function MarketProductCard({ product, idx, handleBuyClick }: MarketProductCardProps) {
  const isOutOfStock = product.productType === 'physical' && (product.stock || 0) === 0;

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-all duration-300"
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex gap-4 md:gap-6">
          <Link href={`/market/${product.id}`} className="shrink-0">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-white/[0.03]">
              {product.image ? (
                <Image
                  src={encodeImageUrl(product.image)}
                  alt={product.name || "Product"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-white/10" />
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/market/${product.id}`} className="group/title">
                  <h3 className="font-bold text-lg text-white group-hover/title:text-brand-orange transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                    {product.productType || 'physical'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-white/50">
                <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-brand-orange text-brand-orange" />
                  <span className="text-white/80">{product.rating?.toFixed(1) || "5.0"}</span>
                </div>
                <span>•</span>
                <span>{product.reviews || 0} reviews</span>
                <span>•</span>
                <span>{product.purchases || 0} sold</span>
              </div>

              <p className="text-sm font-medium text-white/60 line-clamp-2 leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-end justify-between mt-4 md:mt-0 pt-4 border-t border-white/5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl md:text-4xl font-black tracking-tighter text-white leading-none">{product.price}</span>
                <span className="text-sm md:text-base font-bold text-brand-orange">XP</span>
              </div>

              <div className="flex items-center gap-3">
                {product.productType === 'physical' && (
                  <span className={`text-xs font-bold uppercase tracking-widest ${isOutOfStock ? 'text-red-400' : 'text-white/40'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock || 0} left`}
                  </span>
                )}
                <Button
                  onClick={() => handleBuyClick(product)}
                  disabled={isOutOfStock}
                  className={`h-10 md:h-12 px-4 md:px-6 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all ${
                    isOutOfStock
                      ? 'bg-white/5 text-white/30'
                      : 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/20 active:scale-95'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2 hidden md:inline-block" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
