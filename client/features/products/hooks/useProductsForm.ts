import { useState, useCallback } from "react";
import { Product, marketApi } from "@/services/api/client";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  images: string[];
  productType: "digital" | "physical";
  fileUrl: string;
  fileType: string;
}

interface UseProductsFormProps {
  onSuccess?: () => void;
}

export function useProductsForm({ onSuccess }: UseProductsFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback((): ProductFormData => ({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    images: [],
    productType: "physical",
    fileUrl: "",
    fileType: "",
  }), []);

  const validateForm = useCallback((form: ProductFormData, productType: "digital" | "physical"): boolean => {
    if (!form.name || !form.price) {
      toast.error("Please fill in required fields");
      return false;
    }
    if (productType === "physical" && !form.stock) {
      toast.error("Stock is required for physical products");
      return false;
    }
    return true;
  }, []);

  const submitAddProduct = useCallback(async (form: ProductFormData): Promise<boolean> => {
    if (!validateForm(form, form.productType)) return false;

    setIsSubmitting(true);
    try {
      const response = await marketApi.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: form.productType === "physical" ? Number(form.stock) : 999999,
        imageUrl: form.imageUrl,
        productType: form.productType,
        fileUrl: form.fileUrl,
        fileType: form.fileType,
        metadata: { category: "product", images: form.images }
      });

      if (response.success) {
        toast.success("Product created", { 
          description: form.productType === "digital" 
            ? "Your digital product is ready for review." 
            : "Your product is pending approval." 
        });
        onSuccess?.();
        return true;
      } else {
        toast.error(response.message || "Failed to create product");
        return false;
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSuccess]);

  const submitUpdateProduct = useCallback(async (form: ProductFormData, product: Product): Promise<boolean> => {
    if (!validateForm(form, form.productType)) return false;

    setIsSubmitting(true);
    try {
      const data: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: form.productType === "physical" ? Number(form.stock) : 999999,
        imageUrl: form.imageUrl,
        metadata: { images: form.images },
      };

      if (form.productType === "digital" && form.fileUrl) {
        data.metadata = {
          ...(product.metadata || {}),
          ...data.metadata,
          fileUrl: form.fileUrl,
          fileType: form.fileType || "file",
        };
      }

      const isPending = product.approval === 'pending' || product.approval === 'draft';
      const response = isPending 
        ? await marketApi.updateProduct(product.id, data)
        : await marketApi.requestEditReview(product.id, data);

      if (response.success) {
        toast.success(isPending ? "Product updated" : "Edit review requested");
        onSuccess?.();
        return true;
      } else {
        toast.error(response.message || "Failed to update product");
        return false;
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSuccess]);

  const deleteProduct = useCallback(async (id: number, onSuccess?: () => void): Promise<boolean> => {
    try {
      const response = await marketApi.deleteProduct(id);
      if (response.success) {
        toast.success("Product deleted");
        onSuccess?.();
        return true;
      } else {
        toast.error(response.message || "Failed to delete product");
        return false;
      }
    } catch (error) {
      toast.error("Failed to delete product");
      return false;
    }
  }, []);

  return {
    isSubmitting,
    resetForm,
    validateForm,
    submitAddProduct,
    submitUpdateProduct,
    deleteProduct,
  };
}