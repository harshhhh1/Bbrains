"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { Loader2, Eye, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { DataTable } from "@/features/admin/components/DataTable"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import type { ApiUser } from "@/lib/types/api"
import { Badge } from "@/components/ui/badge"


function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

function fullName(u?: { firstName?: string; lastName?: string } | null) {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
        </div>
    )
}

export default function StudentsPage() {
    const [students, setStudents] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<ApiUser | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/students")
            setStudents(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    const viewDetails = async (s: ApiUser) => {
        try {
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiUser }>(`/user/${s.username}`)
            setSelected(res.data.data)
            setDetailOpen(true)
        } catch { setSelected(s); setDetailOpen(true) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Students" subtitle={`${students.length} total students`} />
            <DataTable<ApiUser>
                loading={loading}
                data={students}
                searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    {
                        key: "userDetails", label: "Name",
                        render: (r) => fullName(r.userDetails),
                    },
                    {
                        key: "xp", label: "Level",
                        render: (r) => r.xp ? `Lv ${r.xp?.level ?? 1}` : "—",
                    },
                    {
                        key: "wallet", label: "Balance",
                        render: (r) => r.wallet ? fmtCurrency(r.wallet.balance) : "—",
                    },
                ]}
                extraActions={(row) => (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewDetails(row)}>
                        <Eye className="size-3.5" />
                    </Button>
                )}
            />

            <Drawer open={detailOpen} onOpenChange={setDetailOpen} direction="right">
                <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
                    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                        <DrawerHeader className="border-b border-border/60 p-6 text-left">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <DrawerTitle className="text-xl font-black">Student Dossier</DrawerTitle>
                                    <DrawerDescription className="text-sm font-medium text-muted-foreground">
                                        Detailed academic and profile overview for @{selected?.username}
                                    </DrawerDescription>
                                </div>
                                <DrawerClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </DrawerHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selected && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoRow label="Email Identity" value={selected.email} />
                                        <InfoRow label="Full Designation" value={fullName(selected.userDetails)} />
                                        <InfoRow label="Access Clearance" value={<RoleBadge value={selected.type} />} />
                                        {selected.userDetails?.phone && <InfoRow label="Contact Signal" value={selected.userDetails.phone} />}
                                        {selected.userDetails?.sex && <InfoRow label="Biological Sex" value={selected.userDetails.sex} />}
                                    </div>

                                    <div className="p-5 rounded-2xl bg-brand-orange/5 border border-brand-orange/10 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">Progression Metrics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Level</p>
                                                <p className="text-2xl font-black text-foreground">Lv {selected.xp?.level ?? 1}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total XP</p>
                                                <p className="text-2xl font-black text-foreground">{Number(selected.xp?.xp ?? 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Financial Assets</h4>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Wallet Balance</p>
                                                <p className="text-2xl font-black text-foreground">{fmtCurrency(selected.wallet?.balance || 0)}</p>
                                            </div>
                                            <p className="text-[10px] font-mono text-muted-foreground opacity-50 mb-1">ID: {selected.wallet?.id || 'NO_WALLET'}</p>
                                        </div>
                                    </div>

                                    {selected.enrollments && selected.enrollments.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Enlistments</h4>
                                            <div className="grid gap-2">
                                                {selected.enrollments.map((e) => (
                                                    <div key={e.courseId} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                                                        <span className="text-sm font-bold">{e.course.name}</span>
                                                        <Badge variant="outline" className="text-[10px] font-black uppercase opacity-60">Verified</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DrawerFooter className="border-t border-border/60 p-6">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Close Dossier</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
