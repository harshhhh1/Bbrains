"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  ShoppingCart,
  Package,
  Loader2,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { marketApi, Product, type CartItem } from "@/services/api/client";
import { MarketProductCard } from "@/features/market/ui/MarketProductCard";
import { CartDrawer } from "@/features/market/ui/CartDrawer";
import { PinDialog } from "@/features/market/ui/PinDialog";

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getProducts(1, 100);
      if (response.success && response.data) {
        // Filter out themes if they exist in category
        const allProducts = Array.isArray(response.data) ? response.data : [];
        setProducts(allProducts.filter(p => p.category !== 'theme'));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
      try {
        const response = await marketApi.getCart();
        if (response.success && Array.isArray(response.data)) {
          const cartObj: Record<number, number> = {};
          response.data.forEach((item: CartItem) => {
            cartObj[item.productId] = item.quantity;
          });
          setCart(cartObj);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts, fetchCart]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find((p) => p.id === Number(id));
    return total + Number(product?.price || 0) * qty;
  }, 0);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = async (productId: number) => {
    if (processingItems.has(productId)) return;
    try {
      setProcessingItems(prev => new Set(prev).add(productId));
      await marketApi.addToCart(productId, 1);
      setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const removeFromCart = async (productId: number) => {
    if (processingItems.has(productId)) return;
    try {
      setProcessingItems(prev => new Set(prev).add(productId));
      await marketApi.removeFromCart(productId);
      
      setCart((prev) => {
        const newCart = { ...prev };
        if (newCart[productId] > 1) {
          newCart[productId]--;
        } else {
          delete newCart[productId];
        }
        return newCart;
      });
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setIsProcessing(true);
      const response = buyProduct 
        ? await marketApi.buyNow(buyProduct.id, quantity, pin)
        : await marketApi.checkout(pin);

      if (response.success) {
        toast.success("Transaction Complete", {
          description: buyProduct ? `Bought ${buyProduct.name}` : `Bought ${cartCount} items`,
        });
        if (!buyProduct) setCart({});
        fetchCart();
        fetchProducts();
      } else {
        toast.error(response.message || "Payment failed");
      }
    } catch (error) {
      toast.error("An error occurred during payment");
    } finally {
      setIsProcessing(false);
      setShowPinDialog(false);
      setBuyProduct(null);
    }
  };

  return (
    <DashboardContent className="mx-auto w-full max-w-7xl p-6 md:p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4 text-foreground">
            <Store className="w-12 h-12 text-primary" />
            Marketplace
          </h1>
          <p className="text-muted-foreground font-medium text-lg">Buy verified educational items and tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px]">
              <Package className="w-4 h-4 mr-2" />
              My Inventory
            </Button>
          </Link>
          <Button className="h-12 px-6 rounded-xl bg-secondary hover:bg-muted border border-border relative" onClick={() => setShowCart(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="font-black text-[10px] uppercase tracking-widest">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg ring-4 ring-background">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="relative group max-w-2xl bg-muted/30 p-4 rounded-3xl border border-border/50">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
        <input
          placeholder="Search for items, tools, or resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg placeholder:text-muted-foreground/30"
        />
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Market...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-32 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border/40">
          <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-2xl font-bold tracking-tight">List Empty</h3>
          <p className="text-muted-foreground font-medium mt-2">No items match your search parameters.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <MarketProductCard
              key={product.id}
              product={product}
              inCart={cart[product.id] || 0}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onBuyNow={(p) => { setBuyProduct(p); setQuantity(1); setShowBuyConfirm(true); }}
              isProcessing={processingItems.has(product.id)}
            />
          ))}
        </div>
      )}

      <CartDrawer
        open={showCart}
        onOpenChange={setShowCart}
        cart={cart}
        products={products}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onCheckout={() => { setShowCart(false); setShowBuyConfirm(true); setBuyProduct(null); }}
        isProcessing={isProcessing}
        processingItems={processingItems}
      />

      <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
        <AlertDialogContent className="rounded-[2rem] border-border bg-card/95 backdrop-blur-2xl p-10 shadow-2xl">
          <AlertDialogHeader className="space-y-4 text-center items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20">
              <ShoppingCart className="w-10 h-10 text-primary" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight">Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-muted-foreground leading-relaxed">
              {buyProduct
                ? `Processing payment for ${buyProduct.name} for ${Number(buyProduct.price) * quantity} B-Coins.`
                : `Processing payment for ${cartCount} items for a total of ${cartTotal} B-Coins.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-3 justify-center">
            <AlertDialogCancel className="h-14 px-8 rounded-2xl border-border bg-transparent text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setShowBuyConfirm(false); setShowPinDialog(true); }}
              className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              Continue to PIN
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PinDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onConfirm={handlePinSubmit}
        isProcessing={isProcessing}
        description="Enter your secure credentials to pay for these items."
      />
    </DashboardContent>
  );
}
