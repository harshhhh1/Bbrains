"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveApiFileUrl } from "@/lib/file-url";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden bg-card border border-border group shadow-2xl">
        {images[selectedIndex] ? (
          <div className="relative h-full w-full">
            <Image
              src={resolveApiFileUrl(images[selectedIndex])}
              alt={name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
              priority
            />
            {images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevImage}
                  className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextImage}
                  className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <Package className="w-20 h-20 text-muted-foreground/30" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">No Preview</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="hidden md:grid grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500",
                selectedIndex === idx
                  ? "border-primary scale-95 shadow-lg shadow-primary/20"
                  : "border-transparent opacity-40 hover:opacity-100"
              )}
            >
              <Image src={resolveApiFileUrl(img)} alt={`Thumb ${idx}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
