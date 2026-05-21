"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Loader2, Plus, Star, Trash2, FileUp, Upload } from "lucide-react";
import { Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

interface ProductFormProps {
  mode: "add" | "edit";
  initialProduct?: Product | null;
  initialForm?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProductForm({ mode, initialProduct, initialForm, onSubmit, isSubmitting }: ProductFormProps) {
  const { uploadFile, isUploading, progress } = useCloudinaryUpload();
  
  const defaultForm: ProductFormData = {
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    images: [],
    productType: "physical",
    fileUrl: "",
    fileType: "",
  };

  const [form, setForm] = useState<ProductFormData>(() => {
    if (initialForm) return initialForm;
    if (initialProduct) {
      const meta = initialProduct.metadata || {};
      return {
        name: initialProduct.name,
        description: initialProduct.description || "",
        price: initialProduct.price.toString(),
        stock: initialProduct.stock.toString(),
        imageUrl: initialProduct.image || "",
        images: Array.isArray(meta.images) 
          ? (meta.images as string[]) 
          : (initialProduct.image ? [initialProduct.image] : []),
        productType: initialProduct.productType || "physical",
        fileUrl: (meta.fileUrl as string) || "",
        fileType: (meta.fileType as string) || "",
      };
    }
    return defaultForm;
  });

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
    } else if (initialProduct) {
      const meta = initialProduct.metadata || {};
      setForm({
        name: initialProduct.name,
        description: initialProduct.description || "",
        price: initialProduct.price.toString(),
        stock: initialProduct.stock.toString(),
        imageUrl: initialProduct.image || "",
        images: Array.isArray(meta.images) 
          ? (meta.images as string[]) 
          : (initialProduct.image ? [initialProduct.image] : []),
        productType: initialProduct.productType || "physical",
        fileUrl: (meta.fileUrl as string) || "",
        fileType: (meta.fileType as string) || "",
      });
    }
  }, [initialForm, initialProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      const url = await uploadFile(file);
      if (url) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, url],
          imageUrl: prev.imageUrl || url
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        imageUrl: prev.imageUrl === prev.images[index] ? (newImages[0] || "") : prev.imageUrl
      };
    });
  };

  const setAsMainImage = (url: string) => {
    setForm(prev => ({ ...prev, imageUrl: url }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      if (url) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
        setForm(prev => ({ ...prev, fileUrl: url, fileType: ext }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs
        value={form.productType}
        onValueChange={(v) => setForm(prev => ({ ...prev, productType: v as "digital" | "physical" }))}
      >
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 px-1">Product Type</p>
          <TabsList className="grid h-[56px] w-full grid-cols-2 items-stretch gap-2 rounded-2xl border-white/10 bg-white/5 p-1">
            <TabsTrigger value="physical" className="h-full flex items-center justify-center rounded-xl font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none transition-all px-4">Physical</TabsTrigger>
            <TabsTrigger value="digital" className="h-full flex items-center justify-center rounded-xl font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none transition-all px-4">Digital</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 px-1">Product Images</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {form.images.map((url, index) => (
            <div key={index} className={cn(
              "group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all",
              form.imageUrl === url ? "border-brand-orange ring-2 ring-brand-orange/20" : "border-white/5"
            )}>
              <Image src={url} alt={`Product ${index}`} fill className="object-cover" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setAsMainImage(url)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      form.imageUrl === url ? "bg-brand-orange text-white" : "bg-white/10 text-white hover:bg-brand-orange"
                    )}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {form.imageUrl === url && (
                  <Badge className="bg-brand-orange text-[8px] font-black uppercase tracking-widest px-1.5 py-0">Main</Badge>
                )}
              </div>
            </div>
          ))}

          <label className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] transition-all hover:border-brand-orange/50 hover:bg-white/[0.04]",
            isUploading && "pointer-events-none opacity-50"
          )}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/60">Add Image</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
          </label>
        </div>

        {isUploading && (
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-brand-orange transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 px-1">Product Details</p>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="h-[52px] rounded-2xl bg-white/[0.03] border-white/10" />
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-[150px] rounded-2xl bg-white/[0.03] border-white/10" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="h-[52px] rounded-2xl bg-white/[0.03] border-white/10" />
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="h-[52px] rounded-2xl bg-white/[0.03] border-white/10" disabled={form.productType === 'digital'} />
          </div>
        </div>

        {form.productType === 'digital' && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 px-1">Digital Content</p>
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
              {form.fileUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                      <FileUp className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">File Attached</p>
                      <p className="text-xs text-white/40 uppercase tracking-widest">{form.fileType}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm(prev => ({ ...prev, fileUrl: "", fileType: "" }))} className="text-red-400 hover:bg-red-500/10">Replace</Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-6 cursor-pointer group">
                  <FileUp className="h-8 w-8 text-white/20 group-hover:text-brand-orange transition-colors mb-2" />
                  <p className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">Upload Digital Content</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">PDF, ZIP, MP4 etc.</p>
                  <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                </label>
              )}
            </div>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-brand-orange font-bold rounded-xl">
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
          {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Save Changes" : "Create Product")}
        </Button>
      </div>
    </form>
  );
}