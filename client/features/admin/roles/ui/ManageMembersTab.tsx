"use client";

import { useState, useEffect } from "react";
import { Search, UserMinus, UserPlus } from "lucide-react";
import type { Role, UserWithRoles } from "@/features/admin/roles/types";
import { api } from "@/services/api/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ManageMembersTabProps {
  role: Role;
  allUsers: UserWithRoles[];
  isSuperAdmin: boolean;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

export default function ManageMembersTab({ 
  role, 
  allUsers, 
  isSuperAdmin, 
  onUpdate, 
  userLowestPosition, 
  isUserSuperAdmin 
}: ManageMembersTabProps) {
  const [search, setSearch] = useState("");
  // Local state for members: Array of user IDs
  const [pendingMemberIds, setPendingMemberIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isHierarchyLocked = role.position <= userLowestPosition && !isUserSuperAdmin;

  // Initialize local state from role members
  useEffect(() => {
    const currentMemberIds = allUsers
      .filter((u) => u.roles.includes(role.id.toString()))
      .map(u => u.id);
    setPendingMemberIds(currentMemberIds);
  }, [role, allUsers]);

  const handleAddMember = (userId: string) => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setPendingMemberIds(prev => [...prev, userId]);
  };

  const handleRemoveMember = (userId: string) => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setPendingMemberIds(prev => prev.filter(id => id !== userId));
  };

  const handleReset = () => {
    const currentMemberIds = allUsers
      .filter((u) => u.roles.includes(role.id.toString()))
      .map(u => u.id);
    setPendingMemberIds(currentMemberIds);
  };

  const handleSave = async () => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/roles/${role.id}/members`, { userIds: pendingMemberIds });
      if (!res.success) throw new Error(res.message);
      
      toast.success("Members updated successfully");
      onUpdate();
    } catch (err: any) {
      console.error("Failed to save members:", err);
      toast.error(err.message || "Failed to save members");
    } finally {
      setIsSaving(false);
    }
  };

  // Check for changes
  const originalMemberIds = allUsers
    .filter((u) => u.roles.includes(role.id.toString()))
    .map(u => u.id);
  
  const hasChanges = 
    pendingMemberIds.length !== originalMemberIds.length ||
    pendingMemberIds.some(id => !originalMemberIds.includes(id));

  const filteredMembers = allUsers
    .filter(u => pendingMemberIds.includes(u.id))
    .filter((u) =>
      (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    );

  const filteredNonMembers = allUsers
    .filter(u => !pendingMemberIds.includes(u.id))
    .filter((u) =>
      (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex h-full flex-col relative">
      <div className="border-b border-border/60 p-4 shrink-0 bg-muted/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border border-transparent focus:border-primary/20 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {isSuperAdmin && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            SuperAdmin membership is managed securely at the database level.
          </div>
        )}

        {isHierarchyLocked && !isSuperAdmin && (
          <div className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-600 border border-amber-500/20">
            This role is at or above your own hierarchy position. You cannot manage its members.
          </div>
        )}

        {/* Current Members */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Members ({pendingMemberIds.length})
          </h3>
          <div className="space-y-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-border/60">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">@{user.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(user.id)}
                    disabled={isSuperAdmin || isHierarchyLocked || isSaving}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-50"
                    title="Remove from role"
                  >
                    <UserMinus className="size-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-4 italic">No members match your search.</div>
            )}
          </div>
        </div>

        {/* Add Members */}
        {!isSuperAdmin && !isHierarchyLocked && (
          <div className="space-y-4 pt-6 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Add Members
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {filteredNonMembers.length > 0 ? (
                filteredNonMembers.slice(0, 20).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border/60">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">@{user.username}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.id)}
                      disabled={isSaving}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
                      title="Add to role"
                    >
                      <UserPlus className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-4 italic">No users available to add.</div>
              )}
            </div>
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
