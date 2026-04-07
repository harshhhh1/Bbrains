import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { marketApi, Product, reviewApi, Review, ReviewStats } from "@/services/api/client";

export function useProductDetail() {
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
    if (product.metadata?.previewImages) imgs.push(...product.metadata.previewImages);
    return [...new Set(imgs)];
  }, [product]);

  useEffect(() => {
    async function fetchProduct(pid: number) {
      try {
        setLoading(true);
        const resp: any = await marketApi.getProduct(pid);
        const data = resp?.data ?? resp;
        if (data) {
          setProduct(data as Product);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(productId)) {
      fetchProduct(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (!isNaN(productId)) {
      loadReviews(productId);
    }
  }, [productId]);

  const loadReviews = async (pid: number) => {
    try {
      const resp = await reviewApi.getProductReviews(pid);
      if (resp.success && resp.data) {
        setReviews(resp.data.reviews);
        setReviewStats(resp.data.stats);
        setCanReview(resp.data.canReview);
        setAlreadyOwned(resp.data.hasPurchased || false);
      }
    } catch (e) {
      console.error("Failed to load reviews", e);
    }
  };

  const handlePurchase = async (pin: string) => {
    try {
      setIsProcessing(true);
      const res = await marketApi.purchaseProduct({
        productId,
        quantity,
        pin,
      });
      if (res.success) {
        toast.success("Purchase authorized successfully.");
        setShowPin(false);
        router.push("/market/library");
      } else {
        toast.error(res.error || "Authorization failed.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to process authorization.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newRating) {
      toast.error("Please provide a rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewApi.submitReview({
        productId,
        rating: newRating,
        comment: newComment.trim(),
      });

      if (res.success) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setNewRating(0);
        setNewComment("");
        loadReviews(productId);
      } else {
        toast.error(res.error || "Failed to submit review.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return {
    router,
    productId,
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
  };
}
