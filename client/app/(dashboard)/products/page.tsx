"use client";

import { Package, Plus, Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { DashboardContent } from "@/components/dashboard-content";
import Link from "next/link";

import { useProducts } from "./hooks/useProducts";
import { ProductCard, ProductFormFields } from "./components";

export default function ProductsPage() {
  const {
    products,
    loading,
    form,
    setForm,
    selectedProduct,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteAlert,
    setShowDeleteAlert,
    isSubmitting,
    isUploading,
    progress,
    handleEditClick,
    handleImageUpload,
    handleFileUpload,
    handleCreate,
    handleUpdate,
    handleDelete,
    resetForm,
    setDeletingId
  } = useProducts();

  return (
    <DashboardContent>
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
            <p className="text-muted-foreground font-medium animate-pulse">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-border/50 bg-muted/20 py-32 px-4 text-center">
            <div className="rounded-full bg-brand-orange/10 p-6 mb-6">
              <Package className="h-12 w-12 text-brand-orange/60" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">No products yet</h3>
            <p className="text-muted-foreground font-medium mt-2 max-w-md">
              Create your first product to start selling in the marketplace.
            </p>
            <Button
              onClick={() => { resetForm(); setShowAddDialog(true); }}
              className="mt-8 rounded-xl bg-brand-orange hover:bg-brand-orange/90 font-bold px-8 shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" /> Create First Product
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditClick}
                onDelete={(id) => {
                  setDeletingId(id);
                  setShowDeleteAlert(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Add Product Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-2 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
                <div className="bg-brand-orange/10 p-2 rounded-xl text-brand-orange">
                  <Plus className="w-5 h-5" />
                </div>
                Create Product
              </DialogTitle>
              <DialogDescription className="font-medium text-base pt-2">
                Add a new item to sell in the marketplace.
              </DialogDescription>
            </DialogHeader>

            <ProductFormFields
              form={form}
              setForm={setForm}
              handleImageUpload={handleImageUpload}
              handleFileUpload={handleFileUpload}
              isUploading={isUploading}
              progress={progress}
            />

            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="h-12 rounded-xl border-2 font-bold hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || isUploading}
                className="h-12 rounded-xl bg-brand-orange font-bold text-white shadow-lg hover:bg-brand-orange/90 min-w-[120px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-2 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
                <div className="bg-brand-blue/10 p-2 rounded-xl text-brand-blue">
                  <Package className="w-5 h-5" />
                </div>
                Edit Product
              </DialogTitle>
              <DialogDescription className="font-medium text-base pt-2">
                Make changes to your product listing.
              </DialogDescription>
            </DialogHeader>

            <ProductFormFields
              form={form}
              setForm={setForm}
              handleImageUpload={handleImageUpload}
              handleFileUpload={handleFileUpload}
              isUploading={isUploading}
              progress={progress}
            />

            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="h-12 rounded-xl border-2 font-bold hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting || isUploading}
                className="h-12 rounded-xl bg-brand-blue font-bold text-white shadow-lg hover:bg-brand-blue/90 min-w-[120px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent className="rounded-[32px] border-2 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-destructive">Delete Product</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium mt-2 text-foreground/80">
                Are you sure you want to delete this product? This action cannot be undone and will remove it from the marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="h-12 rounded-xl border-2 font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="h-12 rounded-xl bg-destructive font-bold text-destructive-foreground hover:bg-destructive/90 min-w-[120px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                ) : (
                  "Delete Product"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardContent>
  );
}
