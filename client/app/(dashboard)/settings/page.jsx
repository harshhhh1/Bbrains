"use client";

import { Loader2, User, ShieldCheck } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsHero } from "@/features/settings/ui/SettingsHero";
import { SettingsProfileTab } from "@/features/settings/ui/SettingsProfileTab";
import { SettingsSecurityTab } from "@/features/settings/ui/SettingsSecurityTab";
import { useSettingsPage } from "@/features/settings/model/use-settings-page";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const settings = useSettingsPage();

  if (settings.loading) {
    return (
      <DashboardContent maxWidth="max-w-6xl">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading settings workspace...
          </p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="max-w-6xl" className="space-y-8">
      <SettingsHero
        user={settings.user}
        form={settings.form}
        saving={settings.saving}
        displayName={settings.displayName}
        roleLabel={settings.roleLabel}
        gradeLabel={settings.gradeLabel}
        onAvatarUpload={settings.handleAvatarUpload}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="inline-flex h-12 items-center gap-1 rounded-full bg-muted/60 p-1.5 ring-1 ring-border/30">
          <TabsTrigger
            value="profile"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
              "data-[state=active]:bg-dashboard-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm",
              "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/80",
            )}
          >
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
              "data-[state=active]:bg-dashboard-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm",
              "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/80",
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <SettingsProfileTab
            form={settings.form}
            setForm={settings.setForm}
            user={settings.user}
            saving={settings.saving}
            usernameError={settings.usernameError}
            isCheckingUsername={settings.isCheckingUsername}
            canSaveProfile={settings.canSaveProfile}
            displayName={settings.displayName}
            roleLabel={settings.roleLabel}
            gradeLabel={settings.gradeLabel}
            isPinSet={settings.isPinSet}
            level={settings.level}
            achievementCount={settings.achievementCount}
            walletBalance={settings.walletBalance}
            onSave={settings.handleProfileSave}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SettingsSecurityTab
            displayName={settings.displayName}
            username={settings.form.username || settings.user?.username || ""}
            isPinSet={settings.isPinSet}
            saving={settings.saving}
            currentPassword={settings.currentPassword}
            newPassword={settings.newPassword}
            confirmPassword={settings.confirmPassword}
            setCurrentPassword={settings.setCurrentPassword}
            setNewPassword={settings.setNewPassword}
            setConfirmPassword={settings.setConfirmPassword}
            onPasswordSave={settings.handlePasswordUpdate}
            oldPin={settings.oldPin}
            newPin={settings.newPin}
            canSubmitPin={settings.canSubmitPin}
            walletBalance={settings.walletBalance}
            setOldPin={settings.setOldPin}
            setNewPin={settings.setNewPin}
            onPinSave={settings.handlePinUpdate}
          />
        </TabsContent>
      </Tabs>
    </DashboardContent>
  );
}
