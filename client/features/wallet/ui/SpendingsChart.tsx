"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Transaction } from "@/services/api/client";
import { format, subMonths, startOfMonth, isWithinInterval, endOfMonth } from "date-fns";

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

    // Generate last 6 months list
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return {
        month: format(d, "MMM"),
        start: startOfMonth(d),
        end: endOfMonth(d),
        sent: 0,
        received: 0,
      };
    });

    // Aggregate transactions into months
    transactions.forEach((txn) => {
      const date = new Date(txn.transactionDate || (txn as any).createdAt || new Date());
      const amount = Number(txn.amount || 0);
      const isCredit = txn.type.toLowerCase() === "credit" || txn.type.toLowerCase() === "received" || txn.type.toLowerCase() === "deposit";

      months.forEach((m) => {
        if (isWithinInterval(date, { start: m.start, end: m.end })) {
          if (isCredit) {
            m.received += amount;
          } else {
            m.sent += amount;
          }
        }
      });
    });

    return months;
  }, [transactions, mounted]);

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
        <CardTitle className="text-lg">Spending Overview</CardTitle>
        <Tabs value={chartFilter} onValueChange={setChartFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="this-week" className="text-xs px-2">This Week</TabsTrigger>
            <TabsTrigger value="this-month" className="text-xs px-2">This Month</TabsTrigger>
            <TabsTrigger value="3-months" className="text-xs px-2">3 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fill: "#94a3b8" }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: "#94a3b8" }} 
                axisLine={false} 
                tickLine={false} 
                dx={-10}
              />
              <RechartsTooltip 
                cursor={{ fill: "hsl(var(--primary))", opacity: 0.05 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center gap-3 justify-between min-w-[120px]">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-foreground/70">{entry.name}:</span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {entry.value?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="sent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Sent" />
              <Bar dataKey="received" fill="#22c55e" radius={[4, 4, 0, 0]} name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
