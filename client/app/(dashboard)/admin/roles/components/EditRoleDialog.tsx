"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { allPermissions, type Role } from "../_types"

interface EditRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
    selectedPerms: string[]
    onPermsChange: (perms: string[]) => void
    onSave: () => void
}

export function EditRoleDialog({
    open,
    onOpenChange,
    role,
    selectedPerms,
    onPermsChange,
    onSave,
}: EditRoleDialogProps) {
    const togglePerm = (perm: string) => {
        onPermsChange(
            selectedPerms.includes(perm)
                ? selectedPerms.filter((p) => p !== perm)
                : [...selectedPerms, perm]
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
                <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                    <DrawerHeader className="border-b border-border/60 p-6 text-left">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <DrawerTitle>{role ? "Edit Role" : "Create Role"}</DrawerTitle>
                                <DrawerDescription>
                                    Define permissions and details for this user role.
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
                        <div className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input defaultValue={role?.name} placeholder="Role name" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    defaultValue={role?.description ?? ""}
                                    placeholder="Role description"
                                />
                            </div>
                            <div className="pt-2">
                                <Label className="mb-4 block font-bold text-xs uppercase tracking-wider text-muted-foreground">Permissions</Label>
                                <div className="space-y-1 rounded-xl border border-border/50 bg-muted/5 p-2">
                                    {allPermissions.map((perm) => (
                                        <div
                                            key={perm}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/10 transition-colors"
                                        >
                                            <span className="text-sm capitalize text-foreground">
                                                {perm.replace(/_/g, " ")}
                                            </span>
                                            <Switch
                                                checked={selectedPerms.includes(perm)}
                                                onCheckedChange={() => togglePerm(perm)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button onClick={() => onOpenChange(false)}>
                            {role ? "Save Role" : "Create Role"}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
