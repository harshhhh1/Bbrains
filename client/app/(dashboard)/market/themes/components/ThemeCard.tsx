"use client";

import React from "react";
import Image from "next/image";
import { Star, Download, Palette, Check, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/api/client";
import { cn } from "@/lib/utils";

interface ThemeCardProps {
  theme: Product;
  idx: number;
  handlePreview: (theme: Product) => void;
  handleBuyClick: (theme: Product) => void;
}

export function ThemeCard({ theme, idx, handlePreview, handleBuyClick }: ThemeCardProps) {
  const isPurchased = theme.purchased;

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl border-2 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl transition-all hover:scale-[1.02] hover:border-brand-orange/30 hover:shadow-brand-orange/20"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {theme.image ? (
          <Image
            src={theme.image}
            alt={theme.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Palette className="h-16 w-16 text-white/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-orange text-white border-none font-black uppercase tracking-widest text-[10px]">
              Theme
            </Badge>
            {isPurchased && (
              <Badge className="bg-brand-mint text-white border-none font-black uppercase tracking-widest text-[10px]">
                <Check className="w-3 h-3 mr-1 inline" /> Owned
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-black/50 backdrop-blur-md px-3 py-1.5 border border-white/10">
            <Star className="h-3 w-3 fill-brand-yellow text-brand-yellow" />
            <span className="text-xs font-bold text-white">{theme.rating?.toFixed(1) || "5.0"}</span>
          </div>
        </div>
      </div>

      <CardContent className="relative p-6">
        <h3 className="font-black text-xl text-white tracking-tight mb-2 line-clamp-1 group-hover:text-brand-orange transition-colors">
          {theme.name}
        </h3>

        <p className="text-sm font-medium text-white/60 line-clamp-2 mb-6 leading-relaxed">
          {theme.description || "A beautiful theme to customize your workspace."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white leading-none">{theme.price}</span>
              <span className="text-sm font-bold text-brand-orange">XP</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePreview(theme)}
              className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-brand-blue"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {isPurchased ? (
              <Button
                variant="outline"
                className="h-10 rounded-xl border-white/10 bg-white/5 text-white/50 cursor-default"
              >
                In Library
              </Button>
            ) : (
              <Button
                onClick={() => handleBuyClick(theme)}
                className="h-10 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs px-6 shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)] transition-all hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.6)]"
              >
                <Download className="w-4 h-4 mr-2" /> Buy
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
