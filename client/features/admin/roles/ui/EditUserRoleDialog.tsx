"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { X } from "lucide-react"
import type { Role, UserWithRoles } from "@/features/admin/roles/types"

interface EditUserRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserWithRoles | null
    selectedRoles: string[]
    onRolesChange: (roles: string[]) => void
    roles: Role[]
    onSave: () => void
}

export function EditUserRoleDialog({
    open,
    onOpenChange,
    user,
    selectedRoles,
    onRolesChange,
    roles,
    onSave,
}: EditUserRoleDialogProps) {
    const toggleRole = (roleName: string) => {
        onRolesChange(
            selectedRoles.includes(roleName)
                ? selectedRoles.filter((r) => r !== roleName)
                : [...selectedRoles, roleName]
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
                <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                    <DrawerHeader className="border-b border-border/60 p-6 text-left">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <DrawerTitle>Edit User Roles</DrawerTitle>
                                <DrawerDescription>
                                    Assign specific administrative roles to this user.
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
                        {user && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                                    <Avatar className="w-12 h-12">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {user.firstName?.charAt(0)}
                                            {user.lastName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-foreground">
                                            @{user.username}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Label className="mb-4 block font-bold text-xs uppercase tracking-wider text-muted-foreground">Select Roles</Label>
                                    <div className="space-y-2">
                                        {roles.map((role) => {
                                            const roleName = typeof role === 'string' ? role : role.name
                                            const roleDesc = typeof role === 'string' ? '' : role.description
                                            return (
                                                <div
                                                    key={typeof role === 'string' ? role : role.id}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card transition-colors"
                                                >
                                                    <div>
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {roleName}
                                                        </span>
                                                        {roleDesc && (
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {roleDesc}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Switch
                                                        checked={selectedRoles.includes(roleName)}
                                                        onCheckedChange={() => toggleRole(roleName)}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button onClick={() => onOpenChange(false)}>Save User Roles</Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
