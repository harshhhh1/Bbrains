"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Role, Permission, UserWithRoles } from "@/features/admin/roles/types";
import DisplayTab from "@/features/admin/roles/ui/DisplayTab";
import PermissionsTab from "@/features/admin/roles/ui/PermissionsTab";
import ManageMembersTab from "@/features/admin/roles/ui/ManageMembersTab";

interface RoleDetailProps {
  role: Role;
  allPermissions: Permission[];
  allUsers: UserWithRoles[];
  onBack: () => void;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

type TabType = "display" | "permissions" | "members";

export default function RoleDetail({ role, allPermissions, allUsers, onBack, onUpdate, userLowestPosition, isUserSuperAdmin }: RoleDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("display");

  const isSuperAdmin = role.name.toLowerCase() === "superadmin";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/60 p-4 shrink-0">
        <button
          onClick={onBack}
          className="md:hidden flex items-center justify-center rounded-full p-2 hover:bg-muted text-muted-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Edit Role — {role.name}</h2>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-4 border-b border-border/60 px-4 bg-muted/20">
        <button
          onClick={() => setActiveTab("display")}
          className={`border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "display"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Display
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "permissions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Permissions
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "members"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Members
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-background relative">
        {activeTab === "display" && <DisplayTab role={role} isSuperAdmin={isSuperAdmin} onUpdate={onUpdate} userLowestPosition={userLowestPosition} isUserSuperAdmin={isUserSuperAdmin} />}
        {activeTab === "permissions" && (
          <PermissionsTab role={role} allPermissions={allPermissions} isSelectedRoleSuperAdmin={isSuperAdmin} onUpdate={onUpdate} userLowestPosition={userLowestPosition} isUserSuperAdmin={isUserSuperAdmin} />
        )}
        {activeTab === "members" && (
          <ManageMembersTab role={role} allUsers={allUsers} isSuperAdmin={isSuperAdmin} onUpdate={onUpdate} userLowestPosition={userLowestPosition} isUserSuperAdmin={isUserSuperAdmin} />
        )}
      </div>
    </div>
  );
}
