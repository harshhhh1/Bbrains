import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Star, Trash2 } from "lucide-react";
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
    <Card className="rounded-xl border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            ) : (
              <span className="w-6 h-6 text-white/10 m-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white truncate">{product.name}</h3>
              <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0">
                {product.productType || 'physical'}
              </Badge>
              <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border shrink-0", statusColor(product.approval))}>
                {statusLabel(product.approval)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40 flex-wrap">
              <span className="font-bold text-brand-orange">{product.price} B-Coins</span>
              {product.productType === 'physical' && (
                <span className={cn("font-bold", product.stock <= 5 && product.stock > 0 ? "text-amber-400" : product.stock === 0 ? "text-red-400" : "text-white/40")}>
                  {product.stock === 0 ? "Out of stock" : product.stock <= 5 ? `${product.stock} left (low)` : `${product.stock} in stock`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                {product.rating ? product.rating.toFixed(1) : "0.0"} ({product.reviewCount || 0})
              </span>
              <span>{product.unitsSold || 0} sold</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 rounded-lg hover:bg-brand-orange/10 hover:text-brand-orange">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product)}
              className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}