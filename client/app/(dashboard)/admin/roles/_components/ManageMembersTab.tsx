"use client";

import { useState } from "react";
import { Search, UserMinus, UserPlus } from "lucide-react";
import type { Role, UserWithRoles } from "../_types";
import { createClient } from "@/services/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ManageMembersTabProps {
  role: Role;
  allUsers: UserWithRoles[];
  isSuperAdmin: boolean;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

export default function ManageMembersTab({ role, allUsers, isSuperAdmin, onUpdate, userLowestPosition, isUserSuperAdmin }: ManageMembersTabProps) {
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  const members = allUsers.filter((u) => u.roles.includes(role.id.toString()));
  const nonMembers = allUsers.filter((u) => !u.roles.includes(role.id.toString()));

  const isHierarchyLocked = role.position <= userLowestPosition && !isUserSuperAdmin;

  const handleAddMember = async (userId: string) => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role_id: role.id });
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .match({ user_id: userId, role_id: role.id });
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = members.filter((u) =>
    (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNonMembers = nonMembers.filter((u) =>
    (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 p-4 shrink-0 bg-muted/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border border-transparent focus:border-primary/20 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
            Members ({members.length})
          </h3>
          <div className="space-y-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-border/60">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback name={user.username}>
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
                    disabled={isSuperAdmin || isHierarchyLocked || isProcessing}
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
                        <AvatarFallback name={user.username}>
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
                      disabled={isProcessing}
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
    </div>
  );
}
