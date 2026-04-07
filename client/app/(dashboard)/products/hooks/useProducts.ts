import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { uploadFile, isUploading, progress } = useCloudinaryUpload();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    productType: "physical" as "digital" | "physical",
    fileUrl: "",
    fileType: "",
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
    setForm({ name: "", description: "", price: "", stock: "", imageUrl: "", productType: "physical", fileUrl: "", fileType: "" });
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
      productType: (product.productType as "digital" | "physical") || "physical",
      fileUrl: product.fileUrl || "",
      fileType: product.fileType || "",
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setForm((prev) => ({
        ...prev,
        fileUrl: url,
        fileType: file.type || file.name.split('.').pop() || "unknown"
      }));
      toast.success("Digital file uploaded successfully");
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file");
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error("Please enter a valid price");
      return false;
    }

    if (form.productType === 'physical') {
      if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
        toast.error("Please enter a valid stock amount for physical products");
        return false;
      }
    } else if (form.productType === 'digital') {
      if (!form.fileUrl) {
        toast.error("Digital products must have a file uploaded");
        return false;
      }
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const productData: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        productType: form.productType,
      };

      if (form.productType === 'physical') {
        productData.stock = Number(form.stock);
      } else {
        productData.fileUrl = form.fileUrl;
        productData.fileType = form.fileType;
        productData.stock = 999999; // Unlimited for digital
      }

      const response = await marketApi.createProduct(productData);

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
    if (!selectedProduct || !validateForm()) return;

    try {
      setIsSubmitting(true);

      const productData: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        productType: form.productType,
      };

      if (form.productType === 'physical') {
        productData.stock = Number(form.stock);
      } else {
        productData.fileUrl = form.fileUrl;
        productData.fileType = form.fileType;
      }

      const response = await marketApi.updateProduct(Number(selectedProduct.id), productData);

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

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsSubmitting(true);
      const response = await marketApi.deleteProduct(deletingId);

      if (response.success) {
        toast.success("Product deleted successfully");
        setShowDeleteAlert(false);
        setDeletingId(null);
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
    products,
    loading,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    selectedProduct,
    isSubmitting,
    showDeleteAlert,
    setShowDeleteAlert,
    deletingId,
    setDeletingId,
    form,
    setForm,
    isUploading,
    progress,
    handleEditClick,
    handleImageUpload,
    handleFileUpload,
    handleCreate,
    handleUpdate,
    handleDelete,
    resetForm
  };
}
