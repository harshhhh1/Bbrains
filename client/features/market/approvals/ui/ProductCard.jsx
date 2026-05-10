"use client";

import Image from "next/image";
import { Heart, ShoppingCart, User } from "lucide-react";

export function ProductCard({
  title,
  price,
  seller,
  image,
  condition,
  isFavorite,
}) {
  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-muted p-4 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <button className="absolute top-3 right-3 w-8 h-8 bg-muted/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
          <Heart
            className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`}
          />
        </button>

        {condition && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wide">
            {condition}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
            {title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <User className="h-3 w-3" />
          Sold by {seller}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ${price.toFixed(2)}
          </span>
          <button className="w-10 h-10 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
