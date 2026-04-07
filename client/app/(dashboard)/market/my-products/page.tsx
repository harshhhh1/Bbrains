"use client";

import { Package, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DashboardContent } from "@/components/dashboard-content";

import { useMyProducts } from "./hooks/useMyProducts";
import { ProductCard, ProductFormFields } from "../../products/components";

export default function MyProductsPage() {
  const {
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
  } = useMyProducts();

  return (
    <DashboardContent>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Package className="w-10 h-10 text-brand-orange" />
              My Products
            </h1>
            <p className="text-muted-foreground text-lg font-medium mt-2">Manage your marketplace listings.</p>
          </div>
          {canCreateProduct && (
            <Button 
              onClick={() => { resetForm(); setShowAddDialog(true); }}
              className="h-14 rounded-2xl bg-brand-orange px-8 font-black uppercase tracking-widest text-white shadow-lg shadow-brand-orange/20 transition-all hover:scale-105 hover:bg-brand-orange/90"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Product
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-muted border-t-brand-orange animate-spin" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading Products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border/50 rounded-[3rem] bg-muted/10">
            <Package className="w-16 h-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-2xl font-black text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground font-medium text-center max-w-md">
              {canCreateProduct ? "Create your first product to start selling in the marketplace." : "You do not have any active product listings."}
            </p>
            {canCreateProduct && (
              <Button
                onClick={() => { resetForm(); setShowAddDialog(true); }}
                className="mt-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 font-black uppercase tracking-widest px-8 shadow-lg h-14"
              >
                <Plus className="w-5 h-5 mr-2" /> Create First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditClick}
                onDelete={(id) => handleDelete(id)}
              />
            ))}
          </div>
        )}

        {/* Add Product Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-2 shadow-2xl">
            <DialogHeader className="mb-6 space-y-3">
              <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                <Plus className="w-7 h-7 text-brand-orange" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Create Product</DialogTitle>
              <DialogDescription className="font-medium text-base">
                Add a new physical or digital item to sell in the marketplace.
              </DialogDescription>
            </DialogHeader>

            <ProductFormFields
              form={form}
              setForm={setForm}
              handleImageUpload={handleImageUpload}
              handleFileUpload={() => {}}
              isUploading={isUploading}
              progress={progress}
            />

            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="h-14 rounded-2xl border-2 font-black uppercase tracking-widest hover:bg-muted/50 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={isSubmitting || isUploading}
                className="h-14 rounded-2xl bg-brand-orange font-black uppercase tracking-widest text-white shadow-lg hover:bg-brand-orange/90 w-full sm:w-auto min-w-[140px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-2 shadow-2xl">
            <DialogHeader className="mb-6 space-y-3">
              <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-brand-blue" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Edit Product</DialogTitle>
              <DialogDescription className="font-medium text-base">
                Make changes to your existing marketplace listing.
              </DialogDescription>
            </DialogHeader>

            <ProductFormFields
              form={form}
              setForm={setForm}
              handleImageUpload={handleImageUpload}
              handleFileUpload={() => {}}
              isUploading={isUploading}
              progress={progress}
            />

            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="h-14 rounded-2xl border-2 font-black uppercase tracking-widest hover:bg-muted/50 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={isSubmitting || isUploading}
                className="h-14 rounded-2xl bg-brand-blue font-black uppercase tracking-widest text-white shadow-lg hover:bg-brand-blue/90 w-full sm:w-auto min-w-[140px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardContent>
  );
}
