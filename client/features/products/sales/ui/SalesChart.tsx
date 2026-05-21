"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import Image from "next/image";
import { SalesData } from "@/services/api/client";

interface SalesChartProps {
  sales: SalesData;
}

export function SalesChart({ sales }: SalesChartProps) {
  const chartData = [
    { name: "Total Earnings", value: sales.totalEarnings, color: "#f97316", fill: "url(#gradientEarnings)" },
    { name: "Digital Revenue", value: sales.digitalSales.revenue, color: "#3b82f6", fill: "url(#gradientDigital)" },
    { name: "Physical Revenue", value: sales.physicalSales.revenue, color: "#22c55e", fill: "url(#gradientPhysical)" },
    { name: "Products Listed", value: sales.productBreakdown.length, color: "#a855f7", fill: "url(#gradientProducts)" },
  ];

  return (
    <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="text-lg font-black text-white">Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="gradientEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="gradientDigital" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="gradientPhysical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="gradientProducts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis dataKey="name" fontSize={10} tick={{ fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis fontSize={10} tick={{ fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-md">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d.name}</p>
                        <div className="flex items-center gap-2">
                          <Image src="/bcoin.svg" alt="BC" width={16} height={16} className="opacity-70" />
                          <span className="text-lg font-black text-white tabular-nums">{d.value?.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
