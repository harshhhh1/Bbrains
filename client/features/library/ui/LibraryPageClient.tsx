"use client";

import { useState, useEffect, useCallback } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid, PageContainer, PageHeader } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { libraryApi, LibraryItem } from "@/services/api/client";
import { LibraryItemRow } from "@/features/library/ui/LibraryItemRow";

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

  const digitalItems = items.filter(i => i.category !== 'theme' && i.fileUrl);
  const physicalItems = items.filter(i => i.category !== 'theme' && !i.fileUrl);

  if (loading) {
    return (
      <PageContainer width="md" padding="spacious">
        <LoadingState label="Syncing Library..." className="py-40" iconClassName="size-10" />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="md" padding="spacious" gap="xl">
      <PageHeader
        title="Your Library"
        description="Access your digital items and assigned items."
        titleClassName="text-4xl font-black tracking-tight"
        descriptionClassName="text-lg font-medium"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Package className="size-16" />}
          title="List Empty"
          description="Bought study items will be shown here."
          className="rounded-[2.5rem] border-2 border-border/40 py-32"
        />
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
              <Grid>
                {digitalItems.map((item) => (
                  <LibraryItemRow 
                    key={item.id} 
                    item={item} 
                    isDownloading={downloading === item.productId} 
                    onDownload={handleDownload} 
                  />
                ))}
              </Grid>
            )}
          </TabsContent>

          <TabsContent value="physical" className="space-y-4 animate-in fade-in duration-500">
            {physicalItems.length === 0 ? (
              <p className="text-center text-muted-foreground/40 py-20 font-bold uppercase tracking-widest text-sm">No physical items assigned</p>
            ) : (
              <Grid>
                {physicalItems.map((item) => (
                  <LibraryItemRow 
                    key={item.id} 
                    item={item} 
                    isDownloading={false} 
                    onDownload={() => {}} 
                  />
                ))}
              </Grid>
            )}
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}
