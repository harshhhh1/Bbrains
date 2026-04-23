"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Package, Plus, Pencil, Loader2, Image as ImageIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import Image from "next/image";
import { DashboardContent } from "@/components/dashboard-content";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/components/providers/permissions-provider";

export default function MyProductsPage() {
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
    imageUrl: "",
  });

  const fetchMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getMyProducts();
      if (response.success && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
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
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.image || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
      };

      const isPending = selectedProduct.approval === "pending";
      const response = isPending
        ? await marketApi.updateProduct(selectedProduct.id, data)
        : await marketApi.requestEditReview(selectedProduct.id, data);

      if (response.success) {
        toast.success(isPending ? "Product updated" : "Edit review requested", {
          description: isPending ? "Your changes have been saved." : "An admin will review your changes.",
        });
        setShowEditDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to update product");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      if (url) {
        setForm((prev) => ({ ...prev, imageUrl: url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Error uploading image");
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill in all required fields");
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
        metadata: { category: "product" },
      });

      if (response.success) {
        toast.success("Product created", { description: "Your product is pending approval." });
        setShowAddDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to create product");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <DashboardContent>
      <div className="animate-in space-y-8 fade-in duration-500">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-foreground">
              <Package className="h-8 w-8 text-primary" />
              Inventory Control
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Manage and track your campus marketplace listings</p>
          </div>
          {canCreateProduct && (
            <Button
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              className="h-12 rounded-xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
            >
              <Plus className="mr-2 h-5 w-5" /> List New Product
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="animate-pulse text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <Card className="rounded-[2rem] border-2 border-dashed border-border/50 bg-muted/20 py-24">
            <div className="flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                <Package className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="mb-2 text-xl font-bold">No Products Found</h3>
              <p className="mb-8 max-w-sm text-muted-foreground">You haven&apos;t listed any products yet. Start selling to the campus community today!</p>
              {canCreateProduct && (
                <Button variant="outline" onClick={() => setShowAddDialog(true)} className="rounded-xl border-2 px-8 font-bold">
                  Create Your First Listing
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-border bg-muted backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden border-border bg-muted/30 p-4">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-muted-foreground/20" />
                  )}
                  <div className="absolute right-4 top-4">
                    <Badge className={cn("border-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg", statusColor(product.approval))}>
                      {product.approval}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="line-clamp-1 text-lg font-black text-foreground transition-colors group-hover:text-primary">{product.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(product)}
                      className="h-8 w-8 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 min-h-[2rem] line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">{product.description}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</span>
                      <span className="text-xl font-black text-primary">{product.price} <span className="text-[10px] opacity-60">B-Coins</span></span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</span>
                      <span className="text-lg font-black text-foreground">{product.stock}</span>
                    </div>
                  </div>

                  {product.approval === "rejected" && product.metadata?.rejectionReason && (
                    <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-rose-500">Reason for Rejection</p>
                      <p className="text-xs font-medium leading-relaxed text-rose-400/90">
                        {product.metadata.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Drawer open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); resetForm(); } }} direction="right">
          <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-border before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
            <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
              <DrawerHeader className="border-b border-border/60 p-6 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DrawerTitle className="text-xl font-black tracking-tight">List New Asset</DrawerTitle>
                      <DrawerDescription className="font-medium text-muted-foreground">Provide specifications for your marketplace entry</DrawerDescription>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Representation</label>
                  <div className={cn(
                    "group/img relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-border bg-card transition-all",
                    isUploading && "animate-pulse border-primary/30"
                  )}>
                    {form.imageUrl ? (
                      <>
                        <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                          <Button variant="destructive" size="icon" onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))} className="rounded-full">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{progress}%</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground/30" />
                        <label className="cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <span className="rounded-xl border border-border bg-muted px-4 py-2 text-xs font-bold text-muted-foreground/70 transition-colors hover:bg-muted">
                            Upload Image
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Asset Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Premium Study Notes"
                      className="h-12 rounded-xl border-border bg-muted font-bold transition-all placeholder:text-muted-foreground/30 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Detail the capabilities and quality of your asset..."
                      className="min-h-[100px] resize-none rounded-xl border-border bg-muted font-medium transition-all placeholder:text-muted-foreground/30 focus:border-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Price (B-Coins)</label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="0"
                        className="h-12 rounded-xl border-border bg-muted font-black transition-all focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Available Stock</label>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="0"
                        className="h-12 rounded-xl border-border bg-muted font-black transition-all focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DrawerFooter className="border-t border-border/60 p-6">
                <Button
                  onClick={handleAddProduct}
                  disabled={isSubmitting || isUploading}
                  className="w-full h-12 rounded-xl bg-primary px-8 font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Finalize Listing
                    </>
                  )}
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer open={showEditDialog} onOpenChange={(open) => { if (!open) { setShowEditDialog(false); resetForm(); } }} direction="right">
          <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-border before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
            <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
              <DrawerHeader className="border-b border-border/60 p-6 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Pencil className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DrawerTitle className="text-xl font-black tracking-tight">
                        {selectedProduct?.approval === "approved" ? "Request Edit Review" : "Update Asset"}
                      </DrawerTitle>
                      <DrawerDescription className="font-medium text-muted-foreground">
                        {selectedProduct?.approval === "approved"
                          ? "Approved products require admin review for updates."
                          : "Modify specifications for your marketplace entry"}
                      </DrawerDescription>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Representation</label>
                  <div className={cn(
                    "group/img relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-border bg-card transition-all",
                    isUploading && "animate-pulse border-primary/30"
                  )}>
                    {form.imageUrl ? (
                      <>
                        <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                          <Button variant="destructive" size="icon" onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))} className="rounded-full">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{progress}%</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground/30" />
                        <label className="cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <span className="rounded-xl border border-border bg-muted px-4 py-2 text-xs font-bold text-muted-foreground/70 transition-colors hover:bg-muted">
                            Upload Image
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Asset Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Premium Study Notes"
                      className="h-12 rounded-xl border-border bg-muted font-bold transition-all placeholder:text-muted-foreground/30 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Detail the capabilities and quality of your asset..."
                      className="min-h-[100px] resize-none rounded-xl border-border bg-muted font-medium transition-all placeholder:text-muted-foreground/30 focus:border-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Price (B-Coins)</label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="0"
                        className="h-12 rounded-xl border-border bg-muted font-black transition-all focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Available Stock</label>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="0"
                        className="h-12 rounded-xl border-border bg-muted font-black transition-all focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DrawerFooter className="border-t border-border/60 p-6">
                <Button
                  onClick={handleUpdateProduct}
                  disabled={isSubmitting || isUploading}
                  className="w-full h-12 rounded-xl bg-primary px-8 font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {selectedProduct?.approval === "approved" ? "Submit Review Request" : "Save Changes"}
                    </>
                  )}
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </DashboardContent>
  );
}
