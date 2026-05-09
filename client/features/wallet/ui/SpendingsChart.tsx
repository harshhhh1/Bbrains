"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Defs, LinearGradient, Stop } from "recharts";
import Image from "next/image";
import { Transaction } from "@/services/api/client";
import { format, subMonths, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from "date-fns";

interface SpendingsChartProps {
  transactions: Transaction[];
}

export function SpendingsChart({ transactions }: SpendingsChartProps) {
  const [mounted, setMounted] = useState(false);
  const [chartFilter, setChartFilter] = useState("this-month");

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!mounted) return [];

    const now = new Date();
    let dataBuckets: { label: string; start: Date; end: Date; sent: number; received: number }[] = [];

    if (chartFilter === "this-week") {
      // Last 7 days
      dataBuckets = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(now, 6 - i);
        return {
          label: format(d, "EEE"),
          start: startOfDay(d),
          end: endOfDay(d),
          sent: 0,
          received: 0,
        };
      });
    } else if (chartFilter === "this-month") {
      // Last 30 days
      dataBuckets = Array.from({ length: 30 }).map((_, i) => {
        const d = subDays(now, 29 - i);
        return {
          label: format(d, "MMM dd"),
          start: startOfDay(d),
          end: endOfDay(d),
          sent: 0,
          received: 0,
        };
      });
    } else if (chartFilter === "3-months") {
      // Last 3 months
      dataBuckets = Array.from({ length: 3 }).map((_, i) => {
        const d = subMonths(now, 2 - i);
        return {
          label: format(d, "MMM"),
          start: startOfMonth(d),
          end: endOfMonth(d),
          sent: 0,
          received: 0,
        };
      });
    } else {
      // Fallback: Last 6 months (default logic)
      dataBuckets = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(now, 5 - i);
        return {
          label: format(d, "MMM"),
          start: startOfMonth(d),
          end: endOfMonth(d),
          sent: 0,
          received: 0,
        };
      });
    }

    // Aggregate transactions into buckets
    transactions.forEach((txn) => {
      const date = new Date(txn.transactionDate || (txn as any).createdAt || new Date());
      const amount = Number(txn.amount || 0);
      const isCredit = ["credit", "received", "deposit"].includes(txn.type?.toLowerCase() || "");

      dataBuckets.forEach((bucket) => {
        if (isWithinInterval(date, { start: bucket.start, end: bucket.end })) {
          if (isCredit) {
            bucket.received += amount;
          } else {
            bucket.sent += amount;
          }
        }
      });
    });

    return dataBuckets;
  }, [transactions, mounted, chartFilter]);

  if (!mounted) {
    return (
      <Card className="h-[450px] w-full animate-pulse bg-muted/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-8 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4 bg-muted/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Spending Overview</CardTitle>
        <Tabs value={chartFilter} onValueChange={setChartFilter}>
          <TabsList className="h-8 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="this-week" className="text-[10px] uppercase tracking-widest font-black px-3 rounded-lg">Week</TabsTrigger>
            <TabsTrigger value="this-month" className="text-[10px] uppercase tracking-widest font-black px-3 rounded-lg">Month</TabsTrigger>
            <TabsTrigger value="3-months" className="text-[10px] uppercase tracking-widest font-black px-3 rounded-lg">3M</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis 
                dataKey="label" 
                fontSize={10}
                tick={{ fill: "#94a3b8", fontWeight: 700 }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                fontSize={10}
                tick={{ fill: "#94a3b8", fontWeight: 700 }} 
                axisLine={false} 
                tickLine={false} 
                dx={-10}
                tickFormatter={(value) => `${value}`}
              />
              <RechartsTooltip 
                cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label} Activity</p>
                        <div className="space-y-2">
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center gap-4 justify-between min-w-[140px]">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-foreground/60">{entry.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Image src="/bcoin.svg" alt="BC" width={14} height={14} className="opacity-70" />
                                <span className="text-sm font-black text-foreground tabular-nums">
                                  {entry.value?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="sent" 
                stroke="#ef4444" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSent)" 
                name="Sent"
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="received" 
                stroke="#22c55e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorReceived)" 
                name="Received"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
