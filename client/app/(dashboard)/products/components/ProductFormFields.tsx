"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Image as ImageIcon, Upload, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductFormFieldsProps {
  form: any;
  setForm: (form: any) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  progress: number;
}

export function ProductFormFields({
  form,
  setForm,
  handleImageUpload,
  handleFileUpload,
  isUploading,
  progress,
}: ProductFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
        <Tabs
          value={form.productType}
          onValueChange={(val) => setForm({ ...form, productType: val as "digital" | "physical" })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="physical" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Physical
            </TabsTrigger>
            <TabsTrigger value="digital" className="data-[state=active]:bg-brand-mint data-[state=active]:text-white">
              <FileUp className="w-4 h-4 mr-2" /> Digital
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product Details</label>
          <Input
            placeholder="Name (e.g. Vintage T-Shirt)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-12 border-2 bg-muted/50 text-lg font-medium"
          />
        </div>
        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-[120px] resize-none border-2 bg-muted/50 text-base font-medium"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="h-12 border-2 bg-muted/50 text-lg font-medium"
          />
          {form.productType === 'physical' && (
            <Input
              type="number"
              placeholder="Stock count"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="h-12 border-2 bg-muted/50 text-lg font-medium"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Thumbnail Image</label>
        <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-muted/30 transition-colors hover:border-brand-orange/50 hover:bg-brand-orange/5">
          {form.imageUrl ? (
            <div className="relative aspect-video w-full">
              <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="font-bold text-white flex items-center"><Upload className="w-4 h-4 mr-2"/> Change Image</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="mb-4 h-10 w-10 opacity-50" />
              <p className="text-sm font-medium">Click to upload thumbnail</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          {isUploading && progress > 0 && progress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                <p className="text-sm font-bold text-brand-orange">{progress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {form.productType === 'digital' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Digital File</label>
          <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-muted/30 transition-colors hover:border-brand-mint/50 hover:bg-brand-mint/5">
            {form.fileUrl ? (
              <div className="flex items-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-mint/10 text-brand-mint">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                  <p className="truncate font-bold">{form.fileUrl.split('/').pop()}</p>
                  <p className="text-xs text-muted-foreground uppercase">{form.fileType || 'Unknown Type'}</p>
                </div>
                <div className="pl-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="outline">Change</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Upload className="mb-4 h-8 w-8 opacity-50" />
                <p className="text-sm font-medium">Upload digital product file</p>
                <p className="text-xs opacity-60 mt-1">PDF, ZIP, Images, etc.</p>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {isUploading && progress > 0 && progress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-mint" />
                  <p className="text-sm font-bold text-brand-mint">{progress}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
