"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Download, Loader2, CheckCircle2 } from "lucide-react";

interface LibraryItemRowProps {
  item: {
    id: string | number;
    productId: number;
    name: string;
    image?: string | null;
    creator?: string;
    purchasedAt: string;
    category: string;
    fileUrl?: string | null;
  };
  isDownloading: boolean;
  onDownload: (item: any) => void;
}

export function LibraryItemRow({ item, isDownloading, onDownload }: LibraryItemRowProps) {
  const isDigital = !!item.fileUrl;

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 hover:bg-card transition-colors overflow-hidden group">
      <CardContent className="p-4">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40 group-hover:border-primary/30 transition-colors">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base truncate tracking-tight">{item.name}</h3>
              <Badge variant={isDigital ? "default" : "secondary"} className="text-[9px] font-black uppercase px-1.5 py-0 tracking-widest">
                {isDigital ? "Digital" : "Physical"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Provisioned by <span className="text-foreground/70">{item.creator || "Bbrains"}</span></p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tighter">Acquired {new Date(item.purchasedAt).toLocaleDateString()}</p>
          </div>

          <div className="shrink-0 pl-2">
            {isDigital ? (
              <Button
                size="sm"
                onClick={() => onDownload(item)}
                disabled={isDownloading}
                className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Attachment 
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Delivered</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
