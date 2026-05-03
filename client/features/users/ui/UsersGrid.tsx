/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import type { ApiUser } from "@/lib/types/api";
import { UserCard } from "@/features/users/ui/UserCard";
import { Loader2, Users } from "lucide-react";

interface UsersGridProps {
  users: ApiUser[];
  loading?: boolean;
  onEdit?: (user: ApiUser) => void;
  onDelete: (userId: string) => void;
  onManageRoles: (user: ApiUser) => void;
  onView?: (user: ApiUser) => void;
}

export function UsersGrid({ users, loading, onEdit, onDelete, onManageRoles, onView }: UsersGridProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 bg-muted/20">
        <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold">No users found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageRoles={onManageRoles}
          onView={onView}
        />
      ))}
    </div>
  );
}
