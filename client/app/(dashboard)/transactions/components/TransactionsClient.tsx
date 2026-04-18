"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { useHasPermission } from "@/components/providers/permissions-provider"
import { PersonalTransactions } from "./PersonalTransactions"
import { FinanceTransactionsWorkspace } from "@/features/transactions/components/FinanceTransactionsWorkspace"
import { DashboardContent } from "@/components/dashboard-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Landmark } from "lucide-react"

export function TransactionsClient() {
    const { user, loading: userLoading } = useUser()
    const canManageFinance = useHasPermission("manage_finance")
    
    // Fallback role check
    const userRole = (user?.type || "student") as "student" | "teacher" | "admin" | "staff" | "superadmin"
    const isManagerial = ["admin", "superadmin", "manager"].includes(userRole)

    if (userLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Students only see their own transactions
    if (!isManagerial && !canManageFinance) {
        return (
            <DashboardContent>
                <PersonalTransactions />
            </DashboardContent>
        )
    }

    // Admins and Managers see tabs to switch between personal and institutional views
    return (
        <DashboardContent>
            <Tabs defaultValue="institutional" className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Finance Ledger</h1>
                        <p className="text-muted-foreground text-sm">Switch between personal records and institutional oversight.</p>
                    </div>
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="institutional" className="gap-2">
                            <Landmark className="size-3.5" />
                            Institutional
                        </TabsTrigger>
                        <TabsTrigger value="personal" className="gap-2">
                            <User className="size-3.5" />
                            Personal
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="institutional" className="mt-0 border-none p-0 outline-none">
                    <FinanceTransactionsWorkspace mode={userRole === 'admin' || userRole === 'superadmin' ? 'admin' : 'manager'} />
                </TabsContent>

                <TabsContent value="personal" className="mt-0 border-none p-0 outline-none">
                    <PersonalTransactions />
                </TabsContent>
            </Tabs>
        </DashboardContent>
    )
}
