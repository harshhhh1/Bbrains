import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Star, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { Product } from "@/services/api/client";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "draft": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "approved": return "Live";
    case "pending": return "Pending Approval";
    case "rejected": return "Rejected";
    case "draft": return "Draft";
    default: return status;
  }
};

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="rounded-2xl border-white/5 bg-white/[0.02] hover:border-white/10 transition-all group">
      <CardContent className="p-0">
        <div className="flex items-center gap-6 p-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/5">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-white/10" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg text-white truncate">{product.name}</h3>
              <div className="flex gap-1.5 shrink-0">
                <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none">
                  {product.productType || 'physical'}
                </Badge>
                <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border", statusColor(product.approval))}>
                  {statusLabel(product.approval)}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
              <span className="font-black text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-lg">
                {product.price} B-Coins
              </span>
              
              {product.productType === 'physical' && (
                <div className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full", product.stock <= 5 && product.stock > 0 ? "bg-amber-400" : product.stock === 0 ? "bg-red-400" : "bg-emerald-400")} />
                  <span className={cn(product.stock <= 5 && product.stock > 0 ? "text-amber-400" : product.stock === 0 ? "text-red-400" : "text-white/40")}>
                    {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 text-white/30 border-l border-white/5 pl-5">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500/80 fill-yellow-500/20" />
                  <span className="text-white/60 font-bold">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                  <span className="opacity-50">({product.reviewCount || 0})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {product.unitsSold || 0} sold
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-white/5">
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-10 w-10 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange text-white/40 transition-colors">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product)}
              className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}