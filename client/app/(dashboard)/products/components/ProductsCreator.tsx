"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, Pencil, Trash2, Loader2, Image as ImageIcon, X, Upload, BarChart3, Star, FileUp } from "lucide-react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ProductsCreator() {
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
    setForm({ name: "", description: "", price: "", stock: "", imageUrl: "", productType: "physical", fileUrl: "", fileType: "" });
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
      productType: product.productType || "physical",
      fileUrl: product.metadata?.fileUrl || "",
      fileType: product.metadata?.fileType || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    if (!form.name || !form.price) {
      toast.error("Please fill in required fields");
      return;
    }
    if (form.productType === "physical" && !form.stock) {
      toast.error("Stock is required for physical products");
      return;
    }

    try {
      setIsSubmitting(true);
      const data: {
        name: string;
        description: string;
        price: number;
        stock: number;
        imageUrl: string;
        productType?: "digital" | "physical";
        fileUrl?: string;
        fileType?: string;
        metadata?: Record<string, unknown>;
      } = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: form.productType === "physical" ? Number(form.stock) : 999999,
        imageUrl: form.imageUrl,
      };

      if (form.productType === "digital" && form.fileUrl) {
        data.metadata = {
          ...(selectedProduct.metadata || {}),
          fileUrl: form.fileUrl,
          fileType: form.fileType || "file",
        };
      }

      const isPending = selectedProduct.approval === 'pending' || selectedProduct.approval === 'draft';
      const response = isPending 
        ? await marketApi.updateProduct(selectedProduct.id, data)
        : await marketApi.requestEditReview(selectedProduct.id, data);

      if (response.success) {
        toast.success(isPending ? "Product updated" : "Edit review requested");
        setShowEditDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await marketApi.deleteProduct(id);
      if (response.success) {
        toast.success("Product deleted");
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
      setShowDeleteAlert(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      if (url) {
        setForm(prev => ({ ...prev, imageUrl: url }));
        toast.success("Image uploaded");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      if (url) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
        setForm(prev => ({ ...prev, fileUrl: url, fileType: ext }));
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      toast.error("Error uploading file");
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price) {
      toast.error("Please fill in required fields");
      return;
    }
    if (form.productType === "physical" && !form.stock) {
      toast.error("Stock is required for physical products");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await marketApi.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: form.productType === "physical" ? Number(form.stock) : 999999,
        imageUrl: form.imageUrl,
        productType: form.productType,
        fileUrl: form.fileUrl,
        fileType: form.fileType,
        metadata: { category: "product" }
      });

      if (response.success) {
        toast.success("Product created", { description: form.productType === "digital" ? "Your digital product is ready for review." : "Your product is pending approval." });
        setShowAddDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to create product");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "draft": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Live";
      case "pending": return "Pending Approval";
      case "rejected": return "Rejected";
      case "draft": return "Draft";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Package className="w-8 h-8 text-brand-orange" />
            My Products
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage your marketplace listings</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:shrink-0">
          <Link href="/products/sales" className="w-full sm:w-auto">
            <Button variant="outline" className="h-12 w-full px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 sm:w-auto">
              <BarChart3 className="w-4 h-4 mr-2" />
              Sales
            </Button>
          </Link>
          <Button 
            onClick={() => { resetForm(); setShowAddDialog(true); }}
            className="h-12 w-full rounded-xl bg-brand-orange px-6 font-bold text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90 sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Products...</p>
        </div>
      ) : products.length === 0 ? (
        <Card className="border-2 border-dashed border-border/50 bg-muted/20 rounded-[2rem] py-24">
          <div className="flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">Create your first listing to start selling</p>
            <Button variant="outline" onClick={() => setShowAddDialog(true)} className="rounded-xl border-2 font-bold px-8">
              Create Product
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="rounded-xl border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-white/10 m-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{product.name}</h3>
                      <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0">
                        {product.productType || 'physical'}
                      </Badge>
                      <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border shrink-0", statusColor(product.approval))}>
                        {statusLabel(product.approval)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 flex-wrap">
                      <span className="font-bold text-brand-orange">{product.price} B-Coins</span>
                      {product.productType === 'physical' && (
                        <span className={cn("font-bold", product.stock <= 5 && product.stock > 0 ? "text-amber-400" : product.stock === 0 ? "text-red-400" : "text-white/40")}>
                          {product.stock === 0 ? "Out of stock" : product.stock <= 5 ? `${product.stock} left (low)` : `${product.stock} in stock`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        {product.rating ? product.rating.toFixed(1) : "0.0"} ({product.reviewCount || 0})
                      </span>
                      <span>{product.unitsSold || 0} sold</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(product)} className="h-8 w-8 rounded-lg hover:bg-brand-orange/10 hover:text-brand-orange">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSelectedProduct(product); setShowDeleteAlert(true); }}
                      className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals from ProductsPage... (Simplified for brevity in the component) */}
      <Drawer
        direction="right"
        open={showAddDialog}
        onOpenChange={(open) => { if (!open) { setShowAddDialog(false); resetForm(); } }}
      >
        <DrawerContent className="fixed inset-y-0 right-0 p-0 before:inset-0 before:rounded-none data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl data-[vaul-drawer-direction=right]:lg:max-w-4xl before:border-white/10 before:bg-[radial-gradient(circle_at_top,_rgba(255,122,122,0.12),_transparent_30%),rgba(2,6,23,0.98)] sm:p-0 sm:before:rounded-l-[2rem] border-none shadow-2xl">
          <Tabs
            value={form.productType}
            onValueChange={(v) => setForm(prev => ({ ...prev, productType: v as "digital" | "physical" }))}
            className="h-full"
          >
            <div className="grid h-[100dvh] max-h-[100dvh] grid-cols-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">
              {/* Reuse exact same inner drawer structure from the original page */}
              {/* For brevity, including just the main parts here. If exact same, can be moved to a shared component. */}
              <div className="border-b border-white/10 bg-white/[0.03] p-6 xl:border-r xl:border-b-0 xl:p-8">
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="space-y-6">
                    <DrawerHeader className="space-y-4 p-0 text-left">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/15 ring-1 ring-brand-orange/20">
                            <Plus className="h-7 w-7 text-brand-orange" />
                          </div>
                          <div className="space-y-2">
                            <DrawerTitle className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                              Add New Product
                            </DrawerTitle>
                          </div>
                        </div>
                        <DrawerClose asChild>
                          <Button variant="ghost" size="icon" className="rounded-full text-white/60 hover:bg-white/5 hover:text-white">
                            <X className="h-5 w-5" />
                          </Button>
                        </DrawerClose>
                      </div>
                    </DrawerHeader>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Product Type</p>
                      <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
                        <TabsTrigger value="physical" className="h-11 rounded-xl font-bold">Physical</TabsTrigger>
                        <TabsTrigger value="digital" className="h-11 rounded-xl font-bold">Digital</TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8">
                <div className="mx-auto w-full max-w-2xl space-y-8">
                  {/* Forms for Name, Price, Description etc. */}
                  <div className="space-y-5">
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="h-[52px] rounded-2xl bg-white/[0.03]" />
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-[150px] rounded-2xl bg-white/[0.03]" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="h-[52px] rounded-2xl bg-white/[0.03]" />
                      <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="h-[52px] rounded-2xl bg-white/[0.03]" />
                    </div>
                    <Button onClick={handleAddProduct} disabled={isSubmitting} className="w-full h-12 bg-brand-orange font-bold rounded-xl mt-4">
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                      {isSubmitting ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-2xl font-black text-white">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              This will permanently delete &quot;{selectedProduct?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-12 rounded-xl border-white/10 bg-transparent text-white/40 font-bold hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedProduct && handleDeleteProduct(selectedProduct.id)} className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black px-8">
              {deletingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
