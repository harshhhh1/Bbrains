"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marketApi, Product, reviewApi, Review, ReviewStats } from "@/services/api/client";
import { toast } from "sonner";
import { 
  Loader2, Star, ShoppingCart, Package, ArrowLeft, X, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  Heart, Share2, ShieldCheck, Truck, RefreshCcw,
  Plus, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PinDialog } from "../../_components/PinDialog";
import { DashboardContent } from "@/components/dashboard-content";

import { resolveApiFileUrl } from "@/lib/file-url";

export default function MarketProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.image) imgs.push(product.image);
    if (product.metadata?.images && Array.isArray(product.metadata.images)) imgs.push(...product.metadata.images);
    if (product.metadata?.previewImages && Array.isArray(product.metadata.previewImages)) imgs.push(...product.metadata.previewImages);
    return [...new Set(imgs)];
  }, [product]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

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
      const resp = await reviewApi.getReviews(pid);
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
      const resp = await reviewApi.hasPurchased(pid);
      if (resp.success && resp.data) {
        setCanReview(resp.data.hasPurchased);
        setAlreadyOwned(resp.data.hasPurchased);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || newRating === 0 || !newComment.trim()) return;
    try {
      setSubmittingReview(true);
      const resp = await reviewApi.createReview(product.id, { rating: newRating, comment: newComment });
      if (resp.success) {
        toast.success("Verdict posted");
        setShowReviewForm(false);
        setNewRating(0);
        setNewComment("");
        fetchReviews(product.id);
      }
    } catch (e) {
      toast.error("Failed to post verdict");
    } finally {
      setSubmittingReview(false);
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Directory...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
        <AlertTriangle className="w-16 h-16 text-primary" />
        <h2 className="text-2xl font-black text-foreground tracking-tight">Asset Not Found</h2>
        <Button variant="outline" asChild className="rounded-xl border-border hover:bg-muted">
          <Link href="/market">Return to Market</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const sellerDetails = product.creator?.userDetails;
  const sellerName = sellerDetails?.firstName ? `${sellerDetails.firstName} ${sellerDetails.lastName || ""}` : product.creator?.username || "Verified Agent";

  return (
    <DashboardContent className="mx-auto w-full max-w-[1400px] p-6 md:p-12 space-y-12">
      <div className="hidden md:flex items-center gap-4 translate-x-[-8px]">
        <Link href="/market">
          <Button variant="ghost" className="rounded-2xl h-12 px-5 hover:bg-muted text-muted-foreground group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Button>
        </Link>
        <div className="h-1 w-1 rounded-full bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Asset Dossier</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="md:col-span-7 space-y-6">
          <div className="relative aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden bg-card border border-border group shadow-2xl">
            {allImages[selectedIndex] ? (
              <div className="relative h-full w-full">
                <Image 
                  src={resolveApiFileUrl(allImages[selectedIndex])} 
                  alt={product.name} 
                  fill 
                  className="object-cover transition-all duration-700 group-hover:scale-105" 
                  priority
                />
                
                {allImages.length > 1 && (
                  <>
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
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Package className="w-20 h-20 text-muted-foreground/30" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">No Preview</span>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="hidden md:grid grid-cols-6 gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500",
                    selectedIndex === idx ? "border-primary scale-95 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <Image src={resolveApiFileUrl(img)} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-5 space-y-10 md:sticky md:top-24">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 h-7 rounded-lg">
                Premium Protocol
              </Badge>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-card hover:bg-muted">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-card hover:bg-muted">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1 rounded-xl border border-border/40">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-black text-foreground">{product.rating?.toFixed(1) || "0.0"}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{product.reviewCount || 0} Verifications</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 h-8 rounded-xl">Registry Depleted</Badge>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Authenticated & In Stock</span>
                </div>
              )}
              {isLowStock && !isOutOfStock && <span className="text-xs font-bold text-amber-500 animate-pulse">Low Stock: {product.stock} available</span>}
            </div>

            <div className="p-10 rounded-[2.5rem] bg-card border border-border shadow-inner flex flex-col gap-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">Asset Value</span>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black text-foreground tracking-tighter tabular-nums leading-none">{product.price}</span>
                <span className="text-xl font-black text-primary uppercase tracking-widest">B-Coins</span>
              </div>
            </div>

            {alreadyOwned && product.productType === 'digital' && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                 <ShieldCheck className="w-6 h-6 text-emerald-500" />
                 <p className="text-xs font-bold text-emerald-500 leading-relaxed">This digital record is already assigned to your account and is accessible in your Inventory.</p>
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
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Settlement Estimate</p>
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
                  Authorize Now
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-[2rem] bg-muted/20 border border-border/50 flex flex-col gap-3">
                  <Truck className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-1">Instant Fulfillment</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Asset provisioning completes immediately after authorization.</p>
                  </div>
               </div>
               <div className="p-5 rounded-[2rem] bg-muted/20 border border-border/50 flex flex-col gap-3">
                  <RefreshCcw className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-1">Verified Protocol</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Secured via end-to-end cryptographic verification.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-20 border-t border-border pt-20">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
              <div className="h-8 w-2 rounded-full bg-primary" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">Technical Specifications</h2>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed font-medium">
             {product.description || "The provider has not supplied detailed technical specifications for this unit."}
          </p>
        </div>

        <div className="space-y-12">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h2 className="text-3xl font-black text-foreground tracking-tight">Agent Verifications</h2>
              </div>
              {canReview && !showReviewForm && (
                  <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] h-10 px-6" onClick={() => setShowReviewForm(true)}>
                      Post Verdict
                  </Button>
              )}
          </div>

          {reviewStats && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center p-12 rounded-[3rem] bg-muted/20 border border-border/50">
                  <div className="md:col-span-4 text-center md:text-left space-y-3">
                        <div className="text-7xl font-black text-foreground tracking-tighter leading-none">{reviewStats.averageRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 pb-2">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("w-5 h-5", s <= Math.round(reviewStats.averageRating) ? "text-primary fill-primary" : "text-muted-foreground/30")} />)}
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{reviewStats.totalReviews} Total Verifications</p>
                  </div>
                  <div className="md:col-span-8 flex flex-col gap-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewStats.ratingCounts[star] || 0;
                          const pct = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                          return (
                              <div key={star} className="flex items-center gap-6">
                                  <span className="w-4 text-xs font-black text-muted-foreground">{star}</span>
                                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border/40">
                                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="w-10 text-xs font-black text-muted-foreground/50">{Math.round(pct)}%</span>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {showReviewForm && (
              <div className="p-10 rounded-[2.5rem] bg-card border-2 border-primary/20 animate-in slide-in-from-top-4 duration-500 space-y-8 shadow-2xl">
                  <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assign Rating</span>
                      <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} onClick={() => setNewRating(s)} className="group transition-transform active:scale-90">
                                  <Star className={cn("w-10 h-10 transition-all", s <= newRating ? "text-primary fill-primary scale-110" : "text-muted-foreground/20 group-hover:text-muted-foreground/40")} />
                              </button>
                          ))}
                      </div>
                  </div>
                  <textarea
                      className="w-full h-40 p-8 rounded-[2rem] bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/40 text-lg font-medium outline-none focus:border-primary/50 transition-colors resize-none shadow-inner"
                      placeholder="Post your detailed assessment of this asset..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-4">
                      <Button size="lg" onClick={handleSubmitReview} disabled={newRating === 0 || !newComment.trim() || submittingReview} className="rounded-2xl bg-primary px-10 h-14 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-95">
                          {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Verdict"}
                      </Button>
                      <Button variant="ghost" onClick={() => { setShowReviewForm(false); setNewRating(0); setNewComment(""); }} className="rounded-2xl px-8 h-14 font-bold text-muted-foreground uppercase text-xs tracking-widest">Abort</Button>
                  </div>
              </div>
          )}

          <div className="grid gap-6">
              {reviews.length === 0 ? (
                  <div className="py-24 text-center bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/40">
                        <Star className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
                        <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Registry Clean: No Verdicts Recorded</p>
                  </div>
              ) : (
                  reviews.map((rev) => (
                      <div key={rev.id} className="p-10 rounded-[2.5rem] bg-card border border-border/60 hover:border-primary/30 transition-all group">
                          <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-xl font-black text-primary border border-border/40 shadow-inner">
                                      {rev.user?.userDetails?.firstName?.[0] || rev.user?.username?.[0] || "?"}
                                  </div>
                                  <div>
                                      <p className="font-black text-foreground text-lg tracking-tight">{rev.user?.userDetails?.firstName ? `${rev.user.userDetails.firstName} ${rev.user.userDetails.lastName || ""}` : rev.user?.username || "Verified Agent"}</p>
                                      <div className="flex items-center gap-4 mt-1">
                                          <div className="flex gap-0.5">
                                              {[1,2,3,4,5].map(s => <Star key={s} className={cn("w-3.5 h-3.5", s <= rev.rating ? "text-primary fill-primary" : "text-muted-foreground/20")} />)}
                                          </div>
                                          <div className="w-1 h-1 rounded-full bg-border" />
                                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              </div>
                              <Badge variant="outline" className="border-border text-muted-foreground uppercase font-black tracking-widest text-[9px] px-3 py-1 rounded-lg">Verified Rank</Badge>
                          </div>
                          <p className="text-lg text-muted-foreground leading-relaxed font-medium pl-1">{rev.comment}</p>
                      </div>
                  ))
              )}
          </div>
        </div>
      </div>

      <PinDialog 
        open={showPin} 
        onOpenChange={setShowPin} 
        onConfirm={handlePinSubmit} 
        isProcessing={isProcessing} 
        description={`Authorizing acquisition of ${product.name} for ${Number(product.price) * quantity} B-Coins.`}
      />
    </DashboardContent>
  );
}

