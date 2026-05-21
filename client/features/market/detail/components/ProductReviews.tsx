"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveApiFileUrl } from "@/lib/file-url";
import { reviewApi, Review, ReviewStats } from "@/services/api/client";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  reviewStats: ReviewStats | null;
  canReview: boolean;
  onReviewSubmitted: () => void;
}

export function ProductReviews({
  productId,
  reviews,
  reviewStats,
  canReview,
  onReviewSubmitted,
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async () => {
    if (newRating === 0 || !newComment.trim()) return;
    try {
      setSubmittingReview(true);
      const resp = await reviewApi.createReview(productId, {
        rating: newRating,
        comment: newComment,
      });
      if (resp.success) {
        toast.success("Review posted");
        setShowReviewForm(false);
        setNewRating(0);
        setNewComment("");
        onReviewSubmitted();
      }
    } catch (e) {
      toast.error("Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-2 rounded-full bg-primary" />
          <h2 className="text-3xl font-black text-foreground tracking-tight">User Reviews</h2>
        </div>
        {canReview && !showReviewForm && (
          <Button
            variant="outline"
            className="rounded-xl border-primary text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] h-10 px-6"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {reviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center p-12 rounded-[3rem] bg-muted/20 border border-border/50">
          <div className="md:col-span-4 text-center md:text-left space-y-3">
            <div className="text-7xl font-black text-foreground tracking-tighter leading-none">
              {reviewStats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1.5 pb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-5 h-5",
                    s <= Math.round(reviewStats.averageRating)
                      ? "text-primary fill-primary"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              {reviewStats.totalReviews} Total Reviews
            </p>
          </div>
          <div className="md:col-span-8 flex flex-col gap-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewStats.ratingCounts[star] || 0;
              const pct = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-6">
                  <span className="w-4 text-xs font-black text-muted-foreground">{star}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
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
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Rating</span>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewRating(s)}
                  className="group transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-all",
                      s <= newRating ? "text-primary fill-primary scale-110" : "text-muted-foreground/20 group-hover:text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="w-full h-40 p-8 rounded-[2rem] bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/40 text-lg font-medium outline-none focus:border-primary/50 transition-colors resize-none shadow-inner"
            placeholder="Share your thoughts on this product..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={handleSubmitReview}
              disabled={newRating === 0 || !newComment.trim() || submittingReview}
              className="rounded-2xl bg-primary px-10 h-14 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-95"
            >
              {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowReviewForm(false);
                setNewRating(0);
                setNewComment("");
              }}
              className="rounded-2xl px-8 h-14 font-bold text-muted-foreground uppercase text-xs tracking-widest"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <div className="py-24 text-center bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/40">
            <Star className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No reviews yet</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-10 rounded-[2.5rem] bg-card border border-border/60 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                  <Avatar className="w-14 h-14 rounded-2xl border border-border/40 shadow-inner flex items-center justify-center">
                    {rev.user?.userDetails?.avatar && (
                      <AvatarImage
                        src={resolveApiFileUrl(rev.user.userDetails.avatar)}
                        alt={rev.user?.username}
                        className="object-cover w-full h-full rounded-2xl"
                      />
                    )}
                    <AvatarFallback className="w-full h-full rounded-2xl bg-muted/50 flex items-center justify-center text-xl font-black text-primary">
                      {rev.user?.userDetails?.firstName?.[0] || rev.user?.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-foreground text-lg tracking-tight">
                      {rev.user?.userDetails?.firstName
                        ? `${rev.user.userDetails.firstName} ${rev.user.userDetails.lastName || ""}`
                        : rev.user?.username || "Verified Buyer"}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-3.5 h-3.5",
                              s <= rev.rating ? "text-primary fill-primary" : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground uppercase font-black tracking-widest text-[9px] px-3 py-1 rounded-lg"
                >
                  Verified Purchase
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium pl-1">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
