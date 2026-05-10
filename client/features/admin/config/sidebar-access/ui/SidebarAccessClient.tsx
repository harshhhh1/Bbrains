"use client";

import React, { useState, useEffect } from "react";
import { sidebarItems } from "@/components/layout/sidebarItems";
import { fetchCollegeSidebarAccess, updateCollegeSidebarAccess } from "@/services/api/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Shield } from "lucide-react";

const ROLES = ["student", "teacher", "admin", "staff", "manager", "superadmin"] as const;
type Role = typeof ROLES[number];

// Filter out items that should never be toggled (hardcoded admin only)
// AND remove duplicates (same URL or Title) to keep config clean after route merging
const TOGGLABLE_ITEMS = (() => {
    const ADMIN_ONLY_PATHS = ["/users", "/roles", "/config"];
    const seen = new Set<string>();
    
    return sidebarItems.filter(item => {
        const url = typeof item.url === "string" ? item.url : "";
        
        // 1. Skip hardcoded admin paths
        if (ADMIN_ONLY_PATHS.some(path => url === path || url.startsWith(path))) return false;
        
        // 2. Skip duplicates (prefer the one with dynamic url if available, though here we just pick first)
        const key = url || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        
        return true;
    });
})();

export default function SidebarAccessClient() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [accessMap, setAccessMap] = useState<Record<string, string[]>>({});

    useEffect(() => {
        async function loadData() {
            const data = await fetchCollegeSidebarAccess();
            if (data) {
                setAccessMap(data);
            } else {
                // Initialize with default access from sidebarItems
                const initialMap: Record<string, string[]> = {};
                TOGGLABLE_ITEMS.forEach(item => {
                    const key = (item as any).url || item.title;
                    initialMap[key] = item.access as string[];
                });
                setAccessMap(initialMap);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleToggle = (itemKey: string, role: string) => {
        setAccessMap(prev => {
            const currentRoles = prev[itemKey] || [];
            if (currentRoles.includes(role)) {
                return { ...prev, [itemKey]: currentRoles.filter(r => r !== role) };
            } else {
                return { ...prev, [itemKey]: [...currentRoles, role] };
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateCollegeSidebarAccess(accessMap);
            if (!res.success) {
                toast.error(res.message || res.error || "Failed to update sidebar access.");
                return;
            }
            toast.success("Sidebar access updated successfully. Refresh to see changes.");
        } catch (error: any) {
            toast.error(error.message || "Failed to update sidebar access.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sidebar Access Control</h1>
                    <p className="text-muted-foreground">
                        Configure which roles can see specific pages in the sidebar for your college.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Configuration
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Role-Based Visibility
                    </CardTitle>
                    <CardDescription>
                        Select a role to manage their sidebar visibility. Default BBrains restrictions still apply for system pages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="student" className="w-full">
                        <TabsList className="mb-4">
                            {ROLES.map(role => (
                                <TabsTrigger key={role} value={role} className="capitalize">
                                    {role}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {ROLES.map(role => (
                            <TabsContent key={role} value={role}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {TOGGLABLE_ITEMS.map(item => {
                                        const itemKey = (item as any).url || item.title;
                                        return (
                                            <div
                                                key={itemKey}
                                                className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={`${role}-${itemKey}`}
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    checked={accessMap[itemKey]?.includes(role)}
                                                    onCheckedChange={() => handleToggle(itemKey, role)}
                                                />
                                                <label
                                                    htmlFor={`${role}-${itemKey}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                >
                                                    {item.title}
                                                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                                        {(item as any).url || "Dynamic Dashboard"}
                                                    </p>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
