"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import RoleList from "../_components/RoleList";
import RoleDetail from "../_components/RoleDetail";
import type { Role, Permission, UserWithRoles } from "../_types";
import { api } from "@/services/api/client";

export default function RolesPage() {
  const { user, loading: userLoading } = useUser();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [userLowestPosition, setUserLowestPosition] = useState<number>(Infinity);
  const [isUserSuperAdmin, setIsUserSuperAdmin] = useState(false);

  const loadData = useCallback(async (collegeId: number, currentUser: any) => {
    setLoading(true);
    setLoadError(null);
    try {
      // Fetch Roles via Server API
      const rolesResp = await api.get<any[]>("/roles");
      if (!rolesResp.success) throw new Error(rolesResp.message);

      const formattedRoles = (rolesResp.data ?? []).map((r: any) => ({
        ...r,
        // Ensure structure matches frontend expectations
        permissions: r.permissions?.map((rp: any) => ({
          enabled: rp.enabled,
          permission: rp.permission
        })) || []
      })) as Role[];

      setRoles(formattedRoles);

      // Fetch all available permissions
      const permsResp = await api.get<Permission[]>("/roles/permissions");
      if (permsResp.success) {
        setAllPermissions(permsResp.data || []);
      }

      // Fetch users with roles
      const usersResp = await api.get<any[]>("/roles/users");
      if (usersResp.success && usersResp.data) {
        const formattedUsers = usersResp.data.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          firstName: u.userDetails?.firstName || "",
          lastName: u.userDetails?.lastName || "",
          avatar: u.userDetails?.avatar ?? undefined,
          roles: u.roles?.map((ur: any) => ur.role?.id?.toString()) || []
        })) as UserWithRoles[];
        setUsers(formattedUsers);
      }

      // Set hierarchy info
      // SuperAdmin check
      const isSuper = currentUser.type === 'superadmin' || 
                     currentUser.roles?.some((r: any) => r.role?.name?.toLowerCase() === "superadmin");
      
      // Get min position from user's roles
      const userRoles = currentUser.roles || [];
      const positions = userRoles.map((ur: any) => ur.role?.position ?? 1000);
      const minPos = positions.length > 0 ? Math.min(...positions) : 1000;
      
      setUserLowestPosition(isSuper ? 0 : minPos);
      setIsUserSuperAdmin(isSuper);

    } catch (error: any) {
      console.error("Failed to load roles data:", error?.message || error);
      setLoadError(`Failed to load roles: ${error?.message || "Internal Server Error"}. Check backend logs.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!user?.collegeId) {
      setLoading(false);
      return;
    }

    const collegeId = user.collegeId;
    loadData(collegeId, user);
  }, [loadData, user, userLoading]);

  const handleSelectRole = (id: number) => {
    setSelectedRoleId(id);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
    setSelectedRoleId(null);
  };

  if (userLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center py-8 text-foreground">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">Please log in to manage roles</h2>
          <p className="text-sm text-muted-foreground">No active session found.</p>
        </div>
      </div>
    );
  }

  if (!user.collegeId) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center py-8 text-foreground">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">College not set</h2>
          <p className="text-sm text-muted-foreground">This page needs `user.collegeId` to load roles.</p>
        </div>
      </div>
    );
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;
  const currentCollegeId = user.collegeId!;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background text-foreground font-sans">
      {/* Left Panel: Role List */}
      <div
        className={`${
          isMobileListVisible ? "flex" : "hidden"
        } md:flex w-full md:w-64 lg:w-80 flex-col bg-card border-r border-border/60`}
      >
        {loadError ? (
          <div className="p-4 text-sm text-destructive">{loadError}</div>
        ) : null}
        <RoleList 
          roles={roles} 
          selectedRoleId={selectedRoleId} 
          onSelectRole={handleSelectRole} 
          collegeId={currentCollegeId}
          onRoleCreated={() => loadData(currentCollegeId, user)}
          userLowestPosition={userLowestPosition}
          isUserSuperAdmin={isUserSuperAdmin}
        />
      </div>

      {/* Right Panel: Role Detail */}
      <div
        className={`${
          !isMobileListVisible ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-background overflow-hidden relative`}
      >
        {selectedRole ? (
          <RoleDetail 
            role={selectedRole} 
            allPermissions={allPermissions}
            allUsers={users}
            onBack={handleBackToList}
            onUpdate={() => loadData(currentCollegeId, user)}
            userLowestPosition={userLowestPosition}
            isUserSuperAdmin={isUserSuperAdmin}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a role to manage its settings
          </div>
        )}
      </div>
    </div>
  );
}
