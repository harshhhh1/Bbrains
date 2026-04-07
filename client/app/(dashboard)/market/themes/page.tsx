"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Palette, Search } from "lucide-react";
import { PinDialog } from "../components";

import { useThemes } from "./hooks/useThemes";
import { ThemeCard } from "./components";

export default function ThemesPage() {
  const {
    themes,
    loading,
    searchQuery,
    setSearchQuery,
    selectedTheme,
    setSelectedTheme,
    showPreview,
    setShowPreview,
    showBuyDialog,
    setShowBuyDialog,
    pin,
    setPin,
    buying,
    page,
    setPage,
    total,
    totalPages,
    filteredThemes,
    handleBuyNow,
    handlePreview,
    handleBuyClick
  } = useThemes();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Theme Marketplace</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No themes found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredThemes.map((theme, idx) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                idx={idx}
                handlePreview={handlePreview}
                handleBuyClick={handleBuyClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <Button
                variant="outline"
                disabled={page === 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <PinDialog
        open={showBuyDialog}
        onOpenChange={setShowBuyDialog}
        onConfirm={handleBuyNow}
        isProcessing={buying}
        description={`Authorizing purchase of ${selectedTheme?.name} for ${selectedTheme?.price} XP.`}
      />

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-background rounded-3xl">
          {selectedTheme && (
            <div className="flex flex-col h-[80vh] md:h-auto md:max-h-[85vh]">
              <div className="relative aspect-video w-full bg-slate-950 shrink-0">
                {selectedTheme.image ? (
                  <Image
                    src={selectedTheme.image}
                    alt={selectedTheme.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Palette className="h-24 w-24 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2 drop-shadow-md">
                    {selectedTheme.name}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl font-medium drop-shadow-md">
                    {selectedTheme.description}
                  </p>
                </div>
              </div>

              <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-background">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-foreground">{selectedTheme.price}</span>
                    <span className="text-lg font-bold text-brand-orange">XP</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest"
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </Button>
                  {selectedTheme.purchased ? (
                    <Button
                      variant="secondary"
                      className="flex-1 md:flex-none h-14 px-8 rounded-2xl font-black uppercase tracking-widest opacity-50 cursor-default"
                    >
                      In Library
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20"
                      onClick={() => {
                        setShowPreview(false);
                        handleBuyClick(selectedTheme);
                      }}
                    >
                      Purchase Theme
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
