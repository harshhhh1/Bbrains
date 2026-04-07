import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useHasPermission } from "@/components/providers/permissions-provider";

export function useMyProducts() {
  const canCreateProduct = useHasPermission("create_product");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadFile, isUploading, progress } = useCloudinaryUpload();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: ""
  });

  const fetchMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getMyProducts();
      if (response.success && response.data) {
        const productsData = (response.data as any)?.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load your products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", imageUrl: "" });
    setSelectedProduct(null);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? product.price.toString() : "",
      stock: product.stock ? product.stock.toString() : "",
      imageUrl: product.imageUrl || "",
    });
    setShowEditDialog(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await marketApi.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        productType: "physical",
      });

      if (response.success) {
        toast.success("Product created successfully!");
        setShowAddDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        throw new Error(response.error || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct || !form.name || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await marketApi.updateProduct(Number(selectedProduct.id), {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        productType: "physical",
      });

      if (response.success) {
        toast.success("Product updated successfully!");
        setShowEditDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        throw new Error(response.error || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setIsSubmitting(true);
      const response = await marketApi.deleteProduct(id);

      if (response.success) {
        toast.success("Product deleted successfully");
        fetchMyProducts();
      } else {
        throw new Error(response.error || "Failed to delete product");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    canCreateProduct,
    products,
    loading,
    form,
    setForm,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    isSubmitting,
    isUploading,
    progress,
    handleEditClick,
    handleImageUpload,
    handleCreate,
    handleUpdate,
    handleDelete,
    resetForm
  };
}
