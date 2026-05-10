"use client";

import { usePathname } from "next/navigation";
import { MainNavbar } from "@/components/layout/main-navbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { sidebarItems } from "@/components/layout/sidebarItems";
import { Clock } from "lucide-react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { PermissionsProvider } from "@/components/providers/permissions-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import { UserProvider, useUser } from "@/context/user-context";

function DashboardInner({ children }) {
  const { user, loading, sidebarAccess } = useUser();
  const pathname = usePathname();

  const isComingSoon = React.useMemo(() => {
    return sidebarItems.some((item) => {
      const itemUrl = item.isDashboard ? "/dashboard" : item.url;
      if (itemUrl === pathname && item.cs) return true;
      if (item.subItems?.some((sub) => sub.url === pathname && sub.cs))
        return true;
      return false;
    });
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dashboard-bg">
      <AppSidebar user={user} sidebarAccessOverride={sidebarAccess} />

      <SidebarInset className="flex flex-col h-full overflow-hidden min-w-0 w-full bg-dashboard-bg relative">
        <MainNavbar user={user} />

        <div className="flex-1 min-h-0 bg-dashboard-bg">
          <main className="bg-dashboard-surface md:rounded-tl-3xl p-4 h-full flex flex-col relative overflow-y-auto overflow-x-hidden pb-0 md:pb-0">
            {loading || !user ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Initializing...
                  </p>
                </div>
              </div>
            ) : isComingSoon ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-500">
                <h2 className="text-4xl font-bold text-foreground">
                  Coming Soon!
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-lg">
                  We're working hard to bring you this feature. Stay tuned for
                  updates!
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-brand-purple/80 pt-4">
                  <Clock className="w-4 h-4" />
                  <span>Launching shortly</span>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
        <MobileBottomNav user={user} />
      </SidebarInset>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <UserProvider>
      <SidebarProvider defaultOpen={true}>
        <NotificationProvider>
          <PermissionsProvider>
            <TooltipProvider>
              <DashboardInner>{children}</DashboardInner>
            </TooltipProvider>
          </PermissionsProvider>
        </NotificationProvider>
      </SidebarProvider>
    </UserProvider>
  );
}
