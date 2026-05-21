"use client"

import { useUser } from "@/hooks/use-user"
import { useHasPermission, usePermissionsContext } from "@/components/providers/permissions-provider"
import { PersonalTransactions } from "@/features/transactions/ui/PersonalTransactions"
import { StudentTransactionsView } from "@/features/transactions/ui/StudentTransactionsView"
import { FinanceTransactionsWorkspace } from "@/features/transactions/ui/FinanceTransactionsWorkspace"
import { PageContainer, PageHeader } from "@/components/layout/page-primitives"
import { LoadingState } from "@/components/ui/loading-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Landmark } from "lucide-react"

export function TransactionsClient() {
    const { user, loading: userLoading } = useUser()
    const { isLoading: permissionsLoading } = usePermissionsContext()
    const canManageFinance = useHasPermission("manage_finance")
    
    // Fallback role check
    const userRole = (user?.type || "student") as "student" | "teacher" | "admin" | "staff" | "superadmin"
    const isManagerial = ["admin", "superadmin", "manager"].includes(userRole)

    if (userLoading || permissionsLoading) {
        return <LoadingState label="Loading finance ledger..." className="min-h-[400px]" />
    }

    // Students only see their own transactions
    if (!isManagerial && !canManageFinance) {
        return (
            <PageContainer>
                {userRole === "student" ? <StudentTransactionsView /> : <PersonalTransactions />}
            </PageContainer>
        )
    }

    // Admins and Managers see tabs to switch between personal and institutional views
    return (
        <PageContainer>
            <Tabs defaultValue="institutional" className="space-y-6">
                <PageHeader
                    className="border-b pb-4"
                    title="Finance Ledger"
                    description="Switch between personal records and institutional oversight."
                    actions={
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
                    }
                />

                <TabsContent value="institutional" className="mt-0 border-none p-0 outline-none">
                    <FinanceTransactionsWorkspace mode={userRole === 'admin' || userRole === 'superadmin' ? 'admin' : 'manager'} />
                </TabsContent>

                <TabsContent value="personal" className="mt-0 border-none p-0 outline-none">
                    <PersonalTransactions />
                </TabsContent>
            </Tabs>
        </PageContainer>
    )
}
