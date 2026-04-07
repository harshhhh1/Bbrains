"use client";

import React from "react";
import Image from "next/image";
import { Package, Pencil, Trash2, Image as ImageIcon, Star, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/api/client";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = product.productType === 'physical' && (product.stock || 0) < 5;
  const isOutOfStock = product.productType === 'physical' && (product.stock || 0) === 0;

  return (
    <Card className="group relative overflow-hidden rounded-[24px] border-2 bg-card shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-orange/50">
      <div className="absolute right-4 top-4 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-md hover:bg-brand-orange hover:text-white"
          onClick={() => onEdit(product)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8 rounded-full shadow-md"
          onClick={() => onDelete(Number(product.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30 relative">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name || "Product"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.productType === 'digital' ? (
            <Badge className="bg-brand-mint text-white shadow-sm border-none font-bold">
              Digital
            </Badge>
          ) : (
            <>
              <Badge className="bg-brand-orange text-white shadow-sm border-none font-bold">
                Physical
              </Badge>
              {isOutOfStock ? (
                <Badge variant="destructive" className="shadow-sm border-none font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Out of Stock
                </Badge>
              ) : isLowStock ? (
                <Badge className="bg-amber-500 text-white shadow-sm border-none font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Low Stock
                </Badge>
              ) : null}
            </>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-lg truncate text-foreground group-hover:text-brand-orange transition-colors">
              {product.name}
            </h3>
            <p className="text-sm font-medium text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-brand-yellow/20 px-2.5 py-1 text-brand-orange shrink-0">
            <Star className="h-4 w-4 fill-brand-orange" />
            <span className="font-black">{product.price}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm font-medium text-muted-foreground pt-4 border-t border-border/50">
          <span className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            {product.productType === 'digital'
              ? 'Unlimited downloads'
              : `${product.stock || 0} in stock`
            }
          </span>
          <span className="text-xs uppercase tracking-wider bg-muted px-2 py-1 rounded-md">
            ID: {product.id}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
