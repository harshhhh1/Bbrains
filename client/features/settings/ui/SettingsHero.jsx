"use client";

import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/features/settings/model/settings";

export function SettingsHero({
  user,
  form,
  saving,
  displayName,
  roleLabel,
  gradeLabel,
  onAvatarUpload,
}) {
  return (
    <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
      {/* Avatar with pencil overlay */}
      <div className="relative shrink-0">
        <Avatar className="h-20 w-20 rounded-2xl border-2 border-border/50 shadow-md">
          <AvatarImage
            src={form.avatar || undefined}
            className="object-cover"
          />
          <AvatarFallback
            name={user?.username}
            className="rounded-2xl bg-primary text-2xl font-bold text-primary-foreground"
          >
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="settings-avatar-upload"
          className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashboard-surface bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110 active:scale-95"
        >
          {saving === "avatar" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
          <input
            id="settings-avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarUpload}
          />
        </label>
      </div>

      {/* Name + meta */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          @{form.username || user?.username}
          <span className="mx-2 text-border">·</span>
          {user?.email}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-0.5 text-xs font-semibold"
          >
            {roleLabel}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-0.5 text-xs font-medium"
          >
            {gradeLabel}
          </Badge>
        </div>
      </div>
    </section>
  );
}
