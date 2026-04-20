"use client"

import { useEffect, useState } from "react"
import { getBaseUrl } from "@/services/api/client"
import { getAuthToken } from "@/services/api/client"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Loader2, Settings, X, Shield } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface College {
    id: number;
    name: string;
    email: string;
    regNo: string;
    features?: Record<string, boolean>;
}

const AVAILABLE_FEATURES = [
    { key: "marketplace", label: "Marketplace" },
    { key: "chat", label: "Chat" },
    { key: "gamification", label: "Gamification" },
    { key: "announcements", label: "Announcements" },
    { key: "manage_users", label: "Manage Users" },
    { key: "manage_teachers", label: "Manage Teachers" },
    { key: "assignments", label: "Assignments" }
];

export default function SuperadminCollegesPage() {
    const [colleges, setColleges] = useState<College[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
    const [featuresForm, setFeaturesForm] = useState<Record<string, boolean>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchColleges()
    }, [])

    const fetchColleges = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/colleges`, {
                headers: { 
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })
            if (!res.ok) throw new Error("Failed to fetch colleges")
            const data = await res.json()
            setColleges(data.data || [])
        } catch (error) {
            toast.error("Error loading colleges")
        } finally {
            setIsLoading(false)
        }
    }

    const handleManageFeatures = async (college: College) => {
        setSelectedCollege(college)
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/colleges/${college.id}/features`, {
                headers: { 
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })
            if (!res.ok) throw new Error("Failed to load features")
            const data = await res.json()
            setFeaturesForm(data.data || {})
        } catch (error) {
            toast.error("Error loading college features")
            setFeaturesForm({})
        }
    }

    const saveFeatures = async () => {
        if (!selectedCollege) return
        setIsSaving(true)
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/colleges/${selectedCollege.id}/features`, {
                method: "PUT",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ features: featuresForm })
            })
            if (!res.ok) throw new Error("Failed to save features")

            toast.success("Features updated successfully")
            setSelectedCollege(null)
            fetchColleges()
        } catch (error) {
            toast.error("Failed to update features")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Colleges Control
            </h1>
            <p className="text-muted-foreground font-medium">Manage deployment features for individual institutions.</p>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-[160px] w-full rounded-2xl" />
                    <Skeleton className="h-[160px] w-full rounded-2xl" />
                    <Skeleton className="h-[160px] w-full rounded-2xl" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {colleges.map((college) => (
                        <Card key={college.id} className="rounded-2xl border border-border/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold truncate pr-2" title={college.name}>
                                    {college.name}
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0 opacity-40" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs font-mono text-muted-foreground mb-6 uppercase tracking-widest">{college.email}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-10 rounded-xl font-bold border-border/60 hover:bg-primary/5"
                                    onClick={() => handleManageFeatures(college)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configure Modules
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Drawer open={!!selectedCollege} onOpenChange={(open) => !open && setSelectedCollege(null)} direction="right">
                <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
                    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                        <DrawerHeader className="border-b border-border/60 p-6 text-left">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                        <Settings className="w-6 h-6 text-primary" />
                                    </div>
                                    <DrawerTitle className="text-xl font-black tracking-tight leading-none">
                                        Module Control
                                    </DrawerTitle>
                                    <DrawerDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        {selectedCollege?.name}
                                    </DrawerDescription>
                                </div>
                                <DrawerClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </DrawerHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">Institutional Feature Flags</p>
                            {AVAILABLE_FEATURES.map((feature) => (
                                <div key={feature.key} className="flex items-center justify-between rounded-2xl border border-border/50 bg-white/[0.02] p-4 shadow-sm hover:bg-white/[0.04] transition-all">
                                    <Label htmlFor={`feature-${feature.key}`} className="flex flex-col space-y-1 flex-1 cursor-pointer">
                                        <span className="font-bold text-sm">{feature.label}</span>
                                        <span className="font-medium text-[10px] text-muted-foreground leading-tight uppercase tracking-tight">Access Control for {feature.label.toLowerCase()}</span>
                                    </Label>
                                    <Switch
                                        id={`feature-${feature.key}`}
                                        checked={!!featuresForm[feature.key]}
                                        onCheckedChange={(checked) => setFeaturesForm(prev => ({ ...prev, [feature.key]: checked }))}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>

                        <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end gap-3 bg-muted/5">
                            <DrawerClose asChild>
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold">Discard Changes</Button>
                            </DrawerClose>
                            <Button onClick={saveFeatures} disabled={isSaving} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Push Configuration
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
