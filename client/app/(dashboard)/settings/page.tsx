"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { cn } from "@/lib/utils";
import {
  dashboardApi,
  getBaseUrl,
  userApi,
  walletApi,
  type User as ApiUser,
} from "@/services/api/client";

type SettingsUser = ApiUser & {
  userDetails?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    phone?: string;
    sex?: string;
    avatar?: string | null;
  };
};

type ProfileFormState = {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  sex: string;
  avatar: string;
};

type SavingState = "profile" | "password" | "pin" | "avatar" | null;

function readUserField(
  user: SettingsUser | null,
  key: "firstName" | "lastName" | "bio" | "phone" | "sex" | "avatar"
) {
  if (!user) return "";
  return String(user.userDetails?.[key] ?? user[key] ?? "");
}

function getInitials(user: SettingsUser | null) {
  const username = user?.username || "U";
  return username[0].toUpperCase();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRoleLabel(type?: string) {
  if (!type) return "Member";
  return type[0].toUpperCase() + type.slice(1);
}

function getGradeLabel(user: SettingsUser | null) {
  return user?.classTeacherCourse?.standard || user?.enrollments?.[0]?.course?.standard || "Not assigned";
}

function profileCompletion(form: ProfileFormState) {
  const values = [form.username, form.firstName, form.lastName, form.bio, form.phone, form.avatar];
  const complete = values.filter((value) => value.trim().length > 0).length;
  return Math.round((complete / values.length) * 100);
}

function TabButton({
  value,
  icon,
  label,
  note,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  note: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "!h-auto items-start justify-start rounded-[1.5rem] border border-transparent p-6 text-left shadow-none",
        "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      )}
    >
      <div className="flex w-full items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground">{label}</p>
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{note}</p>
        </div>
      </div>
    </TabsTrigger>
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm", className)}>
      <CardHeader className="p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 md:p-8 md:pt-0">{children}</CardContent>
    </Card>
  );
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border/60 bg-background/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function PinSlots({
  value,
  onChange,
  tone = "default",
}: {
  value: string;
  onChange: (value: string) => void;
  tone?: "default" | "primary";
}) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className={cn(
              "h-11 w-9 rounded-xl border bg-background text-base font-semibold sm:h-12 sm:w-10",
              tone === "primary" ? "border-primary/30" : "border-border"
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { uploadFile } = useCloudinaryUpload();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SavingState>(null);
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isPinSet, setIsPinSet] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    sex: "other",
    avatar: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [userRes, walletRes] = await Promise.all([
        dashboardApi.getUser(),
        walletApi.getWallet(),
      ]);

      if (userRes.success && userRes.data) {
        const nextUser = userRes.data as SettingsUser;
        setUser(nextUser);
        setForm({
          username: nextUser.username || "",
          firstName: readUserField(nextUser, "firstName"),
          lastName: readUserField(nextUser, "lastName"),
          bio: readUserField(nextUser, "bio"),
          phone: readUserField(nextUser, "phone"),
          sex: readUserField(nextUser, "sex") || "other",
          avatar: readUserField(nextUser, "avatar"),
        });
      }

      if (walletRes.success && walletRes.data) {
        setWalletBalance(Number(walletRes.data.balance || 0));
        setIsPinSet(Boolean(walletRes.data.pinSet));
      } else {
        setWalletBalance(0);
        setIsPinSet(false);
      }
    } catch (error) {
      console.error("Failed to load settings data:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const checkUsername = async () => {
      const username = form.username.trim();
      
      if (!username) {
        setUsernameError("Username is required");
        return;
      }

      if (username.length < 3) {
        setUsernameError("Username must be at least 3 characters");
        return;
      }

      // If it's the current username, no need to check
      if (username === user?.username) {
        setUsernameError(null);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await userApi.checkUsername(username);
        if (response.success && response.data) {
          if (response.data.available) {
            setUsernameError(null);
          } else {
            setUsernameError(response.data.message || "Username is already taken");
          }
        }
      } catch (error) {
        console.error("Failed to check username:", error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [form.username, user?.username]);

  const displayName = useMemo(() => {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    return fullName || form.username || user?.username || "User";
  }, [form.firstName, form.lastName, form.username, user?.username]);

  const roleLabel = getRoleLabel(user?.type);
  const completion = profileCompletion(form);
  const achievementCount = user?.userAchievements?.length || 0;
  const level = Number(user?.xp?.level || 1);
  const gradeLabel = getGradeLabel(user);
  const canSubmitPin = /^\d{6}$/.test(newPin) && /^\d{6}$/.test(confirmPin) && (!isPinSet || /^\d{6}$/.test(oldPin));
  const canSaveProfile = !usernameError && !isCheckingUsername;

  const handleProfileSave = async () => {
    if (!user) return;

    const nextUsername = form.username.trim();
    if (!nextUsername) {
      toast.error("Username required");
      return;
    }

    setSaving("profile");
    try {
      if (nextUsername !== user.username) {
        const profileRes = await userApi.updateProfile(user.id, { username: nextUsername });
        if (!profileRes.success) {
          toast.error(profileRes.message || "Failed to update username");
          return;
        }
      }

      const detailsRes = await userApi.updateDetails({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        sex: form.sex,
        avatar: form.avatar || undefined,
      });

      if (!detailsRes.success) {
        toast.error(detailsRes.message || "Failed to update profile");
        return;
      }

      toast.success("Profile settings updated");
      await loadData();
      router.refresh();
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(null);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving("avatar");
    try {
      toast.loading("Uploading avatar...", { id: "settings-avatar-upload" });
      const url = await uploadFile(file);

      if (!url) {
        toast.error("Upload failed", { id: "settings-avatar-upload" });
        return;
      }

      const response = await userApi.updateDetails({ avatar: url });
      if (!response.success) {
        toast.error(response.message || "Failed to save avatar", {
          id: "settings-avatar-upload",
        });
        return;
      }

      setForm((current) => ({ ...current, avatar: url }));
      toast.success("Avatar updated", { id: "settings-avatar-upload" });
      await loadData();
      router.refresh();
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("Upload failed", { id: "settings-avatar-upload" });
    } finally {
      event.target.value = "";
      setSaving(null);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      toast.error("Enter current password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password needs 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving("password");
    try {
      const response = await fetch(`${getBaseUrl()}/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setSaving(null);
    }
  };

  const handlePinUpdate = async () => {
    if (!/^\d{6}$/.test(newPin)) {
      toast.error("PIN needs 6 digits");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("PIN values do not match");
      return;
    }

    setSaving("pin");
    try {
      const response = isPinSet
        ? await walletApi.changePin(oldPin, newPin)
        : await walletApi.setupPin(newPin);

      if (!response.success) {
        toast.error(response.message || "Failed to update PIN");
        return;
      }

      toast.success(isPinSet ? "Wallet PIN updated" : "Wallet PIN created");
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      setIsPinSet(true);
    } catch (error) {
      console.error("PIN update failed:", error);
      toast.error("Failed to update PIN");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
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
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_right,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-8 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-5 md:flex-row md:items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 rounded-[1.75rem] border-4 border-background shadow-lg md:h-28 md:w-28">
                  <AvatarImage src={form.avatar || undefined} className="object-cover" />
                  <AvatarFallback name={user?.username} className="rounded-[1.55rem] bg-primary text-2xl font-bold text-primary-foreground">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="settings-avatar-upload"
                  className="absolute -bottom-2 -right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-sm transition-transform hover:scale-105"
                >
                  {saving === "avatar" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    id="settings-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-none bg-primary/10 px-3 py-1 text-primary">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Unified settings
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    {roleLabel}
                  </Badge>
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Settings
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Manage profile identity, contact details, password, wallet PIN, and workspace appearance from one page.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{displayName}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>@{form.username || user?.username}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Completion" value={`${completion}%`} note="Profile readiness" />
              <MetricCard label="Wallet" value={formatCurrency(walletBalance)} note={isPinSet ? "PIN protected" : "PIN missing"} />
              <MetricCard label="Grade" value={gradeLabel} note="Current class level" />
            </div>
          </div>
        </div>
      </section>

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
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <SectionCard
                icon={<User className="h-5 w-5" />}
                title="Profile details"
                description="Keep your profile complete and easy to recognize across Bbrains."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FieldBlock label="Username" hint="Used in mentions and quick search.">
                    <div className="relative">
                      <Input
                        value={form.username}
                        onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                        className={cn(
                          "h-12 pr-10",
                          usernameError ? "border-destructive focus-visible:ring-destructive/20" : 
                          (form.username.length >= 3 && form.username !== user?.username ? "border-emerald-500/50 focus-visible:ring-emerald-500/20" : "")
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingUsername ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : usernameError ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : form.username.length >= 3 && form.username !== user?.username ? (
                          <BadgeCheck className="h-4 w-4 text-emerald-500" />
                        ) : null}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="px-1 text-[12px] font-medium text-destructive transition-all">
                        {usernameError}
                      </p>
                    )}
                  </FieldBlock>

                  <FieldBlock label="Email" hint="Primary account identity.">
                    <Input value={user?.email || ""} disabled className="h-12 bg-muted/60" />
                  </FieldBlock>

                  <FieldBlock label="First name">
                    <Input
                      value={form.firstName}
                      disabled
                      className="h-12 bg-muted/60"
                    />
                  </FieldBlock>

                  <FieldBlock label="Last name">
                    <Input
                      value={form.lastName}
                      disabled
                      className="h-12 bg-muted/60"
                    />
                  </FieldBlock>

                  <FieldBlock label="Phone number">
                    <Input
                      value={form.phone}
                      disabled
                      className="h-12 bg-muted/60"
                      placeholder="+91 98765 43210"
                    />
                  </FieldBlock>
                  <FieldBlock label="Gender">
                    <Input
                      value={form.sex?.charAt(0).toUpperCase() + form.sex?.slice(1)}
                      disabled
                      className="h-12 bg-muted/60"
                    />
                  </FieldBlock>

                  <div className="md:col-span-2">
                    <FieldBlock label="Bio" hint="Short profile summary visible in account surfaces.">
                      <Textarea
                        value={form.bio}
                        onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                        rows={5}
                        placeholder="Tell classmates and staff a little about you."
                        className="resize-none"
                      />
                    </FieldBlock>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleProfileSave}
                    disabled={(saving !== null && saving !== "profile") || !canSaveProfile}
                    className="h-11 w-full rounded-xl px-6 sm:w-auto font-semibold"
                  >
                    {saving === "profile" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save profile changes
                      </>
                    )}
                  </Button>
                </div>
              </SectionCard>

              <div className="space-y-6">
                <SectionCard
                  icon={<BadgeCheck className="h-5 w-5" />}
                  title="Profile preview"
                  description="Quick view of how your account details currently read."
                >
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-[1.25rem] border border-border/60 bg-background/75 p-4 sm:flex-row sm:items-start">
                      <Avatar className="h-20 w-20 rounded-[1.5rem] border border-border">
                        <AvatarImage src={form.avatar || undefined} className="object-cover" />
                        <AvatarFallback name={user?.username} className="rounded-[1.35rem] bg-primary text-xl font-bold text-primary-foreground">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-xl font-bold tracking-tight text-foreground">{displayName}</p>
                        <p className="text-sm text-muted-foreground">@{form.username || user?.username}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{roleLabel}</Badge>
                          <Badge variant="outline">{gradeLabel}</Badge>
                          <Badge variant="outline">{isPinSet ? "Wallet PIN active" : "Wallet PIN missing"}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <MetricCard label="Level" value={`Lv ${level}`} note="Current account level" />
                      <MetricCard label="Grade" value={gradeLabel} note="Assigned class level" />
                      <MetricCard label="Achievements" value={String(achievementCount)} note="Unlocked milestones" />
                      <MetricCard label="Wallet" value={formatCurrency(walletBalance)} note="Current balance" />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<Mail className="h-5 w-5" />}
                  title="Account summary"
                  description="Read-only account context helpful while updating profile details."
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
                      <Mail className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email address</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
                      <Phone className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-sm text-muted-foreground">{form.phone || "Not provided yet"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Security state</p>
                        <p className="text-sm text-muted-foreground">
                          {isPinSet ? "Wallet PIN already enabled." : "Add wallet PIN for payment safety."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Current grade</p>
                        <p className="text-sm text-muted-foreground">{gradeLabel}</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-0 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
              <SectionCard
                icon={<KeyRound className="h-5 w-5" />}
                title="Password and login access"
                description="Rotate your password regularly to keep account access protected."
              >
                <div className="mb-5 flex items-start gap-3 rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-sm leading-6">
                    Use a new password you do not reuse anywhere else. Current password stays required before saving.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FieldBlock label="Current password">
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="h-12"
                      placeholder="Enter current password"
                    />
                  </FieldBlock>

                  <FieldBlock label="New password">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="h-12"
                      placeholder="Enter new password"
                    />
                  </FieldBlock>

                  <div className="md:col-span-2">
                    <FieldBlock label="Confirm new password">
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-12"
                        placeholder="Repeat new password"
                      />
                    </FieldBlock>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={saving !== null && saving !== "password"}
                    className="h-11 w-full rounded-xl px-6 sm:w-auto"
                  >
                    {saving === "password" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Update password
                      </>
                    )}
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Security overview"
                description="Quick account checks before you leave this page."
              >
                <div className="space-y-4">
                  <div className="rounded-[1.25rem] border border-border/60 bg-background/75 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Account identity
                    </p>
                    <p className="mt-3 text-base font-semibold text-foreground">{displayName}</p>
                    <p className="text-sm text-muted-foreground">@{form.username || user?.username}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard label="Password" value="Manual update" note="Current password required" />
                    <MetricCard label="Wallet PIN" value={isPinSet ? "Enabled" : "Missing"} note="Used for wallet actions" />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {[
                      "Keep password unique.",
                      "Set wallet PIN before payments.",
                      "Review profile details after avatar change.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[1rem] border border-border/50 bg-background/60 p-3">
                        <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="mt-0 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
              <SectionCard
                icon={<Wallet className="h-5 w-5" />}
                title="Wallet security PIN"
                description="Add or rotate your 6-digit wallet PIN before approving payments."
              >
                <div className="grid gap-6">
                  {isPinSet ? (
                    <FieldBlock label="Current PIN" hint="Required before replacing wallet PIN.">
                      <PinSlots value={oldPin} onChange={setOldPin} />
                    </FieldBlock>
                  ) : (
                    <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                      No wallet PIN found yet. Create one now so transfers and paid actions stay protected.
                    </div>
                  )}

                  <div className="grid gap-6 md:grid-cols-2">
                    <FieldBlock label={isPinSet ? "New PIN" : "Create PIN"}>
                      <PinSlots value={newPin} onChange={setNewPin} tone="primary" />
                    </FieldBlock>

                    <FieldBlock label="Confirm PIN">
                      <PinSlots value={confirmPin} onChange={setConfirmPin} />
                    </FieldBlock>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handlePinUpdate}
                    disabled={(saving !== null && saving !== "pin") || !canSubmitPin}
                    className="h-11 w-full rounded-xl px-6 sm:w-auto"
                  >
                    {saving === "pin" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {isPinSet ? "Update wallet PIN" : "Create wallet PIN"}
                      </>
                    )}
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Wallet snapshot"
                description="Current wallet status tied to your account security."
              >
                <div className="space-y-4">
                  <div className="rounded-[1.25rem] bg-primary/10 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                      Available balance
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                      {formatCurrency(walletBalance)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard label="PIN status" value={isPinSet ? "Active" : "Not set"} note="Needed for wallet actions" />
                    <MetricCard label="Protection" value={isPinSet ? "Ready" : "Incomplete"} note="Add PIN for stronger control" />
                  </div>

                  <div className="rounded-[1.1rem] border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-medium text-foreground">Security note</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Wallet PIN protects transfers, checkout actions, and other payment approvals inside account flows.
                    </p>
                  </div>
                </div>
              </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardContent>
  );
}
