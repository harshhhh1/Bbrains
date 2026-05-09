"use client";

import { Pencil, Trash2, Shield, Eye, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ApiUser } from "@/lib/types/api";

interface UserCardProps {
  user: ApiUser;
  onEdit?: (user: ApiUser) => void;
  onDelete: (userId: string) => void;
  onManageRoles: (user: ApiUser) => void;
  onView?: (user: ApiUser) => void;
}

export function UserCard({ user, onEdit, onDelete, onManageRoles, onView }: UserCardProps) {
  const firstName = user.userDetails?.firstName || "";
  const lastName = user.userDetails?.lastName || "";
  const displayName = user.userDetails?.displayName || `${firstName} ${lastName}`.trim() || user.username;
  const initials = (displayName.charAt(0) || user.username.charAt(0)) + (lastName.charAt(0) || "");

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={user.userDetails?.avatar} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="font-bold leading-none tracking-tight">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize text-[10px] px-2 py-0">
            {user.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.userDetails?.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.userDetails.phone}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {(user.roles || []).map((entry) => (
            entry?.role?.name ? (
              <Badge 
                key={`${user.id}-${entry.role.id}`} 
                variant="secondary"
                className="text-[10px] font-medium bg-primary/5 text-primary border-primary/10"
              >
                {entry.role.name}
              </Badge>
            ) : null
          ))}
          {(user.roles || []).length === 0 && (
            <span className="text-[10px] italic text-muted-foreground">No custom roles</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/40 bg-muted/20 flex justify-between gap-1">
        <div className="flex gap-1">
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
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onDelete(user.id)}
          title="Delete User"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
