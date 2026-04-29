"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { libraryApi, LibraryItem } from "@/services/api/client";
import { LibraryItemRow } from "../_components/LibraryItemRow";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await libraryApi.getLibrary(undefined, 1, 100);
      if (response.success && response.data) {
        setItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleDownload = async (item: LibraryItem) => {
    try {
      setDownloading(item.productId);
      const resp = await libraryApi.getDownloadUrl(item.productId);
      if (resp.success && resp.data?.url) {
        window.open(resp.data.url, "_blank");
      } else {
        toast.error("Download link unavailable");
      }
    } catch (error) {
      toast.error("Failed to retrieve link");
    } finally {
      setDownloading(null);
    }
  };

  // Filter out themes as requested
  const digitalItems = items.filter(i => i.category !== 'theme' && i.fileUrl);
  const physicalItems = items.filter(i => i.category !== 'theme' && !i.fileUrl);

  if (loading) {
    return (
      <DashboardContent>
        <div className="py-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Library...</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent className="mx-auto w-full max-w-5xl p-6 md:p-12 space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-primary" />
          Your Library
        </h1>
        <p className="text-muted-foreground text-lg font-medium mt-2">Access your digital items and assigned items.</p>
      </header>

      {items.length === 0 ? (
        <Card className="border-2 border-dashed border-border/40 bg-muted/10 rounded-[2.5rem] py-32">
          <div className="flex flex-col items-center justify-center text-center px-6">
            <Package className="w-16 h-16 text-muted-foreground/20 mb-6" />
            <h3 className="text-2xl font-bold">List Empty</h3>
            <p className="text-muted-foreground mt-2 max-w-xs font-medium">Bought study items will be shown here.</p>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="digital" className="space-y-8">
          <TabsList className="bg-muted/40 border border-border/40 rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="digital" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Digital Downloads ({digitalItems.length})
            </TabsTrigger>
            <TabsTrigger value="physical" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Physical Items ({physicalItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="digital" className="space-y-4 animate-in fade-in duration-500">
            {digitalItems.length === 0 ? (
              <p className="text-center text-muted-foreground/40 py-20 font-bold uppercase tracking-widest text-sm">No digital records found</p>
            ) : (
              <div className="grid gap-4">
                {digitalItems.map((item) => (
                  <LibraryItemRow 
                    key={item.id} 
                    item={item} 
                    isDownloading={downloading === item.productId} 
                    onDownload={handleDownload} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="physical" className="space-y-4 animate-in fade-in duration-500">
            {physicalItems.length === 0 ? (
              <p className="text-center text-muted-foreground/40 py-20 font-bold uppercase tracking-widest text-sm">No physical items assigned</p>
            ) : (
              <div className="grid gap-4">
                {physicalItems.map((item) => (
                  <LibraryItemRow 
                    key={item.id} 
                    item={item} 
                    isDownloading={false} 
                    onDownload={() => {}} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardContent>
  );
}
