"use client";

import { Pencil, Trash2, Shield, Eye, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiUser } from "@/lib/types/api";

interface UserCardProps {
  user: ApiUser;
  onEdit?: (user: ApiUser) => void;
  onDelete: (userId: string) => void;
  onManageRoles: (user: ApiUser) => void;
  onView?: (user: ApiUser) => void;
  isLast?: boolean;
}

export function UserCard({ user, onEdit, onDelete, onManageRoles, onView, isLast }: UserCardProps) {
  const firstName = user.userDetails?.firstName || "";
  const lastName = user.userDetails?.lastName || "";
  const displayName = user.userDetails?.displayName || `${firstName} ${lastName}`.trim() || user.username;
  const initials = (displayName.charAt(0) || user.username.charAt(0)) + (lastName.charAt(0) || "");

  return (
    <div className={`group flex items-center gap-4 p-4 hover:bg-muted/50 transition-all ${!isLast ? 'border-b border-border/40' : ''}`}>
      <Avatar className="h-12 w-12 border-2 border-background shadow-sm shrink-0">
        <AvatarImage src={user.userDetails?.avatar} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
          {initials.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        </div>

        <div className="min-w-0 hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.userDetails?.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{user.userDetails.phone}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 items-center">
          <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0 h-5">
            {user.type}
          </Badge>
          {(user.roles || []).slice(0, 3).map((entry) => (
            entry?.role?.name ? (
              <Badge 
                key={`${user.id}-${entry.role.id}`} 
                variant="secondary"
                className="text-[10px] font-medium bg-primary/5 text-primary border-primary/10 h-5 px-1.5"
              >
                {entry.role.name}
              </Badge>
            ) : null
          ))}
          {(user.roles || []).length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{user.roles!.length - 3}</span>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
              onClick={() => onView(user)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500 transition-colors shrink-0"
            onClick={() => onManageRoles(user)}
            title="Manage Roles"
          >
            <Shield className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500 transition-colors shrink-0"
              onClick={() => onEdit(user)}
              title="Edit User"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            onClick={() => onDelete(user.id)}
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex lg:hidden gap-1 shrink-0">
        {onView && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onView(user)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          onClick={() => onManageRoles(user)}
          title="Manage Roles"
        >
          <Shield className="h-4 w-4" />
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
            onClick={() => onEdit(user)}
            title="Edit User"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onDelete(user.id)}
          title="Delete User"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}