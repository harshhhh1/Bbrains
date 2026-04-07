import { useState, useEffect } from "react";
import { toast } from "sonner";
import { themeApi, Product } from "@/services/api/client";

export function useThemes() {
  const [themes, setThemes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [buying, setBuying] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response = await themeApi.getThemes(page, limit);
      if (response.success && response.data) {
        setThemes(response.data || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [page]);

  const filteredThemes = themes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  const handleBuyNow = async () => {
    if (!selectedTheme) return;

    if (pin.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN");
      return;
    }

    try {
      setBuying(true);
      const response = await themeApi.purchaseTheme(Number(selectedTheme.id), pin);

      if (response.success) {
        toast.success("Theme purchased successfully!");
        setShowBuyDialog(false);
        setPin("");
        fetchThemes();
      } else {
        throw new Error(response.error || "Purchase failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase theme");
    } finally {
      setBuying(false);
    }
  };

  const handlePreview = (theme: Product) => {
    setSelectedTheme(theme);
    setShowPreview(true);
  };

  const handleBuyClick = (theme: Product) => {
    setSelectedTheme(theme);
    setShowBuyDialog(true);
  };

  return {
    themes,
    loading,
    searchQuery,
    setSearchQuery,
    selectedTheme,
    setSelectedTheme,
    showPreview,
    setShowPreview,
    showBuyDialog,
    setShowBuyDialog,
    pin,
    setPin,
    buying,
    page,
    setPage,
    total,
    totalPages,
    filteredThemes,
    handleBuyNow,
    handlePreview,
    handleBuyClick
  };
}
