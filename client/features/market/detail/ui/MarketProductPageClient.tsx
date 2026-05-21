"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marketApi, Product, Review, ReviewStats } from "@/services/api/client";
import { toast } from "sonner";
import { 
  Star, ShoppingCart, ArrowLeft, CheckCircle2, AlertTriangle,
  ShieldCheck, Plus, Minus
} from "lucide-react";
import { PinDialog } from "@/features/market/ui/PinDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid, PageContainer, Stack } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";

import { ProductGallery } from "../components/ProductGallery";
import { ProductReviews } from "../components/ProductReviews";

export default function MarketProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.image) imgs.push(product.image);
    if (product.metadata?.images && Array.isArray(product.metadata.images)) imgs.push(...product.metadata.images);
    if (product.metadata?.previewImages && Array.isArray(product.metadata.previewImages)) imgs.push(...product.metadata.previewImages);
    return [...new Set(imgs)];
  }, [product]);

  useEffect(() => {
    async function fetchProduct(pid: number) {
      try {
        setLoading(true);
        const resp = await marketApi.getProduct(pid);
        if (resp.data) {
          setProduct(resp.data);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(productId)) {
      fetchProduct(productId);
      fetchReviews(productId);
      checkCanReview(productId);
    }
  }, [productId]);

  const fetchReviews = async (pid: number) => {
    try {
      const resp = await marketApi.getReviews(pid);
      if (resp.success && resp.data) {
        setReviews(resp.data.reviews);
        setReviewStats(resp.data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkCanReview = async (pid: number) => {
    try {
      const resp = await marketApi.hasPurchased(pid);
      if (resp.success && resp.data) {
        setCanReview(resp.data.hasPurchased);
        setAlreadyOwned(resp.data.hasPurchased);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    try {
      await marketApi.addToCart(product.id, quantity);
      toast.success("Added to cart");
    } catch (e) {
      toast.error("Cart update failed");
    }
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setIsProcessing(true);
      if (!product) return;
      const resp = await marketApi.buyNow(product.id, quantity, pin);
      if (resp?.success) {
        toast.success("Order Placed", {
          description: `Successfully acquired ${product.name}`,
        });
        setAlreadyOwned(true);
        router.refresh();
      } else {
        toast.error(resp?.message ?? "Purchase failed");
      }
    } catch (e) {
      toast.error("Purchase failed");
    } finally {
      setIsProcessing(false);
      setShowPin(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState label="Loading product details..." className="min-h-[80vh]" iconClassName="size-10" />
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <EmptyState
          icon={<AlertTriangle className="size-16 text-primary" />}
          title="Item Not Found"
          className="min-h-[80vh] border-0 bg-transparent"
          action={
            <Button variant="outline" asChild className="rounded-xl border-border hover:bg-muted">
              <Link href="/market">Return to Market</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <PageContainer maxWidth="max-w-[1400px]" padding="spacious" gap="xl">
      <div className="hidden md:flex items-center gap-4 translate-x-[-8px]">
        <Link href="/market">
          <Button variant="ghost" className="rounded-2xl h-12 px-5 hover:bg-muted text-muted-foreground group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Button>
        </Link>
        <div className="h-1 w-1 rounded-full bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Item Details</span>
      </div>

      <Grid gap="lg" className="items-start md:grid-cols-12 lg:gap-16">
        <Stack gap="lg" className="md:col-span-7">
          <ProductGallery images={allImages} name={product.name} />
        </Stack>

        <Stack gap="xl" className="md:col-span-5 md:sticky md:top-24">
          <Stack gap="lg">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 h-7 rounded-lg">
                Premium Protocol
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1 rounded-xl border border-border/40">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-black text-foreground">{product.rating?.toFixed(1) || "0.0"}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{product.reviewCount || 0} Reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 h-8 rounded-xl">Out of Stock</Badge>
              ) : (
                <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-xl border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Authenticated & In Stock</span>
                </div>
              )}
              {isLowStock && !isOutOfStock && <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 ">Low Stock: {product.stock} available</span>}
            </div>

            <div className="p-10 rounded-[2.5rem] bg-card border border-border shadow-inner flex flex-col gap-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">Price</span>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black text-foreground tracking-tighter tabular-nums leading-none">{product.price}</span>
                <span className="text-xl font-black text-primary uppercase tracking-widest">B-Coins</span>
              </div>
            </div>

            {alreadyOwned && product.productType === 'digital' && (
              <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                 <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                 <p className="text-xs font-bold text-green-600 dark:text-green-400 leading-relaxed">This digital record is already assigned to your account and is accessible in your Inventory.</p>
              </div>
            )}

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-card rounded-2xl border border-border p-1.5">
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-xl" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center text-xl font-black text-foreground tabular-nums">{quantity}</span>
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-xl" 
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= (product.stock || 99)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Estimated Cost</p>
                   <p className="text-2xl font-black text-foreground tracking-tight">{Number(product.price) * quantity} B-Coins</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={addToCart}
                  disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
                  className="h-16 rounded-2xl bg-secondary hover:bg-muted text-foreground font-black uppercase tracking-widest text-[10px] border border-border shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
                </Button>
                <Button
                  onClick={() => setShowPin(true)}
                  disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
                  className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                >
                  Pay Now
                </Button>
              </div>
            </div>

          </Stack>
        </Stack>
      </Grid>

      <Stack gap="xl" className="max-w-4xl mx-auto border-t border-border pt-20">
        <Stack gap="lg">
          <div className="flex items-center gap-4">
              <div className="h-8 w-2 rounded-full bg-primary" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">Product Description</h2>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed font-medium">
             {product.description || "No additional details provided for this item."}
          </p>
        </Stack>

        <Stack gap="xl">
          <ProductReviews 
            productId={productId} 
            reviews={reviews} 
            reviewStats={reviewStats} 
            canReview={canReview} 
            onReviewSubmitted={() => fetchReviews(productId)} 
          />
        </Stack>
      </Stack>

      <PinDialog 
        open={showPin} 
        onOpenChange={setShowPin} 
        onConfirm={handlePinSubmit} 
        isProcessing={isProcessing} 
        description={`Paying for order of ${product.name} for ${Number(product.price) * quantity} B-Coins.`}
      />
    </PageContainer>
  );
}
