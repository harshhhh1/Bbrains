"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { dashboardApi, getBaseUrl, userApi, walletApi } from "@/services/api/client";
import {
  getGradeLabel,
  getRoleLabel,
  profileCompletion,
  readUserField,
} from "../lib/settings";
import type { ProfileFormState, SavingState, SettingsUser } from "../types/settings";

const INITIAL_FORM: ProfileFormState = {
  username: "",
  firstName: "",
  lastName: "",
  bio: "",
  phone: "",
  sex: "other",
  avatar: "",
};

export function useSettingsPage() {
  const router = useRouter();
  const { uploadFile } = useCloudinaryUpload();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SavingState>(null);
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isPinSet, setIsPinSet] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(INITIAL_FORM);
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

      const [userRes, walletRes] = await Promise.all([dashboardApi.getUser(), walletApi.getWallet()]);

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
    void loadData();
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

    const timeoutId = window.setTimeout(() => {
      void checkUsername();
    }, 500);

    return () => window.clearTimeout(timeoutId);
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
  const canSubmitPin =
    /^\d{6}$/.test(newPin) && /^\d{6}$/.test(confirmPin) && (!isPinSet || /^\d{6}$/.test(oldPin));
  const canSaveProfile = !usernameError && !isCheckingUsername;

  const handleProfileSave = useCallback(async () => {
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
  }, [form, loadData, router, user]);

  const handleAvatarUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
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
    },
    [loadData, router, uploadFile]
  );

  const handlePasswordUpdate = useCallback(async () => {
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
  }, [confirmPassword, currentPassword, newPassword]);

  const handlePinUpdate = useCallback(async () => {
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
      const response = isPinSet ? await walletApi.changePin(oldPin, newPin) : await walletApi.setupPin(newPin);

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
  }, [confirmPin, isPinSet, newPin, oldPin]);

  return {
    loading,
    saving,
    user,
    walletBalance,
    isPinSet,
    form,
    currentPassword,
    newPassword,
    confirmPassword,
    oldPin,
    newPin,
    confirmPin,
    usernameError,
    isCheckingUsername,
    displayName,
    roleLabel,
    completion,
    achievementCount,
    level,
    gradeLabel,
    canSubmitPin,
    canSaveProfile,
    setForm,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setOldPin,
    setNewPin,
    setConfirmPin,
    handleProfileSave,
    handleAvatarUpload,
    handlePasswordUpdate,
    handlePinUpdate,
  };
}
