"use client";

import { useState, useEffect, useCallback } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader, Stack } from "@/components/layout/page-primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs } from "@/components/ui/tabs";
import { Package, Plus, Loader2, BarChart3, X, QrCode, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ProductCard } from "../components/ProductCard";
import { ProductForm } from "../components/ProductForm";
import { useProductsForm } from "../hooks/useProductsForm";

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

export function ProductsCreator() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const { isSubmitting, resetForm, submitAddProduct, submitUpdateProduct, deleteProduct } = useProductsForm({
    onSuccess: () => {
      setShowAddDialog(false);
      setShowEditDialog(false);
      resetForm();
      setSelectedProduct(null);
      fetchMyProducts();
    }
  });

  const [addForm, setAddForm] = useState<ProductFormData>(resetForm());
  const [editForm, setEditForm] = useState<ProductFormData>(resetForm());

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

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.image || "",
      images: product.images || [],
      productType: product.productType || "physical",
      fileUrl: product.metadata?.fileUrl || "",
      fileType: product.metadata?.fileType || "",
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setDeletingId(selectedProduct.id);
    const success = await deleteProduct(selectedProduct.id, () => {
      setShowDeleteAlert(false);
      setDeletingId(null);
      fetchMyProducts();
    });
    if (!success) {
      setDeletingId(null);
    }
  };

  return (
    <Stack gap="xl" className="animate-in fade-in duration-500">
      <PageHeader
        title="My Products"
        description="Manage your marketplace listings"
        titleClassName="text-3xl font-black tracking-tight"
        descriptionClassName="font-medium"
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:shrink-0">
          <Link href="/products/sales" className="w-full sm:w-auto">
            <Button variant="outline" className="h-12 w-full px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 sm:w-auto">
              <BarChart3 className="w-4 h-4 mr-2" />
              Sales
            </Button>
          </Link>
          <Button 
            variant="outline"
            onClick={() => setShowScanner(true)}
            className="h-12 w-full px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 sm:w-auto"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Scan QR
          </Button>
          <Button 
            onClick={() => { setAddForm(resetForm()); setShowAddDialog(true); }}
            className="h-12 w-full rounded-xl bg-brand-orange px-6 font-bold text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90 sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Product
          </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingState label="Loading Products..." className="py-32" iconClassName="size-10 text-brand-orange" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-10" />}
          title="No Products Yet"
          description="Create your first listing to start selling"
          className="rounded-[2rem] border-2 border-border/50 bg-muted/20 py-24"
          action={
            <Button variant="outline" onClick={() => { setAddForm(resetForm()); setShowAddDialog(true); }} className="rounded-xl border-2 font-bold px-8">
              Create Product
            </Button>
          }
        />
      ) : (
        <Stack gap="md">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </Stack>
      )}

      <Drawer
        direction="right"
        open={showAddDialog}
        onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setAddForm(resetForm()); } }}
      >
        <DrawerContent className="fixed inset-y-0 right-0 p-0 before:inset-0 before:rounded-none data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl data-[vaul-drawer-direction=right]:lg:max-w-4xl before:border-white/10 before:bg-[radial-gradient(circle_at_top,_rgba(255,122,122,0.12),_transparent_30%),rgba(2,6,23,0.98)] sm:p-0 sm:before:rounded-l-[2rem] border-none shadow-2xl">
          <div className="grid h-[100dvh] max-h-[100dvh] grid-cols-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">
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
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8">
              <div className="mx-auto w-full max-w-2xl">
                <ProductForm
                  mode="add"
                  initialForm={addForm}
                  onSubmit={async (form) => {
                    setAddForm(form);
                    await submitAddProduct(form);
                  }}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        direction="right"
        open={showEditDialog}
        onOpenChange={(open) => { if (!open) { setShowEditDialog(false); setEditForm(resetForm()); } }}
      >
        <DrawerContent className="fixed inset-y-0 right-0 p-0 before:inset-0 before:rounded-none data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl data-[vaul-drawer-direction=right]:lg:max-w-4xl before:border-white/10 before:bg-[radial-gradient(circle_at_top,_rgba(255,122,122,0.12),_transparent_30%),rgba(2,6,23,0.98)] sm:p-0 sm:before:rounded-l-[2rem] border-none shadow-2xl">
          <div className="grid h-[100dvh] max-h-[100dvh] grid-cols-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="border-b border-white/10 bg-white/[0.03] p-6 xl:border-r xl:border-b-0 xl:p-8">
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-6">
                  <DrawerHeader className="space-y-4 p-0 text-left">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/20">
                          <Plus className="h-7 w-7 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                          <DrawerTitle className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                            Edit Product
                          </DrawerTitle>
                          <DrawerDescription className="text-white/40 font-medium">
                            Update details for &quot;{selectedProduct?.name}&quot;
                          </DrawerDescription>
                        </div>
                      </div>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full text-white/60 hover:bg-white/5 hover:text-white">
                          <X className="h-5 w-5" />
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8">
              <div className="mx-auto w-full max-w-2xl">
                <ProductForm
                  mode="edit"
                  initialProduct={selectedProduct}
                  initialForm={editForm}
                  onSubmit={async (form) => {
                    setEditForm(form);
                    if (selectedProduct) {
                      await submitUpdateProduct(form, selectedProduct);
                    }
                  }}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black px-8">
              {deletingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Drawer open={showScanner} onOpenChange={setShowScanner}>
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[88vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2.5rem]">
          <div className="flex flex-col overflow-hidden">
            <DrawerHeader className="border-b border-border/60 p-8 text-center items-center flex flex-col justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4">
                <ScanLine className="h-8 w-8 text-primary" />
              </div>
              <DrawerTitle className="text-3xl font-black tracking-tight">Delivery Scanner</DrawerTitle>
              <DrawerDescription className="text-base font-medium max-w-xs mx-auto">
                Scan the buyer&apos;s order pickup QR code to process verification and delivery.
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="flex flex-col items-center p-8 space-y-8">
              <div className="relative w-72 h-72 rounded-[3rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-black group">
                <Scanner
                  onScan={async (result) => {
                    const rawValue = result?.[0]?.rawValue;
                    if (rawValue) {
                      let orderId: number | null = null;
                      if (rawValue.includes("/products/sales/deliver")) {
                        const match = rawValue.match(/id=(\d+)/);
                        if (match) {
                          orderId = parseInt(match[1]);
                        }
                      } else if (/^\d+$/.test(rawValue)) {
                        orderId = parseInt(rawValue);
                      }

                      if (orderId) {
                        setShowScanner(false);
                        const promise = marketApi.deliverOrder(orderId);
                        toast.promise(promise, {
                          loading: "Confirming physical delivery...",
                          success: () => {
                            fetchMyProducts();
                            return "Order delivered successfully!";
                          },
                          error: (err: any) => {
                            return err?.response?.data?.message || err.message || "Failed to deliver order.";
                          }
                        });
                      } else {
                        toast.error("Invalid delivery QR code");
                      }
                    }
                  }}
                  scanDelay={500}
                  allowMultiple={false}
                  components={{ finder: true }}
                />
                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/40" />
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse text-center">
                 Align pickup code within viewport
              </p>
            </div>

            <DrawerFooter className="border-t border-border/60 p-8 bg-muted/5">
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel Scan</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
}
