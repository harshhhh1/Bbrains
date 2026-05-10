"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderCard({ order, statusConfig, onView, onShowQR }) {
  const config = statusConfig[order.status] || {
    label: order.status,
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    icon: Package,
  };
  const Icon = config.icon;

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 hover:bg-card transition-all group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border",
                config.color.split(" ")[2],
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Order #{order.id.toString().slice(-6).toUpperCase()}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-medium">
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <img src="/bcoin.svg" className="h-3.5 w-3.5" alt="" />
                <p className="font-black text-sm text-primary tabular-nums">
                  {Number(order.totalAmount).toLocaleString()}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border",
                  config.color,
                )}
              >
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              {order.orderType !== "digital" &&
                order.status === "order_placed" &&
                order.qrCode && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onShowQR(order)}
                    className="h-10 w-10 rounded-xl border-border/60 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onView(order)}
                className="h-10 w-10 rounded-xl hover:bg-muted"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
