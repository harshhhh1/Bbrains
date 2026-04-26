"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/services/api/client"
import { Loader2, Shield, X } from "lucide-react"
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
import { toast } from "sonner"
import type { ApiRole } from "@/lib/types/api"

interface UserRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  username: string;
}

export function UserRolesDialog({ open, onOpenChange, userId, username }: UserRolesDialogProps) {
  const [allRoles, setAllRoles] = useState<ApiRole[]>([])
  const [userRoleIds, setUserRoleIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadData = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const [rolesRes, userRolesRes] = await Promise.all([
        api.get<ApiRole[]>("/roles"),
        api.get<{ role: ApiRole }[]>(`/roles/users/${userId}`)
      ])

      if (rolesRes.success) setAllRoles(rolesRes.data || [])
      if (userRolesRes.success) {
        setUserRoleIds((userRolesRes.data || []).map(ur => ur.role.id))
      }
    } catch (error) {
      console.error("Failed to load roles:", error)
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && userId) {
      loadData()
    }
  }, [open, userId])

  const handleToggle = async (roleId: number) => {
    if (!userId) return
    const isAssigned = userRoleIds.includes(roleId)
    
    try {
      setTogglingId(roleId)
      const res = isAssigned
        ? await api.delete(`/roles/users/${userId}/${roleId}`)
        : await api.post(`/roles/users/${userId}/assign`, { roleId })

      if (res.success) {
        setUserRoleIds(prev => 
          isAssigned ? prev.filter(id => id !== roleId) : [...prev, roleId]
        )
        toast.success(isAssigned ? "Role removed" : "Role assigned")
      } else {
        toast.error(res.message || "Operation failed")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Manage Permissions: @{username}
                </DrawerTitle>
                <DrawerDescription>
                  Toggle roles to update user permissions instantly.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                <p className="text-sm">Fetching role registry...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {allRoles.map((role) => {
                  const isActive = userRoleIds.includes(role.id)
                  const isToggling = togglingId === role.id
                  
                  return (
                    <div 
                      key={role.id}
                      onClick={() => !isToggling && handleToggle(role.id)}
                      className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isActive 
                          ? 'border-primary/50 bg-primary/5 shadow-sm' 
                          : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40'
                      } ${isToggling ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {role.name}
                          </span>
                          {isActive && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
                            {role.description}
                          </p>
                        )}
                      </div>
                      
                      <div className={`h-6 w-11 rounded-full p-1 transition-colors ${
                        isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}>
                        <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}>
                          {isToggling && <Loader2 className="w-2 h-2 animate-spin text-primary" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {allRoles.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed rounded-2xl border-border/40">
                    <p className="text-sm text-muted-foreground">No custom roles defined.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-border/60 p-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Finished</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
