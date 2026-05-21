"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Star, Package, ArrowLeft, Loader2, Download, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Grid, PageContainer, PageHeader, Stack } from "@/components/layout/page-primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { marketApi, SalesData } from "@/services/api/client";
import Link from "next/link";

export default function SalesPage() {
  const [sales, setSales] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      const resp = await marketApi.getSales();
      if (isMounted && resp.success && resp.data) {
        setSales(resp.data);
      }
    } catch (error) {
      if (isMounted) {
        console.error("Failed to fetch sales:", error);
        toast.error("Failed to load sales data");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchSales(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchSales]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState label="Loading Sales Data..." className="py-32" iconClassName="size-10 text-brand-orange" />
      </PageContainer>
    );
  }

  if (!sales) {
    return (
      <PageContainer>
        <EmptyState title="No sales data available" className="py-32" />
      </PageContainer>
    );
  }

  return (
    <PageContainer gap="lg">
      <Stack gap="xl" className="animate-in fade-in duration-500">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-brand-orange" />
              Sales Analytics
            </span>
          }
          description="Track your revenue and performance"
          titleClassName="text-3xl font-black tracking-tight"
          descriptionClassName="font-medium"
          actions={
          <Link href="/products">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-2 font-bold text-xs hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          }
        />

        <Grid className="md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-orange" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/30">Total Earnings</span>
              </div>
              <p className="text-3xl font-black text-white">{sales.totalEarnings} <span className="text-sm text-brand-orange font-bold">B-Coins</span></p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/30">Digital Sales</span>
              </div>
              <p className="text-2xl font-black text-white">{sales.digitalSales.units} <span className="text-sm text-white/30 font-bold">units</span></p>
              <p className="text-sm text-blue-400 font-bold mt-1">{sales.digitalSales.revenue} B-Coins</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/30">Physical Sales</span>
              </div>
              <p className="text-2xl font-black text-white">{sales.physicalSales.units} <span className="text-sm text-white/30 font-bold">units</span></p>
              <p className="text-sm text-green-400 font-bold mt-1">{sales.physicalSales.revenue} B-Coins</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/30">Products</span>
              </div>
              <p className="text-2xl font-black text-white">{sales.productBreakdown.length}</p>
              <p className="text-sm text-purple-400 font-bold mt-1">Listed</p>
            </CardContent>
          </Card>
        </Grid>

        <Grid gap="lg" className="lg:grid-cols-2">
          <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
            <CardContent className="p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-orange" />
                Product Breakdown
              </h3>
              {sales.productBreakdown.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No sales yet</p>
              ) : (
                <Stack gap="md">
                  {sales.productBreakdown.map((p) => (
                    <div key={p.productId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm truncate">{p.name}</p>
                          <Badge variant={p.productType === 'digital' ? 'default' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 shrink-0">
                            {p.productType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                          <span>{p.unitsSold} sold</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-400" />
                            {p.avgRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-brand-orange text-sm">{p.revenue} B-Coins</span>
                    </div>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
            <CardContent className="p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-orange" />
                Recent Transactions
              </h3>
              {sales.recentTransactions.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No transactions yet</p>
              ) : (
                <Stack gap="md" className="max-h-[500px] overflow-y-auto pr-2">
                  {sales.recentTransactions.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{t.product}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                          <span>Buyer: {t.buyer.substring(0, 12)}...</span>
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="font-bold text-green-400 text-sm">+{t.amount} B-Coins</span>
                    </div>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </PageContainer>
  );
}
