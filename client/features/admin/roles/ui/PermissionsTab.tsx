"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import type { Role, Permission } from "@/features/admin/roles/types";
import { api } from "@/services/api/client";
import { toast } from "sonner";

interface PermissionsTabProps {
  role: Role;
  allPermissions: Permission[];
  isSelectedRoleSuperAdmin: boolean;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

export default function PermissionsTab({ role, allPermissions, isSelectedRoleSuperAdmin, onUpdate, userLowestPosition, isUserSuperAdmin }: PermissionsTabProps) {
  const [search, setSearch] = useState("");
  // Local state for toggles: { [permId]: enabled }
  const [pendingPermissions, setPendingPermissions] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isHierarchyLocked = role.position <= userLowestPosition && !isUserSuperAdmin;

  // Initialize local state from role permissions
  useEffect(() => {
    const initial: Record<number, boolean> = {};
    allPermissions.forEach(p => {
      const isEnabled = role.permissions?.some(rp => rp.permission?.key === p.key && rp.enabled) || false;
      initial[p.id] = isEnabled;
    });
    setPendingPermissions(initial);
  }, [role, allPermissions]);

  const handleToggle = (permissionId: number) => {
    if (isSelectedRoleSuperAdmin || isHierarchyLocked) return;
    
    setPendingPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  const handleReset = () => {
    const initial: Record<number, boolean> = {};
    allPermissions.forEach(p => {
      const isEnabled = role.permissions?.some(rp => rp.permission?.key === p.key && rp.enabled) || false;
      initial[p.id] = isEnabled;
    });
    setPendingPermissions(initial);
  };

  const handleSave = async () => {
    if (isSelectedRoleSuperAdmin || isHierarchyLocked) return;
    setIsSaving(true);
    try {
      // Map to service expectations: { permissionId, enabled }
      const updates = Object.entries(pendingPermissions).map(([id, enabled]) => ({
        permissionId: parseInt(id),
        enabled
      }));

      const res = await api.put(`/roles/${role.id}/permissions`, { permissions: updates });
      if (!res.success) throw new Error(res.message);
      
      toast.success("Permissions updated successfully");
      onUpdate();
    } catch (err: any) {
      console.error("Failed to save permissions:", err);
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if anything actually changed
  const hasChanges = allPermissions.some(p => {
    const originalEnabled = role.permissions?.some(rp => rp.permission?.key === p.key && rp.enabled) || false;
    return pendingPermissions[p.id] !== originalEnabled;
  });

  // Group permissions
  const filteredPerms = allPermissions.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredPerms.reduce((acc, p) => {
    const cat = p.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 p-4 shrink-0 bg-muted/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search permissions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border border-transparent focus:border-primary/20 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {isSelectedRoleSuperAdmin && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            SuperAdmin has all permissions by default. You cannot modify permissions for this role.
          </div>
        )}

        {isHierarchyLocked && !isSelectedRoleSuperAdmin && (
          <div className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-600 border border-amber-500/20">
            This role is at or above your own hierarchy position. You cannot modify its permissions.
          </div>
        )}

        {Object.entries(grouped).map(([category, perms]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{category}</h3>
            
            <div className="rounded-xl bg-card border border-border/60 divide-y divide-border/60 shadow-sm overflow-hidden">
              {perms.map((perm) => {
                const isEnabled = isSelectedRoleSuperAdmin ? true : (pendingPermissions[perm.id] || false);

                return (
                  <div key={perm.id} className="flex items-start justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="pr-4">
                      <div className="text-sm font-bold text-foreground">{perm.label}</div>
                      {perm.description && (
                        <div className="mt-1 text-xs text-muted-foreground leading-snug">
                          {perm.description}
                        </div>
                      )}
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      disabled={isSelectedRoleSuperAdmin || isHierarchyLocked}
                      onClick={() => handleToggle(perm.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-inner ${
                        isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No permissions found.
          </div>
        )}
      </div>

      {/* Unsaved Changes Bar */}
      {hasChanges && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl animate-in slide-in-from-bottom-5 rounded-2xl bg-card p-4 shadow-2xl border border-border/60 flex items-center justify-between z-50">
          <p className="text-sm text-foreground font-semibold pl-2">Careful — you have unsaved changes!</p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-primary px-6 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
