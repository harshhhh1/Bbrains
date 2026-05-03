"use client";

import { Loader2, Lock, User, Wallet } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { formatCurrency } from "@/features/settings/model/settings";
import { SettingsHero } from "@/features/settings/ui/SettingsHero";
import { SettingsProfileTab } from "@/features/settings/ui/SettingsProfileTab";
import { SettingsSecurityTab } from "@/features/settings/ui/SettingsSecurityTab";
import { SettingsWalletTab } from "@/features/settings/ui/SettingsWalletTab";
import { TabButton } from "@/features/settings/ui/settings-ui";
import { useSettingsPage } from "@/features/settings/model/use-settings-page";

export default function SettingsPage() {
  const settings = useSettingsPage();

  if (settings.loading) {
    return (
      <DashboardContent maxWidth="max-w-7xl">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading settings workspace...</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="max-w-7xl" className="space-y-6">
      <SettingsHero
        user={settings.user}
        form={settings.form}
        saving={settings.saving}
        roleLabel={settings.roleLabel}
        displayName={settings.displayName}
        completion={settings.completion}
        walletBalanceLabel={formatCurrency(settings.walletBalance)}
        isPinSet={settings.isPinSet}
        gradeLabel={settings.gradeLabel}
        onAvatarUpload={settings.handleAvatarUpload}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid !h-auto w-full grid-cols-1 gap-5 rounded-[2.5rem] border border-border/60 bg-card p-5 md:grid-cols-3">
          <TabButton
            value="profile"
            icon={<User className="h-5 w-5" />}
            label="Profile"
            note="Avatar, username, bio, account details"
          />
          <TabButton
            value="security"
            icon={<Lock className="h-5 w-5" />}
            label="Security"
            note="Password controls and account safety checks"
          />
          <TabButton
            value="wallet"
            icon={<Wallet className="h-5 w-5" />}
            label="Wallet PIN"
            note="Protect payments and wallet confirmations"
          />
        </TabsList>

        <TabsContent value="profile" className="mt-0 space-y-6">
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

        <TabsContent value="security" className="mt-0 space-y-6">
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
            onSave={settings.handlePasswordUpdate}
          />
        </TabsContent>

        <TabsContent value="wallet" className="mt-0 space-y-6">
          <SettingsWalletTab
            saving={settings.saving}
            isPinSet={settings.isPinSet}
            oldPin={settings.oldPin}
            newPin={settings.newPin}
            confirmPin={settings.confirmPin}
            walletBalance={settings.walletBalance}
            canSubmitPin={settings.canSubmitPin}
            setOldPin={settings.setOldPin}
            setNewPin={settings.setNewPin}
            setConfirmPin={settings.setConfirmPin}
            onSave={settings.handlePinUpdate}
          />
        </TabsContent>
      </Tabs>
    </DashboardContent>
  );
}
