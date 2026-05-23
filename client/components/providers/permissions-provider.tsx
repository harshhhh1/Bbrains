"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";
import { useUser } from "@/hooks/use-user";
import { userApi } from "@/services/api/user.service";

type PermissionsContextType = {
  permissions: string[];
  roles: any[];
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
};

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  roles: [],
  isLoading: true,
  hasPermission: () => false,
});

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        // Fetch user's roles and permissions from the server
        const response = await userApi.getPermissions();

        if (response.success && response.data) {
          const { roles: activeRoles, permissions: activeKeys } = response.data;
          setRoles(activeRoles);
          setPermissions(activeKeys);
          console.log("PermissionsProvider: Fetched active keys", { userId: user.id, count: activeKeys.length });
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    if (!supabase) return;

    // Subscribe to realtime changes
    const rolePermissionsChannel = supabase
      .channel("role_permissions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_permissions" },
        () => {
          // Re-fetch when permissions change
          fetchPermissions();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => {
          fetchPermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rolePermissionsChannel);
    };
  }, [user, supabase]);

    // Utility to check permission
    const hasPermission = (key: string) => {
        // While loading, never grant permission to ensure SSR and client
        // first render produce identical trees (avoids hydration mismatch).
        // Actual permissions are checked after fetch completes.
        if (isLoading) return false;

        // If the user has a superadmin role, they inherently have all permissions
        const isSuperAdmin = roles.some((r) => r?.name?.toLowerCase() === "superadmin") || user?.type === "superadmin" || user?.originalType === "superadmin";
        if (isSuperAdmin) return true;

        // If the user has administrator permission, they bypass all other permission checks
        const hasAdminPermission = permissions.includes("administrator");
        if (hasAdminPermission) return true;

        return permissions.includes(key);
    };

  return (
    <PermissionsContext.Provider value={{ permissions, roles, isLoading, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissionsContext = () => useContext(PermissionsContext);

export function useHasPermission(key: string): boolean {
  const { hasPermission, isLoading } = usePermissionsContext();
  
  // While loading, we don't know yet - return false to avoid unauthorized calls
  // The actual check will happen once permissions are loaded
  if (isLoading) return false;
  
  return hasPermission(key);
}
