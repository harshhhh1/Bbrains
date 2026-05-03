"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Loader2, ShoppingCart, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
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
      <DashboardContent>
        <div className="py-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing History...</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent className="mx-auto w-full max-w-5xl p-6 md:p-12 space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <ShoppingCart className="w-10 h-10 text-primary" />
          Order History
        </h1>
        <p className="text-muted-foreground text-lg font-medium mt-2">Monitor order status and pickup codes.</p>
      </header>

      {orders.length === 0 ? (
        <Card className="border-2 border-dashed border-border/40 bg-muted/10 rounded-[2.5rem] py-32">
          <div className="flex flex-col items-center justify-center text-center px-6">
            <Package className="w-16 h-16 text-muted-foreground/20 mb-6" />
            <h3 className="text-2xl font-bold tracking-tight">No Orders Found</h3>
            <p className="text-muted-foreground mt-2 max-w-xs font-medium mb-8">Initiate your first purchase at the campus marketplace.</p>
            <Link href="/market">
              <Button size="lg" className="rounded-2xl font-black uppercase tracking-widest text-xs px-10 shadow-lg shadow-primary/20">Access Market</Button>
            </Link>
          </div>
        </Card>
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

          <TabsContent value="all" className="grid gap-3 animate-in fade-in duration-500">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig} 
                onView={(o) => { setSelectedOrder(o); setIsDetailsOpen(true); }} 
                onShowQR={(o) => { setSelectedOrder(o); setIsQROpen(true); }} 
              />
            ))}
          </TabsContent>

          <TabsContent value="physical" className="grid gap-3 animate-in fade-in duration-500">
            {orders.filter(o => o.orderType !== 'digital').map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig} 
                onView={(o) => { setSelectedOrder(o); setIsDetailsOpen(true); }} 
                onShowQR={(o) => { setSelectedOrder(o); setIsQROpen(true); }} 
              />
            ))}
          </TabsContent>

          <TabsContent value="digital" className="grid gap-3 animate-in fade-in duration-500">
            {orders.filter(o => o.orderType === 'digital').map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig} 
                onView={(o) => { setSelectedOrder(o); setIsDetailsOpen(true); }} 
                onShowQR={(o) => { setSelectedOrder(o); setIsQROpen(true); }} 
              />
            ))}
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
    </DashboardContent>
  );
}
