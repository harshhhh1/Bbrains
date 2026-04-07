import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";

export function useMarket() {
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getProducts(1, 100);
      if (response.success && response.data) {
        const productsData = (response.data as any)?.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
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
        (response.data as any[]).forEach((item: any) => {
          cartObj[item.productId] = item.quantity;
        });
        setCart(cartObj);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts, fetchCart]);

  const updateCartItem = async (productId: number, qty: number) => {
    try {
      const prevCart = { ...cart };

      if (qty <= 0) {
        const newCart = { ...cart };
        delete newCart[productId];
        setCart(newCart);
        await marketApi.removeFromCart(productId);
        toast.success("Removed from cart");
      } else {
        setCart({ ...cart, [productId]: qty });
        await marketApi.addToCart(productId, qty);
        toast.success("Cart updated");
      }
    } catch (error) {
      console.error("Cart update failed:", error);
      toast.error("Failed to update cart");
      fetchCart();
    }
  };

  const handleBuyClick = (product: Product) => {
    setBuyProduct(product);
    setQuantity(1);
    setShowBuyConfirm(true);
  };

  const handleConfirmPurchase = () => {
    setShowBuyConfirm(false);
    setShowPinDialog(true);
  };

  const executePurchase = async (pin: string) => {
    if (!buyProduct) return;

    try {
      setIsProcessing(true);
      const response = await marketApi.purchaseProduct({
        productId: Number(buyProduct.id),
        quantity,
        pin,
      });

      if (response.success) {
        toast.success("Purchase successful!");
        setShowPinDialog(false);
        setBuyProduct(null);
        fetchProducts();
      } else {
        throw new Error(response.error || "Purchase failed");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Purchase failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return {
    products,
    loading,
    searchQuery,
    setSearchQuery,
    cart,
    setCart,
    showCart,
    setShowCart,
    showBuyConfirm,
    setShowBuyConfirm,
    showPinDialog,
    setShowPinDialog,
    buyProduct,
    setBuyProduct,
    isProcessing,
    quantity,
    setQuantity,
    updateCartItem,
    handleBuyClick,
    handleConfirmPurchase,
    executePurchase,
    filteredProducts
  };
}
