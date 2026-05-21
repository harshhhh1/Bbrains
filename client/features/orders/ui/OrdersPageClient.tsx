"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid, PageContainer, PageHeader } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { orderApi, Order } from "@/services/api/client";
import Link from "next/link";
import { OrderCard } from "@/features/orders/ui/OrderCard";
import { OrderDetailsDrawer } from "@/features/orders/ui/OrderDetailsDrawer";
import { QRCodeDrawer } from "@/features/orders/ui/QRCodeDrawer";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const resp = await orderApi.getOrders(1, 100);
        if (resp.success && resp.data) {
          setOrders(Array.isArray(resp.data) ? resp.data : []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load records");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    order_placed: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
    completed: { label: "Fulfilled", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: Package },
  };

  if (loading) {
    return (
      <PageContainer width="md" padding="spacious">
        <LoadingState label="Syncing History..." className="py-40" iconClassName="size-10" />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="md" padding="spacious" gap="xl">
      <PageHeader
        title="Order History"
        description="Monitor order status and pickup codes."
        titleClassName="text-4xl font-black tracking-tight"
        descriptionClassName="text-lg font-medium"
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-16" />}
          title="No Orders Found"
          description="Initiate your first purchase at the campus marketplace."
          className="rounded-[2.5rem] border-2 border-border/40 py-32"
          action={
            <Link href="/market">
              <Button size="lg" className="rounded-2xl font-black uppercase tracking-widest text-xs px-10 shadow-lg shadow-primary/20">Access Market</Button>
            </Link>
          }
        />
      ) : (
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-muted/40 border border-border/40 rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              All Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="physical" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Physical ({orders.filter(o => o.orderType !== 'digital').length})
            </TabsTrigger>
            <TabsTrigger value="digital" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Digital ({orders.filter(o => o.orderType === 'digital').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Grid gap="sm" className="animate-in fade-in duration-500">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig} 
                onView={(o) => { setSelectedOrder(o); setIsDetailsOpen(true); }} 
                onShowQR={(o) => { setSelectedOrder(o); setIsQROpen(true); }} 
              />
            ))}
            </Grid>
          </TabsContent>

          <TabsContent value="physical" className="mt-0">
            <Grid gap="sm" className="animate-in fade-in duration-500">
            {orders.filter(o => o.orderType !== 'digital').map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig} 
                onView={(o) => { setSelectedOrder(o); setIsDetailsOpen(true); }} 
                onShowQR={(o) => { setSelectedOrder(o); setIsQROpen(true); }} 
              />
            ))}
            </Grid>
          </TabsContent>

          <TabsContent value="digital" className="mt-0">
            <Grid gap="sm" className="animate-in fade-in duration-500">
            {orders.filter(o => o.orderType === 'digital').map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig} 
                onView={(o) => { setSelectedOrder(o); setIsDetailsOpen(true); }} 
                onShowQR={(o) => { setSelectedOrder(o); setIsQROpen(true); }} 
              />
            ))}
            </Grid>
          </TabsContent>
        </Tabs>
      )}

      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onShowQR={() => { setIsDetailsOpen(false); setIsQROpen(true); }}
        statusConfig={statusConfig}
      />

      <QRCodeDrawer
        order={selectedOrder}
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </PageContainer>
  );
}
