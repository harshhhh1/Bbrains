"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface SalaryTransaction {
  amount: number | string;
  transactionDate: string;
}

interface TeacherIncomeChartProps {
  salaryTransactions: SalaryTransaction[];
}

type TimeFilter = "monthly" | "quarterly" | "yearly";

export function TeacherIncomeChart({ salaryTransactions }: TeacherIncomeChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");

  const chartData = useMemo(() => {
    const transactions = salaryTransactions || [];
    
    if (timeFilter === "yearly") {
      const yearlyData: Record<string, number> = {};
      transactions.forEach((t) => {
        const year = new Date(t.transactionDate).getFullYear().toString();
        yearlyData[year] = (yearlyData[year] || 0) + Number(t.amount || 0);
      });
      return Object.entries(yearlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, amount]) => ({ date: year, amount }));
    }

    if (timeFilter === "quarterly") {
      const quarterlyData: Record<string, number> = {};
      transactions.forEach((t) => {
        const date = new Date(t.transactionDate);
        const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
        quarterlyData[quarter] = (quarterlyData[quarter] || 0) + Number(t.amount || 0);
      });
      const sortedEntries = Object.entries(quarterlyData).sort(([a], [b]) => a.localeCompare(b));
      const last4 = sortedEntries.slice(-4);
      return last4.map(([quarter, amount]) => ({ date: quarter, amount }));
    }

    const monthlyData: Record<string, number> = {};
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const key = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      monthlyData[key] = 0;
    }

    transactions.forEach((t) => {
      const date = new Date(t.transactionDate);
      if (date >= startDate && date <= now) {
        const key = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        monthlyData[key] = (monthlyData[key] || 0) + Number(t.amount || 0);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [salaryTransactions, timeFilter]);

  const totalIncome = chartData.reduce((sum, d) => sum + d.amount, 0);
  const hasData = totalIncome > 0;

  return (
    <Card className="border-border/60 bg-card/95">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">Salary History</CardTitle>
          <CardDescription>
            {hasData 
              ? `Total: ₹${totalIncome.toLocaleString()} over ${timeFilter}`
              : "No salary records found"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px] w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.split(" ")[0] || value}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 1 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="mx-auto h-8 w-8 opacity-30 mb-2" />
                <p className="text-sm font-medium">No salary data available</p>
                <p className="text-xs mt-1">Salary payments will appear here</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}