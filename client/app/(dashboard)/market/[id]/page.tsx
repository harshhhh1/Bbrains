"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Star, ShoppingCart, Package, ArrowLeft, X, 
  ChevronLeft, ChevronRight, AlertTriangle,
  Heart, Share2, ShieldCheck, Truck, RefreshCcw, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

import { encodeImageUrl } from "./utils";
import { useProductDetail } from "./hooks/useProductDetail";
import { PinDialog } from "./components";

export default function MarketProductDetail() {
  const {
    router,
    product,
    loading,
    selectedIndex,
    setSelectedIndex,
    quantity,
    setQuantity,
    showPin,
    setShowPin,
    isProcessing,
    reviews,
    reviewStats,
    canReview,
    showReviewForm,
    setShowReviewForm,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    submittingReview,
    alreadyOwned,
    allImages,
    handlePurchase,
    handleSubmitReview
  } = useProductDetail();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <Package className="h-16 w-16 mb-4 text-muted-foreground/30" />
        <h2 className="mb-2 text-2xl font-black tracking-tight text-white">Item not found</h2>
        <p className="text-white/60 mb-6 font-medium">The requested marketplace item could not be found or has been removed.</p>
        <Link href="/market">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Market
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-in fade-in duration-500">
      <Link href="/market" className="inline-flex items-center text-sm font-bold text-white/60 hover:text-brand-orange mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] border-2 border-white/10 bg-slate-900/50 shadow-2xl group">
            {allImages.length > 0 ? (
              <>
                <Image
                  src={encodeImageUrl(allImages[selectedIndex])}
                  alt={product.name || "Product preview"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />

                {allImages.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-md text-white border-none hover:bg-brand-orange"
                      onClick={() => setSelectedIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-md text-white border-none hover:bg-brand-orange"
                      onClick={() => setSelectedIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}

                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <Badge className="bg-brand-orange text-white font-black px-3 py-1 shadow-lg border-none text-xs uppercase tracking-widest">
                    {product.type === "digital" ? "Digital Download" : "Physical Item"}
                  </Badge>
                  {product.category && (
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/20 font-bold px-3 py-1 shadow-lg text-xs uppercase tracking-widest">
                      {product.category}
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-white/10" />
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-2xl border-2 transition-all hover:opacity-100",
                    i === selectedIndex
                      ? "border-brand-orange opacity-100 ring-2 ring-brand-orange/50 ring-offset-2 ring-offset-background"
                      : "border-white/10 opacity-50 hover:border-white/30"
                  )}
                  onClick={() => setSelectedIndex(i)}
                >
                  <Image
                    src={encodeImageUrl(img)}
                    alt={`Thumbnail ${i}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm font-medium text-white/50">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-brand-orange">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={cn("w-4 h-4", star <= Math.round(reviewStats?.averageRating || product.rating || 0) ? "fill-brand-orange" : "text-white/20")} />
                    ))}
                  </div>
                  <span className="text-white font-bold ml-1">{reviewStats?.averageRating?.toFixed(1) || product.rating?.toFixed(1) || "New"}</span>
                  <span>({reviewStats?.totalReviews || product.reviews || 0} reviews)</span>
                </div>
                <span>•</span>
                <span>{product.purchases || 0} sold</span>
              </div>
            </div>

            <div className="py-6 border-y border-white/10 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-widest text-brand-orange">Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter text-white">{product.price}</span>
                  <span className="text-xl font-bold text-white/50">XP</span>
                </div>
              </div>

              {product.type === "physical" && product.stock !== undefined && (
                <div className="text-right">
                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="font-bold text-sm">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-black uppercase tracking-widest text-sm text-white/50">Description</h3>
              <p className="text-lg leading-relaxed text-white/80 font-medium">
                {product.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-8 h-8 text-brand-mint" />
                <div>
                  <p className="text-sm font-bold text-white">Secure</p>
                  <p className="text-xs font-medium text-white/50">PIN protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <RefreshCcw className="w-8 h-8 text-brand-blue" />
                <div>
                  <p className="text-sm font-bold text-white">Instant</p>
                  <p className="text-xs font-medium text-white/50">Auto-delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
            {product.type === "physical" && (
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-white/50">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-2xl border-2 border-white/10 bg-black/20 p-1">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="h-12 w-12 rounded-xl text-white hover:bg-white/10 hover:text-white"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="w-16 text-center text-xl font-black">{quantity}</span>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                      disabled={quantity >= (product.stock || 10)}
                      className="h-12 w-12 rounded-xl text-white hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/50">Total: <span className="font-bold text-white">{(product.price || 0) * quantity} XP</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setShowPin(true)}
                disabled={product.type === "physical" && (product.stock === 0)}
                className="flex-1 h-16 rounded-[1.5rem] bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-lg uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] transition-all hover:scale-[1.02]"
              >
                <ShoppingCart className="mr-3 w-6 h-6" />
                {product.type === "physical" && product.stock === 0 ? "Out of Stock" : "Purchase Now"}
              </Button>
              <Button variant="outline" size="icon" className="h-16 w-16 shrink-0 rounded-[1.5rem] border-2 border-white/10 bg-transparent hover:bg-white/5 hover:text-brand-orange">
                <Heart className="w-6 h-6" />
              </Button>
              <Button variant="outline" size="icon" className="h-16 w-16 shrink-0 rounded-[1.5rem] border-2 border-white/10 bg-transparent hover:bg-white/5 hover:text-brand-blue">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-white/10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">Customer Reviews</h2>
            <p className="text-white/50 font-medium mt-1">See what others are saying about this item</p>
          </div>

          {canReview && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="rounded-xl bg-white text-black hover:bg-white/90 font-bold"
            >
              Write a Review
            </Button>
          )}
        </div>

        {showReviewForm && (
          <Card className="mb-8 border-white/10 bg-white/5 rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-white">Rate & Review</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowReviewForm(false)} className="rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-white/50" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold uppercase tracking-widest text-white/50 mb-3 block">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-2 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star className={cn("w-10 h-10", star <= newRating ? "fill-brand-orange text-brand-orange" : "text-white/20")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold uppercase tracking-widest text-white/50 mb-3 block">Your Review (Optional)</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What did you like or dislike?"
                    className="w-full min-h-[120px] rounded-2xl border-2 border-white/10 bg-black/20 p-4 text-white placeholder:text-white/30 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={!newRating || submittingReview}
                    className="rounded-xl bg-brand-orange text-white font-bold px-8 py-6 h-auto"
                  >
                    {submittingReview ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Submit Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white/80">
                      {review.user?.userDetails?.firstName?.[0] || review.user?.username?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {review.user?.userDetails?.firstName
                          ? `${review.user.userDetails.firstName} ${review.user.userDetails.lastName?.[0] || ''}.`
                          : review.user?.username || 'User'}
                      </p>
                      <p className="text-xs font-medium text-white/40">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={cn("w-3.5 h-3.5", star <= review.rating ? "fill-brand-orange text-brand-orange" : "text-white/20")} />
                    ))}
                  </div>
                </div>
                {review.comment ? (
                  <p className="text-white/70 font-medium text-sm leading-relaxed">{review.comment}</p>
                ) : (
                  <p className="text-white/30 italic text-sm">No comment provided.</p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
              <Star className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/50 font-medium text-lg">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>

      <PinDialog
        open={showPin}
        onOpenChange={setShowPin}
        onConfirm={handlePurchase}
        isProcessing={isProcessing}
      />
    </div>
  );
}

// Needed to avoid ReferenceError from Plus/Minus not being imported
import { Plus, Minus } from "lucide-react";
