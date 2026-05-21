"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchField } from "@/components/ui/toolbar";
import { PageContainer, PageHeader, Stack } from "@/components/layout/page-primitives";
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
  ShoppingCart,
  Package,
} from "lucide-react";
import { toast } from "sonner";
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
    <PageContainer padding="spacious" gap="xl">
      <PageHeader
        title="Marketplace"
        description="Discover the best tools and resources for your academic journey."
        titleClassName="text-5xl font-black tracking-tighter"
        descriptionClassName="text-lg font-medium"
        actions={
          <>
          <Link href="/products">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px]">
              <Package className="w-4 h-4 mr-2" />
              My Inventory
            </Button>
          </Link>
          <Button 
            className="h-12 px-6 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 relative transition-all" 
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="font-black text-[10px] uppercase tracking-widest">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg ring-4 ring-background">
                {cartCount}
              </span>
            )}
          </Button>
          </>
        }
      />

      <SearchField
        wrapperClassName="group max-w-2xl rounded-3xl border border-border/50 bg-muted/30 p-4"
        iconClassName="left-8 size-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary"
        className="h-14 rounded-2xl border-border/60 bg-card pl-12 pr-4 text-lg font-bold placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
          placeholder="Search for items, tools, or resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <LoadingState label="Fetching marketplace..." className="py-40" iconClassName="size-10" />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="size-16" />}
          title="List Empty"
          description="No items match your search parameters."
          className="rounded-[2.5rem] border-2 border-border/40 py-32"
        />
      ) : (
        <Stack gap="xl">
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
        </Stack>
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
            <Button 
               variant="outline"
               onClick={() => setShowBuyConfirm(false)}
               className="h-14 px-8 rounded-2xl border-border bg-transparent text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={() => { setShowBuyConfirm(false); setShowPinDialog(true); }}
              className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              Proceed to Payment
            </Button>
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
    </PageContainer>
  );
}
